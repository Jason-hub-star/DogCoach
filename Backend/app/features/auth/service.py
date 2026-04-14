"""
사용자 인증 및 프로필 관리를 담당하는 서비스 레이어입니다.
Supabase Auth 연동, 프로필 조회, 게스트 데이터 마이그레이션 및 계정 삭제 기능을 수행합니다.
"""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.auth import repository, schemas
from app.core.exceptions import NotFoundException, BadRequestException
from app.shared.models import User


async def get_my_profile(db: AsyncSession, user_id: str) -> schemas.UserResponse:
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    user = await repository.get_user_by_id(db, uuid_obj)

    if not user:
        # If user exists in Auth but not in public.users, they might need onboarding
        raise NotFoundException("User profile not found. Please complete onboarding.")

    # Populate provider and kakao_sync_id from Supabase Auth
    from app.core.security import supabase
    try:
        auth_user = supabase.auth.admin.get_user_by_id(str(uuid_obj))
        if auth_user and auth_user.user:
            identities = auth_user.user.identities or []

            # First-time login: populate provider
            if identities and not user.provider:
                user.provider = identities[0].get('provider')  # 'kakao' or 'google'

                # For Kakao: store kakao_sync_id
                if user.provider == 'kakao' and not user.kakao_sync_id:
                    identity_data = identities[0].get('identity_data', {})
                    kakao_id = identity_data.get('sub') or identity_data.get('provider_id')
                    if kakao_id:
                        user.kakao_sync_id = str(kakao_id)

                await db.commit()
                await db.refresh(user)
    except Exception as e:
        # Best-effort: don't fail if provider population fails
        print(f"Warning: Could not populate provider/kakao_sync_id: {e}")

    response = schemas.UserResponse.model_validate(user)

    # Fetch latest dog
    latest_dog = await repository.get_latest_dog_by_user(db, uuid_obj)
    if latest_dog:
        response.latest_dog_id = latest_dog.id
        response.latest_dog_name = latest_dog.name

    return response


async def migrate_guest_data(
    db: AsyncSession, user_id: str, anonymous_sid: str
) -> schemas.MigrateGuestResponse:
    """
    Transfer guest dog data to an authenticated user.
    Idempotent: calling multiple times returns migrated_count=0 on subsequent calls.
    """
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    # JIT user creation (same pattern as onboarding/repository.py)
    user = await repository.get_user_by_id(db, user_uuid)
    if not user:
        # Avoid hardcoded enum literal; rely on DB/model default for compatibility
        # with environments where USER enum variant may not exist.
        user = User(id=user_uuid)
        db.add(user)
        await db.flush()

    # Find guest dogs
    guest_dogs = await repository.find_guest_dogs(db, anonymous_sid)
    if not guest_dogs:
        return schemas.MigrateGuestResponse(migrated_count=0, dog_ids=[])

    # Transfer ownership
    dog_ids = [dog.id for dog in guest_dogs]
    count = await repository.claim_dogs_for_user(db, dog_ids, user_uuid)

    return schemas.MigrateGuestResponse(
        migrated_count=count,
        dog_ids=[str(did) for did in dog_ids]
    )



async def delete_user_account(db: AsyncSession, user_id: str) -> None:
    """
    Permanently delete user and all related data via CASCADE.
    """
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise BadRequestException("Invalid User ID format")

    user = await repository.get_user_by_id(db, uuid_obj)

    if not user:
        raise NotFoundException("User not found")

    await db.delete(user)
    await db.commit()

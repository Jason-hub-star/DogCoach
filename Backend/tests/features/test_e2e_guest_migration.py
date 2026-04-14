"""
E2E Test: Guest -> Login -> Migrate-Guest Flow

Scenario:
1. Guest user creates a dog (anonymous_sid cookie)
2. User authenticates via OAuth (simulated)
3. User calls /auth/migrate-guest
4. Verify dog ownership transferred
"""

import pytest
from uuid import uuid4
from unittest.mock import patch, AsyncMock, Mock
from app.features.auth import service as auth_service
from app.shared.models import User, Dog, UserRole, UserStatus, DogSex


@pytest.mark.asyncio
async def test_e2e_guest_to_user_migration(mock_db):
    """
    E2E: Guest creates dog -> Authenticates -> Migrates data
    """
    # --- Step 1: Guest creates a dog ---
    anonymous_sid = "guest_session_123"
    guest_dog_name = "TestDog"
    guest_dog_id = uuid4()

    mock_guest_dog = Dog(
        id=guest_dog_id,
        user_id=None,  # Guest has no user_id
        anonymous_sid=anonymous_sid,
        name=guest_dog_name,
        breed="Labrador",
        sex=DogSex.MALE
    )

    # Mock: Dog repository creates guest dog
    with patch("app.features.auth.repository.find_guest_dogs", return_value=[mock_guest_dog]) as mock_find_guest:

        # --- Step 2: User authenticates (OAuth callback) ---
        authenticated_user_id = uuid4()
        mock_user = User(
            id=authenticated_user_id,
            role=UserRole.USER,
            status=UserStatus.ACTIVE,
            timezone="Asia/Seoul"
        )

        # Mock: User exists after OAuth
        with patch("app.features.auth.repository.get_user_by_id", return_value=mock_user):
            with patch("app.features.auth.repository.claim_dogs_for_user", return_value=1) as mock_claim:

                # --- Step 3: Call migrate-guest endpoint ---
                result = await auth_service.migrate_guest_data(
                    mock_db,
                    str(authenticated_user_id),
                    anonymous_sid
                )

                # --- Step 4: Verify migration ---
                assert result.migrated_count == 1
                assert len(result.dog_ids) == 1
                assert result.dog_ids[0] == str(guest_dog_id)

                # Verify repository calls
                mock_find_guest.assert_called_once_with(mock_db, anonymous_sid)
                mock_claim.assert_called_once_with(
                    mock_db,
                    [guest_dog_id],
                    authenticated_user_id
                )


@pytest.mark.asyncio
async def test_e2e_guest_no_data_migration(mock_db):
    """
    E2E: User with no guest data calls migrate-guest -> migrated_count=0
    """
    authenticated_user_id = uuid4()
    anonymous_sid = "empty_session"

    mock_user = User(
        id=authenticated_user_id,
        role=UserRole.USER,
        status=UserStatus.ACTIVE
    )

    # Mock: No guest dogs found
    with patch("app.features.auth.repository.get_user_by_id", return_value=mock_user):
        with patch("app.features.auth.repository.find_guest_dogs", return_value=[]):

            result = await auth_service.migrate_guest_data(
                mock_db,
                str(authenticated_user_id),
                anonymous_sid
            )

            assert result.migrated_count == 0
            assert result.dog_ids == []


@pytest.mark.asyncio
async def test_e2e_idempotent_migration(mock_db):
    """
    E2E: Calling migrate-guest twice should be idempotent
    Second call returns migrated_count=0
    """
    authenticated_user_id = uuid4()
    anonymous_sid = "idempotent_session"

    mock_user = User(
        id=authenticated_user_id,
        role=UserRole.USER,
        status=UserStatus.ACTIVE
    )

    # First call: 1 dog migrated
    guest_dog_id = uuid4()
    mock_guest_dog = Dog(
        id=guest_dog_id,
        anonymous_sid=anonymous_sid,
        name="IdempotentDog",
        breed="Poodle",
        sex=DogSex.FEMALE
    )

    with patch("app.features.auth.repository.get_user_by_id", return_value=mock_user):
        # First call
        with patch("app.features.auth.repository.find_guest_dogs", return_value=[mock_guest_dog]):
            with patch("app.features.auth.repository.claim_dogs_for_user", return_value=1):
                result1 = await auth_service.migrate_guest_data(
                    mock_db,
                    str(authenticated_user_id),
                    anonymous_sid
                )
                assert result1.migrated_count == 1

        # Second call: No guest dogs left (already migrated)
        with patch("app.features.auth.repository.find_guest_dogs", return_value=[]):
            result2 = await auth_service.migrate_guest_data(
                mock_db,
                str(authenticated_user_id),
                anonymous_sid
            )
            assert result2.migrated_count == 0
            assert result2.dog_ids == []


@pytest.mark.asyncio
async def test_e2e_jit_user_creation(mock_db):
    """
    E2E: User doesn't exist yet (first login) -> JIT creation + migration
    """
    new_user_id = uuid4()
    anonymous_sid = "jit_session"

    guest_dog_id = uuid4()
    mock_guest_dog = Dog(
        id=guest_dog_id,
        anonymous_sid=anonymous_sid,
        name="JITDog",
        breed="Bulldog"
    )

    # Mock: User doesn't exist yet
    with patch("app.features.auth.repository.get_user_by_id", return_value=None):
        with patch("app.features.auth.repository.find_guest_dogs", return_value=[mock_guest_dog]):
            with patch("app.features.auth.repository.claim_dogs_for_user", return_value=1):
                # Mock db.add and db.flush (JIT user creation)
                mock_db.add = Mock()
                mock_db.flush = AsyncMock()

                result = await auth_service.migrate_guest_data(
                    mock_db,
                    str(new_user_id),
                    anonymous_sid
                )

                # Verify JIT user creation
                mock_db.add.assert_called_once()
                mock_db.flush.assert_called_once()

                # Verify migration succeeded
                assert result.migrated_count == 1
                assert len(result.dog_ids) == 1

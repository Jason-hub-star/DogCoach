from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.shared.models import UserRole, UserStatus

class UserBase(BaseModel):
    email: Optional[str] = None # Supabase auth handles email, but we might want to return it if we store it or get it from token
    phone_number: Optional[str] = None
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.ACTIVE
    timezone: str = "Asia/Seoul"

class UserCreate(UserBase):
    id: UUID
    kakao_sync_id: Optional[str] = None

class UserUpdate(BaseModel):
    phone_number: Optional[str] = None
    timezone: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    latest_dog_id: Optional[UUID] = None
    latest_dog_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MigrateGuestResponse(BaseModel):
    migrated_count: int
    dog_ids: list[str] = []

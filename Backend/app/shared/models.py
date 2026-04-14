"""
애플리케이션의 핵심 데이터베이스 스키마 및 SQLAlchemy 모델 정의입니다.
사용자, 구독, 강아지, 행동 로그, 코칭 결과 및 AI 비용 추적 테이블을 포함합니다.
"""
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    ForeignKey,
    DateTime,
    Text,
    Date,
    Numeric,
    JSON,
    Enum,
    func,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from uuid import uuid4

Base = declarative_base()

# --- Enums (Type Definitions) ---
class UserRole(str, PyEnum):
    USER = "user"
    TRAINER = "trainer"
    ORG_OWNER = "org_owner"
    ORG_STAFF = "org_staff"

class UserStatus(str, PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"

class PlanType(str, PyEnum):
    FREE = "FREE"
    PRO_MONTHLY = "PRO_MONTHLY"
    PRO_YEARLY = "PRO_YEARLY"

class DogSex(str, PyEnum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    MALE_NEUTERED = "MALE_NEUTERED"
    FEMALE_NEUTERED = "FEMALE_NEUTERED"

class AssetType(str, PyEnum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"
    LOTTIE_SNAPSHOT = "LOTTIE_SNAPSHOT"

class ReportType(str, PyEnum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    INSIGHT = "INSIGHT"

class NotiChannel(str, PyEnum):
    ALIMTALK = "ALIMTALK"
    WEB_PUSH = "WEB_PUSH"
    EMAIL = "EMAIL"

class TrainingStatus(str, PyEnum):
    COMPLETED = "COMPLETED"
    SKIPPED_INEFFECTIVE = "SKIPPED_INEFFECTIVE"
    SKIPPED_ALREADY_DONE = "SKIPPED_ALREADY_DONE"
    HIDDEN_BY_AI = "HIDDEN_BY_AI"


# --- Models ---

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    kakao_sync_id = Column(String(255), unique=True, index=True)
    role = Column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=UserRole.USER,
    )
    phone_number = Column(String(255))
    status = Column(
        Enum(
            UserStatus,
            name="user_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=UserStatus.ACTIVE,
    )
    timezone = Column(String(50), default="Asia/Seoul")
    
    # Rule 4.1: Use TIMESTAMPTZ (DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True))
    provider = Column(String)

    # Relationships
    dogs = relationship("Dog", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Rule 4.2: Index Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan_type = Column(Enum(PlanType, name="plan_type"), default=PlanType.FREE)
    next_billing_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    pg_provider = Column(String)
    pg_customer_key = Column(String)
    canceled_at = Column(DateTime(timezone=True))
    cancel_reason = Column(Text)

    user = relationship("User", back_populates="subscription")


class Dog(Base):
    __tablename__ = "dogs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name = Column(String(255), nullable=False)
    breed = Column(String(255))
    birth_date = Column(Date)
    sex = Column(Enum(DogSex, name="dog_sex"))
    profile_image_url = Column(Text)
    anonymous_sid = Column(String(255), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_dogs_user_created_desc', 'user_id', created_at.desc()),
        Index('idx_dogs_anonymous_sid_created_desc', 'anonymous_sid', created_at.desc()),
    )

    user = relationship("User", back_populates="dogs")
    env = relationship("DogEnv", back_populates="dog", uselist=False, cascade="all, delete-orphan")
    logs = relationship("BehaviorLog", back_populates="dog", cascade="all, delete-orphan")
    coaching_reports = relationship("AICoaching", back_populates="dog", cascade="all, delete-orphan")


class DogEnv(Base):
    __tablename__ = "dog_env"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    dog_id = Column(UUID(as_uuid=True), ForeignKey("dogs.id", ondelete="CASCADE"), unique=True, index=True)
    
    # Rule 4.1: Use JSONB for JSON fields
    household_info = Column(JSONB)
    health_meta = Column(JSONB)
    profile_meta = Column(JSONB)
    rewards_meta = Column(JSONB)
    chronic_issues = Column(JSONB)
    antecedents = Column(JSONB)
    triggers = Column(JSONB)
    past_attempts = Column(JSONB)
    temperament = Column(JSONB)
    activity_meta = Column(JSONB)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    dog = relationship("Dog", back_populates="env")


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    dog_id = Column(UUID(as_uuid=True), ForeignKey("dogs.id", ondelete="CASCADE"), index=True)
    is_quick_log = Column(Boolean, default=False)
    type_id = Column(Integer)
    antecedent = Column(Text)
    behavior = Column(Text)
    consequence = Column(Text)
    intensity = Column(Integer)
    duration = Column(Integer)
    occurred_at = Column(DateTime(timezone=True), default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    dog = relationship("Dog", back_populates="logs")
    media = relationship("MediaAsset", back_populates="log", cascade="all, delete-orphan")

    # Index for filtering logs by dog and date range (Rule 1.3: Composite Index)
    __table_args__ = (
        Index('idx_logs_dog_occurred', 'dog_id', 'occurred_at'),
    )


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    log_id = Column(UUID(as_uuid=True), ForeignKey("behavior_logs.id", ondelete="SET NULL"), index=True)
    storage_url = Column(Text, nullable=False)
    asset_type = Column(Enum(AssetType, name="asset_type"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    log = relationship("BehaviorLog", back_populates="media")


class AICoaching(Base):
    __tablename__ = "ai_coaching"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    dog_id = Column(UUID(as_uuid=True), ForeignKey("dogs.id", ondelete="CASCADE"), index=True)
    report_type = Column(Enum(ReportType, name="report_type"), nullable=False)
    analysis_json = Column(JSONB)
    action_items = Column(JSONB)
    feedback_score = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dog = relationship("Dog", back_populates="coaching_reports")
    action_tracker = relationship("ActionTracker", back_populates="coaching", cascade="all, delete-orphan")


class ActionTracker(Base):
    __tablename__ = "action_tracker"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    coaching_id = Column(UUID(as_uuid=True), ForeignKey("ai_coaching.id", ondelete="CASCADE"), index=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    coaching = relationship("AICoaching", back_populates="action_tracker")


class NotiHistory(Base):
    __tablename__ = "noti_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    channel = Column(Enum(NotiChannel, name="noti_channel"), nullable=False)
    template_code = Column(String(100))
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))


class LogSummary(Base):
    __tablename__ = "log_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    dog_id = Column(UUID(as_uuid=True), ForeignKey("dogs.id", ondelete="CASCADE"), index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    summary_text = Column(Text, nullable=False)
    # embedding = Column(Vector(1536)) # Requires pgvector extension, commented out for now
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    notification_pref = Column(JSONB)
    ai_persona = Column(JSONB)
    marketing_agreed = Column(Boolean, default=False)
    marketing_agreed_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="settings")


class UserTrainingStatus(Base):
    __tablename__ = "user_training_status"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    curriculum_id = Column(String(50), nullable=False)
    stage_id = Column(String(50), nullable=False)
    step_number = Column(Integer, nullable=False)
    status = Column(Enum(TrainingStatus, name="training_status"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


# --- Phase 7: AI Recommendation System ---

class AIRecommendationSnapshot(Base):
    __tablename__ = "ai_recommendation_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    dog_id = Column(UUID(as_uuid=True), ForeignKey("dogs.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    anonymous_sid = Column(String(255), nullable=True)
    window_days = Column(Integer, nullable=False)  # 7, 15, or 30
    dedupe_key = Column(String(64), nullable=False, unique=True)  # sha256 hex
    prompt_version = Column(String(20), nullable=False, default="PROMPT_V1")
    model = Column(String(50), nullable=False, default="gpt-4o-mini")
    summary_hash = Column(String(64), nullable=False)
    issue = Column(String(100), nullable=False)

    # Output
    recommendations = Column(JSONB, nullable=False)
    rationale = Column(Text, nullable=False)
    period_comparison = Column(Text, nullable=True)
    source = Column(String(20), nullable=False, default="ai")  # "ai" or "rule"

    # Cost tracking
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost_usd = Column(Numeric(10, 6), default=0)
    latency_ms = Column(Integer, default=0)

    # TTL
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_rec_dog_window_created', 'dog_id', 'window_days', created_at.desc()),
        Index('idx_rec_user_created', 'user_id', 'created_at'),
        Index('idx_rec_expires', 'expires_at'),
    )


class AIRecommendationFeedback(Base):
    __tablename__ = "ai_recommendation_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    snapshot_id = Column(UUID(as_uuid=True), ForeignKey("ai_recommendation_snapshots.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    anonymous_sid = Column(String(255), nullable=True)
    recommendation_index = Column(Integer, nullable=False)  # 0, 1, 2
    action = Column(String(50), nullable=False)  # "archive", "helpful", "not_helpful"
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AICostUsageDaily(Base):
    __tablename__ = "ai_cost_usage_daily"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usage_date = Column(Date, nullable=False, unique=True)
    total_calls = Column(Integer, default=0)
    total_input_tokens = Column(Integer, default=0)
    total_output_tokens = Column(Integer, default=0)
    total_cost_usd = Column(Numeric(10, 6), default=0)
    rule_fallback_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TrainingBehaviorSnapshot(Base):
    __tablename__ = "training_behavior_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    dog_id = Column(UUID(as_uuid=True), ForeignKey("dogs.id", ondelete="CASCADE"), nullable=False)
    curriculum_id = Column(String(50), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    total_logs = Column(Integer, default=0)
    avg_intensity = Column(Numeric(4, 2), default=0)
    log_frequency_per_week = Column(Numeric(4, 2), default=0)
    trigger_distribution = Column(JSONB, default={})
    hourly_distribution = Column(JSONB, default={})
    weekly_distribution = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_behavior_snapshot_user_dog_curriculum', 'user_id', 'dog_id', 'curriculum_id'),
        Index('idx_behavior_snapshot_created_at', 'created_at'),
        Index(
            'idx_behavior_snapshot_user_dog_curriculum_snapshot_date',
            'user_id',
            'dog_id',
            'curriculum_id',
            snapshot_date.desc(),
        ),
    )


class AICostUsageMonthly(Base):
    __tablename__ = "ai_cost_usage_monthly"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usage_month = Column(Date, nullable=False, unique=True)  # First day of month
    total_calls = Column(Integer, default=0)
    total_cost_usd = Column(Numeric(10, 6), default=0)
    budget_limit_usd = Column(Numeric(10, 2), default=30)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

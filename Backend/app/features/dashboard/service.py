from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.features.dashboard import schemas
from datetime import timedelta
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from uuid import UUID

from app.shared.models import Dog, BehaviorLog, DogEnv
from app.shared.utils.timezone import get_today_with_timezone

def _as_string_list(value) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item) for item in value if isinstance(item, (str, int, float))]


def _as_object(value):
    return value if isinstance(value, dict) else None


async def get_dashboard_data(db: AsyncSession, dog_id: UUID, timezone_str: str = "Asia/Seoul") -> schemas.DashboardResponse:
    # 1. Fetch Dog + Env in one query
    dog_context_query = (
        select(Dog, DogEnv)
        .outerjoin(DogEnv, DogEnv.dog_id == Dog.id)
        .where(Dog.id == dog_id)
        .limit(1)
    )
    dog_context_result = await db.execute(dog_context_query)
    dog_context = dog_context_result.first()

    if not dog_context:
        raise HTTPException(status_code=404, detail="Dog not found")

    dog, dog_env = dog_context

    # Calculate Age (using user's timezone for accurate date)
    age_months = 0
    if dog.birth_date:
        today = get_today_with_timezone(timezone_str)
        delta = today - dog.birth_date
        age_months = int(delta.days / 30)

    dog_profile = schemas.DashboardDogProfile(
        id=dog.id,
        name=dog.name,
        breed=dog.breed,
        age_months=age_months,
        profile_image_url=dog.profile_image_url
    )

    # 1.5 Parse Env for Issues
    issues = []
    env_triggers = []
    env_consequences = []
    
    if dog_env:
        if dog_env.chronic_issues:
            # Handle new structure: {"top_issues": [...], "other_text": "..."}
            issues_data = dog_env.chronic_issues
            if isinstance(issues_data, dict):
                top_issues = _as_string_list(issues_data.get("top_issues", []))
                other = issues_data.get("other_text")
                if other and "etc" in top_issues:
                    issues = [i if i != "etc" else str(other) for i in top_issues]
                else:
                    issues = top_issues
            else:
                issues = _as_string_list(issues_data)  # Legacy: plain list
        
        if dog_env.triggers:
            # Handle new structure: {"ids": [...], "other_text": "..."}
            triggers_data = dog_env.triggers
            if isinstance(triggers_data, dict):
                ids = _as_string_list(triggers_data.get("ids", []))
                other = triggers_data.get("other_text")
                if other and "etc" in ids:
                    env_triggers = [i if i != "etc" else str(other) for i in ids]
                else:
                    env_triggers = ids
            else:
                env_triggers = _as_string_list(triggers_data)
            
        if dog_env.past_attempts:
            # Handle new structure: {"ids": [...], "other_text": "..."}
            attempts_data = dog_env.past_attempts
            if isinstance(attempts_data, dict):
                ids = _as_string_list(attempts_data.get("ids", []))
                other = attempts_data.get("other_text")
                if other and "etc" in ids:
                    env_consequences = [i if i != "etc" else str(other) for i in ids]
                else:
                    env_consequences = ids
            else:
                env_consequences = _as_string_list(attempts_data)

    # Extract optional metadata from dog_env for completeness check
    env_info = _as_object(dog_env.household_info) if dog_env else None
    health_meta = _as_object(dog_env.health_meta) if dog_env else None
    rewards_meta = _as_object(dog_env.rewards_meta) if dog_env else None
    past_attempts_meta = _as_object(dog_env.past_attempts) if dog_env else None
    temperament_meta = _as_object(dog_env.temperament) if dog_env else None
    profile_meta = _as_object(dog_env.profile_meta) if dog_env else None

    # 2. Fetch Stats (Total Logs + Last Logged At in one query)
    stats_query = select(
        func.count(BehaviorLog.id),
        func.max(BehaviorLog.occurred_at),
    ).where(BehaviorLog.dog_id == dog_id)
    total_logs, last_logged_at = (await db.execute(stats_query)).one()
    total_logs = int(total_logs or 0)

    # Fetch recent logs once, and reuse for streak + recent_logs payload
    recent_logs_query = (
        select(BehaviorLog)
        .where(BehaviorLog.dog_id == dog_id)
        .order_by(desc(BehaviorLog.occurred_at))
        .limit(500)
    )
    recent_logs_result = await db.execute(recent_logs_query)
    recent_logs_all = recent_logs_result.scalars().all()

    # Streak Calculation (consecutive days with at least one log)
    current_streak = 0
    if last_logged_at:
        user_today = get_today_with_timezone(timezone_str)
        tz = ZoneInfo(timezone_str)
        raw_dates = [log.occurred_at for log in recent_logs_all if log.occurred_at]

        # Convert to user-local dates and deduplicate
        log_dates = sorted(
            {dt.astimezone(tz).date() for dt in raw_dates},
            reverse=True,
        )

        # Count consecutive days from today (or yesterday if no log today)
        if log_dates:
            expected = user_today
            # Allow starting from yesterday if no log today yet
            if log_dates[0] == user_today - timedelta(days=1):
                expected = user_today - timedelta(days=1)
            for d in log_dates:
                if d == expected:
                    current_streak += 1
                    expected -= timedelta(days=1)
                elif d < expected:
                    break

    stats = schemas.QuickLogStats(
        total_logs=total_logs,
        current_streak=current_streak,
        last_logged_at=last_logged_at
    )

    # 3. Build Recent Logs (reuse already-fetched rows)
    recent_logs = [schemas.RecentLogItem.model_validate(log) for log in recent_logs_all[:5]]

    return schemas.DashboardResponse(
        dog_profile=dog_profile,
        stats=stats,
        recent_logs=recent_logs,
        issues=issues,
        env_triggers=env_triggers,
        env_consequences=env_consequences,
        env_info=env_info,
        health_meta=health_meta,
        rewards_meta=rewards_meta,
        past_attempts=past_attempts_meta,
        temperament=temperament_meta,
        profile_meta=profile_meta
    )

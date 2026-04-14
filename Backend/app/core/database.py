from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

DEFAULT_COMMAND_TIMEOUT_SEC = 30
DEFAULT_STATEMENT_TIMEOUT_MS = 30_000
DEFAULT_LOCK_TIMEOUT_MS = 5_000
DEFAULT_IDLE_IN_TRANSACTION_TIMEOUT_MS = 60_000
DEFAULT_POOL_TIMEOUT_SEC = 30
DEFAULT_POOL_RECYCLE_SEC = 1_800
DEFAULT_POOL_SIZE = 10
DEFAULT_MAX_OVERFLOW = 5


def _is_supabase_pooler(database_url: str) -> bool:
    """Detect Supabase PgBouncer pooler URLs.

    Supabase uses 6543 for the transaction pooler. We keep the check
    lenient so older project URLs still work if the host changes slightly.
    """

    try:
        parsed = make_url(database_url)
    except Exception:
        return False

    host = (parsed.host or "").lower()
    port = parsed.port

    return host.endswith("pooler.supabase.com") or (
        port == 6543 and host.endswith(".supabase.com")
    )


def _build_connect_args(pooler_mode: bool) -> dict[str, object]:
    connect_args: dict[str, object] = {
        "timeout": DEFAULT_COMMAND_TIMEOUT_SEC,
        "server_settings": {
            "application_name": "dogcoach-api",
            "statement_timeout": str(DEFAULT_STATEMENT_TIMEOUT_MS),
            "lock_timeout": str(DEFAULT_LOCK_TIMEOUT_MS),
            "idle_in_transaction_session_timeout": str(
                DEFAULT_IDLE_IN_TRANSACTION_TIMEOUT_MS
            ),
        },
    }

    if pooler_mode:
        # Transaction poolers and asyncpg statement caches do not mix well.
        connect_args["statement_cache_size"] = 0

    return connect_args


def _build_engine_kwargs(database_url: str) -> dict[str, object]:
    pooler_mode = _is_supabase_pooler(database_url)

    engine_kwargs: dict[str, object] = {
        "echo": False,
        "future": True,
        "pool_pre_ping": True,
        "pool_reset_on_return": "rollback",
        "connect_args": _build_connect_args(pooler_mode),
    }

    if pooler_mode:
        engine_kwargs["poolclass"] = NullPool
    else:
        engine_kwargs.update(
            {
                "pool_size": DEFAULT_POOL_SIZE,
                "max_overflow": DEFAULT_MAX_OVERFLOW,
                "pool_timeout": DEFAULT_POOL_TIMEOUT_SEC,
                "pool_recycle": DEFAULT_POOL_RECYCLE_SEC,
                "pool_use_lifo": True,
            }
        )

    return engine_kwargs

engine = create_async_engine(
    settings.DATABASE_URL,
    **_build_engine_kwargs(settings.DATABASE_URL),
)

# Call this sessionmaker to get a session
# Rule: Use async session
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db():
    async with SessionLocal() as session:
        yield session

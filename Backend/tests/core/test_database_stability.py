import importlib
import os
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.pool import NullPool


def _reload_database_module(monkeypatch, database_url: str, create_engine_impl=None):
    import app.core.config as config

    monkeypatch.setattr(config.settings, "DATABASE_URL", database_url, raising=False)

    if create_engine_impl is not None:
        import sqlalchemy.ext.asyncio as sa_asyncio

        monkeypatch.setattr(
            sa_asyncio,
            "create_async_engine",
            create_engine_impl,
        )

    module = importlib.import_module("app.core.database")
    return importlib.reload(module)


def test_get_db_closes_session_on_normal_exit(monkeypatch):
    os.environ["ANONYMOUS_COOKIE_SECURE"] = "false"
    os.environ["ANONYMOUS_COOKIE_SAMESITE"] = "lax"

    database = _reload_database_module(
        monkeypatch,
        "postgresql+asyncpg://user:pass@host:5432/db",
    )

    class FakeSession:
        def __init__(self):
            self.close = AsyncMock()

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            await self.close()
            return False

    fake_session = FakeSession()
    monkeypatch.setattr(database, "SessionLocal", lambda: fake_session)

    async def run():
        agen = database.get_db()
        session = await agen.__anext__()
        assert session is fake_session
        await agen.aclose()

    import asyncio

    asyncio.run(run())

    assert fake_session.close.await_count == 1


def test_get_db_closes_session_when_consumer_errors(monkeypatch):
    os.environ["ANONYMOUS_COOKIE_SECURE"] = "false"
    os.environ["ANONYMOUS_COOKIE_SAMESITE"] = "lax"

    database = _reload_database_module(
        monkeypatch,
        "postgresql+asyncpg://user:pass@host:5432/db",
    )

    class FakeSession:
        def __init__(self):
            self.close = AsyncMock()

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            await self.close()
            return False

    fake_session = FakeSession()
    monkeypatch.setattr(database, "SessionLocal", lambda: fake_session)

    async def run():
        agen = database.get_db()
        await agen.__anext__()
        with pytest.raises(RuntimeError):
            await agen.athrow(RuntimeError("boom"))

    import asyncio

    asyncio.run(run())

    assert fake_session.close.await_count == 1


def test_pooler_url_builds_nullpool_engine_kwargs(monkeypatch):
    os.environ["ANONYMOUS_COOKIE_SECURE"] = "false"
    os.environ["ANONYMOUS_COOKIE_SAMESITE"] = "lax"

    captured = {}

    def fake_create_async_engine(url, **kwargs):
        captured["url"] = url
        captured["kwargs"] = kwargs
        return SimpleNamespace(sync_engine=SimpleNamespace(pool="dummy"))

    database = _reload_database_module(
        monkeypatch,
        "postgresql+asyncpg://user:pass@pooler.supabase.com:6543/db",
        create_engine_impl=fake_create_async_engine,
    )

    assert captured["url"] == "postgresql+asyncpg://user:pass@pooler.supabase.com:6543/db"
    assert captured["kwargs"]["poolclass"] is NullPool
    assert captured["kwargs"]["pool_pre_ping"] is True
    assert captured["kwargs"]["pool_reset_on_return"] == "rollback"
    assert captured["kwargs"]["connect_args"]["timeout"] == database.DEFAULT_COMMAND_TIMEOUT_SEC
    assert captured["kwargs"]["connect_args"]["statement_cache_size"] == 0
    assert captured["kwargs"]["connect_args"]["server_settings"] == {
        "application_name": "dogcoach-api",
        "statement_timeout": str(database.DEFAULT_STATEMENT_TIMEOUT_MS),
        "lock_timeout": str(database.DEFAULT_LOCK_TIMEOUT_MS),
        "idle_in_transaction_session_timeout": str(
            database.DEFAULT_IDLE_IN_TRANSACTION_TIMEOUT_MS
        ),
    }


def test_non_pooler_url_uses_queue_pool_tuning(monkeypatch):
    os.environ["ANONYMOUS_COOKIE_SECURE"] = "false"
    os.environ["ANONYMOUS_COOKIE_SAMESITE"] = "lax"

    captured = {}

    def fake_create_async_engine(url, **kwargs):
        captured["url"] = url
        captured["kwargs"] = kwargs
        return SimpleNamespace(sync_engine=SimpleNamespace(pool="dummy"))

    database = _reload_database_module(
        monkeypatch,
        "postgresql+asyncpg://user:pass@db.example.com:5432/db",
        create_engine_impl=fake_create_async_engine,
    )

    kwargs = captured["kwargs"]
    assert captured["url"] == "postgresql+asyncpg://user:pass@db.example.com:5432/db"
    assert "poolclass" not in kwargs
    assert kwargs["pool_pre_ping"] is True
    assert kwargs["pool_reset_on_return"] == "rollback"
    assert kwargs["pool_size"] == database.DEFAULT_POOL_SIZE
    assert kwargs["max_overflow"] == database.DEFAULT_MAX_OVERFLOW
    assert kwargs["pool_timeout"] == database.DEFAULT_POOL_TIMEOUT_SEC
    assert kwargs["pool_recycle"] == database.DEFAULT_POOL_RECYCLE_SEC
    assert kwargs["pool_use_lifo"] is True
    assert kwargs["connect_args"]["timeout"] == database.DEFAULT_COMMAND_TIMEOUT_SEC
    assert "statement_cache_size" not in kwargs["connect_args"]
    assert kwargs["connect_args"]["server_settings"]["application_name"] == "dogcoach-api"

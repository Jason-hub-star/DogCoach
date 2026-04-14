from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.features.auth import repository as auth_repository
from app.features.log import repository as log_repository
from app.shared.models import BehaviorLog


@pytest.mark.asyncio
async def test_create_log_adds_commits_and_refreshes(mock_db):
    log_data = {
        "dog_id": uuid4(),
        "antecedent": "doorbell",
        "behavior": "barking",
        "consequence": "ignored",
        "intensity": 4,
        "is_quick_log": False,
    }

    result = await log_repository.create_log(mock_db, log_data)

    assert isinstance(result, BehaviorLog)
    mock_db.add.assert_called_once_with(result)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(result)


@pytest.mark.asyncio
async def test_update_log_commits_then_refetches(mock_db, monkeypatch):
    log_id = uuid4()
    refreshed_log = SimpleNamespace(id=log_id, behavior="barking")

    monkeypatch.setattr(
        log_repository,
        "get_log_by_id",
        AsyncMock(return_value=refreshed_log),
    )

    result = await log_repository.update_log(
        mock_db,
        log_id,
        {"behavior": "barking", "intensity": 7},
    )

    assert result is refreshed_log
    mock_db.execute.assert_awaited_once()
    mock_db.commit.assert_awaited_once()
    log_repository.get_log_by_id.assert_awaited_once_with(mock_db, log_id)


@pytest.mark.asyncio
async def test_claim_dogs_for_user_short_circuits_on_empty_list(mock_db):
    result = await auth_repository.claim_dogs_for_user(
        mock_db,
        [],
        uuid4(),
    )

    assert result == 0
    mock_db.execute.assert_not_called()
    mock_db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_claim_dogs_for_user_commits_on_update(mock_db):
    db_result = SimpleNamespace(rowcount=2)
    mock_db.execute = AsyncMock(return_value=db_result)

    result = await auth_repository.claim_dogs_for_user(
        mock_db,
        [uuid4(), uuid4()],
        uuid4(),
    )

    assert result == 2
    mock_db.execute.assert_awaited_once()
    mock_db.commit.assert_awaited_once()

import os
import sys
from pathlib import Path
import pytest
import asyncio
from typing import Generator, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock, Mock

# Keep config import stable in test runs even if local .env contains blank values.
os.environ["ANONYMOUS_COOKIE_SECURE"] = "false"
os.environ["ANONYMOUS_COOKIE_SAMESITE"] = "lax"

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def mock_db() -> AsyncSession:
    """Returns a mock AsyncSession for unit testing services."""
    session = AsyncMock(spec=AsyncSession)
    # AsyncSession.add() is synchronous; keep it as Mock to avoid "never awaited" warnings.
    session.add = Mock()
    return session

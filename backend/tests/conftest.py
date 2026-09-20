import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database.connection import init_db
from scripts.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    seed_database()

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "alex@edupath.ai", "password": "edupath123"},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

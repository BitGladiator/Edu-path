import uuid

def test_register_and_login(client):
    test_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": test_email,
            "password": "strong_test_password",
            "full_name": "Test User",
        },
    )
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["email"] == test_email

    # Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": "strong_test_password"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Verify protected /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

def test_duplicate_registration(client):
    res = client.post(
        "/api/auth/register",
        json={
            "email": "alex@edupath.ai",
            "password": "some_password",
            "full_name": "Alex Duplicate",
        },
    )
    assert res.status_code == 400

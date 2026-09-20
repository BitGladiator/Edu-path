import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dynamic_multi_user_experience():
    uid = uuid.uuid4().hex[:6]
    # 1. Register User A (Data Analyst)
    res_a = client.post(
        "/api/auth/register",
        json={"email": f"user_a_{uid}@edupath.ai", "password": "password123", "full_name": "Alice Analyst"}
    )
    assert res_a.status_code == 200
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Set User A profile
    client.put(
        "/api/profile",
        json={
            "target_role": "Data Analyst",
            "experience": "1–3 Years",
            "current_skills": ["Excel", "Basic SQL"],
            "career_goal": "Become a senior BI and product analyst",
        },
        headers=headers_a
    )

    # Run assessment for User A
    assess_a = client.post("/api/assessment/start", json={}, headers=headers_a)
    assert assess_a.status_code == 200
    assert assess_a.json()["status"] == "success"
    assert assess_a.json()["gaps_detected"] > 0

    # Verify User A gaps
    gaps_a = client.get("/api/skill-gaps", headers=headers_a).json()
    assert len(gaps_a) > 0
    gap_names_a = [g["skill"].lower() for g in gaps_a]

    # Get User A learning plan
    plan_a = client.get("/api/learning-plan", headers=headers_a).json()
    assert len(plan_a["stages"]) >= 3
    stage_titles_a = [s["title"].lower() for s in plan_a["stages"]]
    assert any("sql" in t or "data" in t or "statistic" in t for t in stage_titles_a)

    # 2. Register User B (Frontend Developer)
    res_b = client.post(
        "/api/auth/register",
        json={"email": f"user_b_{uid}@edupath.ai", "password": "password123", "full_name": "Bob Builder"}
    )
    assert res_b.status_code == 200
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Set User B profile
    client.put(
        "/api/profile",
        json={
            "target_role": "Frontend Developer",
            "experience": "Entry Level",
            "current_skills": ["HTML", "CSS", "JavaScript"],
            "career_goal": "Build modern web applications with React",
        },
        headers=headers_b
    )

    # Run assessment for User B
    assess_b = client.post("/api/assessment/start", json={}, headers=headers_b)
    assert assess_b.status_code == 200
    assert assess_b.json()["status"] == "success"

    # Verify User B gaps
    gaps_b = client.get("/api/skill-gaps", headers=headers_b).json()
    gap_names_b = [g["skill"].lower() for g in gaps_b]
    assert gap_names_a != gap_names_b

    # Get User B learning plan
    plan_b = client.get("/api/learning-plan", headers=headers_b).json()
    stage_titles_b = [s["title"].lower() for s in plan_b["stages"]]

    # Verify that User A and User B have completely distinct plans and gaps
    assert stage_titles_a != stage_titles_b
    assert any("react" in t or "typescript" in t or "frontend" in t for t in stage_titles_b)

    # 3. Test Progress Adaptation on User A
    tasks_a = client.get("/api/learning-plan/practice-tasks", headers=headers_a).json()
    assert len(tasks_a) > 0
    first_task = tasks_a[0]

    # Submit task
    submit_res = client.post(
        f"/api/learning-plan/practice-tasks/{first_task['id']}/submit",
        json={"submission_text": "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*) > 1;"},
        headers=headers_a
    )
    assert submit_res.status_code == 200
    eval_data = submit_res.json()
    assert eval_data["passed"] is True
    assert "feedback" in eval_data

    # Check that progress updated
    prog_a = client.get("/api/progress", headers=headers_a).json()
    assert prog_a["completed_count"] >= 1
    assert prog_a["completed_percent"] > 0

def test_get_and_update_profile(client, auth_headers):
    # Get profile
    res = client.get("/api/profile", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "target_role" in data
    assert "current_skills" in data

    # Update profile
    update_res = client.put(
        "/api/profile",
        headers=auth_headers,
        json={
            "experience": "3–5 Years",
            "career_goal": "Lead data intelligence teams.",
            "current_skills": ["Excel", "SQL", "Python", "Tableau"],
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["experience_level"] == "3–5 Years"
    assert "Tableau" in updated["current_skills"]

def test_roles_and_skills_catalog(client):
    roles_res = client.get("/api/roles")
    assert roles_res.status_code == 200
    roles = roles_res.json()
    assert len(roles) >= 3

    skills_res = client.get("/api/skills")
    assert skills_res.status_code == 200
    assert len(skills_res.json()) >= 5

def test_user_skill_gaps(client, auth_headers):
    gaps_res = client.get("/api/skill-gaps", headers=auth_headers)
    assert gaps_res.status_code == 200
    gaps = gaps_res.json()
    assert len(gaps) > 0
    first_gap = gaps[0]
    assert "skill" in first_gap
    assert "current_level" in first_gap
    assert "required_level" in first_gap
    assert "status" in first_gap

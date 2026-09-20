def test_agent_assessment_start(client, auth_headers):
    res = client.post("/api/assessment/start", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["gaps_detected"] > 0
    assert data["stages_generated"] > 0

def test_agent_contextual_chat(client, auth_headers):
    res = client.post(
        "/api/agent/chat",
        headers=auth_headers,
        json={"message": "Why am I learning statistics in my roadmap?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
    assert "context_used" in data
    assert "target_role" in data["context_used"]

def test_agent_runs_observability(client, auth_headers):
    res = client.get("/api/agent/runs", headers=auth_headers)
    assert res.status_code == 200
    runs = res.json()
    assert isinstance(runs, list)
    assert len(runs) > 0
    agent_names = [r["agent_name"] for r in runs]
    assert "orchestrator" in agent_names or "profile_agent" in agent_names

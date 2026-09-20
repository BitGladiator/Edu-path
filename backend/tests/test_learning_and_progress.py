def test_active_learning_plan_and_stages(client, auth_headers):
    res = client.get("/api/learning-plan", headers=auth_headers)
    assert res.status_code == 200
    plan = res.json()
    assert plan is not None
    assert "stages" in plan
    assert len(plan["stages"]) >= 3

    # Verify stage structure
    first_stage = plan["stages"][0]
    assert "phase" in first_stage
    assert "title" in first_stage
    assert "why_learn" in first_stage

def test_progress_summary_answers(client, auth_headers):
    res = client.get("/api/progress", headers=auth_headers)
    assert res.status_code == 200
    prog = res.json()

    # Verify 4 core questions are answered
    assert "what_did_i_learn" in prog
    assert "what_am_i_working_on" in prog
    assert "what_is_still_missing" in prog
    assert "what_should_i_do_next" in prog
    assert "completed_percent" in prog
    assert "weekly_activity" in prog

def test_complete_objective_and_adaptive_feedback(client, auth_headers):
    plan_res = client.get("/api/learning-plan", headers=auth_headers)
    plan = plan_res.json()
    stages = plan["stages"]
    in_prog = next((s for s in stages if s["status"] == "in-progress"), stages[1])

    # Mark complete
    comp_res = client.post(
        f"/api/learning-plan/objectives/{in_prog['id']}/complete",
        headers=auth_headers,
    )
    assert comp_res.status_code == 200
    data = comp_res.json()
    assert "new_progress_percent" in data["data"]

# EduPath Backend

Production-ready backend for EduPath — a Personalized Learning & Skill Gap Agent built with FastAPI, PostgreSQL, SQLAlchemy, Pydantic, and Gemini 2.5 Flash multi-agent architecture.

## Quick Start Options

### Option 1: Run Locally (Python 3.12 Virtual Environment)

1. Activate the pre-configured virtual environment:
   ```bash
   source venv/bin/activate
   ```
2. Configure `.env` with your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Run database seed (creates tables, roles, requirements, and sample user alex@edupath.ai):
   ```bash
   python scripts/seed.py
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. API docs will be live at `http://localhost:8000/docs`.

### Option 2: Run with Docker Compose

1. Start PostgreSQL (and optional backend container):
   ```bash
   docker compose up -d postgres
   ```
2. Configure `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://edupath:edupath_secret_password@localhost:5432/edupath
   ```
3. Run seeds and start uvicorn:
   ```bash
   venv/bin/python scripts/seed.py
   venv/bin/uvicorn app.main:app --reload --port 8000
   ```

## Automated Testing

Run the full pytest suite (12 tests covering auth, profiles, skill gap analysis, roadmaps, practice feedback loop, agent runs telemetry, and multi-user e2e verification):
```bash
venv/bin/pytest tests/ -v
```

## Agent Architecture

- **Profile Analysis Agent**: Extracts proficiencies, years of experience, and tech stack from profile forms or uploaded PDF/DOCX resumes.
- **Skill Gap Agent**: Performs deterministic gap analysis comparing user proficiencies against PostgreSQL `role_skills` benchmark requirements.
- **Learning Planner Agent**: Generates sequenced 5-stage roadmap (Foundation, Current Focus, Next, Later, Capstone).
- **Progress / Adaptation Agent**: Evaluates user practice submissions against verification rubrics, promotes skill levels, marks gaps 'Ready', and recalculates the dynamic learning roadmap.
- **Curriculum Advisor Agent**: Context-aware LLM assistant maintaining conversation memory over active gaps and roadmap rationale.
- **Orchestrator**: Coordinates multi-agent pipeline and records execution metrics in `agent_runs`.

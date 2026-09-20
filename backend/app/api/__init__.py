from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.roles import router as roles_router
from app.api.skills import router as skills_router
from app.api.assessment import router as assessment_router
from app.api.learning import router as learning_router
from app.api.progress import router as progress_router
from app.api.agent import router as agent_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(roles_router)
api_router.include_router(skills_router)
api_router.include_router(assessment_router)
api_router.include_router(learning_router)
api_router.include_router(progress_router)
api_router.include_router(agent_router)

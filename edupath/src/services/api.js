import { apiClient } from "./apiClient";

export const authApi = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getMe: () => apiClient.get("/auth/me"),
};

export const profileApi = {
  getProfile: () => apiClient.get("/profile"),
  updateProfile: (data) => apiClient.put("/profile", data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/profile/resume", formData);
  },
};

export const rolesApi = {
  getRoles: () => apiClient.get("/roles"),
  getRole: (id) => apiClient.get(`/roles/${id}`),
};

export const skillsApi = {
  getSkills: () => apiClient.get("/skills"),
  getSkillGaps: () => apiClient.get("/skill-gaps"),
  updateSkillLevel: (skillId, current_level) =>
    apiClient.put(`/skills/${skillId}/level`, { current_level }),
};

export const assessmentApi = {
  startAssessment: () => apiClient.post("/assessment/start", {}),
};

export const learningApi = {
  getLearningPlan: () => apiClient.get("/learning-plan"),
  completeObjective: (objectiveId) =>
    apiClient.post(`/learning-plan/objectives/${objectiveId}/complete`, {}),
  reorderStages: (objectiveId, direction) =>
    apiClient.put("/learning-plan/reorder", { objective_id: objectiveId, direction }),
  getPracticeTasks: () => apiClient.get("/learning-plan/practice-tasks"),
  submitPracticeTask: (taskId, submissionText) =>
    apiClient.post(`/learning-plan/practice-tasks/${taskId}/submit`, {
      submission_text: submissionText,
    }),
};

export const progressApi = {
  getProgress: () => apiClient.get("/progress"),
  recalculate: () => apiClient.post("/progress/recalculate", {}),
};

export const agentApi = {
  chat: (message) => apiClient.post("/agent/chat", { message }),
  getRuns: () => apiClient.get("/agent/runs"),
};

export const systemApi = {
  pingHealth: () => apiClient.get("/health"),
};

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  authApi,
  profileApi,
  rolesApi,
  skillsApi,
  assessmentApi,
  learningApi,
  progressApi,
  agentApi,
  systemApi,
} from "../services/api";
import { apiClient } from "../services/apiClient";
import { SKILLS_CATALOG } from "../data/skillsCatalog";

const EduPathContext = createContext(null);

export const EduPathProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => apiClient.getUser());
  const [profile, setProfile] = useState({
    name: "Learner",
    targetRole: "Not selected",
    experience: "1–3 Years",
    currentSkills: [],
    careerGoal: "",
  });

  const [skills, setSkills] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableSkills, setAvailableSkills] = useState(SKILLS_CATALOG);
  const [roadmap, setRoadmap] = useState([]);
  const [practiceChallenges, setPracticeChallenges] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);
  const [weeklyActivityData, setWeeklyActivityData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState("online"); // 'online' | 'waking'

  // Keep-alive heartbeat for Render free-tier
  // Render spins down services after 15 min of inactivity; we ping every 10 min
  const pingServer = useCallback(async () => {
    const wakingTimer = setTimeout(() => {
      setServerStatus("waking");
    }, 3000);

    try {
      await systemApi.pingHealth();
      clearTimeout(wakingTimer);
      setServerStatus("online");
    } catch {
      clearTimeout(wakingTimer);
      setServerStatus("waking");
    }
  }, []);

  useEffect(() => {
    // Initial ping on app mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pingServer();

    // Regular heartbeat every 10 minutes (600,000 ms) to prevent Render sleep
    const interval = setInterval(() => {
      pingServer();
    }, 10 * 60 * 1000);

    // Refresh immediately when returning to tab
    let lastPing = Date.now();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastPing;
        if (elapsed > 8 * 60 * 1000) {
          lastPing = Date.now();
          pingServer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pingServer]);

  // Auto login default test user if no token exists yet
  const ensureAuth = useCallback(async () => {
    let token = apiClient.getToken();
    if (!token) {
      try {
        const res = await authApi.login({
          email: "alex@edupath.ai",
          password: "edupath123",
        });
        apiClient.setToken(res.access_token);
        apiClient.setUser(res);
        setCurrentUser(res);
      } catch (e) {
        console.warn("Auto-login fallback error:", e);
      }
    }
  }, []);

  // Primary loader for all application data
  const refreshAppData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await ensureAuth();

      // Parallel data fetching from backend
      const [
        profileRes,
        gapsRes,
        planRes,
        tasksRes,
        progRes,
        rolesRes,
        allSkillsRes,
      ] = await Promise.allSettled([
        profileApi.getProfile(),
        skillsApi.getSkillGaps(),
        learningApi.getLearningPlan(),
        learningApi.getPracticeTasks(),
        progressApi.getProgress(),
        rolesApi.getRoles(),
        skillsApi.getSkills(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        const p = profileRes.value;
        setProfile({
          id: p.id,
          name: p.full_name || "Learner",
          targetRole: p.target_role || "Not specified",
          targetRoleId: p.target_role_id,
          experience: p.experience_level || "1–3 Years",
          currentSkills: p.current_skills || [],
          careerGoal: p.career_goal || "",
          resumeUploaded: p.resume_uploaded,
          resumeFilename: p.resume_filename,
        });
      }

      if (gapsRes.status === "fulfilled" && gapsRes.value) {
        const mappedGaps = gapsRes.value.map((g) => ({
          ...g,
          id: g.id,
          skillId: g.skill_id,
          skill_id: g.skill_id,
          skill: g.skill,
          category: g.category,
          currentLevel: g.current_level,
          requiredLevel: g.required_level,
          aiNote: g.ai_note || g.reason || "",
          description: g.reason || g.ai_note || "",
        }));
        setSkills(mappedGaps);
      }

      if (planRes.status === "fulfilled" && planRes.value) {
        const stages = (planRes.value.stages || []).map((s) => ({
          id: s.id,
          phase: s.phase,
          title: s.title,
          status: s.status,
          estimatedTime: s.estimated_time,
          difficulty: s.difficulty,
          whyLearn: s.why_learn,
          objectives: s.objectives || [],
          resources: s.resources || [],
          practiceTask: s.practice_task,
        }));
        setRoadmap(stages);
      }

      if (tasksRes.status === "fulfilled" && tasksRes.value) {
        setPracticeChallenges(tasksRes.value);
        if (tasksRes.value.length > 0) {
          setActiveTask(tasksRes.value[0]);
        }
      }

      if (progRes.status === "fulfilled" && progRes.value) {
        setProgressSummary(progRes.value);
        if (progRes.value.weekly_activity) {
          setWeeklyActivityData(progRes.value.weekly_activity);
        }
      }

      if (rolesRes.status === "fulfilled" && rolesRes.value) {
        setAvailableRoles(rolesRes.value);
      }

      // Merge backend skills with catalog
      const backendSkills = [];
      if (allSkillsRes.status === "fulfilled" && Array.isArray(allSkillsRes.value)) {
        backendSkills.push(
          ...allSkillsRes.value.map((s) => ({
            name: s.name,
            category: s.category || "Technical",
          }))
        );
      }
      if (rolesRes.status === "fulfilled" && Array.isArray(rolesRes.value)) {
        rolesRes.value.forEach((role) => {
          (role.skills || []).forEach((s) => {
            backendSkills.push({
              name: s.skill_name,
              category: s.category || "Technical",
            });
          });
        });
      }

      if (backendSkills.length > 0) {
        setAvailableSkills((prev) => {
          const map = new Map();
          // Add default catalog first
          prev.forEach((item) => map.set(item.name.toLowerCase(), item));
          // Overlay or add backend skills
          backendSkills.forEach((item) => {
            if (item.name && !map.has(item.name.toLowerCase())) {
              map.set(item.name.toLowerCase(), item);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error("Failed to load application data from backend:", err);
      setError(err.message || "Failed to load learning data.");
    } finally {
      setIsLoading(false);
    }
  }, [ensureAuth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAppData();
  }, [refreshAppData]);

  // Derived progress metrics
  const progressMetrics = useMemo(() => {
    if (progressSummary) {
      return {
        completedPercent: progressSummary.completed_percent,
        inProgressPercent: progressSummary.in_progress_percent,
        remainingPercent: progressSummary.remaining_percent,
        completedCount: progressSummary.completed_count,
        inProgressCount: progressSummary.in_progress_count,
        remainingCount: progressSummary.remaining_count,
        total: progressSummary.total_stages,
      };
    }
    const total = roadmap.length;
    const completedCount = roadmap.filter((item) => item.status === "completed").length;
    const inProgressCount = roadmap.filter((item) => item.status === "in-progress").length;
    const remainingCount = total - completedCount - inProgressCount;
    return {
      completedPercent: total > 0 ? Math.round((completedCount / total) * 100) : 0,
      inProgressPercent: total > 0 ? Math.round((inProgressCount / total) * 100) : 0,
      remainingPercent: total > 0 ? 100 - Math.round((completedCount / total) * 100) - Math.round((inProgressCount / total) * 100) : 100,
      completedCount,
      inProgressCount,
      remainingCount,
      total,
    };
  }, [progressSummary, roadmap]);

  // Current focus
  const currentFocus = useMemo(() => {
    const current = roadmap.find((item) => item.status === "in-progress");
    return current || roadmap[0] || null;
  }, [roadmap]);

  // Complete a topic
  const markTopicComplete = async (stageId) => {
    try {
      await learningApi.completeObjective(stageId);
      await refreshAppData();
    } catch (e) {
      console.error("Error completing topic:", e);
    }
  };

  // Update skill level
  const updateSkillLevel = async (skillIdOrObjId, newLevel) => {
    try {
      const targetGap = skills.find(
        (s) => s.id === skillIdOrObjId || s.skill_id === skillIdOrObjId || s.skillId === skillIdOrObjId
      );
      const targetSkillId = targetGap?.skill_id || targetGap?.skillId || skillIdOrObjId;
      await skillsApi.updateSkillLevel(targetSkillId, newLevel);
      await refreshAppData();
    } catch (e) {
      console.error("Error updating skill level:", e);
    }
  };

  // Reorder roadmap
  const reorderRoadmap = async (stageId, direction) => {
    try {
      await learningApi.reorderStages(stageId, direction);
      await refreshAppData();
    } catch (e) {
      console.error("Error reordering roadmap:", e);
    }
  };

  // Start assessment
  const startAssessment = async () => {
    setIsLoading(true);
    try {
      const res = await assessmentApi.startAssessment();
      await refreshAppData();
      return res;
    } catch (e) {
      console.error("Error running assessment:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const saveProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const res = await profileApi.updateProfile({
        name: profileData.name,
        target_role: profileData.targetRole,
        experience: profileData.experience,
        current_skills: profileData.currentSkills,
        career_goal: profileData.careerGoal,
      });
      await refreshAppData();
      return res;
    } catch (e) {
      console.error("Error updating profile:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload resume
  const uploadResume = async (file) => {
    try {
      const res = await profileApi.uploadResume(file);
      await refreshAppData();
      return res;
    } catch (e) {
      console.error("Error uploading resume:", e);
      throw e;
    }
  };

  // Submit practice task
  const submitPracticeTask = async (taskId, code) => {
    try {
      const res = await learningApi.submitPracticeTask(taskId, code);
      await refreshAppData();
      return res;
    } catch (e) {
      console.error("Error submitting practice task:", e);
      throw e;
    }
  };

  // Advisor chat
  const sendAdvisorMessage = async (message) => {
    try {
      return await agentApi.chat(message);
    } catch (e) {
      console.error("Error chatting with advisor:", e);
      throw e;
    }
  };

  return (
    <EduPathContext.Provider
      value={{
        currentUser,
        profile,
        saveProfile,
        uploadResume,
        skills,
        updateSkillLevel,
        roadmap,
        setRoadmap,
        reorderRoadmap,
        markTopicComplete,
        progressMetrics,
        progressSummary,
        currentFocus,
        weeklyActivityData,
        practiceChallenges,
        activeTask,
        setActiveTask,
        submitPracticeTask,
        startAssessment,
        sendAdvisorMessage,
        availableRoles,
        availableSkills,
        isLoading,
        error,
        serverStatus,
        pingServer,
        refreshAppData,
      }}
    >
      {children}
    </EduPathContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useEduPath = () => {
  const context = useContext(EduPathContext);
  if (!context) {
    throw new Error("useEduPath must be used within an EduPathProvider");
  }
  return context;
};

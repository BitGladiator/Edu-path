import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EduPathProvider } from "./context/EduPathContext";
import WorkspaceLayout from "./layouts/WorkspaceLayout";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import SkillGap from "./pages/SkillGap";
import LearningPlan from "./pages/LearningPlan";
import Practice from "./pages/Practice";
import ProgressPage from "./pages/ProgressPage";
import Mentor from "./pages/Mentor";

export default function App() {
  return (
    <EduPathProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Onboarding */}
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/analysis" element={<Analysis />} />

          {/* Learning Workspace (Persistent Left Sidebar) */}
          <Route element={<WorkspaceLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="/learning-plan" element={<LearningPlan />} />
            <Route path="/learning-path" element={<Navigate to="/learning-plan" replace />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/skill-gaps" element={<Navigate to="/skill-gap" replace />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/mentor" element={<Mentor />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </EduPathProvider>
  );
}
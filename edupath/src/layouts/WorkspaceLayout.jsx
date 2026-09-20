import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Route,
  TableProperties,
  Terminal,
  BarChart3,
  Settings2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

const navItems = [
  { name: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { name: "My Learning Path", to: "/learning-plan", icon: Route },
  { name: "Skill Gaps", to: "/skill-gap", icon: TableProperties },
  { name: "Practice", to: "/practice", icon: Terminal },
  { name: "Progress", to: "/progress", icon: BarChart3 },
];

export default function WorkspaceLayout() {
  const { profile, progressMetrics, currentFocus, serverStatus } = useEduPath();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 flex flex-col md:flex-row antialiased selection:bg-zinc-200">
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 bg-white min-h-screen sticky top-0 h-screen shrink-0">
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
              <span className="font-semibold tracking-tight text-base text-zinc-950">
                EduPath
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 tracking-normal">
              Personalized Learning Workspace
            </p>
          </div>
        </div>

        {/* Current Context Pill / Summary */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-md bg-[#fbfbf9] border border-zinc-200/80 text-xs">
          <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
            Target Role
          </div>
          <div className="font-medium text-zinc-900 truncate mt-0.5">
            {profile.targetRole}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-zinc-200/60">
            <span>Progress</span>
            <span className="font-mono font-medium text-zinc-900">
              {progressMetrics.completedPercent}%
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-zinc-950 font-semibold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  }`
                }
              >
                <Icon size={16} strokeWidth={1.8} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Assistance
          </div>
          <NavLink
            to="/mentor"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-950 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
              }`
            }
          >
            <BookOpen size={16} strokeWidth={1.8} className="shrink-0" />
            <span>Learning Advisor</span>
          </NavLink>
        </nav>

        {/* Active Focus Card in Sidebar */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-md bg-zinc-50 border border-zinc-200/70">
          <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
            Current Focus
          </div>
          <div className="text-xs font-medium text-zinc-900 mt-1 truncate">
            {currentFocus?.title || "Advanced SQL"}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
            {currentFocus?.estimatedTime || "45 min"} remaining
          </p>
          <button
            onClick={() => navigate("/practice")}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition"
          >
            <span>Practice now</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* User & Settings Footer */}
        <div className="px-4 py-3.5 border-t border-zinc-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-semibold text-xs shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-900 truncate">
                {profile.name}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {profile.targetRole}
              </p>
            </div>
          </div>
          <NavLink
            to="/onboarding"
            title="Edit profile & role"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded transition"
          >
            <Settings2 size={16} />
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-8">
        {serverStatus === "waking" && (
          <div className="bg-amber-50/90 border-b border-amber-200/70 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Connecting to backend server on Render (cold start takes ~30s on first load)...</span>
            </div>
            <span className="font-mono text-[10px] text-amber-600 uppercase">Waking up</span>
          </div>
        )}

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-zinc-200 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
            <span className="font-semibold text-zinc-900 text-sm">EduPath</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">{profile.targetRole}</span>
            <span className="font-mono font-medium text-zinc-900 px-1.5 py-0.5 rounded bg-zinc-100">
              {progressMetrics.completedPercent}%
            </span>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-30 flex items-center justify-around py-1.5 px-2 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded text-[10px] font-medium transition-colors ${
                  isActive ? "text-blue-600 font-semibold" : "text-zinc-500 hover:text-zinc-900"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.name.replace("My ", "")}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

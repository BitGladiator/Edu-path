import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

export default function Dashboard() {
  const { profile, progressMetrics, currentFocus, skills, markTopicComplete } = useEduPath();
  const navigate = useNavigate();

  // Identified gaps
  const gapSkills = skills.filter((s) => s.status === "Gap" || s.status === "Improve");

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Welcome & Context Section */}
      <div className="border-b border-zinc-200/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Good morning, {profile.name}.
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Your learning path is adapting to your progress.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition flex items-center gap-1 self-start"
          >
            <span>Change role or profile</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Status bar with key parameters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-md border border-zinc-200/80 bg-white">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Target role
            </span>
            <span className="text-sm font-semibold text-zinc-900 mt-0.5 block">
              {profile.targetRole}
            </span>
          </div>

          <div className="p-3.5 rounded-md border border-zinc-200/80 bg-white">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Progress
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-semibold font-mono text-zinc-900">
                {progressMetrics.completedPercent}%
              </span>
              <span className="text-xs text-zinc-500">
                ({progressMetrics.completedCount} of {progressMetrics.total} complete)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-zinc-200/80 bg-white">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Current focus
            </span>
            <span className="text-sm font-semibold text-zinc-900 mt-0.5 block truncate">
              {currentFocus?.title || "Advanced SQL"}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: NEXT UP */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            1. NEXT UP
          </h2>
          <span className="text-xs text-zinc-500">Recommended action</span>
        </div>

        <div className="p-5 rounded-md border border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-950">
                {currentFocus?.practiceTask?.title || "Advanced SQL joins"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                In progress
              </span>
            </div>
            <p className="text-xs text-zinc-600 max-w-xl leading-relaxed">
              {currentFocus?.practiceTask?.description ||
                "Write aggregation queries and multi-table joins to analyze customer cohort retention."}
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-zinc-400" />
                Estimated time: {currentFocus?.estimatedTime || "45 min"}
              </span>
              <span>•</span>
              <span>Module: {currentFocus?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/practice")}
              className="px-4 py-2 rounded text-xs font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition"
            >
              Start
            </button>
            <button
              onClick={() => markTopicComplete(currentFocus?.id)}
              className="px-3 py-2 rounded text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition"
              title="Mark this module as complete"
            >
              Mark complete
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: SKILL GAPS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            2. SKILL GAPS
          </h2>
          <Link
            to="/skill-gap"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
          >
            <span>View complete matrix</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="rounded-md border border-zinc-200 bg-white divide-y divide-zinc-100">
          {gapSkills.length === 0 ? (
            <div className="p-4 text-xs text-zinc-500 text-center">
              No active skill gaps identified. All competencies are aligned with target role expectations.
            </div>
          ) : (
            gapSkills.map((item) => (
            <div
              key={item.id}
              className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900">{item.skill}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500">{item.category}</span>
                </div>
                <p className="text-[11px] text-zinc-500">{item.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className="text-zinc-500">
                  {item.currentLevel} → <strong className="text-zinc-800 font-semibold">{item.requiredLevel}</strong>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    item.status === "Gap"
                      ? "bg-zinc-100 text-zinc-700"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          )))}
        </div>
      </section>

      {/* SECTION 3: LEARNING PROGRESS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            3. LEARNING PROGRESS
          </h2>
          <Link
            to="/progress"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
          >
            <span>Detailed analytics</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="p-5 rounded-md border border-zinc-200 bg-white space-y-4">
          {/* Simple horizontal progress visualization */}
          <div className="space-y-2">
            <div className="h-3 rounded-full bg-zinc-100 overflow-hidden flex">
              <div
                style={{ width: `${progressMetrics.completedPercent}%` }}
                className="bg-zinc-900 h-full transition-all duration-300"
                title={`Completed: ${progressMetrics.completedPercent}%`}
              />
              <div
                style={{ width: `${progressMetrics.inProgressPercent}%` }}
                className="bg-blue-600 h-full transition-all duration-300"
                title={`In progress: ${progressMetrics.inProgressPercent}%`}
              />
              <div
                style={{ width: `${progressMetrics.remainingPercent}%` }}
                className="bg-zinc-200 h-full transition-all duration-300"
                title={`Remaining: ${progressMetrics.remainingPercent}%`}
              />
            </div>

            {/* Labels and values */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 inline-block" />
                  <span className="text-zinc-700">Completed</span>
                  <span className="font-mono text-zinc-500 font-medium">
                    ({progressMetrics.completedPercent}%)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                  <span className="text-zinc-700">In progress</span>
                  <span className="font-mono text-zinc-500 font-medium">
                    ({progressMetrics.inProgressPercent}%)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200 inline-block" />
                  <span className="text-zinc-700">Remaining</span>
                  <span className="font-mono text-zinc-500 font-medium">
                    ({progressMetrics.remainingPercent}%)
                  </span>
                </div>
              </div>

              <div className="text-zinc-500 text-[11px]">
                {progressMetrics.completedCount} of {progressMetrics.total} roadmap stages finished
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
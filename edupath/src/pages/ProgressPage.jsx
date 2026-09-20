import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

export default function ProgressPage() {
  const { profile, skills, roadmap, weeklyActivityData = [], currentFocus, progressSummary } =
    useEduPath();

  const completedStages = roadmap.filter((r) => r.status === "completed");
  const remainingStages = roadmap.filter((r) => r.status === "not-started");

  const readySkills = skills.filter((s) => s.status === "Ready");
  const gapSkills = skills.filter((s) => s.status === "Gap");

  const safeActivityData = weeklyActivityData.length > 0 ? weeklyActivityData : [
    { day: "Mon", hours: 1.5 },
    { day: "Tue", hours: 2.0 },
    { day: "Wed", hours: 0.5 },
    { day: "Thu", hours: 1.5 },
    { day: "Fri", hours: 2.5 },
    { day: "Sat", hours: 3.0 },
    { day: "Sun", hours: 1.0 },
  ];

  const totalWeeklyHours = safeActivityData
    .reduce((acc, curr) => acc + (curr.hours || 0), 0)
    .toFixed(1);

  const maxHours = Math.max(...safeActivityData.map((d) => d.hours || 0), 1);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Learning Progress & Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Objective progress tracking against your target role of{" "}
          <span className="font-semibold text-zinc-900">{profile.targetRole}</span>.
        </p>
      </div>

      {/* 4 Core Learner Questions Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Question 1: What did I learn? */}
        <div className="p-5 rounded-md border border-zinc-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                1. What did I learn?
              </span>
              <span className="font-mono text-xs text-zinc-500">
                {readySkills.length} skills verified
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mt-1.5">
              Verified Competencies
            </h3>
            <div className="mt-3 space-y-1.5">
              {readySkills.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-zinc-50 last:border-0"
                >
                  <span className="font-medium text-zinc-800">{s.skill}</span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {s.currentLevel} (Ready)
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-zinc-100 text-[11px] text-zinc-500">
            Stages finished: {completedStages.map((c) => c.title).join(", ") || "None yet"}
          </div>
        </div>

        {/* Question 2: What am I working on? */}
        <div className="p-5 rounded-md border border-zinc-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                2. What am I working on?
              </span>
              <span className="font-mono text-xs text-blue-600 font-medium">Active</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mt-1.5">
              Current Focus
            </h3>
            <div className="mt-3 p-3 rounded bg-zinc-50 border border-zinc-200/60 text-xs space-y-1.5">
              <div className="font-semibold text-zinc-900">
                {currentFocus?.title || "Advanced SQL"}
              </div>
              <p className="text-zinc-600 text-[11px] leading-relaxed">
                {currentFocus?.whyLearn}
              </p>
              <div className="text-zinc-500 text-[11px] pt-1">
                Estimated time remaining: {currentFocus?.estimatedTime}
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Practice available</span>
            <Link to="/practice" className="font-medium text-blue-600 hover:text-blue-700">
              Open practice task →
            </Link>
          </div>
        </div>

        {/* Question 3: What is still missing? */}
        <div className="p-5 rounded-md border border-zinc-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                3. What is still missing?
              </span>
              <span className="font-mono text-xs text-zinc-500">
                {gapSkills.length} high priority gaps
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mt-1.5">
              Remaining Skill Gaps
            </h3>
            <div className="mt-3 space-y-1.5">
              {gapSkills.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-zinc-50 last:border-0"
                >
                  <span className="font-medium text-zinc-800">{s.skill}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Needs {s.requiredLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-zinc-100 text-[11px] text-zinc-500">
            Stages upcoming: {remainingStages.length} modules
          </div>
        </div>

        {/* Question 4: What should I do next? */}
        <div className="p-5 rounded-md border border-zinc-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                4. What should I do next?
              </span>
              <span className="font-mono text-xs text-zinc-500">Immediate</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mt-1.5">
              Recommended Next Step
            </h3>
            <div className="mt-3 p-3 rounded border border-zinc-200/80 bg-[#fbfbf9] text-xs space-y-2">
              <div className="font-medium text-zinc-900">
                {progressSummary?.next_recommended_step ||
                  `Complete ${currentFocus?.title || "Advanced SQL"} practice exercises.`}
              </div>
              <p className="text-zinc-600 text-[11px]">
                {currentFocus?.whyLearn ||
                  "Finishing this task satisfies the SQL improvement requirement and unlocks Statistics Fundamentals."}
              </p>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-zinc-100 flex justify-end">
            <Link
              to="/practice"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition"
            >
              <span>Resume now</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <section className="p-5 sm:p-6 rounded-md border border-zinc-200 bg-white space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Time Commitment
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 mt-0.5">
              Weekly Learning Activity ({totalWeeklyHours} hours total)
            </h2>
          </div>
          <span className="text-xs text-zinc-500">Past 7 days</span>
        </div>

        {/* Simple Bar Chart */}
        <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-36 border-b border-zinc-200 pb-2">
          {safeActivityData.map((d) => {
            const heightPercent = Math.round((d.hours / maxHours) * 100);

            return (
              <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono text-zinc-500">
                  {d.hours}h
                </span>
                <div className="w-full max-w-[28px] bg-zinc-100 rounded-t h-full flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-zinc-800 rounded-t transition-all duration-300"
                    title={`${d.day}: ${d.hours} hours`}
                  />
                </div>
                <span className="text-[11px] font-medium text-zinc-600">
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Consistent 30-45 minute daily blocks produce 2.3x higher skill retention than sporadic weekend sessions.
        </p>
      </section>
    </div>
  );
}

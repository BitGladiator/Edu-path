import { Link } from "react-router-dom";
import { ArrowRight, ArrowDownRight } from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

export default function Hero() {
  const { profile, skills, currentFocus } = useEduPath();

  const previewRole =
    profile?.targetRole && profile.targetRole !== "Not specified"
      ? profile.targetRole
      : "Data Analyst";

  const previewSkills =
    profile?.currentSkills && profile.currentSkills.length > 0
      ? profile.currentSkills.slice(0, 4)
      : ["Excel", "SQL", "Python"];

  const previewGaps =
    skills && skills.length > 0
      ? skills.filter((s) => s.status === "Gap" || s.status === "Improve").slice(0, 3)
      : [
          { skill: "Statistics", status: "Gap" },
          { skill: "Power BI", status: "Gap" },
          { skill: "Advanced SQL", status: "Improve" },
        ];

  const nextStepTitle = currentFocus?.title || "Statistics fundamentals";
  const nextStepTime = currentFocus?.estimatedTime || "Est. 45 min";

  return (
    <section className="py-12 sm:py-16 lg:py-20 border-b border-zinc-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 pt-2">
            <div className="inline-block text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-4">
              PERSONALIZED LEARNING
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 leading-[1.15]">
              Know what to learn next.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
              EduPath analyzes your current skills, compares them with your target
              role, and builds a learning path that adapts as you progress.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition"
              >
                <span>Start your learning path</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition"
              >
                <span>See how it works</span>
                <ArrowDownRight size={15} />
              </a>
            </div>

            <div className="mt-12 pt-6 border-t border-zinc-200/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-xs font-semibold text-zinc-900">Adaptive</div>
                <div className="text-xs text-zinc-500 mt-0.5">Recalculates on task completion</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900">Targeted</div>
                <div className="text-xs text-zinc-500 mt-0.5">Focuses solely on role gaps</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900">Applied</div>
                <div className="text-xs text-zinc-500 mt-0.5">Practical project checkpoints</div>
              </div>
            </div>
          </div>

          {/* Right Hero: Realistic Product Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {/* Product window top bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 text-xs">
                <span className="font-semibold text-zinc-900 tracking-tight">
                  EduPath Workspace
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  Profile: {profile?.name || "Active"}
                </span>
              </div>

              {/* Target role */}
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Target role
                </span>
                <span className="text-base font-semibold text-zinc-900 mt-0.5 block">
                  {previewRole}
                </span>
              </div>

              {/* Current skills */}
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-1.5">
                  Current skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skill gaps */}
              <div className="mb-5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-1.5">
                  Skill gaps
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewGaps.map((g, idx) => (
                    <span
                      key={g.skill || idx}
                      className="px-2 py-0.5 rounded text-xs border border-zinc-200 text-zinc-700 bg-zinc-50 flex items-center gap-1.5"
                    >
                      <span>{g.skill || g.name}</span>
                      <span className="text-[10px] text-zinc-400">({g.status || g.note})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Next step block */}
              <div className="pt-4 border-t border-zinc-100">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Next step
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-zinc-900">
                    {nextStepTitle}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {nextStepTime}
                  </span>
                </div>

                <Link
                  to="/dashboard"
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <span>Continue learning</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 text-center mt-2.5">
              Live workspace preview with adaptive roadmap state
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
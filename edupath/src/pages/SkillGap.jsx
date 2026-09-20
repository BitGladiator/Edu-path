import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

export default function SkillGap() {
  const { profile, skills, updateSkillLevel } = useEduPath();
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredSkills = skills.filter((s) => {
    if (filter === "gaps") return s.status === "Gap" || s.status === "Improve";
    if (filter === "ready") return s.status === "Ready";
    return true;
  });

  const readyCount = skills.filter((s) => s.status === "Ready").length;
  const improveCount = skills.filter((s) => s.status === "Improve").length;
  const gapCount = skills.filter((s) => s.status === "Gap").length;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Skill gaps
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Your current profile compared with your target role.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start text-xs">
            <span className="text-zinc-500">Target Role:</span>
            <span className="font-semibold text-zinc-900 px-2 py-0.5 rounded bg-white border border-zinc-200">
              {profile.targetRole}
            </span>
          </div>
        </div>

        {/* Summary counts */}
        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900">{skills.length}</span>
            <span className="text-zinc-500">evaluated skills</span>
          </div>
          <span className="text-zinc-300">•</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900">{readyCount}</span>
            <span className="text-zinc-500">ready</span>
          </div>
          <span className="text-zinc-300">•</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900">{improveCount}</span>
            <span className="text-zinc-500">needs improvement</span>
          </div>
          <span className="text-zinc-300">•</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900">{gapCount}</span>
            <span className="text-zinc-500">high priority gaps</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 bg-zinc-100/80 p-1 rounded">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filter === "all" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All skills ({skills.length})
            </button>
            <button
              onClick={() => setFilter("gaps")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filter === "gaps" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Gaps & Improvements ({improveCount + gapCount})
            </button>
            <button
              onClick={() => setFilter("ready")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filter === "ready" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Ready ({readyCount})
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Click any row to inspect role impact & curriculum rationale
          </span>
        </div>

        {/* Clean Data Table */}
        <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-zinc-500 font-medium">
                  <th className="py-3 px-4 font-semibold text-zinc-600">Skill</th>
                  <th className="py-3 px-4 font-semibold text-zinc-600">Category</th>
                  <th className="py-3 px-4 font-semibold text-zinc-600">Current level</th>
                  <th className="py-3 px-4 font-semibold text-zinc-600">Required level</th>
                  <th className="py-3 px-4 font-semibold text-zinc-600">Status</th>
                  <th className="py-3 px-4 text-right font-semibold text-zinc-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSkills.map((row) => {
                  const isExpanded = expandedId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-zinc-50/80 transition-colors cursor-pointer ${
                        isExpanded ? "bg-zinc-50/50" : ""
                      }`}
                      onClick={() => toggleExpand(row.id)}
                    >
                      <td className="py-3.5 px-4 font-medium text-zinc-900">
                        <div className="flex items-center gap-1.5">
                          <span>{row.skill}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500">
                        {row.category}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-700">
                        {row.currentLevel}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-zinc-900">
                        {row.requiredLevel}
                      </td>

                      <td className="py-3.5 px-4">
                        {/* Subtle status indicators as requested: no loud pills */}
                        <span
                          className={`inline-flex items-center text-[11px] font-medium ${
                            row.status === "Ready"
                              ? "text-zinc-700"
                              : row.status === "Improve"
                              ? "text-zinc-800 underline decoration-zinc-300 underline-offset-4"
                              : "text-zinc-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                              row.status === "Ready"
                                ? "bg-zinc-900"
                                : row.status === "Improve"
                                ? "bg-blue-600"
                                : "bg-zinc-300"
                            }`}
                          />
                          {row.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-zinc-400 inline-flex items-center gap-1">
                          <span className="text-[11px]">Details</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Drawer Details for active item */}
          {expandedId && (
            <div className="p-5 border-t border-zinc-200 bg-zinc-50/90 space-y-4 text-xs animate-in fade-in duration-150">
              {(() => {
                const item = skills.find((s) => s.id === expandedId);
                if (!item) return null;

                return (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Capability breakdown
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 mt-0.5">
                          {item.skill} ({item.category})
                        </h3>
                      </div>

                      {/* Quick level adjuster to test dynamic updates */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500">Simulate level:</span>
                        <div className="inline-flex rounded border border-zinc-200 bg-white p-0.5">
                          {["Beginner", "Intermediate", "Strong", "Advanced"].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSkillLevel(item.id, lvl);
                              }}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                                item.currentLevel === lvl
                                  ? "bg-zinc-900 text-white"
                                  : "text-zinc-600 hover:text-zinc-900"
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-zinc-600 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>

                    {/* Integrated AI Rationale */}
                    <div className="p-3.5 rounded-md border border-zinc-200/80 bg-white">
                      <div className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-zinc-900 text-xs">
                            Why this matters for {profile.targetRole}
                          </div>
                          <p className="mt-1 text-zinc-600 text-xs leading-relaxed">
                            {item.aiNote}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        to="/learning-plan"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>View in Learning Roadmap</span>
                        <ArrowRight size={13} />
                      </Link>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-800"
                      >
                        Close details
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="p-4 rounded-md border border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-zinc-900 block">
            Ready to bridge these gaps?
          </span>
          <span className="text-zinc-500 block mt-0.5">
            The learning path automatically sequences your gaps based on prerequisites and career impact.
          </span>
        </div>
        <Link
          to="/learning-plan"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition shrink-0"
        >
          <span>Open Learning Roadmap</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
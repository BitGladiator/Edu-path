import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  HelpCircle,
  Terminal,
} from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

export default function LearningPlan() {
  const { profile, roadmap, setRoadmap, markTopicComplete, progressMetrics, reorderRoadmap } = useEduPath();
  const [expandedStage, setExpandedStage] = useState(null);
  const [activeAiModal, setActiveAiModal] = useState(null);

  const toggleExpand = (id) => {
    setExpandedStage((prev) => (prev === id ? null : id));
  };

  const moveItem = async (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= roadmap.length) return;

    const currentItem = roadmap[index];
    const updated = [...roadmap];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setRoadmap(updated);

    if (currentItem?.id && reorderRoadmap) {
      await reorderRoadmap(currentItem.id, direction);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              My Learning Path
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              A sequenced curriculum adapted to your specific skill gaps.
            </p>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            {progressMetrics.completedCount} of {progressMetrics.total} stages finished
          </div>
        </div>
      </div>

      {/* Target Role Pill / Top Beacon */}
      <div className="flex items-center justify-between p-3.5 px-4 rounded-md border border-zinc-200 bg-white text-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            TARGET ROLE
          </span>
          <span className="text-sm font-semibold text-zinc-900 mt-0.5 block">
            {profile.targetRole}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
            Curriculum Status
          </span>
          <span className="text-xs font-semibold font-mono text-zinc-800">
            {progressMetrics.completedPercent}% complete
          </span>
        </div>
      </div>

      {/* Vertical Learning Roadmap */}
      <div className="space-y-0 relative">
        {roadmap.length === 0 ? (
          <div className="p-8 text-center bg-white border border-zinc-200 rounded-md space-y-3">
            <p className="text-sm text-zinc-600">
              No learning roadmap generated yet for your current profile.
            </p>
            <Link
              to="/analysis"
              className="inline-block px-4 py-2 bg-zinc-950 text-white rounded text-xs font-medium hover:bg-zinc-800"
            >
              Run Capability Analysis
            </Link>
          </div>
        ) : (
          roadmap.map((stage, index) => {
          const isExpanded = expandedStage === stage.id;
          const isCompleted = stage.status === "completed";
          const isInProgress = stage.status === "in-progress";

          return (
            <div key={stage.id} className="relative">
              {/* Vertical connector arrow between cards */}
              {index > 0 && (
                <div className="flex justify-center py-2 text-zinc-400">
                  <ArrowDown size={15} strokeWidth={1.75} />
                </div>
              )}

              {/* Stage Card */}
              <div
                className={`rounded-md border transition-colors bg-white ${
                  isInProgress
                    ? "border-zinc-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                    : "border-zinc-200"
                }`}
              >
                {/* Header Row */}
                <div
                  className="p-4 sm:p-5 cursor-pointer flex items-start justify-between gap-4"
                  onClick={() => toggleExpand(stage.id)}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                        {stage.phase}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span
                        className={`text-[11px] font-medium ${
                          isCompleted
                            ? "text-zinc-600"
                            : isInProgress
                            ? "text-blue-700 font-semibold"
                            : "text-zinc-400"
                        }`}
                      >
                        {isCompleted
                          ? "Completed"
                          : isInProgress
                          ? "In progress"
                          : "Not started"}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-zinc-900 leading-snug">
                      {stage.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-zinc-400" />
                        {stage.estimatedTime}
                      </span>
                      <span>•</span>
                      <span>{stage.difficulty}</span>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markTopicComplete(stage.id);
                      }}
                      className={`px-2.5 py-1.5 rounded text-xs font-medium border transition flex items-center gap-1.5 ${
                        isCompleted
                          ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                      title={isCompleted ? "Mark as in-progress" : "Mark as completed"}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={13} className="text-zinc-900" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Circle size={13} className="text-zinc-400" />
                          <span>Mark complete</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="p-1.5 text-zinc-400 hover:text-zinc-700"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-zinc-100 space-y-4 text-xs">
                    {/* Why am I learning this? AI Explanation Banner */}
                    <div className="p-3.5 rounded-md border border-zinc-200/80 bg-[#fbfbf9]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block">
                            Why this matters
                          </span>
                          <p className="text-xs text-zinc-700 leading-relaxed">
                            {stage.whyLearn}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setActiveAiModal((prev) => (prev === stage.id ? null : stage.id))
                          }
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 shrink-0 inline-flex items-center gap-1"
                        >
                          <HelpCircle size={12} />
                          <span>AI Context</span>
                        </button>
                      </div>

                      {/* Deep AI context dropdown if clicked */}
                      {activeAiModal === stage.id && (
                        <div className="mt-3 pt-3 border-t border-zinc-200/70 text-[11px] text-zinc-600 leading-relaxed bg-white p-2.5 rounded border border-zinc-200">
                          <strong className="text-zinc-900 font-semibold block mb-1">
                            Curriculum Intelligence for {profile.targetRole}:
                          </strong>
                          This objective is placed at position #{index + 1} because it directly bridges the gap identified in your profile. Completing this stage unlocks subsequent dependent topics and elevates role qualification from intermediate to advanced.
                        </div>
                      )}
                    </div>

                    {/* Learning Objectives */}
                    <div className="space-y-2">
                      <span className="font-semibold text-zinc-900 text-xs block">
                        Core Objectives
                      </span>
                      <ul className="space-y-1.5 pl-1">
                        {stage.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-zinc-600">
                            <span className="w-1 h-1 rounded-full bg-zinc-400 mt-2 shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Resources */}
                    {stage.resources && stage.resources.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-zinc-100">
                        <span className="font-semibold text-zinc-900 text-xs block">
                          Curated Documentation & Walkthroughs
                        </span>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {stage.resources.map((res, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded border border-zinc-200/70 bg-white flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-zinc-800 truncate">
                                  {res.title}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  {res.type} • {res.time}
                                </p>
                              </div>
                              <ExternalLink size={12} className="text-zinc-400 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Practice Task Checkpoint */}
                    {stage.practiceTask && (
                      <div className="p-3.5 rounded-md border border-zinc-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-semibold text-zinc-900 text-xs">
                            <Terminal size={14} className="text-zinc-500" />
                            <span>Practice Task: {stage.practiceTask.title}</span>
                          </div>
                          <span className="text-[11px] text-zinc-500">
                            Est. {stage.practiceTask.estimatedMinutes} min
                          </span>
                        </div>
                        <p className="text-zinc-600 text-xs leading-relaxed">
                          {stage.practiceTask.description}
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                          <Link
                            to="/practice"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <span>Open in Practice Workspace</span>
                            <ArrowDown size={11} className="-rotate-90" />
                          </Link>
                          {stage.practiceTask.completed && (
                            <span className="text-[11px] text-zinc-500">Verified</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reordering Controls */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100">
                      <span>Adjust roadmap priority:</span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={index === 0}
                          onClick={() => moveItem(index, "up")}
                          className="px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                        >
                          <ArrowUp size={11} />
                          <span>Move earlier</span>
                        </button>
                        <button
                          disabled={index === roadmap.length - 1}
                          onClick={() => moveItem(index, "down")}
                          className="px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                        >
                          <ArrowDown size={11} />
                          <span>Move later</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
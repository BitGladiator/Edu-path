import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useEduPath } from "../context/EduPathContext";

export default function Analysis() {
  const navigate = useNavigate();
  const { profile, startAssessment } = useEduPath();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(true);

  const steps = [
    "Parsing profile experience and technical proficiencies...",
    `Benchmarking against standard expectations for ${profile.targetRole || "target role"}...`,
    "Isolating high-priority skill gaps and prerequisites...",
    "Assembling adaptive learning roadmap...",
  ];

  useEffect(() => {
    let isMounted = true;
    
    // Trigger live agentic assessment
    const run = async () => {
      try {
        await startAssessment();
      } catch (err) {
        console.warn("Assessment pipeline notice:", err);
      } finally {
        if (isMounted) setIsEvaluating(false);
      }
    };
    run();

    return () => {
      isMounted = false;
    };
  }, [startAssessment]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    } else if (!isEvaluating) {
      const finishTimer = setTimeout(() => {
        navigate("/skill-gap");
      }, 800);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStep, isEvaluating, navigate, steps.length]);

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg p-8 rounded-md border border-zinc-200 bg-white space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Capability Analysis
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
            Evaluating profile for {profile.targetRole}
          </h1>
          <p className="text-xs text-zinc-500">
            Matching known skills against required industry competencies.
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="space-y-2">
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              style={{
                width: `${Math.min(
                  ((currentStep + 1) / steps.length) * 100,
                  100
                )}%`,
              }}
              className="h-full bg-zinc-900 transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>
              Stage {Math.min(currentStep + 1, steps.length)} of {steps.length}
            </span>
            <span>
              {Math.min(
                Math.round(((currentStep + 1) / steps.length) * 100),
                100
              )}
              %
            </span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-100">
          {steps.map((text, i) => {
            const isDone = i < currentStep;
            const isCurrent = i === currentStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-2.5 text-xs transition-opacity ${
                  isDone
                    ? "text-zinc-900"
                    : isCurrent
                    ? "text-zinc-900 font-medium"
                    : "text-zinc-400 opacity-60"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isDone
                      ? "bg-zinc-900 text-white font-bold"
                      : isCurrent
                      ? "border border-zinc-400 text-zinc-700"
                      : "border border-zinc-200 text-zinc-300"
                  }`}
                >
                  {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
                <span className="truncate">{text}</span>
              </div>
            );
          })}
        </div>

        {/* Manual Continue Button */}
        {currentStep >= steps.length && (
          <div className="pt-3 border-t border-zinc-100 flex justify-end">
            <button
              onClick={() => navigate("/skill-gap")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition"
            >
              <span>View Skill Gaps Table</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
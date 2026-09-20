import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white">
      {/* Call to action bar */}
      <div className="border-b border-zinc-200/80 py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Build your learning path.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Start by inputting your current skills and target role. EduPath will map
            your skill gaps and generate a practical roadmap.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-zinc-950 text-white hover:bg-zinc-800 transition"
            >
              <span>Start your learning path</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900">EduPath</span>
          <span className="text-zinc-300">•</span>
          <span>Personalized Learning & Skill Gap Agent</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="hover:text-zinc-900 transition">
            How it works
          </a>
          <a href="#learning-path" className="hover:text-zinc-900 transition">
            Learning Path
          </a>
          <Link to="/dashboard" className="hover:text-zinc-900 transition">
            Open Workspace
          </Link>
        </div>
      </div>
    </footer>
  );
}
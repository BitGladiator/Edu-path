import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-200/80 bg-[#fbfbf9]/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-baseline gap-2.5 group">
          <span className="font-semibold text-base tracking-tight text-zinc-950">
            EduPath
          </span>
          <span className="text-xs text-zinc-500 font-normal hidden sm:inline">
            Learn what matters next.
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-600">
          <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
            How it works
          </a>
          <a href="#learning-path" className="hover:text-zinc-950 transition-colors">
            Learning Path
          </a>
          <a href="#progress" className="hover:text-zinc-950 transition-colors">
            Progress
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 px-3 py-1.5 transition hidden sm:inline"
          >
            Workspace
          </Link>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition"
          >
            <span>Start your learning path</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </header>
  );
}
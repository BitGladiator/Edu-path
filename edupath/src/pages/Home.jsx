import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Workflow from "../components/Workflow";
import Features from "../components/Features";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfbf9]">
      <Navbar />
      <Hero />
      <Workflow />
      <Features />

      {/* Progress Section Preview */}
      <section id="progress" className="py-16 sm:py-20 border-b border-zinc-200/70 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
                Progress & Readiness
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
                Real-time clarity on your career readiness.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
                As you complete practice tasks and projects, EduPath dynamically
                recalculates your role readiness and adjusts your remaining study time.
              </p>

              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  <span>Explore the learning dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-lg border border-zinc-200 bg-[#fbfbf9]">
                <div className="flex items-center justify-between text-xs pb-3 mb-4 border-b border-zinc-200/80">
                  <span className="font-semibold text-zinc-900">
                    Data Analyst Readiness
                  </span>
                  <span className="font-mono text-zinc-600">32% verified</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Curriculum Completion</span>
                    <span>1 of 5 milestones</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200 overflow-hidden flex">
                    <div className="bg-zinc-900 h-full w-[32%]" />
                    <div className="bg-blue-600 h-full w-[18%]" />
                  </div>
                  <div className="flex gap-4 text-[11px] text-zinc-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-900 inline-block" />
                      Completed (32%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      In progress (18%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                      Remaining (50%)
                    </span>
                  </div>
                </div>

                {/* Quick breakdown */}
                <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200/80 text-center">
                  <div className="p-2 rounded bg-white border border-zinc-200/60">
                    <div className="font-mono text-sm font-semibold text-zinc-900">
                      1
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Completed
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white border border-zinc-200/60">
                    <div className="font-mono text-sm font-semibold text-zinc-900">
                      1
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      In Progress
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white border border-zinc-200/60">
                    <div className="font-mono text-sm font-semibold text-zinc-900">
                      3
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
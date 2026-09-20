import FeatureCard from "./FeatureCard";

export default function Features() {
  const items = [
    {
      category: "Profile Analysis",
      title: "Granular skill auditing",
      description:
        "Breaks down high-level skills into specific capabilities (e.g. SQL joins, window functions, and CTEs instead of simply 'SQL').",
    },
    {
      category: "Gap Prioritization",
      title: "Impact-weighted curriculum",
      description:
        "Orders missing skills by what hiring managers inspect first, eliminating low-value prerequisites.",
    },
    {
      category: "Explainable Learning",
      title: "Contextual AI rationale",
      description:
        "Every module includes an explicit 'Why am I learning this?' explanation tied directly to your profile and target role.",
    },
    {
      category: "Applied Tasks",
      title: "Practical practice tasks",
      description:
        "Hands-on exercises and starter problems instead of passive multiple-choice quizzes.",
    },
    {
      category: "Adaptive Sequence",
      title: "Dynamic progress balancing",
      description:
        "Completing a task recalculates remaining gaps, updates readiness metrics, and activates your next milestone.",
    },
    {
      category: "Portfolio Milestone",
      title: "Verified capstone project",
      description:
        "Synthesizes acquired skills into a production-grade project ready for inclusion in your portfolio.",
    },
  ];

  return (
    <section id="learning-path" className="py-16 sm:py-20 border-b border-zinc-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
            Product Capabilities
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Designed for focused, continuous execution.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
            EduPath acts as a persistent workspace where your learning objectives,
            resources, practice tasks, and skill gaps live in one uncluttered interface.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
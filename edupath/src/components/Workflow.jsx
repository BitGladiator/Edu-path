export default function Workflow() {
  const steps = [
    {
      num: "01",
      title: "Define your target role",
      desc: "Specify your desired role and domain, such as Data Analyst or Systems Engineer.",
    },
    {
      num: "02",
      title: "Profile current capabilities",
      desc: "List your known tools and libraries, or upload a resume for automated parsing.",
    },
    {
      num: "03",
      title: "Identify exact skill gaps",
      desc: "Compare your profile against standard role requirements to isolate verified gaps.",
    },
    {
      num: "04",
      title: "Follow an adaptive path",
      desc: "Work through prioritized objectives, curated documentation, and practical tasks.",
    },
    {
      num: "05",
      title: "Update path dynamically",
      desc: "As you mark objectives complete, future modules and readiness scores rebalance.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 border-b border-zinc-200/70 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
            How it works
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            A structured loop from career goal to daily practice.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
            EduPath does not generate an endless list of generic videos. It identifies
            the minimal high-impact gaps standing between you and your target role.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="border-t border-zinc-200 pt-4 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-zinc-400">
                  {step.num}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-zinc-900 leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
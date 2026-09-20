export default function FeatureCard({ category, title, description }) {
  return (
    <div className="p-5 rounded-md border border-zinc-200/80 bg-white flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {category}
        </span>
        <h3 className="mt-2 text-sm font-semibold text-zinc-900 leading-snug">
          {title}
        </h3>
        <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
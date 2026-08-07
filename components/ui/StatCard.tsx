export function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? "bg-accent/10 border-accent/30" : "bg-card border-white/10"}`}>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-mono text-3xl mt-2">{value}</p>
      {sub && <p className="text-xs text-live mt-1">{sub}</p>}
    </div>
  );
}

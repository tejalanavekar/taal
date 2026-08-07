const COLORS = {
  accent: "bg-accent/15 text-accent border-accent/30",
  live: "bg-live/15 text-live border-live/30",
  virtual: "bg-virtual/15 text-virtual border-virtual/30",
  rating: "bg-rating/15 text-rating border-rating/30",
  muted: "bg-white/5 text-muted border-white/10",
} as const;

export function Badge({
  children,
  color = "muted",
}: {
  children: React.ReactNode;
  color?: keyof typeof COLORS;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLORS[color]}`}>
      {children}
    </span>
  );
}

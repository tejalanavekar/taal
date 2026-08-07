"use client";

import { useMemo, useState } from "react";
import { WorkshopCard, type ExploreWorkshop } from "@/components/workshop/WorkshopCard";

export function ExploreClient({ workshops }: { workshops: ExploreWorkshop[] }) {
  const [style, setStyle] = useState("all");
  const [level, setLevel] = useState("all");
  const [format, setFormat] = useState<"all" | "inperson" | "virtual">("all");

  const styles = useMemo(() => Array.from(new Set(workshops.map((w) => w.style))), [workshops]);

  const filtered = workshops.filter(
    (w) =>
      (style === "all" || w.style === style) &&
      (level === "all" || w.level === level) &&
      (format === "all" || w.format === format)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All styles</option>
          {styles.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <div className="flex rounded-xl border border-white/10 overflow-hidden text-sm">
          {(["all", "inperson", "virtual"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-2 ${format === f ? "bg-accent/15 text-accent" : "text-muted hover:bg-white/5"}`}
            >
              {f === "all" ? "All" : f === "inperson" ? "In-person" : "Virtual"}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted ml-auto">{filtered.length} workshops</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-muted text-sm">No workshops match those filters yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <WorkshopCard key={w.id} workshop={w} />
          ))}
        </div>
      )}
    </div>
  );
}

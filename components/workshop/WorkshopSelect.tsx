"use client";

import { useRouter } from "next/navigation";

export function WorkshopSelect({
  workshops,
  selected,
}: {
  workshops: { id: string; title: string }[];
  selected?: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selected ?? ""}
      onChange={(e) => router.push(`/attendees?workshop=${e.target.value}`)}
      className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-accent"
    >
      <option value="" disabled>
        Select a workshop
      </option>
      {workshops.map((w) => (
        <option key={w.id} value={w.id}>
          {w.title}
        </option>
      ))}
    </select>
  );
}

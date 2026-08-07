import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export type ExploreWorkshop = {
  id: string;
  title: string;
  style: string;
  level: string;
  songs: string[] | null;
  workshop_date: string;
  workshop_time: string;
  format: "inperson" | "virtual";
  venue: string | null;
  city: string;
  price: number;
  capacity: number;
  booked_count: number;
  // Without generated Supabase types, nested selects come back typed as
  // arrays even for a to-one relationship (workshop -> one instructor ->
  // one profile) — this matches the real runtime shape, one-item arrays.
  instructors: { rating: number | null; profiles: { name: string | null }[] }[];
};

function initials(name?: string | null) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WorkshopCard({ workshop }: { workshop: ExploreWorkshop }) {
  const instructorName = workshop.instructors[0]?.profiles[0]?.name ?? "Instructor";
  const seatsLeft = workshop.capacity - workshop.booked_count;

  return (
    <Link
      href={`/workshop/${workshop.id}`}
      className="block rounded-2xl bg-card border border-white/10 p-5 hover:border-accent/40 transition"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent-gradient flex items-center justify-center text-xs font-bold">
          {initials(instructorName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge color="accent">{workshop.style}</Badge>
            <Badge color="muted">{workshop.level}</Badge>
            {workshop.format === "virtual" && <Badge color="virtual">VIRTUAL</Badge>}
          </div>
          <p className="font-semibold truncate">{workshop.title}</p>
          {workshop.songs && workshop.songs.length > 0 && (
            <p className="text-muted text-xs mt-1 truncate">♪ {workshop.songs.join(" · ")}</p>
          )}
          <p className="text-muted text-xs mt-1">
            {workshop.workshop_date} · {workshop.workshop_time} ·{" "}
            {workshop.format === "virtual" ? "Online" : workshop.venue ?? workshop.city}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <span className="font-mono text-lg">₹{workshop.price}</span>
        <span className="text-xs text-muted">
          {seatsLeft > 0 ? `${seatsLeft} seats left` : "Sold out"}
        </span>
      </div>
    </Link>
  );
}

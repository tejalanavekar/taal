import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

const STATUS_COLOR = {
  live: "live",
  draft: "muted",
  past: "muted",
  cancelled: "muted",
} as const;

export default async function WorkshopsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", userData.user!.id)
    .single();

  const { data: workshops } = await supabase
    .from("workshops")
    .select("id, title, style, level, format, status, workshop_date, workshop_time, venue, city, price, capacity, booked_count")
    .eq("instructor_id", instructor?.id ?? "")
    .order("workshop_date", { ascending: false });

  const list = workshops ?? [];

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl">My workshops</h1>
        <Link
          href="/workshops/new"
          className="text-sm font-semibold rounded-lg px-4 py-2 bg-gradient-to-r from-accent to-accent-gradient"
        >
          + New workshop
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-muted text-sm">No workshops yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((w) => (
            <div key={w.id} className="rounded-2xl bg-card border border-white/10 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge color="accent">{w.style}</Badge>
                  <Badge color="muted">{w.level}</Badge>
                  <Badge color={w.format === "virtual" ? "virtual" : "muted"}>
                    {w.format === "virtual" ? "VIRTUAL" : "IN-PERSON"}
                  </Badge>
                  <Badge color={STATUS_COLOR[w.status as keyof typeof STATUS_COLOR] ?? "muted"}>
                    {w.status}
                  </Badge>
                </div>
                <p className="font-semibold">{w.title}</p>
                <p className="text-muted text-xs mt-1">
                  {w.workshop_date} · {w.workshop_time} · {w.venue ?? w.city}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg">₹{w.price}</p>
                <p className="text-muted text-xs">
                  {w.booked_count}/{w.capacity} booked
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

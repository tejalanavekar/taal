import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";

const STATUS_COLOR = {
  live: "live",
  draft: "muted",
  past: "muted",
  cancelled: "muted",
} as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id, rating, review_count, follower_count")
    .eq("user_id", userData.user!.id)
    .single();

  const { data: workshops } = await supabase
    .from("workshops")
    .select("id, title, status, workshop_date, workshop_time, venue, city, price, capacity, booked_count")
    .eq("instructor_id", instructor?.id ?? "")
    .order("workshop_date", { ascending: true });

  const list = workshops ?? [];
  const totalBookings = list.reduce((sum, w) => sum + (w.booked_count ?? 0), 0);
  const totalRevenue = list.reduce((sum, w) => sum + (w.booked_count ?? 0) * w.price, 0);

  return (
    <main className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} highlight />
        <StatCard label="Total bookings" value={String(totalBookings)} />
        <StatCard label="Avg rating" value={(instructor?.rating ?? 0).toFixed(1)} sub={`from ${instructor?.review_count ?? 0} reviews`} />
        <StatCard label="Followers" value={String(instructor?.follower_count ?? 0)} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl">Upcoming workshops</h2>
          <Link href="/workshops" className="text-xs text-accent font-medium">
            View all →
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-muted text-sm">No workshops yet.</p>
            <Link href="/workshops/new" className="text-accent text-sm font-medium mt-2 inline-block">
              Create your first workshop →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-muted text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Workshop</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Attendees</th>
                  <th className="text-left px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 5).map((w) => (
                  <tr key={w.id} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      <p className="font-medium">{w.title}</p>
                      <p className="text-muted text-xs mt-0.5">
                        {w.workshop_date} · {w.workshop_time} · {w.venue ?? w.city}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={STATUS_COLOR[w.status as keyof typeof STATUS_COLOR] ?? "muted"}>
                        {w.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {w.booked_count}/{w.capacity}
                    </td>
                    <td className="px-4 py-3 font-mono">₹{((w.booked_count ?? 0) * w.price).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

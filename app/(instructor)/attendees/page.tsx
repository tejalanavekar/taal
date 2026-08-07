import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { WorkshopSelect } from "@/components/workshop/WorkshopSelect";

const STATUS_COLOR = {
  attended: "live",
  confirmed: "accent",
  pending: "muted",
  cancelled: "muted",
} as const;

export default async function AttendeesPage({
  searchParams,
}: {
  searchParams: Promise<{ workshop?: string }>;
}) {
  const { workshop: workshopId } = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", userData.user!.id)
    .single();

  const { data: workshops } = await supabase
    .from("workshops")
    .select("id, title")
    .eq("instructor_id", instructor?.id ?? "")
    .order("workshop_date", { ascending: false });

  const activeId = workshopId ?? workshops?.[0]?.id;

  const { data: bookings } = activeId
    ? await supabase
        .from("bookings")
        .select("id, status, amount_paid, created_at, profiles(name, email)")
        .eq("workshop_id", activeId)
    : { data: [] };

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl">Attendees</h1>
        {workshops && workshops.length > 0 && (
          <WorkshopSelect workshops={workshops} selected={activeId} />
        )}
      </div>

      {!activeId ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-muted text-sm">Create a workshop first to see attendees here.</p>
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-muted text-sm">No bookings yet for this workshop.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-muted text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Dancer</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Paid</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.profiles?.name ?? "Unnamed"}</p>
                    <p className="text-muted text-xs">{b.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={STATUS_COLOR[b.status as keyof typeof STATUS_COLOR] ?? "muted"}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono">₹{b.amount_paid ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
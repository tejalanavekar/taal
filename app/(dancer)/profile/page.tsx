import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ProfileBasicsForm } from "@/components/ui/ProfileBasicsForm";

const STATUS_COLOR = {
  attended: "live",
  confirmed: "accent",
  pending: "muted",
  cancelled: "muted",
} as const;

export default async function DancerProfilePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user!.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, city, email")
    .eq("id", userId)
    .single();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, workshops(title, workshop_date, workshop_time)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: follows } = await supabase
    .from("follows")
    .select("instructor_id, instructors(tagline, profiles(name))")
    .eq("follower_id", userId);

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="font-heading text-3xl mb-1">Your profile</h1>
      <p className="text-muted text-sm mb-6">{profile?.email ?? "Browsing as guest"}</p>

      <ProfileBasicsForm initialName={profile?.name ?? ""} initialCity={profile?.city ?? ""} />

      <div className="mt-10">
        <h2 className="font-heading text-xl mb-3">Your bookings</h2>
        {!bookings || bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-muted text-sm">No bookings yet.</p>
            <Link href="/explore" className="text-accent text-sm font-medium mt-2 inline-block">
              Explore workshops →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-xl bg-card border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{b.workshops?.[0]?.title}</p>
                  <p className="text-muted text-xs">
                    {b.workshops?.[0]?.workshop_date} · {b.workshops?.[0]?.workshop_time}
                  </p>
                </div>
                <Badge color={STATUS_COLOR[b.status as keyof typeof STATUS_COLOR] ?? "muted"}>{b.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl mb-3">Following</h2>
        {!follows || follows.length === 0 ? (
          <p className="text-muted text-sm">You're not following any instructors yet.</p>
        ) : (
          <div className="space-y-2">
            {follows.map((f) => (
              <div key={f.instructor_id} className="rounded-xl bg-card border border-white/10 p-4">
                <p className="font-medium text-sm">{f.instructors?.[0]?.profiles?.[0]?.name}</p>
                <p className="text-muted text-xs">{f.instructors?.[0]?.tagline}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

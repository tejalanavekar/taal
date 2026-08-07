import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { getYoutubeEmbedUrl } from "@/lib/utils";

function initials(name?: string | null) {
  if (!name) return "??";
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: workshop } = await supabase
    .from("workshops")
    .select(
      "id, title, style, level, songs, workshop_date, workshop_time, format, venue, city, price, capacity, booked_count, video_preview_url, notes, instructors(id, bio, tagline, instagram_handle, rating, review_count, profiles(name))"
    )
    .eq("id", id)
    .single();

  if (!workshop) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, review_text, tags, created_at, profiles(name)")
    .eq("workshop_id", id)
    .order("created_at", { ascending: false });

  const instructor = workshop.instructors?.[0];
  const instructorProfile = instructor?.profiles?.[0];
  const embedUrl = workshop.video_preview_url ? getYoutubeEmbedUrl(workshop.video_preview_url) : null;
  const seatsLeft = workshop.capacity - workshop.booked_count;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <Link href="/explore" className="text-xs text-muted hover:text-foreground">
        ← Back to explore
      </Link>

      <div className="flex flex-wrap items-center gap-1.5 mt-4">
        <Badge color="accent">{workshop.style}</Badge>
        <Badge color="muted">{workshop.level}</Badge>
        {workshop.format === "virtual" && <Badge color="virtual">VIRTUAL</Badge>}
      </div>
      <h1 className="font-heading text-3xl mt-3">{workshop.title}</h1>

      {embedUrl ? (
        <div className="mt-5 aspect-video rounded-2xl overflow-hidden border border-white/10">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : workshop.video_preview_url ? (
        <a
          href={workshop.video_preview_url}
          target="_blank"
          className="mt-5 block rounded-2xl border border-white/10 p-4 text-sm text-accent hover:bg-white/5"
        >
          Watch preview →
        </a>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl bg-card border border-white/10 p-5">
          <p className="text-xs uppercase text-muted mb-2">Details</p>
          <p className="text-sm">{workshop.workshop_date} · {workshop.workshop_time}</p>
          <p className="text-sm text-muted mt-1">
            {workshop.format === "virtual" ? "Online — link shared after booking" : workshop.venue ?? workshop.city}
          </p>
          {workshop.songs && workshop.songs.length > 0 && (
            <p className="text-sm text-muted mt-2">♪ {workshop.songs.join(" · ")}</p>
          )}
          {workshop.notes && <p className="text-sm text-muted mt-2">{workshop.notes}</p>}
        </div>

        <div className="rounded-2xl bg-card border border-white/10 p-5">
          <p className="text-xs uppercase text-muted mb-2">Instructor</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-gradient flex items-center justify-center text-xs font-bold">
              {initials(instructorProfile?.name)}
            </div>
            <div>
              <p className="font-medium text-sm">{instructorProfile?.name ?? "Instructor"}</p>
              <p className="text-muted text-xs">{instructor?.tagline}</p>
            </div>
          </div>
          <p className="text-sm text-rating mt-3">★ {(instructor?.rating ?? 0).toFixed(1)} ({instructor?.review_count ?? 0} reviews)</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 rounded-2xl bg-card border border-white/10 p-5">
        <div>
          <p className="font-mono text-2xl">₹{workshop.price}</p>
          <p className="text-xs text-muted">{seatsLeft > 0 ? `${seatsLeft} seats left` : "Sold out"}</p>
        </div>
        <button
          disabled
          title="Booking opens soon — Razorpay integration pending"
          className="rounded-xl px-6 py-3 text-sm font-semibold bg-gradient-to-r from-accent to-accent-gradient disabled:opacity-40"
        >
          Book now
        </button>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-xl mb-3">Reviews</h2>
        {!reviews || reviews.length === 0 ? (
          <p className="text-muted text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl bg-card border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.profiles?.[0]?.name ?? "Dancer"}</p>
                  <p className="text-rating text-sm">★ {r.rating}</p>
                </div>
                {r.review_text && <p className="text-muted text-sm mt-1">{r.review_text}</p>}
                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.tags.map((t: string) => (
                      <Badge key={t} color="muted">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

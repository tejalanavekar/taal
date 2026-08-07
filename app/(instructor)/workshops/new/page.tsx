"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Format = "inperson" | "virtual";
type Level = "beginner" | "intermediate" | "advanced";

export default function NewWorkshopPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [songs, setSongs] = useState("");
  const [workshopDate, setWorkshopDate] = useState("");
  const [workshopTime, setWorkshopTime] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [format, setFormat] = useState<Format>("inperson");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent, status: "draft" | "live") {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      setError("Not signed in.");
      return;
    }

    const { data: instructor } = await supabase
      .from("instructors")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (!instructor) {
      setLoading(false);
      setError("Instructor profile not found.");
      return;
    }

    const { error } = await supabase.from("workshops").insert({
      instructor_id: instructor.id,
      title,
      style,
      level,
      songs: songs.split(",").map((s) => s.trim()).filter(Boolean),
      workshop_date: workshopDate,
      workshop_time: workshopTime,
      price: Number(price),
      capacity: Number(capacity),
      format,
      venue: format === "inperson" ? venue : null,
      city,
      video_preview_url: videoPreviewUrl || null,
      notes: notes || null,
      status,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-3xl text-accent">New workshop</h1>
        <p className="text-muted text-sm mt-1">Fill in the details, save as draft or publish now.</p>

        <form className="space-y-4 mt-6">
          <input
            required
            placeholder="Title, e.g. Bollywood Beginners"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Style, e.g. Bollywood"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <input
            placeholder="Songs, comma separated"
            value={songs}
            onChange={(e) => setSongs(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="date"
              value={workshopDate}
              onChange={(e) => setWorkshopDate(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              required
              type="time"
              value={workshopTime}
              onChange={(e) => setWorkshopTime(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              min={0}
              placeholder="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              required
              type="number"
              min={1}
              placeholder="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat("inperson")}
              className={`rounded-xl p-3 text-sm border transition ${
                format === "inperson" ? "border-accent bg-accent/10" : "border-white/10"
              }`}
            >
              In-person
            </button>
            <button
              type="button"
              onClick={() => setFormat("virtual")}
              className={`rounded-xl p-3 text-sm border transition ${
                format === "virtual" ? "border-virtual bg-virtual/10" : "border-white/10"
              }`}
            >
              Virtual
            </button>
          </div>

          {format === "inperson" && (
            <input
              placeholder="Venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
            />
          )}

          <input
            required
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />

          <input
            placeholder="YouTube or Instagram Reel link"
            value={videoPreviewUrl}
            onChange={(e) => setVideoPreviewUrl(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />

          <textarea
            placeholder="Notes for attendees"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />

          {error && <p className="text-xs text-accent">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "draft")}
              className="flex-1 rounded-xl py-3 text-sm font-semibold border border-white/10 hover:bg-white/5 disabled:opacity-50"
            >
              Save as draft
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "live")}
              className="flex-1 rounded-xl py-3 text-sm font-semibold bg-gradient-to-r from-accent to-accent-gradient disabled:opacity-50"
            >
              {loading ? "Saving…" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

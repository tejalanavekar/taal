"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  name: string;
  city: string;
  bio: string;
  tagline: string;
  instagramHandle: string;
  styles: string;
};

export function InstructorProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city);
  const [bio, setBio] = useState(initial.bio);
  const [tagline, setTagline] = useState(initial.tagline);
  const [instagramHandle, setInstagramHandle] = useState(initial.instagramHandle);
  const [styles, setStyles] = useState(initial.styles);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user!.id;

    await supabase.from("profiles").update({ name, city }).eq("id", userId);
    await supabase
      .from("instructors")
      .update({
        bio,
        tagline,
        instagram_handle: instagramHandle,
        styles: styles.split(",").map((s) => s.trim()).filter(Boolean),
      })
      .eq("user_id", userId);

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <input
        placeholder="Tagline, e.g. Bollywood & Contemporary"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
      />

      <textarea
        placeholder="Bio"
        rows={4}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
      />

      <input
        placeholder="Instagram handle (without @)"
        value={instagramHandle}
        onChange={(e) => setInstagramHandle(e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
      />

      <input
        placeholder="Styles, comma separated"
        value={styles}
        onChange={(e) => setStyles(e.target.value)}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-6 py-3 text-sm font-semibold bg-gradient-to-r from-accent to-accent-gradient disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-xs text-live">Saved.</span>}
      </div>
    </form>
  );
}

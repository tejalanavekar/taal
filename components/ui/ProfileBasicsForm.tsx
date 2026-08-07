"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ProfileBasicsForm({ initialName, initialCity }: { initialName: string; initialCity: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState(initialCity);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ name, city }).eq("id", userData.user!.id);
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs text-muted block mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-xs text-muted block mb-1">City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-accent to-accent-gradient disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save"}
      </button>
      {saved && <span className="text-xs text-live">Saved.</span>}
    </form>
  );
}

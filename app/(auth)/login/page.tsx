"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const justCreated = searchParams.get("created") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No role cookie here on purpose: an existing user's role already lives in
  // the database. The callback route checks profiles.role_selected and, if
  // it's already true, skips straight home without asking again.
  async function handleGoogleSignin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function handleGuest() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/explore");
    router.refresh();
  }

  async function handleEmailSignin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const { data } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user!.id)
      .single();

    setLoading(false);
    router.push(profile?.role === "instructor" ? "/dashboard" : "/explore");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8">
        <h1 className="font-heading text-4xl text-accent text-center">Taal</h1>
        <p className="text-muted text-sm text-center mt-2">
          dance workshops · discover · book · create
        </p>

        {justCreated && (
          <p className="text-xs text-live text-center mt-6 rounded-xl border border-live/30 bg-live/10 py-2">
            Account created — sign in below to continue.
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleSignin}
          className="mt-8 w-full rounded-xl border border-white/10 py-3 font-medium hover:bg-white/5 transition"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-muted">or sign in with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleEmailSignin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />

          {error && <p className="text-xs text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-accent to-accent-gradient disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4 text-xs">
          <Link href="/signup" className="text-muted hover:text-foreground">
            New here? Create account
          </Link>
          <button type="button" onClick={handleGuest} className="text-muted hover:text-foreground">
            Continue as guest →
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

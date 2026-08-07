"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "dancer" | "instructor";

async function ensureInstructorRow(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: existing } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!existing) {
    await supabase.from("instructors").insert({ user_id: userId });
  }
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const needRole = searchParams.get("needRole") === "1";

  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Someone verified with Google but hadn't picked a role yet (e.g. clicked
  // Google before choosing a card). Confirm they still have a session before
  // showing the "finish setup" screen.
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    if (!needRole) return;
    supabase.auth.getUser().then(({ data }) => setHasSession(!!data.user));
  }, [needRole]);

  async function finishRoleOnlyChoice(chosen: Role) {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setLoading(false);
      router.push("/signup");
      return;
    }
    await supabase
      .from("profiles")
      .update({ role: chosen, role_selected: true })
      .eq("id", data.user.id);
    if (chosen === "instructor") {
      await ensureInstructorRow(supabase, data.user.id);
    }
    router.push(chosen === "instructor" ? "/dashboard" : "/explore");
    router.refresh();
  }

  async function handleGoogleSignup() {
    if (!role) return;
    document.cookie = `taal_pending_role=${role}; path=/; max-age=600`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function handleEmailSignup(e: FormEvent) {
    e.preventDefault();
    if (!role) {
      setError("Choose Dancer or Instructor first.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // Confirm email is off in Supabase, so signUp already returns a live
    // session here. We use it just long enough to create the instructor
    // row (RLS requires auth.uid() === user_id), then sign out on purpose
    // and send them to the sign-in form instead of auto-logging them in.
    if (role === "instructor" && data.user) {
      await ensureInstructorRow(supabase, data.user.id);
    }
    if (data.session) {
      await supabase.auth.signOut();
    }

    setLoading(false);
    router.push("/login?created=1");
  }

  if (needRole) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center">
          <h1 className="font-heading text-3xl text-accent">One more step</h1>
          <p className="text-muted text-sm mt-2">
            {hasSession ? "How do you want to use Taal?" : "Verifying…"}
          </p>
          {hasSession && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                disabled={loading}
                onClick={() => finishRoleOnlyChoice("dancer")}
                className="rounded-2xl p-4 text-left border border-white/10 hover:border-accent transition disabled:opacity-50"
              >
                <p className="font-semibold">Dancer</p>
                <p className="text-xs text-muted mt-1">Browse & book workshops</p>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => finishRoleOnlyChoice("instructor")}
                className="rounded-2xl p-4 text-left border border-white/10 hover:border-virtual transition disabled:opacity-50"
              >
                <p className="font-semibold">Instructor</p>
                <p className="text-xs text-muted mt-1">Manage your workshops</p>
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8">
        <h1 className="font-heading text-4xl text-accent text-center">Create account</h1>
        <p className="text-muted text-sm text-center mt-2">Join Taal</p>

        <p className="text-xs uppercase tracking-wide text-muted text-center mt-8 mb-3">
          I am a
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("dancer")}
            className={`rounded-2xl p-4 text-left border transition ${
              role === "dancer"
                ? "border-accent bg-accent/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <p className="font-semibold">Dancer</p>
            <p className="text-xs text-muted mt-1">Browse & book workshops</p>
          </button>
          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`rounded-2xl p-4 text-left border transition ${
              role === "instructor"
                ? "border-virtual bg-virtual/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <p className="font-semibold">Instructor</p>
            <p className="text-xs text-muted mt-1">Manage your workshops</p>
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={!role}
          title={!role ? "Choose Dancer or Instructor first" : undefined}
          className="mt-6 w-full rounded-xl border border-white/10 py-3 font-medium hover:bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-muted">or continue with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-3">
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
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-accent"
          />

          {error && <p className="text-xs text-accent">{error}</p>}
          {info && <p className="text-xs text-live">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-accent to-accent-gradient disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

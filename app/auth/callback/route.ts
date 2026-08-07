import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();
  const pendingRole = cookieStore.get("taal_pending_role")?.value;
  cookieStore.delete("taal_pending_role");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, role_selected")
    .eq("id", data.user.id)
    .single();

  // Returning user: role was already chosen at signup, ignore any stray
  // cookie and just send them home. This is what makes Google sign-IN
  // (as opposed to sign-UP) skip the role step entirely.
  if (profile?.role_selected) {
    return NextResponse.redirect(`${origin}${profile.role === "instructor" ? "/dashboard" : "/explore"}`);
  }

  // New user, no role decided yet, and they didn't come from the signup
  // page's role cards (no cookie) — send them to finish that step.
  if (!pendingRole) {
    return NextResponse.redirect(`${origin}/signup?needRole=1`);
  }

  await supabase
    .from("profiles")
    .update({ role: pendingRole, role_selected: true })
    .eq("id", data.user.id);

  if (pendingRole === "instructor") {
    const { data: existing } = await supabase
      .from("instructors")
      .select("id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("instructors").insert({ user_id: data.user.id });
    }
  }

  return NextResponse.redirect(`${origin}${pendingRole === "instructor" ? "/dashboard" : "/explore"}`);
}

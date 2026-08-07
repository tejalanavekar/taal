import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DancerHeader } from "@/components/layout/DancerHeader";

export default async function DancerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Guests are created with role='dancer' by default, so this check
  // naturally lets them through without any special-casing.
  if (profile?.role !== "dancer") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DancerHeader email={data.user.email} />
      {children}
    </div>
  );
}

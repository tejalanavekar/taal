import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InstructorHeader } from "@/components/layout/InstructorHeader";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "instructor") {
    redirect("/explore");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <InstructorHeader name={profile?.name} />
      {children}
    </div>
  );
}

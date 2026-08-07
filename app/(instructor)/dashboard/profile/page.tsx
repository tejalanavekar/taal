import { createClient } from "@/lib/supabase/server";
import { InstructorProfileForm } from "@/components/instructor/InstructorProfileForm";

export default async function InstructorProfilePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, city")
    .eq("id", userData.user!.id)
    .single();

  const { data: instructor } = await supabase
    .from("instructors")
    .select("bio, tagline, instagram_handle, styles")
    .eq("user_id", userData.user!.id)
    .single();

  return (
    <main className="p-8">
      <h1 className="font-heading text-3xl mb-6">Edit profile</h1>
      <InstructorProfileForm
        initial={{
          name: profile?.name ?? "",
          city: profile?.city ?? "",
          bio: instructor?.bio ?? "",
          tagline: instructor?.tagline ?? "",
          instagramHandle: instructor?.instagram_handle ?? "",
          styles: (instructor?.styles ?? []).join(", "),
        }}
      />
    </main>
  );
}

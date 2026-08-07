import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "@/components/workshop/ExploreClient";

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: workshops } = await supabase
    .from("workshops")
    .select(
      "id, title, style, level, songs, workshop_date, workshop_time, format, venue, city, price, capacity, booked_count, instructors(rating, profiles(name))"
    )
    .eq("status", "live")
    .order("workshop_date", { ascending: true });

  return (
    <main className="p-8">
      <h1 className="font-heading text-3xl mb-6">Explore workshops</h1>
      <ExploreClient workshops={workshops ?? []} />
    </main>
  );
}

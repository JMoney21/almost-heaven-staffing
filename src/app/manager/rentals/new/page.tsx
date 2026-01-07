export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">{children}</div>;
}

export default async function NewRentalPage() {
  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  // Role gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  async function createRentalAction(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServer();

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const image_url = String(formData.get("image_url") ?? "").trim() || null;
    const is_active = formData.get("is_active") === "on";

    const points_per_night = Number(formData.get("points_per_night") ?? 0);
    const points_per_week = Number(formData.get("points_per_week") ?? 0);

    if (!title) redirect("/manager/rentals/new?error=" + encodeURIComponent("Title is required."));
    if (!points_per_night || points_per_night <= 0)
      redirect("/manager/rentals/new?error=" + encodeURIComponent("Points per night must be > 0."));
    if (!points_per_week || points_per_week <= 0)
      redirect("/manager/rentals/new?error=" + encodeURIComponent("Points per week must be > 0."));

    const { data, error } = await supabase
      .from("rentals")
      .insert({
        title,
        description: description || null,
        location: location || null,
        image_url,
        points_per_night,
        points_per_week,
        is_active,
      })
      .select("id")
      .single();

    if (error) redirect("/manager/rentals/new?error=" + encodeURIComponent(error.message));

    redirect(`/manager/rentals/${data.id}/edit?success=` + encodeURIComponent("Rental created."));
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Add Rental</h1>
          <Link href="/manager/rentals" className="text-sm font-extrabold text-white/80 hover:underline">
            ← Back
          </Link>
        </div>

        <Card>
          <form action={createRentalAction} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Title</label>
              <input name="title" required className="mt-2 w-full rounded-xl border p-3 font-semibold" />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Location</label>
              <input name="location" className="mt-2 w-full rounded-xl border p-3 font-semibold" />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Description</label>
              <textarea name="description" rows={5} className="mt-2 w-full rounded-xl border p-3 font-semibold" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-extrabold text-slate-700">Points per night</label>
                <input
                  name="points_per_night"
                  type="number"
                  min="1"
                  step="1"
                  required
                  className="mt-2 w-full rounded-xl border p-3 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700">Points per week</label>
                <input
                  name="points_per_week"
                  type="number"
                  min="1"
                  step="1"
                  required
                  className="mt-2 w-full rounded-xl border p-3 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Image URL (optional)</label>
              <input name="image_url" className="mt-2 w-full rounded-xl border p-3 font-semibold" />
              <div className="mt-1 text-xs font-semibold text-slate-500">
                You can upload an image after creating the rental.
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
              <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4" />
              Active (visible to employees)
            </label>

            <button className="w-full rounded-xl bg-[#F6B400] py-3 font-black text-[#0B2545]">Create Rental</button>
          </form>
        </Card>
      </div>
    </div>
  );
}

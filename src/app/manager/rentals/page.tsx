export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">{children}</div>;
}

export default async function ManagerRentalsPage() {
  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  // Role gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  const { data: rentals, error } = await supabase
    .from("rentals")
    .select("id, title, location, is_active, points_per_night, points_per_week, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Rentals</h1>
            <p className="mt-1 text-sm font-semibold text-white/70">
              Create rentals, upload photos, and review booking dates.
            </p>
          </div>

          <Link
            href="/manager/rentals/new"
            className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
          >
            + Add Rental
          </Link>
        </div>

        {error ? (
          <pre className="rounded-2xl bg-white/10 p-4 text-xs text-white whitespace-pre-wrap">{error.message}</pre>
        ) : null}

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0B2B55]">All Rentals</h2>
            <div className="text-xs font-bold text-slate-500">{rentals?.length ?? 0} total</div>
          </div>

          <div className="mt-5 space-y-3">
            {(rentals ?? []).length ? (
              rentals!.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <div className="font-extrabold">{r.title}</div>
                    <div className="text-sm font-semibold text-slate-600">
                      {(r.location ?? "—")} • {r.is_active ? "Active" : "Inactive"}
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-500">
                      {r.points_per_night} pts/night • {r.points_per_week} pts/week
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/manager/rentals/${r.id}/edit`}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/manager/rentals/${r.id}/bookings`}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-900"
                    >
                      Bookings
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm font-semibold text-slate-600">
                No rentals yet. Click <b>+ Add Rental</b>.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

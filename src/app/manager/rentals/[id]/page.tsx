export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">{children}</div>;
}

export default async function ManagerRentalDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  // Role gate
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  // Rental
  const { data: rental, error: rentalErr } = await supabase
    .from("rentals")
    .select("id, title, description, location, image_url, points_per_night, points_per_week, is_active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (rentalErr || !rental) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <div className="text-lg font-black text-[#0B2B55]">Rental not found</div>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
              {rentalErr?.message ?? "No rental row returned"}
            </pre>
            <Link href="/manager/rentals" className="mt-4 inline-block text-sm font-extrabold text-slate-700 underline">
              Back to rentals
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Upcoming bookings (optional)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { data: upcomingBookings } = await supabase
    .from("rental_bookings")
    .select("id, start_date, end_date, status, points_cost, employee_id")
    .eq("rental_id", id)
    .eq("status", "booked")
    .gte("end_date", today)
    .order("start_date", { ascending: true })
    .limit(8);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">{rental.title}</h1>
            <p className="mt-1 text-sm font-semibold text-white/70">{rental.location ?? "—"}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/manager/rentals" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white">
              ← Rentals
            </Link>
            <Link
              href={`/manager/rentals/${rental.id}/bookings`}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-900"
            >
              Bookings
            </Link>
            <Link
              href={`/manager/rentals/${rental.id}/edit`}
              className="rounded-xl bg-[#F6B400] px-4 py-2 text-sm font-black text-[#0B2545] hover:brightness-95"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Image + summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              {rental.image_url ? (
                <div className="overflow-hidden rounded-2xl border bg-slate-50">
                  <img src={rental.image_url} alt={rental.title} className="h-72 w-full object-cover" />
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-8 text-sm font-semibold text-slate-500">
                  No photo uploaded yet.
                </div>
              )}

              {rental.description ? (
                <div className="mt-5 text-sm font-semibold text-slate-700 leading-relaxed">{rental.description}</div>
              ) : (
                <div className="mt-5 text-sm font-semibold text-slate-500">No description.</div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#0B2B55]">Upcoming Bookings</h2>
                <Link
                  href={`/manager/rentals/${rental.id}/bookings`}
                  className="text-xs font-extrabold text-slate-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {(upcomingBookings ?? []).length ? (
                  upcomingBookings!.map((b: any) => (
                    <div key={b.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-black">
                            {b.start_date} → {b.end_date}
                            <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-extrabold text-white">
                              {String(b.status ?? "").toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-600">
                            Cost: <span className="font-black">{b.points_cost}</span> points
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">employee_id: {b.employee_id}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-600">No upcoming bookings.</div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: stats */}
          <div className="space-y-6">
            <Card>
              <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Status</div>
              <div className="mt-2 text-lg font-black text-slate-900">
                {rental.is_active ? "Active" : "Inactive"}
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-extrabold text-slate-500">Points per night</div>
                  <div className="mt-1 text-2xl font-black text-slate-900">{rental.points_per_night}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-extrabold text-slate-500">Points per week</div>
                  <div className="mt-1 text-2xl font-black text-slate-900">{rental.points_per_week}</div>
                </div>
              </div>

              <div className="mt-4 text-xs font-semibold text-slate-500">
                Created: {rental.created_at ? new Date(rental.created_at).toLocaleString() : "—"}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

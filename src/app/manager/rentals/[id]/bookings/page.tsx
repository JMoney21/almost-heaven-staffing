export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">{children}</div>;
}

export default async function RentalBookingsPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  // Role gate
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  const { data: rental } = await supabase.from("rentals").select("id, title").eq("id", id).maybeSingle();

  const { data: bookings, error } = await supabase
    .from("rental_bookings")
    .select("id, start_date, end_date, status, points_cost, employee_id, created_at")
    .eq("rental_id", id)
    .order("start_date", { ascending: true });

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Bookings</h1>
            <p className="text-sm font-semibold text-white/70">{rental?.title ?? "Rental"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/manager/rentals" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white">
              ← Rentals
            </Link>
            <Link
              href={`/manager/rentals/${id}/edit`}
              className="rounded-xl bg-[#F6B400] px-4 py-2 text-sm font-black text-[#0B2545]"
            >
              Edit Rental
            </Link>
          </div>
        </div>

        <Card>
          {error ? (
            <pre className="whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
              {error.message}
            </pre>
          ) : null}

          <div className="mt-2 space-y-3">
            {(bookings ?? []).length ? (
              bookings!.map((b: any) => (
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
                        Points cost: <span className="font-black">{b.points_cost}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">employee_id: {b.employee_id}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      {b.created_at ? new Date(b.created_at).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm font-semibold text-slate-600">No bookings yet.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

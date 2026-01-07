// src/app/employee/store/rentals/[id]/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { bookRentalAction } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
};

function safeDecode(value?: string) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white ring-1 ring-white/15">
      {children}
    </span>
  );
}

function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-black text-[#0B2B55]">{title}</h2>
        {right ? right : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function fmtRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return `${s.toLocaleDateString()} → ${e.toLocaleDateString()}`;
}

function diffNights(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const ms = e.getTime() - s.getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export default async function EmployeeRentalDetailPage({ params, searchParams }: PageProps) {
  const { id: rentalId } = await params;
  const sp = searchParams ? await searchParams : undefined;

  const errorMsg = safeDecode(sp?.error);
  const successMsg = safeDecode(sp?.success);

  if (!rentalId) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Missing rental ID</h1>
      </div>
    );
  }

  const supabase = await createSupabaseServer();

  // AUTH (employee portal)
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/employee/login");

  // ✅ AUTO-LINK / AUTO-CREATE EMPLOYEE ROW
  // NOTE: Requires manager_user_id nullable + INSERT RLS policy if auto-create is enabled.
  let employeeId: string | null = null;
  let employeeName: string | null = null;

  const { data: employeeExisting, error: empFindErr } = await supabase
    .from("employees")
    .select("id, full_name, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (empFindErr) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-2xl font-black">Employee lookup failed</h1>
          <pre className="rounded-2xl bg-white/10 p-4 text-xs whitespace-pre-wrap">
            {JSON.stringify(empFindErr, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (employeeExisting?.id) {
    employeeId = employeeExisting.id;
    employeeName = employeeExisting.full_name ?? null;
  } else {
    // Try link by email
    const authEmail = user.email ?? "";
    if (authEmail) {
      const { data: byEmail, error: byEmailErr } = await supabase
        .from("employees")
        .select("id, full_name, user_id")
        .eq("email", authEmail)
        .maybeSingle();

      if (byEmailErr) {
        return (
          <div className="min-h-screen bg-[#061A33] p-10 text-white">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="text-2xl font-black">Employee email lookup failed</h1>
              <pre className="rounded-2xl bg-white/10 p-4 text-xs whitespace-pre-wrap">
                {JSON.stringify(byEmailErr, null, 2)}
              </pre>
            </div>
          </div>
        );
      }

      if (byEmail?.id) {
        if (byEmail.user_id && byEmail.user_id !== user.id) {
          return (
            <div className="min-h-screen bg-[#061A33] p-10 text-white">
              <div className="mx-auto max-w-3xl space-y-4">
                <h1 className="text-2xl font-black">Account not linked</h1>
                <p className="text-sm font-semibold text-white/80">
                  We found an employee row with your email, but it’s already linked to a different user.
                </p>
                <div className="rounded-2xl bg-white/10 p-4 text-xs font-bold">
                  Ask an admin to fix employees.user_id for this email.
                </div>
              </div>
            </div>
          );
        }

        const { error: linkErr } = await supabase
          .from("employees")
          .update({ user_id: user.id })
          .eq("id", byEmail.id);

        if (linkErr) {
          return (
            <div className="min-h-screen bg-[#061A33] p-10 text-white">
              <div className="mx-auto max-w-3xl space-y-4">
                <h1 className="text-2xl font-black">Could not link employee</h1>
                <pre className="rounded-2xl bg-white/10 p-4 text-xs whitespace-pre-wrap">
                  {JSON.stringify(linkErr, null, 2)}
                </pre>
              </div>
            </div>
          );
        }

        employeeId = byEmail.id;
        employeeName = byEmail.full_name ?? null;
      }
    }

    // Create employee row if still not found
    if (!employeeId) {
      const fullName =
        (user.user_metadata as any)?.full_name ??
        (user.user_metadata as any)?.name ??
        user.email ??
        "Employee";

      const { data: created, error: createErr } = await supabase
        .from("employees")
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: fullName,
          status: "active",
          disabled: false,
        })
        .select("id, full_name")
        .single();

      if (createErr) {
        return (
          <div className="min-h-screen bg-[#061A33] p-10 text-white">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="text-2xl font-black">Could not create employee row</h1>
              <pre className="rounded-2xl bg-white/10 p-4 text-xs whitespace-pre-wrap">
                {JSON.stringify(createErr, null, 2)}
              </pre>
              <div className="text-xs font-semibold text-white/70">
                Fixes:
                {"\n"}• Make employees.manager_user_id nullable OR include it on insert
                {"\n"}• Add INSERT RLS policy for employees (with check user_id = auth.uid())
              </div>
            </div>
          </div>
        );
      }

      employeeId = created.id;
      employeeName = created.full_name ?? null;
    }
  }

  if (!employeeId) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="mx-auto max-w-3xl space-y-3">
          <h1 className="text-2xl font-black">Employee record not found</h1>
          <p className="text-sm font-semibold text-white/80">
            Your login is valid, but we couldn’t create or link an employee row.
          </p>
        </div>
      </div>
    );
  }

  // Points balance (sum points_transactions)
  const { data: ptsRows, error: ptsErr } = await supabase
    .from("points_transactions")
    .select("points")
    .eq("employee_id", employeeId);

  const pointsBalance = ptsErr
    ? 0
    : (ptsRows ?? []).reduce((sum: number, r: any) => sum + (Number(r.points) || 0), 0);

  // ✅ Rental details (ONLY columns that must exist)
  const { data: rental, error: rentalErr } = await supabase
    .from("rentals")
    .select("id, title, description, location, image_url, points_per_night, is_active")
    .eq("id", rentalId)
    .maybeSingle();

  if (rentalErr || !rental) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-2xl font-black">Rental not found</h1>
          <pre className="rounded-2xl bg-white/10 p-4 text-xs whitespace-pre-wrap">
            rentalId: {rentalId}
            {"\n\n"}
            {rentalErr ? JSON.stringify(rentalErr, null, 2) : "No rental row returned"}
          </pre>
        </div>
      </div>
    );
  }

  if (!rental.is_active) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-2xl font-black">This rental is not currently available</h1>
          <Link
            href="/employee/store/rentals"
            className="inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            ← Back to rentals
          </Link>
        </div>
      </div>
    );
  }

  // Bookings
  const { data: bookings, error: bookingsErr } = await supabase
    .from("rental_bookings")
    .select("id, start_date, end_date, status, points_cost, created_at")
    .eq("rental_id", rentalId)
    .eq("status", "booked")
    .order("start_date", { ascending: true });

  // Defaults: tomorrow -> +2 nights
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().slice(0, 10);
  const defaultEndObj = new Date(tomorrow);
  defaultEndObj.setDate(defaultEndObj.getDate() + 2);
  const defaultEnd = defaultEndObj.toISOString().slice(0, 10);

  const perNight = Number(rental.points_per_night ?? 0);

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        {errorMsg ? <div className="rounded-xl bg-amber-500/20 p-3 text-xs font-bold">{errorMsg}</div> : null}
        {successMsg ? <div className="rounded-xl bg-emerald-500/20 p-3 text-xs font-bold">{successMsg}</div> : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Link
              href="/employee/store/rentals"
              className="inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              ← Back to rentals
            </Link>

            <h1 className="text-3xl font-black">{rental.title}</h1>
            <div className="flex flex-wrap gap-2">
              {rental.location ? <Pill>{rental.location}</Pill> : null}
              <Pill>{perNight} pts / night</Pill>
              <Pill>My points: {pointsBalance}</Pill>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
            <div className="text-xs font-extrabold uppercase tracking-wide text-white/70">Signed in as</div>
            <div className="text-sm font-black text-white">{employeeName ?? "Employee"}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/15">
              <div className="aspect-[16/9] w-full bg-black/20">
                {rental.image_url ? (
                  <img src={rental.image_url} alt={rental.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/60 font-bold">No image uploaded</div>
                )}
              </div>
            </div>

            {rental.description ? (
              <div className="mt-5 rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
                <div className="text-sm font-black text-[#0B2B55]">About this stay</div>
                <p className="mt-3 text-sm font-semibold text-slate-700 leading-relaxed">{rental.description}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card
              title="Book with Points"
              right={
                <span className="rounded-full bg-[#F6B400] px-3 py-1 text-xs font-extrabold text-[#0B2545]">
                  Pay with points
                </span>
              }
            >
              <div className="text-sm font-semibold text-slate-600">
                Cost is calculated as:
                <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs font-black text-slate-700">
                  nights × {perNight}
                </div>
              </div>

              <form action={bookRentalAction.bind(null, rentalId)} className="mt-5 space-y-3">
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Start date</label>
                    <input
                      name="start_date"
                      type="date"
                      required
                      defaultValue={defaultStart}
                      className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-700">End date</label>
                    <input
                      name="end_date"
                      type="date"
                      required
                      defaultValue={defaultEnd}
                      className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-semibold"
                    />
                    <div className="mt-2 text-[11px] font-semibold text-slate-500">
                      End date is checkout day (nights are end - start).
                    </div>
                  </div>
                </div>

                <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-black text-white hover:opacity-95">
                  Book Now
                </button>

                <div className="mt-2 text-[11px] font-semibold text-slate-500">
                  If the dates overlap an existing booking, booking fails and you keep your points.
                </div>
              </form>

              {ptsErr ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
                  {ptsErr.message}
                </pre>
              ) : null}
            </Card>

            <Card title="Availability (Booked Dates)">
              {bookingsErr ? (
                <pre className="whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
                  {bookingsErr.message}
                </pre>
              ) : null}

              {(bookings ?? []).length ? (
                <div className="space-y-3">
                  {(bookings ?? []).map((b: any) => (
                    <div key={b.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="text-sm font-black text-slate-900">{fmtRange(b.start_date, b.end_date)}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">
                        {diffNights(b.start_date, b.end_date)} nights • {b.points_cost} points
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-600">No bookings yet — this rental is wide open.</div>
              )}
            </Card>

            <Card title="How points work">
              <ul className="space-y-2 text-sm font-semibold text-slate-700">
                <li>• You pay with points at booking time.</li>
                <li>• If dates are unavailable, booking fails and you keep your points.</li>
                <li>• End date is checkout day (not a night stayed).</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

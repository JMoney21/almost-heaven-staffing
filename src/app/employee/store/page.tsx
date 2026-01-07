// src/app/employee/store/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type PageProps = {
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

function StoreCard({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl bg-white p-6 text-slate-900 shadow-2xl ring-1 ring-white/10 transition hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0B2B55]">{title}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">{desc}</p>
        </div>

        {badge ? (
          <span className="rounded-full bg-[#F6B400] px-3 py-1 text-[11px] font-extrabold text-[#0B2545]">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-extrabold text-slate-500">Open</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-black transition group-hover:scale-110">
          →
        </span>
      </div>
    </Link>
  );
}

export default async function EmployeeStorePage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const errorMsg = safeDecode(sp?.error);
  const successMsg = safeDecode(sp?.success);

  const supabase = await createSupabaseServer();

  // AUTH (employee portal)
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/employee/login");

  // EMPLOYEE
  const { data: employee, error: empErr } = await supabase
    .from("employees")
    .select("id, full_name, disabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (empErr || !employee?.id) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="mx-auto max-w-4xl space-y-4">
          <h1 className="text-2xl font-black">Employee record not found</h1>
          <p className="text-sm font-semibold text-white/80">
            Your login is valid, but there is no employees row linked to your user.
          </p>
          <pre className="rounded-2xl bg-white/10 p-4 text-xs whitespace-pre-wrap">
            {empErr ? JSON.stringify(empErr, null, 2) : "No employee row found for this user_id"}
          </pre>
        </div>
      </div>
    );
  }

  if (employee.disabled) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="mx-auto max-w-4xl space-y-3">
          <h1 className="text-2xl font-black">Account disabled</h1>
          <p className="text-sm font-semibold text-white/80">Please contact your manager for help.</p>
        </div>
      </div>
    );
  }

  // POINTS BALANCE
  const { data: ptsRows, error: ptsErr } = await supabase
    .from("points_transactions")
    .select("points")
    .eq("employee_id", employee.id);

  const pointsBalance = ptsErr
    ? 0
    : (ptsRows ?? []).reduce((sum: number, r: any) => sum + (Number(r.points) || 0), 0);

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Alerts */}
        {errorMsg ? <div className="rounded-xl bg-amber-500/20 p-3 text-xs font-bold">{errorMsg}</div> : null}
        {successMsg ? <div className="rounded-xl bg-emerald-500/20 p-3 text-xs font-bold">{successMsg}</div> : null}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-black">Rewards Store</h1>
            <div className="flex flex-wrap gap-2">
              <Pill>My points: {pointsBalance}</Pill>
              <Pill>Redeem with points</Pill>
              <Pill>Employee Portal</Pill>
            </div>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-white/75 leading-relaxed">
              Use your points to redeem rewards and book vacation rentals. Availability updates automatically based on
              bookings.
            </p>
          </div>

          <Link
            href="/employee"
            className="inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            ← Back to Portal
          </Link>
        </div>

        {/* Debug (optional) */}
        {ptsErr ? (
          <pre className="whitespace-pre-wrap rounded-2xl bg-white/10 p-4 text-xs text-white/80">
            {ptsErr.message}
          </pre>
        ) : null}

        {/* Store categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StoreCard
            title="Vacation Rentals"
            desc="Book cabin and vacation home stays using points. Choose dates and only book when available."
            href="/employee/store/rentals"
            badge="New"
          />

          {/* These are placeholders until you build those tables/pages */}
          <StoreCard
            title="Gift Cards"
            desc="Redeem points for digital gift cards (Amazon, Walmart, etc.)."
            href="/employee/store/gift-cards"
            badge="Soon"
          />

          <StoreCard
            title="Electronics"
            desc="TVs, tablets, headphones and more — redeem with points."
            href="/employee/store/electronics"
            badge="Soon"
          />

          <StoreCard
            title="Merch & Swag"
            desc="Apparel, drinkware, and branded items."
            href="/employee/store/merch"
            badge="Soon"
          />

          <StoreCard
            title="Experiences"
            desc="Events, tickets, and other experiences offered through Almost Heaven Staffing."
            href="/employee/store/experiences"
            badge="Soon"
          />
        </div>

        {/* Notes */}
        <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15">
          <div className="text-sm font-black">How booking works</div>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-white/80">
            <li>• You can only book rentals that are active and available for your dates.</li>
            <li>• Points are deducted at booking time.</li>
            <li>• If dates overlap an existing booking, the system blocks the booking.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

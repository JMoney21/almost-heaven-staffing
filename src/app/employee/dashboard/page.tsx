export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import PhotoUploader from "./PhotoUploader";
import CopyButton from "./CopyButton";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <div className="text-xs font-extrabold uppercase tracking-wide text-white/70">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      {sub ? (
        <div className="mt-1 text-xs font-semibold text-white/70">{sub}</div>
      ) : null}
    </div>
  );
}

function WhiteCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-[#0B2B55]">{title}</h2>
        {right ? right : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-extrabold text-white">
      {children}
    </span>
  );
}

function SideLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "block rounded-xl px-4 py-3 text-sm font-extrabold transition",
        active
          ? "bg-white text-[#0B2B55]"
          : "text-white/85 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default async function EmployeeDashboard() {
  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) redirect("/employee/login");

  // ✅ Only select columns that exist (based on your manager portal)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, facility_id, avatar_url")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">
          You are logged in, but we couldn’t find your profile record.
        </p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          {profileError?.message ?? "No profile returned"}
        </pre>
      </div>
    );
  }

  const fullName = profile.full_name ?? "Employee";
  const avatarUrl = (profile as any).avatar_url ?? null;

  // Points
  const { data: ptsBal } = await supabase
    .from("points_balances")
    .select("total_points")
    .eq("employee_user_id", user.id)
    .maybeSingle();

  const points = ptsBal?.total_points ?? 0;

  // Badge progress
  const nextThreshold = 2500;
  const progress = Math.min(100, Math.round((points / nextThreshold) * 100));

  // Assignments
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, location, specialty, start_date, end_date, status")
    .eq("employee_user_id", user.id)
    .order("start_date", { ascending: false })
    .limit(4);

  const activeAssignments =
    (assignments ?? []).filter((a: any) => a.status === "current").length;

  // Referrals
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referred_name, status, points_awarded, created_at")
    .eq("referrer_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const referralPoints = (referrals ?? []).reduce(
    (sum: number, r: any) => sum + (r.points_awarded ?? 0),
    0
  );

  // Redeemed (optional)
  const { data: ptsTx } = await supabase
    .from("points_transactions")
    .select("id, points")
    .eq("employee_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const redeemed = Math.abs(
    (ptsTx ?? [])
      .filter((t: any) => (t.points ?? 0) < 0)
      .reduce((s: number, t: any) => s + (t.points ?? 0), 0)
  );

  const referralLink = `https://almostheavenstaffing.com/ref/${user.id}`;

  return (
    <div className="min-h-screen bg-[#061A33] text-white">
      <div className="mx-auto max-w-7xl p-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Welcome, {fullName} 👋</h1>
            <p className="mt-1 text-sm font-semibold text-white/75">
              Employee Portal
            </p>
          </div>

          <Link
            href="/employee/logout"
            className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
          >
            Log Out
          </Link>
        </div>

        {/* Layout: sidebar + content */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 h-fit">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/15 grid place-items-center font-black">
                AH
              </div>
              <div>
                <div className="text-sm font-black">{fullName}</div>
                <div className="text-xs font-semibold text-white/70">
                  Employee Portal
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <SideLink href="/employee/dashboard" label="Dashboard" active />
              <SideLink href="/employee/assignments" label="Assignments" />
              <SideLink href="/employee/referrals" label="Referrals" />
              <SideLink href="/employee/rewards" label="Rewards" />
              <SideLink href="/employee/settings" label="Settings" />
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Points" value={points} sub="Total" />
              <StatCard
                label="Badge Progress"
                value={`${progress}%`}
                sub={`Next badge at ${nextThreshold.toLocaleString()}`}
              />
              <StatCard label="Active Assignments" value={activeAssignments} sub="Current" />
              <StatCard label="Referral Earnings" value={`+${referralPoints}`} sub="points" />
            </div>

            {/* Profile + Photo */}
            <WhiteCard title="Your Profile">
              <div className="grid gap-6 md:grid-cols-[180px_1fr] items-start">
                <div>
                  <div className="relative h-44 w-44 overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-sm font-black text-slate-500">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <PhotoUploader userId={user.id} currentAvatarUrl={avatarUrl} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-lg font-black text-[#0B2B55]">{fullName}</div>
                  <div className="text-sm font-semibold text-slate-600 break-all">
                    {user.email ?? "—"}
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-extrabold uppercase text-slate-500">
                      Current Badge
                    </div>
                    <div className="mt-1 text-lg font-black text-slate-900">Gold Adventurer</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#0B2B55]" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-600">
                      {points.toLocaleString()} / {nextThreshold.toLocaleString()} points
                    </div>
                  </div>
                </div>
              </div>
            </WhiteCard>

            {/* Assignments */}
            <WhiteCard
              title="Your Assignments"
              right={
                <Link href="/employee/assignments" className="text-xs font-extrabold text-slate-600 hover:underline">
                  View all
                </Link>
              }
            >
              <div className="space-y-3">
                {(assignments ?? []).length ? (
                  (assignments ?? []).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                      <div>
                        <div className="font-extrabold">{a.location ?? "—"}</div>
                        <div className="text-sm font-semibold text-slate-600">
                          {(a.specialty ?? "—")} • {(a.title ?? "—")}
                        </div>
                      </div>
                      <Pill>{a.status ?? "—"}</Pill>
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-600">No assignments yet.</div>
                )}
              </div>
            </WhiteCard>

            {/* Referrals */}
            <WhiteCard title="Refer & Earn">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-extrabold text-slate-900">Your referral link</div>
                <div className="mt-2 rounded-xl bg-white p-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 break-all">
                  {referralLink}
                </div>
                <div className="mt-3 flex gap-2">
                  <CopyButton text={referralLink} />
                  <Link
                    href="/employee/referrals"
                    className="flex-1 text-center rounded-full bg-[#F6B400] px-4 py-2 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
                  >
                    View Referrals
                  </Link>
                </div>
              </div>

              <div className="mt-4 text-sm font-semibold text-slate-600">
                Referral earnings: <span className="font-black text-slate-900">+{referralPoints}</span> points
              </div>
            </WhiteCard>

            {/* Rewards */}
            <WhiteCard title="Rewards">
              <div className="text-sm font-semibold text-slate-600">
                Points redeemed: <span className="font-black text-slate-900">{redeemed}</span>
              </div>
            </WhiteCard>
          </main>
        </div>
      </div>
    </div>
  );
}


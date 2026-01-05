export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import CopyButton from "./CopyButton";
import ProfilePhotoSection from "./ProfilePhotoSection";
import LogoutButton from "./LogoutButton";

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
      <div className="text-xs font-extrabold uppercase tracking-wide text-white/70">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs font-semibold text-white/70">{sub}</div> : null}
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
        active ? "bg-white text-[#0B2B55]" : "text-white/85 hover:bg-white/10 hover:text-white",
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

  // Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, full_name, role, facility_id, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">Profile query failed.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          user_id: {user.id}
          {"\n\n"}
          {profileError.message}
        </pre>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">
          You are logged in, but we couldn’t find your profile record.
        </p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          user_id: {user.id}
          {"\n"}
          email: {user.email ?? "—"}
        </pre>
      </div>
    );
  }

  // ✅ Fetch employee row (id + name)
  const { data: employeeRow, error: employeeErr } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (employeeErr) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">Employee lookup failed.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">{employeeErr.message}</pre>
      </div>
    );
  }

  if (!employeeRow?.id) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">No employee record linked to this login yet.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          user_id: {user.id}
          {"\n"}
          Fix: employees.user_id must equal auth user id for this employee.
        </pre>
      </div>
    );
  }

  const employeeId = employeeRow.id as string;

  // ✅ Prefer employee full name
  const fullName = employeeRow.full_name || profile.full_name || user.email?.split("@")[0] || "Employee";
  const avatarUrl = (profile as any).avatar_url ?? null;

  // ✅ Points: compute from points_transactions (manager uses employee_id)
  const { data: ptsTxAll, error: ptsTxAllErr } = await supabase
    .from("points_transactions")
    .select("points")
    .eq("employee_id", employeeId);

  if (ptsTxAllErr) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">Points query failed.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">{ptsTxAllErr.message}</pre>
      </div>
    );
  }

  const points = (ptsTxAll ?? []).reduce((sum: number, t: any) => sum + (Number(t.points) || 0), 0);

  // Badge progress
  const nextThreshold = 2500;
  const progress = Math.min(100, Math.round((points / nextThreshold) * 100));

  /**
   * ✅ ASSIGNMENTS (use the SAME tables as manager)
   * employee_assignments -> jobs
   */
  const JOB_SELECT = `
    id,
    title,
    location,
    hospital_name,
    hospital_address,
    created_at
  `;

  const { data: contractsRaw, error: contractsErr } = await supabase
    .from("employee_assignments")
    .select("id, status, pay_rate, start_date, created_at, job_id")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(4);

  if (contractsErr) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">Assignments query failed.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">{contractsErr.message}</pre>
      </div>
    );
  }

  const jobIds = Array.from(new Set((contractsRaw ?? []).map((c: any) => c.job_id).filter(Boolean)));

  const { data: jobsForContracts, error: jobsForContractsErr } = jobIds.length
    ? await supabase.from("jobs").select(JOB_SELECT).in("id", jobIds)
    : { data: [] as any[], error: null as any };

  if (jobsForContractsErr) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">Jobs lookup failed.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">{jobsForContractsErr.message}</pre>
      </div>
    );
  }

  const jobsMap = new Map((jobsForContracts ?? []).map((j: any) => [j.id, j]));
  const contracts = (contractsRaw ?? []).map((c: any) => ({ ...c, job: c.job_id ? jobsMap.get(c.job_id) : null }));

  const activeAssignments = contracts.filter((c: any) => String(c.status) === "active").length;

  // Referrals
  const { data: referrals, error: refErr } = await supabase
    .from("referrals")
    .select("id, referred_name, status, points_awarded, created_at")
    .eq("referrer_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  if (refErr) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">Referrals query failed.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">{refErr.message}</pre>
      </div>
    );
  }

  const referralPoints = (referrals ?? []).reduce((sum: number, r: any) => sum + (r.points_awarded ?? 0), 0);

  // Redeemed
  const { data: ptsTx, error: ptsTxErr } = await supabase
    .from("points_transactions")
    .select("id, points, created_at")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (ptsTxErr) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Employee Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">Points transactions query failed.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">{ptsTxErr.message}</pre>
      </div>
    );
  }

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
            <p className="mt-1 text-sm font-semibold text-white/75">Employee Portal</p>
          </div>

          <LogoutButton />
        </div>

        {/* Layout */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 h-fit">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/15 grid place-items-center font-black">
                AH
              </div>
              <div>
                <div className="text-sm font-black">{fullName}</div>
                <div className="text-xs font-semibold text-white/70">Employee Portal</div>
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
              <StatCard label="Active Assignments" value={activeAssignments} sub="Active" />
              <StatCard label="Referral Earnings" value={`+${referralPoints}`} sub="points" />
            </div>

            {/* Profile + Photo */}
            <WhiteCard title="Your Profile">
              <div className="grid gap-6 md:grid-cols-[180px_1fr] items-start">
                <ProfilePhotoSection userId={user.id} initialAvatarUrl={avatarUrl} />

                <div className="space-y-2">
                  <div className="text-lg font-black text-[#0B2B55]">{fullName}</div>
                  <div className="text-sm font-semibold text-slate-600 break-all">{user.email ?? "—"}</div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-extrabold uppercase text-slate-500">Current Badge</div>
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

            {/* ✅ Assignments (from employee_assignments) */}
            <WhiteCard
              title="Your Assignments"
              right={
                <Link href="/employee/assignments" className="text-xs font-extrabold text-slate-600 hover:underline">
                  View all
                </Link>
              }
            >
              <div className="space-y-3">
                {contracts.length ? (
                  contracts.map((c: any) => {
                    const job = c.job;
                    const title = job?.title ?? "Assignment";
                    const location = job?.location ?? "";
                    const hospitalName = job?.hospital_name ?? "";
                    const hospitalAddress = job?.hospital_address ?? "";

                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                      >
                        <div>
                          <div className="font-extrabold">{title}</div>
                          <div className="text-sm font-semibold text-slate-600">
                            {location}
                            {hospitalName ? ` • ${hospitalName}` : ""}
                          </div>
                          {hospitalAddress ? (
                            <div className="text-xs font-semibold text-slate-500">{hospitalAddress}</div>
                          ) : null}
                          <div className="mt-1 text-xs font-semibold text-slate-600">
                            Pay: <span className="font-black">${c.pay_rate}/week</span> • Start:{" "}
                            <span className="font-black">{c.start_date}</span>
                          </div>
                        </div>

                        <Pill>{String(c.status ?? "—").toUpperCase()}</Pill>
                      </div>
                    );
                  })
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

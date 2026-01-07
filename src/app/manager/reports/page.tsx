export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

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

function Panel({
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
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-[#0B2B55]">{title}</h2>
        {right ? right : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function MiniBarRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-extrabold">
        <span className="text-slate-800">{label}</span>
        <span className="text-slate-600">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function ManagerReportsPage() {
  const supabase = await createSupabaseServer();

  // 1) Auth
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) redirect("/manager/login");

  // 2) Profile + role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, facility_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) redirect("/manager/login");

  if (profile.role !== "manager" && profile.role !== "admin") redirect("/");

  const facilityId = profile.facility_id;

  // --- Pull data (keep it simple & reliable) ---
  // JOBS
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, status, created_at")
    .order("created_at", { ascending: false });

  if (jobsError) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Reports & Analytics</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          {jobsError.message}
        </pre>
      </div>
    );
  }

  const totalJobs = jobs?.length ?? 0;
  const jobByStatus: Record<string, number> = {};
  for (const j of jobs ?? []) jobByStatus[j.status ?? "unknown"] = (jobByStatus[j.status ?? "unknown"] || 0) + 1;

  // APPLICATIONS
  const stages = ["new", "reviewed", "interviewed", "hired"] as const;
  const appByStage: Record<string, number> = { new: 0, reviewed: 0, interviewed: 0, hired: 0 };

  let appsError: string | null = null;
  for (const s of stages) {
    const { count, error } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", s);

    if (error) appsError = error.message;
    appByStage[s] = count ?? 0;
  }
  const totalApps = Object.values(appByStage).reduce((a, b) => a + b, 0);

  // POINTS (facility scoped)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: ptsRows, error: ptsRowsError } = await supabase
    .from("points_transactions")
    .select("points, created_at")
    .eq("facility_id", facilityId)
    .gte("created_at", startOfMonth.toISOString());

  const pointsThisMonth = (ptsRows ?? []).reduce((sum: number, r: any) => sum + (r.points ?? 0), 0);

  // SIMPLE "last 14 days" trend using created_at from jobs + applications
  const days = 14;
  const today = new Date();
  const dayKeys: string[] = [];
  const jobCounts: Record<string, number> = {};
  const appCounts: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    dayKeys.push(key);
    jobCounts[key] = 0;
    appCounts[key] = 0;
  }

  for (const j of jobs ?? []) {
    const key = new Date(j.created_at).toISOString().slice(0, 10);
    if (key in jobCounts) jobCounts[key] += 1;
  }

  const { data: appsRecent, error: appsRecentError } = await supabase
    .from("applications")
    .select("created_at")
    .gte("created_at", new Date(today.getTime() - (days - 1) * 86400000).toISOString());

  for (const a of appsRecent ?? []) {
    const key = new Date(a.created_at).toISOString().slice(0, 10);
    if (key in appCounts) appCounts[key] += 1;
  }

  const maxTrend = Math.max(
    ...dayKeys.map((k) => Math.max(jobCounts[k] ?? 0, appCounts[k] ?? 0)),
    1
  );

  const maxJobStatus = Math.max(...Object.values(jobByStatus), 1);
  const maxAppStage = Math.max(...Object.values(appByStage), 1);

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Reports & Analytics</h1>
            <p className="mt-1 text-sm font-semibold text-white/75">
              Manager: {profile.full_name ?? "Manager"} • Facility ID: {facilityId ?? "Not set"}
            </p>
          </div>

          <a
            href="/manager"
            className="rounded-xl bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Jobs" value={totalJobs} sub="All statuses" />
          <StatCard label="Applications" value={totalApps} sub={`${appByStage.new} new`} />
          <StatCard label="Published Jobs" value={jobByStatus.published ?? 0} sub="Live now" />
          <StatCard
            label="Points Awarded"
            value={pointsThisMonth}
            sub={ptsRowsError ? "Could not load points" : "This month"}
          />
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left / main */}
          <div className="xl:col-span-2 space-y-6">
            <Panel
              title="14-Day Activity Trend"
              right={
                <div className="text-xs font-extrabold text-slate-600">
                  Jobs created vs Applications received
                </div>
              }
            >
              <div className="space-y-3">
                {dayKeys.map((k) => {
                  const jobsV = jobCounts[k] ?? 0;
                  const appsV = appCounts[k] ?? 0;
                  const jobsPct = Math.round((jobsV / maxTrend) * 100);
                  const appsPct = Math.round((appsV / maxTrend) * 100);

                  return (
                    <div key={k} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
                        <span>{k}</span>
                        <span>
                          Jobs {jobsV} • Apps {appsV}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="h-2 w-full rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
                          <div className="h-full bg-slate-900" style={{ width: `${jobsPct}%` }} />
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
                          <div className="h-full bg-[#F6B400]" style={{ width: `${appsPct}%` }} />
                        </div>
                      </div>

                      <div className="mt-2 flex gap-3 text-[11px] font-extrabold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-slate-900" /> Jobs
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-[#F6B400]" /> Applications
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {appsRecentError ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
                  {appsRecentError.message}
                </pre>
              ) : null}
            </Panel>

            <Panel title="Notes">
              <div className="text-sm font-semibold text-slate-700 leading-relaxed">
                This page is a working “analytics hub.” Next upgrades are easy:
                facility filtering for applications (if you want it), job performance per location/shift, and export to CSV.
              </div>

              {appsError ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
                  {appsError}
                </pre>
              ) : null}
            </Panel>
          </div>

          {/* Right / breakdowns */}
          <div className="space-y-6">
            <Panel title="Jobs by Status">
              <div className="space-y-4">
                {Object.entries(jobByStatus)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <MiniBarRow key={status} label={status} value={count} max={maxJobStatus} />
                  ))}
              </div>
            </Panel>

            <Panel title="Applications by Stage">
              <div className="space-y-4">
                {Object.entries(appByStage).map(([stage, count]) => (
                  <MiniBarRow key={stage} label={stage} value={count} max={maxAppStage} />
                ))}
              </div>
            </Panel>

            <Panel
              title="Quick Links"
              right={<div className="text-xs font-extrabold text-slate-600">Manager tools</div>}
            >
              <div className="grid gap-3">
                <a className="rounded-2xl border border-slate-200 p-4 font-extrabold hover:bg-slate-50" href="/manager/jobs">
                  Manage Jobs →
                </a>
                <a
                  className="rounded-2xl border border-slate-200 p-4 font-extrabold hover:bg-slate-50"
                  href="/manager/applications"
                >
                  View Applications →
                </a>
                <a
                  className="rounded-2xl border border-slate-200 p-4 font-extrabold hover:bg-slate-50"
                  href="/manager/points"
                >
                  Points & Rewards →
                </a>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function RightCard({ title, children, href }: { title: string; children: any; href?: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[#0B2B55]">{title}</h3>
        {href ? (
          <a className="text-xs font-extrabold text-slate-600 hover:underline" href={href}>
            View all
          </a>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatusPill({ children }: { children: any }) {
  return (
    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-extrabold text-white">
      {children}
    </span>
  );
}

export default async function ManagerDashboard() {
  const supabase = await createSupabaseServer();

  // 1) Auth
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    redirect("/manager/login");
  }

  // 2) Profile check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, facility_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-3xl font-black">Manager Portal</h1>
        <p className="mt-3 text-white/80 font-semibold">
          You are logged in, but we couldn’t find your profile record.
        </p>

        <div className="mt-6 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
          <div className="text-sm font-bold text-amber-300">Fix:</div>
          <ol className="mt-2 list-decimal pl-5 text-sm font-semibold text-white/85 space-y-1">
            <li>Go to Supabase → Table Editor → <b>profiles</b></li>
            <li>Make sure you have a row where <b>user_id</b> = your auth user id</li>
            <li>Set <b>role</b> = <b>manager</b> and set <b>facility_id</b></li>
          </ol>

          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-xs text-white/80">
            {profileError?.message ?? "No profile returned"}
          </pre>
        </div>
      </div>
    );
  }

  // 3) Role gate
  if (profile.role !== "manager" && profile.role !== "admin") {
    redirect("/");
  }

  const facilityId = profile.facility_id;

  // 4) JOBS (left big + right widget)
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, job_number, title, location, shift, status, created_at")
    .order("created_at", { ascending: false });

  if (jobsError) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Could not load jobs</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          {jobsError.message}
        </pre>
      </div>
    );
  }

  const totalJobs = jobs?.length ?? 0;
  const publishedJobs = (jobs ?? []).filter((j: any) => j.status === "published").length;

  // RIGHT column quick jobs (top 5)
  const rightJobs = (jobs ?? []).slice(0, 5);

  // 5) APPLICATIONS (counts + recent list)
  // ✅ SHOW ALL APPLICATIONS (no facility filter)
  const stages = ["new", "reviewed", "interviewed", "hired"] as const;

  const stageCounts: Record<string, number> = { new: 0, reviewed: 0, interviewed: 0, hired: 0 };
  let appsCountsError: string | null = null;

  for (const s of stages) {
    const { count, error } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", s);

    if (error) appsCountsError = error.message;
    stageCounts[s] = count ?? 0;
  }

  const { data: recentApps, error: recentAppsError } = await supabase
    .from("applications")
    .select("id, full_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(4);

  // 6) EMPLOYEES + POINTS (leaderboard)
  // expects a view named points_balances: facility_id, employee_user_id, total_points
  const { data: topPoints, error: pointsError } = await supabase
    .from("points_balances")
    .select("employee_user_id, total_points")
    .eq("facility_id", facilityId)
    .order("total_points", { ascending: false })
    .limit(5);

  const employeeIds = (topPoints ?? []).map((x: any) => x.employee_user_id);

  const { data: employeeProfiles } = employeeIds.length
    ? await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", employeeIds)
    : { data: [] as any[] };

  const topEmployees = (topPoints ?? []).map((row: any) => {
    const p = (employeeProfiles ?? []).find((x: any) => x.user_id === row.employee_user_id);
    return {
      user_id: row.employee_user_id,
      full_name: p?.full_name ?? "Employee",
      total_points: row.total_points ?? 0,
    };
  });

  // 7) Points awarded this month (optional, uses points_transactions)
  let pointsThisMonth = 0;
  let pointsThisMonthError: string | null = null;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: ptsRows, error: ptsRowsError } = await supabase
    .from("points_transactions")
    .select("points, created_at")
    .eq("facility_id", facilityId)
    .gte("created_at", startOfMonth.toISOString());

  if (ptsRowsError) pointsThisMonthError = ptsRowsError.message;
  pointsThisMonth = (ptsRows ?? []).reduce((sum: number, r: any) => sum + (r.points ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Welcome, {profile.full_name ?? "Manager"} 👋</h1>
            <p className="mt-1 text-sm font-semibold text-white/75">Facility ID: {facilityId ?? "Not set"}</p>
          </div>

          <a
            href="/manager/jobs/new"
            className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
          >
            + Add New Job
          </a>
        </div>

        {/* Grid: LEFT + RIGHT */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LEFT column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Jobs" value={totalJobs} sub="All statuses" />
              <StatCard label="Published Jobs" value={publishedJobs} sub="Live now" />
              <StatCard
                label="Applications"
                value={(Object.values(stageCounts).reduce((a, b) => a + b, 0) as number) ?? 0}
                sub={`${stageCounts.new ?? 0} new`}
              />
              <StatCard label="Points Awarded" value={pointsThisMonth} sub="This month" />
            </div>

            {/* Big Job Postings (your existing card, kept) */}
            <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#0B2B55]">Job Postings</h2>
                <a href="/manager/jobs" className="text-xs font-extrabold text-slate-600 hover:underline">
                  View all
                </a>
              </div>

              <div className="mt-5 space-y-4">
                {jobs && jobs.length > 0 ? (
                  jobs.slice(0, 6).map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                    >
                      <div>
                        <div className="font-extrabold">{job.title}</div>
                        <div className="text-sm font-semibold text-slate-600">
                          {(job.location ?? "—")} • {(job.shift ?? "—")}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">
                        {job.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-600">No jobs yet. Click “Add New Job”.</div>
                )}
              </div>
            </div>

            {/* Left bottom placeholder (later: full Forms & Applications table) */}
            <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#0B2B55]">Forms & Applications</h2>
                <a href="/manager/applications" className="text-xs font-extrabold text-slate-600 hover:underline">
                  View all
                </a>
              </div>

              <div className="mt-4 text-sm font-semibold text-slate-600">
                This section will be your full Applications table (New / Reviewed / Interviewed / Hired).
              </div>

              {appsCountsError || recentAppsError ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
                  {appsCountsError || recentAppsError?.message}
                </pre>
              ) : null}
            </div>
          </div>

          {/* RIGHT column widgets */}
          <div className="space-y-6">
            {/* Manage jobs widget */}
            <RightCard title="Manage Job Postings" href="/manager/jobs">
              <div className="space-y-3">
                {rightJobs.length ? (
                  rightJobs.map((j: any) => (
                    <div key={j.id} className="flex items-center justify-between rounded-2xl border p-3">
                      <div>
                        <div className="text-sm font-extrabold">{j.title}</div>
                        <div className="text-xs font-semibold text-slate-500">{j.status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/manager/jobs/${j.id}/edit`}
                          className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-extrabold text-white"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-600">No jobs yet.</div>
                )}
              </div>
            </RightCard>

            {/* Applications widget */}
            <RightCard title="Forms & Applications" href="/manager/applications">
              <div className="flex flex-wrap gap-2">
                {["new", "reviewed", "interviewed", "hired"].map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700"
                  >
                    {k} • {stageCounts[k] ?? 0}
                  </span>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {(recentApps ?? []).map((a: any) => (
                  <a
                    key={a.id}
                    href={`/manager/applications/${a.id}`}
                    className="block rounded-2xl border p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold">{a.full_name ?? "Applicant"}</div>
                      <StatusPill>{a.status}</StatusPill>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">Tap to review</div>
                  </a>
                ))}

                {recentAppsError ? (
                  <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-100 p-3 text-xs text-slate-700">
                    {recentAppsError.message}
                  </pre>
                ) : null}
              </div>
            </RightCard>

            {/* Points widget */}
            <RightCard title="Employee Points & Rewards" href="/manager/points">
              <div className="space-y-3">
                {topEmployees.length ? (
                  topEmployees.map((e: any) => (
                    <div key={e.user_id} className="flex items-center justify-between rounded-2xl border p-3">
                      <div>
                        <div className="text-sm font-extrabold">{e.full_name}</div>
                        <div className="text-xs font-semibold text-slate-500">Total points</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-black">{e.total_points}</div>
                        <a
                          href={`/manager/points?award=${e.user_id}`}
                          className="rounded-lg bg-[#F6B400] px-3 py-1 text-xs font-extrabold text-slate-900"
                        >
                          Award
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-600">
                    No points yet.
                    {pointsError ? (
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-100 p-3 text-xs text-slate-700">
                        {pointsError.message}
                      </pre>
                    ) : null}
                    {pointsThisMonthError ? (
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-100 p-3 text-xs text-slate-700">
                        {pointsThisMonthError}
                      </pre>
                    ) : null}
                  </div>
                )}
              </div>
            </RightCard>
          </div>
        </div>
      </div>
    </div>
  );
}

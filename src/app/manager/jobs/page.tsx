export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type SearchParams = {
  status?: string; // draft | published | paused | all
  q?: string;
  shift?: string; // Days | Nights | Rotating | all
  city?: string;
  sort?: string; // newest | oldest | pay_high | pay_low
};

export default async function ManagerJobsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = searchParams ? await searchParams : {};
  const status = sp.status ?? "all";
  const shift = sp.shift ?? "all";
  const q = (sp.q ?? "").trim();
  const city = (sp.city ?? "").trim();
  const sort = sp.sort ?? "newest";

  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) redirect("/manager/login");

  // Profile + role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, facility_id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) redirect("/manager/login");
  if (profile.role !== "manager" && profile.role !== "admin") redirect("/");
  if (!profile.facility_id) redirect("/manager?error=no_facility");

  // Build query
  let qb = supabase
    .from("jobs")
    .select(
      "id, job_number, title, location, city, state, shift, status, pay_min, pay_max, pay_display, posted_at, created_at, updated_at"
    )
    .eq("facility_id", profile.facility_id);

  if (status !== "all") qb = qb.eq("status", status);
  if (shift !== "all") qb = qb.eq("shift", shift);

  // Search (title/location/city/state)
  if (q) {
    const safe = q.replace(/,/g, "");
    qb = qb.or(
      `title.ilike.%${safe}%,location.ilike.%${safe}%,city.ilike.%${safe}%,state.ilike.%${safe}%`
    );
  }

  if (city) {
    const safeCity = city.replace(/,/g, "");
    qb = qb.ilike("city", `%${safeCity}%`);
  }

  // Sorting
  if (sort === "oldest") qb = qb.order("created_at", { ascending: true });
  else if (sort === "pay_high")
    qb = qb.order("pay_max", { ascending: false, nullsFirst: false });
  else if (sort === "pay_low")
    qb = qb.order("pay_min", { ascending: true, nullsFirst: false });
  else qb = qb.order("created_at", { ascending: false });

  const { data: jobs, error: jobsError } = await qb;

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

  const total = jobs?.length ?? 0;
  const publishedCount = (jobs ?? []).filter((j: any) => j.status === "published").length;
  const draftCount = (jobs ?? []).filter((j: any) => j.status === "draft").length;
  const pausedCount = (jobs ?? []).filter((j: any) => j.status === "paused").length;

  function pill(active: boolean) {
    return active
      ? "bg-[#0B2545] text-white"
      : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50";
  }

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Manage Job Listings</h1>
            <p className="mt-2 text-sm font-semibold text-white/75">
              Facility: {profile.facility_id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/manager"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-extrabold text-white hover:bg-white/10"
            >
              Back to Dashboard
            </a>
            <a
              href="/manager/jobs/new"
              className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
            >
              + Add New Job
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="text-xs font-extrabold text-white/70">Total</div>
            <div className="mt-1 text-2xl font-black">{total}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="text-xs font-extrabold text-white/70">Published</div>
            <div className="mt-1 text-2xl font-black">{publishedCount}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="text-xs font-extrabold text-white/70">Drafts</div>
            <div className="mt-1 text-2xl font-black">{draftCount}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="text-xs font-extrabold text-white/70">Paused</div>
            <div className="mt-1 text-2xl font-black">{pausedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          <form className="grid gap-4 md:grid-cols-[1fr_220px_220px_220px_auto] items-end">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Search</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search title, location, city, state..."
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Status</label>
              <select
                name="status"
                defaultValue={status}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Shift</label>
              <select
                name="shift"
                defaultValue={shift}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              >
                <option value="all">All</option>
                <option value="Days">Days</option>
                <option value="Nights">Nights</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">City</label>
              <input
                name="city"
                defaultValue={city}
                placeholder="Charleston"
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Sort</label>
              <select
                name="sort"
                defaultValue={sort}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="pay_high">Pay (High → Low)</option>
                <option value="pay_low">Pay (Low → High)</option>
              </select>
            </div>

            <div className="md:col-span-5 flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-[#0B2545] px-5 py-3 text-sm font-black text-white hover:brightness-110"
              >
                Apply Filters
              </button>

              <a
                href="/manager/jobs"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
              >
                Reset
              </a>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0B2B55]">Listings ({total})</h2>

            <div className="flex items-center gap-2">
              <a
                href={`/manager/jobs?status=published`}
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${pill(
                  status === "published"
                )}`}
              >
                Published
              </a>
              <a
                href={`/manager/jobs?status=draft`}
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${pill(
                  status === "draft"
                )}`}
              >
                Drafts
              </a>
              <a
                href={`/manager/jobs?status=paused`}
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${pill(
                  status === "paused"
                )}`}
              >
                Paused
              </a>
              <a
                href={`/manager/jobs?status=all`}
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${pill(
                  status === "all"
                )}`}
              >
                All
              </a>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-left text-xs font-black text-slate-600">
                  <th className="py-3 pr-4">Job</th>
                  <th className="py-3 pr-4">Location</th>
                  <th className="py-3 pr-4">Shift</th>
                  <th className="py-3 pr-4">Pay</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody className="text-sm font-semibold">
                {(jobs ?? []).map((job: any) => {
                  const pay =
                    job.pay_display ??
                    (job.pay_min || job.pay_max
                      ? `$${job.pay_min ?? "—"}–$${job.pay_max ?? "—"}`
                      : "—");

                  // ✅ FIXED: no illegal mixing of ?? and || without parentheses
                  const displayLocation =
                    job.location ??
                    (`${job.city ?? ""}${job.state ? `, ${job.state}` : ""}` || "—");

                  return (
                    <tr key={job.id} className="border-t">
                      <td className="py-4 pr-4">
                        <div className="text-xs font-semibold text-slate-500">
                          {job.job_number ? `Job #${job.job_number}` : job.id}
                        </div>
                        <div className="font-extrabold text-slate-900">
                          {job.title ?? "Untitled"}
                        </div>
                      </td>

                      <td className="py-4 pr-4 text-slate-700">{displayLocation}</td>

                      <td className="py-4 pr-4 text-slate-700">{job.shift ?? "—"}</td>

                      <td className="py-4 pr-4 text-slate-700">{pay}</td>

                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">
                          {job.status ?? "—"}
                        </span>
                      </td>

                      <td className="py-4 pr-4 text-slate-700">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString() : "—"}
                      </td>

                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/manager/jobs/${job.id}/edit`}
                            className="rounded-lg bg-[#0B2545] px-3 py-2 text-xs font-extrabold text-green hover:brightness-110"
                          >
                            Edit
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!jobs?.length ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-600">
                      No jobs found for these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

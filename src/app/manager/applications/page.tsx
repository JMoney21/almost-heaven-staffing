export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-extrabold text-white">
      {children}
    </span>
  );
}

function Chip({
  active,
  href,
  children,
}: {
  active?: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1 text-xs font-extrabold ring-1",
        active
          ? "bg-slate-900 text-white ring-slate-900"
          : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function fmt(d: any) {
  try {
    return d ? new Date(d).toLocaleString() : "—";
  } catch {
    return "—";
  }
}

export default async function ManagerApplicationsPage({
  searchParams,
}: {
  // Next 16 sometimes wraps; this works either way
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const sp = (await Promise.resolve(searchParams ?? {})) as Record<
    string,
    string | string[] | undefined
  >;

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" ? sp.status : "all";
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const PAGE_SIZE = 25;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServer();

  /* ---------------- AUTH ---------------- */
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  /* ---------------- PROFILE ---------------- */
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, facility_id, full_name")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/manager/login");
  if (profile.role !== "manager" && profile.role !== "admin") redirect("/");

  const facilityId = profile.facility_id;

  /* ---------------- JOB IDS FOR THIS FACILITY ---------------- */
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, job_number, location, shift")
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false });

  if (jobsError) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Could not load jobs for facility</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          {jobsError.message}
        </pre>
        <Link className="mt-6 inline-block underline" href="/manager">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const jobMap = new Map<string, any>((jobs ?? []).map((j: any) => [j.id, j]));
  const jobIds = (jobs ?? []).map((j: any) => j.id);

  // No jobs = no apps
  if (!jobIds.length) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black">Applications</h1>
              <p className="mt-1 text-sm font-semibold text-white/70">
                Facility ID: {facilityId}
              </p>
            </div>
            <Link
              href="/manager"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/15 hover:bg-white/15"
            >
              Back
            </Link>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="text-sm font-semibold text-slate-600">
              No jobs exist for this facility yet — so there are no applications to show.
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- APPLICATIONS (FACILITY-SCOPED VIA job_id IN jobIds) ---------------- */
  // Build query safely
  let appsQuery = supabase
    .from("applications")
    .select(
      "id, full_name, email, phone, status, created_at, job_id, interviewed, interviewed_at",
      { count: "exact" }
    )
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    appsQuery = appsQuery.eq("status", status);
  }

  // Simple text search (client-side filter fallback is fine; DB text search would need an index or RPC)
  // We'll fetch a page and then filter by q, but also try to reduce server load by filtering a bit:
  // If you want true DB search later: add a tsvector column + GIN index.
  const { data: appsPageRaw, error: appsError, count } = await appsQuery.range(from, to);

  if (appsError) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Could not load applications</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          {appsError.message}
        </pre>
        <Link className="mt-6 inline-block underline" href="/manager">
          Back to dashboard
        </Link>
      </div>
    );
  }

  let appsPage = appsPageRaw ?? [];

  // Apply keyword filter on the page (fast + simple)
  if (q) {
    const qq = q.toLowerCase();
    appsPage = appsPage.filter((a: any) => {
      const job = jobMap.get(a.job_id);
      return (
        (a.full_name ?? "").toLowerCase().includes(qq) ||
        (a.email ?? "").toLowerCase().includes(qq) ||
        (a.phone ?? "").toLowerCase().includes(qq) ||
        (a.status ?? "").toLowerCase().includes(qq) ||
        (job?.title ?? "").toLowerCase().includes(qq) ||
        String(job?.job_number ?? "").toLowerCase().includes(qq)
      );
    });
  }

  // Counts by stage (facility-scoped)
  const stages = ["new", "reviewed", "interviewed", "hired"] as const;

  const countByStatus: Record<string, number> = { all: 0 };
  for (const s of stages) countByStatus[s] = 0;

  // Efficient counts: do 4 lightweight count queries (no joins needed)
  // (still facility scoped via job_id IN jobIds)
  const countResults = await Promise.all(
    stages.map((s) =>
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds)
        .eq("status", s)
    )
  );
  countResults.forEach((r, i) => {
    countByStatus[stages[i]] = r.count ?? 0;
  });
  countByStatus.all = stages.reduce((sum, s) => sum + (countByStatus[s] ?? 0), 0);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const makeHref = (next: { status?: string; page?: number; q?: string }) => {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? status;
    const nextPage = next.page ?? page;
    const nextQ = next.q ?? q;

    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextQ) params.set("q", nextQ);
    if (nextPage && nextPage !== 1) params.set("page", String(nextPage));

    const s = params.toString();
    return s ? `/manager/applications?${s}` : `/manager/applications`;
  };

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Applications</h1>
            <p className="mt-1 text-sm font-semibold text-white/70">
              Facility ID: {facilityId}
            </p>
          </div>

          <Link
            href="/manager"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/15 hover:bg-white/15"
          >
            Back to dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Chip active={status === "all"} href={makeHref({ status: "all", page: 1 })}>
                All • {countByStatus.all}
              </Chip>
              {stages.map((s) => (
                <Chip key={s} active={status === s} href={makeHref({ status: s, page: 1 })}>
                  {s} • {countByStatus[s] ?? 0}
                </Chip>
              ))}
            </div>

            <form action="/manager/applications" method="GET" className="flex gap-2">
              {/* keep status when searching */}
              {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name, email, phone, job…"
                className="w-full md:w-80 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#F6B400] px-4 py-2 text-sm font-black text-[#0B2545] hover:brightness-95"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-4 text-xs font-semibold text-slate-500">
            Showing page {page} of {totalPages} • {totalCount} total records (status-filtered)
          </div>
        </div>

        {/* Table/List */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          {appsPage.length ? (
            <div className="space-y-3">
              {appsPage.map((a: any) => {
                const job = jobMap.get(a.job_id);
                return (
                  <Link
                    key={a.id}
                    href={`/manager/applications/${a.id}`}
                    className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-extrabold truncate">
                            {a.full_name ?? "Applicant"}
                          </div>
                          <Pill>{a.status ?? "new"}</Pill>
                          {a.interviewed ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-900">
                              Interviewed ✓
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          {a.email ?? "—"} • {a.phone ?? "—"}
                        </div>

                        <div className="mt-2 text-xs font-semibold text-slate-600">
                          Job: <span className="font-black">{job?.title ?? "—"}</span>{" "}
                          {job?.job_number ? <span className="text-slate-400">• #{job.job_number}</span> : null}
                          <span className="text-slate-400">
                            {" "}
                            • {job?.location ?? "—"} • {job?.shift ?? "—"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xs font-extrabold text-slate-500">Submitted</div>
                        <div className="text-xs font-black">{fmt(a.created_at)}</div>
                        {a.interviewed_at ? (
                          <div className="mt-2 text-[11px] font-bold text-slate-500">
                            Interviewed: {fmt(a.interviewed_at)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-600">
              No applications match this filter.
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <Link
              href={makeHref({ page: Math.max(1, page - 1) })}
              className={[
                "rounded-xl px-4 py-2 text-sm font-black ring-1",
                page <= 1
                  ? "pointer-events-none bg-slate-100 text-slate-400 ring-slate-200"
                  : "bg-white text-slate-900 ring-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              ← Prev
            </Link>

            <div className="text-xs font-semibold text-slate-500">
              Page {page} / {totalPages}
            </div>

            <Link
              href={makeHref({ page: Math.min(totalPages, page + 1) })}
              className={[
                "rounded-xl px-4 py-2 text-sm font-black ring-1",
                page >= totalPages
                  ? "pointer-events-none bg-slate-100 text-slate-400 ring-slate-200"
                  : "bg-white text-slate-900 ring-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              Next →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

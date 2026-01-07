// src/app/employee/store/rentals/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type SearchParams = Promise<{
  q?: string;
  onlyAvailable?: string; // "1"
  sort?: string; // "new" | "night_asc" | "night_desc" | "week_asc" | "week_desc"
  error?: string;
  success?: string;
}>;

type PageProps = {
  searchParams?: SearchParams;
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
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl bg-white p-6 text-slate-900 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

function enc(v: string) {
  return encodeURIComponent(v);
}

export default async function EmployeeRentalsPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;

  const q = (sp?.q ?? "").trim();
  const onlyAvailable = sp?.onlyAvailable === "1";
  const sort = sp?.sort ?? "new";

  const errorMsg = safeDecode(sp?.error);
  const successMsg = safeDecode(sp?.success);

  const supabase = await createSupabaseServer();

  // AUTH (employee portal)
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/employee/login");

  // EMPLOYEE (linked)
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
          <p className="text-sm font-semibold text-white/80">
            Please contact your manager for help.
          </p>
        </div>
      </div>
    );
  }

  // POINTS BALANCE (sum)
  const { data: ptsRows, error: ptsErr } = await supabase
    .from("points_transactions")
    .select("points")
    .eq("employee_id", employee.id);

  const pointsBalance = ptsErr
    ? 0
    : (ptsRows ?? []).reduce((sum: number, r: any) => sum + (Number(r.points) || 0), 0);

  // RENTALS QUERY (matches your schema)
  let rentalsQuery = supabase
    .from("rentals")
    .select("id, title, description, location, image_url, points_per_night, points_per_week, is_active, created_at")
    .limit(48);

  if (onlyAvailable) rentalsQuery = rentalsQuery.eq("is_active", true);

  // Simple title search (no full-text dependency)
  // If you want contains search: ilike on title.
  if (q) rentalsQuery = rentalsQuery.ilike("title", `%${q}%`);

  // Sorting
  switch (sort) {
    case "night_asc":
      rentalsQuery = rentalsQuery.order("points_per_night", { ascending: true });
      break;
    case "night_desc":
      rentalsQuery = rentalsQuery.order("points_per_night", { ascending: false });
      break;
    case "week_asc":
      rentalsQuery = rentalsQuery.order("points_per_week", { ascending: true });
      break;
    case "week_desc":
      rentalsQuery = rentalsQuery.order("points_per_week", { ascending: false });
      break;
    case "new":
    default:
      rentalsQuery = rentalsQuery.order("created_at", { ascending: false });
      break;
  }

  const { data: rentals, error: rentalsErr } = await rentalsQuery;

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Alerts */}
        {errorMsg ? <div className="rounded-xl bg-amber-500/20 p-3 text-xs font-bold">{errorMsg}</div> : null}
        {successMsg ? <div className="rounded-xl bg-emerald-500/20 p-3 text-xs font-bold">{successMsg}</div> : null}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-black">Vacation Rentals</h1>
            <div className="flex flex-wrap gap-2">
              <Pill>Book with points</Pill>
              <Pill>My points: {pointsBalance}</Pill>
              <Pill>Employees only</Pill>
            </div>
          </div>

          <Link
            href="/employee/store"
            className="inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            ← Back to Store
          </Link>
        </div>

        {/* Filters */}
        <Card className="bg-white/95">
          <form className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="text-xs font-extrabold text-slate-700">Search</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search rentals (title)…"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-semibold text-slate-900"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-extrabold text-slate-700">Sort</label>
              <select
                name="sort"
                defaultValue={sort}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-semibold text-slate-900"
              >
                <option value="new">Newest</option>
                <option value="night_asc">Nightly points (low → high)</option>
                <option value="night_desc">Nightly points (high → low)</option>
                <option value="week_asc">Weekly points (low → high)</option>
                <option value="week_desc">Weekly points (high → low)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-extrabold text-slate-700">Availability</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 p-3">
                <input
                  id="onlyAvailable"
                  name="onlyAvailable"
                  value="1"
                  type="checkbox"
                  defaultChecked={onlyAvailable}
                  className="h-4 w-4"
                />
                <label htmlFor="onlyAvailable" className="text-sm font-extrabold text-slate-800">
                  Show active only
                </label>
              </div>
            </div>

            <div className="md:col-span-12 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
              >
                Apply filters
              </button>

              <Link
                href="/employee/store/rentals"
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-900 hover:bg-slate-200"
              >
                Reset
              </Link>
            </div>
          </form>

          {rentalsErr ? (
            <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
              {rentalsErr.message}
            </pre>
          ) : null}

          {ptsErr ? (
            <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
              {ptsErr.message}
            </pre>
          ) : null}
        </Card>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(rentals ?? []).map((r: any) => (
            <Link
              key={r.id}
              href={`/employee/store/rentals/${r.id}`}
              className="group overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/10 transition hover:-translate-y-1"
            >
              <div className="aspect-[16/9] w-full bg-slate-200">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 font-bold">
                    No image
                  </div>
                )}
              </div>

              <div className="p-6 text-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-black text-[#0B2B55] leading-snug">{r.title}</h2>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-extrabold",
                      r.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {r.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                {r.location ? (
                  <div className="mt-2 text-sm font-semibold text-slate-600">{r.location}</div>
                ) : null}

                {r.description ? (
                  <p className="mt-3 line-clamp-3 text-sm font-semibold text-slate-600 leading-relaxed">
                    {r.description}
                  </p>
                ) : (
                  <div className="mt-3 text-sm font-semibold text-slate-500">No description yet.</div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">
                    {Number(r.points_per_night)} pts / night
                  </span>
                  <span className="rounded-full bg-[#F6B400] px-3 py-1 text-xs font-extrabold text-[#0B2545]">
                    {Number(r.points_per_week)} pts / week
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-500">View & book</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] font-black transition group-hover:scale-110">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {rentals && rentals.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
            <h3 className="text-lg font-black text-[#0B2B55]">No rentals found</h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Try clearing filters or ask your manager to add rentals.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

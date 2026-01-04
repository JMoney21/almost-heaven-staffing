export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  // Profile + role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, facility_id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");
  if (!profile.facility_id) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Facility not set</h1>
        <p className="mt-2 text-white/80">
          Your profile needs a facility_id before you can create jobs.
        </p>
      </div>
    );
  }

  // ✅ Server Action: create job using YOUR jobs schema
  async function createJob(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServer();

    // Re-check auth
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) redirect("/manager/login");

    // Re-check role + facility
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, facility_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");
    if (!profile.facility_id) redirect("/manager/jobs/new?error=no_facility");

    // Form fields
    const title = String(formData.get("title") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const shift = String(formData.get("shift") ?? "").trim();
    const status = String(formData.get("status") ?? "draft").trim();

    const department = String(formData.get("department") ?? "").trim();
    const specialty = String(formData.get("specialty") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    const payMin = String(formData.get("pay_min") ?? "").trim();
    const payMax = String(formData.get("pay_max") ?? "").trim();
    const employmentType = String(formData.get("employment_type") ?? "").trim();

    const durationWeeksRaw = String(formData.get("duration_weeks") ?? "").trim();
    const startDateRaw = String(formData.get("start_date") ?? "").trim(); // YYYY-MM-DD from <input type="date">

    if (!title) redirect("/manager/jobs/new?error=missing_title");

    // Derive city/state from "Charleston, WV"
    const city = location.includes(",") ? location.split(",")[0]?.trim() : (location || null);
    const state = location.includes(",") ? location.split(",")[1]?.trim() : null;

    // Build pay_display
    const pay_display =
      payMin && payMax ? `$${payMin}–$${payMax}` : payMin ? `$${payMin}+` : null;

    // Convert optional numeric-like fields
    const duration_weeks = durationWeeksRaw ? Number(durationWeeksRaw) : null;
    const start_date = startDateRaw ? startDateRaw : null;

    const { error } = await supabase.from("jobs").insert({
      facility_id: profile.facility_id,
      title,
      location: location || null,
      shift: shift || null,
      status: status || "draft",

      department: department || null,
      specialty: specialty || null,
      description: description || null,

      city: city || null,
      state: state || null,

      duration_weeks,
      start_date,

      pay_min: payMin || null,
      pay_max: payMax || null,
      pay_display,

      employment_type: employmentType || null,

      posted_at: status === "published" ? new Date().toISOString() : null,
      created_by: user.id,
    });

    if (error) {
      redirect(`/manager/jobs/new?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/manager"); // or "/manager/jobs"
  }

  const errorMsg = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black">Add New Job</h1>
            <p className="mt-2 text-white/75 text-sm font-semibold">
              Create a new job posting for your facility.
            </p>
          </div>

          <a
            href="/manager"
            className="rounded-xl border border-white/20 px-4 py-2 text-xs font-extrabold text-white/90 hover:bg-white/10"
          >
            Back
          </a>
        </div>

        {errorMsg ? (
          <div className="mt-6 rounded-2xl bg-amber-500/20 p-4 ring-1 ring-amber-400/30">
            <div className="text-sm font-black text-amber-200">Error</div>
            <pre className="mt-2 whitespace-pre-wrap text-xs font-semibold text-white/85">
              {errorMsg}
            </pre>
          </div>
        ) : null}

        <form
          action={createJob}
          className="mt-8 space-y-4 rounded-3xl bg-white p-6 text-slate-900 shadow-2xl"
        >
          <div>
            <label className="text-xs font-extrabold text-slate-700">Job Title *</label>
            <input
              name="title"
              required
              className="mt-2 w-full rounded-xl border p-3 font-semibold"
              placeholder="ICU RN"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Location</label>
            <input
              name="location"
              className="mt-2 w-full rounded-xl border p-3 font-semibold"
              placeholder="Charleston, WV"
            />
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Tip: Use “City, ST” — we auto-fill city/state columns.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Shift</label>
              <select name="shift" className="mt-2 w-full rounded-xl border p-3 font-semibold">
                <option value="">—</option>
                <option value="Days">Days</option>
                <option value="Nights">Nights</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Status</label>
              <select name="status" className="mt-2 w-full rounded-xl border p-3 font-semibold">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Department</label>
              <input
                name="department"
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
                placeholder="ICU"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Specialty</label>
              <input
                name="specialty"
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
                placeholder="Critical Care"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Pay Min</label>
              <input
                name="pay_min"
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
                placeholder="1500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Pay Max</label>
              <input
                name="pay_max"
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
                placeholder="2300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Duration (weeks)</label>
              <input
                name="duration_weeks"
                type="number"
                min={1}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
                placeholder="13"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Start Date</label>
              <input
                name="start_date"
                type="date"
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Employment Type</label>
            <input
              name="employment_type"
              className="mt-2 w-full rounded-xl border p-3 font-semibold"
              placeholder="Travel / Contract / PRN"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Description</label>
            <textarea
              name="description"
              rows={5}
              className="mt-2 w-full rounded-xl border p-3 font-semibold"
              placeholder="Describe the position, requirements, and any notes..."
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <a
              href="/manager"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-800"
            >
              Cancel
            </a>

            <button
              type="submit"
              className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
            >
              Create Job
            </button>
          </div>
        </form>

        <p className="mt-6 text-xs font-semibold text-white/60">
          Note: If you enable RLS on <b>jobs</b>, you’ll need an INSERT policy for manager/admin.
        </p>
      </div>
    </div>
  );
}

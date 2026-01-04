export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditJobPage({ params, searchParams }: PageProps) {
  const { id: jobId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const errorMsg = sp?.error ? decodeURIComponent(sp.error) : null;

  if (!jobId) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Missing job ID</h1>
      </div>
    );
  }

  const supabase = await createSupabaseServer();

  // ✅ Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  // ✅ Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, facility_id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");
  if (!profile.facility_id) redirect("/manager?error=no_facility");

  // ✅ Load job
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      "id, facility_id, title, location, shift, status, department, specialty, description, city, state, duration_weeks, start_date, pay_min, pay_max, pay_display, employment_type, posted_at, updated_at"
    )
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Error loading job</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          {jobError.message}
        </pre>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Job not found</h1>
        <p className="mt-2 text-white/80 text-sm font-semibold">
          This job does not exist (or you don’t have access).
        </p>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          jobId: {jobId}
          {"\n"}profile.facility_id: {profile.facility_id}
        </pre>
      </div>
    );
  }

  // ✅ Facility gate
  if (job.facility_id !== profile.facility_id) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Access denied (facility mismatch)</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">
          job.facility_id: {job.facility_id}
          {"\n"}profile.facility_id: {profile.facility_id}
        </pre>
      </div>
    );
  }

  // ✅ Server Action (update)
  async function updateJob(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServer();

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) redirect("/manager/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, facility_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");
    if (!profile.facility_id) redirect(`/manager/jobs/${jobId}/edit?error=no_facility`);

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
    const startDateRaw = String(formData.get("start_date") ?? "").trim();

    if (!title) redirect(`/manager/jobs/${jobId}/edit?error=missing_title`);

    const city = location.includes(",") ? location.split(",")[0]?.trim() : (location || null);
    const state = location.includes(",") ? location.split(",")[1]?.trim() : null;

    const pay_display =
      payMin && payMax ? `$${payMin}–$${payMax}` : payMin ? `$${payMin}+` : null;

    const duration_weeks = durationWeeksRaw ? Number(durationWeeksRaw) : null;
    const start_date = startDateRaw ? startDateRaw : null;

    const posted_at = status === "published" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("jobs")
      .update({
        title,
        location: location || null,
        shift: shift || null,
        status,

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

        posted_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("facility_id", profile.facility_id);

    if (error) redirect(`/manager/jobs/${jobId}/edit?error=${encodeURIComponent(error.message)}`);

    redirect("/manager");
  }

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Edit Job</h1>
            <p className="mt-2 text-white/75 text-sm font-semibold">
              Update this job posting.
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
          action={updateJob}
          className="mt-8 space-y-4 rounded-3xl bg-white p-6 text-slate-900 shadow-2xl"
        >
          <div>
            <label className="text-xs font-extrabold text-slate-700">Job Title *</label>
            <input
              name="title"
              required
              defaultValue={job.title ?? ""}
              className="mt-2 w-full rounded-xl border p-3 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Location</label>
            <input
              name="location"
              defaultValue={job.location ?? ""}
              className="mt-2 w-full rounded-xl border p-3 font-semibold"
              placeholder="Charleston, WV"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Shift</label>
              <select
                name="shift"
                defaultValue={job.shift ?? ""}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              >
                <option value="">—</option>
                <option value="Days">Days</option>
                <option value="Nights">Nights</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Status</label>
              <select
                name="status"
                defaultValue={job.status ?? "draft"}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Pay Min</label>
              <input
                name="pay_min"
                defaultValue={job.pay_min ?? ""}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
                placeholder="1500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Pay Max</label>
              <input
                name="pay_max"
                defaultValue={job.pay_max ?? ""}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
                placeholder="2300"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Description</label>
            <textarea
              name="description"
              defaultValue={job.description ?? ""}
              rows={5}
              className="mt-2 w-full rounded-xl border p-3 font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

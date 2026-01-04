export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-extrabold text-white">
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-xs font-extrabold uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-bold break-words">{value ?? "—"}</div>
    </div>
  );
}

function pretty(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    const maybeDate = Date.parse(v);
    if (!Number.isNaN(maybeDate) && v.includes("T")) {
      try {
        return new Date(v).toLocaleString();
      } catch {
        return v;
      }
    }
    return v;
  }
  return (
    <pre className="whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs font-semibold text-slate-800">
      {JSON.stringify(v, null, 2)}
    </pre>
  );
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  // Next.js 16: params can be a Promise
  params: Promise<{ id?: string }>;
  searchParams?: { saved?: string };
}) {
  const supabase = await createSupabaseServer();
  const { id } = await params;

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  // Profile + gate
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, facility_id, full_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) redirect("/manager/login");
  if (profile.role !== "manager" && profile.role !== "admin") redirect("/");

  const facilityId = profile.facility_id;

  // Guard
  if (!id || id === "undefined" || id === "null") {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Invalid application link</h1>
        <Link className="mt-6 inline-block underline" href="/manager/applications">
          Back to applications
        </Link>
      </div>
    );
  }

  // Load application (all fields)
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (appError || !app) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Application not accessible</h1>
          <Link
            href="/manager/applications"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/15 hover:bg-white/15"
          >
            Back
          </Link>
        </div>
        <pre className="mt-6 whitespace-pre-wrap rounded-2xl bg-black/30 p-4 text-xs">
          {appError?.message ?? "No row returned"}
        </pre>
      </div>
    );
  }

  // Load job (second query) and facility-gate through job
  let job: any = null;
  if (app.job_id) {
    const { data: jobRow } = await supabase
      .from("jobs")
      .select("id, facility_id, title, job_number, location, shift, status")
      .eq("id", app.job_id)
      .single();
    job = jobRow ?? null;
  }
  if (job?.facility_id && job.facility_id !== facilityId) {
    redirect("/manager/applications");
  }

  // ---------- Server Action: Save interview info ----------
  async function saveInterview(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServer();

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) redirect("/manager/login");

    // Pull profile again server-side for safety
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, facility_id")
      .eq("user_id", user.id)
      .single();

    if (!profile || (profile.role !== "manager" && profile.role !== "admin")) {
      redirect("/");
    }

    const appId = String(formData.get("app_id") ?? "");
    const interviewed = formData.get("interviewed") === "on";
    const interview_notes = String(formData.get("interview_notes") ?? "");

    // Optional: validate uuid-ish
    if (!appId || appId === "undefined") redirect("/manager/applications");

    // Update application
    const updatePayload: any = {
      interviewed,
      interview_notes,
      interviewed_at: interviewed ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("applications").update(updatePayload).eq("id", appId);

    if (error) {
      // If you prefer, return a UI error. For now, show it via query param.
      redirect(`/manager/applications/${appId}?saved=error`);
    }

    redirect(`/manager/applications/${appId}?saved=1`);
  }

  const createdAt = app.created_at ? new Date(app.created_at).toLocaleString() : "—";
  const interviewedAt = app.interviewed_at ? new Date(app.interviewed_at).toLocaleString() : "—";

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">{app.full_name ?? "Applicant"}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill>{app.status ?? "new"}</Pill>
              <span className="text-sm font-semibold text-white/70">Submitted: {createdAt}</span>
            </div>

            <div className="mt-3 text-sm font-semibold text-white/75">
              Job: <span className="font-black text-white">{job?.title ?? "—"}</span>{" "}
              <span className="text-white/60">{job?.job_number ? `• #${job.job_number}` : ""}</span>
            </div>
            <div className="mt-1 text-xs font-semibold text-white/60">
              {job?.location ?? "—"} • {job?.shift ?? "—"}
            </div>
          </div>

          <Link
            href="/manager/applications"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/15 hover:bg-white/15"
          >
            Back
          </Link>
        </div>

        {/* Main card */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-lg font-black text-[#0B2B55]">Application Details</h2>
              {searchParams?.saved === "1" ? (
                <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
                  Saved!
                </div>
              ) : searchParams?.saved === "error" ? (
                <div className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-900">
                  Could not save (check RLS / permissions).
                </div>
              ) : null}
            </div>

            <div className="text-right">
              <div className="text-xs font-extrabold uppercase text-slate-500">Interviewed</div>
              <div className="mt-1 text-sm font-black">{app.interviewed ? "Yes" : "No"}</div>
              <div className="mt-1 text-[11px] font-semibold text-slate-500">
                Interviewed at: {interviewedAt}
              </div>
            </div>
          </div>

          {/* Top fields */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={pretty(app.full_name)} />
            <Field label="Email" value={pretty(app.email)} />
            <Field label="Phone" value={pretty(app.phone)} />
            <Field label="License state" value={pretty(app.license_state)} />
            <Field label="Years experience" value={pretty(app.years_experience)} />
          </div>

          {/* Interview panel */}
          <div className="mt-8 rounded-3xl border border-slate-200 p-5">
            <h3 className="text-sm font-black text-[#0B2B55]">Interview Notes</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Save notes from phone screens, in-person interviews, or follow-ups.
            </p>

            <form action={saveInterview} className="mt-4 space-y-4">
              <input type="hidden" name="app_id" value={app.id} />

              <label className="flex items-center gap-3">
                <input
                  name="interviewed"
                  type="checkbox"
                  defaultChecked={!!app.interviewed}
                  className="h-4 w-4"
                />
                <span className="text-sm font-extrabold text-slate-900">
                  Mark as Interviewed
                </span>
              </label>

              <div>
                <div className="text-xs font-extrabold uppercase text-slate-500">Notes</div>
                <textarea
                  name="interview_notes"
                  defaultValue={app.interview_notes ?? ""}
                  rows={8}
                  className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Example: Great communicator. 2 years ICU. Available nights. Needs WV license verification..."
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
              >
                Save Interview Notes
              </button>
            </form>
          </div>

          {/* Optional: show everything else */}
          <div className="mt-8">
            <h3 className="text-sm font-black text-[#0B2B55]">Full JSON</h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-xs font-semibold text-slate-800">
              {JSON.stringify(app, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

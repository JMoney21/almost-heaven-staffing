"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type JobRow = {
  id: string;
  job_number?: number | null;
  title?: string | null;
  city?: string | null;
  state?: string | null;
  shift?: string | null;
  pay_display?: string | null;
  pay_min?: number | null;
  pay_max?: number | null;
  status?: string | null;
};

function money(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function getPay(job: JobRow | null) {
  if (!job) return "—";
  if (job.pay_display) return job.pay_display;
  if (job.pay_min || job.pay_max) {
    return `$${money(Number(job.pay_min ?? 0))} - $${money(Number(job.pay_max ?? 0))} /wk`;
  }
  return "—";
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();

  const raw = params?.job_number;
  const jobNumber = Array.isArray(raw) ? raw[0] : raw;
  const jobNumberInt = jobNumber ? Number(jobNumber) : NaN;

  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [message, setMessage] = useState("");

  // ✅ resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      if (!Number.isFinite(jobNumberInt)) {
        setErr("Invalid job number.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("id,job_number,title,city,state,shift,pay_display,pay_min,pay_max,status")
        .eq("job_number", jobNumberInt)
        .eq("status", "published")
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setErr(error.message);
        setJob(null);
      } else if (!data) {
        setErr("Job not found or not published.");
        setJob(null);
      } else {
        setJob(data as JobRow);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobNumberInt]);

  async function uploadResumeOrNull(): Promise<{ path: string; filename: string } | null> {
    if (!resumeFile) return null;

    // ✅ basic validation
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(resumeFile.type)) {
      throw new Error("Resume must be a PDF, DOC, or DOCX.");
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (resumeFile.size > maxBytes) {
      throw new Error("Resume file is too large (max 10MB).");
    }

    const filename = safeFileName(resumeFile.name);
    const path = `job-${jobNumberInt}/${Date.now()}-${filename}`;

    const { error } = await supabase.storage.from("resumes").upload(path, resumeFile, {
      upsert: false,
      cacheControl: "3600",
      contentType: resumeFile.type,
    });

    if (error) throw new Error(error.message);

    return { path, filename };
  }

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setErr(null);

    try {
      if (!job) throw new Error("Job not loaded yet.");

      // ✅ upload resume first (if provided)
      const uploaded = await uploadResumeOrNull();

      // ✅ insert application tied to the job
      const { error } = await supabase.from("applications").insert({
        job_id: job.id,
        job_number: job.job_number,
        full_name: fullName,
        email,
        phone,
        license_state: licenseState,
        years_experience: yearsExp ? Number(yearsExp) : null,
        message,
        status: "new",
        resume_path: uploaded?.path ?? null,
        resume_filename: uploaded?.filename ?? null,
      });

      if (error) throw new Error(error.message);

      setSuccess("Application submitted! We’ll be in touch soon.");
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] p-8 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">Loading…</div>
      </main>
    );
  }

  if (err && !job) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] p-8 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-black">Apply</h1>
          <p className="mt-3 text-sm font-semibold text-slate-600">{err}</p>
          <button
            onClick={() => router.push("/jobs")}
            className="mt-6 inline-flex rounded-xl bg-[#0B2545] px-5 py-3 text-sm font-black text-white"
          >
            Back to Jobs
          </button>
        </div>
      </main>
    );
  }

  const location = `${job?.city ?? ""}${job?.state ? `, ${job.state}` : ""}`.trim() || "—";

  return (
    <main className="min-h-screen bg-[#F2F2F2] p-8 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="text-xs font-semibold text-slate-500">Applying for Job #{job?.job_number}</div>
          <h1 className="mt-2 text-3xl font-black">{job?.title ?? "Untitled Job"}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">{location}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{job?.shift ?? "—"}</span>
          </div>
          <div className="mt-4 text-lg font-black text-emerald-700">{getPay(job)}</div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <h2 className="text-lg font-black text-[#0B2B55]">Your Info</h2>

          {err ? <div className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{err}</div> : null}
          {success ? (
            <div className="mt-4 rounded bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{success}</div>
          ) : null}

          <form onSubmit={submitApplication} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-slate-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">License state</label>
                <input
                  value={licenseState}
                  onChange={(e) => setLicenseState(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Years experience</label>
                <input
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {/* ✅ RESUME UPLOAD */}
            <div>
              <label className="text-sm font-bold text-slate-700">Resume (PDF, DOC, DOCX)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-slate-500"
              />
              <div className="mt-2 text-xs font-semibold text-slate-500">
                Max size: 10MB
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push(`/jobs/${jobNumberInt}`)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

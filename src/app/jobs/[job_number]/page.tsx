"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type JobRow = {
  id: string;
  job_number?: number | null;
  title?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  shift?: string | null;
  status?: string | null;
  start_date?: string | null;
  duration_weeks?: number | null;
  pay_min?: number | null;
  pay_max?: number | null;
  pay_display?: string | null;
  specialty?: string | null;
  department?: string | null;
  employment_type?: string | null;
  posted_at?: string | null;
  description?: string | null;
};

function money(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
}

export default function JobDetailsByNumberPage() {
  const params = useParams();
  const raw = params?.job_number;
  const jobNumber = Array.isArray(raw) ? raw[0] : raw;
  const jobNumberInt = jobNumber ? Number(jobNumber) : NaN;

  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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
        .select(
          "id,job_number,title,location,city,state,shift,status,start_date,duration_weeks,pay_min,pay_max,pay_display,specialty,department,employment_type,posted_at,description"
        )
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

  const location =
    job?.location ??
    (`${job?.city ?? ""}${job?.state ? `, ${job.state}` : ""}` || "—");

  const pay =
    job?.pay_display ??
    (job?.pay_min || job?.pay_max
      ? `$${money(Number(job?.pay_min ?? 0))} - $${money(
          Number(job?.pay_max ?? 0)
        )} /wk`
      : "—");

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] p-8 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
          Loading job…
        </div>
      </main>
    );
  }

  if (err || !job) {
    return (
      <main className="min-h-screen bg-[#F2F2F2] p-8 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-black">Job Details</h1>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            {err ?? "Not found"}
          </p>

          <a
            href="/jobs"
            className="mt-6 inline-flex rounded-xl bg-[#0B2545] px-5 py-3 text-sm font-black text-white"
          >
            Back to Jobs
          </a>
        </div>
      </main>
    );
  }

  const applyHref = `/apply/${job.job_number}`;

  return (
    <main className="min-h-screen bg-[#F2F2F2] p-8 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="text-xs font-semibold text-slate-500">
            Job #{job.job_number ?? "—"}
          </div>

          <h1 className="mt-2 text-3xl font-black">
            {job.title ?? "Untitled Job"}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {location}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {job.shift ?? "—"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {job.employment_type ?? "Employment type —"}
            </span>
          </div>

          <div className="mt-5 text-lg font-black text-emerald-700">
            {pay}
          </div>

          <div className="mt-2 text-xs font-semibold text-slate-500">
            Posted: {formatDate(job.posted_at)}
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href="/jobs"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
            >
              Back
            </a>

            <a
              href={applyHref}
              className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
            >
              Apply Now
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="text-xs font-extrabold text-slate-600">
              Start Date
            </div>
            <div className="mt-2 text-sm font-semibold">
              {formatDate(job.start_date)}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="text-xs font-extrabold text-slate-600">
              Duration
            </div>
            <div className="mt-2 text-sm font-semibold">
              {job.duration_weeks ? `${job.duration_weeks} weeks` : "—"}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="text-xs font-extrabold text-slate-600">
              Specialty
            </div>
            <div className="mt-2 text-sm font-semibold">
              {job.specialty ?? "—"}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <h2 className="text-lg font-black text-[#0B2B55]">
            Description
          </h2>
          <div className="mt-3 whitespace-pre-wrap text-sm font-semibold text-slate-700">
            {job.description ?? "No description provided yet."}
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type JobRow = {
  id: string;
  job_number?: number | null;

  pay_min?: number | null;
  pay_max?: number | null;

  title?: string | null;
  city?: string | null;
  state?: string | null;

  start_date?: string | null; // date string
  shift?: string | null;

  posted_at?: string | null;

  specialty?: string | null;
  department?: string | null;

  status?: string | null;

  pay_display?: string | null;
};

type Job = {
  id: string;
  jobNumber: number;

  payMin: number;
  payMax: number;
  title: string;
  city: string;
  state: string;
  startDate: string;
  shift: "Days" | "Nights" | "Rotating";
  hoursPerWeek: number;
  posted: string;
  specialtyName: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function FilterRow({ title }: { title: string }) {
  return (
    <button className="flex w-full items-center justify-between border-b border-[#E5E7EB] py-4 text-left">
      <span className="text-sm font-medium text-[#111827]">{title}</span>
      <span className="text-[#6B7280]">⌄</span>
    </button>
  );
}

function formatDate(d: string | null | undefined) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
}

function normalizeShift(s?: string | null): Job["shift"] {
  const v = (s || "").toLowerCase();
  if (v.includes("night")) return "Nights";
  if (v.includes("rot")) return "Rotating";
  return "Days";
}

function mapRowToJob(r: JobRow): Job {
  const payMin = Number(r.pay_min ?? 0);
  const payMax = Number(r.pay_max ?? 0);

  return {
    id: r.id,
    jobNumber: Number(r.job_number ?? 0),
    payMin: Number.isFinite(payMin) ? payMin : 0,
    payMax: Number.isFinite(payMax) ? payMax : 0,
    title: r.title ?? "Untitled",
    city: r.city ?? "",
    state: r.state ?? "",
    startDate: formatDate(r.start_date),
    shift: normalizeShift(r.shift),
    hoursPerWeek: 36,
    posted: formatDate(r.posted_at),
    specialtyName: r.specialty ?? "",
  };
}

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("ICU RN");
  const [resultsPerPage, setResultsPerPage] = useState<number>(24);
  const [sort, setSort] = useState<string>("Default");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setDbError(null);

      const { data, error } = await supabase
        .from("jobs")
        .select("id,job_number,pay_min,pay_max,title,city,state,start_date,shift,posted_at,specialty,status")
        .eq("status", "published")
        .order("posted_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setDbError(error.message);
        setJobs([]);
      } else {
        const mapped = (data ?? []).map((r: any) => mapRowToJob(r as JobRow));
        setJobs(mapped);

        const specialties = new Set(mapped.map((j) => j.specialtyName).filter(Boolean));
        if (selectedSpecialty && !specialties.has(selectedSpecialty)) {
          setSelectedSpecialty("");
        }
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => {
    let list = [...jobs];

    if (selectedSpecialty) {
      list = list.filter((j) => j.specialtyName === selectedSpecialty);
    }

    if (sort === "Pay (High → Low)") {
      list.sort((a, b) => b.payMax - a.payMax);
    }
    if (sort === "Pay (Low → High)") {
      list.sort((a, b) => a.payMin - b.payMin);
    }

    return list;
  }, [jobs, selectedSpecialty, sort]);

  return (
    <main className="min-h-screen bg-[#F2F2F2] text-[#1F2937]">
      <Header />

      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[34px] font-semibold text-[#111827]">Jobs</h1>
            <div className="mt-3 text-sm text-[#6B7280]">
              {loading ? "Loading…" : `${results.length} results`}
            </div>
            {dbError ? (
              <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
                Supabase error: {dbError}
              </div>
            ) : null}
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#374151]">
              <span className="text-[#6B7280]">Results per page</span>
              <select
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(Number(e.target.value))}
                className="h-9 w-[70px] rounded border border-[#D1D5DB] bg-white px-2 text-sm outline-none"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#374151]">
              <span className="text-[#6B7280]">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 w-[220px] rounded border border-[#D1D5DB] bg-white px-2 text-sm outline-none"
              >
                <option>Default</option>
                <option>Pay (High → Low)</option>
                <option>Pay (Low → High)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          {selectedSpecialty ? (
            <button
              onClick={() => setSelectedSpecialty("")}
              className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white"
            >
              Specialty:&nbsp;<span className="font-bold">{selectedSpecialty}</span>
              <span className="ml-1 text-white/80">✕</span>
            </button>
          ) : null}

          <button
            onClick={() => setSelectedSpecialty("")}
            className="text-sm font-medium text-[#6B7280] hover:text-[#111827]"
          >
            Clear all
          </button>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-2">
            <FilterRow title="Start ASAP" />
            <FilterRow title="Department" />
            <FilterRow title="Specialty" />
            <FilterRow title="Estimated weekly pay" />
            <FilterRow title="Work setting" />
            <FilterRow title="Shift type" />
          </aside>

          <section>
            {loading ? (
              <div className="text-sm text-[#6B7280]">Loading jobs…</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.slice(0, resultsPerPage).map((job) => {
                  const canView = Number.isFinite(job.jobNumber) && job.jobNumber > 0;
                  const href = `/jobs/${job.jobNumber}`;

                  return (
                    <article
                      key={job.id}
                      className="rounded-md bg-white shadow-[0_1px_10px_rgba(0,0,0,0.08)]"
                    >
                      <div className="p-5">
                        <div className="text-[11px] text-[#6B7280]">
                          {job.jobNumber ? `Job #${job.jobNumber}` : `ID: ${job.id}`}
                        </div>

                        <div className="mt-1 text-[18px] font-semibold text-[#0E7C66]">
                          ${money(job.payMin)} - ${money(job.payMax)}
                          <span className="text-[12px] font-medium text-[#6B7280]">/wk</span>
                        </div>

                        <div className="mt-2 text-[13px] font-semibold text-[#111827]">
                          {job.title}
                        </div>
                        <div className="mt-1 text-[12px] text-[#6B7280]">
                          {job.city}, {job.state}
                        </div>

                        <div className="mt-4 space-y-2 text-[12px] text-[#374151]">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-4 text-center">📅</span>
                            {job.startDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-4 text-center">🕒</span>
                            3x12 - {job.hoursPerWeek} hrs/wk
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-4 text-center">☀️</span>
                            {job.shift}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-[11px] text-[#9CA3AF]">Posted {job.posted}</div>

                          {canView ? (
                            <Link
                              href={href}
                              className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-[12px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
                            >
                              View job
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#9CA3AF]"
                              title="Missing job number"
                            >
                              View job
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!results.length ? (
                  <div className="col-span-full rounded bg-white p-6 text-sm text-[#6B7280]">
                    No jobs found. If you just added jobs in Supabase, make sure they’re{" "}
                    <b>published</b> and your RLS policy allows public reads of published jobs.
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#2B0B26] text-white shadow-2xl">
        💬
      </button>

      <Footer />
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type JobRow = {
  id: string;
  job_number?: number | null;

  // common db-style columns (snake_case)
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

  // optional display column
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

/** YOUR SITE HEADER */
function Header() {
  return (
    <header className="sticky top-0 z-50">
{/* TOP BAR */}
<div className="bg-[#0B2B55] text-white">
  <div className="mx-auto flex max-w-[1300px] items-center justify-between px-6 py-2 text-sm font-semibold">
    {/* LEFT INFO */}
    <div className="flex items-center gap-8">
      <span>(304) 444-4371</span>
      <span className="uppercase">info@almostheavenstaffing.com</span>
      <span className="hidden md:inline uppercase">
        Mon - Fri: 9:00 - 18:30
      </span>
    </div>

    {/* RIGHT ACTIONS */}
    <div className="flex items-center gap-3">
      {[
        {
          label: "Facebook",
          href: "https://facebook.com/almostheavenstaffing",
          icon: (
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          ),
        },
        {
          label: "Instagram",
          href: "https://instagram.com/almostheavenstaffing",
          icon: (
            <>
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="3.5" />
              <circle cx="17.5" cy="6.5" r="1" />
            </>
          ),
        },
        {
          label: "Twitter",
          href: "https://twitter.com",
          icon: (
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43 2a9 9 0 0 1-2.88 1.1A4.5 4.5 0 0 0 12 7.5v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
          ),
        },
        {
          label: "LinkedIn",
          href: "https://linkedin.com/company/almost-heaven-staffing",
          icon: (
            <>
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <line x1="6" y1="9" x2="6" y2="17" />
              <line x1="6" y1="7" x2="6" y2="7" />
              <line x1="10" y1="9" x2="10" y2="17" />
              <path d="M10 13a4 4 0 0 1 8 0v4" />
            </>
          ),
        },
      ].map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] transition hover:brightness-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {s.icon}
          </svg>
        </a>
      ))}

      {/* LOGIN */}
      <Link
        href="/manager/login"
        className="ml-2 rounded-md border border-white/25 bg-white/5 px-4 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-white/10"
      >
        Login
      </Link>
    </div>
  </div>
</div>


      {/* NAVBAR */}
      <div className="relative bg-white shadow-md">
        <div className="mx-auto max-w-[1300px] px-6">
          <div className="relative flex h-[84px] items-center justify-between">
            {/* LOGO OVERHANG */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <Image
                src="/logo.png"
                alt="Almost Heaven Staffing"
                width={300}
                height={180}
                priority
                className="w-[220px] translate-y-8 object-contain md:w-[260px]"
              />
            </div>

            {/* NAV */}
            <nav className="ml-[260px] hidden items-center gap-10 lg:flex">
              {(["Home", "Meet us", "Traveler", "Pages", "News", "Explore Jobs"] as const).map(
                (label) => {
                  const isActive = label === "Explore Jobs";
                  return (
                    <a
                      key={label}
                      href={label === "Home" ? "/" : "#"}
                      className={[
                        "relative pb-2 text-[17px] font-extrabold",
                        isActive ? "text-[#F6B400]" : "text-[#24324A]",
                        "hover:text-[#F6B400]",
                      ].join(" ")}
                    >
                      {label}
                      <span
                        className={[
                          "absolute left-0 -bottom-[6px] h-[3px] w-full bg-[#F6B400]",
                          isActive ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                      />
                    </a>
                  );
                }
              )}
            </nav>

            {/* BUTTONS */}
            <div className="flex items-center gap-4">
              <a
                href="#apply"
                className="rounded-md bg-[#F6B400] px-7 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply Now
              </a>
              <a
                href="#request"
                className="rounded-md border-[3px] border-[#0B2545] bg-white px-7 py-3 text-sm font-extrabold text-[#24324A] hover:bg-slate-50"
              >
                Request Staff
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
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
            <div className="mt-3 text-sm text-[#6B7280]">{loading ? "Loading…" : `${results.length} results`}</div>
            {dbError ? <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">Supabase error: {dbError}</div> : null}
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

          <button onClick={() => setSelectedSpecialty("")} className="text-sm font-medium text-[#6B7280] hover:text-[#111827]">
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
                    <article key={job.id} className="rounded-md bg-white shadow-[0_1px_10px_rgba(0,0,0,0.08)]">
                      <div className="p-5">
                        <div className="text-[11px] text-[#6B7280]">{job.jobNumber ? `Job #${job.jobNumber}` : `ID: ${job.id}`}</div>

                        <div className="mt-1 text-[18px] font-semibold text-[#0E7C66]">
                          ${money(job.payMin)} - ${money(job.payMax)}
                          <span className="text-[12px] font-medium text-[#6B7280]">/wk</span>
                        </div>

                        <div className="mt-2 text-[13px] font-semibold text-[#111827]">{job.title}</div>
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

                          {/* ✅ ONLY CHANGE YOU NEEDED: View job link */}
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
                    No jobs found. If you just added jobs in Supabase, make sure they’re <b>published</b> and your RLS policy allows public reads of published jobs.
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#2B0B26] text-white shadow-2xl">💬</button>
    </main>
  );
}

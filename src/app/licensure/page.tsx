// src/app/licensure/page.tsx

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const steps = [
  {
    title: "1) Start with Your Goal",
    description:
      "Pick the state(s) you want to work in and your timeline. Licensure can take days to weeks depending on the state and your paperwork.",
  },
  {
    title: "2) Know if You’re Compact (NLC) Eligible",
    description:
      "If your primary residence is in a Nurse Licensure Compact (NLC) state, you may qualify for a multistate license that lets you work in other compact states without applying again.",
  },
  {
    title: "3) Gather the Common Requirements",
    description:
      "Most states ask for a current RN license, verification, fingerprints/background check, and sometimes transcripts. Requirements vary—always check the state board website.",
  },
  {
    title: "4) Apply + Track Your Status",
    description:
      "Submit the application, pay the fee, and keep a checklist. Missing one document is the #1 reason licenses get delayed.",
  },
  {
    title: "5) Plan for Renewals",
    description:
      "Each state has its own renewal schedule and continuing education rules. Track renewal dates so you don’t lose eligibility mid-assignment.",
  },
];

const commonDocs = [
  "Government ID",
  "RN license verification (Nursys for many states)",
  "Employment history (sometimes required)",
  "Fingerprints / background check",
  "Transcripts (some states)",
  "CE documentation (if applicable)",
  "Name-change documents (if applicable)",
];

const tips = [
  {
    title: "Don’t guess—confirm requirements",
    description:
      "Always verify details on the Board of Nursing site. Even small differences (fingerprinting vendor, address formatting) can cause delays.",
  },
  {
    title: "Use one folder for everything",
    description:
      "Keep a “Licensure” folder with PDFs of your BLS/ACLS, license verification, ID, receipts, and emails so you can reuse it for each state.",
  },
  {
    title: "Apply early if you’re on a deadline",
    description:
      "If you’re targeting a start date, begin the process ASAP. Background checks and transcripts can be the slowest parts.",
  },
  {
    title: "Ask us for help",
    description:
      "If you’re working with Almost Heaven Staffing, we’ll help you map out timelines and stay on track so licensure doesn’t hold up your contract.",
  },
];

function Card({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
      <h3 className="text-lg font-black text-[#0B2B55]">{title}</h3>
      <p className="mt-2 text-slate-600 font-semibold leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function LicensurePage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* HERO */}
        <div className="rounded-3xl bg-white p-10 shadow-md ring-1 ring-slate-200">
          <div className="max-w-3xl">
            <div className="text-xs font-extrabold tracking-wide text-[#F6B400]">
              Licensure Guide
            </div>
            <h1 className="mt-3 text-4xl font-black text-[#0B2B55]">
              Travel Nurse Licensure Made Simple
            </h1>
            <p className="mt-4 text-slate-600 font-semibold leading-relaxed">
              State licensing doesn’t have to be confusing. Here’s a clear,
              traveler-friendly guide to help you plan, apply, and avoid delays.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                Browse Jobs
              </Link>
              <Link
                href="/apply"
                className="rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply Now
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#0B2545] ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Ask a Recruiter
              </Link>
            </div>

            <div className="mt-6 rounded-2xl bg-[#F4F6FA] p-5 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                <span className="font-black text-[#0B2B55]">Quick note:</span>{" "}
                Rules vary by state and can change. Use this page as a roadmap,
                then confirm details with the state Board of Nursing.
              </p>
            </div>
          </div>
        </div>

        {/* STEPS */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-[#0B2B55]">
            The 5-Step Licensure Roadmap
          </h2>
          <p className="mt-2 max-w-3xl text-slate-600 font-semibold leading-relaxed">
            Follow this process and you’ll avoid the most common delays.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.title} title={s.title} description={s.description} />
            ))}
          </div>
        </div>

        {/* DOCS + CHECKLIST */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-[#0B2B55]">
              Common Documents Checklist
            </h2>
            <p className="mt-2 text-slate-600 font-semibold leading-relaxed">
              Many states ask for the same items. Having these ready can speed
              things up.
            </p>

            <ul className="mt-5 space-y-3">
              {commonDocs.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 rounded-2xl bg-[#F4F6FA] p-4 ring-1 ring-slate-200"
                >
                  <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] font-black">
                    ✓
                  </span>
                  <span className="text-slate-700 font-semibold">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-[#0B2B55]">
              Compact vs. Non-Compact
            </h2>
            <p className="mt-2 text-slate-600 font-semibold leading-relaxed">
              Understanding this is one of the biggest time-savers.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[#F4F6FA] p-5 ring-1 ring-slate-200">
                <h3 className="font-black text-[#0B2B55]">
                  Nurse Licensure Compact (NLC)
                </h3>
                <p className="mt-2 text-slate-700 font-semibold leading-relaxed">
                  If you live in an NLC state and meet eligibility, you may
                  qualify for a multistate license that lets you practice in
                  other compact states without applying for separate licenses.
                </p>
              </div>

              <div className="rounded-2xl bg-[#F4F6FA] p-5 ring-1 ring-slate-200">
                <h3 className="font-black text-[#0B2B55]">Non-Compact States</h3>
                <p className="mt-2 text-slate-700 font-semibold leading-relaxed">
                  For non-compact states (or if you’re not eligible for an NLC
                  multistate license), you’ll apply for licensure by endorsement
                  in each state you plan to work.
                </p>
              </div>

              <p className="text-sm text-slate-500 font-semibold">
                Tip: If you’re unsure what applies to you, contact us and we’ll
                help you map out the fastest path based on your goals.
              </p>
            </div>
          </div>
        </div>

        {/* TIPS */}
        <div className="mt-14">
          <h2 className="text-2xl font-black text-[#0B2B55]">
            Pro Tips to Avoid Delays
          </h2>
          <p className="mt-2 max-w-3xl text-slate-600 font-semibold leading-relaxed">
            These are the small things that save big time.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tips.map((t) => (
              <Card key={t.title} title={t.title} description={t.description} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl bg-[#0B2B55] p-10 text-white shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-black">
                Want help with a specific state?
              </h3>
              <p className="mt-2 text-white/90 font-semibold leading-relaxed">
                Tell us where you’re headed and your timeline. We’ll help you
                plan the steps so licensure doesn’t delay your start date.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Contact Us
              </Link>
              <Link
                href="/apply"
                className="rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

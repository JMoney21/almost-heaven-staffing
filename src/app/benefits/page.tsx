// src/app/benefits/page.tsx

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const nurseBenefits = [
  {
    title: "Transparent Pay Packages",
    description:
      "Clear weekly breakdowns (taxable + stipends when applicable) so you know exactly what you’re earning.",
  },
  {
    title: "Fast, Real Communication",
    description:
      "Quick responses, honest answers, and a recruiter team that stays present before and during your contract.",
  },
  {
    title: "Contract & Onboarding Support",
    description:
      "We help you review expectations, timelines, and compliance requirements so you start confident.",
  },
  {
    title: "Assignment Fit First",
    description:
      "We prioritize your specialty, goals, and unit readiness—not just filling a slot.",
  },
  {
    title: "Problem-Solving During the Contract",
    description:
      "If something changes on the unit, schedule, or onboarding side, we’ll help you handle it professionally.",
  },
  {
    title: "Long-Term Career Momentum",
    description:
      "Extension strategy and next-step planning so you’re not scrambling at the end of every assignment.",
  },
];

const facilityBenefits = [
  {
    title: "Quality-First Candidate Matching",
    description:
      "We focus on readiness and fit—clinical skillset, unit experience, and professional communication.",
  },
  {
    title: "Reliable Coverage",
    description:
      "Responsive staffing support and consistent follow-through to reduce last-minute gaps.",
  },
  {
    title: "Smooth Onboarding",
    description:
      "We help travelers come prepared so your managers aren’t chasing documents and deadlines.",
  },
  {
    title: "Partner Mentality",
    description:
      "We treat facilities like partners—clear expectations, fast updates, and accountability.",
  },
  {
    title: "Retention Through Support",
    description:
      "Supported clinicians stay focused and show up strong—improving outcomes and unit stability.",
  },
  {
    title: "Scalable Staffing Solutions",
    description:
      "From single placements to larger coverage needs, we can help you scale intelligently.",
  },
];

const faqs = [
  {
    q: "Do you help me understand my pay package?",
    a: "Yes—our goal is clarity. We’ll walk through taxable pay, stipends (when applicable), reimbursements, and any bonus structure so you understand what you’re accepting.",
  },
  {
    q: "Can I request specific locations or shift types?",
    a: "Absolutely. Tell us your preferences—location, shift, unit type, and scheduling needs—and we’ll prioritize opportunities that match your goals.",
  },
  {
    q: "What happens if there’s an issue on the unit?",
    a: "You can reach us. We’ll help you navigate concerns professionally and work toward a solution with the facility when appropriate.",
  },
  {
    q: "Do you work with facilities directly?",
    a: "Yes. We support facility partners with responsive communication, candidate matching, and a commitment to smooth onboarding and coverage.",
  },
];

function BenefitCard({
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

export default function BenefitsPage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* HERO */}
        <div className="rounded-3xl bg-white p-10 shadow-md ring-1 ring-slate-200">
          <div className="max-w-3xl">
            <div className="text-xs font-extrabold tracking-wide text-[#F6B400]">
              Benefits & Support
            </div>
            <h1 className="mt-3 text-4xl font-black text-[#0B2B55]">
              Built for travelers. Trusted by facilities.
            </h1>
            <p className="mt-4 text-slate-600 font-semibold leading-relaxed">
              Almost Heaven Staffing is built around clarity, consistency, and
              real support—before, during, and after each assignment.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                View Jobs
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
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* FOR NURSES */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-[#0B2B55]">
            Benefits for Travel Nurses
          </h2>
          <p className="mt-2 max-w-3xl text-slate-600 font-semibold leading-relaxed">
            You deserve an agency that communicates fast, keeps things clear,
            and supports you like a partner—not a number.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nurseBenefits.map((b) => (
              <BenefitCard
                key={b.title}
                title={b.title}
                description={b.description}
              />
            ))}
          </div>
        </div>

        {/* FOR FACILITIES */}
        <div className="mt-14">
          <h2 className="text-2xl font-black text-[#0B2B55]">
            Benefits for Healthcare Facilities
          </h2>
          <p className="mt-2 max-w-3xl text-slate-600 font-semibold leading-relaxed">
            We help you staff responsibly with strong communication, reliable
            follow-through, and clinicians who come prepared.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facilityBenefits.map((b) => (
              <BenefitCard
                key={b.title}
                title={b.title}
                description={b.description}
              />
            ))}
          </div>
        </div>

        {/* CTA STRIP */}
        <div className="mt-14 rounded-3xl bg-[#0B2B55] p-10 text-white shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-black">Ready to move forward?</h3>
              <p className="mt-2 text-white/90 font-semibold leading-relaxed">
                Whether you’re a traveler looking for the right fit or a
                facility needing dependable coverage—let’s talk.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
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
                className="rounded-full bg-transparent px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/30 hover:bg-white/10"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14 rounded-3xl bg-white p-10 shadow-md ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-[#0B2B55]">FAQ</h2>
          <p className="mt-2 max-w-3xl text-slate-600 font-semibold leading-relaxed">
            Quick answers to common questions.
          </p>

          <div className="mt-6 space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl bg-[#F4F6FA] p-6">
                <h3 className="text-base font-black text-[#0B2B55]">
                  {item.q}
                </h3>
                <p className="mt-2 text-slate-600 font-semibold leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

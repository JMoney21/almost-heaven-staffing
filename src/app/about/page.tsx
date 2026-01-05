import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* PAGE INTRO */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#0B2B55]">
            About Almost Heaven Staffing
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600 font-semibold leading-relaxed">
            Almost Heaven Staffing connects dedicated healthcare professionals
            with facilities that need dependable, high-quality coverage. We
            focus on clear communication, strong matches, and reliable support
            throughout every assignment.
          </p>
        </div>

        {/* CORE VALUES */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Fast & Reliable",
              desc: "We move quickly without sacrificing quality. Our streamlined process gets nurses to work fast.",
            },
            {
              title: "Nurse-Focused",
              desc: "We treat nurses like professionals — with transparency, respect, and real recruiter support.",
            },
            {
              title: "Facility-Ready",
              desc: "Every clinician we place is screened, prepared, and ready to step in confidently.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <h3 className="text-lg font-black text-[#0B2B55]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* STORY + MISSION */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-[#0B2B55]">
              Our Story
            </h2>
            <p className="mt-4 text-slate-700 font-medium leading-relaxed">
              Almost Heaven Staffing was built to improve the experience of
              healthcare staffing for both nurses and facilities. We saw a need
              for an agency that prioritizes communication, consistency, and
              quality — not volume.
            </p>
            <p className="mt-4 text-slate-700 font-medium leading-relaxed">
              Our approach is simple: match the right clinician to the right
              environment, provide ongoing support, and maintain high standards
              from application through completion of the assignment.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
            <h2 className="text-2xl font-black text-[#0B2B55]">
              Our Mission
            </h2>

            <ul className="mt-5 space-y-4">
              {[
                "Support nurses with fair pay and clear expectations",
                "Provide facilities with dependable, skilled professionals",
                "Maintain transparency throughout the staffing process",
                "Build long-term relationships based on trust",
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] font-black">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WHO WE SERVE */}
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-[#0B2B55]">
            Who We Serve
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <h3 className="text-lg font-black text-[#0B2B55]">
                Nurses & Clinicians
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">
                We offer travel and local contract opportunities with strong
                pay, fast onboarding, and ongoing recruiter support.
              </p>
              <Link
                href="/apply"
                className="mt-4 inline-flex rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply Now →
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <h3 className="text-lg font-black text-[#0B2B55]">
                Healthcare Facilities
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">
                We help facilities fill critical staffing needs quickly with
                clinicians who are ready to perform from day one.
              </p>
              <Link
                href="/request-staff"
                className="mt-4 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                Request Staff →
              </Link>
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="mt-12 rounded-3xl bg-[#0B2B55] p-8 text-white shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Ready to get started?
              </h2>
              <p className="mt-2 text-white/85 font-semibold">
                Apply today or request staffing support.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/apply"
                className="rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply as a Nurse
              </Link>
              <Link
                href="/request-staff"
                className="rounded-full bg-white/10 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-white/15"
              >
                Request Staff
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

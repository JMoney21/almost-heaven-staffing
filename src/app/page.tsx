// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      {/* HERO */}
      {/* Add padding-top so the sticky header + overhanging logo don’t cover the hero */}
      <section id="home" className="relative h-[88vh] overflow-hidden pt-[40px]">
        {/* HERO BACKGROUND IMAGE */}
        <Image
          src="/hero.jpg"
          alt="Mountain background"
          fill
          priority
          className="object-cover object-center"
        />

        {/* OVERLAY for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/25 to-slate-900/55" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* LEFT TEXT */}
            <div className="text-white">
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                Your Partner in <br />
                Adventure & Care.
              </h1>

              <p className="mt-4 max-w-xl text-white/90 text-lg font-medium">
                Top travel assignments + fast placements + real support.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/apply"
                  className="rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 shadow hover:bg-amber-300"
                >
                  Apply as a Nurse
                </Link>

                <Link
                  href="/request-staff"
                  className="rounded-full bg-slate-900/60 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-slate-900/70"
                >
                  Request Staff
                </Link>
              </div>

              <ul className="mt-6 space-y-2 text-sm font-semibold text-white/90">
                {["Fast credentialing", "Weekly pay", "24/7 recruiter support"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-900 font-black">
                      ✓
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 shadow-2xl">
                <Image
                  src="/nurse.png"
                  alt="Nurse"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              <div className="absolute -bottom-6 left-1/2 w-[92%] -translate-x-1/2 rounded-2xl bg-white/90 p-4 shadow-xl ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-600">Contracts up to</div>
                    <div className="text-2xl font-black text-slate-900">$90/hr</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-600">Start dates weekly:</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      ICU • ER • Med-Surg • Tele
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GET STARTED BAR */}
          <div className="mt-14 rounded-2xl bg-white/90 p-3 shadow-2xl ring-1 ring-slate-200">
            <form className="grid gap-3 md:grid-cols-4">
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Your Name"
              />
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Your Email"
              />
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Phone Number"
              />
              <button
                type="button"
                className="h-12 rounded-xl bg-amber-400 text-sm font-extrabold text-slate-900 shadow hover:bg-amber-300"
              >
                Get Started →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight">How It Works</h2>
            <p className="mt-2 text-slate-600 font-semibold">
              Simple steps to your next{" "}
              <span className="underline decoration-amber-400 decoration-4 underline-offset-4">
                adventure
              </span>{" "}
              in nursing.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {[
              { n: "1", t: "Apply", img: "/how-it-works/apply.png" },
              { n: "2", t: "Get Matched", img: "/how-it-works/matched.png" },
              { n: "3", t: "Recruiter", img: "/how-it-works/recruiter.png" },
              { n: "4", t: "Start Contract", img: "/how-it-works/contract.png" },
              { n: "5", t: "We Handle It", img: "/how-it-works/handled.png" },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex justify-center">
                  <div className="relative h-[110px] w-full">
                    <Image
                      src={s.img}
                      alt={s.t}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 20vw"
                      priority={s.n === "1"}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-black ring-1 ring-slate-200">
                    {s.n}
                  </div>
                  <div className="font-extrabold">{s.t}</div>
                </div>

                <div className="mt-2 text-sm font-semibold text-slate-600">
                  Short supporting line goes here.
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/jobs"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
            >
              View all jobs
            </Link>
          </div>
        </div>
      </section>

      {/* FRESH READS */}
      <section className="bg-[#F4F6FA]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-[#0B2B55]">Fresh Reads</h2>
            <p className="mt-2 font-semibold text-slate-600">
              Insights, tips, and updates for travel nurses.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                date: "FEB 3, 2025",
                title: "We Go the Extra Mile for Healthcare Traveler Care",
                img: "/blog/blog-1.png",
              },
              {
                date: "JUN 10, 2024",
                title: "12 Must-Know Perks and Programs for Travel Nurses",
                img: "/blog/blog-2.png",
              },
              {
                date: "JAN 29, 2024",
                title: "How Almost Heaven Staffing Supports BSN Nurses",
                img: "/blog/blog-3.png",
              },
            ].map((post, i) => (
              <Link
                key={i}
                href="/blog"
                className="group overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <Image src={post.img} alt={post.title} fill className="object-cover" />
                </div>

                <div className="flex h-[210px] flex-col justify-between p-6">
                  <div>
                    <div className="text-xs font-extrabold tracking-wide text-[#F6B400]">
                      {post.date}
                    </div>
                    <h3 className="mt-3 text-lg font-black leading-snug text-[#0B2B55]">
                      {post.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Read article</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2B55] font-black transition group-hover:scale-110">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CALLOUT SECTION – MOUNTAIN BACKGROUND */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Mountain background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2545]/90 via-[#0B2545]/75 to-[#0B2545]/60" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="relative overflow-hidden rounded-[28px] shadow-2xl rotate-[-3deg]">
                <Image
                  src="/blog/blog-1.png"
                  alt="Healthcare professionals collaborating"
                  width={700}
                  height={500}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="text-white">
              <h2 className="text-3xl font-black leading-tight md:text-4xl">
                Need talented healthcare staff?{" "}
                <span className="text-amber-400">Look no further.</span>
              </h2>

              <p className="mt-5 max-w-xl text-white/90 text-base font-medium leading-relaxed">
                Almost Heaven Staffing is selective in the best way. We hold our nurses
                and clinicians to high standards to ensure strong, reliable matches
                between facilities and caregivers.
              </p>

              <p className="mt-4 max-w-xl text-white/85 text-base font-medium leading-relaxed">
                From long-term contracts to hard-to-fill needs, we connect healthcare
                organizations with professionals who genuinely want to make an impact.
              </p>

              <div className="mt-8">
                <Link
                  href="/request-staff"
                  className="inline-flex items-center rounded-full bg-amber-400 px-7 py-3 text-sm font-extrabold text-[#0B2545] shadow hover:bg-amber-300"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

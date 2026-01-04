// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

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
                className="w-[220px] md:w-[260px] object-contain translate-y-8"
              />
            </div>

            {/* NAV */}
            <nav className="hidden lg:flex items-center gap-10 ml-[260px]">
              {(["Home", "Meet us", "Traveler", "Pages", "News", "Explore Jobs"] as const).map(
                (label) => {
                  const isActive = label === "Home";
                  return (
                    <a
                      key={label}
                      href="#"
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
              {/* UPDATED APPLY LINK */}
              <Link
                href="/apply"
                className="rounded-md bg-[#F6B400] px-7 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply Now
              </Link>

              {/* UPDATED REQUEST LINK */}
              <Link
                href="/request-staff"
                className="rounded-md border-[3px] border-[#0B2545] bg-white px-7 py-3 text-sm font-extrabold text-[#24324A] hover:bg-slate-50"
              >
                Request Staff
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

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
                {/* UPDATED APPLY LINK */}
                <Link
                  href="/apply"
                  className="rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 shadow hover:bg-amber-300"
                >
                  Apply as a Nurse
                </Link>

                {/* UPDATED REQUEST LINK */}
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
                <Image src="/nurse.png" alt="Nurse" fill className="object-cover object-top" priority />
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
        { n: "5", t: "We Handle It", img: "/how-it-works/handled.png" }, // make sure file exists
      ].map((s) => (
        <div
          key={s.n}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex justify-center">
            {/* ✅ give Image fill a REAL box */}
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
      {/* ✅ route to jobs page */}
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
              <article
                key={i}
                className="group overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <Image src={post.img} alt={post.title} fill className="object-cover" />
                </div>

                <div className="flex h-[210px] flex-col justify-between p-6">
                  <div>
                    <div className="text-xs font-extrabold tracking-wide text-[#F6B400]">{post.date}</div>
                    <h3 className="mt-3 text-lg font-black leading-snug text-[#0B2B55]">{post.title}</h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Read article</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2B55] font-black transition group-hover:scale-110">
                      →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CALLOUT SECTION – MOUNTAIN BACKGROUND */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/hero-bg.jpg" alt="Mountain background" fill priority className="object-cover object-center" />
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
                Need talented healthcare staff? <span className="text-amber-400">Look no further.</span>
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

      {/* FOOTER */}
      <footer className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image src="/hero-bg.jpg" alt="Mountain background" fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B2B55]/85 via-[#0B2545]/90 to-[#081a31]/95" />
        </div>

        <div className="relative h-1 w-full bg-[#F6B400]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="Almost Heaven Staffing" width={170} height={70} className="w-[170px] object-contain" />
              <div className="hidden sm:block">
                <div className="text-sm font-extrabold tracking-wide">Almost Heaven Staffing</div>
                <div className="text-xs text-white/70">Adventure-ready nurses. Facility-ready staffing.</div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-extrabold text-white/85">
              {[
                { label: "Home", href: "#home" },
                { label: "Nurses", href: "#nurses" },
                { label: "Facilities", href: "#facilities" },
                { label: "Jobs", href: "#jobs" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="hover:text-[#F6B400] transition">
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {[
                { label: "Facebook", href: "#", icon: "f" },
                { label: "Instagram", href: "#", icon: "◎" },
                { label: "Twitter", href: "#", icon: "𝕏" },
                { label: "LinkedIn", href: "#", icon: "in" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-black text-white hover:bg-[#F6B400] hover:text-[#0B2545] transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 h-px w-full bg-white/15" />

          <div className="mt-6 flex flex-col gap-3 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Almost Heaven Staffing. All rights reserved.</div>

            <div className="flex flex-wrap gap-4 font-semibold">
              <a className="hover:text-white" href="/privacy">
                Privacy Policy
              </a>
              <a className="hover:text-white" href="/eeo">
                EEO Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

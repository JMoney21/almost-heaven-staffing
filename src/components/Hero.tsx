// src/components/Hero.tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[88vh] overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero-bg.jpg"
        alt="Mountains"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/35 to-slate-900/60" />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-14 text-white">
        <h1 className="text-4xl font-black leading-tight md:text-5xl">
          Adventure-ready nurses. <br />
          Facility-ready staffing.
        </h1>

        <p className="mt-4 max-w-xl text-white/90 text-lg font-semibold">
          Top travel assignments + fast placements + real support.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/apply"
            className="rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
          >
            Apply Now
          </a>
          <a
            href="/request"
            className="rounded-full bg-white/10 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-white/15"
          >
            Request Staff
          </a>
        </div>
      </div>
    </section>
  );
}

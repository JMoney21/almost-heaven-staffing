import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden text-white">
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt="Mountain background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2B55]/85 via-[#0B2545]/90 to-[#081a31]/95" />
      </div>

      <div className="relative h-1 w-full bg-[#F6B400]" />

      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Almost Heaven Staffing"
              width={170}
              height={70}
              className="w-[170px] object-contain"
            />
            <div className="hidden sm:block">
              <div className="text-sm font-extrabold tracking-wide">
                Almost Heaven Staffing
              </div>
              <div className="text-xs text-white/70">
                Adventure-ready nurses. Facility-ready staffing.
              </div>
            </div>
          </div>

          {/* ✅ Updated to real routes instead of # anchors */}
          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-extrabold text-white/85">
            {[
              { label: "Home", href: "/" },
              { label: "Apply", href: "/apply" },
              { label: "Request Staff", href: "/request-staff" },
              { label: "Jobs", href: "/jobs" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-[#F6B400] transition">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* ✅ Updated social hrefs (you can replace any you want) */}
          <div className="flex items-center gap-3">
            {[
              { label: "Facebook", href: "https://facebook.com/almostheavenstaffing", icon: "f" },
              { label: "Instagram", href: "https://instagram.com/almostheavenstaffing", icon: "◎" },
              { label: "Twitter", href: "https://twitter.com", icon: "𝕏" },
              { label: "LinkedIn", href: "https://linkedin.com/company/almost-heaven-staffing", icon: "in" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
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
            <Link className="hover:text-white" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-white" href="/eeo">
              EEO Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

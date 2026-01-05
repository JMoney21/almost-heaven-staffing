"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Jobs", href: "/jobs" },
  { label: "Blog", href: "/blog" },
  { label: "Rewards", href: "/base-camp-rewards" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="bg-[#0B2B55] text-white">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-6 py-2 text-sm font-semibold">
          {/* LEFT INFO */}
          <div className="flex items-center gap-8">
            <span>(304) 444-4371</span>
            <span className="uppercase hidden sm:inline">info@almostheavenstaffing.com</span>
            <span className="hidden md:inline uppercase">Mon - Fri: 9:00 - 18:30</span>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {[
              {
                label: "Facebook",
                href: "https://facebook.com/almostheavenstaffing",
                icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
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
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] transition hover:brightness-95"
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
              <Link href="/" aria-label="Go to home">
                <Image
                  src="/logo.png"
                  alt="Almost Heaven Staffing"
                  width={300}
                  height={180}
                  priority
                  className="w-[220px] md:w-[260px] object-contain translate-y-8"
                />
              </Link>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-10 ml-[260px]">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "relative pb-2 text-[17px] font-extrabold",
                      active ? "text-[#F6B400]" : "text-[#24324A]",
                      "hover:text-[#F6B400]",
                    ].join(" ")}
                  >
                    {item.label}
                    <span
                      className={[
                        "absolute left-0 -bottom-[6px] h-[3px] w-full bg-[#F6B400] transition",
                        active ? "opacity-100" : "opacity-0",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT SIDE (DESKTOP BUTTONS + MOBILE HAMBURGER) */}
            <div className="flex items-center gap-3">
              {/* Desktop buttons */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/apply"
                  className="rounded-md bg-[#F6B400] px-7 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
                >
                  Apply Now
                </Link>
                <Link
                  href="/request-staff"
                  className="rounded-md border-[3px] border-[#0B2545] bg-white px-7 py-3 text-sm font-extrabold text-[#24324A] hover:bg-slate-50"
                >
                  Request Staff
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
              >
                {/* Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {open ? (
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M4 7h16M4 12h16M4 17h16"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* MOBILE MENU PANEL */}
          <div
            className={[
              "md:hidden overflow-hidden transition-[max-height,opacity] duration-300",
              open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {/* Links */}
              <div className="flex flex-col">
                {nav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold",
                        active ? "bg-amber-50 text-[#0B2B55] ring-1 ring-amber-200" : "text-[#24324A] hover:bg-slate-50",
                      ].join(" ")}
                      onClick={() => setOpen(false)}
                    >
                      <span>{item.label}</span>
                      <span className="text-[#F6B400] font-black">→</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile CTAs */}
              <div className="mt-4 grid gap-3">
                <Link
                  href="/apply"
                  onClick={() => setOpen(false)}
                  className="h-12 rounded-xl bg-[#F6B400] text-center text-sm font-extrabold leading-[48px] text-[#0B2545] hover:brightness-95"
                >
                  Apply Now
                </Link>
                <Link
                  href="/request-staff"
                  onClick={() => setOpen(false)}
                  className="h-12 rounded-xl border-[3px] border-[#0B2545] bg-white text-center text-sm font-extrabold leading-[44px] text-[#24324A] hover:bg-slate-50"
                >
                  Request Staff
                </Link>
              </div>

              {/* Small socials row (mobile) */}
              <div className="mt-4 flex items-center gap-2">
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-black text-slate-900 hover:bg-amber-50 hover:border-amber-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile backdrop to close on tap outside */}
        {open && (
          <button
            aria-label="Close menu backdrop"
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 top-[140px] z-[-1] bg-black/10"
          />
        )}
      </div>
    </header>
  );
}

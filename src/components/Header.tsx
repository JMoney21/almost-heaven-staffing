"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type NavItem =
  | { type: "link"; label: string; href: string }
  | {
      type: "dropdown";
      label: string;
      items: { label: string; href: string }[];
    };

const NAV: NavItem[] = [
  { type: "link", label: "Home", href: "/" },
  { type: "link", label: "About", href: "/about" },
  { type: "link", label: "Jobs", href: "/jobs" },
  { type: "link", label: "Blog", href: "/blog" },
  {
    type: "dropdown",
    label: "Resources",
    items: [
      { label: "Benefits", href: "/benefits" },
      { label: "Licensure", href: "/licensure" },
    ],
  },
  { type: "link", label: "Rewards", href: "/base-camp-rewards" },
  { type: "link", label: "Contact", href: "/contact" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpenDesktop, setResourcesOpenDesktop] = useState(false);
  const [resourcesOpenMobile, setResourcesOpenMobile] = useState(false);

  // ✅ Auth state (for top-bar button)
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [authed, setAuthed] = useState<boolean>(false);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setResourcesOpenDesktop(false);
    setResourcesOpenMobile(false);
  }, [pathname]);

  // ✅ Determine if logged in (and stay updated)
  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setAuthed(Boolean(data?.user));
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const resources = useMemo(
    () =>
      NAV.find((x) => x.type === "dropdown" && x.label === "Resources") as
        | Extract<NavItem, { type: "dropdown" }>
        | undefined,
    []
  );

  const resourcesHasActive = useMemo(() => {
    if (!resources) return false;
    return resources.items.some((i) => isActivePath(pathname, i.href));
  }, [pathname, resources]);

  // ✅ Dashboard routing by role (server decides)
  async function goDashboard() {
    try {
      const res = await fetch("/api/auth/route-by-role", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Routing failed");
      router.push(json.redirectTo || "/");
    } catch {
      // fallback
      router.push("/");
    }
  }

  return (
    <header className="sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="bg-[#0B2B55] text-white">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-6 py-2 text-sm font-semibold">
          <div className="flex items-center gap-8">
            <span>(304) 444-4371</span>
            <span className="uppercase hidden sm:inline">info@almostheavenstaffing.com</span>
            <span className="hidden md:inline uppercase">Mon - Fri: 9:00 - 18:30</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Socials (hide on very small screens) */}
            {[
              { label: "Facebook", href: "https://facebook.com/almostheavenstaffing" },
              { label: "Instagram", href: "https://instagram.com/almostheavenstaffing" },
              { label: "Twitter", href: "https://twitter.com" },
              { label: "LinkedIn", href: "https://linkedin.com/company/almost-heaven-staffing" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] font-black transition hover:brightness-95"
              >
                {s.label === "Facebook" ? "f" : s.label === "Instagram" ? "◎" : s.label === "Twitter" ? "𝕏" : "in"}
              </a>
            ))}

            {/* ✅ UPDATED LOGIN / DASHBOARD BUTTON */}
            {!authed ? (
              <Link
                href="/login"
                className="ml-2 rounded-md border border-white/25 bg-white/5 px-4 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-white/10"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={goDashboard}
                className="ml-2 rounded-md border border-white/25 bg-white/5 px-4 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-white/10"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <div className="relative bg-white shadow-md">
        <div className="mx-auto max-w-[1300px] px-6">
          <div className="relative flex h-[84px] items-center justify-between">
            {/* LOGO OVERHANG */}
            <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 z-0">
              <Link href="/" className="pointer-events-auto inline-block" aria-label="Home">
                <Image
                  src="/logo.png"
                  alt="Almost Heaven Staffing"
                  width={300}
                  height={180}
                  priority
                  className="w-[220px] translate-y-8 object-contain md:w-[260px]"
                />
              </Link>
            </div>

            {/* DESKTOP NAV */}
            <nav className="ml-[260px] hidden items-center gap-10 lg:flex relative z-10">
              {NAV.map((item) => {
                if (item.type === "link") {
                  const active = isActivePath(pathname, item.href);
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
                }

                // Dropdown
                const active = resourcesHasActive;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setResourcesOpenDesktop(true)}
                    onMouseLeave={() => setResourcesOpenDesktop(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setResourcesOpenDesktop((v) => !v)}
                      className={[
                        "relative pb-2 text-[17px] font-extrabold",
                        active ? "text-[#F6B400]" : "text-[#24324A]",
                        "hover:text-[#F6B400]",
                      ].join(" ")}
                      aria-expanded={resourcesOpenDesktop}
                      aria-haspopup="menu"
                    >
                      Resources <span className="ml-1">⌄</span>
                      <span
                        className={[
                          "absolute left-0 -bottom-[6px] h-[3px] w-full bg-[#F6B400] transition",
                          active ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                      />
                    </button>

                    <div
                      className={[
                        "absolute left-0 top-full mt-3 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden",
                        resourcesOpenDesktop ? "block" : "hidden",
                      ].join(" ")}
                      role="menu"
                    >
                      {item.items.map((dd) => {
                        const ddActive = isActivePath(pathname, dd.href);
                        return (
                          <Link
                            key={dd.href}
                            href={dd.href}
                            className={[
                              "block px-4 py-3 text-sm font-extrabold transition",
                              ddActive ? "bg-amber-50 text-[#0B2B55]" : "text-[#24324A] hover:bg-slate-50",
                            ].join(" ")}
                            role="menuitem"
                          >
                            {dd.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4 relative z-20">
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
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {mobileOpen ? (
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
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
              mobileOpen ? "max-h-[720px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2">
                {NAV.map((item) => {
                  if (item.type === "link") {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold transition",
                          active
                            ? "bg-amber-50 text-[#0B2B55] ring-1 ring-amber-200"
                            : "text-[#24324A] hover:bg-slate-50",
                        ].join(" ")}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span>{item.label}</span>
                        <span className="text-[#F6B400] font-black">→</span>
                      </Link>
                    );
                  }

                  return (
                    <div key={item.label} className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setResourcesOpenMobile((v) => !v)}
                        className={[
                          "w-full flex items-center justify-between px-4 py-3 text-sm font-extrabold",
                          resourcesHasActive ? "bg-amber-50 text-[#0B2B55]" : "bg-white text-[#24324A]",
                        ].join(" ")}
                        aria-expanded={resourcesOpenMobile}
                      >
                        <span>Resources</span>
                        <span className="text-[#F6B400]">{resourcesOpenMobile ? "⌃" : "⌄"}</span>
                      </button>

                      <div className={resourcesOpenMobile ? "block" : "hidden"}>
                        {item.items.map((dd) => {
                          const ddActive = isActivePath(pathname, dd.href);
                          return (
                            <Link
                              key={dd.href}
                              href={dd.href}
                              onClick={() => setMobileOpen(false)}
                              className={[
                                "block px-4 py-3 text-sm font-extrabold border-t border-slate-200",
                                ddActive
                                  ? "bg-amber-50 text-[#0B2B55]"
                                  : "bg-slate-50 text-[#24324A] hover:bg-slate-100",
                              ].join(" ")}
                            >
                              {dd.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile CTAs */}
              <div className="mt-4 grid gap-3">
                <Link
                  href="/apply"
                  onClick={() => setMobileOpen(false)}
                  className="h-12 rounded-xl bg-[#F6B400] text-center text-sm font-extrabold leading-[48px] text-[#0B2545] hover:brightness-95"
                >
                  Apply Now
                </Link>
                <Link
                  href="/request-staff"
                  onClick={() => setMobileOpen(false)}
                  className="h-12 rounded-xl border-[3px] border-[#0B2545] bg-white text-center text-sm font-extrabold leading-[44px] text-[#24324A] hover:bg-slate-50"
                >
                  Request Staff
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tap-outside backdrop */}
        {mobileOpen && (
          <button
            aria-label="Close menu backdrop"
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 top-[140px] z-[-1] bg-black/10"
          />
        )}
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { label: "Dashboard", href: "/manager" },
  { label: "Job Postings", href: "/manager/jobs" },
  { label: "Applicants & Forms", href: "/manager/applications" },
  { label: "Employees", href: "/manager/employees" },
  { label: "Points & Rewards", href: "/manager/points" },

  // ✅ Rentals
  { label: "Rentals", href: "/manager/rentals" },

  { label: "Reports & Analytics", href: "/manager/reports" },
  { label: "Messages", href: "/manager/messages" },
  { label: "Settings", href: "/manager/settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/manager") return pathname === "/manager";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-bg.jpg"
          alt="Mountains"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#0B2545]/85" />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white/95 backdrop-blur border-r border-slate-200">
          <div className="px-6 py-6">
            <Image
              src="/logo.png"
              alt="Almost Heaven Staffing"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>

          <nav className="px-4 space-y-1">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "block rounded-xl px-4 py-3 text-sm font-extrabold transition",
                    active
                      ? "bg-amber-50 text-[#0B2B55] ring-1 ring-amber-200"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

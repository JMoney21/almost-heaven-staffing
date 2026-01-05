// src/app/contact/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Simple mailto fallback (works instantly). Replace later with Supabase/API route.
    const mailto = `mailto:info@almostheavenstaffing.com?subject=${encodeURIComponent(
      form.subject || "Contact Request"
    )}&body=${encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    )}`;

    window.location.href = mailto;
  }

  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      {/* HERO BACKDROP */}
      <section className="relative overflow-hidden pt-[40px]">
        {/* Background image (use your homepage hero) */}
        <div className="absolute inset-0">
          <Image
            src="/hero.jpg"
            alt="Mountain background"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#071A33]/35 via-[#071A33]/60 to-[#071A33]/80" />
          {/* Soft vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.35)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-16">
          {/* Title */}
          <div className="text-center text-white">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Get in <span className="text-[#F6B400]">Touch</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-white/85 md:text-base">
              Have questions or just want to say hello? We’re here to help!
            </p>
          </div>

          {/* Cards */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="rounded-3xl bg-white/10 p-6 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-md">
              <div className="text-lg font-black">Contact Information</div>

              <div className="mt-5 space-y-4 text-sm font-semibold text-white/90">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    ✉️
                  </span>
                  <div>
                    <div className="text-white/80 text-xs font-extrabold uppercase">Email</div>
                    <a
                      href="mailto:info@almostheavenstaffing.com"
                      className="hover:text-[#F6B400] transition"
                    >
                      info@almostheavenstaffing.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    📞
                  </span>
                  <div>
                    <div className="text-white/80 text-xs font-extrabold uppercase">Phone</div>
                    <a href="tel:+13044444371" className="hover:text-[#F6B400] transition">
                      (304) 444-4371
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    📍
                  </span>
                  <div>
                    <div className="text-white/80 text-xs font-extrabold uppercase">Location</div>
                    <div>Charleston, WV</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="text-xs font-extrabold text-white/85 uppercase">Office Hours</div>
                <div className="mt-1 text-sm font-semibold text-white/90">
                  Mon – Fri: 9:00 – 18:30
                </div>
              </div>
            </div>

            {/* Send a Message */}
            <div className="rounded-3xl bg-white/10 p-6 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-md">
              <div className="text-lg font-black">Send Us a Message</div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your Name*"
                  required
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-[#F6B400]/60"
                />
                <input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Your Email*"
                  type="email"
                  required
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-[#F6B400]/60"
                />
                <input
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  placeholder="Subject"
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-[#F6B400]/60"
                />
                <textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Your Message"
                  rows={5}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-[#F6B400]/60"
                />

                <button
                  type="submit"
                  className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#FFD15A] to-[#F6B400] text-sm font-extrabold text-[#0B2545] shadow-lg hover:brightness-95"
                >
                  Send Message
                </button>

                <div className="text-xs font-semibold text-white/70">
                  Prefer email?{" "}
                  <a
                    className="font-extrabold text-[#F6B400] hover:underline"
                    href="mailto:info@almostheavenstaffing.com"
                  >
                    info@almostheavenstaffing.com
                  </a>
                </div>
              </form>
            </div>
          </div>

          {/* Social row */}
          <div className="mt-10 text-center text-white">
            <div className="text-sm font-extrabold tracking-wide text-white/85">
              Connect With Us
            </div>

            <div className="mt-4 flex justify-center gap-3">
              {[
                { label: "Facebook", href: "https://facebook.com/almostheavenstaffing", icon: "f" },
                { label: "X", href: "https://twitter.com", icon: "𝕏" },
                { label: "Instagram", href: "https://instagram.com/almostheavenstaffing", icon: "◎" },
                { label: "LinkedIn", href: "https://linkedin.com/company/almost-heaven-staffing", icon: "in" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-white ring-1 ring-white/15 transition hover:bg-[#F6B400] hover:text-[#0B2545]"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/apply"
                className="rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply Now →
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

"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ManagerLoginPortal() {
  const router = useRouter();

  const supabase = useMemo(() => {
    return createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErr("Invalid login credentials");
      return;
    }

    router.push("/manager");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081b34]">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero.jpg"
          alt="Mountains"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Warm sunrise overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-300/25 via-[#0B2B55]/65 to-[#061A33]/90" />
        {/* extra contrast at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-5 py-14">
        <div className="grid w-full items-center gap-10 md:grid-cols-2">
          {/* LEFT PANEL */}
          <section className="text-white">
            <div className="flex items-center gap-4">
              {/* Big logo on the left like your mock */}
              <div className="relative h-20 w-72">
                <Image
                  src="/logo.png"
                  alt="Almost Heaven Staffing"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>

            <h1 className="mt-8 text-4xl font-black tracking-tight text-[#F6B400]">
              Manager Portal
            </h1>

            <p className="mt-3 max-w-xl text-sm font-semibold text-white/85 leading-relaxed">
              Secure access to job postings, applicants, messages, and reports — all in one place.
            </p>

            <ul className="mt-6 space-y-3 text-sm font-semibold text-white/85">
              {[
                "Facility-scoped access (your data only)",
                "Fast job posting + application review",
                "Built for nurses, recruiters, and managers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] font-black shadow">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* RIGHT LOGIN CARD */}
          <section className="mx-auto w-full max-w-md">
            <div className="rounded-[28px] border border-white/20 bg-white/12 p-7 shadow-2xl backdrop-blur-xl">
              {/* logo above sign-in (the one you asked to swap) */}
              <div className="relative mx-auto mb-4 h-75 w-44">
                <Image
                  src="/logo.png"
                  alt="Almost Heaven Staffing"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                />
              </div>

              <h2 className="text-center text-2xl font-black text-[#F6B400]">
                Sign in
              </h2>
              <p className="mt-2 text-center text-xs font-semibold text-white/75">
                Use your manager email and password.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold text-white/80">
                    Email
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white placeholder:text-white/40 outline-none focus:border-[#F6B400]/70 focus:ring-2 focus:ring-[#F6B400]/25"
                    placeholder="you@almostheavenstaffing.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold text-white/80">
                    Password
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white placeholder:text-white/40 outline-none focus:border-[#F6B400]/70 focus:ring-2 focus:ring-[#F6B400]/25"
                    placeholder="••••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>

                {err && (
                  <div className="rounded-2xl border border-red-300/25 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100">
                    {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-[#F6B400] text-sm font-black text-[#0B2545] shadow hover:brightness-95 disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <div className="pt-1 text-center text-xs font-semibold text-white/70">
                  Having trouble? Contact admin support.
                </div>

                <div className="pt-2 text-center text-[11px] font-semibold text-white/55">
                  © {new Date().getFullYear()} Almost Heaven Staffing • Secure Manager Access
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom tiny footer like the mock */}
      <div className="relative pb-6 text-center text-[11px] font-semibold text-white/55">
        © {new Date().getFullYear()} Almost Heaven Staffing • Secure Manager Access
      </div>
    </main>
  );
}

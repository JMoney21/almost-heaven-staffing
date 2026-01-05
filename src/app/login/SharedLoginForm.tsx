"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function SharedLoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // If a "next" param is provided, use it
      if (next) {
        router.push(next);
        router.refresh();
        return;
      }

      // Otherwise route by role by calling our server route
      const res = await fetch("/api/auth/route-by-role", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Login routing failed");

      router.push(json.redirectTo || "/");
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={signIn} className="mt-6 space-y-3">
      <div>
        <label className="text-xs font-extrabold text-slate-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="mt-2 w-full rounded-xl border p-3 font-semibold"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-700">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="mt-2 w-full rounded-xl border p-3 font-semibold"
          placeholder="••••••••"
        />
      </div>

      {msg ? (
        <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">
          {msg}
        </div>
      ) : null}

      <button
        disabled={busy}
        className="w-full rounded-xl bg-[#F6B400] py-3 font-black text-[#0B2545] disabled:opacity-60"
      >
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

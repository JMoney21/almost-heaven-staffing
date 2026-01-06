"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function SharedLoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (next) {
        router.push(next);
        router.refresh();
        return;
      }

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
      {/* ...rest unchanged... */}
    </form>
  );
}

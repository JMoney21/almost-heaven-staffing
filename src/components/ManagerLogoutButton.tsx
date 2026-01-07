"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function ManagerLogoutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/manager/login");
    router.refresh(); // clears cached server components
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-white/15"
    >
      Logout
    </button>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function EmployeeLoginPage() {
  // If already logged in, go to dashboard
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data?.user) redirect("/employee/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#061A33] text-white">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
        <h1 className="text-2xl font-black text-[#0B2B55]">Employee Login</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Sign in to view your assignments, points, and referrals.
        </p>

        {/* NOTE: You likely already have a login flow elsewhere.
            Plug your existing auth UI here (magic link, password, etc.). */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          Use your existing Supabase Auth UI here.
          <div className="mt-2 text-xs text-slate-500">
            (If you tell me whether you’re using magic links or email/password,
            I’ll paste the exact working form.)
          </div>
        </div>
      </div>
    </div>
  );
}

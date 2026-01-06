export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import SharedLoginForm from "./SharedLoginForm";

type PageProps = {
  searchParams?: Promise<{ error?: string; next?: string }>;
};

function safeDecode(v?: string) {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export default async function LoginPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServer();

  // If already logged in, route immediately
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = profile?.role ?? null;

    if (role === "manager" || role === "admin") redirect("/manager/employees");
    if (role === "employee") redirect("/employee/dashboard");

    // Fallback if role missing
    redirect("/");
  }

  const sp = searchParams ? await searchParams : undefined;
  const errorMsg = safeDecode(sp?.error);
  const next = safeDecode(sp?.next) || "";

  return (
    <div className="min-h-screen relative bg-cover bg-center text-white bg-[#061A33]">
      <div className="mx-auto max-w-md px-6 py-14">
        <div className="rounded-3xl bg-white/95 backdrop-blur p-8 text-slate-900 shadow-2xl">
          <h1 className="text-2xl font-black text-[#0B2B55]">Sign in</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Employees and managers use the same login.
          </p>

          {errorMsg ? (
            <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">
              {errorMsg}
            </div>
          ) : null}

          <SharedLoginForm next={next} />
        </div>

        <div className="mt-6 text-center text-xs font-semibold text-white/70">
          Almost Heaven Staffing
        </div>
      </div>
    </div>
  );
}

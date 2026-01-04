// =====================================================
// FILE 2: src/app/manager/employees/new/page.tsx
// =====================================================
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams?: { err?: string };
}) {
  const supabase = await createSupabaseServer();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) redirect("/manager/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  async function createEmployee(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServer();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) redirect("/manager/login");

    const full_name = String(formData.get("full_name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    if (!full_name || !email) {
      redirect("/manager/employees/new?err=" + encodeURIComponent("Full name and email are required."));
    }

    // ✅ Insert and REQUIRE id returned
    const { data: inserted, error } = await supabase
      .from("employees")
      .insert({
        manager_user_id: user.id,
        full_name,
        email,
        phone: phone || null,
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      redirect("/manager/employees/new?err=" + encodeURIComponent(error.message));
    }

    if (!inserted?.id) {
      redirect("/manager/employees/new?err=" + encodeURIComponent("Employee created but no id returned."));
    }

    redirect(`/manager/employees/${inserted.id}`);
  }

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <a href="/manager/employees" className="text-xs font-extrabold text-white/70 hover:underline">
            ← Back to employees
          </a>
          <h1 className="mt-2 text-3xl font-black">Add Employee</h1>
          <p className="mt-1 text-sm font-semibold text-white/75">Create an employee record for assignments.</p>
        </div>

        {searchParams?.err ? (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm font-extrabold text-rose-900 ring-1 ring-rose-200">
            {searchParams.err}
          </div>
        ) : null}

        <form action={createEmployee} className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700">Full name</label>
            <input
              name="full_name"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              placeholder="jane@email.com"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700">Phone (optional)</label>
            <input
              name="phone"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              placeholder="(555) 555-5555"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
          >
            Create Employee
          </button>

          <a
            href="/manager/employees"
            className="block text-center text-xs font-extrabold text-slate-600 hover:underline"
          >
            Cancel
          </a>
        </form>
      </div>
    </div>
  );
}

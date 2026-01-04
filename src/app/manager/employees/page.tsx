export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

function PageShell({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">{children}</div>
    </div>
  );
}

export default async function EmployeesPage() {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, full_name, email, phone, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <PageShell>
        <h1 className="text-2xl font-black">Employees</h1>
        <pre className="whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm">{error.message}</pre>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black">Employees</h1>
          <p className="mt-1 text-sm font-semibold text-white/75">
            Add employees, assign contracts, and track completion.
          </p>
        </div>

        <a
          href="/manager/employees/new"
          className="rounded-xl bg-[#F6B400] px-5 py-3 text-sm font-black text-[#0B2545] hover:brightness-95"
        >
          + Add Employee
        </a>
      </div>

      <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#0B2B55]">Your Team</h2>
        </div>

        <div className="mt-5 space-y-3">
          {(employees ?? []).length ? (
            employees!.map((e: any) => (
              <a
                key={e.id}
                href={`/manager/employees/${e.id}`}
                className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-extrabold">{e.full_name}</div>
                    <div className="text-sm font-semibold text-slate-600">
                      {e.email} {e.phone ? `• ${e.phone}` : ""}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      Added: {new Date(e.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">
                    {e.status}
                  </span>
                </div>
              </a>
            ))
          ) : (
            <div className="text-sm font-semibold text-slate-600">
              No employees yet. Click “Add Employee”.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

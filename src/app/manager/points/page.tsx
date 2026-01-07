export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import ManagerPointsClient from "./ui";

type EmployeeForUI = {
  employee_id: string; // employees.id
  user_id: string; // employees.user_id
  full_name: string | null;
  email: string | null;
  status: string | null;
  disabled: boolean | null;
};

export default async function ManagerPointsPage() {
  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authedUser = authData?.user;
  if (authError || !authedUser) redirect("/manager/login");

  // Role gate (manager/admin only)
  const { data: mgrProfile, error: mgrProfileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", authedUser.id)
    .single();

  if (mgrProfileError || !mgrProfile) redirect("/manager/login");
  if (mgrProfile.role !== "manager" && mgrProfile.role !== "admin") redirect("/");

  // Employees (SHOW ALL)
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, user_id, full_name, email, status, disabled, created_at")
    .order("created_at", { ascending: false });

  const employeesForUI: EmployeeForUI[] = (employees ?? []).map((e: any) => ({
    employee_id: e.id,
    user_id: e.user_id,
    full_name: e.full_name ?? null,
    email: e.email ?? null,
    status: e.status ?? null,
    disabled: e.disabled ?? null,
  }));

  // Balances (GLOBAL)
  const { data: balances, error: balancesError } = await supabase
    .from("points_balances")
    .select("employee_id, total_points");

  // Rewards (GLOBAL list)
  // If your rewards are facility-based, remove this global load and filter by facility instead.
  const { data: rewards, error: rewardsError } = await supabase
    .from("rewards")
    .select("id, title, description, cost, active, inventory, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Points & Rewards</h1>
            <p className="mt-1 text-sm font-semibold text-white/70">
              Manage employee points and the reward catalog.
            </p>
          </div>

          <a
            href="/manager"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            ← Back
          </a>
        </div>

        {(employeesError || balancesError || rewardsError) ? (
          <pre className="whitespace-pre-wrap rounded-2xl bg-black/30 p-4 text-xs text-white/80">
            {JSON.stringify(
              {
                employeesError: employeesError?.message ?? null,
                balancesError: balancesError?.message ?? null,
                rewardsError: rewardsError?.message ?? null,
                debug: {
                  employeesTotal: employees?.length ?? 0,
                  balancesTotal: balances?.length ?? 0,
                },
              },
              null,
              2
            )}
          </pre>
        ) : null}

        <ManagerPointsClient
          initialEmployees={employeesForUI}
          initialBalances={balances ?? []}
          initialRewards={rewards ?? []}
        />
      </div>
    </div>
  );
}

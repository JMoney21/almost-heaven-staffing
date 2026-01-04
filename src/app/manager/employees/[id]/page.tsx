export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  updateEmployeeAction,
  awardPointsAction,
  addContractAction,
  updateContractAction,
  endContractAction,
  deleteContractAction,
} from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EmployeeDetailPage({ params, searchParams }: PageProps) {
  const { id: employeeId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const errorMsg = sp?.error ? decodeURIComponent(sp.error) : null;

  if (!employeeId) {
    return (
      <div className="min-h-screen bg-[#061A33] p-10 text-white">
        <h1 className="text-2xl font-black">Missing employee ID</h1>
      </div>
    );
  }

  const supabase = await createSupabaseServer();

  // AUTH
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect("/manager/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  // EMPLOYEE
  const { data: employee, error: empErr } = await supabase
    .from("employees")
    .select("id, full_name, email, phone, status")
    .eq("id", employeeId)
    .maybeSingle();

  if (empErr || !employee) redirect("/manager/employees");

  /**
   * JOB_SELECT:
   * Only include columns that exist on your jobs table.
   * You said: "complete job details besides description"
   * So we intentionally do NOT select "description".
   *
   * If you get another "column jobs.X does not exist", remove X from this list.
   */
  const JOB_SELECT = `
    id,
    title,
    location,
    hospital_name,
    hospital_address,
    created_at
  `;

  // JOBS FOR DROPDOWN
  const { data: jobs, error: jobsErr } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .order("title", { ascending: true });

  const jobsList = jobs ?? [];

  // CONTRACTS
  const { data: contractsRaw, error: contractErr } = await supabase
    .from("employee_assignments")
    .select("id, contract_id, status, pay_rate, start_date, created_at, assigned_by, job_id")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  // map contract.job_id -> jobs.id
  const jobIds = Array.from(new Set((contractsRaw ?? []).map((c: any) => c.job_id).filter(Boolean)));

  const { data: jobsForContracts } = jobIds.length
    ? await supabase.from("jobs").select(JOB_SELECT).in("id", jobIds)
    : { data: [] as any[] };

  const jobsMap = new Map((jobsForContracts ?? []).map((j: any) => [j.id, j]));

  const contracts = (contractsRaw ?? []).map((c: any) => {
    const job = c.job_id ? jobsMap.get(c.job_id) : null;
    return { ...c, job };
  });

  // POINTS
  const { data: transactions, error: ptsErr } = await supabase
    .from("points_transactions")
    .select("id, points, type, reason, created_at")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  const totalPoints = (transactions ?? []).reduce((sum: number, t: any) => sum + (t.points ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#061A33] p-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        {errorMsg ? <div className="rounded-xl bg-amber-500/20 p-3 text-xs font-bold">{errorMsg}</div> : null}

        {/* EMPLOYEE */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          <h2 className="text-lg font-black text-[#0B2B55]">Employee</h2>

          <form action={updateEmployeeAction.bind(null, employeeId)} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Full name</label>
              <input
                name="full_name"
                required
                defaultValue={employee.full_name ?? ""}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Email</label>
              <input
                name="email"
                required
                defaultValue={employee.email ?? ""}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Phone</label>
              <input
                name="phone"
                defaultValue={employee.phone ?? ""}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Status</label>
              <select
                name="status"
                defaultValue={employee.status ?? "active"}
                className="mt-2 w-full rounded-xl border p-3 font-semibold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button className="w-full rounded-xl bg-[#F6B400] py-3 font-black text-[#0B2545]">
              Save Employee
            </button>
          </form>
        </div>

        {/* CONTRACTS */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          <h2 className="text-lg font-black text-[#0B2B55]">Contracts</h2>

          {contractErr ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
              {contractErr.message}
            </pre>
          ) : null}

          {/* ASSIGN */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-black text-[#0B2B55]">+ Assign Contract</summary>

            {jobsErr ? (
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
                {jobsErr.message}
              </pre>
            ) : null}

            {jobsList.length === 0 ? (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700">
                No jobs available.
              </div>
            ) : (
              <form action={addContractAction.bind(null, employeeId)} className="mt-4 space-y-3">
                <select name="job_id" required className="w-full rounded-xl border p-3 font-semibold" defaultValue="">
                  <option value="" disabled>
                    Select a job…
                  </option>
                  {jobsList.map((j: any) => (
                    <option key={j.id} value={j.id}>
                      {j.title} – {j.location}
                    </option>
                  ))}
                </select>

                <input
                  name="pay_rate"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Weekly Pay (e.g., 2500)"
                  className="w-full rounded-xl border p-3 font-semibold"
                />

                <input
                  name="start_date"
                  type="date"
                  required
                  className="w-full rounded-xl border p-3 font-semibold"
                />

                <button className="w-full rounded-xl bg-[#F6B400] py-3 font-black text-[#0B2545]">
                  Assign Contract
                </button>
              </form>
            )}
          </details>

          {/* LIST */}
          {contracts.length ? (
            <div className="mt-5 space-y-3">
              {contracts.map((c: any) => {
                const job = c.job;

                const jobTitle = job?.title ?? "Unknown job";
                const jobLocation = job?.location ?? "";

                const hospitalName = job?.hospital_name ?? "";
                const hospitalAddress = job?.hospital_address ?? "";

                const jobEntries = job
                  ? Object.entries(job).filter(([k, v]) => k !== "id" && v !== null && v !== "")
                  : [];

                return (
                  <details key={c.id} className="rounded-2xl border p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-black">
                            {jobTitle}{" "}
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                              {String(c.status ?? "").toUpperCase()}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-500">{jobLocation}</div>

                          {hospitalName ? (
                            <div className="mt-1 text-xs font-bold text-slate-700">
                              {hospitalName}
                              {hospitalAddress ? (
                                <div className="text-xs font-semibold text-slate-500">{hospitalAddress}</div>
                              ) : null}
                            </div>
                          ) : null}

                          <div className="mt-2 text-xs font-semibold text-slate-600">
                            Pay: <span className="font-black">${c.pay_rate}/week</span> • Start:{" "}
                            <span className="font-black">{c.start_date}</span>
                          </div>

                          {/* Debug for Unknown job */}
                          <div className="mt-1 text-[11px] text-slate-400">job_id: {String(c.job_id ?? "NULL")}</div>
                        </div>

                        <div className="text-xs font-bold text-slate-400">
                          {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                        </div>
                      </div>
                    </summary>

                    {/* JOB DETAILS */}
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <div className="text-xs font-black text-slate-700">Job Details</div>

                      {job ? (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {jobEntries.map(([key, val]) => (
                            <div key={key} className="rounded-lg border bg-white p-3">
                              <div className="text-[11px] font-extrabold text-slate-500">{key}</div>
                              <div className="text-sm font-bold text-slate-900">{String(val)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm font-semibold text-slate-600">
                          No job found for this contract. That means the contract’s <span className="font-black">job_id</span> is missing or doesn’t match a jobs.id row.
                        </div>
                      )}
                    </div>

                    {/* EDIT CONTRACT */}
                    <form
                      action={updateContractAction.bind(null, employeeId, c.id)}
                      className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="text-xs font-extrabold text-slate-700">Status</label>
                          <select
                            name="status"
                            defaultValue={c.status ?? "active"}
                            className="mt-2 w-full rounded-xl border p-3 text-sm font-semibold"
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-extrabold text-slate-700">Weekly Pay</label>
                          <input
                            name="pay_rate"
                            type="number"
                            min="1"
                            step="1"
                            required
                            defaultValue={c.pay_rate ?? ""}
                            className="mt-2 w-full rounded-xl border p-3 text-sm font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-extrabold text-slate-700">Start Date</label>
                          <input
                            name="start_date"
                            type="date"
                            required
                            defaultValue={c.start_date ?? ""}
                            className="mt-2 w-full rounded-xl border p-3 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white">
                          Save Changes
                        </button>

                        <button
                          type="submit"
                          formAction={endContractAction.bind(null, employeeId, c.id)}
                          className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white"
                        >
                          Mark Completed
                        </button>

                        <button
                          type="submit"
                          formAction={deleteContractAction.bind(null, employeeId, c.id)}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  </details>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 text-sm font-semibold text-slate-600">No contracts yet.</div>
          )}
        </div>

        {/* POINTS */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
          <h2 className="text-lg font-black text-[#0B2B55]">Points Wallet</h2>

          {ptsErr ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
              {ptsErr.message}
            </pre>
          ) : null}

          <div className="mt-2 text-3xl font-black">{totalPoints}</div>
          <div className="text-xs font-semibold text-slate-500">Current Balance</div>

          <form action={awardPointsAction.bind(null, employeeId)} className="mt-4 space-y-2">
            <input
              name="points"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Points"
              className="w-full rounded-xl border p-3 font-semibold"
            />
            <input
              name="reason"
              placeholder="Reason (shift pickup, bonus, etc)"
              className="w-full rounded-xl border p-3 font-semibold"
            />
            <button className="w-full rounded-xl bg-slate-900 py-3 font-black text-white">
              Award Points
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {(transactions ?? []).length ? (
              (transactions ?? []).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <div>
                    <div className="font-bold">{tx.reason || tx.type}</div>
                    <div className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                  <div className={tx.points > 0 ? "font-black text-emerald-600" : "font-black text-rose-600"}>
                    {tx.points > 0 ? "+" : ""}
                    {tx.points}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm font-semibold text-slate-600">No point activity yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

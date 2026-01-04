"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function updateEmployeeAction(employeeId: string, formData: FormData) {
  const supabase = await createSupabaseServer();

  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();

  if (!full_name || !email) redirect(`/manager/employees/${employeeId}?error=missing_fields`);

  const { error } = await supabase
    .from("employees")
    .update({ full_name, email, phone: phone || null, status })
    .eq("id", employeeId);

  if (error) redirect(`/manager/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);

  redirect(`/manager/employees/${employeeId}`);
}

export async function awardPointsAction(employeeId: string, formData: FormData) {
  const supabase = await createSupabaseServer();

  const points = Number(formData.get("points"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!points || points <= 0) redirect(`/manager/employees/${employeeId}?error=invalid_points`);

  const { error } = await supabase.from("points_transactions").insert({
    employee_id: employeeId,
    points,
    type: "earn",
    reason,
  });

  if (error) redirect(`/manager/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);

  redirect(`/manager/employees/${employeeId}`);
}

export async function addContractAction(employeeId: string, formData: FormData) {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) redirect(`/manager/employees/${employeeId}?error=not_authenticated`);

  const job_id = String(formData.get("job_id") ?? "");
  const start_date = String(formData.get("start_date") ?? "").trim();

  const pay_rate_raw = String(formData.get("pay_rate") ?? "").trim();
  const pay_rate = pay_rate_raw ? Number(pay_rate_raw) : NaN;

  if (!job_id) redirect(`/manager/employees/${employeeId}?error=missing_job`);
  if (!start_date) redirect(`/manager/employees/${employeeId}?error=missing_start_date`);
  if (!Number.isFinite(pay_rate) || pay_rate <= 0)
    redirect(`/manager/employees/${employeeId}?error=missing_pay_rate`);

  const { error: endErr } = await supabase
    .from("employee_assignments")
    .update({ status: "completed" })
    .eq("employee_id", employeeId)
    .eq("status", "active");

  if (endErr) redirect(`/manager/employees/${employeeId}?error=${encodeURIComponent(endErr.message)}`);

  const { error: insErr } = await supabase.from("employee_assignments").insert({
    employee_id: employeeId,
    job_id,
    pay_rate,
    start_date,
    status: "active",
    assigned_by: user.id,
  });

  if (insErr) redirect(`/manager/employees/${employeeId}?error=${encodeURIComponent(insErr.message)}`);

  redirect(`/manager/employees/${employeeId}`);
}

export async function updateContractAction(employeeId: string, contractRowId: string, formData: FormData) {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect(`/manager/employees/${employeeId}?error=not_authenticated`);

  const status = String(formData.get("status") ?? "active").trim();
  const start_date = String(formData.get("start_date") ?? "").trim();

  const pay_rate_raw = String(formData.get("pay_rate") ?? "").trim();
  const pay_rate = pay_rate_raw ? Number(pay_rate_raw) : NaN;

  if (!start_date) redirect(`/manager/employees/${employeeId}?error=missing_start_date`);
  if (!Number.isFinite(pay_rate) || pay_rate <= 0)
    redirect(`/manager/employees/${employeeId}?error=missing_pay_rate`);

  const { error } = await supabase
    .from("employee_assignments")
    .update({ status, start_date, pay_rate })
    .eq("id", contractRowId)
    .eq("employee_id", employeeId);

  if (error) redirect(`/manager/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);

  redirect(`/manager/employees/${employeeId}`);
}

export async function endContractAction(employeeId: string, contractRowId: string) {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect(`/manager/employees/${employeeId}?error=not_authenticated`);

  const { error } = await supabase
    .from("employee_assignments")
    .update({ status: "completed" })
    .eq("id", contractRowId)
    .eq("employee_id", employeeId);

  if (error) redirect(`/manager/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);

  redirect(`/manager/employees/${employeeId}`);
}

export async function deleteContractAction(employeeId: string, contractRowId: string) {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect(`/manager/employees/${employeeId}?error=not_authenticated`);

  const { error } = await supabase
    .from("employee_assignments")
    .delete()
    .eq("id", contractRowId)
    .eq("employee_id", employeeId);

  if (error) redirect(`/manager/employees/${employeeId}?error=${encodeURIComponent(error.message)}`);

  redirect(`/manager/employees/${employeeId}`);
}

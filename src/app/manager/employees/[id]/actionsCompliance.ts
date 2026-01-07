"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const ALLOWED_KEYS = new Set([
  "background_check",
  "drug_screen",
  "physical",
  "tb_test",
  "education",
  "active_license",
  "bls",
  "acls",
]);

function employeePath(employeeId: string) {
  return `/manager/employees/${employeeId}`;
}

export async function toggleComplianceTaskAction(employeeId: string, key: string) {
  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/manager/login");

  // Role gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  if (!employeeId) throw new Error("Missing employeeId");
  if (!ALLOWED_KEYS.has(key)) throw new Error("Invalid compliance key");

  // Ensure row exists (upsert is simplest and avoids race conditions)
  const { error: ensureErr } = await supabase
    .from("compliance_tasks")
    .upsert({ employee_id: employeeId }, { onConflict: "employee_id" });

  if (ensureErr) throw ensureErr;

  // Read current value
  const { data: row, error: rowErr } = await supabase
    .from("compliance_tasks")
    .select(key)
    .eq("employee_id", employeeId)
    .single();

  if (rowErr) throw rowErr;

  const current = Boolean((row as any)[key]);

  // Toggle
  const { error: updateErr } = await supabase
    .from("compliance_tasks")
    .update({ [key]: !current })
    .eq("employee_id", employeeId);

  if (updateErr) throw updateErr;

  // ✅ Force the page to refresh with the new values
  revalidatePath(employeePath(employeeId));
}

export async function saveComplianceNotesAction(employeeId: string, formData: FormData) {
  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/manager/login");

  // Role gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) redirect("/");

  const notes = String(formData.get("notes") ?? "").slice(0, 5000);

  const { error } = await supabase
    .from("compliance_tasks")
    .upsert({ employee_id: employeeId, notes }, { onConflict: "employee_id" });

  if (error) throw error;

  // ✅ Refresh page
  revalidatePath(employeePath(employeeId));
}

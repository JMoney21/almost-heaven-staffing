import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: employeeId } = await params;

  const supabase = await createSupabaseServer();

  // Auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Role check
  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profErr || !prof || (prof.role !== "manager" && prof.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Employee
  const { data: employee, error: empErr } = await supabase
    .from("employees")
    .select("id, email, full_name, user_id")
    .eq("id", employeeId)
    .maybeSingle();

  if (empErr || !employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  if (employee.user_id) {
    return NextResponse.json({ error: "Employee already has a login" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));
  const tempPassword = body?.tempPassword as string | undefined;

  if (!tempPassword || tempPassword.length < 8) {
    return NextResponse.json({ error: "Temp password must be 8+ characters." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: employee.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: employee.full_name, role: "employee" },
  });

  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Failed to create user" },
      { status: 500 }
    );
  }

  const { error: linkErr } = await supabase
    .from("employees")
    .update({ user_id: created.user.id })
    .eq("id", employeeId);

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  await supabase.from("profiles").upsert({
    user_id: created.user.id,
    full_name: employee.full_name,
    role: "employee",
  });

  return NextResponse.json({ ok: true, user_id: created.user.id });
}

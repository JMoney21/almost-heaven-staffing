import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const employeeId = params.id;

  const supabase = await createSupabaseServer();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!prof || (prof.role !== "manager" && prof.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("email, user_id")
    .eq("id", employeeId)
    .single();

  if (!employee?.email) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const admin = createSupabaseAdmin();

  // Send reset link to employee email
  const { error } = await admin.auth.resetPasswordForEmail(employee.email, {
    redirectTo: "https://almostheavenstaffing.com/employee/reset", // create this page
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

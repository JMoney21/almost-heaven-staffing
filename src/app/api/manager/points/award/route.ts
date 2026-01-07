import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: mgrProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!mgrProfile || (mgrProfile.role !== "manager" && mgrProfile.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const employeeId = body?.employeeId as string | undefined;
    const points = Number(body?.points);
    const reason = (body?.reason as string | undefined) ?? "Points adjustment";

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }
    if (!Number.isFinite(points) || points === 0) {
      return NextResponse.json({ error: "points must be a non-zero number" }, { status: 400 });
    }

    // Confirm employee exists
    const { data: emp, error: empErr } = await supabase
      .from("employees")
      .select("id")
      .eq("id", employeeId)
      .single();

    if (empErr || !emp) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const { error: txErr } = await supabase.from("points_transactions").insert({
      employee_id: employeeId,
      points,
      type: "adjust", // earn | spend | adjust
      reason,
      reference_id: user.id,
    });

    if (txErr) {
      return NextResponse.json({ error: txErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

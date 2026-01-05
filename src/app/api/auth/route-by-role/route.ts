import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const role = profile?.role ?? null;

  if (role === "manager" || role === "admin") {
    return NextResponse.json({ redirectTo: "/manager/employees" });
  }
  if (role === "employee") {
    return NextResponse.json({ redirectTo: "/employee/dashboard" });
  }

  return NextResponse.json({ redirectTo: "/" });
}

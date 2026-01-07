import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, facility_id")
    .eq("user_id", authData.user.id)
    .single();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("rewards")
    .select("id, title, description, cost, active, inventory, created_at")
    .eq("facility_id", profile.facility_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rewards: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, facility_id")
    .eq("user_id", authData.user.id)
    .single();

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const title = (body?.title as string | undefined)?.trim();
  const description = (body?.description as string | undefined)?.trim() ?? null;
  const cost = Number(body?.cost);
  const active = typeof body?.active === "boolean" ? body.active : true;
  const inventory = body?.inventory === null || body?.inventory === undefined ? null : Number(body.inventory);

  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!Number.isFinite(cost) || cost < 0) return NextResponse.json({ error: "cost must be >= 0" }, { status: 400 });
  if (inventory !== null && (!Number.isFinite(inventory) || inventory < 0)) {
    return NextResponse.json({ error: "inventory must be null or >= 0" }, { status: 400 });
  }

  const { error } = await supabase.from("rewards").insert({
    facility_id: profile.facility_id,
    title,
    description,
    cost,
    active,
    inventory,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 200 });
}

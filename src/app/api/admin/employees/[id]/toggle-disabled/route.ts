import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // If you want the client to explicitly set the value:
    // { "disabled": true } or { "disabled": false }
    const { disabled } = (body ?? {}) as { disabled?: boolean };

    // ✅ TODO: Replace this with your real DB update.
    // If you truly want "toggle", you’d read current state then flip it.
    // If you want "set", use `disabled` as provided.
    //
    // Example toggle:
    // const employee = await db.employee.findUnique({ where: { id } });
    // if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    // const newDisabled = !employee.disabled;
    // await db.employee.update({ where: { id }, data: { disabled: newDisabled } });
    // return NextResponse.json({ ok: true, disabled: newDisabled });

    // Placeholder behavior (set if provided, otherwise just return ok):
    if (typeof disabled === "boolean") {
      return NextResponse.json({ ok: true, disabled }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

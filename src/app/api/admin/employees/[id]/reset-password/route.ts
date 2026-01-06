// src/app/api/admin/employees/[id]/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/employees/[id]/reset-password
 *
 * Expected JSON body (example):
 * {
 *   "newPassword": "SomeStrongPassword123!"
 * }
 */
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
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { newPassword } = (body ?? {}) as { newPassword?: string };

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "newPassword is required" },
        { status: 400 }
      );
    }

    // OPTIONAL: basic password rule (adjust/remove)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // ✅ TODO: Replace this section with YOUR real reset logic:
    // - verify admin auth/session
    // - locate employee/user by id
    // - hash password
    // - update DB
    //
    // Example placeholders:
    //
    // const employee = await db.employee.findUnique({ where: { id } });
    // if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    //
    // const hashed = await bcrypt.hash(newPassword, 12);
    // await db.employee.update({ where: { id }, data: { passwordHash: hashed } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    // You can log err if you want: console.error(err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

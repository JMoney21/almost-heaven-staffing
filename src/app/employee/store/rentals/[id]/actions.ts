// src/app/employee/store/rentals/[id]/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

function diffNights(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const ms = e.getTime() - s.getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function isValidISODate(d: string) {
  // expects YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function enc(msg: string) {
  return encodeURIComponent(msg);
}

/**
 * Pricing rule:
 * - Default: nightly pricing (nights * points_per_night)
 * - If points_per_week exists and helps: use weekly bundles for each 7-night block
 */
function calcPointsCost(nights: number, pointsPerNight: number, pointsPerWeek: number) {
  if (nights <= 0) return 0;

  if (pointsPerWeek > 0) {
    const weeks = Math.floor(nights / 7);
    const remainder = nights % 7;

    const bundled = weeks * pointsPerWeek + remainder * pointsPerNight;
    const allNightly = nights * pointsPerNight;

    // Never charge more than pure nightly
    return Math.min(allNightly, bundled);
  }

  return nights * pointsPerNight;
}

export async function bookRentalAction(rentalId: string, formData: FormData) {
  const supabase = await createSupabaseServer();

  // AUTH
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authErr || !user) {
    redirect(`/employee/login?error=${enc("Please log in again.")}`);
  }

  const start_date = String(formData.get("start_date") ?? "");
  const end_date = String(formData.get("end_date") ?? "");

  if (!isValidISODate(start_date) || !isValidISODate(end_date)) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("Please enter valid dates.")}`);
  }

  const nights = diffNights(start_date, end_date);
  if (nights <= 0) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("End date must be after start date.")}`);
  }

  // EMPLOYEE (must exist / be linked)
  const { data: employee, error: empErr } = await supabase
    .from("employees")
    .select("id, disabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (empErr || !employee?.id) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("Employee record not found. Contact support.")}`);
  }

  if (employee.disabled) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("Your account is disabled. Contact support.")}`);
  }

  // RENTAL (schema-correct select)
  const { data: rental, error: rentalErr } = await supabase
    .from("rentals")
    .select("id, title, points_per_night, points_per_week, is_active")
    .eq("id", rentalId)
    .maybeSingle();

  if (rentalErr || !rental) {
    redirect(`/employee/store/rentals?error=${enc("Rental not found.")}`);
  }

  if (!rental.is_active) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("This rental is not active.")}`);
  }

  const pointsPerNight = Number(rental.points_per_night ?? 0);
  const pointsPerWeek = Number(rental.points_per_week ?? 0);

  if (!pointsPerNight || pointsPerNight <= 0) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("Rental pricing is not configured.")}`);
  }

  // AVAILABILITY CHECK (overlap): start < b.end AND end > b.start
  const { data: overlaps, error: overlapErr } = await supabase
    .from("rental_bookings")
    .select("id, start_date, end_date")
    .eq("rental_id", rentalId)
    .eq("status", "booked")
    .lt("start_date", end_date)
    .gt("end_date", start_date)
    .limit(1);

  if (overlapErr) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc(overlapErr.message)}`);
  }

  if ((overlaps ?? []).length > 0) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("Those dates are not available.")}`);
  }

  // POINTS BALANCE (sum)
  const { data: ptsRows, error: ptsErr } = await supabase
    .from("points_transactions")
    .select("points")
    .eq("employee_id", employee.id);

  if (ptsErr) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc(ptsErr.message)}`);
  }

  const balance = (ptsRows ?? []).reduce((sum: number, r: any) => sum + (Number(r.points) || 0), 0);

  const points_cost = calcPointsCost(nights, pointsPerNight, pointsPerWeek);

  if (points_cost <= 0) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc("Could not calculate cost.")}`);
  }

  if (balance < points_cost) {
    redirect(
      `/employee/store/rentals/${rentalId}?error=${enc(
        `Not enough points. Need ${points_cost}, you have ${balance}.`
      )}`
    );
  }

  // INSERT BOOKING
  const { error: insErr } = await supabase.from("rental_bookings").insert({
    rental_id: rentalId,
    employee_id: employee.id,
    start_date,
    end_date,
    status: "booked",
    points_cost,
  });

  if (insErr) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc(insErr.message)}`);
  }

  // DEDUCT POINTS (transaction)
  // ✅ MUST match points_transactions_type_check: earn | spend | adjust
  const { error: deductErr } = await supabase.from("points_transactions").insert({
    employee_id: employee.id,
    points: -points_cost,
    type: "spend",
    reason: `Booked rental: ${rental.title} (${start_date} → ${end_date})`,
  });

  if (deductErr) {
    redirect(`/employee/store/rentals/${rentalId}?error=${enc(deductErr.message)}`);
  }

  revalidatePath(`/employee/store/rentals/${rentalId}`);
  redirect(`/employee/store/rentals/${rentalId}?success=${enc(`Booked! Cost: ${points_cost} points.`)}`);
}

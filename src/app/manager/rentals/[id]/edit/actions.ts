"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

function getId(formData: FormData) {
  const id = formData.get("id");
  if (!id || typeof id !== "string") throw new Error("Missing rental id");
  return id;
}

export async function updateRentalAction(formData: FormData) {
  const supabase = await createSupabaseServer();

  const id = getId(formData);
  const title = String(formData.get("title") ?? "");
  const priceRaw = formData.get("price");
  const price =
    priceRaw === null || priceRaw === "" ? null : Number(priceRaw);

  const { error } = await supabase
    .from("rentals")
    .update({
      title,
      price,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // ✅ Correct: use id string, not FormData
  revalidatePath(`/manager/rentals/${id}/edit`, "page");
  revalidatePath(`/manager/rentals`, "page");
}

export async function updateRentalImageAction(formData: FormData) {
  const supabase = await createSupabaseServer();

  const id = getId(formData);

  const file = formData.get("image");
  if (!file || !(file instanceof File)) throw new Error("Missing image file");

  // ---- Upload to Supabase Storage (example) ----
  // Adjust bucket name + path to match your app
  const bucket = "rental-images";
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  const publicUrl = data.publicUrl;

  const { error: dbError } = await supabase
    .from("rentals")
    .update({ image_url: publicUrl })
    .eq("id", id);

  if (dbError) throw new Error(dbError.message);

  // ✅ Correct revalidation
  revalidatePath(`/manager/rentals/${id}/edit`, "page");
  revalidatePath(`/manager/rentals`, "page");
}

export async function deleteRentalAction(formData: FormData) {
  const supabase = await createSupabaseServer();

  const id = getId(formData);

  const { error } = await supabase.from("rentals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/manager/rentals`, "page");
  redirect("/manager/rentals");
}

"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Props = {
  userId: string;
  currentAvatarUrl: string | null; // stores STORAGE PATH, not public URL
  onUploaded?: (signedUrl: string) => void;
};

const BUCKET = "avatars"; // your Supabase Storage bucket name

export default function PhotoUploader({
  userId,
  currentAvatarUrl,
  onUploaded,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;

    // Validate image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    // Validate size
    const maxMB = 8;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`File is too large. Please upload an image under ${maxMB}MB.`);
      return;
    }

    setUploading(true);

    try {
      // Ensure logged in
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not logged in.");

      // Stable path (upsert replaces existing image)
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `employees/${userId}/avatar.${ext}`;

      // Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadErr) throw uploadErr;

      // Save STORAGE PATH to DB (not a public URL)
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("user_id", userId);

      if (dbErr) throw dbErr;

      // Create signed URL for immediate preview
      const { data: signed, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 60 * 60); // 1 hour

      if (signErr) throw signErr;

      // Cache-bust so image updates immediately
      const signedUrl = `${signed.signedUrl}&t=${Date.now()}`;

      onUploaded?.(signedUrl);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (!confirm("Remove your profile photo?")) return;

    setUploading(true);
    try {
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", userId);

      if (dbErr) throw dbErr;

      // Clear UI
      onUploaded?.("");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Could not remove photo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#F6B400] px-4 py-2 text-xs font-extrabold text-[#0B2545] hover:brightness-95">
        {uploading ? "Uploading..." : "Upload Photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {currentAvatarUrl && (
        <button
          type="button"
          onClick={removePhoto}
          disabled={uploading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Remove
        </button>
      )}

      <div className="text-xs font-semibold text-slate-500">
        JPG/PNG, up to 8MB.
      </div>
    </div>
  );
}

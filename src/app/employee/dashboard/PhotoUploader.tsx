"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ✅ Pick ONE of these imports depending on what your project uses.
// If this import errors, scroll down to "If your import path differs".
import { createClient } from "@/utils/supabase/client";
// import { createClient } from "@/lib/supabase/browser";

type PhotoUploaderProps = {
  userId: string;
  currentAvatarUrl: string | null;
  /**
   * Optional: runs after upload succeeds.
   * Useful if you want the parent page to refresh data.
   */
  onUploaded?: (publicUrl: string) => void;
};

export default function PhotoUploader({
  userId,
  currentAvatarUrl,
  onUploaded,
}: PhotoUploaderProps) {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setAvatarUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const openFilePicker = () => {
    setError(null);
    setSuccessMsg(null);
    inputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMsg(null);

    // Basic validation
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.");
      e.target.value = "";
      return;
    }

    // Optional size limit (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image too large. Please use an image under 5MB.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      // ✅ Store inside a user folder to avoid collisions
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // ✅ IMPORTANT: Make sure you have a Supabase Storage bucket named "avatars"
      // If your bucket name is different, change "avatars" below.
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get a URL for display
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);
      setSuccessMsg("Photo updated!");
      onUploaded?.(publicUrl);

      // NOTE:
      // If you also want to save this URL to a table (profiles/employees/etc),
      // do it here. I’m not writing that part because your table name/column
      // isn’t shown in the logs, and guessing could break builds.
    } catch (err: any) {
      setError(err?.message ?? "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      // reset input so selecting the same file again still triggers change
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl ?? "/nurse.png"}
            alt="Profile photo"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isUploading}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload new photo"}
          </button>

          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, or WEBP • max 5MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFileSelected}
        className="hidden"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {successMsg && <p className="mt-2 text-sm text-green-600">{successMsg}</p>}
    </div>
  );
}

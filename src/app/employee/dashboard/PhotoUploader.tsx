"use client";

import { useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";

export default function PhotoUploader({
  currentAvatarUrl,
}: {
  currentAvatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sb = createBrowserClient();

  async function upload(file: File) {
    setBusy(true);
    setErr(null);

    try {
      // ✅ ensure session exists
      const { data: sessionData, error: sessionErr } = await sb.auth.getSession();
      if (sessionErr) throw sessionErr;

      const session = sessionData.session;
      if (!session) throw new Error("Auth session missing! Please sign in again.");

      const user = session.user;

      // ✅ file checks
      if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      // ✅ upload
      const { error: upErr } = await sb.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      // ✅ public url
      const { data: urlData } = sb.storage.from("avatars").getPublicUrl(path);
      const avatar_url = urlData.publicUrl;

      // ✅ update profile
      const { error: dbErr } = await sb
        .from("profiles")
        .update({ avatar_url })
        .eq("user_id", user.id);

      if (dbErr) throw dbErr;

      window.location.reload();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={[
          "w-full rounded-full px-5 py-3 text-sm font-extrabold transition shadow-sm",
          busy ? "bg-slate-200 text-slate-500" : "bg-[#F6B400] text-[#0B2545] hover:brightness-95",
        ].join(" ")}
      >
        {busy ? "Uploading..." : currentAvatarUrl ? "Change Photo" : "Upload Photo"}
      </button>

      {err ? (
        <div className="mt-2 rounded-xl bg-rose-50 p-2 text-xs font-bold text-rose-900 ring-1 ring-rose-200">
          {err}
        </div>
      ) : null}
    </div>
  );
}

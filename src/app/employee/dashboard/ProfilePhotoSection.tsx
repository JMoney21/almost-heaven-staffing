"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import PhotoUploader from "./PhotoUploader";

const BUCKET = "avatars"; // must match PhotoUploader

type Props = {
  userId: string;
  initialAvatarUrl: string | null; // STORAGE PATH from DB
};

export default function ProfilePhotoSection({
  userId,
  initialAvatarUrl,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const router = useRouter();

  async function makeSigned(path: string) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) {
      console.error(error);
      return null;
    }

    // Cache-bust so updated images show immediately
    return `${data.signedUrl}&t=${Date.now()}`;
  }

  // Convert DB path into a signed URL on initial load / change
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!initialAvatarUrl) {
        setDisplayUrl(null);
        return;
      }

      const url = await makeSigned(initialAvatarUrl);
      if (!alive) return;

      setDisplayUrl(url);
    }

    run();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAvatarUrl]);

  return (
    <div>
      <div className="relative h-44 w-44 overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm font-black text-slate-500">
            No Photo
          </div>
        )}
      </div>

      <div className="mt-3">
        <PhotoUploader
          userId={userId}
          currentAvatarUrl={initialAvatarUrl}
          onUploaded={(signedUrl) => {
            // signedUrl is immediate preview; empty clears
            setDisplayUrl(signedUrl || null);
            router.refresh(); // sync server-side avatar_url fetch
          }}
        />
      </div>
    </div>
  );
}

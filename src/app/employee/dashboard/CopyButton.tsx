"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex-1 rounded-full bg-[#0B2B55] px-4 py-2 text-sm font-extrabold text-white hover:brightness-110"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}

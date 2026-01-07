"use client";

import * as React from "react";

type Props = {
  rentalId: string;
  /** Existing image URL to preview */
  imageUrl?: string | null;

  /**
   * Called with the selected file.
   * You can implement this using:
   * - a Server Action
   * - an API route
   * - direct storage SDK upload
   */
  onUpload: (file: File) => Promise<void>;

  /** Optional: called when user clicks remove */
  onRemove?: () => Promise<void>;
};

export default function RentalImageUploader({
  rentalId,
  imageUrl,
  onUpload,
  onRemove,
}: Props) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      await onUpload(file);
      // Clear input so same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (!onRemove) return;
    setError(null);
    setIsUploading(true);
    try {
      await onRemove();
    } catch (err: any) {
      setError(err?.message ?? "Remove failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Rental Image</div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Rental ${rentalId}`}
            style={{
              width: "100%",
              maxWidth: 520,
              height: "auto",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 18,
              borderRadius: 10,
              border: "1px dashed rgba(0,0,0,0.25)",
              color: "rgba(0,0,0,0.6)",
            }}
          >
            No image uploaded yet.
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={isUploading}
        />

        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.2)",
              background: "white",
              cursor: isUploading ? "not-allowed" : "pointer",
            }}
          >
            Remove
          </button>
        )}
      </div>

      {isUploading && <div>Working…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
    </div>
  );
}

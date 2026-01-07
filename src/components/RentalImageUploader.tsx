"use client";

import React from "react";

type Props = {
  rentalId: string;
  imageUrl?: string | null;
};

export default function RentalImageUploader({ rentalId, imageUrl }: Props) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 600 }}>Rental Image</div>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Rental ${rentalId}`}
          style={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      ) : (
        <div
          style={{
            maxWidth: 520,
            padding: 16,
            borderRadius: 10,
            border: "1px dashed rgba(0,0,0,0.25)",
          }}
        >
          No image yet.
        </div>
      )}

      {/* Keep upload UI wherever your actions/form is implemented */}
    </div>
  );
}

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import RentalImageUploader from "@/components/RentalImageUploader";
import {
  deleteRentalAction,
  updateRentalAction,
  updateRentalImageAction,
} from "./actions";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function EditRentalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rentalId = resolvedParams?.id;

  if (!rentalId) {
    // If params is missing for any reason, bail safely
    redirect("/manager/rentals");
  }

  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rental, error } = await supabase
    .from("rentals")
    .select("*")
    .eq("id", rentalId)
    .single();

  if (error || !rental) redirect("/manager/rentals");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Edit Rental
      </h1>

      <section
        style={{
          padding: 16,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          Rental Details
        </h2>

        <form action={updateRentalAction} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="id" value={rentalId} />

          <label style={{ display: "grid", gap: 6 }}>
            Title
            <input
              name="title"
              defaultValue={(rental as any).title ?? ""}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            Price
            <input
              name="price"
              defaultValue={(rental as any).price ?? ""}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.2)",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            Save Changes
          </button>
        </form>
      </section>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          Rental Image
        </h2>

        <RentalImageUploader
          rentalId={rentalId}
          imageUrl={(rental as any).image_url ?? null}
        />

        <div style={{ marginTop: 12 }}>
          <form
            action={updateRentalImageAction}
            encType="multipart/form-data"
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input type="hidden" name="id" value={rentalId} />
            <input type="file" name="image" accept="image/*" required />

            <button
              type="submit"
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.2)",
                background: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Upload New Image
            </button>
          </form>
        </div>
      </section>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid rgba(220,38,38,0.25)",
          borderRadius: 12,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
            color: "#b91c1c",
          }}
        >
          Danger Zone
        </h2>

        <form action={deleteRentalAction}>
          <input type="hidden" name="id" value={rentalId} />
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(220,38,38,0.5)",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
              color: "#b91c1c",
            }}
          >
            Delete Rental
          </button>
        </form>
      </section>
    </div>
  );
}

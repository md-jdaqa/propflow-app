import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PropertiesPage } from "@/components/properties/PropertiesPage";

export const dynamic = "force-dynamic";

export type PropertyListItem = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  propertyType: "RESIDENTIAL_LTR" | "RESIDENTIAL_STR" | "COMMERCIAL" | "MIXED_USE";
  unitsCount: number;
  occupiedCount: number;
};

type PropertyRow = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  propertyType: PropertyListItem["propertyType"];
  units: Array<{ id: string; occupied: boolean }> | null;
};

export default async function PropertiesRoute({
  searchParams,
}: {
  searchParams?: { action?: string };
}) {
  const initialAction = searchParams?.action ?? null;

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data, error } = await supabase
    .from("Property")
    .select(
      "id, name, addressLine1, addressLine2, city, state, postalCode, propertyType, units:Unit(id, occupied)",
    )
    .eq("ownerId", user.id)
    .is("archivedAt", null)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Properties fetch error:", error);
  }

  const rows = (data ?? []) as PropertyRow[];
  const mapped: PropertyListItem[] = rows.map((p) => {
    const units = Array.isArray(p.units) ? p.units : [];
    return {
      id: p.id,
      name: p.name,
      addressLine1: p.addressLine1,
      addressLine2: p.addressLine2 ?? null,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
      propertyType: p.propertyType,
      unitsCount: units.length,
      occupiedCount: units.filter((u) => u.occupied).length,
    };
  });

  return (
    <PropertiesPage
      data={mapped}
      initialAction={initialAction}
      usingMock={false}
    />
  );
}

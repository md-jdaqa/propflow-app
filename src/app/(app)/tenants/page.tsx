import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TenantsPage } from "@/components/tenants/TenantsPage";

export const dynamic = "force-dynamic";

export type TenantUnitOption = {
  id: string;
  label: string;
  propertyName: string;
};

export type TenantListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  unitLabel: string | null;
  propertyName: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  monthlyRent: number | null;
};

type TenantRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  monthlyRent: number | string | null;
  unit:
    | {
        id: string;
        label: string;
        property: { id: string; name: string } | null;
      }
    | null;
};

type UnitRow = {
  id: string;
  label: string;
  property: { id: string; name: string; ownerId: string } | null;
};

export default async function TenantsRoute({
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

  const [tenantsRes, unitsRes] = await Promise.all([
    supabase
      .from("Tenant")
      .select(
        "id, firstName, lastName, email, phone, leaseStart, leaseEnd, monthlyRent, unit:Unit(id, label, property:Property(id, name))",
      )
      .eq("ownerId", user.id)
      .is("archivedAt", null)
      .order("lastName"),
    supabase
      .from("Unit")
      .select("id, label, property:Property!inner(id, name, ownerId)")
      .eq("property.ownerId", user.id)
      .is("property.archivedAt", null)
      .order("label"),
  ]);

  if (tenantsRes.error) console.error("Tenants fetch error:", tenantsRes.error);
  if (unitsRes.error) console.error("Units fetch error:", unitsRes.error);

  const tenants = (tenantsRes.data ?? []) as unknown as TenantRow[];
  const units = (unitsRes.data ?? []) as unknown as UnitRow[];

  const mappedTenants: TenantListItem[] = tenants.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email ?? null,
    phone: t.phone ?? null,
    unitLabel: t.unit?.label ?? null,
    propertyName: t.unit?.property?.name ?? null,
    leaseStart: t.leaseStart ?? null,
    leaseEnd: t.leaseEnd ?? null,
    monthlyRent:
      t.monthlyRent === null || t.monthlyRent === undefined
        ? null
        : Number(t.monthlyRent),
  }));

  const mappedUnits: TenantUnitOption[] = units.map((u) => ({
    id: u.id,
    label: u.label,
    propertyName: u.property?.name ?? "",
  }));

  return (
    <TenantsPage
      data={mappedTenants}
      units={mappedUnits}
      initialAction={initialAction}
      usingMock={false}
    />
  );
}

#!/usr/bin/env python3
"""
Patches Next.js server pages to be statically renderable for GitHub Pages export.
Run from the project root before `npm run build` with GITHUB_ACTIONS=true.
"""

# finances/page.tsx — remove searchParams (makes page dynamic)
with open("src/app/(app)/finances/page.tsx", "w") as f:
    f.write(
        'import { FinancesPage } from "@/components/finances/FinancesPage";\n\n'
        'export default function FinancesRoute() {\n'
        '  return <FinancesPage initialTab="overview" initialFilter={undefined} />;\n'
        '}\n'
    )

# properties/page.tsx — replace Prisma server page with static mock
# Must still export PropertyListItem (imported by PropertiesPage component)
with open("src/app/(app)/properties/page.tsx", "w") as f:
    f.write(
        'import { PropertiesPage } from "@/components/properties/PropertiesPage";\n\n'
        'export type PropertyListItem = {\n'
        '  id: string;\n'
        '  name: string;\n'
        '  addressLine1: string;\n'
        '  addressLine2: string | null;\n'
        '  city: string;\n'
        '  state: string;\n'
        '  postalCode: string;\n'
        '  propertyType: "RESIDENTIAL_LTR" | "RESIDENTIAL_STR" | "COMMERCIAL" | "MIXED_USE";\n'
        '  unitsCount: number;\n'
        '  occupiedCount: number;\n'
        '};\n\n'
        'const MOCK: PropertyListItem[] = [\n'
        '  { id: "m1", name: "Brooklyn Brownstone", addressLine1: "123 Main St",'
        ' addressLine2: null, city: "Brooklyn", state: "NY", postalCode: "11201",'
        ' propertyType: "RESIDENTIAL_LTR", unitsCount: 3, occupiedCount: 2 },\n'
        '  { id: "m2", name: "Park Slope Duplex", addressLine1: "456 Park Ave",'
        ' addressLine2: "Apt B", city: "Brooklyn", state: "NY", postalCode: "11215",'
        ' propertyType: "RESIDENTIAL_LTR", unitsCount: 2, occupiedCount: 2 },\n'
        '  { id: "m3", name: "Beachside STR", addressLine1: "789 Shore Rd",'
        ' addressLine2: null, city: "Long Beach", state: "NY", postalCode: "11561",'
        ' propertyType: "RESIDENTIAL_STR", unitsCount: 1, occupiedCount: 0 },\n'
        '];\n\n'
        'export default function PropertiesRoute() {\n'
        '  return <PropertiesPage data={MOCK} initialAction={null} usingMock={true} />;\n'
        '}\n'
    )

# tenants/page.tsx — replace Prisma server page with static mock
# Must still export TenantListItem and TenantUnitOption (imported by TenantsPage component)
with open("src/app/(app)/tenants/page.tsx", "w") as f:
    f.write(
        'import { TenantsPage } from "@/components/tenants/TenantsPage";\n\n'
        'export type TenantListItem = {\n'
        '  id: string;\n'
        '  firstName: string;\n'
        '  lastName: string;\n'
        '  email: string | null;\n'
        '  phone: string | null;\n'
        '  unitLabel: string | null;\n'
        '  propertyName: string | null;\n'
        '  leaseStart: string | null;\n'
        '  leaseEnd: string | null;\n'
        '  monthlyRent: number | null;\n'
        '};\n\n'
        'export type TenantUnitOption = {\n'
        '  id: string;\n'
        '  label: string;\n'
        '  propertyName: string;\n'
        '};\n\n'
        'const MOCK_TENANTS: TenantListItem[] = [\n'
        '  { id: "t1", firstName: "Alex", lastName: "Johnson", email: "alex@example.com",'
        ' phone: "555-0101", unitLabel: "Unit 1", propertyName: "Brooklyn Brownstone",'
        ' leaseStart: "2025-01-01", leaseEnd: "2026-12-31", monthlyRent: 2400 },\n'
        '  { id: "t2", firstName: "Bri", lastName: "Lee", email: "bri@example.com",'
        ' phone: "555-0102", unitLabel: "Unit 2", propertyName: "Brooklyn Brownstone",'
        ' leaseStart: "2024-09-01", leaseEnd: "2025-08-31", monthlyRent: 1800 },\n'
        '  { id: "t3", firstName: "Chris", lastName: "Davis", email: null,'
        ' phone: "555-0103", unitLabel: "Apt B", propertyName: "Park Slope Duplex",'
        ' leaseStart: "2025-03-15", leaseEnd: "2026-03-14", monthlyRent: 3100 },\n'
        '];\n\n'
        'const MOCK_UNITS: TenantUnitOption[] = [\n'
        '  { id: "u1", label: "Unit 1", propertyName: "Brooklyn Brownstone" },\n'
        '  { id: "u2", label: "Unit 2", propertyName: "Brooklyn Brownstone" },\n'
        '  { id: "u3", label: "Apt B", propertyName: "Park Slope Duplex" },\n'
        '];\n\n'
        'export default function TenantsRoute() {\n'
        '  return <TenantsPage data={MOCK_TENANTS} units={MOCK_UNITS} initialAction={null} usingMock={true} />;\n'
        '}\n'
    )

print("Static export patches applied successfully.")

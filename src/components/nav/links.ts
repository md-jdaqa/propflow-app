export interface NavLink {
  href: string;
  label: string;
  icon: string;     // emoji as a stand-in glyph; cheap, theme-friendly
  testId: string;
}

export const PRIMARY_LINKS: NavLink[] = [
  { href: "/",            label: "Dashboard",  icon: "🏠", testId: "nav-dashboard" },
  { href: "/properties",  label: "Properties", icon: "🏘️", testId: "nav-properties" },
  { href: "/tenants",     label: "Tenants",    icon: "👥", testId: "nav-tenants" },
  { href: "/finances",    label: "Finances",   icon: "💵", testId: "nav-finances" },
  { href: "/settings",    label: "Settings",   icon: "⚙️", testId: "nav-settings" },
];

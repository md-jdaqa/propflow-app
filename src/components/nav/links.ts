export interface NavLink {
  href: string;
  label: string;
  icon: string;     // lucide icon name — rendered by nav components
  testId: string;
  group?: string;
}

// All available nav links — order is user-customisable via drag-and-drop
export const ALL_NAV_LINKS: NavLink[] = [
  { href: "/",             label: "Dashboard",    icon: "LayoutDashboard", testId: "nav-dashboard",    group: "main" },
  { href: "/properties",   label: "Properties",   icon: "Building2",       testId: "nav-properties",   group: "main" },
  { href: "/tenants",      label: "Tenants",      icon: "Users",           testId: "nav-tenants",      group: "main" },
  { href: "/finances",     label: "Finances",     icon: "DollarSign",      testId: "nav-finances",     group: "main" },
  { href: "/maintenance",  label: "Maintenance",  icon: "Wrench",          testId: "nav-maintenance",  group: "operations" },
  { href: "/leases",       label: "Leases",       icon: "FileText",        testId: "nav-leases",       group: "operations" },
  { href: "/applications", label: "Applications", icon: "ClipboardList",   testId: "nav-applications", group: "operations" },
  { href: "/listings",     label: "Listings",     icon: "Home",            testId: "nav-listings",     group: "operations" },
  { href: "/inspections",  label: "Inspections",  icon: "ClipboardCheck",  testId: "nav-inspections",  group: "operations" },
  { href: "/tasks",        label: "Tasks",         icon: "CheckSquare",    testId: "nav-tasks",        group: "operations" },
  { href: "/messages",     label: "Messages",     icon: "MessageSquare",   testId: "nav-messages",     group: "communications" },
  { href: "/evictions",          label: "Evictions",         icon: "AlertTriangle",   testId: "nav-evictions",          group: "legal" },
  { href: "/bank-reconciliation",label: "Bank Reconciliation",icon: "RefreshCw",       testId: "nav-bank-rec",           group: "finances" },
  { href: "/owner-portal",       label: "Owner Portal",       icon: "UserCheck",       testId: "nav-owner-portal",       group: "finances" },
  { href: "/recurring-payments", label: "Recurring Payments", icon: "Repeat",          testId: "nav-recurring-payments", group: "finances" },
  { href: "/budget",             label: "Budget Tracker",     icon: "PieChart",        testId: "nav-budget",             group: "finances" },
  { href: "/team",               label: "Team",               icon: "UserCog",         testId: "nav-team",               group: "system" },
  { href: "/background-checks", label: "Background Checks",  icon: "ShieldCheck",     testId: "nav-bg-checks",          group: "operations" },
  { href: "/reports",            label: "Reports",            icon: "BarChart2",       testId: "nav-reports",            group: "analytics" },
  { href: "/settings",           label: "Settings",           icon: "Settings",        testId: "nav-settings",           group: "system" },
  { href: "/tenant/home",        label: "Tenant Portal",      icon: "Users",           testId: "nav-tenant-portal",      group: "portals" },
  { href: "/contractor/jobs",    label: "Contractor Portal",  icon: "Wrench",          testId: "nav-contractor-portal",  group: "portals" },
];

// Legacy alias — existing components using PRIMARY_LINKS still compile
export const PRIMARY_LINKS = ALL_NAV_LINKS;

export const BOTTOM_NAV_MAX = 5;

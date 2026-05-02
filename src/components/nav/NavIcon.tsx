import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Settings,
  Wrench,
  FileText,
  ClipboardList,
  ClipboardCheck,
  MessageSquare,
  AlertTriangle,
  BarChart2,
  Home,
  CheckSquare,
  Sparkles,
  GripVertical,
  RefreshCw,
  UserCheck,
  Repeat,
  PieChart,
  UserCog,
  ShieldCheck,
  LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.FC<LucideProps>> = {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Settings,
  Wrench,
  FileText,
  ClipboardList,
  ClipboardCheck,
  MessageSquare,
  AlertTriangle,
  BarChart2,
  Home,
  CheckSquare,
  Sparkles,
  GripVertical,
  RefreshCw,
  UserCheck,
  Repeat,
  PieChart,
  UserCog,
  ShieldCheck,
};

interface NavIconProps extends LucideProps {
  name: string;
}

export function NavIcon({ name, ...props }: NavIconProps) {
  const Icon = iconMap[name] ?? LayoutDashboard;
  return <Icon {...props} />;
}

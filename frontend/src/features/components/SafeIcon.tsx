import { 
  LayoutDashboard, 
  ClipboardList, 
  Clock, 
  BarChart, 
  Bell, 
  AlertCircle,
  Search,
  Settings,
  HelpCircle,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Phone,
  Navigation,
  History,
  Download,
  Calendar,
  Image,
  MoreHorizontal,
  Info,
  CheckCircle,
  ExternalLink,
  Zap,
  BarChart3,
  Plus,
  Siren,
  FileWarning
} from "lucide-react";

const iconMap: Record<string, any> = {
  LayoutDashboard,
  ClipboardList,
  Clock,
  BarChart,
  Bell,
  AlertCircle,
  Search,
  Settings,
  HelpCircle,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Phone,
  Navigation,
  History,
  Download,
  Calendar,
  Image,
  MoreHorizontal,
  Info,
  CheckCircle,
  ExternalLink,
  Zap,
  BarChart3,
  Plus,
  Siren,
  FileWarning
};

export const SafeIcon = ({ name, ...props }: { name: string } & any) => {
  const Icon = iconMap[name];
  
  if (!Icon) {
    console.warn(`Icon "${name}" not found in SafeIcon map`);
    return <div className="w-5 h-5 bg-slate-200 rounded-sm inline-block" />;
  }
  
  return <Icon {...props} />;
};

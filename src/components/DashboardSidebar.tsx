import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Scale, Home, MessageSquare, Users, FolderOpen, Calendar, LogOut, FileText, Star } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface DashboardSidebarProps {
  userType: "client" | "lawyer";
}

const clientItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", href: "/client-dashboard" },
  { icon: MessageSquare, label: "Chat with AI", href: "/chat-ai" },
  { icon: Users, label: "Recommended Lawyers", href: "/client/recommended-lawyers" },
  { icon: FolderOpen, label: "My Case Summary", href: "/client/case-summary" },
  { icon: Calendar, label: "Appointments", href: "/client/appointments" },
];

const lawyerItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", href: "/lawyer-dashboard" },
  { icon: Users, label: "Client Requests", href: "/lawyer/client-requests" },
  { icon: FileText, label: "Recommended Cases", href: "/lawyer/recommended-cases" },
  { icon: Star, label: "Profile Settings", href: "/lawyer/profile-settings" },
];

const DashboardSidebar = ({ userType }: DashboardSidebarProps) => {
  const location = useLocation();
  const items = userType === "client" ? clientItems : lawyerItems;

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border p-6">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Scale className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">LegalAI</span>
      </Link>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
                          (item.href.includes("#") && location.hash === item.href.split("#")[1]);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

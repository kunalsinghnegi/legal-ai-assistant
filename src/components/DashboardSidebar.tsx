import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Scale, Home, MessageSquare, Users, FolderOpen, Calendar, LogOut, FileText, Star, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  { icon: MessageCircle, label: "My Chats", href: "/client/chat" },
  { icon: Users, label: "Recommended Lawyers", href: "/client/recommended-lawyers" },
  { icon: FolderOpen, label: "My Case Summary", href: "/client/case-summary" },
  { icon: Calendar, label: "Appointments", href: "/client/appointments" },
];

const lawyerItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", href: "/lawyer-dashboard" },
  { icon: Users, label: "Client Requests", href: "/lawyer/client-requests" },
  { icon: FolderOpen, label: "My Accepted Cases", href: "/lawyer/accepted-cases" },
  { icon: FileText, label: "Recommended Cases", href: "/lawyer/recommended-cases" },
  { icon: MessageCircle, label: "My Chats", href: "/lawyer/chat" },
  { icon: Star, label: "Profile Settings", href: "/lawyer/profile-settings" },
];

const DashboardSidebar = ({ userType }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const items = userType === "client" ? clientItems : lawyerItems;

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border p-6 flex flex-col">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Scale className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">LegalAI</span>
      </Link>

      <nav className="space-y-2 flex-1">
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

      <div className="mt-auto pt-6">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

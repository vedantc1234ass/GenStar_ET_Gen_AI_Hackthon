import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  GitMerge, 
  FileText, 
  Users, 
  BarChart3, 
  LineChart,
  MessageSquare,
  ShieldAlert,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: GitMerge },
  { href: "/meetings", label: "Meetings", icon: FileText },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: LineChart },
  { href: "/audit", label: "Audit Logs", icon: ShieldAlert },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden text-foreground">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/5 z-50">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8" />
          <span className="font-display font-bold text-xl text-gradient">GENSTAR</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-muted-foreground hover:text-white">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 relative z-10 drop-shadow-md" />
          </div>
          <span className="font-display font-bold text-2xl tracking-wider text-gradient">GENSTAR</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                  )}
                  <Icon size={20} className={cn("transition-colors", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" : "group-hover:text-white")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-sm font-bold text-white shadow-lg">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">System Admin</span>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Chatbot Button */}
      <Link href="/chatbot" className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary to-accent rounded-full text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:-translate-y-1 transition-all duration-300">
        <MessageSquare size={24} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      </Link>
    </div>
  );
}

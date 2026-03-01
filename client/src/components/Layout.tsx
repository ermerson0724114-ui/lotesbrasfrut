import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Settings,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  const [location] = useLocation();
  const { isAuthenticated, role, user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dash", icon: LayoutDashboard, show: true },
    { href: "/aguardando", label: "Aguard.", icon: Clock, show: true },
    { href: "/liberados", label: "Liberados", icon: CheckCircle2, show: true },
    { href: "/retidos", label: "Retidos", icon: XCircle, show: true },
    { href: "/admin", label: "Admin", icon: Settings, show: role === "ADMIN" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:max-w-md md:mx-auto md:shadow-2xl md:border-x border-border/50 relative overflow-hidden">
      
      {/* App Header */}
      <header className="sticky top-0 z-50 glass-nav px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-foreground">
          {title}
        </h1>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold leading-none">{user?.displayName || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground uppercase">{role}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-full bg-secondary hover:bg-secondary/80">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Fazer Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 animate-slide-up">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full md:w-[28rem] md:max-w-md z-50 glass-nav pb-safe">
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.filter(i => i.show).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={`
                  flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all duration-300
                  ${isActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground hover:scale-105'}
                `}>
                  <div className={`
                    p-2 rounded-xl transition-colors duration-300
                    ${isActive ? 'bg-primary/10' : 'bg-transparent'}
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

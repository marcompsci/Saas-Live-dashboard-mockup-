import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { LayoutDashboard, CheckCircle2, DollarSign, Activity, Users, Target, CalendarDays, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckCircle2 },
  { href: "/money", label: "Money", icon: DollarSign },
  { href: "/health", label: "Health", icon: Activity },
  { href: "/growth", label: "Growth", icon: Users },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const displayName = user?.firstName || user?.username || "Account";
  const avatarUrl = user?.imageUrl;

  const AccountAvatar = () =>
    avatarUrl ? (
      <img
        src={avatarUrl}
        alt={displayName}
        className="h-8 w-8 rounded-full border border-border object-cover"
      />
    ) : (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {displayName.slice(0, 1).toUpperCase()}
      </span>
    );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.svg" alt="MindFlow" className="w-8 h-8 rounded-sm" />
          <span className="font-semibold text-lg">MindFlow</span>
        </Link>
        <div className="flex items-center gap-4">
          <AccountAvatar />
          <Button data-testid="button-mobile-menu" variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <img src="/logo.svg" alt="MindFlow" className="w-8 h-8 rounded-sm" />
          <span className="font-semibold text-xl text-sidebar-foreground tracking-tight">MindFlow</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-sidebar-border hidden md:flex items-center gap-3">
          <AccountAvatar />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground">
            {displayName}
          </span>
          <Button
            data-testid="button-sign-out"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-[calc(100dvh-65px)] md:min-h-screen relative p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

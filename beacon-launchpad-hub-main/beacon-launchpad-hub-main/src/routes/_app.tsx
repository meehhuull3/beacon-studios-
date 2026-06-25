import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { BeaconLogo } from "@/components/beacon-logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building2, Rocket, ListChecks, CalendarDays, Megaphone, BarChart3, Users, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "faculty", "core_team"] },
  { to: "/colleges", label: "Colleges", icon: Building2, roles: ["admin", "faculty"] },
  { to: "/startups", label: "Startups", icon: Rocket, roles: ["admin", "faculty", "core_team"] },
  { to: "/tasks", label: "Tasks", icon: ListChecks, roles: ["admin", "faculty", "core_team"] },
  { to: "/events", label: "Events", icon: CalendarDays, roles: ["admin", "faculty", "core_team"] },
  { to: "/broadcasts", label: "Broadcasts", icon: Megaphone, roles: ["admin", "faculty", "core_team"] },
  { to: "/team", label: "Team", icon: Users, roles: ["admin", "faculty"] },
  { to: "/approvals", label: "Approvals", icon: ShieldCheck, roles: ["admin", "faculty"] },
  { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
] as const;

function AppLayout() {
  const { user, loading, roles, signOut, isAdmin, isFaculty, isCoreTeam } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  // No role yet → pending approval
  if (roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md text-center space-y-4">
          <BeaconLogo />
          <h2 className="text-2xl font-semibold mt-6">Pending approval</h2>
          <p className="text-muted-foreground text-sm">
            Your account exists but no role has been granted yet. An admin needs to approve your access request.
          </p>
          <Button variant="outline" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>Sign out</Button>
        </div>
      </div>
    );
  }

  const primaryRole = isAdmin ? "Admin" : isFaculty ? "Faculty" : "Core Team";
  const allowed = NAV.filter((n) => n.roles.some((r) => roles.includes(r as never)));

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 border-b"><BeaconLogo /></div>
        <nav className="flex-1 p-2 space-y-0.5">
          {allowed.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link key={n.to} to={n.to} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/60 text-sidebar-foreground/80"
              )}>
                <Icon size={16} />{n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="px-2 text-xs">
            <div className="font-medium truncate">{user.email}</div>
            <div className="text-muted-foreground">{primaryRole}</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

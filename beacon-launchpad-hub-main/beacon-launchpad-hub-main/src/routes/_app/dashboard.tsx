import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, PageBody } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Rocket, ListChecks, CalendarDays, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Beacon Studios" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isAdmin, collegeId } = useAuth();
  const [stats, setStats] = useState({ colleges: 0, startups: 0, tasksOpen: 0, eventsLive: 0, students: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentStartups, setRecentStartups] = useState<any[]>([]);

  const load = async () => {
    const filter = (q: any) => (isAdmin || !collegeId ? q : q.eq("college_id", collegeId));
    const [c, s, t, e, p] = await Promise.all([
      supabase.from("colleges").select("id", { count: "exact", head: true }).eq("active", true),
      filter(supabase.from("startups").select("id", { count: "exact", head: true })),
      filter(supabase.from("tasks").select("id", { count: "exact", head: true })).neq("status", "done"),
      filter(supabase.from("events").select("id", { count: "exact", head: true })).in("status", ["upcoming", "live"]),
      filter(supabase.from("programs").select("enrolled_students")),
    ]);
    const students = (p.data ?? []).reduce((a: number, r: any) => a + (r.enrolled_students ?? 0), 0);
    setStats({ colleges: c.count ?? 0, startups: s.count ?? 0, tasksOpen: t.count ?? 0, eventsLive: e.count ?? 0, students });

    const ev = await filter(supabase.from("events").select("id, title, type, scheduled_at, status, colleges(name)").order("scheduled_at", { ascending: false }).limit(5));
    setRecentEvents(ev.data ?? []);
    const st = await filter(supabase.from("startups").select("id, name, stage, domain, colleges(name)").order("last_update", { ascending: false }).limit(5));
    setRecentStartups(st.data ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "startups" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, collegeId]);

  const cards = [
    { label: "Active colleges", value: stats.colleges, icon: Building2 },
    { label: "Startups in pipeline", value: stats.startups, icon: Rocket },
    { label: "Open tasks", value: stats.tasksOpen, icon: ListChecks },
    { label: "Live / upcoming events", value: stats.eventsLive, icon: CalendarDays },
    { label: "Enrolled students", value: stats.students, icon: TrendingUp },
  ];

  return (
    <>
      <PageHeader title={`Welcome${user?.email ? `, ${user.email.split("@")[0]}` : ""}`} subtitle="Live overview across the Beacon Indica pipeline." />
      <PageBody>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardContent className="p-5">
                <c.icon className="text-primary mb-3" size={18} />
                <div className="text-3xl font-bold tracking-tight">{c.value}</div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{c.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent startups</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentStartups.length === 0 && <p className="text-sm text-muted-foreground">No startups yet.</p>}
              {recentStartups.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between border-b last:border-0 py-2">
                  <div>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.colleges?.name} · {s.domain ?? "—"}</div>
                  </div>
                  <StageBadge stage={s.stage} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Recent events</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentEvents.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
              {recentEvents.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between border-b last:border-0 py-2">
                  <div>
                    <div className="font-medium text-sm">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.colleges?.name} · {new Date(e.scheduled_at).toLocaleDateString()}</div>
                  </div>
                  <Badge variant={e.status === "live" ? "default" : "secondary"} className="capitalize">{e.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    ideation: "bg-muted text-muted-foreground",
    validating: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    mvp_live: "bg-primary/15 text-primary",
    revenue: "bg-green-500/15 text-green-700 dark:text-green-300",
  };
  const label: Record<string, string> = { ideation: "Ideation", validating: "Validating", mvp_live: "MVP Live", revenue: "Revenue" };
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${map[stage]}`}>{label[stage] ?? stage}</span>;
}

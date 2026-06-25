import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageBody } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team — Beacon Studios" }] }),
  component: TeamPage,
});

function TeamPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, phone, colleges(name)");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role, position, colleges(name)");
      const merged = (profiles ?? []).map((p: any) => ({
        ...p, roles: (roles ?? []).filter((r: any) => r.user_id === p.id),
      }));
      setRows(merged);
    })();
  }, []);

  const filtered = rows.filter((r) => !q || `${r.full_name} ${r.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Team directory" subtitle="Everyone working across Beacon Indica programs." />
      <PageBody>
        <Input placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <Avatar><AvatarFallback>{(p.full_name || p.email || "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                  {p.phone && <div className="text-xs text-muted-foreground">{p.phone}</div>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.roles.length === 0 && <Badge variant="outline" className="text-xs">pending</Badge>}
                    {p.roles.map((r: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs capitalize">{r.role.replace("_", " ")}{r.colleges?.name ? ` · ${r.colleges.name}` : ""}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}

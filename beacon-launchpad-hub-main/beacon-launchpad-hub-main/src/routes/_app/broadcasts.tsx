import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, PageBody } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/broadcasts")({
  head: () => ({ meta: [{ title: "Broadcasts — Beacon Studios" }] }),
  component: BroadcastsPage,
});

const ROLES = [{ v: "admin", l: "Admins" }, { v: "faculty", l: "Faculty" }, { v: "core_team", l: "Core Team" }];

function BroadcastsPage() {
  const { user, isAdmin, isFaculty } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", roles: [] as string[], colleges: [] as string[] });
  const canSend = isAdmin || isFaculty;

  const load = async () => {
    const { data } = await supabase.from("broadcasts").select("*, profiles!broadcasts_sender_id_fkey(full_name, email)").order("created_at", { ascending: false });
    setRows(data ?? []);
    const { data: c } = await supabase.from("colleges").select("id, name").order("name");
    setColleges(c ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("bc-rt").on("postgres_changes", { event: "*", schema: "public", table: "broadcasts" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const send = async () => {
    if (!form.title || !form.message || form.roles.length === 0) { toast.error("Title, message and at least one role required"); return; }
    const { error } = await supabase.from("broadcasts").insert({
      sender_id: user!.id, title: form.title, message: form.message,
      target_roles: form.roles as any, target_college_ids: form.colleges,
    });
    if (error) toast.error(error.message); else { toast.success("Broadcast sent"); setOpen(false); setForm({ title: "", message: "", roles: [], colleges: [] }); load(); }
  };

  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  return (
    <>
      <PageHeader title="Broadcasts" subtitle="Targeted announcements across roles and colleges." action={
        canSend && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus size={16} className="mr-1.5" /> New broadcast</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send broadcast</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} /></div>
                <div>
                  <Label className="mb-2 block">Target roles</Label>
                  <div className="flex gap-4">
                    {ROLES.map(r => (
                      <label key={r.v} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.roles.includes(r.v)} onCheckedChange={() => setForm({ ...form, roles: toggle(form.roles, r.v) })} />
                        {r.l}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Target colleges <span className="text-muted-foreground text-xs">(leave empty = all colleges)</span></Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-auto">
                    {colleges.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.colleges.includes(c.id)} onCheckedChange={() => setForm({ ...form, colleges: toggle(form.colleges, c.id) })} />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={send} className="w-full"><Megaphone size={14} className="mr-1.5" /> Send</Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      } />
      <PageBody>
        <div className="space-y-3 max-w-3xl">
          {rows.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{b.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 text-xs">
                  <span className="text-muted-foreground">From {b.profiles?.full_name || b.profiles?.email} · to</span>
                  {b.target_roles.map((r: string) => <Badge key={r} variant="secondary" className="capitalize">{r.replace("_", " ")}</Badge>)}
                  {b.target_college_ids.length > 0 && <Badge variant="outline">{b.target_college_ids.length} college{b.target_college_ids.length > 1 ? "s" : ""}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No broadcasts yet.</p>}
        </div>
      </PageBody>
    </>
  );
}

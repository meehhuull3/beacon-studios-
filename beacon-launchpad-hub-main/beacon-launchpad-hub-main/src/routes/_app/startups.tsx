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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { StageBadge } from "./dashboard";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/startups")({
  head: () => ({ meta: [{ title: "Startups — Beacon Studios" }] }),
  component: StartupsPage,
});

function StartupsPage() {
  const { isAdmin, isFaculty, isCoreTeam, collegeId } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", college_id: "", domain: "", stage: "ideation", members: "", description: "", revenue: 0 });
  const canEdit = isAdmin || isFaculty || isCoreTeam;

  const load = async () => {
    const q = supabase.from("startups").select("*, colleges(name), profiles!startups_faculty_id_fkey(full_name)").order("last_update", { ascending: false });
    const { data } = isAdmin ? await q : collegeId ? await q.eq("college_id", collegeId) : await q;
    setRows(data ?? []);
    const { data: c } = await supabase.from("colleges").select("id, name").order("name");
    setColleges(c ?? []);
    if (collegeId && !form.college_id) setForm((f) => ({ ...f, college_id: collegeId }));
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("startups-rt").on("postgres_changes", { event: "*", schema: "public", table: "startups" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, collegeId]);

  const onAdd = async () => {
    if (!form.name || !form.college_id) { toast.error("Name and college required"); return; }
    const { error } = await supabase.from("startups").insert({
      name: form.name, college_id: form.college_id, domain: form.domain || null,
      stage: form.stage as any, members: form.members || null, description: form.description || null,
      revenue: form.revenue || 0,
    });
    if (error) toast.error(error.message); else { toast.success("Startup added"); setOpen(false); setForm({ ...form, name: "", domain: "", members: "", description: "", revenue: 0 }); load(); }
  };

  const updateStage = async (id: string, stage: string) => {
    const { error } = await supabase.from("startups").update({ stage: stage as any, last_update: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Stage updated");
  };

  return (
    <>
      <PageHeader title="Startups" subtitle="The full pipeline across colleges, with live stage updates." action={
        canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus size={16} className="mr-1.5" /> Add startup</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add startup</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Domain</Label><Input placeholder="EdTech, FinTech…" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>College</Label>
                    <Select value={form.college_id} onValueChange={(v) => setForm({ ...form, college_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                      <SelectContent>{colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Stage</Label>
                    <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ideation">Ideation</SelectItem>
                        <SelectItem value="validating">Validating</SelectItem>
                        <SelectItem value="mvp_live">MVP Live</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Members (comma separated)</Label><Input value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>Revenue (₹)</Label><Input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })} /></div>
                <Button onClick={onAdd} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      } />
      <PageBody>
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Startup</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Last update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.members ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-sm">{s.colleges?.name}</TableCell>
                  <TableCell className="text-sm">{s.domain ?? "—"}</TableCell>
                  <TableCell>
                    {canEdit ? (
                      <Select value={s.stage} onValueChange={(v) => updateStage(s.id, v)}>
                        <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ideation">Ideation</SelectItem>
                          <SelectItem value="validating">Validating</SelectItem>
                          <SelectItem value="mvp_live">MVP Live</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : <StageBadge stage={s.stage} />}
                  </TableCell>
                  <TableCell>{s.revenue > 0 ? `₹${Number(s.revenue).toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(s.last_update), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No startups yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </PageBody>
    </>
  );
}

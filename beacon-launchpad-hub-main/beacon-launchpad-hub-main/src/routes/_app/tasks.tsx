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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Beacon Studios" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { user, isAdmin, isFaculty } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignee_id: "", due_date: "" });
  const canAssign = isAdmin || isFaculty;

  const load = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*, assignee:profiles!tasks_assignee_id_fkey(full_name, email), assigner:profiles!tasks_assigner_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    if (canAssign) {
      const { data: p } = await supabase.from("profiles").select("id, full_name, email").order("full_name");
      setPeople(p ?? []);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("tasks-rt").on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, isFaculty]);

  const create = async () => {
    if (!form.title || !form.assignee_id) { toast.error("Title and assignee required"); return; }
    const { error } = await supabase.from("tasks").insert({
      title: form.title, description: form.description || null,
      assigner_id: user!.id, assignee_id: form.assignee_id,
      due_date: form.due_date || null, status: "pending",
    });
    if (error) toast.error(error.message); else { toast.success("Task assigned"); setOpen(false); setForm({ title: "", description: "", assignee_id: "", due_date: "" }); load(); }
  };

  const setStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "done") patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  return (
    <>
      <PageHeader title="Tasks" subtitle="Assign, track and close work across teams." action={
        canAssign && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus size={16} className="mr-1.5" /> Assign task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign a task</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div>
                  <Label>Assign to</Label>
                  <Select value={form.assignee_id} onValueChange={(v) => setForm({ ...form, assignee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                    <SelectContent>{people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                <Button onClick={create} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      } />
      <PageBody>
        <div className="grid md:grid-cols-3 gap-4">
          {(["pending", "in_progress", "done"] as const).map((col) => (
            <div key={col}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold capitalize text-sm">{col.replace("_", " ")}</h3>
                <Badge variant="secondary">{rows.filter((r) => r.status === col).length}</Badge>
              </div>
              <div className="space-y-2">
                {rows.filter((r) => r.status === col).map((t) => {
                  const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
                  return (
                    <Card key={t.id} className={overdue ? "border-destructive/50" : ""}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm">{t.title}</div>
                          {overdue && <AlertCircle size={14} className="text-destructive shrink-0" />}
                        </div>
                        {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                        <div className="text-xs text-muted-foreground">
                          {t.assignee?.full_name || t.assignee?.email} · {t.due_date ? format(new Date(t.due_date), "MMM d") : "no due date"}
                        </div>
                        <div className="text-xs text-muted-foreground">From: {t.assigner?.full_name || t.assigner?.email}</div>
                        {(t.assignee_id === user!.id || canAssign) && (
                          <div className="flex gap-1 pt-1">
                            {col !== "pending" && <Button size="sm" variant="ghost" onClick={() => setStatus(t.id, "pending")}><Circle size={12} /></Button>}
                            {col !== "in_progress" && <Button size="sm" variant="ghost" onClick={() => setStatus(t.id, "in_progress")}>→</Button>}
                            {col !== "done" && <Button size="sm" variant="ghost" onClick={() => setStatus(t.id, "done")}><CheckCircle2 size={12} /></Button>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {rows.filter((r) => r.status === col).length === 0 && <p className="text-xs text-muted-foreground italic">No tasks.</p>}
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}

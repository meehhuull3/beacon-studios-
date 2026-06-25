import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, PageBody } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/colleges")({
  head: () => ({ meta: [{ title: "Colleges — Beacon Studios" }] }),
  component: CollegesPage,
});

function CollegesPage() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", mou_signed_at: "" });

  const load = async () => {
    const { data } = await supabase
      .from("colleges")
      .select("*, programs(id, phase, start_date, end_date, enrolled_students), startups(id)")
      .order("name");
    setRows(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const onAdd = async () => {
    if (!form.name) return;
    const { error } = await supabase.from("colleges").insert({ name: form.name, location: form.location || null, mou_signed_at: form.mou_signed_at || null });
    if (error) toast.error(error.message); else { toast.success("College added"); setOpen(false); setForm({ name: "", location: "", mou_signed_at: "" }); load(); }
  };
  const onDelete = async (id: string) => {
    if (!confirm("Delete this college?")) return;
    const { error } = await supabase.from("colleges").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <>
      <PageHeader title="Colleges" subtitle="Partner colleges where Beacon Indica runs programs." action={
        isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus size={16} className="mr-1.5" /> Add college</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add college</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div><Label>MOU signed date</Label><Input type="date" value={form.mou_signed_at} onChange={(e) => setForm({ ...form, mou_signed_at: e.target.value })} /></div>
                <Button onClick={onAdd} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      } />
      <PageBody>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((c) => {
            const activeProg = (c.programs ?? []).find((p: any) => new Date(p.end_date) >= new Date());
            const day = activeProg ? Math.max(1, Math.floor((Date.now() - new Date(activeProg.start_date).getTime()) / 86400000) + 1) : 0;
            return (
              <Card key={c.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-lg">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.location ?? "—"}</div>
                    </div>
                    <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-muted rounded p-2"><div className="text-lg font-bold">{c.startups?.length ?? 0}</div><div className="text-[10px] uppercase text-muted-foreground">Startups</div></div>
                    <div className="bg-muted rounded p-2"><div className="text-lg font-bold">{c.programs?.length ?? 0}</div><div className="text-[10px] uppercase text-muted-foreground">Cohorts</div></div>
                    <div className="bg-muted rounded p-2"><div className="text-lg font-bold">{day || "—"}</div><div className="text-[10px] uppercase text-muted-foreground">Day</div></div>
                  </div>
                  {activeProg && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <span className="capitalize font-medium text-foreground">{activeProg.phase}</span> · {activeProg.enrolled_students} students enrolled
                    </div>
                  )}
                  {isAdmin && (
                    <Button variant="ghost" size="sm" className="mt-3 text-destructive hover:text-destructive" onClick={() => onDelete(c.id)}><Trash2 size={14} className="mr-1" /> Remove</Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No colleges yet.</p>}
        </div>
      </PageBody>
    </>
  );
}

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
import { Plus, MapPin, Mic, Calendar as CalIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/events")({
  head: () => ({ meta: [{ title: "Events — Beacon Studios" }] }),
  component: EventsPage,
});

function EventsPage() {
  const { user, collegeId, isAdmin } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "event", college_id: "", scheduled_at: "", venue: "", mentor: "" });

  const load = async () => {
    const { data } = await supabase.from("events").select("*, colleges(name)").order("scheduled_at", { ascending: false });
    setRows(data ?? []);
    const { data: c } = await supabase.from("colleges").select("id, name").order("name");
    setColleges(c ?? []);
    if (collegeId && !form.college_id) setForm((f) => ({ ...f, college_id: collegeId }));
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("events-rt").on("postgres_changes", { event: "*", schema: "public", table: "events" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [collegeId]);

  const create = async () => {
    if (!form.title || !form.college_id || !form.scheduled_at) { toast.error("Title, college, and date required"); return; }
    const { error } = await supabase.from("events").insert({
      title: form.title, type: form.type as any, college_id: form.college_id,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      venue: form.venue || null, mentor: form.mentor || null,
      created_by: user!.id, status: "upcoming",
    });
    if (error) toast.error(error.message); else { toast.success("Event logged"); setOpen(false); load(); }
  };
  const setStatus = async (id: string, status: string, report?: string) => {
    const patch: any = { status };
    if (report !== undefined) patch.report = report;
    const { error } = await supabase.from("events").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  return (
    <>
      <PageHeader title="Events, podcasts & talks" subtitle="Real-time event logging from college core teams." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus size={16} className="mr-1.5" /> Log event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log a new event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="talk">Talk</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>College</Label>
                  <Select value={form.college_id} onValueChange={(v) => setForm({ ...form, college_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                    <SelectContent>{colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Date & time</Label><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
                <div><Label>Mentor / Speaker</Label><Input value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })} /></div>
              </div>
              <Button onClick={create} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <PageBody>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">{e.type}</Badge>
                  <Select value={e.status} onValueChange={(v) => setStatus(e.id, v)}>
                    <SelectTrigger className="h-7 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <h3 className="font-semibold">{e.title}</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5"><CalIcon size={12} /> {format(new Date(e.scheduled_at), "MMM d, yyyy · h:mm a")}</div>
                  {e.venue && <div className="flex items-center gap-1.5"><MapPin size={12} /> {e.venue}</div>}
                  {e.mentor && <div className="flex items-center gap-1.5"><Mic size={12} /> {e.mentor}</div>}
                  <div>📍 {e.colleges?.name}</div>
                </div>
                {e.status === "completed" && (
                  <Textarea placeholder="Add post-event report…" defaultValue={e.report ?? ""} onBlur={(ev) => { if (ev.target.value !== e.report) setStatus(e.id, "completed", ev.target.value); }} className="text-xs min-h-[60px]" />
                )}
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No events yet — log the first one.</p>}
        </div>
      </PageBody>
    </>
  );
}

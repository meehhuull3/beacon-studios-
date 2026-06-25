import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageBody } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { approveSignup, rejectSignup } from "@/lib/approvals.functions";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Beacon Studios" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const approve = useServerFn(approveSignup);
  const reject = useServerFn(rejectSignup);
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("signup_requests").select("*, colleges(name)").order("created_at", { ascending: false });
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("sr-rt").on("postgres_changes", { event: "*", schema: "public", table: "signup_requests" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const onApprove = async (id: string) => {
    try { await approve({ data: { request_id: id } }); toast.success("Approved"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const onReject = async (id: string) => {
    try { await reject({ data: { request_id: id } }); toast.success("Rejected"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <>
      <PageHeader title="Account approvals" subtitle="Grant or deny access requests." />
      <PageBody>
        <div className="space-y-3 max-w-3xl">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{r.full_name} <span className="text-muted-foreground text-sm">· {r.email}</span></div>
                  <div className="flex gap-2 mt-2 flex-wrap text-xs">
                    <Badge variant="outline" className="capitalize">{r.requested_role.replace("_", " ")}</Badge>
                    {r.colleges?.name && <Badge variant="secondary">{r.colleges.name}</Badge>}
                    {r.position && <Badge variant="secondary" className="capitalize">{r.position.replace("_", " ")}</Badge>}
                    {r.phone && <Badge variant="outline">{r.phone}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {r.status === "pending" ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onReject(r.id)}><X size={14} className="mr-1" /> Reject</Button>
                      <Button size="sm" onClick={() => onApprove(r.id)}><Check size={14} className="mr-1" /> Approve</Button>
                    </>
                  ) : (
                    <Badge variant={r.status === "approved" ? "default" : "destructive"} className="capitalize">{r.status}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No signup requests yet.</p>}
        </div>
      </PageBody>
    </>
  );
}

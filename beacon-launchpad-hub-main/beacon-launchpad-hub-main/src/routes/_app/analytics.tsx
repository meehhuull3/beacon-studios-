import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageBody } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Beacon Studios" }] }),
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.62 0.13 188)", "oklch(0.65 0.18 250)", "oklch(0.7 0.18 70)", "oklch(0.6 0.2 320)"];
const STAGE_LABELS: any = { ideation: "Ideation", validating: "Validating", mvp_live: "MVP Live", revenue: "Revenue" };

function AnalyticsPage() {
  const [stageData, setStageData] = useState<any[]>([]);
  const [collegeData, setCollegeData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [eventsMonth, setEventsMonth] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: startups } = await supabase.from("startups").select("stage, revenue, colleges(name), created_at");
      const stages = ["ideation", "validating", "mvp_live", "revenue"];
      setStageData(stages.map((s) => ({ name: STAGE_LABELS[s], count: (startups ?? []).filter((x: any) => x.stage === s).length })));

      const byCollege: any = {};
      (startups ?? []).forEach((s: any) => {
        const k = s.colleges?.name ?? "—";
        byCollege[k] = (byCollege[k] ?? 0) + 1;
      });
      setCollegeData(Object.entries(byCollege).map(([name, count]) => ({ name, count })));

      const revByCollege: any = {};
      (startups ?? []).forEach((s: any) => {
        const k = s.colleges?.name ?? "—";
        revByCollege[k] = (revByCollege[k] ?? 0) + Number(s.revenue ?? 0);
      });
      setRevenueData(Object.entries(revByCollege).map(([name, revenue]) => ({ name, revenue })));

      const { data: events } = await supabase.from("events").select("scheduled_at");
      const byMonth: any = {};
      (events ?? []).forEach((e: any) => {
        const d = new Date(e.scheduled_at);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonth[k] = (byMonth[k] ?? 0) + 1;
      });
      setEventsMonth(Object.entries(byMonth).sort().map(([month, count]) => ({ month, count })));
    })();
  }, []);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Pipeline performance across colleges, stages and time." />
      <PageBody>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Startups by stage</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer><BarChart data={stageData}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.008 240)" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="oklch(0.62 0.13 188)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Startups per college</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer><PieChart><Pie data={collegeData} dataKey="count" nameKey="name" innerRadius={50} outerRadius={80} label>{collegeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue generated (₹)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer><BarChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.008 240)" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="revenue" fill="oklch(0.6 0.2 145)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Events over time</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer><LineChart data={eventsMonth}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.008 240)" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke="oklch(0.65 0.18 250)" strokeWidth={2} /></LineChart></ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

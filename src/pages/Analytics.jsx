import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Rocket, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [filterCollege, setFilterCollege] = React.useState('all');

  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });
  const { data: startups = [] } = useQuery({ queryKey: ['startups'], queryFn: () => base44.entities.Startup.list() });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list() });
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list() });

  const filtered = filterCollege === 'all'
    ? { startups, events, team: teamMembers }
    : { startups: startups.filter(s => s.college_id === filterCollege), events: events.filter(e => e.college_id === filterCollege), team: teamMembers.filter(t => t.college_id === filterCollege) };

  // Stage distribution
  const stageData = [
    { name: 'Ideation', value: filtered.startups.filter(s => s.stage === 'ideation').length, fill: '#3b82f6' },
    { name: 'Validating', value: filtered.startups.filter(s => s.stage === 'validating').length, fill: '#f59e0b' },
    { name: 'MVP Live', value: filtered.startups.filter(s => s.stage === 'mvp_live').length, fill: '#7c3aed' },
    { name: 'Revenue', value: filtered.startups.filter(s => s.stage === 'revenue').length, fill: '#10b981' },
  ];

  // Phase distribution
  const phaseData = [
    { name: 'Genesis', value: filtered.startups.filter(s => s.phase === 'genesis').length },
    { name: 'Fellowship', value: filtered.startups.filter(s => s.phase === 'fellowship').length },
    { name: 'Accelerator', value: filtered.startups.filter(s => s.phase === 'accelerator').length },
  ];

  // Startups per college
  const collegeData = colleges.map(c => ({
    name: c.name?.length > 12 ? c.name.slice(0, 12) + '...' : c.name,
    startups: startups.filter(s => s.college_id === c.id).length,
    students: c.total_students_enrolled || 0,
  }));

  // Event type breakdown
  const eventTypes = ['event', 'podcast', 'talk', 'cohort', 'workshop'].map(t => ({
    name: t.charAt(0).toUpperCase() + t.slice(1),
    count: filtered.events.filter(e => e.type === t).length,
  }));

  // Team role distribution
  const roleData = ['faculty', 'president', 'vice_president', 'marketing', 'tech'].map(r => ({
    name: r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: filtered.team.filter(m => m.role === r).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Program performance & insights</p>
        </div>
        <Select value={filterCollege} onValueChange={setFilterCollege}>
          <SelectTrigger className="w-[200px] mr-12 md:mr-20"><SelectValue placeholder="All Colleges" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Building2} label="Active Colleges" value={colleges.filter(c => c.status === 'active').length} />
        <SummaryCard icon={Rocket} label="Total Startups" value={filtered.startups.length} />
        <SummaryCard icon={Users} label="Team Size" value={filtered.team.length} />
        <SummaryCard icon={TrendingUp} label="Revenue Stage" value={filtered.startups.filter(s => s.stage === 'revenue').length} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Startup Stages">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stageData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
                {stageData.map((_, i) => <Cell key={i} fill={stageData[i].fill} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Program Phases">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={phaseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Startups per College">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={collegeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="startups" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Event Types">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={eventTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Team Distribution */}
      <ChartCard title="Team Role Distribution">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={roleData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
              {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

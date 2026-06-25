import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Rocket, Trash2, Pencil, Search, X } from 'lucide-react';
import { toast } from 'sonner';

const stageConfig = {
  ideation: { label: 'Ideation', color: 'bg-blue-100 text-blue-700' },
  validating: { label: 'Validating', color: 'bg-amber-100 text-amber-700' },
  mvp_live: { label: 'MVP Live', color: 'bg-violet-100 text-violet-700' },
  revenue: { label: 'Revenue', color: 'bg-emerald-100 text-emerald-700' },
};

const phaseConfig = {
  genesis: { label: 'Genesis', color: 'bg-sky-100 text-sky-700' },
  fellowship: { label: 'Fellowship', color: 'bg-purple-100 text-purple-700' },
  accelerator: { label: 'Accelerator', color: 'bg-rose-100 text-rose-700' },
};

export default function Startups() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterCollege, setFilterCollege] = useState('all');
  const [detailStartup, setDetailStartup] = useState(null);
  const [form, setForm] = useState({ name: '', college_id: '', domain: '', stage: 'ideation', phase: 'genesis', description: '', last_update: '' });
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: startups = [] } = useQuery({ queryKey: ['startups'], queryFn: () => base44.entities.Startup.list('-created_at') });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });

  const role = user?.role || 'core_team';
  const userCollegeId = user?.college_id;

  const createNotif = async (type, message, entityId, collegeId) => {
    try {
      await base44.entities.Notification.create({
        type, message, college_id: collegeId,
        target_role: 'all', actor_name: user?.full_name || 'Someone',
        actor_role: role, entity_id: entityId, entity_type: 'startup'
      });
    } catch {}
  };

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Startup.create(d),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['startups'] }); setOpen(false); resetForm(); toast.success('Startup added');
      createNotif('startup_added', `${user?.full_name || 'Someone'} added a new startup "${form.name}"`, result.id, form.college_id);
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Startup.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['startups'] }); setOpen(false); setEditing(null); resetForm(); toast.success('Startup updated');
      createNotif('startup_updated', `${user?.full_name || 'Someone'} updated "${form.name}"`, editing?.id, editing?.college_id);
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Startup.delete(id),
    onSuccess: (_result, deletedId) => {
      qc.invalidateQueries({ queryKey: ['startups'] }); toast.success('Startup removed');
      const s = startups.find(x => x.id === deletedId);
      if (s) createNotif('startup_removed', `${user?.full_name || 'Someone'} removed "${s.name}"`, deletedId, s.college_id);
    },
  });

  const resetForm = () => setForm({ name: '', college_id: '', domain: '', stage: 'ideation', phase: 'genesis', description: '', last_update: '' });

  const handleEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, college_id: s.college_id, domain: s.domain || '', stage: s.stage || 'ideation', phase: s.phase || 'genesis', description: s.description || '', last_update: s.last_update || '' });
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Force college_id for non-admin users
    const data = role !== 'admin' ? { ...form, college_id: userCollegeId } : form;
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const visibleStartups = ((role === 'admin' || !userCollegeId) ? startups : startups.filter(s => s.college_id === userCollegeId))
    .filter(s => filterStage === 'all' || s.stage === filterStage)
    .filter(s => filterCollege === 'all' || s.college_id === filterCollege)
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.domain?.toLowerCase().includes(search.toLowerCase()));

  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Startups</h1>
          <p className="text-sm text-muted-foreground mt-1">{visibleStartups.length} startups tracked</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Startup</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Startup</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Startup Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>College *</Label>
                  {role === 'admin' ? (
                    <Select value={form.college_id} onValueChange={v => setForm({...form, college_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                      <SelectContent>
                        {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={getCollegeName(userCollegeId)} disabled className="opacity-70" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Input value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} placeholder="e.g. EdTech, FinTech" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={v => setForm({...form, stage: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ideation">Ideation</SelectItem>
                      <SelectItem value="validating">Validating</SelectItem>
                      <SelectItem value="mvp_live">MVP Live</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phase</Label>
                  <Select value={form.phase} onValueChange={v => setForm({...form, phase: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genesis">Genesis</SelectItem>
                      <SelectItem value="fellowship">Fellowship</SelectItem>
                      <SelectItem value="accelerator">Accelerator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Last Update</Label>
                <Input value={form.last_update} onChange={e => setForm({...form, last_update: e.target.value})} placeholder="Latest progress note" />
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? 'Update' : 'Add'} Startup
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search startups..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="ideation">Ideation</SelectItem>
            <SelectItem value="validating">Validating</SelectItem>
            <SelectItem value="mvp_live">MVP Live</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
          </SelectContent>
        </Select>
        {role === 'admin' && (
          <Select value={filterCollege} onValueChange={setFilterCollege}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="College" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/50">
                <th className="px-5 py-3 font-medium">Startup</th>
                <th className="px-5 py-3 font-medium">College</th>
                <th className="px-5 py-3 font-medium">Domain</th>
                <th className="px-5 py-3 font-medium">Stage</th>
                <th className="px-5 py-3 font-medium">Phase</th>
                <th className="px-5 py-3 font-medium">Last Update</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleStartups.map(s => {
                const stage = stageConfig[s.stage] || stageConfig.ideation;
                const phase = phaseConfig[s.phase] || phaseConfig.genesis;
                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetailStartup(s)}>
                    <td className="px-5 py-4 font-medium">{s.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{getCollegeName(s.college_id)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{s.domain || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>{stage.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${phase.color}`}>{phase.label}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs max-w-[200px] truncate">{s.last_update || '—'}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {visibleStartups.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Rocket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No startups found</p>
          </div>
        )}
      </div>

      {/* Startup Detail Dialog */}
      <Dialog open={!!detailStartup} onOpenChange={(v) => { if (!v) setDetailStartup(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              {detailStartup?.name}
            </DialogTitle>
          </DialogHeader>
          {detailStartup && (() => {
            const stage = stageConfig[detailStartup.stage] || stageConfig.ideation;
            const phase = phaseConfig[detailStartup.phase] || phaseConfig.genesis;
            return (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${stage.color}`}>{stage.label}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${phase.color}`}>{phase.label}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${detailStartup.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>{detailStartup.status}</span>
                </div>
                <div className="bg-muted/40 rounded-lg p-4 space-y-2.5 text-sm">
                  {[
                    ['College', getCollegeName(detailStartup.college_id)],
                    ['Domain', detailStartup.domain],
                    ['Funding', detailStartup.funding_amount > 0 ? `₹${detailStartup.funding_amount.toLocaleString()}` : null],
                    ['Revenue', detailStartup.revenue_generated > 0 ? `₹${detailStartup.revenue_generated.toLocaleString()}` : null],
                    ['Last Update', detailStartup.last_update],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <span className="font-medium text-sm text-right">{value}</span>
                    </div>
                  ))}
                </div>
                {detailStartup.description && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Description</p>
                    <p className="text-sm leading-relaxed text-foreground">{detailStartup.description}</p>
                  </div>
                )}
                {detailStartup.team_members?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">Team Members</p>
                    <div className="space-y-1.5">
                      {detailStartup.team_members.map((m, i) => (
                        <div key={i} className="text-xs bg-muted/30 rounded-md px-3 py-2 flex justify-between">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-muted-foreground">{m.branch} {m.college_id_number ? `· ${m.college_id_number}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Users, Rocket, MapPin, Trash2, Pencil, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CollegeDetail from '@/components/dashboard/CollegeDetail';
import { useAuth } from '@/lib/AuthContext';

export default function Colleges() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailCollege, setDetailCollege] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', contact_email: '', contact_phone: '', mou_date: '', program_start_date: '', program_duration_days: 90, status: 'active' });
  const qc = useQueryClient();
  const { user } = useAuth();
  const role = user?.role;

  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });
  const { data: startups = [] } = useQuery({ queryKey: ['startups'], queryFn: () => base44.entities.Startup.list() });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list() });
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list() });

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.College.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colleges'] }); setOpen(false); resetForm(); toast.success('College added'); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.College.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colleges'] }); setOpen(false); setEditing(null); resetForm(); toast.success('College updated'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.College.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colleges'] }); toast.success('College removed'); },
  });

  const resetForm = () => setForm({ name: '', location: '', contact_email: '', contact_phone: '', mou_date: '', program_start_date: '', program_duration_days: 90, status: 'active' });

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, location: c.location || '', contact_email: c.contact_email || '', contact_phone: c.contact_phone || '', mou_date: c.mou_date || '', program_start_date: c.program_start_date || '', program_duration_days: c.program_duration_days || 90, status: c.status || 'active' });
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  const statusColor = { active: 'bg-emerald-100 text-emerald-700', inactive: 'bg-red-100 text-red-700', pending: 'bg-amber-100 text-amber-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Colleges</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage partner colleges and their programs</p>
        </div>
        {(role === 'admin' || role === 'associate') && (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add College</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} College</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>College Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>MOU Date</Label>
                  <Input type="date" value={form.mou_date} onChange={e => setForm({...form, mou_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Program Start Date</Label>
                  <Input type="date" value={form.program_start_date} onChange={e => setForm({...form, program_start_date: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Program Duration (days)</Label>
                <Input type="number" value={form.program_duration_days} onChange={e => setForm({...form, program_duration_days: Number(e.target.value)})} />
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? 'Update' : 'Add'} College
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {colleges.map(c => {
          const collegeStartups = startups.filter(s => s.college_id === c.id);
          const collegeTeam = teamMembers.filter(t => t.college_id === c.id);
          const collegeEvents = events.filter(e => e.college_id === c.id);
          return (
            <div key={c.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 group cursor-pointer" onClick={() => setDetailCollege(c)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">{c.name}</h3>
                    {c.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{c.location}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[c.status] || statusColor.pending}`}>
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{c.total_students_enrolled || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{collegeStartups.length}</p>
                  <p className="text-[10px] text-muted-foreground">Startups</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{collegeEvents.length}</p>
                  <p className="text-[10px] text-muted-foreground">Events</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{collegeTeam.length}</p>
                  <p className="text-[10px] text-muted-foreground">Team</p>
                </div>
              </div>

              {c.program_start_date && (
                <p className="text-xs text-muted-foreground mb-3">
                  Program started: {format(new Date(c.program_start_date), 'MMM d, yyyy')}
                  {c.current_day && ` · Day ${c.current_day}`}
                </p>
              )}

              {(role === 'admin' || role === 'associate') && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={(e) => { e.stopPropagation(); handleEdit(c); }}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); deleteMut.mutate(c.id); }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              )}
            </div>
          );
        })}
      </div>

      {colleges.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No colleges yet</p>
          <p className="text-sm mt-1">Add your first partner college to get started</p>
        </div>
      )}

      <CollegeDetail
        college={detailCollege}
        startups={startups}
        events={events}
        teamMembers={teamMembers}
        open={!!detailCollege}
        onClose={() => setDetailCollege(null)}
      />
    </div>
  );
}

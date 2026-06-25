import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Trash2, CheckCircle, XCircle, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roleLabels = {
  admin: 'Admin',
  associate: 'Associate',
  faculty: 'Faculty',
  core_team: 'Core Team',
  president: 'President',
  vice_president: 'Vice President',
  marketing: 'Marketing & Growth',
  tech: 'Tech Team',
};

const roleColors = {
  faculty: 'bg-violet-100 text-violet-700',
  president: 'bg-amber-100 text-amber-700',
  vice_president: 'bg-blue-100 text-blue-700',
  marketing: 'bg-emerald-100 text-emerald-700',
  tech: 'bg-rose-100 text-rose-700',
};

export default function Team() {
  const [open, setOpen] = useState(false);
  const [filterCollege, setFilterCollege] = useState('all');
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', college_id: '', role: 'tech', branch: '', college_id_number: '', status: 'active' });
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: members = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list() });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });

  const role = user?.role || 'core_team';
  const canManage = role === 'admin' || role === 'faculty';

  const visibleMembers = ((role === 'admin' || role === 'associate') ? members : members.filter(m => m.college_id === user?.college_id))
    .filter(m => filterCollege === 'all' || m.college_id === filterCollege);

  const getMemberRoleLabel = (m) => {
    if (m.role === 'core_team') {
      const pos = m.position;
      const posLabel = pos === 'president' ? 'President'
        : pos === 'vice_president' ? 'Vice President'
        : pos === 'marketing' ? 'Marketing & Growth'
        : pos === 'tech' ? 'Tech Team'
        : pos;
      return posLabel ? `Core Team - ${posLabel}` : 'Core Team';
    }
    return roleLabels[m.role] || m.role;
  };

  const getMemberRoleColor = (m) => {
    const roleKey = m.role === 'core_team' ? m.position : m.role;
    return roleColors[roleKey] || 'bg-gray-100 text-gray-700';
  };

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.TeamMember.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); setOpen(false); resetForm(); toast.success('Member added'); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Updated'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Member removed'); },
  });

  const resetForm = () => setForm({ full_name: '', email: '', phone: '', college_id: '', role: 'tech', branch: '', college_id_number: '', status: 'active' });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMut.mutate(form);
  };

  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '—';
  const pendingMembers = visibleMembers.filter(m => m.status === 'pending_approval');
  const activeMembers = visibleMembers.filter(m => m.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{role === 'admin' ? 'All Teams' : 'Core Team'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeMembers.length} active members</p>
        </div>
        <div className="flex items-center gap-3 mr-12 md:mr-20">
          {role === 'admin' && (
            <Select value={filterCollege} onValueChange={setFilterCollege}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Colleges" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {canManage && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>College *</Label>
                      <Select value={form.college_id} onValueChange={v => setForm({...form, college_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {role === 'admin' && <SelectItem value="faculty">Faculty</SelectItem>}
                          <SelectItem value="president">President</SelectItem>
                          <SelectItem value="vice_president">Vice President</SelectItem>
                          <SelectItem value="marketing">Marketing & Growth</SelectItem>
                          <SelectItem value="tech">Tech Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Branch</Label><Input value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} /></div>
                    <div className="space-y-2"><Label>College ID</Label><Input value={form.college_id_number} onChange={e => setForm({...form, college_id_number: e.target.value})} /></div>
                  </div>
                  <Button type="submit" className="w-full">Add Member</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Pending Approvals */}
      {canManage && pendingMembers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 text-sm mb-3">Pending Approvals ({pendingMembers.length})</h3>
          <div className="space-y-2">
            {pendingMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                <div>
                  <p className="font-medium text-sm">{m.full_name}</p>
                  <p className="text-xs text-muted-foreground">{m.email} · {getMemberRoleLabel(m)} · {getCollegeName(m.college_id)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-emerald-600 h-8 gap-1" onClick={() => updateMut.mutate({ id: m.id, data: { status: 'active' } })}>
                    <CheckCircle className="w-3.5 h-3.5" />Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 h-8" onClick={() => deleteMut.mutate(m.id)}>
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Members */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeMembers.map(m => (
          <div key={m.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {m.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{m.full_name}</h4>
                  <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium", getMemberRoleColor(m))}>
                    {getMemberRoleLabel(m)}
                  </span>
                </div>
              </div>
              {canManage && (
                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteMut.mutate(m.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{m.email}</p>
              {!(role === 'faculty' || role === 'core_team') && (
                <>
                  {m.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{m.phone}</p>}
                  <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />{getCollegeName(m.college_id)}</p>
                  {m.branch && <p className="text-muted-foreground/70">Branch: {m.branch}</p>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeMembers.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No team members yet</p>
        </div>
      )}
    </div>
  );
}

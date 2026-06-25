import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, X, UserCheck, Phone, Mail, GraduationCap, Clock, Eye, Search, Users, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';

const roleLabels = { admin: 'Admin', faculty: 'Faculty', core_team: 'Core Team', associate: 'Associate' };
const positionLabels = { president: 'President', vice_president: 'Vice President', marketing: 'Marketing', tech: 'Tech' };
const roleColors = { admin: 'bg-violet-100 text-violet-700', faculty: 'bg-blue-100 text-blue-700', core_team: 'bg-emerald-100 text-emerald-700', associate: 'bg-orange-100 text-orange-700' };

export default function AdminApprovals() {
  const { user } = useAuth();
  const role = user?.role;

  if (role && role !== 'admin' && role !== 'associate') {
    return <Navigate to="/" replace />;
  }

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: members = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list('-created_at') });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });

  const pending = members.filter(m => m.status === 'pending_approval');
  const active = members.filter(m => m.status === 'active');
  const declined = members.filter(m => m.status === 'inactive');

  const filteredActive = active.filter(m =>
    !search ||
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    getCollegeName(m.college_id)?.toLowerCase().includes(search.toLowerCase())
  );

  const approveMut = useMutation({
    mutationFn: async (member) => {
      await base44.entities.TeamMember.update(member.id, { status: 'active' });
        try {
          await base44.entities.Notification.create({
            type: 'member_approved',
            message: `Your signup request has been approved! You now have access as ${roleLabels[member.role] || member.role}.`,
            college_id: member.college_id,
            target_role: 'all',
            actor_name: 'Admin',
            entity_id: member.id,
            entity_type: 'teammember'
          });
        } catch {}
        // Post system messages to relevant messaging groups
        try {
          const systemMsg = `${member.full_name} has joined as ${roleLabels[member.role] || member.role}.`;
          const systemBase = { sender_name: 'System', sender_role: 'system', is_system: true, content: systemMsg };
          const role = member.role;
          // All relevant groups based on role
          const groupsToNotify = [];
          if (role === 'admin') groupsToNotify.push('admins_associates', 'admins_all');
          if (role === 'associate') groupsToNotify.push('admins_associates', 'associates_faculty', 'associates_coreteam', 'associates_all');
          if (role === 'faculty') {
            groupsToNotify.push('admins_all', 'associates_faculty', 'associates_all');
            if (member.college_id) groupsToNotify.push(`college_${member.college_id}`);
          }
          if (role === 'core_team') {
            groupsToNotify.push('admins_all', 'associates_coreteam', 'associates_all');
            if (member.college_id) groupsToNotify.push(`college_${member.college_id}`);
          }
          for (const groupId of groupsToNotify) {
            await base44.entities.Message.create({ ...systemBase, group_id: groupId, college_id: member.college_id || null });
          }
        } catch {}
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Member approved'); setSelected(null); },
  });

  const declineMut = useMutation({
    mutationFn: (member) => base44.entities.TeamMember.update(member.id, { status: 'inactive' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Member declined'); setSelected(null); },
  });

  function getCollegeName(id) { return colleges.find(c => c.id === id)?.name || '—'; }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-heading font-bold">Approvals & User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Review signups and manage all platform users</p>
      </div>

      {/* Pending Approvals */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          Pending Approvals
          <span className="text-muted-foreground font-normal text-sm">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No pending approval requests</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pending.map(m => (
              <div
                key={m.id}
                className="bg-card rounded-xl border border-amber-200 bg-amber-50/30 p-5 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelected(m)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-sm">{m.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleColors[m.role] || 'bg-gray-100'}`}>
                    {roleLabels[m.role] || m.role}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  {m.college_id && <p className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3" />{getCollegeName(m.college_id)}</p>}
                  {m.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{m.phone}</p>}
                  {m.position && <p className="flex items-center gap-1.5"><Shield className="w-3 h-3" />{positionLabels[m.position] || m.position}</p>}
                  {m.created_at && <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{format(new Date(m.created_at), 'MMM d, yyyy')}</p>}
                </div>
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button size="sm" className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={(e) => { e.stopPropagation(); approveMut.mutate(m); }} disabled={approveMut.isPending}>
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-destructive" onClick={(e) => { e.stopPropagation(); declineMut.mutate(m); }} disabled={declineMut.isPending}>
                    <X className="w-3.5 h-3.5" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* User Directory */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Active Users
            <span className="text-muted-foreground font-normal text-sm">({active.length})</span>
          </h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 h-8 text-sm" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/50">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Position</th>
                  <th className="px-5 py-3 font-medium">College</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredActive.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{m.full_name}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{m.email}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{m.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[m.role] || 'bg-gray-100'}`}>
                        {roleLabels[m.role] || m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs capitalize">
                      {m.position ? (positionLabels[m.position] || m.position) : '—'}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{getCollegeName(m.college_id)}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {m.created_at ? format(new Date(m.created_at), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Button size="sm" variant="ghost" className="text-destructive text-xs h-7" onClick={() => declineMut.mutate(m)}>
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredActive.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No active users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Declined section */}
      {declined.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            Declined
            <span className="text-muted-foreground font-normal text-sm">({declined.length})</span>
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider bg-muted/50">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">College</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {declined.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors opacity-60">
                    <td className="px-5 py-3 font-medium">{m.full_name}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{m.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[m.role] || 'bg-gray-100'}`}>{roleLabels[m.role] || m.role}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{getCollegeName(m.college_id)}</td>
                    <td className="px-5 py-3">
                      <Button size="sm" variant="ghost" className="text-emerald-600 text-xs h-7" onClick={() => approveMut.mutate(m)}>
                        Re-approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Applicant Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                {[
                  ['Name', selected.full_name],
                  ['Email', selected.email],
                  ['Phone', selected.phone || '—'],
                  ['College', getCollegeName(selected.college_id)],
                  ['Role', roleLabels[selected.role] || selected.role],
                  ...(selected.position ? [['Position', positionLabels[selected.position] || selected.position]] : []),
                  ...(selected.college_id_number ? [['College ID', selected.college_id_number]] : []),
                  ...(selected.branch ? [['Branch', selected.branch]] : []),
                  ['Applied', selected.created_at ? format(new Date(selected.created_at), 'MMM d, yyyy') : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => approveMut.mutate(selected)} disabled={approveMut.isPending}>
                  <Check className="w-4 h-4" /> Approve
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-destructive" onClick={() => declineMut.mutate(selected)} disabled={declineMut.isPending}>
                  <X className="w-4 h-4" /> Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

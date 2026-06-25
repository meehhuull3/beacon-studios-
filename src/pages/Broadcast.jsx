import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Send, AlertCircle, ShieldOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const adminAudienceLabels = {
  all: 'Everyone (All Colleges)',
  all_faculty: 'All Faculty Members',
  all_core_team: 'All Core Team Members',
  specific_college_all: 'Specific College — Everyone',
  specific_college_faculty: 'Specific College — Faculty Only',
  specific_college_core_team: 'Specific College — Core Team Only',
};

export default function Broadcast() {
  const [form, setForm] = useState({ message: '', target_audience: 'all', college_id: '', priority: 'normal' });
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: broadcasts = [] } = useQuery({ queryKey: ['broadcasts'], queryFn: () => base44.entities.Broadcast.list('-created_at') });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });

  const role = user?.role;
  const userCollegeId = user?.college_id;

  // Faculty can only broadcast to core team of their college
  const isFaculty = role === 'faculty';
  const isAdmin = role === 'admin';

  const needsCollege = isAdmin && form.target_audience?.startsWith('specific_college');

  const createMut = useMutation({
    mutationFn: async (d) => {
      const broadcast = await base44.entities.Broadcast.create({ ...d, sender_name: user?.full_name });
      // Create notification for all targeted users
      await base44.entities.Notification.create({
        type: 'broadcast',
        message: d.message,
        college_id: d.college_id || null,
        target_role: isFaculty ? 'core_team' : (d.target_audience === 'all_faculty' ? 'faculty' : d.target_audience === 'all_core_team' ? 'core_team' : 'all'),
        actor_name: user?.full_name,
        entity_id: broadcast.id,
        entity_type: 'broadcast',
      });
      return broadcast;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['broadcasts'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      if (isFaculty) {
        setForm({ message: '', target_audience: 'specific_college_core_team', college_id: userCollegeId, priority: 'normal' });
      } else {
        setForm({ message: '', target_audience: 'all', college_id: '', priority: 'normal' });
      }
      toast.success('Broadcast sent');
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    if (isFaculty) {
      // Faculty always sends to their college core team
      createMut.mutate({ message: form.message, target_audience: 'specific_college_core_team', college_id: userCollegeId, priority: form.priority });
    } else {
      if (needsCollege && !form.college_id) { toast.error('Please select a college'); return; }
      createMut.mutate(form);
    }
  };

  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '';
  const userCollegeName = colleges.find(c => c.id === userCollegeId)?.name || 'your college';

  // Non-admin, non-faculty, non-associate = no access (checked after all hooks)
  if (role && role !== 'admin' && role !== 'faculty' && role !== 'associate') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <ShieldOff className="w-14 h-14 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-heading font-semibold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">Only admins, associates, and faculty can send broadcasts.</p>
      </div>
    );
  }

  // Filter broadcasts for faculty - only their college
  const visibleBroadcasts = isFaculty
    ? broadcasts.filter(b => !b.college_id || b.college_id === userCollegeId)
    : broadcasts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Broadcast</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isFaculty ? `Send messages to Core Team at ${userCollegeName}` : 'Send messages to teams across colleges'}
        </p>
      </div>

      {/* Faculty info banner */}
      {isFaculty && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 flex items-center gap-2">
          <Megaphone className="w-4 h-4 flex-shrink-0" />
          As faculty, your broadcasts will be sent only to the Core Team at <strong className="ml-1">{userCollegeName}</strong>.
        </div>
      )}

      {/* Compose */}
      <form onSubmit={handleSend} className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
            placeholder="Type your broadcast message..."
            className="min-h-[100px]"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Admin audience selector */}
          {isAdmin && (
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={form.target_audience} onValueChange={v => setForm({...form, target_audience: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(adminAudienceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Faculty fixed audience */}
          {isFaculty && (
            <div className="space-y-2">
              <Label>Audience</Label>
              <div className="h-9 px-3 flex items-center rounded-md border border-input bg-muted text-sm text-muted-foreground">
                Core Team — {userCollegeName}
              </div>
            </div>
          )}
          {/* College selector (admin + specific_college) */}
          {isAdmin && needsCollege && (
            <div className="space-y-2">
              <Label>College</Label>
              <Select value={form.college_id} onValueChange={v => setForm({...form, college_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="gap-2" disabled={createMut.isPending}>
          <Send className="w-4 h-4" />Send Broadcast
        </Button>
      </form>

      {/* History */}
      <div>
        <h2 className="font-heading font-semibold mb-4">Broadcast History</h2>
        <div className="space-y-3">
          {visibleBroadcasts.map(b => (
            <div
              key={b.id}
              onClick={() => setSelectedBroadcast(b)}
              className={cn(
                "bg-card rounded-xl border p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200",
                b.priority === 'urgent' ? 'border-red-200 bg-red-50/30' : 'border-border'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {b.priority === 'urgent' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-xs font-medium text-primary px-2 py-0.5 bg-accent rounded-full">
                    {adminAudienceLabels[b.target_audience] || b.target_audience}
                    {b.college_id ? ` — ${getCollegeName(b.college_id)}` : ''}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {b.created_at && format(new Date(b.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{b.message}</p>
              {b.sender_name && <p className="text-[10px] text-muted-foreground mt-2">— {b.sender_name}</p>}
            </div>
          ))}
          {visibleBroadcasts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No broadcasts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBroadcast} onOpenChange={() => setSelectedBroadcast(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Broadcast Message
            </DialogTitle>
          </DialogHeader>
          {selectedBroadcast && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-primary px-2.5 py-1 bg-accent rounded-full">
                  {adminAudienceLabels[selectedBroadcast.target_audience] || selectedBroadcast.target_audience}
                  {selectedBroadcast.college_id ? ` — ${getCollegeName(selectedBroadcast.college_id)}` : ''}
                </span>
                {selectedBroadcast.priority === 'urgent' && (
                  <span className="text-xs font-medium text-red-600 px-2.5 py-1 bg-red-50 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />Urgent
                  </span>
                )}
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedBroadcast.message}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                <span>Sent by <strong className="text-foreground">{selectedBroadcast.sender_name || 'Unknown'}</strong></span>
                <span>{selectedBroadcast.created_at && format(new Date(selectedBroadcast.created_at), 'MMMM d, yyyy — h:mm a')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

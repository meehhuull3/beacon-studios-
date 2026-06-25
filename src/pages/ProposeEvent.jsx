import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const typeOptions = [
  { value: 'event', label: 'Event' },
  { value: 'cohort', label: 'Cohort' },
  { value: 'talk', label: 'Talk' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Something Else' },
];

export default function ProposeEvent({ open, onClose }) {
  const [form, setForm] = useState({ title: '', type: 'event', custom_type: '', description: '', date: '', time: '', venue: '', mentor_name: '', expected_attendees: '' });
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list() });

  const myMember = teamMembers.find(m => m.user_id === user?.id);

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Proposal.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal sent to Associate for review');
      setForm({ title: '', type: 'event', custom_type: '', description: '', date: '', time: '', venue: '', mentor_name: '', expected_attendees: '' });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMut.mutate({
      title: form.title,
      type: form.type,
      custom_type: form.type === 'other' ? form.custom_type : '',
      description: form.description,
      date: form.date,
      time: form.time,
      venue: form.venue,
      mentor_name: form.mentor_name,
      expected_attendees: form.expected_attendees ? Number(form.expected_attendees) : null,
      college_id: user?.college_id,
      proposer_id: myMember?.id || '',
      proposer_name: user?.full_name || '',
      proposer_role: user?.role || '',
      proposer_email: user?.email || '',
      status: 'pending',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Propose a Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Name of the event or program" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.type === 'other' && (
              <div className="space-y-2">
                <Label>Specify Type *</Label>
                <Input value={form.custom_type} onChange={e => setForm({...form, custom_type: e.target.value})} required placeholder="What type is it?" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proposed Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input value={form.time} onChange={e => setForm({...form, time: e.target.value})} placeholder="e.g. 3:00 PM" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Mentor / Speaker</Label>
              <Input value={form.mentor_name} onChange={e => setForm({...form, mentor_name: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Expected Attendees</Label>
            <Input type="number" value={form.expected_attendees} onChange={e => setForm({...form, expected_attendees: e.target.value})} placeholder="Approx. number" />
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              required
              rows={4}
              placeholder="Describe the event in detail — objective, agenda, expected outcomes, why it's important..."
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={createMut.isPending}>
            <Send className="w-4 h-4" /> Send Proposal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

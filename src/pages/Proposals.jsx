import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ClipboardList, Check, X, Building2, User, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = { event: '🎤', podcast: '🎙️', talk: '💬', cohort: '👥', workshop: '🛠️', other: '📋' };

const statusConfig = {
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
  declined: { label: 'Declined', className: 'bg-red-100 text-red-700' },
};

export default function Proposals() {
  const [selected, setSelected] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: proposals = [] } = useQuery({ queryKey: ['proposals'], queryFn: () => base44.entities.Proposal.list('-created_at') });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });

  const role = user?.role;
  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '—';

  const reviewMut = useMutation({
    mutationFn: async ({ id, status }) => {
      const proposal = proposals.find(p => p.id === id);
      await base44.entities.Proposal.update(id, {
        status,
        response_message: responseMsg,
        reviewed_by: user?.full_name,
      });

      if (proposal) {
        if (status === 'approved') {
          // Auto-create event from proposal
          await base44.entities.Event.create({
            title: proposal.title,
            type: proposal.type === 'other' ? 'event' : (proposal.type || 'event'),
            college_id: proposal.college_id,
            date: proposal.date || '',
            time: proposal.time || '',
            venue: proposal.venue || '',
            mentor_name: proposal.mentor_name || '',
            description: proposal.description || '',
            status: 'upcoming',
            added_by: proposal.proposer_name,
          });
          // Notify college
          await base44.entities.Notification.create({
            type: 'event_added',
            message: `Proposal "${proposal.title}" was approved and added as a new event!`,
            college_id: proposal.college_id,
            target_role: 'all',
            actor_name: user?.full_name || 'Associate',
            actor_role: role,
            entity_id: id,
            entity_type: 'proposal',
          });
        } else {
          // Notify decline
          await base44.entities.Notification.create({
            type: 'broadcast',
            message: `Your proposal "${proposal.title}" was declined${responseMsg ? `: "${responseMsg}"` : '.'}`,
            college_id: proposal.college_id,
            target_role: 'all',
            actor_name: user?.full_name || 'Associate',
            actor_role: role,
            entity_id: id,
            entity_type: 'proposal',
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Proposal reviewed');
      setSelected(null);
      setResponseMsg('');
    },
  });

  const pending = proposals.filter(p => p.status === 'pending');
  const reviewed = proposals.filter(p => p.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold">Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review event and program proposals — approving auto-creates a new event</p>
      </div>

      {/* Pending */}
      <section>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          Awaiting Review
          <span className="text-muted-foreground font-normal text-sm">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No pending proposals</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pending.map(p => (
              <ProposalCard key={p.id} proposal={p} getCollegeName={getCollegeName} onClick={() => { setSelected(p); setResponseMsg(''); }} />
            ))}
          </div>
        )}
      </section>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            Past Decisions
            <span className="text-muted-foreground font-normal text-sm">({reviewed.length})</span>
          </h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reviewed.map(p => (
              <ProposalCard key={p.id} proposal={p} getCollegeName={getCollegeName} onClick={() => { setSelected(p); setResponseMsg(p.response_message || ''); }} />
            ))}
          </div>
        </section>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) { setSelected(null); setResponseMsg(''); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="text-lg">{typeIcons[selected?.type] || '📋'}</span>
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selected.status]?.className}`}>
                {statusConfig[selected.status]?.label}
              </div>

              <div className="bg-muted/40 rounded-lg p-4 space-y-2.5 text-sm">
                <Row label="Proposer" value={selected.proposer_name} />
                <Row label="Role" value={selected.proposer_role} />
                <Row label="Email" value={selected.proposer_email} />
                <Row label="College" value={getCollegeName(selected.college_id)} />
                <Row label="Type" value={selected.custom_type || selected.type} />
                {selected.date && <Row label="Date" value={format(new Date(selected.date), 'MMM d, yyyy')} />}
                {selected.time && <Row label="Time" value={selected.time} />}
                {selected.venue && <Row label="Venue" value={selected.venue} />}
                {selected.mentor_name && <Row label="Mentor/Speaker" value={selected.mentor_name} />}
                {selected.expected_attendees && <Row label="Expected Attendees" value={selected.expected_attendees} />}
              </div>

              {selected.description && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Description</p>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{selected.description}</p>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider block">
                  {selected.status === 'pending' ? 'Message to Proposer (optional)' : 'Response Sent'}
                </label>
                <Textarea
                  value={responseMsg}
                  onChange={e => setResponseMsg(e.target.value)}
                  placeholder="Add a note explaining your decision..."
                  className="text-sm"
                  rows={3}
                  disabled={selected.status !== 'pending'}
                />
              </div>

              {(role === 'admin' || role === 'associate') && (
                selected.status === 'pending' ? (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                    onClick={() => reviewMut.mutate({ id: selected.id, status: 'approved' })}
                    disabled={reviewMut.isPending}
                  >
                    <Check className="w-4 h-4" /> Approve & Create Event
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive gap-2"
                    onClick={() => reviewMut.mutate({ id: selected.id, status: 'declined' })}
                    disabled={reviewMut.isPending}
                  >
                    <X className="w-4 h-4" /> Decline
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  {selected.status === 'declined' && (
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => reviewMut.mutate({ id: selected.id, status: 'approved' })} disabled={reviewMut.isPending}>
                      <Check className="w-4 h-4" /> Re-approve & Create Event
                    </Button>
                  )}
                  {selected.status === 'approved' && (
                    <Button variant="outline" className="flex-1 text-destructive gap-2" onClick={() => reviewMut.mutate({ id: selected.id, status: 'declined' })} disabled={reviewMut.isPending}>
                      <X className="w-4 h-4" /> Decline
                    </Button>
                  )}
                </div>
              )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-sm text-right capitalize">{value || '—'}</span>
    </div>
  );
}

function ProposalCard({ proposal, getCollegeName, onClick }) {
  const sc = statusConfig[proposal.status] || statusConfig.pending;
  return (
    <div onClick={onClick} className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeIcons[proposal.type] || '📋'}</span>
          <div>
            <h3 className="font-heading font-semibold text-sm">{proposal.title}</h3>
            <p className="text-xs text-muted-foreground capitalize">{proposal.custom_type || proposal.type}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sc.className}`}>{sc.label}</span>
      </div>
      <div className="text-xs text-muted-foreground space-y-1 mb-3">
        <p className="flex items-center gap-1.5"><User className="w-3 h-3" />{proposal.proposer_name} ({proposal.proposer_role})</p>
        <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />{getCollegeName(proposal.college_id)}</p>
        {proposal.date && <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{format(new Date(proposal.date), 'MMM d, yyyy')}</p>}
      </div>
      <div className="flex items-center justify-end text-xs text-primary font-medium group-hover:gap-1.5 gap-1 transition-all">
        View Details <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

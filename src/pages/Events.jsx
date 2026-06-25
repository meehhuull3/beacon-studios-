import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, MapPin, User, Clock, Trash2, Pencil, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ProposeEvent from './ProposeEvent';

const proposalStatusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
};

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  live: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const typeIcons = { event: '🎤', podcast: '🎙️', talk: '💬', cohort: '👥', workshop: '🛠️' };

export default function Events() {
  const [open, setOpen] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [filterCollege, setFilterCollege] = useState('all');
  const [form, setForm] = useState({ title: '', type: 'event', college_id: '', date: '', time: '', venue: '', mentor_name: '', description: '', status: 'upcoming' });
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list('-date') });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });
  const { data: proposals = [] } = useQuery({ queryKey: ['proposals'], queryFn: () => base44.entities.Proposal.list('-created_at') });

  const role = user?.role || 'core_team';
  const userCollegeId = user?.college_id;
  const canManage = role === 'admin' || role === 'associate';
  const canPropose = role === 'faculty' || role === 'core_team';

  // Proposals visible to faculty/core_team: only their college
  const myProposals = canPropose
    ? proposals.filter(p => p.college_id === userCollegeId)
    : [];

  const visibleEvents = ((canManage || !userCollegeId) ? events : events.filter(e => e.college_id === userCollegeId))
    .filter(e => canManage ? (filterCollege === 'all' || e.college_id === filterCollege) : true);

  const createNotif = async (type, message, entityId, collegeId) => {
    try {
      await base44.entities.Notification.create({
        type, message, college_id: collegeId,
        target_role: 'all', actor_name: user?.full_name || 'Someone',
        actor_role: role, entity_id: entityId, entity_type: 'event'
      });
    } catch {}
  };

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Event.create(d),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['events'] }); setOpen(false); resetForm(); toast.success('Event created');
      createNotif('event_added', `${user?.full_name || 'Someone'} added "${form.title}"`, result.id, form.college_id);
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] }); setOpen(false); setEditing(null); resetForm(); toast.success('Event updated');
      createNotif('event_updated', `${user?.full_name || 'Someone'} updated "${form.title}"`, editing?.id, editing?.college_id);
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: (_result, deletedId) => {
      qc.invalidateQueries({ queryKey: ['events'] }); toast.success('Event removed');
      const ev = events.find(x => x.id === deletedId);
      if (ev) createNotif('event_removed', `${user?.full_name || 'Someone'} removed "${ev.title}"`, deletedId, ev.college_id);
    },
  });

  const resetForm = () => setForm({ title: '', type: 'event', college_id: '', date: '', time: '', venue: '', mentor_name: '', description: '', status: 'upcoming' });

  const handleEdit = (ev) => {
    setEditing(ev);
    setForm({ title: ev.title, type: ev.type || 'event', college_id: ev.college_id, date: ev.date || '', time: ev.time || '', venue: ev.venue || '', mentor_name: ev.mentor_name || '', description: ev.description || '', status: ev.status || 'upcoming' });
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = !canManage ? { ...form, college_id: userCollegeId } : form;
    if (editing) updateMut.mutate({ id: editing.id, data });
    else createMut.mutate(data);
  };

  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Events & Programs</h1>
          <p className="text-sm text-muted-foreground mt-1">Events, podcasts, talks, cohorts & workshops</p>
        </div>
        <div className="flex gap-2">
          {canPropose && (
            <Button variant="outline" className="gap-2" onClick={() => setProposeOpen(true)}>
              <Send className="w-4 h-4" />Propose
            </Button>
          )}
          {canManage && (
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); } }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Create'} Event</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="podcast">Podcast</SelectItem>
                          <SelectItem value="talk">Talk</SelectItem>
                          <SelectItem value="cohort">Cohort</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>College *</Label>
                      <Select value={form.college_id} onValueChange={v => setForm({...form, college_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Time</Label><Input value={form.time} onChange={e => setForm({...form, time: e.target.value})} placeholder="e.g. 3:00 PM" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Venue</Label><Input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Mentor/Speaker</Label><Input value={form.mentor_name} onChange={e => setForm({...form, mentor_name: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                  <Button type="submit" className="w-full">{editing ? 'Update' : 'Create'} Event</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      {canManage && (
        <div className="flex flex-wrap gap-3">
          <Select value={filterCollege} onValueChange={setFilterCollege}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by college" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleEvents.map(ev => (
          <div
            key={ev.id}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
            onClick={() => setDetailEvent(ev)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{typeIcons[ev.type] || '🎤'}</span>
                <div>
                  <h3 className="font-heading font-semibold text-sm">{ev.title}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{ev.type}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[ev.status] || statusColors.upcoming}`}>
                {ev.status}
              </span>
            </div>
            <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{ev.date ? format(new Date(ev.date), 'MMM d, yyyy') : '—'}</p>
              {ev.time && <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{ev.time}</p>}
              {ev.venue && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{ev.venue}</p>}
              {ev.mentor_name && <p className="flex items-center gap-1.5"><User className="w-3 h-3" />{ev.mentor_name}</p>}
              <p className="text-muted-foreground/70">{getCollegeName(ev.college_id)}</p>
            </div>
            {canManage && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => handleEdit(ev)}><Pencil className="w-3 h-3" />Edit</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteMut.mutate(ev.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleEvents.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No events yet</p>
          {canPropose && <p className="text-xs mt-1">Use "Propose" to submit a new program for approval</p>}
        </div>
      )}

      {/* My Proposals — for faculty & core team */}
      {canPropose && myProposals.length > 0 && (
        <div>
          <h2 className="text-base font-heading font-semibold mb-3">My Proposals</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myProposals.map(p => (
              p.status === 'declined' ? (
                <div key={p.id} className="bg-card rounded-xl border border-red-200 bg-red-50/10 p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm text-red-950">{p.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">Declined</span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground border-t border-dashed border-red-200 pt-2">
                    <span className="font-medium text-red-700 block mb-0.5">Admin or Associate Review Note:</span>
                    <span className="italic">"{p.response_message || 'This proposal was declined by an admin or associate.'}"</span>
                  </div>
                </div>
              ) : (
                <div key={p.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{typeIcons[p.type] || '📋'}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{p.title}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{p.custom_type || p.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${proposalStatusColors[p.status] || proposalStatusColors.pending}`}>
                      {p.status === 'pending' ? 'Pending' : p.status === 'approved' ? 'Approved ✓' : 'Declined'}
                    </span>
                  </div>
                  {p.date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3 h-3" />{format(new Date(p.date), 'MMM d, yyyy')}
                    </p>
                  )}
                  {p.response_message && (
                    <p className="text-xs text-muted-foreground mt-2 italic border-t border-border pt-2">
                      "{p.response_message}"
                    </p>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Propose Dialog */}
      <ProposeEvent open={proposeOpen} onClose={() => setProposeOpen(false)} />

      {/* Event Detail Dialog */}
      <Dialog open={!!detailEvent} onOpenChange={(v) => { if (!v) setDetailEvent(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{typeIcons[detailEvent?.type] || '🎤'}</span>
              {detailEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {detailEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[detailEvent.status] || statusColors.upcoming}`}>
                  {detailEvent.status}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{detailEvent.type}</span>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 space-y-2.5 text-sm">
                {[
                  ['College', getCollegeName(detailEvent.college_id)],
                  ['Date', detailEvent.date ? format(new Date(detailEvent.date), 'MMMM d, yyyy') : null],
                  ['Time', detailEvent.time],
                  ['Venue', detailEvent.venue],
                  ['Mentor / Speaker', detailEvent.mentor_name],
                  ['Attendees', detailEvent.attendees_count > 0 ? detailEvent.attendees_count : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <span className="font-medium text-sm text-right">{value}</span>
                  </div>
                ))}
              </div>
              {detailEvent.description && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Description</p>
                  <p className="text-sm leading-relaxed text-foreground">{detailEvent.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

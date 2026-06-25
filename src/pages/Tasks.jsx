import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ListTodo, CheckCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  in_progress: { label: 'In Progress', icon: ListTodo, color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  overdue: { label: 'Overdue', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
};

export default function Tasks() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', college_id: '', assigned_to_id: '', assigned_to_name: '', assigned_to_role: '', due_date: '', priority: 'medium' });
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list('-created_at') });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list() });

  const role = user?.role || 'core_team';
  const canAssign = role === 'admin' || role === 'faculty';

  // Visibility: admin sees all, faculty sees their college, core_team sees assigned to them
  const userCollegeId = user?.college_id;
  const visibleTasks = (role === 'admin' || !userCollegeId) ? tasks
    : role === 'faculty' ? tasks.filter(t => t.college_id === userCollegeId)
    : tasks.filter(t => t.assigned_to_id === user?.id || t.college_id === userCollegeId);

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Task.create({ ...d, assigned_by_role: role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setOpen(false); resetForm(); toast.success('Task assigned'); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task updated'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task removed'); },
  });

  const resetForm = () => setForm({ title: '', description: '', college_id: '', assigned_to_id: '', assigned_to_name: '', assigned_to_role: '', due_date: '', priority: 'medium' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const member = teamMembers.find(m => m.id === form.assigned_to_id);
    createMut.mutate({ ...form, assigned_to_name: member?.full_name || '', assigned_to_role: member?.role || '' });
  };

  const filteredMembers = form.college_id ? teamMembers.filter(m => m.college_id === form.college_id) : teamMembers;
  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '—';

  const priorityDot = { low: 'bg-gray-400', medium: 'bg-amber-400', high: 'bg-red-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{canAssign ? 'Task Management' : 'My Tasks'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{visibleTasks.length} tasks</p>
        </div>
        {canAssign && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Assign Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign New Task</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>College</Label>
                    <Select value={form.college_id} onValueChange={v => setForm({...form, college_id: v, assigned_to_id: ''})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select value={form.assigned_to_id} onValueChange={v => setForm({...form, assigned_to_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>
                        {filteredMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.full_name} ({m.role})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Assign Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {visibleTasks.map(t => {
          const st = statusConfig[t.status] || statusConfig.pending;
          const StIcon = st.icon;
          return (
            <div key={t.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200 flex items-start gap-4">
              <button
                onClick={() => {
                  const next = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : t.status;
                  if (next !== t.status) updateMut.mutate({ id: t.id, data: { status: next } });
                }}
                className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", st.color)}
              >
                <StIcon className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn("font-medium text-sm", t.status === 'completed' && "line-through text-muted-foreground")}>{t.title}</h4>
                  <div className={cn("w-2 h-2 rounded-full", priorityDot[t.priority])} />
                </div>
                {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  {t.assigned_to_name && <span>→ {t.assigned_to_name}</span>}
                  <span>{getCollegeName(t.college_id)}</span>
                  {t.due_date && <span>Due: {format(new Date(t.due_date), 'MMM d')}</span>}
                </div>
              </div>
              {canAssign && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMut.mutate(t.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {visibleTasks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tasks yet</p>
        </div>
      )}
    </div>
  );
}

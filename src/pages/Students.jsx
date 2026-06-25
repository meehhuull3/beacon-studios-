import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GraduationCap, Search, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Students() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCollege, setFilterCollege] = useState('all');
  const [form, setForm] = useState({ name: '', email: '', phone: '', branch: '' });
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list('-created_at') });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list() });

  const role = user?.role;
  const userCollegeId = user?.college_id;
  const canEdit = role === 'faculty' || role === 'core_team';
  const canViewAll = role === 'admin' || role === 'associate';

  const myMember = teamMembers.find(m => m.user_id === user?.id);

  const visibleStudents = students
    .filter(s => canViewAll ? true : s.college_id === userCollegeId)
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()) || s.branch?.toLowerCase().includes(search.toLowerCase()))
    .filter(s => filterCollege === 'all' || s.college_id === filterCollege);

  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '—';

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Student.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setOpen(false);
      setForm({ name: '', email: '', phone: '', branch: '' });
      toast.success('Student added');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student removed'); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMut.mutate({
      ...form,
      college_id: userCollegeId,
      enrolled_by_id: myMember?.id || '',
      enrolled_by_name: user?.full_name || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Program Students</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {visibleStudents.length} student{visibleStudents.length !== 1 ? 's' : ''} enrolled{canViewAll ? ' across all colleges' : ' in your college'}
          </p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 mr-12 md:mr-20"><Plus className="w-4 h-4" />Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="space-y-2"><Label>Branch / Stream</Label><Input value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} placeholder="e.g. CSE, ECE, MBA" /></div>
                <Button type="submit" className="w-full" disabled={createMut.isPending}>Add Student</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {canViewAll && (
          <Select value={filterCollege} onValueChange={setFilterCollege}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Colleges" /></SelectTrigger>
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
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Branch</th>
                {canViewAll && <th className="px-5 py-3 font-medium">College</th>}
                <th className="px-5 py-3 font-medium">Added By</th>
                {canEdit && <th className="px-5 py-3 font-medium"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleStudents.map(s => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{s.email || '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{s.phone || '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{s.branch || '—'}</td>
                  {canViewAll && <td className="px-5 py-3 text-muted-foreground text-xs">{getCollegeName(s.college_id)}</td>}
                  <td className="px-5 py-3 text-muted-foreground text-xs">{s.enrolled_by_name || '—'}</td>
                  {canEdit && (
                    <td className="px-5 py-3">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(s.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleStudents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No students added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

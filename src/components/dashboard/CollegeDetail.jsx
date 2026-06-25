import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, Users, Rocket, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function CollegeDetail({ college, startups, events, teamMembers, open, onClose }) {
  if (!college) return null;

  const collegeStartups = startups.filter(s => s.college_id === college.id);
  const collegeEvents = events.filter(e => e.college_id === college.id);
  const faculty = teamMembers.filter(m => m.college_id === college.id && m.role === 'faculty' && m.status === 'active');
  const coreTeam = teamMembers.filter(m => m.college_id === college.id && m.role === 'core_team' && m.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            {college.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* College Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{college.total_students_enrolled || 0}</p>
              <p className="text-xs text-muted-foreground">Students Enrolled</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{collegeStartups.length}</p>
              <p className="text-xs text-muted-foreground">Startups</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{collegeEvents.length}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{faculty.length}</p>
              <p className="text-xs text-muted-foreground">Faculty</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{coreTeam.length}</p>
              <p className="text-xs text-muted-foreground">Core Team</p>
            </div>
          </div>

          {college.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> {college.location}
            </div>
          )}

          {/* Faculty */}
          {faculty.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> Faculty ({faculty.length})
              </h3>
              <div className="space-y-2">
                {faculty.map(f => (
                  <div key={f.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{f.full_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {f.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{f.email}</span>}
                        {f.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{f.phone}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Team */}
          {coreTeam.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" /> Core Team ({coreTeam.length})
              </h3>
              <div className="space-y-2">
                {coreTeam.map(m => (
                  <div key={m.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{m.full_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {m.college_id_number && <span>ID: {m.college_id_number}</span>}
                        {m.branch && <span>Branch: {m.branch}</span>}
                        {m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Startups */}
          {collegeStartups.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-purple-500" /> Startups ({collegeStartups.length})
              </h3>
              <div className="space-y-2">
                {collegeStartups.slice(0, 10).map(s => (
                  <div key={s.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.domain || '—'} · Stage: {s.stage}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{s.phase}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {collegeEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Events ({collegeEvents.length})
              </h3>
              <div className="space-y-2">
                {collegeEvents.slice(0, 10).map(ev => (
                  <div key={ev.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ev.date && format(new Date(ev.date), 'MMM d, yyyy')} · {ev.venue || '—'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{ev.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

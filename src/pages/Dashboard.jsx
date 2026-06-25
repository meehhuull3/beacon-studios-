import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Building2, Rocket, Calendar, GraduationCap } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import StartupPipeline from '@/components/dashboard/StartupPipeline';
import CollegeDetail from '@/components/dashboard/CollegeDetail';

export default function Dashboard() {
  const [selectedCollege, setSelectedCollege] = useState(null);
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });
  const { data: startups = [] } = useQuery({ queryKey: ['startups'], queryFn: () => base44.entities.Startup.list('-created_at') });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list('-created_at') });
  const { data: teamMembers = [] } = useQuery({ queryKey: ['team'], queryFn: () => base44.entities.TeamMember.list() });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });

  const role = user?.role || 'core_team';
  const activeColleges = colleges.filter(c => c.status === 'active');
  const liveEvents = events.filter(e => e.status === 'live' || e.status === 'upcoming');
  const activeStartups = startups.filter(s => s.status === 'active');

  // Filter data for non-admin roles — only filter when user has a college_id
  const userCollegeId = user?.college_id;
  const isGlobal = role === 'admin' || role === 'associate';
  const filteredStartups = (isGlobal || !userCollegeId) ? startups : startups.filter(s => s.college_id === userCollegeId);
  const filteredEvents = (isGlobal || !userCollegeId) ? events : events.filter(e => e.college_id === userCollegeId);
  const filteredStudents = (isGlobal || !userCollegeId) ? students : students.filter(s => s.college_id === userCollegeId);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  const userCollege = colleges.find(c => c.id === userCollegeId);
  const collegeName = userCollege?.name;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        {(role === 'faculty' || role === 'core_team') && collegeName && (
          <div className="text-sm text-[#00ADB5] font-semibold tracking-wider uppercase mb-2">
            {collegeName}
          </div>
        )}
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {greeting()}, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's happening across {(role === 'admin' || role === 'associate') ? 'all programs' : 'your college'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(role === 'admin' || role === 'associate') && (
          <div onClick={() => navigate('/colleges')} className="cursor-pointer">
            <StatCard title="Active Colleges" value={activeColleges.length} icon={Building2} color="blue" />
          </div>
        )}
        <div onClick={() => navigate('/startups')} className="cursor-pointer">
          <StatCard title="Active Startups" value={activeStartups.length} icon={Rocket} color="purple" />
        </div>
        <div onClick={() => navigate('/events')} className="cursor-pointer">
          <StatCard title="Live Events" value={liveEvents.length} icon={Calendar} color="orange" />
        </div>
        <div onClick={() => navigate('/students')} className="cursor-pointer">
          <StatCard title="Students Enrolled" value={filteredStudents.length} icon={GraduationCap} color="green" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <StartupPipeline startups={filteredStartups} colleges={colleges} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity events={filteredEvents} startups={filteredStartups} tasks={[]} />
        </div>
      </div>

      {/* College Quick Access (Admin/Associate) */}
      {(role === 'admin' || role === 'associate') && (
        <div>
          <h2 className="text-lg font-heading font-semibold mb-4">Colleges</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeColleges.map(college => (
              <div
                key={college.id}
                onClick={() => setSelectedCollege(college)}
                className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm">{college.name}</h3>
                    <p className="text-xs text-muted-foreground">{college.location || '—'}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{startups.filter(s => s.college_id === college.id).length} startups</span>
                  <span>{teamMembers.filter(m => m.college_id === college.id && m.status === 'active').length} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CollegeDetail
        college={selectedCollege}
        startups={startups}
        events={events}
        teamMembers={teamMembers}
        open={!!selectedCollege}
        onClose={() => setSelectedCollege(null)}
      />
    </div>
  );
}

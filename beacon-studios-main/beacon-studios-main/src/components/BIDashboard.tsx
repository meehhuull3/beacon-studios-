import React, { useState, useEffect } from 'react';
import { Building, Users, Rocket, Calendar, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { College, Cohort, Startup, Event, Task } from '../types';

interface BIDashboardProps {
  onNavigate: (pageId: string) => void;
  refetchCounter: number;
}

export default function BIDashboard({ onNavigate, refetchCounter }: BIDashboardProps) {
  const [stats, setStats] = useState({
    colleges: 0,
    cohorts: 0,
    startups: 0,
    tasks: 0,
    overdueTasks: 0
  });

  const [cohortList, setCohortList] = useState<any[]>([]);
  const [spotlightStartups, setSpotlightStartups] = useState<Startup[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);

  const loadDashboardData = async () => {
    const colleges = await dbService.getColleges();
    const cohorts = await dbService.getCohorts();
    const startups = await dbService.getStartups();
    const tasks = await dbService.getTasks();
    const events = await dbService.getEvents();

    const openTasks = tasks.filter(t => !t.done);
    const overdueTasks = openTasks.filter(t => new Date(t.due_date) < new Date() && !t.done);

    setStats({
      colleges: colleges.length,
      cohorts: cohorts.filter(c => c.status !== 'Completed').length,
      startups: startups.length,
      tasks: openTasks.length,
      overdueTasks: overdueTasks.length
    });

    // Match cohorts with college info for table
    const tableCohorts = cohorts.slice(0, 5).map(coh => {
      const col = colleges.find(c => c.id === coh.college_id);
      return {
        ...coh,
        college_name: col?.name || 'Partner college',
        location: col ? `${col.city}, ${col.state}` : 'India'
      };
    });
    setCohortList(tableCohorts);

    setSpotlightStartups(startups.slice(0, 4));
    setUpcomingEvents(events.filter(e => !e.is_past).slice(0, 3));
    setMyTasks(tasks.slice(0, 5));
  };

  useEffect(() => {
    loadDashboardData();
  }, [refetchCounter]);

  const toggleTask = async (id: string, done: boolean) => {
    await dbService.toggleTaskDone(id, done);
    loadDashboardData();
  };

  return (
    <div className="flex flex-col gap-5 text-[#1B2240]">
      {/* STATS ROW */}
      {/* Mobile Consolidated Single-Box Widget */}
      <div className="block sm:hidden bg-white border border-[#E2E5EC] rounded-xl shadow-xs divide-y divide-[#F4F5F7] overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-[#F4F5F7]">
          {/* Colleges */}
          <div 
            onClick={() => onNavigate('colleges')}
            className="p-3 text-left active:bg-[#F4F5F7]/40 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#2DC5A2]">
              <Building className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">Colleges</span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1B2240] leading-none mb-0.5">{stats.colleges}</div>
            <div className="text-[10px] text-[#2DC5A2] font-semibold">📈 +2 qtr</div>
          </div>
          {/* Cohorts */}
          <div 
            onClick={() => onNavigate('cohorts')}
            className="p-3 text-left active:bg-[#F4F5F7]/40 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#3b82f6]">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">Cohorts</span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1B2240] leading-none mb-0.5">{stats.cohorts}</div>
            <div className="text-[10px] text-[#8891B0] truncate">124 founders</div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#F4F5F7]">
          {/* Startups */}
          <div 
            onClick={() => onNavigate('startups')}
            className="p-3 text-left active:bg-[#F4F5F7]/40 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#8b5cf6]">
              <Rocket className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">Startups</span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1B2240] leading-none mb-0.5">{stats.startups}</div>
            <div className="text-[10px] text-[#2DC5A2] font-bold">🚀 12 updated</div>
          </div>
          {/* Tasks */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="p-3 text-left active:bg-[#F4F5F7]/40 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#f5a623]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">Actions</span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1B2240] leading-none mb-0.5">{stats.tasks}</div>
            <div className="text-[10px] text-[#E8524A] font-semibold truncate">⚠️ {stats.overdueTasks} overdue</div>
          </div>
        </div>
      </div>

      {/* Desktop Grid Layout (unchanged for larger viewports) */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('colleges')}
          className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-b-[3px] border-b-[#2DC5A2]"
        >
          <div className="w-9 h-9 rounded-lg bg-[#2DC5A2]/10 text-[#2DC5A2] flex items-center justify-center text-lg mb-3">
            <Building className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">Active Colleges</div>
          <div className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[#1B2240] leading-none my-1">{stats.colleges}</div>
          <div className="text-[11px] text-[#2DC5A2] font-semibold flex items-center gap-1 mt-1">
            <span>📈 +2 this quarter</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('cohorts')}
          className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-b-[3px] border-b-[#3B82F6]"
        >
          <div className="w-9 h-9 rounded-lg bg-[rgba(59,130,246,0.1)] text-[#3b82f6] flex items-center justify-center text-lg mb-3">
            <Users className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">Live Cohorts</div>
          <div className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[#1B2240] leading-none my-1">{stats.cohorts}</div>
          <div className="text-[11.5px] text-[#8891B0] mt-1 text-left">
            Total 124 founders enrolled
          </div>
        </div>

        <div 
          onClick={() => onNavigate('startups')}
          className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-b-[3px] border-b-[#8B5CF6]"
        >
          <div className="w-9 h-9 rounded-lg bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] flex items-center justify-center text-lg mb-3">
            <Rocket className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">Startups Tracked</div>
          <div className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[#1B2240] leading-none my-1">{stats.startups}</div>
          <div className="text-[11px] text-[#2DC5A2] font-semibold flex items-center gap-1 mt-1">
            <span>🚀 12 updated recently</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-b-[3px] border-b-[#F5A623]"
        >
          <div className="w-9 h-9 rounded-lg bg-[rgba(245,166,35,0.1)] text-[#f5a623] flex items-center justify-center text-lg mb-3">
            <CheckCircle2 className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">Pending Actions</div>
          <div className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[#1B2240] leading-none my-1">{stats.tasks}</div>
          <div className="text-[11px] text-[#E8524A] font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{stats.overdueTasks} milestones overdue</span>
          </div>
        </div>

      </div>

      {/* MID SECTION - TWO COLUMNS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Cohort list card */}
        <div className="xl:col-span-8 bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm flex flex-col">
          <div className="px-[18px] py-[13px] border-b border-[#E2E5EC] flex items-center justify-between">
            <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Active College Cohorts</span>
            <button 
              onClick={() => onNavigate('cohorts')}
              className="text-[11.5px] text-[#2DC5A2] font-semibold flex items-center hover:underline cursor-pointer"
            >
              View all cohorts <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E5EC] text-[#8891B0]">
                  <th className="text-[10.5px] font-bold uppercase tracking-wider p-4 pl-6">College</th>
                  <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Stage</th>
                  <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Progress</th>
                  <th className="text-[10.5px] font-bold uppercase tracking-wider p-4">Total Weeks</th>
                  <th className="text-[10.5px] font-bold uppercase tracking-wider p-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F5F7]">
                {cohortList.map(coh => (
                  <tr 
                    key={coh.id} 
                    onClick={() => onNavigate('cohorts')}
                    className="hover:bg-[#F4F5F7] transition-all cursor-pointer text-sm"
                  >
                    <td className="p-4 pl-6 text-left">
                      <div className="font-semibold text-xs text-[#1B2240]">{coh.college_name}</div>
                      <div className="text-[10.5px] text-[#8891B0] mt-0.5">{coh.location}</div>
                    </td>
                    <td className="p-4 text-left">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        coh.stage === 'Prototype' ? 'bg-[#2DC5A2]/10 text-[#1a8f74]' :
                        coh.stage === 'Validation' ? 'bg-[#F5A623]/10 text-[#b45309]' : 'bg-[#3B82F6]/10 text-[#1d4ed8]'
                      }`}>
                        {coh.stage}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-[90px] h-1.5 bg-[#F4F5F7] rounded-full overflow-hidden shrink-0">
                          <div className="bg-[#2DC5A2] h-full rounded-full" style={{ width: `${coh.progress_pct}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-[#4A5270]">{coh.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-left font-semibold text-xs text-[#4A5270]">
                      Week {coh.current_week} / {coh.total_weeks}
                    </td>
                    <td className="p-4 pr-6 text-left">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        coh.status === 'On track' ? 'bg-[#2DC5A2]/10 text-[#1a8f74]' :
                        coh.status === 'Needs check' ? 'bg-[#E8524A]/10 text-[#E8524A]' : 'bg-[#3B82F6]/10 text-[#1d4ed8]'
                      }`}>
                        {coh.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Feed Log */}
        <div className="xl:col-span-4 bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm flex flex-col">
          <div className="px-[18px] py-[13px] border-b border-[#E2E5EC] flex items-center justify-between">
            <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Live Activities</span>
            <span className="text-[10px] text-[#2DC5A2] font-semibold bg-[#2DC5A2]/10 px-2 py-0.5 rounded-full uppercase">Realtime feed</span>
          </div>

          <div className="p-4 flex flex-col gap-4 text-left">
            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-7 h-7 rounded-full bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-bold shrink-0">PM</div>
              <div>
                <span className="font-semibold text-[#1B2240]">Dr. Priya M.</span> uploaded milestone <span className="font-semibold">AgriSense</span> reaching INR 2L+ pilot Revenue
                <div className="text-[10px] text-[#8891B0] mt-1">2 hours ago · VJTI Mumbai</div>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-7 h-7 rounded-full bg-[rgba(245,166,35,0.15)] text-[#b45309] flex items-center justify-center font-bold shrink-0">RK</div>
              <div>
                <span className="font-semibold text-[#1B2240]">Rahul K.</span> finalized Demo Day on June 14 with 38 RSVPs locked
                <div className="text-[10px] text-[#8891B0] mt-1">4 hours ago · MIT Manipal</div>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-7 h-7 rounded-full bg-[rgba(139,92,246,0.15)] text-[#7c3aed] flex items-center justify-center font-bold shrink-0">SN</div>
              <div>
                <span className="font-semibold text-[#1B2240]">Sneha Nair</span> enrolled 4 new student founders into the summer cohort
                <div className="text-[10px] text-[#8891B0] mt-1">Yesterday · RVCE Bangalore</div>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-7 h-7 rounded-full bg-[rgba(59,130,246,0.15)] text-[#1d4ed8] flex items-center justify-center font-bold shrink-0">DR</div>
              <div>
                <span className="font-semibold text-[#1B2240]">Dr. Rathi (SRM)</span> endorsed MediRoute for legal compliance stage
                <div className="text-[10px] text-[#8891B0] mt-1">2 days ago · Documents Vault</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* LOWER SECTION - SPOTLIGHT, EVENTS & ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* Startup spotlight card */}
        <div className="bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm flex flex-col">
          <div className="px-[18px] py-[13px] border-b border-[#E2E5EC] flex items-center justify-between">
            <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Startup Spotlight</span>
            <button 
              onClick={() => onNavigate('startups')}
              className="text-[11.5px] text-[#2DC5A2] font-semibold hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {spotlightStartups.map(su => (
              <div 
                key={su.id} 
                className="flex items-center gap-3 py-1.5 border-b border-[#F4F5F7] last:border-0 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-black text-xs shrink-0">
                  {su.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#1B2240] truncate">{su.name}</div>
                  <div className="text-[10.5px] text-[#8891B0] truncate">{su.domain} · Lead: {su.lead_founder}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                  su.stage === 'Revenue' ? 'bg-[#2DC5A2]/10 text-[#1a8f74]' : 'bg-[#3B82F6]/10 text-[#1d4ed8]'
                }`}>
                  {su.stage}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events calendar */}
        <div className="bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm flex flex-col">
          <div className="px-[18px] py-[13px] border-b border-[#E2E5EC] flex items-center justify-between">
            <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Upcoming Cohort Events</span>
            <button 
              onClick={() => onNavigate('events')}
              className="text-[11.5px] text-[#2DC5A2] font-semibold hover:underline cursor-pointer"
            >
              Calendar
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8891B0]">No upcoming events listed</div>
            ) : (
              upcomingEvents.map(ev => {
                const dateObj = new Date(ev.event_date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('en-US', { month: 'short' });
                return (
                  <div 
                    key={ev.id} 
                    className="flex gap-3 text-left border-b border-[#F4F5F7] last:border-0 pb-2.5 last:pb-0"
                  >
                    <div className="bg-[#2DC5A2]/10 border border-[#2DC5A2]/25 text-[#2DC5A2] rounded-lg w-10 py-1 flex flex-col items-center justify-center shrink-0">
                      <div className="font-['Bricolage_Grotesque'] text-lg font-black leading-none">{day}</div>
                      <div className="text-[9px] font-extrabold uppercase mt-0.5">{month}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#1B2240] truncate">{ev.title}</div>
                      <div className="text-[11px] text-[#8891B0] truncate">{ev.description}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action item tasks */}
        <div className="bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm flex flex-col">
          <div className="px-[18px] py-[13px] border-b border-[#E2E5EC] flex items-center justify-between">
            <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Action Checklist</span>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-[11.5px] text-[#2DC5A2] font-semibold hover:underline cursor-pointer"
            >
              Tasks
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3 max-h-72 overflow-y-auto">
            {myTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-start gap-2.5 text-left pb-2 border-b border-[#F4F5F7] last:border-0 last:pb-0"
              >
                <input 
                  type="checkbox" 
                  checked={task.done}
                  onChange={(e) => toggleTask(task.id, e.target.checked)}
                  className="w-4 h-4 text-[#2DC5A2] border-[#E2E5EC] rounded-sm mt-0.5 cursor-pointer accent-[#2DC5A2]"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium text-[#1B2240] ${task.done ? 'line-through text-[#8891B0]' : ''}`}>
                    {task.text}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${
                    task.done ? 'text-[#8891B0]' : 
                    new Date(task.due_date) < new Date() ? 'text-[#E8524A] font-bold' : 'text-[#8891B0]'
                  }`}>
                    {task.done ? 'Completed' : `Due: ${new Date(task.due_date).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Users, Rocket, Calendar, CheckSquare, MessageSquare, Plus, CheckCircle } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { College, Startup, Message, Task, User, Event } from '../types';

interface CollegeDashboardProps {
  user: User;
  onNavigate: (pageId: string) => void;
  refetchCounter: number;
}

export default function CollegeDashboard({ user, onNavigate, refetchCounter }: CollegeDashboardProps) {
  const isFaculty = user.role === 'Faculty';
  const collegeId = user.college_id || '1'; // Default to MIT Manipal

  const [collegeName, setCollegeName] = useState('MIT Manipal');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [biMessages, setBiMessages] = useState<any[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);

  const loadCollegeData = async () => {
    // Load College Name
    const col = await dbService.getCollegeById(collegeId);
    if (col) setCollegeName(col.name);

    // Get startups
    const allStartups = await dbService.getStartupsByCollege(collegeId);
    // Faculty only gets ones they are assigned, or all of them depending on mentoring assignments.
    // In our seed, 's1' and 's4' have faculty_id: 'u4' (Dr. Priya Sharma)
    if (isFaculty) {
      setStartups(allStartups.filter(s => s.faculty_id === user.id));
    } else {
      setStartups(allStartups);
    }

    // Get tasks assigned to this college
    const collegeTasks = await dbService.getTasksForCollege(collegeId);
    setTasks(collegeTasks);

    // Get messages relevant from BI to display
    const conversation = await dbService.getOrCreateCollegeConversation(collegeId, col?.name || 'College');
    const msgs = await dbService.getMessages(conversation.id);
    const sortedMsgs = msgs.sort((a,b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    setBiMessages(sortedMsgs.slice(0, 3));

    // Get upcoming event
    const events = await dbService.getEventsByCollege(collegeId);
    const upcoming = events.filter(e => !e.is_past && (e.college_id === null || e.college_id === collegeId))[0];
    setUpcomingEvent(upcoming || null);
  };

  useEffect(() => {
    loadCollegeData();
  }, [user, refetchCounter]);

  const handleEndorse = async (startupId: string) => {
    await dbService.updateStartupStage(startupId, 'Revenue'); // Endorsement shifts stage or triggers badge
    // We can also record custom state, let's trigger refetch
    loadCollegeData();
    // Create a notification for Admin
    const str = startups.find(s => s.id === startupId);
    await dbService.addNotification(null, `<b>Dr. Priya Sharma</b> endorsed startup <b>${str?.name || 'Startup'}</b> for MVP scaling`);
  };

  return (
    <div className="flex flex-col gap-5 text-[#1B2240]">
      {/* HEADER BANNER */}
      <div className="bg-[#1B2240] rounded-2xl p-5 md:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-[#2DC5A2]/10 blur-xl pointer-events-none" />
        <div className="text-left">
          <h2 className="font-['Bricolage_Grotesque'] text-[17px] md:text-xl font-extrabold text-white leading-tight">
            {collegeName} — Summer Cohort 2025
          </h2>
          <p className="text-xs text-[rgba(255,255,255,0.45)] mt-1.5 font-medium">
            {isFaculty 
              ? 'Faculty Advisor Hub · Active mentoring, validations, and endorsements' 
              : 'Core Team Operations Portal · Week 9 of 16 · Prototype Stage Gate · 24 Founders enrolled'}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-[#2DC5A2] text-[#1B2240] shadow-sm select-none">
          ● On Track
        </span>
      </div>

      {/* STATS ROW */}
      {/* Mobile Consolidated Single-Box Widget */}
      <div className="block sm:hidden bg-white border border-[#E2E5EC] rounded-xl shadow-xs divide-y divide-[#F4F5F7] overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-[#F4F5F7]">
          {/* Founders / Mentees */}
          <div className="p-3 text-left">
            <div className="flex items-center gap-1.5 mb-1 text-[#2DC5A2]">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">
                {isFaculty ? 'Mentees' : 'Founders'}
              </span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1B2240] leading-none mb-0.5">
              {isFaculty ? startups.length : '24'}
            </div>
            <div className="text-[10px] text-[#8891B0] truncate">
              {isFaculty ? 'Active: 6' : '92% Attnd.'}
            </div>
          </div>
          {/* Active Startups */}
          <div className="p-3 text-left">
            <div className="flex items-center gap-1.5 mb-1 text-[#8b5cf6]">
              <Rocket className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">Startups</span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1B2240] leading-none mb-0.5">8</div>
            <div className="text-[10px] text-[#2DC5A2] font-semibold">🚀 3 MVPs info</div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#F4F5F7]">
          {/* Next Event */}
          <div className="p-3 text-left">
            <div className="flex items-center gap-1.5 mb-1 text-[#f5a623]">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">Next Event</span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-xs font-bold text-[#1B2240] truncate max-w-[120px] mb-0.5">
              {upcomingEvent ? upcomingEvent.title : 'Sync Scheduled'}
            </div>
            <div className="text-[9.5px] text-[#8891B0] truncate">
              {upcomingEvent ? new Date(upcomingEvent.event_date).toLocaleDateString() : 'BI Advisory'}
            </div>
          </div>
          {/* Checklist Tasks / Endorsements */}
          <div className="p-3 text-left">
            <div className="flex items-center gap-1.5 mb-1 text-[#3b82f6]">
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="text-[9px] text-[#8891B0] font-bold tracking-wider uppercase">
                {isFaculty ? 'Advising' : 'Open Tasks'}
              </span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1B2240] leading-none mb-0.5">
              {isFaculty ? startups.filter(s => s.stage !== 'Revenue').length : tasks.filter(t => !t.done).length}
            </div>
            <div className="text-[10px] text-[#2DC5A2] font-semibold">✓ Synced</div>
          </div>
        </div>
      </div>

      {/* Desktop Grid Layout (unchanged for larger viewports) */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm border-b-[3px] border-b-[#2DC5A2]">
          <div className="w-9 h-9 rounded-lg bg-[#2DC5A2]/10 text-[#2DC5A2] flex items-center justify-center text-lg mb-3">
            <Users className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">
            {isFaculty ? 'My Mentee Teams' : 'Enrolled Founders'}
          </div>
          <div className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[#1B2240] leading-none my-1">
            {isFaculty ? startups.length : '24'}
          </div>
          <div className="text-[11px] text-[#8891B0] mt-1 text-left">
            {isFaculty ? 'Active founders: 6' : 'Average Attendance: 92%'}
          </div>
        </div>

        <div className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm border-b-[3px] border-b-[#8B5CF6]">
          <div className="w-9 h-9 rounded-lg bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] flex items-center justify-center text-lg mb-3">
            <Rocket className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">Active Startups</div>
          <div className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[#1B2240] leading-none my-1">8</div>
          <div className="text-[11px] text-[#2DC5A2] font-semibold flex items-center mt-1">
            🚀 3 have active MVPs
          </div>
        </div>

        <div className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm border-b-[3px] border-b-[#F5A623]">
          <div className="w-9 h-9 rounded-lg bg-[rgba(245,166,35,0.1)] text-[#f5a623] flex items-center justify-center text-lg mb-3">
            <Calendar className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">Next Event</div>
          <div className="font-['Bricolage_Grotesque'] text-lg font-black text-[#1B2240] leading-none my-2.5 text-left truncate">
            {upcomingEvent ? upcomingEvent.title : 'No immediate event'}
          </div>
          <div className="text-[10.5px] text-[#8891B0] text-left">
            {upcomingEvent ? new Date(upcomingEvent.event_date).toLocaleDateString() : 'Syncing scheduled'}
          </div>
        </div>

        <div className="bg-white border border-[#E2E5EC] rounded-xl p-4 shadow-sm border-[#3b82f6] border-b-[3px]">
          <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center text-lg mb-3">
            <CheckSquare className="w-[18px] h-[18px]" />
          </div>
          <div className="text-[10px] text-[#8891B0] font-bold tracking-wider uppercase">
            {isFaculty ? 'Pending Endorsements' : 'Open Tasks'}
          </div>
          <div className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-[#1B2240] leading-none my-1">
            {isFaculty ? startups.filter(s => s.stage !== 'Revenue').length : tasks.filter(t => !t.done).length}
          </div>
          <div className="text-[11px] text-[#2DC5A2] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Updated with BI</span>
          </div>
        </div>

      </div>

      {/* LOWER CONTENT TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Startups section */}
        <div className="lg:col-span-8 bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm flex flex-col">
          <div className="px-[18px] py-[13px] border-b border-[#E2E5EC] flex items-center justify-between">
            <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">
              {isFaculty ? "Assigned Startups for Faculty Endorsement" : "Registered College Startups"}
            </span>
            <button 
              onClick={() => onNavigate('c-startups')}
              className="text-[11.5px] text-[#2DC5A2] font-semibold flex items-center hover:underline cursor-pointer"
            >
              View portal startups
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {startups.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#8891B0]">No active startups found</div>
            ) : (
              startups.map(su => (
                <div 
                  key={su.id} 
                  className="flex items-center gap-4 py-2 border-b border-[#F4F5F7] last:border-0 last:pb-0 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#2DC5A2]/10 text-[#1a8f74] flex items-center justify-center font-black text-xs shrink-0">
                    {su.name.substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#1B2240]">{su.name}</div>
                    <div className="text-[10.5px] text-[#8891B0] mt-0.5 truncate">{su.domain} · Lead founder: {su.lead_founder}</div>
                  </div>

                  <div className="flex items-center gap-3.5 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      su.stage === 'Revenue' || su.stage === 'MVP live' ? 'bg-[#2DC5A2]/12 text-[#1a8f74]' :
                      su.stage === 'Validating' ? 'bg-[#F5A623]/12 text-[#b45309]' : 'bg-[#E2E5EC] text-[#4A5270]'
                    }`}>
                      {su.stage}
                    </span>

                    {isFaculty && (
                      su.stage === 'Revenue' ? (
                        <span className="text-[10.5px] font-bold text-[#2DC5A2] bg-[#2DC5A2]/10 px-3 py-1 rounded-md">
                          ✓ Endorsed
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleEndorse(su.id)}
                          className="px-3 py-1 text-[11px] font-bold bg-[#2DC5A2] text-[#1B2240] rounded-md hover:bg-[#22a088] cursor-pointer transition-all border-none"
                        >
                          Endorse
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages from Head office */}
        <div className="lg:col-span-4 bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm flex flex-col">
          <div className="px-[18px] py-[13px] border-b border-[#E2E5EC] flex items-center justify-between">
            <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Headquarters Advisory</span>
            <button 
              onClick={() => onNavigate('c-messages')}
              className="text-[11px] text-[#2DC5A2] font-semibold hover:underline cursor-pointer"
            >
              Inbox
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4 text-left">
            {biMessages.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#8891B0]">No recent communications from BI Admin</div>
            ) : (
              biMessages.map((msg, idx) => (
                <div key={msg.id} className="flex gap-2.5 text-xs leading-normal pb-3 last:pb-0 border-b border-[#F4F5F7] last:border-0">
                  <div className="w-7 h-7 rounded-full bg-[#1B2240] text-[#2DC5A2] flex items-center justify-center font-bold font-['Bricolage_Grotesque'] text-[10px] shrink-0">
                    {idx === 0 ? 'AR' : 'BI'}
                  </div>
                  <div>
                    <div className="font-bold text-[#1B2240]">Arjun Rao (BI Admin)</div>
                    <div className="text-[#4A5270] mt-1 leading-relaxed text-left">{msg.text}</div>
                    <div className="text-[9.5px] text-[#8891B0] mt-1.5">{new Date(msg.created_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

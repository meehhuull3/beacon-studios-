import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, CalendarDays, CheckCircle2, Clock, MapPin, X, ArrowUpRight } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { Event, College, User } from '../types';

interface EventsPageProps {
  onRefetch: () => void;
  refetchCounter: number;
  currentUser: User;
  showAddDirectly: boolean;
  onModalHandled: () => void;
}

export default function EventsPage({ onRefetch, refetchCounter, currentUser, showAddDirectly, onModalHandled }: EventsPageProps) {
  const isBI = currentUser.portal === 'bi';
  const collegeId = currentUser.college_id;

  const [events, setEvents] = useState<Event[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Past'>('All');

  // Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-06-14T10:00');
  const [newType, setNewType] = useState('Workspace');
  const [newColId, setNewColId] = useState<string>('all');

  const loadEventsData = async () => {
    const list = await dbService.getEvents();
    const cols = await dbService.getColleges();
    
    // Filter events depending on whether they are BI or college level
    const allowed = isBI 
      ? list 
      : list.filter(e => e.college_id === null || e.college_id === collegeId);

    setEvents(allowed);
    setColleges(cols);
  };

  useEffect(() => {
    loadEventsData();
  }, [refetchCounter]);

  useEffect(() => {
    if (showAddDirectly) {
      setShowAddModal(true);
      onModalHandled();
    }
  }, [showAddDirectly]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newDate) return;

    await dbService.addEvent({
      college_id: newColId === 'all' ? null : newColId,
      title: newTitle,
      description: newDesc,
      event_date: new Date(newDate).toISOString(),
      type: newType
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);

    onRefetch();
    loadEventsData();
  };

  const handleMarkPast = async (id: string, isPastState: boolean) => {
    await dbService.markEventPast(id, isPastState);
    loadEventsData();
  };

  const handleDeleteEvent = async (id: string) => {
    const ok = confirm("Are you sure you want to cancel and delete this cohort event?");
    if (ok) {
      await dbService.deleteEvent(id);
      loadEventsData();
      onRefetch();
    }
  };

  // Filter lists
  const filteredEvents = events.filter(e => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return !e.is_past;
    return e.is_past;
  });

  return (
    <div className="flex flex-col gap-4 text-left text-[#1B2240]">
      
      {/* FILTER CONTROL TAB BAR */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {['All', 'Upcoming', 'Past'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                filter === f 
                  ? 'bg-[#2DC5A2]/10 border-[#2DC5A2] text-[#2DC5A2]' 
                  : 'bg-[#F4F5F7] border-[#E2E5EC] text-[#4A5270] hover:bg-[#E2E5EC]'
              }`}
            >
              {f === 'All' ? 'All Scheduled' : f}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] rounded-lg text-xs font-bold cursor-pointer font-['Plus_Jakarta_Sans'] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Event</span>
        </button>
      </div>

      {/* EVENT ITEMS WRAPPER LIST */}
      <div className="bg-white border border-[#E2E5EC] rounded-[14px] shadow-sm overflow-hidden p-6">
        <div className="flex flex-col gap-4">
          {filteredEvents.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#8891B0]">No events matching your workspace filter</div>
          ) : (
            filteredEvents.map(ev => {
              const dTime = new Date(ev.event_date);
              const matchingCollege = colleges.find(c => c.id === ev.college_id);

              return (
                <div 
                  key={ev.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#F4F5F7] last:border-0 pb-4 last:pb-0 gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Event calendar visual badge */}
                    <div className="bg-[#2DC5A2]/10 border border-[#2DC5A2]/25 rounded-xl w-12 py-2 flex flex-col items-center shrink-0">
                      <div className="font-['Bricolage_Grotesque'] text-[21px] font-black text-[#2DC5A2] leading-none">
                        {dTime.getDate()}
                      </div>
                      <div className="text-[10px] font-extrabold uppercase text-[#2DC5A2] mt-1 tracking-wider">
                        {dTime.toLocaleString('en-US', { month: 'short' })}
                      </div>
                    </div>

                    <div className="text-left">
                      <h4 className="font-['Bricolage_Grotesque'] text-[14px] font-bold text-[#1B2240] flex items-center gap-1.5">
                        <span>{ev.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3b82f6]">
                          {ev.type}
                        </span>
                      </h4>
                      <p className="text-xs text-[#4A5270] mt-1 max-w-xl">{ev.description}</p>
                      
                      {/* Meta links */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#8891B0] mt-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{dTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#cbd0dc]" />
                          <span>{matchingCollege ? matchingCollege.name : 'All Partner Colleges (Online)'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inline controls drawer / manage buttons */}
                  <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-end">
                    {isBI ? (
                      <>
                        <button
                          onClick={() => handleMarkPast(ev.id, !ev.is_past)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ev.is_past 
                              ? 'bg-[#E2E5EC] border-[#CBD0DC] text-[#4A5270]' 
                              : 'bg-white border-[#E2E5EC] hover:border-[#CBD0DC] text-[#1B2240]'
                          }`}
                        >
                          {ev.is_past ? 'Completed' : 'Set Past'}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 rounded-lg border border-[#E2E5EC] text-red-500 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                          title="Cancel Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-[#2DC5A2] bg-[#2DC5A2]/10 px-3 py-1.5 rounded-[10px] flex items-center gap-1 select-none">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>RSVP Confirmed</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE EVENT MODAL DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-[#131929]/50 backdrop-blur-[2px]" 
            onClick={() => setShowAddModal(false)}
          />
          <form 
            onSubmit={handleCreateEvent}
            className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-left border border-[#E2E5EC] z-50 animate-[fadeIn_0.15s_ease]"
          >
            <div className="flex items-center justify-between border-b border-[#E2E5EC] pb-3.5 mb-4">
              <span className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1B2240]">Schedule Masterclass/Demo Event</span>
              <button 
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  onModalHandled();
                }}
                className="p-1 rounded-full hover:bg-[#F4F5F7] transition-all cursor-pointer text-[#8891B0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Event Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Demo Day pitches, Legal workshop" 
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Short description</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide brief outline agenda or links..." 
                  className="w-full px-3 py-2 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240] h-16 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Event Date/Time</label>
                  <input 
                    type="datetime-local" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-1.5 border-2 border-[#E2E5EC] rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Category Tag</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="Demo Day">Demo Day</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Review">Cohort Review</option>
                    <option value="Roundtable">Roundtable</option>
                    <option value="Orientation">Orientation</option>
                  </select>
                </div>
              </div>

              {isBI && (
                <div>
                  <label className="text-[10px] font-bold text-[#4A5270] uppercase tracking-wider mb-1.5 block">Scope Location</label>
                  <select 
                    value={newColId}
                    onChange={(e) => setNewColId(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#E2E5EC] bg-white rounded-lg text-xs outline-none focus:border-[#2DC5A2] text-[#1B2240]"
                  >
                    <option value="all">Global (All Colleges)</option>
                    {colleges.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full mt-5 py-2.5 bg-[#1B2240] text-white hover:bg-[#222d4e] rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] cursor-pointer transition-all border-none"
            >
              Confirm and Schedule Event
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

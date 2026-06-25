import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Building, Calendar, CheckSquare, FileText, 
  LayoutDashboard, LogOut, MessageSquare, Plus, Bell, Search, Send, Rocket, Menu, X
} from 'lucide-react';
import { User, Notification, College, Startup, Event, Cohort } from '../types';
import { dbService } from '../supabaseClient';
import BeaconLogo from './BeaconLogo';
import ThemeToggle from './ThemeToggle';

interface AppShellProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (pageId: string) => void;
  children: React.ReactNode;
  onCreateTrigger: (type: 'event' | 'task' | 'startup' | 'college' | 'cohort' | 'document' | 'broadcast') => void;
  unreadMessagesCount: number;
}

export default function AppShell({ 
  user, onLogout, currentPage, onNavigate, children, onCreateTrigger, unreadMessagesCount 
}: AppShellProps) {
  const isBI = user.portal === 'bi';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // States for search and notification
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    colleges: College[];
    startups: Startup[];
    events: Event[];
    cohorts: Cohort[];
  }>({ colleges: [], startups: [], events: [], cohorts: [] });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = async () => {
    const list = await dbService.getNotifications(isBI ? null : user.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    
    // Check periodically for notification updates or changes
    const interval = setInterval(loadNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle global search with 300ms debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults({ colleges: [], startups: [], events: [], cohorts: [] });
      setShowSearchSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      const q = searchTerm.toLowerCase().trim();
      
      const allColleges = await dbService.getColleges();
      const allStartups = await dbService.getStartups();
      const allEvents = await dbService.getEvents();
      const allCohorts = await dbService.getCohorts();

      // filter
      const colleges = allColleges.filter(c => 
        c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
      );
      const startups = allStartups.filter(s => 
        s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
      ).filter(s => isBI ? true : s.college_id === user.college_id);

      const events = allEvents.filter(e => 
        e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)
      ).filter(e => isBI ? true : (e.college_id === null || e.college_id === user.college_id));

      const cohorts = allCohorts.filter(c => 
        c.name.toLowerCase().includes(q)
      ).filter(c => isBI ? true : c.college_id === user.college_id);

      setSearchResults({ colleges, startups, events, cohorts });
      setShowSearchSuggestions(colleges.length > 0 || startups.length > 0 || events.length > 0 || cohorts.length > 0);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, user]);

  // Click outside search suggestion popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await dbService.markAllNotificationsRead(isBI ? null : user.id);
    loadNotifications();
  };

  const handleSuggestionClick = (pageId: string) => {
    onNavigate(pageId);
    setSearchTerm('');
    setShowSearchSuggestions(false);
  };

  // Build Nav Definitions
  const BI_NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'colleges', label: 'Colleges', icon: Building, hasBadge: true, getBadge: (cols: any[]) => cols.length.toString() },
    { id: 'cohorts', label: 'Cohorts', icon: CheckSquare },
    { id: 'startups', label: 'Startups', icon: Rocket },
    { id: 'events', label: 'Events', icon: Calendar, badgeCount: 3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare, hasBadge: true, badgeWarn: true, getBadge: () => unreadMessagesCount > 0 ? unreadMessagesCount.toString() : '' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
  ];

  const COLLEGE_NAV_CORE_ITEMS = [
    { id: 'c-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'c-cohort', label: 'Our Cohort', icon: CheckSquare },
    { id: 'c-startups', label: 'Our Startups', icon: Rocket },
    { id: 'c-messages', label: 'Messages', icon: MessageSquare, hasBadge: true, badgeWarn: true, getBadge: () => unreadMessagesCount > 0 ? unreadMessagesCount.toString() : '' },
    { id: 'c-events', label: 'Events', icon: Calendar },
    { id: 'c-tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'c-docs', label: 'Resources', icon: FileText },
  ];

  const COLLEGE_NAV_FACULTY_ITEMS = [
    { id: 'c-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'c-startups', label: 'Startups to mentor', icon: Rocket },
    { id: 'c-cohort', label: 'Cohort view', icon: CheckSquare },
    { id: 'c-events', label: 'Events', icon: Calendar },
    { id: 'c-messages', label: 'Messages', icon: MessageSquare, hasBadge: true, badgeWarn: true, getBadge: () => unreadMessagesCount > 0 ? unreadMessagesCount.toString() : '' },
    { id: 'c-docs', label: 'Resources', icon: FileText },
  ];

  const activeNavItems = isBI 
    ? BI_NAV_ITEMS 
    : user.role === 'Faculty' 
      ? COLLEGE_NAV_FACULTY_ITEMS 
      : COLLEGE_NAV_CORE_ITEMS;

  const bcrumbLabel = currentPage.replace('c-', '').toUpperCase();
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F5F7]" id="screen-app">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#1B2240]/40 backdrop-blur-xs z-50 md:hidden transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR COMPONENT - responsive drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col overflow-hidden transition-all duration-300 ease-in-out md:static md:translate-x-0 md:w-[220px] md:min-w-[220px] border-r ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isBI 
            ? 'bg-[#1B2240] border-[rgba(255,255,255,0.07)] text-white' 
            : 'bg-white border-[#E2E5EC] text-[#1B2240]'
        }`}
      >
        {/* LOGO */}
        <div 
          className={`px-[18px] py-[20px] flex items-center justify-between border-b ${
            isBI ? 'border-[rgba(255,255,255,0.07)]' : 'border-[#E2E5EC]'
          }`}
        >
          <div className="flex items-center gap-2">
            <BeaconLogo variant={isBI ? 'solid-white' : 'solid-navy'} size={28} />
            <div className="ml-1 text-left">
              <div className={`font-['Bricolage_Grotesque'] text-sm font-extrabold tracking-tight leading-none ${isBI ? 'text-white' : 'text-[#1B2240]'}`}>
                Beacon Studio
              </div>
              <div className="text-[9px] text-[#2DC5A2] tracking-[#1.5px] uppercase font-bold mt-0.5">
                {isBI ? 'Headquarters' : 'Campus Hub'}
              </div>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md md:hidden hover:bg-gray-100/10 cursor-pointer text-[#8891B0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROLE CHIP */}
        <div className={`mx-3 my-2.5 rounded-lg p-2 flex items-center gap-2 border ${
          isBI 
            ? 'bg-[#2DC5A2]/10 border-[#2DC5A2]/25 text-[#2DC5A2]' 
            : 'bg-[#2DC5A2]/5 border-[#2DC5A2]/20 text-[#21a486]'
        }`}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#2DC5A2] animate-pulse" />
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-left truncate">
            {isBI ? `BI ${user.role}` : `${user.role} · ${user.college_id === '1' ? 'Manipal' : 'VJTI'}`}
          </div>
        </div>

        {/* NAV SCROLLABLE BODY */}
        <nav className="flex-1 overflow-y-auto pt-2 pb-6 text-left">
          <div className={`px-4.5 py-1 text-[9px] tracking-[2px] uppercase font-bold mb-1.5 ${
            isBI ? 'text-[rgba(255,255,255,0.25)]' : 'text-[#8891B0]'
          }`}>
            WORKSPACE
          </div>

          <div className="flex flex-col gap-[2px]">
            {activeNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-[12.5px] font-medium transition-all group relative border-l-2 text-left cursor-pointer ${
                    isActive 
                      ? isBI 
                        ? 'bg-[#2DC5A2]/10 text-[#2DC5A2] border-[#2DC5A2]' 
                        : 'bg-[#2DC5A2]/5 text-[#21a486] border-[#2DC5A2] font-semibold'
                      : isBI 
                        ? 'text-[rgba(255,255,255,0.5)] border-transparent hover:bg-white/5 hover:text-white' 
                        : 'text-[#8891B0] border-transparent hover:bg-[#F0F2F5] hover:text-[#1B2240]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2DC5A2]' : ''}`} />
                  <span className="truncate">{item.label}</span>
                  
                  {/* Badges */}
                  {item.id === 'colleges' && (
                    <span className={`ml-auto text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isBI ? 'bg-[#2DC5A2] text-[#1B2240]' : 'bg-[#E2E5EC] text-[#4A5270]'
                    }`}>
                      8
                    </span>
                  )}
                  {item.id === 'messages' && unreadMessagesCount > 0 && (
                    <span className="ml-auto text-[9px] font-black bg-[#E8524A] text-white px-1.5 py-0.5 rounded-full animate-bounce">
                      {unreadMessagesCount}
                    </span>
                  )}
                  {item.id === 'c-messages' && unreadMessagesCount > 0 && (
                    <span className="ml-auto text-[9px] font-black bg-[#E8524A] text-white px-1.5 py-0.5 rounded-full">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* SIDEBAR FOOTER & USER ROW */}
        <div className={`p-3 mt-auto border-t ${
          isBI ? 'border-[rgba(255,255,255,0.07)]' : 'border-[#E2E5EC]'
        }`}>
          <div className="flex items-center gap-2.5 p-1.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#2DC5A2] text-[#1B2240] flex items-center justify-center font-extrabold text-[11.5px] shrink-0">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className={`text-xs font-semibold truncate ${isBI ? 'text-white' : 'text-[#1B2240]'}`}>
                {user.name}
              </div>
              <div className={`text-[10px] truncate ${isBI ? 'text-[rgba(255,255,255,0.4)]' : 'text-[#8891B0]'}`}>
                {isBI ? user.role : user.college_id === '1' ? 'MIT Manipal' : 'VJTI Mumbai'}
              </div>
            </div>
            <button 
              onClick={onLogout}
              className={`p-1 hover:rounded-md transition-all cursor-pointer ${
                isBI ? 'text-[rgba(255,255,255,0.3)] hover:text-red-400 hover:bg-white/5' : 'text-[#8891B0] hover:text-[#E8524A] hover:bg-[#F0F2F5]'
              }`}
              title="Sign out"
            >
              <LogOut className="w-4 h-4 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      {/* CORE DISPLAY STAGE */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* TOPBAR HEADER - breadcrumbs, searches, notification trigger */}
        <div className="h-14 bg-white border-b border-[#E2E5EC] flex items-center justify-between px-3 sm:px-6 shrink-0 z-40">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hamburger trigger menu for mobile viewports */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-[#E2E5EC] bg-[#F4F5F7] text-[#1B2240] md:hidden hover:bg-gray-100 transition-all cursor-pointer mr-0.5 shrink-0"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 mr-1 bg-[#1B2240]/5 px-2 py-1.5 rounded-lg border border-[#E2E5EC] shrink-0">
              <BeaconLogo variant="solid-navy" size={18} />
              <span className="font-['Bricolage_Grotesque'] text-xs font-black text-[#1B2240] leading-none">Beacon Studio</span>
            </div>
            <span className="text-[#CBD0DC] font-normal text-sm hidden sm:inline">›</span>
            <span className="text-[11px] sm:text-xs font-semibold text-[#4A5270] lowercase capitalize bg-[#F4F5F7] px-2 py-1 rounded-md border border-[#E2E5EC] truncate max-w-[85px] sm:max-w-none">
              {bcrumbLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 relative" ref={searchRef}>
            {/* Search Suggestions Frame */}
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-[#F4F5F7] border border-[#E2E5EC] hover:border-[#CBD0DC] rounded-lg px-2 sm:px-3 py-1.5 text-[11px] sm:text-[12px] text-[#4A5270] focus-within:border-[#2DC5A2] focus-within:ring-2 focus-within:ring-[#2DC5A2]/5 transition-all w-24 sm:w-48 md:w-60">
                <Search className="w-3.5 h-3.5 text-[#8891B0] shrink-0" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..." 
                  className="bg-transparent border-none text-[10.5px] sm:text-xs outline-none w-full text-[#1B2240]"
                  onFocus={() => searchTerm.trim() && setShowSearchSuggestions(true)}
                />
              </div>

              {/* Suggestions Overlay Dropdown */}
              {showSearchSuggestions && (
                <div className="absolute top-10 left-0 w-72 bg-white border border-[#E2E5EC] rounded-xl shadow-2xl text-left z-50 overflow-hidden max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-[#F4F5F7] text-[10px] font-bold text-[#8891B0] tracking-wider uppercase">
                    Unified Search Results
                  </div>
                  
                  {searchResults.colleges.length > 0 && (
                    <div className="p-2 border-b border-[#F4F5F7]">
                      <div className="text-[9.5px] font-bold text-[#2DC5A2] px-2 py-0.5 uppercase">Colleges</div>
                      {searchResults.colleges.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => handleSuggestionClick('colleges')}
                          className="px-2 py-1.5 hover:bg-[#F4F5F7] rounded-md text-xs font-semibold text-[#1B2240] cursor-pointer"
                        >
                          🏙️ {c.name} <span className="text-[10px] text-[#8891B0] font-normal">— {c.city}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.cohorts.length > 0 && (
                    <div className="p-2 border-b border-[#F4F5F7]">
                      <div className="text-[9.5px] font-bold text-[#3B82F6] px-2 py-0.5 uppercase">Cohorts</div>
                      {searchResults.cohorts.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => handleSuggestionClick(isBI ? 'cohorts' : 'c-cohort')}
                          className="px-2 py-1.5 hover:bg-[#F4F5F7] rounded-md text-xs font-semibold text-[#1B2240] cursor-pointer"
                        >
                          👥 {c.name} <span className="text-[10px] text-[#8891B0] font-normal">— progress {c.progress_pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.startups.length > 0 && (
                    <div className="p-2 border-b border-[#F4F5F7]">
                      <div className="text-[9.5px] font-bold text-[#8B5CF6] px-2 py-0.5 uppercase">Startups</div>
                      {searchResults.startups.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => handleSuggestionClick(isBI ? 'startups' : 'c-startups')}
                          className="px-2 py-1.5 hover:bg-[#F4F5F7] rounded-md text-xs font-semibold text-[#1B2240] cursor-pointer"
                        >
                          🚀 {s.name} <span className="text-[10px] text-[#8891B0] font-normal">— {s.domain} ({s.stage})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.events.length > 0 && (
                    <div className="p-2">
                      <div className="text-[9.5px] font-bold text-[#F5A623] px-2 py-0.5 uppercase">Events</div>
                      {searchResults.events.map(e => (
                        <div 
                          key={e.id} 
                          onClick={() => handleSuggestionClick(isBI ? 'events' : 'c-events')}
                          className="px-2 py-1.5 hover:bg-[#F4F5F7] rounded-md text-xs font-semibold text-[#1B2240] cursor-pointer"
                        >
                          📅 {e.title} <span className="text-[10px] text-[#8891B0] font-normal">— {new Date(e.event_date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Context Action buttons */}
            <div className="flex items-center gap-1">
              {(currentPage === 'events' || currentPage === 'c-events') && (
                <button 
                  onClick={() => onCreateTrigger('event')}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 border border-transparent rounded-lg text-xs font-bold bg-[#1B2240] text-white hover:bg-[#222d4e] transition-all cursor-pointer"
                  title="New Event"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Event</span>
                </button>
              )}

              {(currentPage === 'tasks' || currentPage === 'c-tasks') && (
                <button 
                  onClick={() => onCreateTrigger('task')}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 border border-transparent rounded-lg text-xs font-bold bg-[#1B2240] text-white hover:bg-[#222d4e] transition-all cursor-pointer"
                  title="Assign Task"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Assign Task</span>
                </button>
              )}

              {/* Broadcast Action - BI admins can broadcast from anywhere, college hosts can broadcast from their dashboard */}
              {(isBI || currentPage === 'dashboard' || currentPage === 'c-dashboard') && (
                <button 
                  onClick={() => onCreateTrigger('broadcast')}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 border border-transparent rounded-lg text-[#1B2240] text-xs font-bold bg-[#2DC5A2] hover:bg-[#22a088] transition-all cursor-pointer"
                  title="Broadcast Action"
                >
                  <Send className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">Broadcast</span>
                </button>
              )}
            </div>

            {/* Dark & Light Theme Toggle Slider */}
            <ThemeToggle />

            {/* Notification trigger button */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-[34px] h-[34px] rounded-lg border border-[#E2E5EC] hover:border-[#CBD0DC] bg-white flex items-center justify-center cursor-pointer text-[#4A5270] hover:bg-[#F4F5F7] transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E8524A] border border-white" />
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 top-11 w-80 bg-white border border-[#E2E5EC] rounded-[14px] shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#E2E5EC] flex items-center justify-between">
                      <span className="font-['Bricolage_Grotesque'] text-[13.5px] font-bold text-[#1B2240]">Notifications</span>
                      {unreadNotifs.length > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-[#2DC5A2] font-semibold hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#F4F5F7] text-left">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#8891B0]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={async () => {
                              // mark read on tap
                              setShowNotifications(false);
                            }}
                            className={`p-3.5 flex gap-3 cursor-pointer hover:bg-[#F4F5F7] transition-all ${!n.read ? 'bg-[#2DC5A2]/5' : ''}`}
                          >
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-[#2DC5A2] shrink-0 mt-1.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div 
                                className="text-xs text-[#4A5270] leading-relaxed break-words"
                                dangerouslySetInnerHTML={{ __html: n.text }}
                              />
                              <div className="text-[10px] text-[#8891B0] mt-1">
                                {n.created_at ? new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 text-[#1B2240]">
          {children}
        </div>
      </div>
    </div>
  );
}

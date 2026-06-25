import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Rocket, Calendar,
  Megaphone, BarChart3, UserCheck, LogOut, ChevronLeft, ChevronRight,
  ClipboardList, GraduationCap, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

const adminLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/approvals', icon: UserCheck, label: 'Approvals' },
  { to: '/colleges', icon: Building2, label: 'Colleges' },
  { to: '/startups', icon: Rocket, label: 'Startups' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/messaging', icon: MessageSquare, label: 'Messaging' },
  { to: '/broadcast', icon: Megaphone, label: 'Broadcast' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const associateLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/proposals', icon: ClipboardList, label: 'Proposals' },
  { to: '/startups', icon: Rocket, label: 'Startups' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/colleges', icon: Building2, label: 'Colleges' },
  { to: '/messaging', icon: MessageSquare, label: 'Messaging' },
];

const facultyLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/startups', icon: Rocket, label: 'Startups' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/messaging', icon: MessageSquare, label: 'Messaging' },
  { to: '/broadcast', icon: Megaphone, label: 'Broadcast' },
];

const coreTeamLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/startups', icon: Rocket, label: 'Startups' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/messaging', icon: MessageSquare, label: 'Messaging' },
];

export default function Sidebar({ user, collapsed, onToggle }) {
  const location = useLocation();
  const role = user?.role || 'core_team';
  
  const links = role === 'admin' ? adminLinks
    : role === 'associate' ? associateLinks
    : role === 'faculty' ? facultyLinks
    : coreTeamLinks;

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 transition-all duration-300 border-r border-sidebar-border",
      collapsed ? "w-[72px]" : "w-[260px]"
    )}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Rocket className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-heading font-bold text-sidebar-primary-foreground text-lg tracking-tight leading-none">
              BEACON
            </h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60 font-medium">
              Studios
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {links.map(link => {
          const isActive = location.pathname === link.to || 
            (link.to !== '/' && location.pathname.startsWith(link.to));
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.full_name}</p>
            <p className="text-[10px] text-sidebar-foreground/50 capitalize">{role?.replace('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={async () => { 
            await base44.auth.logout();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive w-full transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent w-full transition-colors"
        >
          {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

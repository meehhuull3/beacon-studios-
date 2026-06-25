import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from './Sidebar';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayout({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me(), initialData: user });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 z-40 justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-heading font-bold ml-2 text-sm">BEACON STUDIOS</span>
        </div>
        <NotificationCenter user={currentUser} />
      </div>

      {/* Desktop notification bell */}
      <div className="hidden lg:block fixed top-4 right-6 z-30">
        <NotificationCenter user={currentUser} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <div className={cn("hidden lg:block", mobileOpen && "!block")}>
        <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <main className={cn(
        "transition-all duration-300 min-h-screen",
        "pt-14 lg:pt-0",
        collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
      )}>
        <div className="p-4 lg:p-8 max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

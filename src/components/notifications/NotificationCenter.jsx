import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44, supabase } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Megaphone, Rocket, Calendar, Check, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const typeConfig = {
  broadcast: { icon: Megaphone, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  startup_added: { icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  startup_removed: { icon: Rocket, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  startup_updated: { icon: Rocket, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  event_added: { icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  event_removed: { icon: Calendar, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  event_updated: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  member_approved: { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  member_removed: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default function NotificationCenter({ user }) {
  const [open, setOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const qc = useQueryClient();
  const role = user?.role || 'core_team';
  const userCollegeId = user?.college_id;
  // Use account created_at to filter out historical notifications
  const accountCreatedDate = user?.created_at ? new Date(user.created_at) : null;

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_at', 100),
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => base44.entities.Broadcast.list('-created_at', 50),
  });

  // Realtime subscription
  useEffect(() => {
    const channelId = Math.random().toString(36).substring(7);
    const notifChannel = supabase.channel(`realtime_notifications_${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification' }, () => {
        qc.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    const broadcastChannel = supabase.channel(`realtime_broadcasts_${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcast' }, () => {
        qc.invalidateQueries({ queryKey: ['broadcasts'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [qc]);

  const markReadMut = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Strict college-scoping: faculty/core_team only see their college. Admin/associate see all.
  const isGlobal = role === 'admin' || role === 'associate';

  const filterByCollegeAndDate = (item) => {
    // Strict college scope for non-global roles
    if (!isGlobal) {
      // Must match college (null college_id = global/admin notif, skip for non-admin)
      if (item.college_id && item.college_id !== userCollegeId) return false;
      if (!item.college_id && item.target_role === 'admin') return false;
    }
    // Only show notifications created after account approval (use created_at as proxy)
    if (accountCreatedDate && item.created_at) {
      if (new Date(item.created_at) < accountCreatedDate) return false;
    }
    return true;
  };

  // Filter broadcasts
  const visibleBroadcasts = broadcasts.filter(b => {
    if (!filterByCollegeAndDate(b)) return false;
    if (role === 'admin') return true;
    if (b.college_id && b.college_id !== userCollegeId) return false;
    if (b.target_audience === 'all_faculty' && role !== 'faculty') return false;
    if (b.target_audience === 'all_core_team' && role !== 'core_team') return false;
    if (b.target_audience === 'specific_college_faculty' && role !== 'faculty') return false;
    if (b.target_audience === 'specific_college_core_team' && role !== 'core_team') return false;
    return true;
  });

  // Filter notifications
  const visibleNotifications = notifications.filter(n => {
    if (!filterByCollegeAndDate(n)) return false;
    if (n.target_role && n.target_role !== 'all') {
      if (n.target_role === 'faculty' && role !== 'faculty') return false;
      if (n.target_role === 'core_team' && role !== 'core_team') return false;
      if (n.target_role === 'admin' && role !== 'admin') return false;
    }
    return true;
  });

  const allItems = [
    ...visibleBroadcasts.map(b => ({
      id: b.id,
      type: 'broadcast',
      message: b.message,
      created_at: b.created_at,
      actor_name: b.sender_name || 'Admin',
      college_id: b.college_id,
      priority: b.priority,
      is_read: true,
      _isBroadcast: true,
      _full: b,
    })),
    ...visibleNotifications.map(n => ({ ...n, _isBroadcast: false, _full: n })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = visibleNotifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    for (const n of visibleNotifications.filter(n => !n.is_read)) {
      await markReadMut.mutateAsync(n.id);
    }
  };

  const handleItemClick = (item) => {
    setOpen(false);
    setDetailItem(item);
    if (!item._isBroadcast && !item.is_read) {
      markReadMut.mutate(item.id);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-heading font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {allItems.slice(0, 30).map((item, i) => {
              const cfg = typeConfig[item.type] || typeConfig.broadcast;
              const Icon = cfg.icon;
              const isNew = !item._isBroadcast && !item.is_read;
              return (
                <div
                  key={`${item.type}-${item.id}-${i}`}
                  className={cn(
                    "px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer",
                    isNew && "bg-primary/5"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        {item._isBroadcast && item.priority === 'urgent' && (
                          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        )}
                        {item._isBroadcast && (
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Broadcast</span>
                        )}
                        {isNew && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-auto flex-shrink-0" />}
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.actor_name && <span className="text-[10px] text-muted-foreground">— {item.actor_name}</span>}
                        <span className="text-[10px] text-muted-foreground">
                          {item.created_at && format(new Date(item.created_at), 'MMM d, h:mm a')}
                        </span>
                        <span className="text-[10px] text-primary ml-auto">tap to read →</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {allItems.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No notifications yet</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Full Detail Dialog for ALL notifications */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailItem && (() => {
                const cfg = typeConfig[detailItem.type] || typeConfig.broadcast;
                const Icon = cfg.icon;
                return <Icon className={cn("w-5 h-5", cfg.color)} />;
              })()}
              {detailItem?._isBroadcast ? 'Broadcast Message' : 'Notification'}
            </DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              {detailItem._isBroadcast && detailItem._full?.priority === 'urgent' && (
                <span className="text-xs font-semibold text-red-600 px-2.5 py-1 bg-red-50 rounded-full flex items-center gap-1 w-fit">
                  <AlertCircle className="w-3 h-3" /> Urgent
                </span>
              )}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{detailItem.message}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                <span>
                  {detailItem.actor_name && <>From <strong className="text-foreground">{detailItem.actor_name}</strong></>}
                  {detailItem._full?.sender_name && <>Sent by <strong className="text-foreground">{detailItem._full.sender_name}</strong></>}
                </span>
                <span>{detailItem.created_at && format(new Date(detailItem.created_at), 'MMMM d, yyyy — h:mm a')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { format } from 'date-fns';
import { Calendar, Rocket, ListTodo, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  event: Calendar,
  startup: Rocket,
  task: ListTodo,
  broadcast: Megaphone,
};

export default function RecentActivity({ events = [], startups = [], tasks = [] }) {
  const activities = [
    ...events.slice(0, 3).map(e => ({
      type: 'event',
      title: e.title,
      subtitle: e.status,
      date: e.created_at,
    })),
    ...startups.slice(0, 3).map(s => ({
      type: 'startup',
      title: s.name,
      subtitle: s.stage?.replace('_', ' '),
      date: s.created_at,
    })),
    ...tasks.slice(0, 3).map(t => ({
      type: 'task',
      title: t.title,
      subtitle: t.status,
      date: t.created_at,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
        )}
        {activities.map((a, i) => {
          const Icon = iconMap[a.type] || Calendar;
          return (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{a.subtitle}</p>
              </div>
              {a.date && (
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {format(new Date(a.date), 'MMM d')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

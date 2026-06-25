import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-heading font-bold mt-2 text-foreground">{value}</p>
          {trend && (
            <p className="text-xs text-emerald-600 font-medium mt-2">{trend}</p>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

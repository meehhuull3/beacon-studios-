import { Badge } from '@/components/ui/badge';

const stageConfig = {
  ideation: { label: 'Ideation', color: 'bg-blue-100 text-blue-700' },
  validating: { label: 'Validating', color: 'bg-amber-100 text-amber-700' },
  mvp_live: { label: 'MVP Live', color: 'bg-violet-100 text-violet-700' },
  revenue: { label: 'Revenue', color: 'bg-emerald-100 text-emerald-700' },
};

export default function StartupPipeline({ startups = [], colleges = [] }) {
  const getCollegeName = (id) => colleges.find(c => c.id === id)?.name || '—';

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-heading font-semibold text-foreground mb-4">Startup Pipeline</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="pb-3 font-medium">Startup</th>
              <th className="pb-3 font-medium">College</th>
              <th className="pb-3 font-medium">Domain</th>
              <th className="pb-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {startups.slice(0, 8).map(s => {
              const stage = stageConfig[s.stage] || stageConfig.ideation;
              return (
                <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-muted-foreground">{getCollegeName(s.college_id)}</td>
                  <td className="py-3 text-muted-foreground">{s.domain || '—'}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
                      {stage.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {startups.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No startups yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

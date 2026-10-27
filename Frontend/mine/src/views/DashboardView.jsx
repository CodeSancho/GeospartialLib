import { useEffect, useState } from 'react';
import { Activity, Beaker, Database, Layers, MapPin, RefreshCw } from 'lucide-react';
import { apiRequest } from '../lib/api';

const cards = [
  ['Projects', 'projects', Layers],
  ['Drillholes', 'drillholes', MapPin],
  ['Samples', 'samples', Database],
  ['Assay results', 'assays', Beaker],
];

export default function DashboardView({ token }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [projects, drillholes, samples, assays] = await Promise.all([
        apiRequest('/projects', { token }),
        apiRequest('/drillholes', { token }),
        apiRequest('/samples', { token }),
        apiRequest('/assayresults', { token }),
      ]);
      setSummary({
        projects: Array.isArray(projects) ? projects.length : 0,
        drillholes: Array.isArray(drillholes) ? drillholes.length : 0,
        samples: Array.isArray(samples) ? samples.length : 0,
        assays: Array.isArray(assays) ? assays.length : 0,
      });
    } catch (loadError) {
      setError(loadError.message || 'Could not load dashboard data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  return (
    <section className="space-y-6 rounded-2xl bg-slate-950/35 p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">Workspace overview</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Your exploration data</h2>
          <p className="mt-1 text-sm text-white/70">Counts are loaded from your database.</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      {error && <div role="alert" className="rounded-lg border border-red-300/30 bg-red-950/40 p-4 text-sm text-red-100">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, key, Icon]) => (
          <article key={key} className="rounded-xl bg-white p-5 text-slate-900 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{label}</span>
              <Icon className="text-teal-700" size={22} />
            </div>
            <p className="mt-4 text-3xl font-bold">{loading && !summary ? '—' : summary?.[key] ?? 0}</p>
          </article>
        ))}
      </div>
      {!loading && !error && summary && Object.values(summary).every((count) => count === 0) && (
        <div className="rounded-xl border border-dashed border-white/30 p-8 text-center text-white/80">
          <Activity className="mx-auto mb-3 text-teal-200" />
          <p className="font-semibold text-white">No records yet</p>
          <p className="mt-1 text-sm">Create a project, then add drillholes and samples to start building your dataset.</p>
        </div>
      )}
    </section>
  );
}

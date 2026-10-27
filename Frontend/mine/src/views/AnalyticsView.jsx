import { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { apiRequest, downloadCsv } from '../lib/api';

export default function AnalyticsView({ token }) {
  const [projects, setProjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [projectRows, gradeRows] = await Promise.all([
        apiRequest('/reports/project-summary', { token }), apiRequest('/reports/avg-grades', { token }),
      ]);
      setProjects(projectRows); setGrades(gradeRows);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, [token]);

  return (
    <section className="space-y-6 rounded-2xl bg-white p-5 text-slate-900 shadow-xl md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Reports</p><h2 className="mt-1 text-2xl font-bold">Analytics</h2><p className="mt-1 text-sm text-slate-600">Live project, drilling and assay summaries.</p></div><div className="flex gap-2"><button onClick={() => downloadCsv('project-summary.csv', projects)} disabled={!projects.length} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"><Download size={16} /> Export projects</button><button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></div></header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-12 text-center text-slate-500">Loading reports…</p> : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200"><h3 className="bg-slate-50 px-4 py-3 font-bold">Project summary</h3>{projects.length ? <table className="min-w-full text-sm"><thead><tr>{['Project', 'Location', 'Drillholes', 'Samples'].map((label) => <th key={label} className="px-4 py-3 text-left text-slate-600">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{projects.map((row) => <tr key={row.project_id}><td className="px-4 py-3 font-medium">{row.name}</td><td className="px-4 py-3">{row.location}</td><td className="px-4 py-3">{row.drillhole_count}</td><td className="px-4 py-3">{row.sample_count}</td></tr>)}</tbody></table> : <p className="p-5 text-sm text-slate-500">No project data yet.</p>}</div>
          <div className="overflow-x-auto rounded-xl border border-slate-200"><div className="flex items-center justify-between bg-slate-50 px-4 py-3"><h3 className="font-bold">Average assay grades</h3><button onClick={() => downloadCsv('average-grades.csv', grades)} disabled={!grades.length} className="text-sm font-semibold text-teal-800 disabled:opacity-50">Export CSV</button></div>{grades.length ? <table className="min-w-full text-sm"><thead><tr>{['Project', 'Drillhole', 'Element', 'Average grade', 'Units'].map((label) => <th key={label} className="px-4 py-3 text-left text-slate-600">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{grades.map((row, index) => <tr key={`${row.drillhole_id}-${row.element}-${index}`}><td className="px-4 py-3">{row.project_id}</td><td className="px-4 py-3">{row.hole_id}</td><td className="px-4 py-3 font-medium">{row.element}</td><td className="px-4 py-3">{row.average_grade == null ? '—' : Number(row.average_grade).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td><td className="px-4 py-3">{row.units || '—'}</td></tr>)}</tbody></table> : <p className="p-5 text-sm text-slate-500">Add assay results to see grade summaries.</p>}</div>
        </>
      )}
    </section>
  );
}

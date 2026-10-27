import { useState } from 'react';
import { Save, X } from 'lucide-react';

export default function SampleForm({ sample, drillholes = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    drillhole_id: sample?.drillhole_id || '',
    sample_code: sample?.sample_code || '',
    sample_type: sample?.sample_type || '',
    from_depth: sample?.from_depth ?? '',
    to_depth: sample?.to_depth ?? '',
    date_collected: sample?.date_collected?.split('T')[0] || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!form.drillhole_id || !form.sample_code.trim() || !form.sample_type.trim()) return setError('Fill in the drillhole, sample code, and sample type.');
    if (!Number.isFinite(Number(form.from_depth)) || !Number.isFinite(Number(form.to_depth)) || Number(form.from_depth) < 0 || Number(form.to_depth) <= Number(form.from_depth)) return setError('Depths must be valid numbers, and to depth must be greater than from depth.');
    setSaving(true);
    try { await onSubmit({ ...form, drillhole_id: Number(form.drillhole_id), from_depth: Number(form.from_depth), to_depth: Number(form.to_depth), date_collected: form.date_collected || null }); }
    catch (err) { setError(err.message || 'Could not save sample.'); }
    finally { setSaving(false); }
  };

  const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100';
  return <form onSubmit={submit} className="space-y-4">
    <label className="block text-sm font-semibold text-slate-700">Drillhole *<select name="drillhole_id" value={form.drillhole_id} onChange={set} required className={input}><option value="">Choose a drillhole…</option>{drillholes.map((row) => <option key={row.drillhole_id} value={row.drillhole_id}>{row.hole_id} (#{row.drillhole_id})</option>)}</select></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold text-slate-700">Sample code *<input name="sample_code" value={form.sample_code} onChange={set} required maxLength={100} placeholder="e.g. DH-001-025" className={input} /></label>
      <label className="block text-sm font-semibold text-slate-700">Sample type *<input name="sample_type" value={form.sample_type} onChange={set} required placeholder="Rock, soil, core…" className={input} /></label>
      <label className="block text-sm font-semibold text-slate-700">From depth (m) *<input name="from_depth" type="number" step="any" min="0" value={form.from_depth} onChange={set} required className={input} /></label>
      <label className="block text-sm font-semibold text-slate-700">To depth (m) *<input name="to_depth" type="number" step="any" min="0" value={form.to_depth} onChange={set} required className={input} /></label>
      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Date collected<input name="date_collected" type="date" value={form.date_collected} onChange={set} className={input} /></label>
    </div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex gap-3 border-t border-slate-200 pt-4"><button disabled={saving} type="submit" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"><Save size={18} />{saving ? 'Saving…' : sample ? 'Update sample' : 'Create sample'}</button><button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"><X size={18} />Cancel</button></div>
  </form>;
}

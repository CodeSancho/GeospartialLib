import { useEffect, useState } from 'react';
import { Download, Edit2, FileUp, Plus, Trash2, X } from 'lucide-react';
import { apiRequest, downloadCsv, parseCsv } from '../lib/api';

const modules = {
  assays: {
    title: 'Assay results', path: '/assayresults', id: 'result_id', importCsv: true,
    fields: [
      { name: 'sample_id', label: 'Sample', type: 'sample', required: true },
      { name: 'element', label: 'Element', required: true, placeholder: 'Au' },
      { name: 'value', label: 'Value', type: 'number', step: 'any' },
      { name: 'units', label: 'Units', placeholder: 'g/t' },
      { name: 'detection_limit', label: 'Detection limit', type: 'number', step: 'any' },
      { name: 'lab_name', label: 'Laboratory' },
      { name: 'analysis_date', label: 'Analysis date', type: 'date' },
    ],
    columns: ['result_id', 'sample_code', 'sample_id', 'element', 'value', 'units', 'detection_limit', 'lab_name', 'analysis_date'],
  },
  geology: {
    title: 'Geology logs', path: '/geologyLogs', id: 'log_id',
    fields: [
      { name: 'sample_id', label: 'Sample', type: 'sample', required: true },
      { name: 'lithology', label: 'Lithology', required: true, placeholder: 'Sandstone' },
      { name: 'alteration', label: 'Alteration' },
      { name: 'structure', label: 'Structure' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: ['log_id', 'sample_code', 'sample_id', 'from_depth', 'to_depth', 'lithology', 'alteration', 'structure', 'notes'],
  },
};

function FormField({ field, value, onChange, samples }) {
  const base = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100';
  if (field.type === 'sample') return (
    <select required={field.required} value={value} onChange={onChange} className={base}>
      <option value="">Choose sample…</option>
      {samples.map((sample) => <option key={sample.sample_id} value={sample.sample_id}>{sample.sample_code || `Sample ${sample.sample_id}`} (#{sample.sample_id})</option>)}
    </select>
  );
  if (field.type === 'textarea') return <textarea value={value} onChange={onChange} rows={3} className={base} />;
  return <input required={field.required} type={field.type || 'text'} step={field.step} min={field.type === 'number' ? '0' : undefined} value={value} onChange={onChange} placeholder={field.placeholder} className={base} />;
}

export default function RecordsView({ token, kind }) {
  const config = modules[kind];
  const [rows, setRows] = useState([]);
  const [samples, setSamples] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [records, sampleRows] = await Promise.all([
        apiRequest(config.path, { token }), apiRequest('/samples', { token }),
      ]);
      setRows(Array.isArray(records) ? records : []);
      setSamples(Array.isArray(sampleRows) ? sampleRows : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [token, kind]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const payload = { ...form, sample_id: Number(form.sample_id) };
    for (const field of config.fields) if (field.type === 'number' && payload[field.name] === '') payload[field.name] = null;
    try {
      await apiRequest(editingId ? `${config.path}/${editingId}` : config.path, {
        token, method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(payload),
      });
      setForm({}); setNotice(`${config.title} record ${editingId ? 'updated' : 'added'}.`); setEditingId(null); await refresh();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${config.title.toLowerCase()} record #${row[config.id]}?`)) return;
    setError('');
    try {
      await apiRequest(`${config.path}/${row[config.id]}`, { token, method: 'DELETE' });
      setRows((current) => current.filter((item) => item[config.id] !== row[config.id]));
      if (editingId === row[config.id]) { setEditingId(null); setForm({}); }
    } catch (err) { setError(err.message); }
  };

  const edit = (row) => {
    setEditingId(row[config.id]);
    setError(''); setNotice('');
    setForm(Object.fromEntries(config.fields.map((field) => [field.name,
      field.name === 'analysis_date' ? row[field.name]?.split('T')[0] || '' : row[field.name] ?? '',
    ])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const importFile = async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setError(''); setNotice('');
    try {
      const parsed = parseCsv(await file.text());
      const results = parsed.map((row) => ({
        sample_id: row.sample_id, element: row.element, value: row.value, units: row.units,
        detection_limit: row.detection_limit, lab_name: row.lab_name, analysis_date: row.analysis_date,
      }));
      const response = await apiRequest(`${config.path}/bulk`, { token, method: 'POST', body: JSON.stringify({ results }) });
      setNotice(response.message); await refresh();
    } catch (err) { setError(err.message); }
  };

  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 text-slate-900 shadow-xl md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Data management</p><h2 className="mt-1 text-2xl font-bold">{config.title}</h2></div>
        <div className="flex flex-wrap gap-2">
          {config.importCsv && <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><FileUp size={16} /> Import CSV<input type="file" accept=".csv,text/csv" className="sr-only" onChange={importFile} /></label>}
          <button onClick={() => downloadCsv(`${kind}.csv`, rows)} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"><Download size={16} /> Export CSV</button>
        </div>
      </header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      <form onSubmit={submit} className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.fields.map((field) => <label key={field.name} className="text-sm font-medium text-slate-700">{field.label}{field.required && <span className="text-red-600"> *</span>}
          <FormField field={field} samples={samples} value={form[field.name] || ''} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} />
        </label>)}
        <div className="flex items-end gap-2"><button disabled={saving || (config.fields.some((field) => field.type === 'sample') && !samples.length)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{editingId ? <Edit2 size={17} /> : <Plus size={18} />}{saving ? 'Saving…' : editingId ? 'Update record' : 'Add record'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm({}); }} aria-label="Cancel edit" className="rounded-lg border border-slate-300 p-2.5 text-slate-600 hover:bg-white"><X size={18} /></button>}</div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        {loading ? <p className="p-8 text-center text-slate-500">Loading records…</p> : rows.length === 0 ? <p className="p-8 text-center text-slate-500">No records yet. Add one above or import a CSV when available.</p> : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50"><tr>{config.columns.map((column) => <th key={column} className="px-3 py-3 text-left font-semibold capitalize text-slate-600">{column.replaceAll('_', ' ')}</th>)}<th className="px-3 py-3" /></tr></thead>
            <tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row[config.id]} className="hover:bg-teal-50/50">{config.columns.map((column) => <td key={column} className="max-w-64 px-3 py-3 text-slate-700">{row[column] == null ? '—' : String(row[column])}</td>)}<td className="whitespace-nowrap px-3 py-2 text-right"><button onClick={() => edit(row)} aria-label={`Edit record ${row[config.id]}`} className="rounded p-2 text-slate-600 hover:bg-slate-100"><Edit2 size={16} /></button><button onClick={() => remove(row)} aria-label={`Delete record ${row[config.id]}`} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button></td></tr>)}</tbody>
          </table>
        )}
      </div>
      {config.importCsv && <p className="text-xs text-slate-500">CSV import requires headers: <code>sample_id, element</code>; optional columns: <code>value, units, detection_limit, lab_name, analysis_date</code>. Each sample ID must already exist.</p>}
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { apiRequest } from '../lib/api';

function asGeometry(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return null; }
}

function pairsIn(coords, output = []) {
  if (!Array.isArray(coords)) return output;
  if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') output.push(coords);
  else coords.forEach((part) => pairsIn(part, output));
  return output;
}

export default function SpatialMapView({ token }) {
  const [projects, setProjects] = useState([]);
  const [drillholes, setDrillholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const [projectRows, holeRows] = await Promise.all([
        apiRequest('/projects', { token }), apiRequest('/drillholes', { token }),
      ]);
      setProjects(Array.isArray(projectRows) ? projectRows : []);
      setDrillholes(Array.isArray(holeRows) ? holeRows : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [token]);

  const geometryFeatures = useMemo(() => [
    ...projects.map((project) => ({ kind: 'project', label: project.name, geometry: asGeometry(project.geom) })),
    ...drillholes.map((hole) => ({ kind: 'drillhole', label: hole.hole_id, geometry: asGeometry(hole.geojson) })),
  ].filter((feature) => feature.geometry?.coordinates), [projects, drillholes]);

  const points = useMemo(() => geometryFeatures.flatMap((feature) => pairsIn(feature.geometry.coordinates)), [geometryFeatures]);
  const extent = useMemo(() => {
    if (!points.length) return null;
    const xs = points.map((point) => point[0]); const ys = points.map((point) => point[1]);
    const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
    const xPad = Math.max((maxX - minX) * 0.08, 0.0005); const yPad = Math.max((maxY - minY) * 0.08, 0.0005);
    return { minX: minX - xPad, maxX: maxX + xPad, minY: minY - yPad, maxY: maxY + yPad };
  }, [points]);

  const project = (point) => {
    const x = 30 + ((point[0] - extent.minX) / (extent.maxX - extent.minX)) * 940;
    const y = 30 + ((extent.maxY - point[1]) / (extent.maxY - extent.minY)) * 540;
    return `${x},${y}`;
  };

  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 text-slate-900 shadow-xl md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Spatial overview</p><h2 className="mt-1 text-2xl font-bold">Project map</h2><p className="mt-1 text-sm text-slate-600">Plots stored PostGIS geometries in longitude/latitude (SRID 4326).</p></div>
        <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-16 text-center text-slate-500">Loading spatial data…</p> : !extent ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-600"><MapPin className="mx-auto mb-3 text-teal-700" /><p className="font-semibold">No mappable geometries yet</p><p className="mt-1 text-sm">Add GeoJSON geometry to a project or use WGS84 / EPSG:4326 for drillhole coordinates.</p></div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <svg role="img" aria-label="Map of project and drillhole geometries" viewBox="0 0 1000 600" className="block h-[420px] w-full md:h-[560px]">
              <defs><pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#dbe5e7" strokeWidth="1" /></pattern></defs>
              <rect width="1000" height="600" fill="#f2f7f6" /><rect width="1000" height="600" fill="url(#map-grid)" />
              {geometryFeatures.map((feature, index) => {
                const coordinates = feature.geometry.coordinates;
                const shape = feature.geometry.type;
                if (shape === 'Point') {
                  return <g key={`${feature.kind}-${index}`}><circle cx={project(coordinates).split(',')[0]} cy={project(coordinates).split(',')[1]} r="7" fill="#0f766e" stroke="white" strokeWidth="3"><title>{feature.label}</title></circle></g>;
                }
                if (shape === 'MultiPoint') {
                  return <g key={`${feature.kind}-${index}`}>{coordinates.map((point, pointIndex) => { const [cx, cy] = project(point).split(','); return <circle key={pointIndex} cx={cx} cy={cy} r="6" fill="#0f766e" stroke="white" strokeWidth="2"><title>{feature.label}</title></circle>; })}</g>;
                }
                if (['LineString', 'MultiLineString'].includes(shape)) {
                  const lines = shape === 'LineString' ? [coordinates] : coordinates;
                  return <g key={`${feature.kind}-${index}`}>{lines.map((line, lineIndex) => <polyline key={lineIndex} points={line.map(project).join(' ')} fill="none" stroke="#0f766e" strokeWidth="3"><title>{feature.label}</title></polyline>)}</g>;
                }
                if (feature.kind === 'project' && ['Polygon', 'MultiPolygon'].includes(shape)) {
                  const rings = shape === 'Polygon' ? coordinates : coordinates.flat(1);
                  return <g key={`${feature.kind}-${index}`}>{rings.map((ring, ringIndex) => <polygon key={ringIndex} points={ring.map(project).join(' ')} fill="#14b8a6" fillOpacity="0.15" stroke="#0f766e" strokeWidth="2"><title>{feature.label}</title></polygon>)}</g>;
                }
                return null;
              })}
              {geometryFeatures.filter((feature) => feature.kind === 'drillhole' && feature.geometry.type !== 'Point').flatMap((feature, index) => pairsIn(feature.geometry.coordinates).map((point, pointIndex) => {
                const [cx, cy] = project(point).split(',');
                return <circle key={`${index}-${pointIndex}`} cx={cx} cy={cy} r="5" fill="#ea580c" stroke="white" strokeWidth="2"><title>{feature.label}</title></circle>;
              }))}
            </svg>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-slate-700"><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-teal-700" /> Drillholes</span><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded bg-teal-500/30 ring-1 ring-teal-700" /> Project areas</span><span className="text-slate-500">{projects.length} projects · {drillholes.length} drillholes · {points.length} coordinate points</span></div>
        </>
      )}
    </section>
  );
}

import { Activity, BarChart3, Beaker, Database, FileText, Globe2, Layers, LogOut, MapPin, Menu, X } from 'lucide-react';
import { useAuth } from '../context/authContext';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: BarChart3 },
  { id: 'map', label: 'Spatial map', icon: Globe2 },
  { id: 'projects', label: 'Projects', icon: Layers },
  { id: 'drillholes', label: 'Drillholes', icon: MapPin },
  { id: 'samples', label: 'Samples', icon: Database },
  { id: 'assays', label: 'Assay results', icon: Beaker },
  { id: 'geology', label: 'Geology logs', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: Activity },
];

export function Sidebar({ isOpen, setIsOpen, currentView, setCurrentView }) {
  const { logout } = useAuth();
  return (
    <>
      {isOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-teal-950 to-teal-800 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20'}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          {isOpen && <div><h1 className="font-bold">Mining DMS</h1><p className="text-xs text-teal-200">Geospatial data</p></div>}
          <button aria-label="Toggle navigation" onClick={() => setIsOpen((open) => !open)} className="rounded-lg p-2 hover:bg-white/10">{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setCurrentView(id); if (window.innerWidth < 768) setIsOpen(false); }} aria-current={currentView === id ? 'page' : undefined} title={!isOpen ? label : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${currentView === id ? 'bg-white font-semibold text-teal-900' : 'text-white/90 hover:bg-white/10'}`}><Icon size={19} />{isOpen && <span>{label}</span>}</button>)}
        </nav>
        <div className="border-t border-white/10 p-3"><button onClick={() => { logout(); window.location.assign('/login'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/90 hover:bg-red-700"><LogOut size={19} />{isOpen && <span>Sign out</span>}</button></div>
      </aside>
    </>
  );
}

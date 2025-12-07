import React from 'react';
import { 
  Menu, X, BarChart3, Layers, MapPin, 
  Database, Beaker, FileText, Activity, 
  Settings, LogOut 
} from 'lucide-react';

export const Sidebar = ({ isOpen, setIsOpen, currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Main', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'drillholes', label: 'Drillholes', icon: MapPin },
    { id: 'samples', label: 'Samples', icon: Database },
    { id: 'assays', label: 'Assays', icon: Beaker },
    { id: 'geology', label: 'Geology Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isOpen ? 'w-64' : 'lg:w-20'}
        bg-gradient-to-b from-teal-900 to-teal-800
        text-white transition-all duration-300 flex flex-col shadow-2xl
      `}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-teal-700">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Layers className="text-teal-900" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold">Mining DMS</h1>
                <p className="text-xs text-teal-200">Data Management</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-white text-teal-900 shadow-lg transform scale-105' 
                  : 'hover:bg-teal-700 text-white'
              }`}
            >
              <item.icon size={20} />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-teal-700">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-teal-700 transition-colors">
            <Settings size={20} />
            {isOpen && <span>Settings</span>}
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition-colors mt-2"
          >
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};
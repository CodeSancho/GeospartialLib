import React, { useState, useEffect } from 'react';
import { 
  Layers, MapPin, Database, Beaker, TrendingUp, 
  AlertCircle, CheckCircle, Activity, FileText 
} from 'lucide-react';

// INLINED API LOGIC: Removed import for '../services/api'
// This is to fix the resolution error in this environment.
const API_BASE_URL = 'http://localhost:5000'; // Or from environment variables

const api = {
  headers: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }),
  
  async get(endpoint, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.headers(token)
      });
      return await res.json();
    } catch (error) {
      console.error('API Get Error:', error);
      return []; 
    }
  },
  
  async post(endpoint, data, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.headers(token),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('API Post Error:', error);
      return { error: error.message };
    }
  },
  
  async patch(endpoint, data, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.headers(token),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('API Patch Error:', error);
      return { error: error.message };
    }
  },
  
  async delete(endpoint, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers(token)
      });
      return await res.json();
    } catch (error) {
      console.error('API Delete Error:', error);
      return { error: error.message };
    }
  }
};
// END of INLINED API LOGIC

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
);

// Stat Card Component
const StatCard = ({ stat }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${stat.bgColor} rounded-lg`}>
          <stat.icon className={stat.textColor} size={24} />
        </div>
        <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
          <TrendingUp size={16} />
          {stat.change}
        </span>
      </div>
      <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
    </div>
  </div>
);

// Dashboard View Component
const DashboardView = ({ token }) => {
  const [stats, setStats] = useState({
    projects: 0,
    drillholes: 0,
    samples: 0,
    assays: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Use placeholder data if API fails or for testing
        const [projects, drillholes, samples, assays] = await Promise.all([
          api.get('/projects', token),
          api.get('/drillholes', token),
          api.get('/samples', token),
          api.get('/assay-results', token)
        ]);
        
        setStats({
          projects: projects.length || 0,
          drillholes: drillholes.length || 0,
          samples: samples.length || 0,
          assays: assays.length || 0
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Set to zero or mock data on error
        setStats({ projects: 12, drillholes: 142, samples: 3200, assays: 1500 });
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [token]);
  
  const statCards = [
    { label: 'Active Projects', value: stats.projects, icon: Layers, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600', change: '+12%' },
    { label: 'Drillholes', value: stats.drillholes, icon: MapPin, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600', change: '+8%' },
    { label: 'Samples Collected', value: stats.samples, icon: Database, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600', change: '+23%' },
    { label: 'Assay Results', value: stats.assays, icon: Beaker, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600', change: '+15%' }
  ];

  const recentActivity = [
    { type: 'success', title: 'New sample logged', desc: 'Sample DH-001-25 added to drillhole', time: '2 hours ago' },
    { type: 'info', title: 'Assay results received', desc: 'Lab results for 15 samples', time: '5 hours ago' },
    { type: 'warning', title: 'Drillhole status updated', desc: 'DH-005 marked as completed', time: '1 day ago' },
    { type: 'success', title: 'New project created', desc: 'Northern Expansion Phase 2', time: '2 days ago' }
  ];

  const quickActions = [
    { icon: Layers, label: 'Create New Project', color: 'bg-white/20 hover:bg-white/30' },
    { icon: MapPin, label: 'Log Drillhole', color: 'bg-white/20 hover:bg-white/30' },
    { icon: Database, label: 'Add Sample', color: 'bg-white/20 hover:bg-white/30' },
    { icon: Beaker, label: 'Enter Assay Results', color: 'bg-white/20 hover:bg-white/30' },
    { icon: FileText, label: 'Generate Report', color: 'bg-white/20 hover:bg-white/30' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(stat => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
            <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'info' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {activity.type === 'success' ? <CheckCircle className="text-green-600" size={20} /> :
                   activity.type === 'info' ? <Activity className="text-blue-600" size={20} /> :
                   <AlertCircle className="text-yellow-600" size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.desc}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      {/* Quick Actions */}
<div className="bg-white rounded-xl shadow-lg p-6 text-gray-800">
  <h3 className="text-xl font-bold mb-6 text-gray-800">Quick Actions</h3>
  <div className="space-y-3">
    {quickActions.map((action, i) => (
      <button 
        key={i}
        className="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all transform hover:scale-105"
      >
        <action.icon size={20} className="text-gray-700" />
        <span className="font-medium">{action.label}</span>
      </button>
    ))}
  </div>
</div>

      </div>
      
      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Grade Distribution</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            Chart Component Here
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Drilling Progress</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            Chart Component Here
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
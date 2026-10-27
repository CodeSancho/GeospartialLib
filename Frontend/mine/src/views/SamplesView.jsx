import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import Modal from '../components/Modal';
import SampleForm from '../components/SampleForm';
import { API_BASE_URL, downloadCsv } from '../lib/api';

const api = {
  headers: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }),
  async get(endpoint, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers: this.headers(token) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (error) {
      console.error('API Get Error:', error);
      throw error;
    }
  },
  async post(endpoint, body, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.headers(token),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (error) {
      console.error('API Post Error:', error);
      return null;
    }
  },
  async patch(endpoint, body, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.headers(token),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (error) {
      console.error('API Patch Error:', error);
      return null;
    }
  },
  async delete(endpoint, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers(token),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (error) {
      console.error('API Delete Error:', error);
      return null;
    }
  }
};

const SamplesView = ({ token }) => {
  const [samples, setSamples] = useState([]);
  const [drillholes, setDrillholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => { loadSamples(); }, [token]);

  const loadSamples = async () => {
    setLoading(true);
    try {
      const [data, holes] = await Promise.all([api.get('/samples', token), api.get('/drillholes', token)]);
      setSamples(Array.isArray(data) ? data : []);
      setDrillholes(Array.isArray(holes) ? holes : []);
    } catch {
      showNotification('Failed to load samples', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreate = async (formData) => {
    const result = await api.post('/samples', formData, token);
    if (result?.sample) {
      setSamples(prev => [...prev, result.sample]);
      showNotification('Sample created successfully', 'success');
      setIsModalOpen(false);
    } else showNotification('Failed to create sample', 'error');
  };

  const handleUpdate = async (formData) => {
    const result = await api.patch(`/samples/${selectedSample.sample_id}`, formData, token);
    if (result?.sample) {
      setSamples(prev => prev.map(s => s.sample_id === selectedSample.sample_id ? result.sample : s));
      showNotification('Sample updated successfully', 'success');
      setIsModalOpen(false);
      setSelectedSample(null);
    } else showNotification('Failed to update sample', 'error');
  };

  const handleDelete = async (sample) => {
    if (!window.confirm(`Delete sample ${sample.sample_code || sample.sample_id}?`)) return;
    try {
      const result = await api.delete(`/samples/${sample.sample_id}`, token);
      if (result?.deleted) {
        setSamples(prev => prev.filter(s => s.sample_id !== sample.sample_id));
        showNotification('Sample deleted successfully', 'success');
      }
    } catch (error) { showNotification(error.message || 'Failed to delete sample', 'error'); }
  };

  const handleEditClick = (sample) => {
    setSelectedSample(sample);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center py-12">Loading samples...</div>;

  return (
    <div className="p-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <button onClick={() => { setSelectedSample(null); setIsModalOpen(true); }}
        className="mb-4 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold">
        + Add Sample
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSample ? 'Edit Sample' : 'Create Sample'} size="lg">
        <SampleForm sample={selectedSample} drillholes={drillholes} onSubmit={selectedSample ? handleUpdate : handleCreate} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <button onClick={() => downloadCsv('samples.csv', samples)} disabled={!samples.length} className="mb-4 ml-2 inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white px-4 py-3 font-semibold text-teal-900 disabled:opacity-50"><Download size={18} />Export CSV</button>

      {samples.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase">Sample ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase">Drillhole ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase">From Depth</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase">To Depth</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase">Sample Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase">Date Collected</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-teal-800 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {samples.map(s => (
                  <tr key={s.sample_id} className="hover:bg-teal-50 transition-colors">
                    <td className="px-6 py-4">{s.sample_id}</td>
                    <td className="px-6 py-4">{s.drillhole_id}</td>
                    <td className="px-6 py-4">{s.sample_type}</td>
                    <td className="px-6 py-4">{s.from_depth}</td>
                    <td className="px-6 py-4">{s.to_depth}</td>
                    <td className="px-6 py-4">{s.sample_code}</td>
                    <td className="px-6 py-4">{s.date_collected?.split('T')[0]}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEditClick(s)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(s)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      <button onClick={() => alert(JSON.stringify(s, null, 2))} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-semibold">No samples found</p>
          <p className="text-sm">Add samples to your drillholes to see them here</p>
        </div>
      )}
    </div>
  );
};

export default SamplesView;

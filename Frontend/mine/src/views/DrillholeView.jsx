import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';
import DrillholeForm from '../components/DrillholeForm';

const API_BASE_URL = 'http://localhost:5000';

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

  async post(endpoint, body, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.headers(token),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create drillhole');
      return await res.json();
    } catch (error) {
      console.error('API Post Error:', error);
      throw error;
    }
  },

  async patch(endpoint, body, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.headers(token),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update drillhole');
      return await res.json();
    } catch (error) {
      console.error('API Patch Error:', error);
      throw error;
    }
  },

  async delete(endpoint, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers(token),
      });
      if (!res.ok) throw new Error('Failed to delete drillhole');
      return await res.json();
    } catch (error) {
      console.error('API Delete Error:', error);
      throw error;
    }
  }
};

const DrillholesView = ({ token }) => {
  const [drillholes, setDrillholes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Selected drillhole
  const [selectedDrillhole, setSelectedDrillhole] = useState(null);
  
  // Notification
  const [notification, setNotification] = useState(null);

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [drillholesData, projectsData] = await Promise.all([
        api.get('/drillholes', token),
        api.get('/projects', token)
      ]);
      
      const drillholesList = Array.isArray(drillholesData) ? drillholesData : [];
      const projectsList = Array.isArray(projectsData) ? projectsData : [];
      
      setDrillholes(drillholesList);
      setProjects(projectsList);
    } catch (error) {
      showNotification('Failed to load drillholes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // NOTIFICATION
  // -------------------------
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // -------------------------
  // CREATE DRILLHOLE
  // -------------------------
  const handleCreate = async (formData) => {
    try {
      const result = await api.post('/drillholes', formData, token);
      
      if (result && result.drillhole) {
        setDrillholes(prev => [...prev, result.drillhole]);
        showNotification('✅ Drillhole created successfully!', 'success');
        setIsModalOpen(false);
      }
    } catch (error) {
      showNotification('❌ Failed to create drillhole', 'error');
    }
  };

  // -------------------------
  // EDIT DRILLHOLE
  // -------------------------
  const handleEditClick = (drillhole) => {
    setSelectedDrillhole(drillhole);
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData) => {
    try {
      const result = await api.patch(`/drillholes/${selectedDrillhole.drillhole_id}`, formData, token);
      
      if (result && result.drillhole) {
        setDrillholes(prev => 
          prev.map(d => d.drillhole_id === selectedDrillhole.drillhole_id ? result.drillhole : d)
        );
        showNotification('✅ Drillhole updated successfully!', 'success');
        setIsModalOpen(false);
        setSelectedDrillhole(null);
      }
    } catch (error) {
      showNotification('❌ Failed to update drillhole', 'error');
    }
  };

  // -------------------------
  // DELETE DRILLHOLE
  // -------------------------
  const handleDeleteClick = (drillhole) => {
    setSelectedDrillhole(drillhole);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/drillholes/${selectedDrillhole.drillhole_id}`, token);
      setDrillholes(prev => prev.filter(d => d.drillhole_id !== selectedDrillhole.drillhole_id));
      showNotification('✅ Drillhole deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setSelectedDrillhole(null);
    } catch (error) {
      showNotification('❌ Failed to delete drillhole', 'error');
    }
  };

  // -------------------------
  // VIEW DRILLHOLE DETAILS
  // -------------------------
  const handleViewClick = (drillhole) => {
    setSelectedDrillhole(drillhole);
    setIsViewModalOpen(true);
  };

  // -------------------------
  // CLOSE MODALS
  // -------------------------
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDrillhole(null);
  };

  // -------------------------
  // GET PROJECT NAME
  // -------------------------
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.project_id === projectId);
    return project ? project.name : `Project ${projectId}`;
  };

  // -------------------------
  // RENDER
  // -------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="ml-4 text-gray-600">Loading drillholes...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      
      {/* NOTIFICATION */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* CREATE DRILLHOLE BUTTON */}
      <button
        onClick={() => {
          setSelectedDrillhole(null);
          setIsModalOpen(true);
        }}
        className="mb-4 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105"
      >
        <MapPin size={20} />
        Add New Drillhole
      </button>

      {/* CREATE/EDIT DRILLHOLE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedDrillhole ? 'Edit Drillhole' : 'Create New Drillhole'}
        size="lg"
      >
        <DrillholeForm
          drillhole={selectedDrillhole}
          projects={projects}
          onSubmit={selectedDrillhole ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
          token={token}
        />
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Drillhole"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-gray-800">
              Are you sure you want to delete drillhole <strong>{selectedDrillhole?.hole_id}</strong>?
              This action cannot be undone.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW DRILLHOLE DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Drillhole Details"
        size="lg"
      >
        {selectedDrillhole && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Hole ID</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.hole_id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Project</label>
                <p className="text-lg text-gray-800">{getProjectName(selectedDrillhole.project_id)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Easting</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.easting?.toFixed(2) || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Northing</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.northing?.toFixed(2) || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Elevation</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.elevation?.toFixed(2) || '-'} m</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Max Depth</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.max_depth || '-'} m</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Azimuth</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.azimuth || '-'}°</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Dip</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.dip || '-'}°</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Coordinate System</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.coordinate_system || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <p className="text-lg text-gray-800">{selectedDrillhole.status || 'In Progress'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Start Date</label>
                <p className="text-lg text-gray-800">
                  {selectedDrillhole.start_date 
                    ? new Date(selectedDrillhole.start_date).toLocaleDateString() 
                    : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">End Date</label>
                <p className="text-lg text-gray-800">
                  {selectedDrillhole.end_date 
                    ? new Date(selectedDrillhole.end_date).toLocaleDateString() 
                    : 'Not set'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsViewModalOpen(false)}
              className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* DRILLHOLES TABLE - WITH ALL COLUMNS */}
      {drillholes.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Hole ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Elevation</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Dip</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Azimuth</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Coordinate System</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Easting</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Northing</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Max Depth (m)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-teal-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {drillholes.map(h => (
                  <tr key={h.drillhole_id} className="hover:bg-teal-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                      {h.hole_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {getProjectName(h.project_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.elevation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.dip || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.azimuth || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.coordinate_system || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.start_date ? new Date(h.start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.end_date ? new Date(h.end_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.easting?.toFixed(2) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.northing?.toFixed(2) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {h.max_depth || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        h.status === 'completed' ? 'bg-green-100 text-green-800' :
                        h.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        h.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {h.status === 'completed' ? 'Completed' :
                         h.status === 'in_progress' ? 'In Progress' :
                         h.status === 'planned' ? 'Planned' :
                         h.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleViewClick(h)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(h)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Drillhole"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(h)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Drillhole"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold">No drillholes found</p>
          <p className="text-sm">Add drillholes to your projects to see them here</p>
        </div>
      )}
    </div>
  );
};

export default DrillholesView;
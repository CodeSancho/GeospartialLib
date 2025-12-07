import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Layers, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from "../components/Modal";
import ProjectForm from "../components/ProjectForm";

const API_BASE_URL = 'http://localhost:5000';

const api = {
  headers: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }),

  async get(endpoint, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.headers(token),
      });
      return await res.json();
    } catch (error) {
      console.error('API Get Error:', error);
      return null;
    }
  },

  async post(endpoint, body, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: this.headers(token),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return await res.json();
    } catch (error) {
      console.error('API Post Error:', error);
      throw error;
    }
  },

  async patch(endpoint, body, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: this.headers(token),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update project');
      return await res.json();
    } catch (error) {
      console.error('API Patch Error:', error);
      throw error;
    }
  },

  async delete(endpoint, token) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: this.headers(token),
      });
      if (!res.ok) throw new Error('Failed to delete project');
      return await res.json();
    } catch (error) {
      console.error('API Delete Error:', error);
      throw error;
    }
  }
};

const ProjectsView = ({ token }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Selected project for edit/delete/view
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Notification
  const [notification, setNotification] = useState(null);

  // -------------------------
  // LOAD PROJECTS
  // -------------------------
  useEffect(() => {
    loadProjects();
  }, [token]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.get('/projects', token);
      const list = Array.isArray(data) ? data : Array.isArray(data?.projects) ? data.projects : [];
      setProjects(list);
    } catch (error) {
      showNotification('Failed to load projects', 'error');
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
  // CREATE PROJECT
  // -------------------------
  const handleCreate = async (formData) => {
    try {
      const result = await api.post('/projects', formData, token);
      
      if (result && result.project) {
        setProjects(prev => [...prev, result.project]);
        showNotification('✅ Project created successfully!', 'success');
        setIsModalOpen(false);
      }
    } catch (error) {
      showNotification('❌ Failed to create project', 'error');
    }
  };

  // -------------------------
  // EDIT PROJECT
  // -------------------------
  const handleEditClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData) => {
    try {
      const result = await api.patch(`/projects/${selectedProject.project_id}`, formData, token);
      
      if (result && result.project) {
        setProjects(prev => 
          prev.map(p => p.project_id === selectedProject.project_id ? result.project : p)
        );
        showNotification('✅ Project updated successfully!', 'success');
        setIsModalOpen(false);
        setSelectedProject(null);
      }
    } catch (error) {
      showNotification('❌ Failed to update project', 'error');
    }
  };

  // -------------------------
  // DELETE PROJECT
  // -------------------------
  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${selectedProject.project_id}`, token);
      setProjects(prev => prev.filter(p => p.project_id !== selectedProject.project_id));
      showNotification('✅ Project deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      showNotification('❌ Failed to delete project', 'error');
    }
  };

  // -------------------------
  // VIEW PROJECT DETAILS
  // -------------------------
  const handleViewClick = (project) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  // -------------------------
  // CLOSE MODALS
  // -------------------------
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // -------------------------
  // RENDER
  // -------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="ml-4 text-gray-600">Loading projects...</p>
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

      {/* CREATE PROJECT BUTTON */}
      <button
        onClick={() => {
          setSelectedProject(null);
          setIsModalOpen(true);
        }}
        className="mb-4 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105"
      >
        <Layers size={20} />
        Add New Project
      </button>

      {/* CREATE/EDIT PROJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProject ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        <ProjectForm
          project={selectedProject}
          onSubmit={selectedProject ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-gray-800">
              Are you sure you want to delete <strong>{selectedProject?.name}</strong>?
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

      {/* VIEW PROJECT DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Project Details"
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Project ID</label>
                <p className="text-lg text-gray-800">{selectedProject.project_id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Project Name</label>
                <p className="text-lg text-gray-800">{selectedProject.name}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Location</label>
              <p className="text-lg text-gray-800">{selectedProject.location}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Description</label>
              <p className="text-lg text-gray-800">{selectedProject.description || 'No description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Start Date</label>
                <p className="text-lg text-gray-800">
                  {selectedProject.start_date 
                    ? new Date(selectedProject.start_date).toLocaleDateString() 
                    : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">End Date</label>
                <p className="text-lg text-gray-800">
                  {selectedProject.end_date 
                    ? new Date(selectedProject.end_date).toLocaleDateString() 
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

      {/* PROJECTS TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-teal-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-teal-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.project_id} className="hover:bg-teal-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono">
                    {project.project_id}
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                    {project.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {project.location}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString()
                      : '-'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button 
                      onClick={() => handleViewClick(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEditClick(project)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                      title="Edit Project"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(project)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {projects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Layers size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold">No projects found</p>
              <p className="text-sm">Create your first project to get started</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProjectsView;
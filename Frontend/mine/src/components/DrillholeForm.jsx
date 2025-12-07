import React, { useState, useEffect } from 'react';
import { Input, Select } from "./Input";
import Button from "./Button";
import { Save, X } from 'lucide-react';

const DrillholeForm = ({ drillhole, projects = [], onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    project_id: drillhole?.project_id || '',
    hole_id: drillhole?.hole_id || '',
    easting: drillhole?.easting || '',
    northing: drillhole?.northing || '',
    elevation: drillhole?.elevation || '',
    max_depth: drillhole?.max_depth || '',
    azimuth: drillhole?.azimuth || '',
    dip: drillhole?.dip || '',
    coordinate_system: drillhole?.coordinate_system || '',
    status: drillhole?.status || 'planned',
    start_date: drillhole?.start_date ? drillhole.start_date.split('T')[0] : '',
    end_date: drillhole?.end_date ? drillhole.end_date.split('T')[0] : ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.hole_id.trim()) newErrors.hole_id = 'Hole ID is required';
    if (!formData.easting) newErrors.easting = 'Easting is required';
    if (!formData.northing) newErrors.northing = 'Northing is required';
    
    // Validate numeric ranges
    if (formData.azimuth && (formData.azimuth < 0 || formData.azimuth > 360)) {
      newErrors.azimuth = 'Azimuth must be between 0-360°';
    }
    if (formData.dip && (formData.dip < -90 || formData.dip > 90)) {
      newErrors.dip = 'Dip must be between -90 to +90°';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Project Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          name="project_id"
          value={formData.project_id}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 bg-white ${
            errors.project_id ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="" className="text-gray-500">Select a project...</option>
          {projects.map(p => (
            <option key={p.project_id} value={p.project_id} className="text-gray-800">
              {p.name}
            </option>
          ))}
        </select>
        {errors.project_id && <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>}
      </div>

      {/* Hole ID */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Hole ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="hole_id"
          value={formData.hole_id}
          onChange={handleChange}
          placeholder="e.g., DH-001"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400 ${
            errors.hole_id ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.hole_id && <p className="text-red-500 text-sm mt-1">{errors.hole_id}</p>}
      </div>

      {/* Coordinates Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Easting <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="easting"
            step="0.01"
            value={formData.easting}
            onChange={handleChange}
            placeholder="450123.45"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400 ${
              errors.easting ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.easting && <p className="text-red-500 text-sm mt-1">{errors.easting}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Northing <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="northing"
            step="0.01"
            value={formData.northing}
            onChange={handleChange}
            placeholder="6789012.34"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400 ${
              errors.northing ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.northing && <p className="text-red-500 text-sm mt-1">{errors.northing}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Elevation (m)
          </label>
          <input
            type="number"
            name="elevation"
            step="0.01"
            value={formData.elevation}
            onChange={handleChange}
            placeholder="1250.5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Drilling Parameters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Max Depth (m)
          </label>
          <input
            type="number"
            name="max_depth"
            step="0.1"
            value={formData.max_depth}
            onChange={handleChange}
            placeholder="150.0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Azimuth (0-360°)
          </label>
          <input
            type="number"
            name="azimuth"
            step="0.1"
            min="0"
            max="360"
            value={formData.azimuth}
            onChange={handleChange}
            placeholder="0-360"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400 ${
              errors.azimuth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.azimuth && <p className="text-red-500 text-sm mt-1">{errors.azimuth}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dip (-90 to +90°)
          </label>
          <input
            type="number"
            name="dip"
            step="0.1"
            min="-90"
            max="90"
            value={formData.dip}
            onChange={handleChange}
            placeholder="-90 to +90"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400 ${
              errors.dip ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dip && <p className="text-red-500 text-sm mt-1">{errors.dip}</p>}
        </div>
      </div>

      {/* Coordinate System */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Coordinate System
        </label>
        <input
          type="text"
          name="coordinate_system"
          value={formData.coordinate_system}
          onChange={handleChange}
          placeholder="e.g., WGS84, UTM Zone 35S"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Status Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 bg-white"
        >
          <option value="planned" className="text-gray-800">Planned</option>
          <option value="in_progress" className="text-gray-800">In Progress</option>
          <option value="completed" className="text-gray-800">Completed</option>
          <option value="abandoned" className="text-gray-800">Abandoned</option>
        </select>
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>{drillhole ? 'Update Drillhole' : 'Create Drillhole'}</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
        >
          <X size={18} />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
};

export default DrillholeForm;
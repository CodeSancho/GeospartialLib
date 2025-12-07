import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Input, TextArea } from "./Input";   
import Button from "./Button";        

const SampleForm = ({ sample, drillholes = [], onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    drillhole_id: sample?.drillhole_id || '',
    type: sample?.type || '',
    depth: sample?.depth || '',
    status: sample?.status || 'planned',
    description: sample?.description || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.drillhole_id) newErrors.drillhole_id = 'Drillhole is required';
    if (!formData.type.trim()) newErrors.type = 'Sample type is required';
    if (!formData.depth) newErrors.depth = 'Depth is required';
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
      
      {/* Drillhole */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Drillhole <span className="text-red-500">*</span>
        </label>
        <select
          name="drillhole_id"
          value={formData.drillhole_id}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
            errors.drillhole_id ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a drillhole...</option>
          {drillholes.map(d => (
            <option key={d.drillhole_id} value={d.drillhole_id}>
              {d.hole_id} ({d.project_id})
            </option>
          ))}
        </select>
        {errors.drillhole_id && <p className="text-red-500 text-sm mt-1">{errors.drillhole_id}</p>}
      </div>

      {/* Sample Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Sample Type <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="e.g., Rock, Soil, Water"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
      </div>

      {/* Depth */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Depth (m) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="depth"
          step="0.01"
          value={formData.depth}
          onChange={handleChange}
          placeholder="e.g., 15.5"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
            errors.depth ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.depth && <p className="text-red-500 text-sm mt-1">{errors.depth}</p>}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          <option value="planned">Planned</option>
          <option value="collected">Collected</option>
          <option value="analyzed">Analyzed</option>
          <option value="discarded">Discarded</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional notes about the sample"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <span>Saving...</span> : <>
            <Save size={18} />
            <span>{sample ? 'Update Sample' : 'Create Sample'}</span>
          </>}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg flex items-center justify-center gap-2"
        >
          <X size={18} />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
};

export default SampleForm;

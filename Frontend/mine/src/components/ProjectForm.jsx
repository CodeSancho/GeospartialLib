import React, { useState } from 'react';
import { Input, TextArea } from "./Input";
import Button from "./Button";
import { Save, X } from 'lucide-react';

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    location: project?.location || '',
    start_date: project?.start_date?.split('T')[0] || '',
    end_date: project?.end_date?.split('T')[0] || '',
    geom: typeof project?.geom === 'string' ? project.geom : project?.geom ? JSON.stringify(project.geom) : '',
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
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) newErrors.end_date = 'End date must be on or after the start date';
    if (formData.geom.trim()) {
      try {
        const geometry = JSON.parse(formData.geom);
        if (!geometry || !['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometry.type)) newErrors.geom = 'Use a Point, LineString, or Polygon GeoJSON geometry';
      } catch { newErrors.geom = 'Enter valid GeoJSON geometry'; }
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
      await onSubmit({ ...formData, geom: formData.geom.trim() || null });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="e.g., Northern Expansion Phase 2"
      />

      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        error={errors.location}
        required
        placeholder="e.g., Nevada, USA"
      />

      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Brief description of the project..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
        />

        <Input
          label="End Date"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
          error={errors.end_date}
        />
      </div>

      <TextArea label="Boundary geometry (optional GeoJSON)" name="geom" value={formData.geom} onChange={handleChange} error={errors.geom} placeholder='{"type":"Polygon","coordinates":[...]}' />
      <p className="-mt-2 text-xs text-gray-500">Coordinates must use longitude, latitude in WGS84 (EPSG:4326).</p>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          icon={Save}
          loading={loading}
        >
          {project ? 'Update Project' : 'Create Project'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          icon={X}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;

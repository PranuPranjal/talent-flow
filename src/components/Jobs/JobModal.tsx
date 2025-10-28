import { useState, useEffect } from 'react';
import type { Job } from '../../types';
import Modal from '../UI/Modal';
import Button from '../UI/Button';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  job?: Job | null;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, job }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'active' as 'active' | 'archived',
    tags: [] as string[],
    description: '',
    requirements: [] as string[],
    location: '',
    order: 0,
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        slug: job.slug,
        status: job.status,
        tags: job.tags || [],
        description: job.description || '',
        requirements: job.requirements || [],
        location: job.location || '',
        order: job.order,
        salary: job.salary || {
          min: 0,
          max: 0,
          currency: 'USD'
        }
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        status: 'active',
        tags: [],
        description: '',
        requirements: [],
        location: '',
        order: 0,
        salary: {
          min: 0,
          max: 0,
          currency: 'USD'
        }
      });
    }
    setTagInput('');
    setRequirementInput('');
    setErrors({});
  }, [job, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      // Handle nested updates explicitly to satisfy TS
      if (field.startsWith('salary.')) {
        const child = field.split('.')[1] as 'min' | 'max' | 'currency';
        return {
          ...prev,
          salary: {
            ...prev.salary,
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim() && !formData.requirements.includes(requirementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (formData.salary.min > formData.salary.max) {
      newErrors.salary = 'Minimum salary cannot be greater than maximum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={job ? 'Edit Job' : 'Create Job'} size="xl">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              handleInputChange('title', newTitle);
              handleInputChange('slug', generateSlug(newTitle));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Senior Software Engineer"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.slug ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., senior-software-engineer"
          />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Job description..."
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Remote, New York, NY"
          />
        </div>

        {/* Salary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 mb-1">
              Min Salary
            </label>
            <input
              id="minSalary"
              type="number"
              value={formData.salary.min}
              onChange={(e) => handleInputChange('salary.min', parseInt(e.target.value) || 0)}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.salary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700 mb-1">
              Max Salary
            </label>
            <input
              id="maxSalary"
              type="number"
              value={formData.salary.max}
              onChange={(e) => handleInputChange('salary.max', parseInt(e.target.value) || 0)}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.salary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
          </div>
        </div>
        {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tag and press Enter"
            />
            <Button variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRequirement();
                }
              }}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add requirement and press Enter"
            />
            <Button variant="secondary" onClick={handleAddRequirement}>
              Add
            </Button>
          </div>
          {formData.requirements.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {formData.requirements.map((requirement) => (
                <div
                  key={requirement}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">{requirement}</span>
                  <button
                    onClick={() => handleRemoveRequirement(requirement)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
            {job ? 'Save Changes' : 'Create Job'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default JobModal;



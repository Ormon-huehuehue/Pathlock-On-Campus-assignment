'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '../../types/projects';
import LoadingButton from './LoadingButton';
import ErrorMessage from './ErrorMessage';

interface ProjectFormData {
  title: string;
  description: string;
}

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function ProjectForm({ 
  project, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  className = '' 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || '',
    description: project?.description || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Update form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || ''
      });
    }
  }, [project]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Project title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Project title must be less than 100 characters';
    }

    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitError('');
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim()
      });
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-4 ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Submit Error */}
      {submitError && (
        <ErrorMessage message={submitError} />
      )}

      {/* Title Field */}
      <div>
        <label 
          htmlFor="project-title" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Project Title *
        </label>
        <input
          id="project-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.title 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          placeholder="Enter project title"
          maxLength={100}
          disabled={isLoading}
          autoFocus
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label 
          htmlFor="project-description" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="project-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
            errors.description 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          placeholder="Enter project description (optional)"
          maxLength={500}
          disabled={isLoading}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || !formData.title.trim()}
          className="px-6 py-2.5 hover:bg-darkBlue/80  cursor-pointer text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {project ? 'Update Project' : 'Create Project'}
        </LoadingButton>
      </div>
    </form>
  );
}
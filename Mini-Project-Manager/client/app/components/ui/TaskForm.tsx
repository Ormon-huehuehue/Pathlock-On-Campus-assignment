'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '../../types/projects';
import LoadingButton from './LoadingButton';
import ErrorMessage from './ErrorMessage';
import { DatePicker } from '../DatePicker';

interface TaskFormData {
  title: string;
  description: string;
  estimatedHours: number;
  dueDate: string;
  dependencies: string[];
}

// Interface for TaskForm state preservation
interface TaskFormState {
  formData: TaskFormData;
  formErrors: Record<string, string>;
  submitError: string;
  dependencyInput: string;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
  preservedState?: TaskFormState | null;
  onStateChange?: (state: TaskFormState) => void;
  submitError?: string;
  onSubmitErrorChange?: (error: string) => void;
}

export default function TaskForm({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
  preservedState,
  onStateChange,
  submitError: externalSubmitError = '',
  onSubmitErrorChange
}: TaskFormProps) {
  // Initialize form data from preserved state or task/defaults
  const [formData, setFormData] = useState<TaskFormData>(() => {
    if (preservedState?.formData) {
      return preservedState.formData;
    }
    return {
      title: task?.title || '',
      description: task?.description || '',
      estimatedHours: task?.estimatedHours || 1,
      dueDate: task?.dueDate || '',
      dependencies: task?.dependencies || [],
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>(
    preservedState?.formErrors || {}
  );
  const [submitError, setSubmitError] = useState<string>(
    preservedState?.submitError || externalSubmitError
  );
  const [dependencyInput, setDependencyInput] = useState<string>(
    preservedState?.dependencyInput || ''
  );

  // Update form data when task prop changes (only if no preserved state)
  useEffect(() => {
    if (task && !preservedState?.formData) {
      setFormData({
        title: task.title,
        description: task.description || '',
        estimatedHours: task.estimatedHours || 1,
        dueDate: task.dueDate || '',
        dependencies: task.dependencies || [],
      });
    }
  }, [task, preservedState]);

  // Sync external submit error
  useEffect(() => {
    if (externalSubmitError !== submitError) {
      setSubmitError(externalSubmitError);
    }
  }, [externalSubmitError]);

  // Notify parent component of state changes for preservation
  useEffect(() => {
    if (onStateChange) {
      const currentState: TaskFormState = {
        formData,
        formErrors: errors,
        submitError,
        dependencyInput
      };
      onStateChange(currentState);
    }
  }, [formData, errors, submitError, dependencyInput, onStateChange]);

  const addDependency = () => {
    const trimmedInput = dependencyInput.trim();
    if (trimmedInput && !formData.dependencies.includes(trimmedInput)) {
      handleInputChange('dependencies', [...formData.dependencies, trimmedInput]);
      setDependencyInput('');
    }
  };

  const removeDependency = (index: number) => {
    const newDependencies = formData.dependencies.filter((_, i) => i !== index);
    handleInputChange('dependencies', newDependencies);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Task title must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Task title must be less than 100 characters';
    }

    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Estimated hours validation
    if (formData.estimatedHours <= 0) {
      newErrors.estimatedHours = 'Estimated hours must be greater than 0';
    } else if (formData.estimatedHours > 168) {
      newErrors.estimatedHours = 'Estimated hours cannot exceed 168 (1 week)';
    }

    // Due date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TaskFormData, value: string | number | string[]) => {
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
      if (onSubmitErrorChange) {
        onSubmitErrorChange('');
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const errorMsg = '';
      setSubmitError(errorMsg);
      if (onSubmitErrorChange) {
        onSubmitErrorChange(errorMsg);
      }

      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedHours: formData.estimatedHours,
        dueDate: formData.dueDate,
        dependencies: formData.dependencies,
      });
    } catch (error) {
      const errorMsg = error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMsg);
      if (onSubmitErrorChange) {
        onSubmitErrorChange(errorMsg);
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
          htmlFor="task-title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Task Title *
        </label>
        <input
          id="task-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:border-transparent transition-all ${errors.title
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
            }`}
          placeholder="Enter task title"
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
      <div className='hidden'>
        <label
          htmlFor="task-description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description (Optional)
        </label>
        <textarea
          id="task-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:border-transparent transition-all resize-none ${errors.description
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
            }`}
          placeholder="Enter task description"
          rows={3}
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

      {/* Estimated Hours Field */}
      <div>
        <label
          htmlFor="estimated-hours"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Estimated Hours *
        </label>
        <input
          id="estimated-hours"
          type="number"
          min="0.5"
          max="168"
          step="0.5"
          value={formData.estimatedHours}
          onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 1)}
          className={`w-full px-4 py-3 border rounded-xl focus:border-transparent transition-all ${errors.estimatedHours
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
            }`}
          placeholder="1"
          disabled={isLoading}
          aria-describedby={errors.estimatedHours ? 'hours-error' : undefined}
        />
        {errors.estimatedHours && (
          <p id="hours-error" className="mt-1 text-sm text-red-600">
            {errors.estimatedHours}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter hours between 0.5 and 168 (1 week)
        </p>
      </div>

      {/* Dependencies Field */}
      <div className='hidden'>
        <label
          htmlFor="dependencies"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Dependencies (Optional)
        </label>
        <div className="space-y-2">
          <input
            id="dependencies"
            type="text"
            value={dependencyInput}
            onChange={(e) => setDependencyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDependency();
              }
            }}
            className="w-full px-4 py-3 border rounded-xl focus:border-transparent transition-all border-gray-300 hover:border-gray-400"
            placeholder="Enter dependency and press Enter"
            disabled={isLoading}
          />
          {formData.dependencies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.dependencies.map((dep, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                >
                  {dep}
                  <button
                    type="button"
                    onClick={() => removeDependency(index)}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Add tasks that must be completed before this one
        </p>
      </div>

      {/* Due Date Field */}
      <div>
        <label
          htmlFor="due-date"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Due Date (Optional)
        </label>
        <DatePicker
          value={formData.dueDate}
          onChange={(date) => handleInputChange('dueDate', date)}
          placeholder="Select due date"
          error={!!errors.dueDate}
          minDate={new Date()}
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
        )}
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
          disabled={isLoading || !formData.title.trim() || formData.estimatedHours <= 0}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {task ? 'Update Task' : 'Add Task'}
        </LoadingButton>
      </div>
    </form>
  );
}

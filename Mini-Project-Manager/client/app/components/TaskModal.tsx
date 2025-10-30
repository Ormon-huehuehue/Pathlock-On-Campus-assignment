'use client';

import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import TaskForm from './ui/TaskForm';
import { Task } from '../types/projects';

// Task form data interface
interface TaskFormData {
  title: string;
  description: string;
  estimatedHours: number;
  dueDate: string;
  dependencies: string[];
}

// Interface for TaskModal state preservation
interface TaskModalState {
  formData: TaskFormData;
  formErrors: Record<string, string>;
  submitError: string;
  dependencyInput: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task; // For editing existing tasks
  mode?: 'create' | 'edit';
  onSuccess?: (taskData: TaskFormData) => void; // Callback for successful operations
  preservedState?: TaskModalState | null;
  onStateChange?: (state: TaskModalState) => void;
  isLoading?: boolean;
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  mode = 'create',
  onSuccess,
  preservedState,
  onStateChange,
  isLoading = false
}: TaskModalProps) {
  const [submitError, setSubmitError] = useState<string>(preservedState?.submitError || '');

  // Clear submit error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
    }
  }, [isOpen]);

  // Clear submit error when switching between create/edit modes
  useEffect(() => {
    setSubmitError('');
  }, [mode, task]);

  const handleSubmit = async (formData: TaskFormData) => {
    try {
      setSubmitError('');

      // For now, we'll just call the success callback with the form data
      // In a real implementation, this would make an API call to add/update the task
      if (onSuccess) {
        onSuccess(formData);
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    }
  };

  const handleCancel = () => {
    setSubmitError('');
    onClose();
  };

  const modalTitle = mode === 'edit' ? 'Edit Task' : 'Add New Task';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={modalTitle}
      className="max-w-lg"
    >
      <div className="space-y-4">
        {/* Additional error display for modal-specific errors */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          preservedState={preservedState}
          onStateChange={onStateChange}
          submitError={submitError}
          onSubmitErrorChange={setSubmitError}
        />
      </div>
    </Modal>
  );
}
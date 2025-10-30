'use client';

import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import ProjectForm from './ui/ProjectForm';
import { useProjects } from '../hooks/useProjects';
import { Project, ProjectFormData } from '../types/projects';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project; // For editing existing projects
  mode?: 'create' | 'edit';
  onSuccess?: () => void; // Callback for successful operations
}

export default function ProjectModal({ 
  isOpen, 
  onClose, 
  project, 
  mode = 'create',
  onSuccess
}: ProjectModalProps) {
  const { createProject, updateProject, isCreating, isUpdating } = useProjects();
  const [submitError, setSubmitError] = useState<string>('');

  // Clear submit error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
    }
  }, [isOpen]);

  // Clear submit error when switching between create/edit modes
  useEffect(() => {
    setSubmitError('');
  }, [mode, project]);

  const handleSubmit = async (formData: ProjectFormData) => {
    try {
      setSubmitError('');
      
      let result;
      if (mode === 'edit' && project) {
        result = await updateProject(project.id, formData);
      } else {
        result = await createProject(formData);
      }

      if (result.success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Error is already handled by the hook and displayed via toast
        // But we can also set a local error for the modal
        setSubmitError(result.error || 'An unexpected error occurred');
      }
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

  const isLoading = isCreating || isUpdating;
  const modalTitle = mode === 'edit' ? 'Edit Project' : 'Create New Project';

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

        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  );
}
'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Project } from '../../types/projects';
import Modal from './Modal';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onConfirm,
  isDeleting = false
}) => {
  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex p-3 bg-red-100 rounded-full">
            <AlertTriangle size={15} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-600">
              Are you sure you want to delete this project?
            </h3>
            <p className="text-gray-600 text-sm">This cannot be undone</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="font-medium text-gray-900">
            <span className="text-gray-600 font-semibold">Title: </span>
            {project.title}
          </p>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="text-gray-600 font-semibold">Description: </span>
              {project.description}
            </p>
          )}
          {project.tasks && project.tasks.length > 0 && (
            <p className="text-sm text-red-600 mt-2">
              This will also delete {project.tasks.length} task{project.tasks.length === 1 ? '' : 's'}.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Project
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;
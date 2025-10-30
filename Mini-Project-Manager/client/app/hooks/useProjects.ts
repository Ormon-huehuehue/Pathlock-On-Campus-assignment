'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/app/components/ui/ToastProvider';
import { ProjectService } from '@/app/services/projects';
import {
  Project,
  ProjectFormData,
  ProjectsState,
  ApiError,
  SchedulerTaskInput,
  ScheduleResponse
} from '@/app/types/projects';

/**
 * Custom hook for managing project state and operations
 * Provides CRUD operations, loading states, and error handling for projects
 */
export const useProjects = () => {
  const { showSuccess, showError } = useToast();
  
  // Main state for projects
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null
  });

  // Operation-specific loading states
  const [operationLoading, setOperationLoading] = useState({
    creating: false,
    updating: false,
    deleting: false,
    scheduling: false
  });

  /**
   * Clear any existing errors
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Handle API errors consistently
   */
  const handleError = useCallback((error: ApiError, operation: string) => {
    const errorMessage = error.message || `Failed to ${operation}`;
    setState(prev => ({ ...prev, error: errorMessage }));
    showError(`Operation Failed`, errorMessage);
    
    // Log error for debugging
    console.error(`Project ${operation} error:`, error);
  }, [showError]);

  /**
   * Fetch all projects for the authenticated user
   */
  const fetchProjects = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const projects = await ProjectService.getProjects();
      
      setState(prev => ({
        ...prev,
        projects,
        isLoading: false,
        error: null
      }));
      
      return { success: true, data: projects };
    } catch (error) {
      const apiError = error as ApiError;
      handleError(apiError, 'fetch projects');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message
      }));
      
      return { success: false, error: apiError.message };
    }
  }, [handleError]);

  /**
   * Fetch a single project by ID
   */
  const fetchProject = useCallback(async (projectId: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const project = await ProjectService.getProject(projectId);
      
      setState(prev => ({
        ...prev,
        currentProject: project,
        isLoading: false,
        error: null
      }));
      
      return { success: true, data: project };
    } catch (error) {
      const apiError = error as ApiError;
      handleError(apiError, 'fetch project');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message
      }));
      
      return { success: false, error: apiError.message };
    }
  }, [handleError]);

  /**
   * Create a new project
   */
  const createProject = useCallback(async (projectData: ProjectFormData) => {
    try {
      setOperationLoading(prev => ({ ...prev, creating: true }));
      clearError();
      
      const newProject = await ProjectService.createProject(projectData);

      console.log("new project response : ", newProject);
      
      // Add the new project to the list
      setState(prev => ({
        ...prev,
        projects: [newProject, ...(prev.projects || [])],
        error: null
      }));
      
      showSuccess(
        'Project Created',
        `"${newProject.title}" has been created successfully!`
      );
      
      return { success: true, data: newProject };
    } catch (error) {
      const apiError = error as ApiError;
      handleError(apiError, 'create project');
      return { success: false, error: apiError.message };
    } finally {
      setOperationLoading(prev => ({ ...prev, creating: false }));
    }
  }, [clearError, handleError, showSuccess]);

  /**
   * Update an existing project
   */
  const updateProject = useCallback(async (
    projectId: number, 
    projectData: Partial<ProjectFormData>
  ) => {
    try {
      setOperationLoading(prev => ({ ...prev, updating: true }));
      clearError();
      
      const updatedProject = await ProjectService.updateProject(projectId, projectData);
      
      // Update the project in the list
      setState(prev => ({
        ...prev,
        projects: prev.projects?.map(p => 
          p.id === projectId ? updatedProject : p
        ) || [],
        currentProject: prev.currentProject?.id === projectId 
          ? updatedProject 
          : prev.currentProject,
        error: null
      }));
      
      showSuccess(
        'Project Updated',
        `"${updatedProject.title}" has been updated successfully!`
      );
      
      return { success: true, data: updatedProject };
    } catch (error) {
      const apiError = error as ApiError;
      handleError(apiError, 'update project');
      return { success: false, error: apiError.message };
    } finally {
      setOperationLoading(prev => ({ ...prev, updating: false }));
    }
  }, [clearError, handleError, showSuccess]);

  /**
   * Delete a project
   */
  const deleteProject = useCallback(async (projectId: number) => {
    try {
      setOperationLoading(prev => ({ ...prev, deleting: true }));
      clearError();
      
      // Get project title for success message
      const projectToDelete = state.projects?.find(p => p.id === projectId);
      const projectTitle = projectToDelete?.title || 'Project';
      
      await ProjectService.deleteProject(projectId);
      
      // Remove the project from the list
      setState(prev => ({
        ...prev,
        projects: prev.projects?.filter(p => p.id !== projectId) || [],
        currentProject: prev.currentProject?.id === projectId 
          ? null 
          : prev.currentProject,
        error: null
      }));
      
      showSuccess(
        'Project Deleted',
        `"${projectTitle}" has been deleted successfully!`
      );
      
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      handleError(apiError, 'delete project');
      return { success: false, error: apiError.message };
    } finally {
      setOperationLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [clearError, handleError, showSuccess, state.projects]);

  /**
   * Generate optimized schedule for project tasks
   */
  const generateSchedule = useCallback(async (
    projectId: number, 
    tasks: SchedulerTaskInput[]
  ): Promise<{ success: boolean; data?: ScheduleResponse; error?: string }> => {
    try {
      setOperationLoading(prev => ({ ...prev, scheduling: true }));
      clearError();
      
      const scheduleResponse = await ProjectService.generateSchedule(projectId, tasks);
      
      showSuccess(
        'Schedule Generated',
        'Your optimized task schedule is ready!'
      );
      
      return { success: true, data: scheduleResponse };
    } catch (error) {
      const apiError = error as ApiError;
      handleError(apiError, 'generate schedule');
      return { success: false, error: apiError.message };
    } finally {
      setOperationLoading(prev => ({ ...prev, scheduling: false }));
    }
  }, [clearError, handleError, showSuccess]);

  /**
   * Set current project (for navigation/selection)
   */
  const setCurrentProject = useCallback((project: Project | null) => {
    setState(prev => ({ ...prev, currentProject: project }));
  }, []);

  /**
   * Refresh projects list (useful after external changes)
   */
  const refreshProjects = useCallback(async () => {
    return await fetchProjects();
  }, [fetchProjects]);

  /**
   * Get project by ID from current state (without API call)
   */
  const getProjectById = useCallback((projectId: number): Project | undefined => {
    return state.projects?.find(p => p.id === projectId);
  }, [state.projects]);

  /**
   * Check if any operation is currently loading
   */
  const isAnyOperationLoading = 
    state.isLoading || 
    operationLoading.creating || 
    operationLoading.updating || 
    operationLoading.deleting || 
    operationLoading.scheduling;

  // Auto-fetch projects on mount (optional - can be called manually)
  useEffect(() => {
    // Only auto-fetch if we don't have projects and aren't already loading
    if ((state.projects?.length || 0) === 0 && !state.isLoading) {
      fetchProjects();
    }
  }, []); // Empty dependency array for mount-only effect

  return {
    // State
    projects: state.projects,
    currentProject: state.currentProject,
    isLoading: state.isLoading,
    error: state.error,
    
    // Operation-specific loading states
    isCreating: operationLoading.creating,
    isUpdating: operationLoading.updating,
    isDeleting: operationLoading.deleting,
    isScheduling: operationLoading.scheduling,
    isAnyOperationLoading,
    
    // CRUD operations
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    
    // Utility operations
    generateSchedule,
    setCurrentProject,
    refreshProjects,
    getProjectById,
    clearError,
    
    // Computed values
    hasProjects: state.projects?.length > 0,
    projectCount: state.projects?.length || 0,
  };
};

export default useProjects;
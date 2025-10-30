import api from './api';
import {
  Project,
  ProjectResponse,
  ProjectFormData,
  Task,
  SchedulerTaskInput,
  ScheduleResponse,
  ApiError
} from '../types/projects';

/**
 * Project API Service
 * Handles all project-related API operations with proper error handling and TypeScript typing
 */
export class ProjectService {
  
  /**
   * Fetch all projects for the authenticated user
   * @returns Promise<Project[]> - Array of user's projects
   * @throws ApiError - When request fails
   */
  static async getProjects(): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/api/projects');
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, 'Failed to fetch projects');
    }
  }

  /**
   * Fetch a single project by ID
   * @param projectId - The ID of the project to fetch
   * @returns Promise<Project> - The requested project
   * @throws ApiError - When request fails or project not found
   */
  static async getProject(projectId: number): Promise<Project> {
    try {
      const response = await api.get<ProjectResponse>(`/api/projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, `Failed to fetch project with ID ${projectId}`);
    }
  }

  /**
   * Create a new project
   * @param projectData - The project data to create
   * @returns Promise<Project> - The created project
   * @throws ApiError - When creation fails or validation errors occur
   */
  static async createProject(projectData: ProjectFormData): Promise<Project> {
    try {
      const response = await api.post<ProjectResponse>('/api/projects', projectData);
      console.log("response : ", response.data);
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, 'Failed to create project');
    }
  }

  /**
   * Update an existing project
   * @param projectId - The ID of the project to update
   * @param projectData - The updated project data
   * @returns Promise<Project> - The updated project
   * @throws ApiError - When update fails or validation errors occur
   */
  static async updateProject(projectId: number, projectData: Partial<ProjectFormData>): Promise<Project> {
    try {
      const response = await api.put<ProjectResponse>(`/api/projects/${projectId}`, projectData);
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, `Failed to update project with ID ${projectId}`);
    }
  }

  /**
   * Delete a project
   * @param projectId - The ID of the project to delete
   * @returns Promise<void> - Resolves when deletion is successful
   * @throws ApiError - When deletion fails
   */
  static async deleteProject(projectId: number): Promise<void> {
    try {
      await api.delete(`/api/projects/${projectId}`);
    } catch (error: any) {
      throw this.handleApiError(error, `Failed to delete project with ID ${projectId}`);
    }
  }

  /**
   * Add a new task to a project
   * @param projectId - The ID of the project to add the task to
   * @param taskData - The task data to create
   * @returns Promise<Task> - The created task
   * @throws ApiError - When task creation fails
   */
  static async addTask(projectId: number, taskData: {
    title: string;
    description?: string;
    estimatedHours: number;
    dueDate?: string;
    dependencies: string[];
  }): Promise<Task> {
    try {
      const response = await api.post<Task>(
        `/api/projects/${projectId}/tasks`,
        {
          title: taskData.title,
          dueDate: taskData.dueDate || null,
          isCompleted: false,
          // Note: The .NET API doesn't seem to handle description, estimatedHours, or dependencies
          // You may need to update your backend to support these fields
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, `Failed to add task to project ${projectId}`);
    }
  }

  /**
   * Generate optimized schedule for project tasks
   * @param projectId - The ID of the project to schedule
   * @param tasks - Array of tasks to schedule
   * @returns Promise<ScheduleResponse> - The optimized schedule
   * @throws ApiError - When scheduling fails
   */
  static async generateSchedule(projectId: number, tasks: SchedulerTaskInput[]): Promise<ScheduleResponse> {
    try {
      const response = await api.post<ScheduleResponse>(
        `/api/v1/projects/${projectId}/schedule`,
        { tasks }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, `Failed to generate schedule for project ${projectId}`);
    }
  }

  /**
   * Handle API errors and convert them to standardized format
   * @param error - The axios error object
   * @param defaultMessage - Default error message if none provided
   * @returns ApiError - Standardized error object
   */
  private static handleApiError(error: any, defaultMessage: string): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle different HTTP status codes
      switch (status) {
        case 400:
          return {
            message: data.message || 'Invalid request data',
            errors: data.errors || {}
          };
        case 401:
          return {
            message: 'Authentication required. Please log in again.',
            errors: {}
          };
        case 403:
          return {
            message: 'You do not have permission to perform this action.',
            errors: {}
          };
        case 404:
          return {
            message: data.message || 'The requested resource was not found.',
            errors: {}
          };
        case 422:
          return {
            message: data.message || 'Validation failed',
            errors: data.errors || {}
          };
        case 429:
          return {
            message: 'Too many requests. Please try again later.',
            errors: {}
          };
        case 500:
          return {
            message: 'Server error. Please try again later.',
            errors: {}
          };
        default:
          return {
            message: data.message || defaultMessage,
            errors: data.errors || {}
          };
      }
    } else if (error.request) {
      // Network error
      return {
        message: 'Unable to connect to server. Please check your internet connection.',
        errors: {}
      };
    } else {
      // Other error
      return {
        message: error.message || defaultMessage,
        errors: {}
      };
    }
  }

  /**
   * Check if an error is a validation error (422 status)
   * @param error - The error to check
   * @returns boolean - True if it's a validation error
   */
  static isValidationError(error: ApiError): boolean {
    return Object.keys(error.errors || {}).length > 0;
  }

  /**
   * Check if an error is a network error
   * @param error - The error to check
   * @returns boolean - True if it's a network error
   */
  static isNetworkError(error: ApiError): boolean {
    return error.message.includes('Unable to connect to server');
  }

  /**
   * Check if an error is an authentication error
   * @param error - The error to check
   * @returns boolean - True if it's an authentication error
   */
  static isAuthError(error: ApiError): boolean {
    return error.message.includes('Authentication required');
  }
}

// Export individual methods for easier importing
export const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTask,
  generateSchedule,
  isValidationError,
  isNetworkError,
  isAuthError
} = ProjectService;

// Default export
export default ProjectService;
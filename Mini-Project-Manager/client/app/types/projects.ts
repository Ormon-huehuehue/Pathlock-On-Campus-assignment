// Project-related type definitions

export interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  estimatedHours: number;
  dueDate?: string;
  isCompleted: boolean;
  dependencies: string[];
  projectId: number;
}

export interface SchedulerTaskInput {
  title: string;
  estimatedHours: number;
  dueDate?: string;
  dependencies: string[];
}

// export interface ProjectResponse {
//   data: Project;
// }

export interface ProjectResponse extends Project{}

export interface ScheduleResponse {
  recommendedOrder: string[];
  estimatedCompletion?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Form Data Types
export interface ProjectFormData {
  title: string;
  description: string;
}

export interface ProjectFormState {
  formData: ProjectFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  isOpen: boolean;
}

// Hook State Types
export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

// Component Props Types
export interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface SmartSchedulerProps {
  projectId?: number;
  tasks?: SchedulerTaskInput[];
  onSchedule: (tasks: SchedulerTaskInput[]) => void;
}

// Navigation Types
export type NavigationItem = 'projects' | 'scheduler';

export interface BottomBarProps {
  currentRoute: NavigationItem;
  onNavigate: (route: NavigationItem) => void;
  onCreateProject: () => void;
}
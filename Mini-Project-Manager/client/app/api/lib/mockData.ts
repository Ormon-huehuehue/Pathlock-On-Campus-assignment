// Mock data storage for development
// In a real application, this would be replaced with a database

export interface MockProject {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  tasks?: any[];
}

// In-memory storage (will reset on server restart)
let projects: MockProject[] = [
  {
    id: 1,
    title: "Sample Project",
    description: "This is a sample project to demonstrate the functionality",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: []
  }
];

let nextId = 2;

export const mockData = {
  // Get all projects
  getProjects(): MockProject[] {
    return [...projects]; // Return a copy
  },

  // Get project by ID
  getProject(id: number): MockProject | undefined {
    return projects.find(p => p.id === id);
  },

  // Create new project
  createProject(data: { title: string; description?: string }): MockProject {
    const newProject: MockProject = {
      id: nextId++,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: []
    };

    projects.unshift(newProject); // Add to beginning
    return newProject;
  },

  // Update project
  updateProject(id: number, data: Partial<{ title: string; description?: string }>): MockProject | null {
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject = {
      ...projects[index],
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() }),
      updatedAt: new Date().toISOString()
    };

    projects[index] = updatedProject;
    return updatedProject;
  },

  // Delete project
  deleteProject(id: number): boolean {
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    projects.splice(index, 1);
    return true;
  },

  // Reset data (useful for testing)
  reset(): void {
    projects = [];
    nextId = 1;
  }
};
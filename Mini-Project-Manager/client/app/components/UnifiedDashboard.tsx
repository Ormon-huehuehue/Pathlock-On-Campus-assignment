"use client"
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import ContentArea from "./ContentArea";
import BottomBar from "./BottomBar";
import ProjectModal from "./ProjectModal";
import { Project } from "@/app/types/projects";
import { SchedulerTaskInput, ScheduleResponse } from "@/app/types/projects";

type TabType = 'projects' | 'scheduler' | 'tasks';

interface UnifiedDashboardState {
  activeTab: TabType;
  isProjectModalOpen: boolean;
  editingProject: Project | null;
}

// Interface for SmartScheduler state preservation
interface SchedulerState {
  tasks: SchedulerTaskInput[];
  schedule: ScheduleResponse | null;
  taskForm: {
    title: string;
    estimatedHours: number;
    dueDate: string;
    dependencies: string[];
  };
  formErrors: Record<string, string>;
  dependencyInput: string;
  error: string;
}

// Interface for ProjectModal state preservation
interface ProjectModalState {
  formData: {
    title: string;
    description: string;
  };
  formErrors: Record<string, string>;
  submitError: string;
}

export default function UnifiedDashboard() {
  const { user, logout } = useAuth();

  const [state, setState] = useState<UnifiedDashboardState>({
    activeTab: 'projects',
    isProjectModalOpen: false,
    editingProject: null
  });

  // Refs to preserve state during tab switches
  const schedulerStateRef = useRef<SchedulerState | null>(null);
  const projectModalStateRef = useRef<ProjectModalState | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, []);

  // Handler to preserve SmartScheduler state
  const handleSchedulerStateChange = useCallback((schedulerState: SchedulerState) => {
    schedulerStateRef.current = schedulerState;
  }, []);

  // Handler to preserve ProjectModal state
  const handleProjectModalStateChange = useCallback((modalState: ProjectModalState) => {
    projectModalStateRef.current = modalState;
  }, []);

  const handleCreateProject = useCallback(() => {
    setState(prev => ({
      ...prev,
      isProjectModalOpen: true,
      editingProject: null
    }));
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setState(prev => ({
      ...prev,
      isProjectModalOpen: true,
      editingProject: project
    }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isProjectModalOpen: false,
      editingProject: null
    }));
    // Clear preserved modal state when modal is closed
    projectModalStateRef.current = null;
  }, []);

  // Add a refresh trigger to ensure project list updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProjectSuccess = useCallback(() => {
    // This callback will be triggered when a project is successfully created or updated
    // Force a refresh of the project list by updating the refresh trigger
    setRefreshTrigger(prev => prev + 1);
    console.log('Project operation completed successfully - triggering refresh');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-lightBlue to-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="p-6 pb-0"
      >
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-800">
                Welcome, {user?.username || "User"}
              </h1>
              <p className="text-sm text-slate-500">
                {state.activeTab === 'projects'
                  ? "Manage your projects and tasks"
                  : "Plan and optimize your schedule"
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleLogout}
                aria-label="logout"
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 shadow-sm hover:bg-red-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                style={{
                  willChange: 'transform'
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content Area */}
      <ContentArea
        activeTab={state.activeTab}
        onProjectModalOpen={handleCreateProject}
        onProjectEdit={handleEditProject}
        schedulerState={schedulerStateRef.current}
        onSchedulerStateChange={handleSchedulerStateChange}
        refreshTrigger={refreshTrigger}
      />

      {/* Bottom Bar */}
      <BottomBar
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        onCreateProject={handleCreateProject}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={state.isProjectModalOpen}
        onClose={handleCloseModal}
        mode={state.editingProject ? "edit" : "create"}
        project={state.editingProject || undefined}
        preservedState={projectModalStateRef.current}
        onStateChange={handleProjectModalStateChange}
        onSuccess={handleProjectSuccess}
      />
    </div>
  );
}
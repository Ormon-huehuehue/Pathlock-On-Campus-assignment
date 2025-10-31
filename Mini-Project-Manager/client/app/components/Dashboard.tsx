"use client"
import { memo, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderOpen,
} from "lucide-react";
import { useProjects } from "@/app/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import DeleteProjectModal from "./ui/DeleteProjectModal";
import { Project } from "@/app/types/projects";

const cardIn = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i } }),
};

interface DashboardProps {
  onProjectEdit?: (project: Project) => void;
  onCreateProject?: () => void;
  refreshTrigger?: number;
}

const Dashboard = memo(({ onProjectEdit, onCreateProject, refreshTrigger }: DashboardProps) => {
  const router = useRouter();
  const {
    projects,
    isLoading,
    error,
    hasProjects,
    deleteProject,
    refreshProjects
  } = useProjects();

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh projects when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('Dashboard: Refreshing projects due to trigger change');
      refreshProjects();
    }
  }, [refreshTrigger, refreshProjects]);

  // Listen for project modal events from BottomBar (fallback for standalone usage)
  useEffect(() => {
    const handleOpenModal = () => {
      if (onCreateProject) {
        onCreateProject();
      }
    };

    window.addEventListener('openProjectModal', handleOpenModal);
    return () => {
      window.removeEventListener('openProjectModal', handleOpenModal);
    };
  }, [onCreateProject]);

  const handleViewProject = useCallback((project: Project) => {
    router.push(`/projects/${project.id}`);
  }, [router]);

  const handleEditProject = useCallback((project: Project) => {
    if (onProjectEdit) {
      onProjectEdit(project);
    }
  }, [onProjectEdit]);

  const handleDeleteProject = useCallback((project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);
      await deleteProject(projectToDelete.id);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      // Error handling is done in the useProjects hook
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [projectToDelete, deleteProject]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
    setIsDeleting(false);
  }, []);

  return (
    <div className="w-full">
      <div className="w-full max-w-4xl mt-10 mx-auto">

        {/* Projects Section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-white/60 p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-zinc-600">Your Projects</h2>
            {hasProjects && (
              <span className="text-sm text-slate-600">
                {projects.length} project{projects.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-slate-600">Loading projects...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">Failed to load projects</div>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && !hasProjects && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No projects yet</h3>
              <p className="text-sm text-slate-600 mb-6">
                Create your first project to start organizing your work and tasks.
              </p>
              <motion.button
                onClick={() => onCreateProject && onCreateProject()}
                className="inline-flex items-center gap-2 px-6 transition-all py-3 bg-emerald-500 font-semibold text-white rounded-xl border-2 border-emerald-600 hover:bg-emerald-700 transition-colors"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </motion.button>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !error && hasProjects && (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.98 }}
                    variants={cardIn}
                    custom={i}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    style={{
                      willChange: 'transform'
                    }}
                  >
                    <ProjectCard
                      project={project}
                      onView={handleViewProject}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      className="h-full"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Delete Project Modal */}
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          project={projectToDelete}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
})

Dashboard.displayName = 'Dashboard';

export default Dashboard;
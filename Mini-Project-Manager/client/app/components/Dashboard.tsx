"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useProjects } from "@/app/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import Modal from "./ui/Modal";
import ProjectForm from "./ui/ProjectForm";
import { Project, ProjectFormData } from "@/app/types/projects";

const cardIn = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i } }),
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { 
    projects, 
    isLoading, 
    error, 
    hasProjects, 
    createProject, 
    isCreating,
    deleteProject,
    isDeleting 
  } = useProjects();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Listen for project modal events from BottomBar
  useEffect(() => {
    const handleOpenModal = () => {
      setIsCreateModalOpen(true);
    };

    window.addEventListener('openProjectModal', handleOpenModal);
    return () => {
      window.removeEventListener('openProjectModal', handleOpenModal);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleCreateProject = async (projectData: ProjectFormData) => {
    const result = await createProject(projectData);
    if (result.success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleViewProject = (project: Project) => {
    // TODO: Navigate to project details view
    console.log('View project:', project);
  };

  const handleEditProject = (project: Project) => {
    // TODO: Open edit modal
    console.log('Edit project:', project);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      await deleteProject(project.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 flex items-start justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                Welcome, {user?.username || "User"}
              </h1>
              <p className="text-sm text-slate-500">
                {hasProjects 
                  ? `You have ${projects.length} project${projects.length === 1 ? '' : 's'} to manage`
                  : "Let's get started by creating your first project!"
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm hover:bg-emerald-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                disabled={isCreating}
              >
                <Plus className="w-4 h-4" />
                New Project
              </motion.button>
              <button
                aria-label="help"
                className="text-sm px-3 py-2 rounded-md bg-white/60 backdrop-blur border border-white/30 shadow-sm hover:bg-white/80 transition-colors"
              >
                Need help?
              </button>
              <motion.button
                onClick={handleLogout}
                aria-label="logout"
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 shadow-sm hover:bg-red-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Projects Section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/70 p-6 shadow-lg border border-white/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Your Projects</h2>
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
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                disabled={isCreating}
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </motion.button>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !error && hasProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.98 }}
                    variants={cardIn}
                    custom={i}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
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

        {/* Project Creation Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Project"
        >
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isCreating}
          />
        </Modal>
      </div>
    </div>
  );
}
"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useProjects } from "@/app/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import { Project } from "@/app/types/projects";

const cardIn = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i } }),
};

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { 
    projects, 
    isLoading, 
    error, 
    hasProjects, 
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

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleViewProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      await deleteProject(project.id);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6">
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
              <h1 className="text-2xl font-semibold text-zinc-800">
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
            <h2 className="font-semibold text-lg text-zinc-600">Your Projects</h2>
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
        <ProjectModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          mode="create"
        />

        {/* Project Edit Modal */}
        <ProjectModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          mode="edit"
          project={editingProject || undefined}
        />
      </div>
    </div>
  );
}
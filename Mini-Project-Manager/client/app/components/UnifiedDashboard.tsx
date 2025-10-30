"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import ContentArea from "./ContentArea";
import BottomBar from "./BottomBar";
import ProjectModal from "./ProjectModal";
import { Project } from "@/app/types/projects";

type TabType = 'projects' | 'scheduler';

interface UnifiedDashboardState {
  activeTab: TabType;
  isProjectModalOpen: boolean;
  editingProject: Project | null;
}

export default function UnifiedDashboard() {
  const { user, logout } = useAuth();

  const [state, setState] = useState<UnifiedDashboardState>({
    activeTab: 'projects',
    isProjectModalOpen: false,
    editingProject: null
  });

  const handleTabChange = (tab: TabType) => {
    setState(prev => ({
      ...prev,
      activeTab: tab
    }));
  };

  const handleCreateProject = () => {
    setState(prev => ({
      ...prev,
      isProjectModalOpen: true,
      editingProject: null
    }));
  };

  const handleEditProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      isProjectModalOpen: true,
      editingProject: project
    }));
  };

  const handleCloseModal = () => {
    setState(prev => ({
      ...prev,
      isProjectModalOpen: false,
      editingProject: null
    }));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-amber-50">
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
      />
    </div>
  );
}
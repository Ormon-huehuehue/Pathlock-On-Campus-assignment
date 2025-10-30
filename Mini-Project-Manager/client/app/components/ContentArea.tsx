"use client"
import { motion, AnimatePresence } from "framer-motion";
import Dashboard from "./Dashboard";
import SmartScheduler from "./SmartScheduler";
import { Project } from "@/app/types/projects";

type TabType = 'projects' | 'scheduler';

interface ContentAreaProps {
  activeTab: TabType;
  onProjectModalOpen: () => void;
  onProjectEdit: (project: Project) => void;
}

const contentAnimations = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { 
    duration: 0.3,
    ease: "easeInOut" as const // Smooth easing for transitions
  }
};

const reverseAnimations = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { 
    duration: 0.3,
    ease: "easeInOut" as const
  }
};

export default function ContentArea({ 
  activeTab, 
  onProjectModalOpen, 
  onProjectEdit 
}: ContentAreaProps) {
  return (
    <div className="flex-1 p-6 pt-4">
      <div className="w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'projects' ? (
            <motion.div
              key="projects"
              {...contentAnimations}
            >
              <Dashboard 
                onProjectEdit={onProjectEdit}
                onCreateProject={onProjectModalOpen}
              />
            </motion.div>
          ) : (
            <motion.div
              key="scheduler"
              {...reverseAnimations}
            >
              <SmartScheduler />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
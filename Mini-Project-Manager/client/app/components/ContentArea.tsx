"use client"
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dashboard from "./Dashboard";
import SmartScheduler from "./SmartScheduler";
import ErrorBoundary from "./ui/ErrorBoundary";
import { Project, SchedulerTaskInput, ScheduleResponse } from "@/app/types/projects";

type TabType = 'projects' | 'scheduler' | 'tasks';

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

interface ContentAreaProps {
  activeTab: TabType;
  onProjectModalOpen: () => void;
  onProjectEdit: (project: Project) => void;
  schedulerState: SchedulerState | null;
  onSchedulerStateChange: (state: SchedulerState) => void;
  refreshTrigger?: number;
}

const contentAnimations = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { 
    duration: 0.25,
    ease: [0.25, 0.46, 0.45, 0.94] as const // Optimized cubic-bezier for 60fps
  }
};

const reverseAnimations = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { 
    duration: 0.25,
    ease: [0.25, 0.46, 0.45, 0.94] as const // Optimized cubic-bezier for 60fps
  }
};

const ContentArea = memo(({ 
  activeTab, 
  onProjectModalOpen, 
  onProjectEdit,
  schedulerState,
  onSchedulerStateChange,
  refreshTrigger
}: ContentAreaProps) => {
  return (
    <div className="flex-1 p-6 pt-4">
      <div className="w-full max-w-4xl mx-auto">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('ContentArea error:', error, errorInfo);
          }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'projects' ? (
              <motion.div
                key="projects"
                {...contentAnimations}
                style={{
                  willChange: 'transform, opacity'
                }}
              >
                <Dashboard 
                  onProjectEdit={onProjectEdit}
                  onCreateProject={onProjectModalOpen}
                  refreshTrigger={refreshTrigger}
                />
              </motion.div>
            ) : (
              <motion.div
                key="scheduler"
                {...reverseAnimations}
                style={{
                  willChange: 'transform, opacity'
                }}
              >
                <SmartScheduler 
                  preservedState={schedulerState}
                  onStateChange={onSchedulerStateChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </ErrorBoundary>
      </div>
    </div>
  );
})

ContentArea.displayName = 'ContentArea';

export default ContentArea;
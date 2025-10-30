'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ListTodo,
  Brain
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { Project } from '@/app/types/projects';
import { ProjectService } from '@/app/services/projects';
import ProjectModal from '@/app/components/ProjectModal';
import Modal from '@/app/components/ui/Modal';
import PageTransition from '@/app/components/ui/PageTransition';
import GlobalLoader from '@/app/components/ui/GlobalLoader';
import SmartScheduler from '@/app/components/SmartScheduler';
import BottomBar from '@/app/components/BottomBar';
import TaskModal from '@/app/components/TaskModal';

type TabType = 'projects' | 'scheduler' | 'tasks';

export default function ProjectDetailsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch project details
  useEffect(() => {
    if (isAuthenticated && projectId) {
      fetchProject();
    }
  }, [isAuthenticated, projectId]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectData = await ProjectService.getProject(projectId);
      setProject(projectData);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!project) return;

    try {
      setIsDeleting(true);
      await ProjectService.deleteProject(project.id);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchProject(); // Refresh project data
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleAddTask = () => {
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
  };

  const handleTaskSuccess = async (taskData: {
    title: string;
    description: string;
    estimatedHours: number;
    dueDate: string;
    dependencies: string[];
  }) => {
    try {
      setIsAddingTask(true);
      
      // Call the API to add the task
      await ProjectService.addTask(projectId, taskData);
      
      // Refresh the project data to show the new task
      await fetchProject();
      
      setIsTaskModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add task');
    } finally {
      setIsAddingTask(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskStats = () => {
    if (!project?.tasks) return { total: 0, completed: 0, progress: 0 };

    const total = project.tasks.length;
    const completed = project.tasks.filter(task => task.isCompleted).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, progress };
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return <GlobalLoader message="Checking authentication..." />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state while fetching project
  if (isLoading) {
    return <GlobalLoader message="Loading project details..." />;
  }

  // Show error state
  if (error && !project) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Project Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!project) return null;

  const taskStats = getTaskStats();

  return (
    <PageTransition>
      <div className="min-h-screen p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-white/60 backdrop-blur border border-white/30 shadow-sm hover:bg-white/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {project.title}
                  </h1>
                  <p className="text-sm text-slate-500">
                    Created {formatDate(project.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleEdit}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-blue-50 text-blue-600 border border-blue-200 shadow-sm hover:bg-blue-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Project
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 shadow-sm hover:bg-red-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </motion.button>
              </div>
            </div>
          </motion.header>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 p-1 bg-white/60 backdrop-blur rounded-xl border border-white/30 shadow-sm w-fit">
              <button
                onClick={() => handleTabChange('tasks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <ListTodo className="w-4 h-4" />
                Task Details
              </button>
              <button
                onClick={() => handleTabChange('scheduler')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'scheduler'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <Brain className="w-4 h-4" />
                Smart Scheduler
              </button>
            </div>
          </motion.div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' ? (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Project Overview */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl bg-white/80 p-6 border border-gray-400 mb-6"
                >
                  <h2 className="font-semibold text-lg mb-4">Project Overview</h2>

                  {project.description && (
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{project.description}</p>
                    </div>
                  )}

                  {/* Task Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-white/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Circle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Tasks</p>
                          <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-white/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-2xl font-semibold text-gray-900">{taskStats.completed}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-white/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-2xl font-semibold text-gray-900">{Math.round(taskStats.progress)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {taskStats.total > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Overall Progress</span>
                        <span>{taskStats.completed} of {taskStats.total} tasks completed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-emerald-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${taskStats.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </motion.section>

                {/* Tasks Section */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-2xl bg-white/80 backdrop-blur p-6 border border-gray-400"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Tasks</h2>
                    <button 
                      onClick={handleAddTask}
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm hover:bg-emerald-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>

                  {project.tasks && project.tasks.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {project.tasks.map((task, index) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl border transition-all ${task.isCompleted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {task.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                )}
                              </div>

                              <div className="flex-1">
                                <h3 className={`font-medium ${task.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                                  }`}>
                                  {task.title}
                                </h3>

                                {task.description && (
                                  <p className={`text-sm mt-1 ${task.isCompleted ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.estimatedHours}h
                                  </span>

                                  {task.dueDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}

                            
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Circle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks yet</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Add tasks to start organizing your project work.
                      </p>
                      <button 
                        onClick={handleAddTask}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Add Your First Task
                      </button>
                    </div>
                  )}
                </motion.section>
              </motion.div>
            ) : (
              <motion.div
                key="scheduler"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-lg border border-white/30"
              >
                <SmartScheduler
                  projectId={projectId}
                  initialTasks={project.tasks?.map(task => ({
                    title: task.title,
                    estimatedHours: task.estimatedHours ? task.estimatedHours : 1,
                    dueDate: task.dueDate,
                    dependencies: task.dependencies
                  })) || []}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Project Modal */}
          <ProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            mode="edit"
            project={project}
            onSuccess={handleEditSuccess}
          />

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Project"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex p-3 bg-red-100 rounded-full">
                  <AlertTriangle size={15} className="text-red-600" />
                </div>
                <div>

                  <h3 className="text-md font-semibold text-gray-600">
                    Are you sure you want to delete this project?
                  </h3>
                  <p className='text-gray-600 text-sm'> This cannot be undone</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-medium text-gray-900"><span className='text-gray-600 font-semibold'> Title : </span> {project.title}</p>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1"><span className='text-gray-600 font-semibold'> Description : </span> {project.description}</p>
                )}
                {project.tasks && project.tasks.length > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    This will also delete {project.tasks.length} task{project.tasks.length === 1 ? '' : 's'}.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>

          {/* Task Modal */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={handleTaskModalClose}
            mode="create"
            onSuccess={handleTaskSuccess}
            isLoading={isAddingTask}
          />

          {/* Bottom Navigation */}
          <BottomBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </PageTransition>
  );
}

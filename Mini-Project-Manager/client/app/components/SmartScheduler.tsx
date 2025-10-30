'use client';

import React, { useState, useEffect } from 'react';
import { SchedulerTaskInput, ScheduleResponse, ApiError } from '../types/projects';
import { generateSchedule } from '../services/projects';
import LoadingButton from './ui/LoadingButton';
import ErrorMessage from './ui/ErrorMessage';

interface SmartSchedulerProps {
  projectId?: number;
  initialTasks?: SchedulerTaskInput[];
  onScheduleGenerated?: (schedule: ScheduleResponse) => void;
}

interface TaskFormData {
  title: string;
  estimatedHours: number;
  dueDate: string;
  dependencies: string[];
}

const initialTaskForm: TaskFormData = {
  title: '',
  estimatedHours: 1,
  dueDate: '',
  dependencies: []
};

export default function SmartScheduler({ 
  projectId = 1, 
  initialTasks = [],
  onScheduleGenerated 
}: SmartSchedulerProps) {
  const [tasks, setTasks] = useState<SchedulerTaskInput[]>(initialTasks);
  const [taskForm, setTaskForm] = useState<TaskFormData>(initialTaskForm);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dependencyInput, setDependencyInput] = useState('');

  // Clear error when tasks change
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [tasks]);

  const validateTaskForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!taskForm.title.trim()) {
      errors.title = 'Task title is required';
    } else if (taskForm.title.trim().length < 2) {
      errors.title = 'Task title must be at least 2 characters';
    }

    if (taskForm.estimatedHours <= 0) {
      errors.estimatedHours = 'Estimated hours must be greater than 0';
    } else if (taskForm.estimatedHours > 168) {
      errors.estimatedHours = 'Estimated hours cannot exceed 168 (1 week)';
    }

    if (taskForm.dueDate) {
      const dueDate = new Date(taskForm.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof TaskFormData, value: string | number | string[]) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDependencyAdd = () => {
    if (dependencyInput.trim() && !taskForm.dependencies.includes(dependencyInput.trim())) {
      const newDependencies = [...taskForm.dependencies, dependencyInput.trim()];
      handleInputChange('dependencies', newDependencies);
      setDependencyInput('');
    }
  };

  const handleDependencyRemove = (dependency: string) => {
    const newDependencies = taskForm.dependencies.filter(dep => dep !== dependency);
    handleInputChange('dependencies', newDependencies);
  };

  const handleDependencyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDependencyAdd();
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTaskForm()) {
      return;
    }

    const newTask: SchedulerTaskInput = {
      title: taskForm.title.trim(),
      estimatedHours: taskForm.estimatedHours,
      dueDate: taskForm.dueDate || undefined,
      dependencies: taskForm.dependencies
    };

    setTasks(prev => [...prev, newTask]);
    setTaskForm(initialTaskForm);
    setDependencyInput('');
    setError('');
  };

  const handleRemoveTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
    setSchedule(null); // Clear schedule when tasks change
  };

  const handleGenerateSchedule = async () => {
    if (tasks.length === 0) {
      setError('Please add at least one task before generating a schedule');
      return;
    }

    setIsGeneratingSchedule(true);
    setError('');

    try {
      const scheduleResponse = await generateSchedule(projectId, tasks);
      setSchedule(scheduleResponse);
      
      if (onScheduleGenerated) {
        onScheduleGenerated(scheduleResponse);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to generate schedule. Please try again.');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Scheduler</h1>
        <p className="text-gray-600">
          Add tasks and let our AI optimize your schedule for maximum efficiency
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Input Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Task</h2>
          
          <form onSubmit={handleAddTask} className="space-y-4">
            {/* Task Title */}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                id="task-title"
                type="text"
                value={taskForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  formErrors.title 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter task title"
                maxLength={100}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            {/* Estimated Hours */}
            <div>
              <label htmlFor="estimated-hours" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours *
              </label>
              <input
                id="estimated-hours"
                type="number"
                min="0.5"
                max="168"
                step="0.5"
                value={taskForm.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  formErrors.estimatedHours 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="1.0"
              />
              {formErrors.estimatedHours && (
                <p className="mt-1 text-sm text-red-600">{formErrors.estimatedHours}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                id="due-date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  formErrors.dueDate 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.dueDate}</p>
              )}
            </div>

            {/* Dependencies */}
            <div>
              <label htmlFor="dependencies" className="block text-sm font-medium text-gray-700 mb-2">
                Dependencies (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  id="dependencies"
                  type="text"
                  value={dependencyInput}
                  onChange={(e) => setDependencyInput(e.target.value)}
                  onKeyPress={handleDependencyKeyPress}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="Enter task name that must be completed first"
                />
                <button
                  type="button"
                  onClick={handleDependencyAdd}
                  disabled={!dependencyInput.trim()}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              
              {/* Dependencies List */}
              {taskForm.dependencies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {taskForm.dependencies.map((dep, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {dep}
                      <button
                        type="button"
                        onClick={() => handleDependencyRemove(dep)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add Task Button */}
            <button
              type="submit"
              disabled={!taskForm.title.trim() || taskForm.estimatedHours <= 0}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Task List and Schedule */}
        <div className="space-y-6">
          {/* Current Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Tasks ({tasks.length})
              </h2>
              {tasks.length > 0 && (
                <LoadingButton
                  onClick={handleGenerateSchedule}
                  isLoading={isGeneratingSchedule}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Generate Schedule
                </LoadingButton>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No tasks added yet</p>
                <p className="text-sm">Add tasks using the form to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <div className="mt-1 text-sm text-gray-600 space-y-1">
                          <p>⏱️ {task.estimatedHours} hour{task.estimatedHours !== 1 ? 's' : ''}</p>
                          {task.dueDate && (
                            <p>📅 Due: {formatDate(task.dueDate)}</p>
                          )}
                          {task.dependencies.length > 0 && (
                            <p>🔗 Depends on: {task.dependencies.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTask(index)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Remove task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generated Schedule */}
          {schedule && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recommended Schedule
              </h2>
              
              {schedule.recommendedOrder.length > 0 ? (
                <div className="space-y-3">
                  {schedule.recommendedOrder.map((taskTitle, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-green-50 border border-green-200 rounded-xl"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{taskTitle}</p>
                      </div>
                    </div>
                  ))}
                  
                  {schedule.estimatedCompletion && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">
                        <strong>Estimated Completion:</strong> {formatDate(schedule.estimatedCompletion)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No schedule recommendations available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
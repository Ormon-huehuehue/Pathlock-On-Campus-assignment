'use client';

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { SchedulerTaskInput, ScheduleResponse, ApiError } from '../types/projects';
import { generateSchedule } from '../services/projects';
import LoadingButton from './ui/LoadingButton';
import ErrorMessage from './ui/ErrorMessage';
import { DatePicker } from './DatePicker';

// Interface for state preservation
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

interface SmartSchedulerProps {
  projectId?: number;
  initialTasks?: SchedulerTaskInput[];
  onScheduleGenerated?: (schedule: ScheduleResponse) => void;
  preservedState?: SchedulerState | null;
  onStateChange?: (state: SchedulerState) => void;
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

const SmartScheduler = memo(({ 
  projectId = 1, 
  initialTasks = [],
  onScheduleGenerated,
  preservedState,
  onStateChange
}: SmartSchedulerProps) => {
  // Initialize state from preserved state or defaults
  const [tasks, setTasks] = useState<SchedulerTaskInput[]>(
    preservedState?.tasks || initialTasks
  );
  const [taskForm, setTaskForm] = useState<TaskFormData>(
    preservedState?.taskForm || initialTaskForm
  );
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(
    preservedState?.schedule || null
  );
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [error, setError] = useState<string>(preservedState?.error || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>(
    preservedState?.formErrors || {}
  );
  const [dependencyInput, setDependencyInput] = useState(
    preservedState?.dependencyInput || ''
  );

  // Refs for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear error when tasks change
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [tasks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Notify parent component of state changes for preservation
  useEffect(() => {
    if (onStateChange) {
      const currentState: SchedulerState = {
        tasks,
        schedule,
        taskForm,
        formErrors,
        dependencyInput,
        error
      };
      onStateChange(currentState);
    }
  }, [tasks, schedule, taskForm, formErrors, dependencyInput, error, onStateChange]);

  const validateTaskForm = useCallback((): boolean => {
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
  }, [taskForm]);

  const handleInputChange = useCallback((field: keyof TaskFormData, value: string | number | string[]) => {
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
  }, [formErrors]);

  const handleDependencyAdd = useCallback(() => {
    if (dependencyInput.trim() && !taskForm.dependencies.includes(dependencyInput.trim())) {
      const newDependencies = [...taskForm.dependencies, dependencyInput.trim()];
      handleInputChange('dependencies', newDependencies);
      setDependencyInput('');
    }
  }, [dependencyInput, taskForm.dependencies, handleInputChange]);

  const handleDependencyRemove = useCallback((dependency: string) => {
    const newDependencies = taskForm.dependencies.filter(dep => dep !== dependency);
    handleInputChange('dependencies', newDependencies);
  }, [taskForm.dependencies, handleInputChange]);

  const handleDependencyKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDependencyAdd();
    }
  }, [handleDependencyAdd]);

  const handleAddTask = useCallback((e: React.FormEvent) => {
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
  }, [validateTaskForm, taskForm]);

  const handleRemoveTask = useCallback((index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
    setSchedule(null); // Clear schedule when tasks change
  }, []);

  const handleGenerateSchedule = useCallback(async () => {
    if (tasks.length === 0) {
      setError('Please add at least one task before generating a schedule');
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsGeneratingSchedule(true);
    setError('');

    try {
      const scheduleResponse = await generateSchedule(projectId, tasks);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setSchedule(scheduleResponse);
      
      if (onScheduleGenerated) {
        onScheduleGenerated(scheduleResponse);
      }
    } catch (err) {
      // Don't show error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to generate schedule. Please try again.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsGeneratingSchedule(false);
      }
    }
  }, [tasks, projectId, onScheduleGenerated]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Scheduler</h2>
        <p className="text-gray-600">
          Add tasks and let our AI optimize your schedule for maximum efficiency
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Input Form */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 border border-white/30">
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
                value={taskForm.estimatedHours}
                onChange={(e) => {
                const value = e.target.value;
                handleInputChange(
                  'estimatedHours',
                  value === '' ? '' : parseFloat(value)
                );
              }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-number-spin-box]:appearance-none ${
                  formErrors.estimatedHours
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="1 ( hour )"
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
              <DatePicker
                value={taskForm.dueDate}
                onChange={(date) => handleInputChange('dueDate', date)}
                placeholder="Select due date"
                error={!!formErrors.dueDate}
                minDate={new Date()}
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
                  onKeyDown={handleDependencyKeyPress}
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
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Task List and Schedule */}
        <div className="space-y-6">
          {/* Current Tasks */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Tasks ({tasks.length})
              </h2>
              {tasks.length > 0 && (
                <LoadingButton
                  onClick={handleGenerateSchedule}
                  isLoading={isGeneratingSchedule}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Generate Schedule
                </LoadingButton>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks added yet</h3>
                <p className="text-sm text-gray-600">Add tasks using the form to get started with your schedule</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="group relative border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate" title={task.title}>
                          {task.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Task #{index + 1}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTask(index)}
                        className="flex-shrink-0 ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Remove task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Task Metadata */}
                    <div className="space-y-3">
                      {/* Duration */}
                      <div className="flex items-center text-sm">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-lg mr-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {task.estimatedHours} hour{task.estimatedHours !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">Estimated duration</p>
                        </div>
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center text-sm">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-lg mr-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDate(task.dueDate)}
                            </p>
                            <p className="text-xs text-gray-500">Due date</p>
                          </div>
                        </div>
                      )}

                      {/* Dependencies */}
                      {task.dependencies.length > 0 && (
                        <div className="flex items-start text-sm">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-lg mr-3 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 mb-1">Dependencies</p>
                            <div className="flex flex-wrap gap-1">
                              {task.dependencies.map((dep, depIndex) => (
                                <span
                                  key={depIndex}
                                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                                  title={dep}
                                >
                                  {dep.length > 15 ? `${dep.substring(0, 15)}...` : dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Task Status Indicator */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generated Schedule */}
          {schedule && (
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 border border-white/30">
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
})

SmartScheduler.displayName = 'SmartScheduler';

export default SmartScheduler;
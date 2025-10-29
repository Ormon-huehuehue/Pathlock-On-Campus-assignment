
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

type Task = {
  id: number;
  description: string;
  isCompleted: boolean;
};

const API_URL = 'http://localhost:5000/api/tasks';


function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Task[]>(API_URL);
      setTasks(res.data);
      localStorage.setItem('tasks', JSON.stringify(res.data));
    } catch (err) {
      setError('Failed to fetch tasks.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post(API_URL, { description: newTask, isCompleted: false });
      setNewTask('');
      await fetchTasks();
    } catch {
      setError('Failed to add task.');
    }
    setLoading(false);
  };

  const toggleTask = async (task: Task) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`${API_URL}/${task.id}`, {
        ...task,
        isCompleted: !task.isCompleted,
      });
      await fetchTasks();
    } catch {
      setError('Failed to update task.');
    }
    setLoading(false);
  };

  const deleteTask = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchTasks();
    } catch {
      setError('Failed to delete task.');
    }
    setLoading(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mt-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Task Manager</h1>
        <form onSubmit={addTask} className="flex mb-4 gap-2">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a new task"
            disabled={loading}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">Add</button>
        </form>
        <div className="flex justify-center mb-4 gap-2">
          <button onClick={() => setFilter('all')} disabled={filter === 'all' || loading} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'} disabled:opacity-50`}>All</button>
          <button onClick={() => setFilter('active')} disabled={filter === 'active' || loading} className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'} disabled:opacity-50`}>Active</button>
          <button onClick={() => setFilter('completed')} disabled={filter === 'completed' || loading} className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'} disabled:opacity-50`}>Completed</button>
        </div>
        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <ul className="list-none p-0">
            {filteredTasks.map(task => (
              <li key={task.id} className="flex items-center mb-2 bg-gray-50 rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTask(task)}
                  disabled={loading}
                  className="mr-2"
                />
                <span className={`flex-1 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>{task.description}</span>
                <button onClick={() => deleteTask(task.id)} disabled={loading} className="ml-2 text-red-500 hover:text-red-700 disabled:opacity-50">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface SchedulerTaskInput {
  title: string;
  estimatedHours: number;
  dueDate?: string;
  dependencies: string[];
}


interface Task {
  id: number;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
}
interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  tasks?: Task[];
}

export const ProjectDetails: React.FC<{ token: string; projectId: number }> = ({ token, projectId }) => {
  // Smart Scheduler UI state (moved inside component)
  const [schedulerTasks, setSchedulerTasks] = useState<SchedulerTaskInput[]>([]);
  // Load Smart Scheduler tasks from localStorage on mount/project change
  useEffect(() => {
    const key = `schedulerTasks_${projectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setSchedulerTasks(JSON.parse(saved));
      } catch {}
    } else {
      setSchedulerTasks([]);
    }
  }, [projectId]);

  // Save Smart Scheduler tasks to localStorage whenever they change
  useEffect(() => {
    const key = `schedulerTasks_${projectId}`;
    localStorage.setItem(key, JSON.stringify(schedulerTasks));
  }, [schedulerTasks, projectId]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [recommendedOrder, setRecommendedOrder] = useState<string[] | null>(null);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedHours, setSchedHours] = useState('');
  const [schedDue, setSchedDue] = useState('');
  const [schedDeps, setSchedDeps] = useState<string>('');
  const [schedError, setSchedError] = useState('');
  const [schedLoading, setSchedLoading] = useState(false);

  const handleAddSchedulerTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle || !schedHours) return;
    setSchedulerTasks(prev => [
      ...prev,
      {
        title: schedTitle,
        estimatedHours: Number(schedHours),
        dueDate: schedDue || undefined,
        dependencies: schedDeps.split(',').map(s => s.trim()).filter(Boolean)
      }
    ]);
    setSchedTitle(''); setSchedHours(''); setSchedDue(''); setSchedDeps('');
  };

  const handleRunScheduler = async () => {
    setSchedError('');
    setSchedLoading(true);
    setRecommendedOrder(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tasks: schedulerTasks })
      });
      if (!res.ok) throw new Error('Failed to get schedule');
      const data = await res.json();
      setRecommendedOrder(data.recommendedOrder || []);
    } catch (err: any) {
      setSchedError(err.message);
    } finally {
      setSchedLoading(false);
    }
  };

  const handleRemoveSchedulerTask = (idx: number) => {
    setSchedulerTasks(tasks => tasks.filter((_, i) => i !== idx));
  };
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();
        setProject(data);
        setTasks(data.tasks || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, token]);

  return (
    <div className="dashboard-container" style={{marginTop: 40, marginBottom: 40}}>
      <button onClick={() => navigate(-1)} style={{position:'absolute',left:20,top:20,background:'#e0e7ff',color:'#3b82f6',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:500,cursor:'pointer'}}>Back</button>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{color:'red'}}>{error}</div>
      ) : project && (
        <>
          <h2 style={{color:'#3b82f6',marginBottom:8}}>{project.title}</h2>
          <div style={{color:'#64748b',marginBottom:8}}>{project.description}</div>
          <div style={{color:'#94a3b8',fontSize:'0.95rem',marginBottom:24}}>
            Created: {new Date(project.createdAt).toLocaleString()}
          </div>
          <h3 style={{marginTop:0,marginBottom:8}}>Tasks</h3>
          {tasks.length === 0 ? (
            <div style={{color:'#64748b',marginBottom:16}}>No tasks yet.</div>
          ) : (
            <ul style={{marginBottom:16}}>
              {tasks.map(t => (
                <li key={t.id} style={{marginBottom:4}}>
                  <input type="checkbox" checked={t.isCompleted} readOnly style={{marginRight:8}} />
                  {t.title} {t.dueDate && <span style={{color:'#94a3b8'}}>({t.dueDate})</span>}
                </li>
              ))}
            </ul>
          )}
          <div style={{marginTop:32}}>
            <button onClick={() => setShowScheduler(s => !s)} className="scheduler-toggle-btn">
              {showScheduler ? 'Hide Smart Scheduler' : 'Show Smart Scheduler'}
            </button>
            {showScheduler && (
              <div className="scheduler-card">
                <h3 style={{marginTop: 0}}>Smart Scheduler</h3>
                <form onSubmit={handleAddSchedulerTask} className="scheduler-form">
                  <input value={schedTitle} onChange={e => setSchedTitle(e.target.value)} placeholder="Task Title" required />
                  <input value={schedHours} onChange={e => setSchedHours(e.target.value)} placeholder="Est. Hours" type="number" min={1} required />
                  <input value={schedDue} onChange={e => setSchedDue(e.target.value)} placeholder="Due Date" type="date" />
                  <input value={schedDeps} onChange={e => setSchedDeps(e.target.value)} placeholder="Dependencies (comma separated)" />
                  <button type="submit" className="scheduler-add-btn">Add</button>
                </form>
                <ul className="scheduler-task-list">
                  {schedulerTasks.map((t, i) => (
                    <li key={i} className="scheduler-task-item">
                      <b>{t.title}</b> ({t.estimatedHours}h{t.dueDate ? `, due ${t.dueDate}` : ''})
                      {t.dependencies.length > 0 && <span> | Depends on: {t.dependencies.join(', ')}</span>}
                      <button onClick={() => handleRemoveSchedulerTask(i)} className="scheduler-remove-btn">Remove</button>
                    </li>
                  ))}
                </ul>
                <button onClick={handleRunScheduler} disabled={schedulerTasks.length === 0 || schedLoading} className="scheduler-run-btn">
                  {schedLoading ? 'Scheduling...' : 'Get Recommended Order'}
                </button>
                {schedError && <div className="scheduler-error">{schedError}</div>}
                {recommendedOrder && (
                  <div className="scheduler-result">
                    <b>Recommended Order:</b>
                    <ol>
                      {recommendedOrder.map((t, i) => <li key={i}>{t}</li>)}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

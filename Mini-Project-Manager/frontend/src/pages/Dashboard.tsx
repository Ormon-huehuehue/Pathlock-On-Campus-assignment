import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
}

export const Dashboard: React.FC<{ token: string }> = ({ token }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      setProjects(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
      if (!res.ok) throw new Error('Failed to create project');
      setTitle(''); setDescription('');
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete project');
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpen = (id: number) => {
    navigate(`/projects/${id}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Projects</h2>
      </div>
      <form className="project-form" onSubmit={handleCreate}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required minLength={3} maxLength={100} />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" maxLength={500} />
        <button type="submit">Create</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <ul className="project-list">
          {projects.map(p => (
            <li className="project-item" key={p.id}>
              <div className="project-title">{p.title}</div>
              {p.description && <div className="project-desc">{p.description}</div>}
              <div className="project-meta">Created: {new Date(p.createdAt).toLocaleString()}</div>
              <div className="project-actions">
                <button onClick={() => handleOpen(p.id)}>Open</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

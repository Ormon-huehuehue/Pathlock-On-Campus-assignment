import React, { useState } from 'react';
import './AuthPages.css';

interface AuthProps {
  onAuth: (token: string) => void;
}

export const LoginPage: React.FC<AuthProps> = ({ onAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) return <RegisterPage onAuth={onAuth} setShowRegister={setShowRegister} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      onAuth(data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
  <h2>Welcome back!</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <div style={{fontSize: '0.9em', color: '#6b7280', marginBottom: '0.5em', textAlign: 'left'}}>
          Password must be at least 8 characters, contain 1 uppercase letter and 1 number.
        </div>
        <button type="submit">Login</button>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-switch">
          Don't have an account?{' '}
          <span className="auth-link" onClick={() => setShowRegister(true)}>Register</span>
        </div>
      </form>
    </div>
  );
};

export const RegisterPage: React.FC<AuthProps & { setShowRegister?: (v: boolean) => void }> = ({ onAuth, setShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        let msg = 'Registration failed';
        try {
          const data = await res.json();
          msg = data?.title || data?.error || data?.[0]?.description || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      onAuth(data.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
  <h2>Let's get started!</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <div style={{fontSize: '0.9em', color: '#6b7280', marginBottom: '0.5em', textAlign: 'left'}}>
          Password must be at least 8 characters, contain 1 uppercase letter and 1 number.
        </div>
        <button type="submit">Register</button>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-switch">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => setShowRegister && setShowRegister(false)}>Login</span>
        </div>
      </form>
    </div>
  );
};

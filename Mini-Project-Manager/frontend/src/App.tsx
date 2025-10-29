import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetails } from './pages/ProjectDetails';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'));
  const [showRegister, setShowRegister] = useState(false);

  const handleAuth = (jwt: string) => {
    setToken(jwt);
    localStorage.setItem('jwt', jwt);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('jwt');
  };

  return (
    <Router>
      {!token ? (
        <div style={{maxWidth: 400, margin: 'auto'}}>
          <Routes>
            <Route path="/register" element={<RegisterPage onAuth={handleAuth} />} />
            <Route path="/*" element={<LoginPage onAuth={handleAuth} />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={
            <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <button
                onClick={handleLogout}
                style={{
                  position: 'fixed',
                  top: 24,
                  right: 32,
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.6rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  zIndex: 100,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                Logout
              </button>
              <div style={{position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto'}}>
                <Dashboard token={token} />
              </div>
            </div>
          } />
          <Route path="/projects/:id" element={
            <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto'}}>
                <ProjectDetailsWrapper token={token} />
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
};

const ProjectDetailsWrapper: React.FC<{ token: string }> = ({ token }) => {
  const match = window.location.pathname.match(/\/projects\/(\d+)/);
  const projectId = match ? parseInt(match[1], 10) : undefined;
  if (!projectId) {
    return (
      <div style={{padding: 32, textAlign: 'center'}}>Project not found.<br /><button onClick={() => window.location.href = '/'}>Back to Dashboard</button></div>
    );
  }
  return <ProjectDetails token={token} projectId={projectId} />;
};

export default App;

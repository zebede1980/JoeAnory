import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StoryWorkspace from './components/StoryWorkspace';
import CardsManager from './components/CardsManager';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/AuthPage';
import { me } from './api';

const styles = {
  app: { display: 'flex', height: '100vh', overflow: 'hidden' },
  main: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};

export default function App() {
  const [view, setView] = useState('stories');
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChecking(false);
      return;
    }
    me()
      .then(() => setAuthenticated(true))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setChecking(false));
  }, []);

  const handleAuth = () => setAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    setActiveStoryId(null);
    setView('stories');
  };

  if (checking) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e', color: '#888' }}>Loading...</div>;
  }

  if (!authenticated) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div style={styles.app}>
      <Sidebar view={view} setView={setView} activeStoryId={activeStoryId} setActiveStoryId={setActiveStoryId} onLogout={handleLogout} />
      <div style={styles.main}>
        {view === 'stories' && <StoryWorkspace storyId={activeStoryId} setActiveStoryId={setActiveStoryId} />}
        {view === 'cards' && <CardsManager />}
        {view === 'settings' && <SettingsPage />}
      </div>
    </div>
  );
}

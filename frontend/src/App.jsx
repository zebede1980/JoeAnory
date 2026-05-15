import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import StoryWorkspace from './components/StoryWorkspace';
import CardsManager from './components/CardsManager';
import SettingsPage from './components/SettingsPage';

const styles = {
  app: { display: 'flex', height: '100vh', overflow: 'hidden' },
  main: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};

export default function App() {
  const [view, setView] = useState('stories'); // stories, cards, settings
  const [activeStoryId, setActiveStoryId] = useState(null);

  return (
    <div style={styles.app}>
      <Sidebar view={view} setView={setView} activeStoryId={activeStoryId} setActiveStoryId={setActiveStoryId} />
      <div style={styles.main}>
        {view === 'stories' && <StoryWorkspace storyId={activeStoryId} setActiveStoryId={setActiveStoryId} />}
        {view === 'cards' && <CardsManager />}
        {view === 'settings' && <SettingsPage />}
      </div>
    </div>
  );
}

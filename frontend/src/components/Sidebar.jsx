import React, { useState, useEffect } from 'react';
import { getStories, createStory, deleteStory } from '../api';

const styles = {
  sidebar: { width: 260, background: '#16213e', display: 'flex', flexDirection: 'column', borderRight: '1px solid #0f3460' },
  header: { padding: 16, borderBottom: '1px solid #0f3460', fontSize: 18, fontWeight: 600, color: '#e94560' },
  nav: { display: 'flex', gap: 4, padding: 8 },
  navBtn: (active) => ({ flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', background: active ? '#e94560' : '#0f3460', color: '#fff', fontWeight: 500 }),
  list: { flex: 1, overflowY: 'auto', padding: 8 },
  item: (active) => ({ padding: 10, borderRadius: 6, cursor: 'pointer', marginBottom: 6, background: active ? '#0f3460' : 'transparent', borderLeft: active ? '3px solid #e94560' : '3px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
  itemTitle: { fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  deleteBtn: { background: 'transparent', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 16, padding: '0 4px' },
  newBtn: { margin: 8, padding: 10, border: 'none', borderRadius: 6, background: '#e94560', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  empty: { padding: 16, textAlign: 'center', color: '#888', fontSize: 13 },
};

export default function Sidebar({ view, setView, activeStoryId, setActiveStoryId }) {
  const [stories, setStories] = useState([]);

  const loadStories = async () => {
    try {
      const res = await getStories();
      setStories(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadStories(); }, []);

  const handleNewStory = async () => {
    const title = prompt('Story title:');
    if (!title) return;
    try {
      const res = await createStory({ title, synopsis: '' });
      setStories([res.data, ...stories]);
      setActiveStoryId(res.data.id);
      setView('stories');
    } catch (e) { alert('Failed to create story'); }
  };

  const handleDeleteStory = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this story?')) return;
    try {
      await deleteStory(id);
      setStories(stories.filter(s => s.id !== id));
      if (activeStoryId === id) setActiveStoryId(null);
    } catch (e) { alert('Failed to delete story'); }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>AI Story Writer</div>
      <div style={styles.nav}>
        <button style={styles.navBtn(view === 'stories')} onClick={() => setView('stories')}>Stories</button>
        <button style={styles.navBtn(view === 'cards')} onClick={() => setView('cards')}>Cards</button>
        <button style={styles.navBtn(view === 'settings')} onClick={() => setView('settings')}>Settings</button>
      </div>
      {view === 'stories' && (
        <>
          <button style={styles.newBtn} onClick={handleNewStory}>+ New Story</button>
          <div style={styles.list}>
            {stories.length === 0 && <div style={styles.empty}>No stories yet</div>}
            {stories.map(story => (
              <div key={story.id} style={styles.item(activeStoryId === story.id)} onClick={() => { setActiveStoryId(story.id); setView('stories'); }}>
                <span style={styles.itemTitle}>{story.title}</span>
                <button style={styles.deleteBtn} onClick={(e) => handleDeleteStory(e, story.id)}>×</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

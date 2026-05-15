import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api';

const styles = {
  container: { padding: 24, overflowY: 'auto', flex: 1, maxWidth: 600 },
  header: { fontSize: 22, fontWeight: 600, marginBottom: 20, color: '#e94560' },
  group: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#e94560', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', background: '#0f3460', border: '1px solid #1a1a2e', borderRadius: 6, padding: '10px 12px', color: '#fff', fontSize: 14 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  saveBtn: { padding: '12px 24px', border: 'none', borderRadius: 6, background: '#e94560', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 10 },
  saved: { color: '#4caf50', marginLeft: 12, fontSize: 14 },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    api_base_url: 'https://api.openai.com/v1',
    api_key: '',
    model: 'gpt-4o',
    max_tokens: 2048,
    temperature: 0.8,
    context_window: 8000,
    summary_threshold: 10,
    chunk_size: 800,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(res => {
      setSettings({ ...settings, ...res.data });
    }).catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        api_base_url: settings.api_base_url,
        api_key: settings.api_key,
        model: settings.model,
        max_tokens: parseInt(settings.max_tokens) || 2048,
        temperature: parseFloat(settings.temperature) || 0.8,
        context_window: parseInt(settings.context_window) || 8000,
        summary_threshold: parseInt(settings.summary_threshold) || 10,
        chunk_size: parseInt(settings.chunk_size) || 800,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>Settings</div>

      <div style={styles.group}>
        <label style={styles.label}>API Base URL</label>
        <input style={styles.input} value={settings.api_base_url} onChange={(e) => handleChange('api_base_url', e.target.value)} placeholder="https://api.openai.com/v1" />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>API Key</label>
        <input style={styles.input} type="password" value={settings.api_key} onChange={(e) => handleChange('api_key', e.target.value)} placeholder="sk-..." />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Model</label>
        <input style={styles.input} value={settings.model} onChange={(e) => handleChange('model', e.target.value)} placeholder="gpt-4o" />
      </div>

      <div style={styles.row}>
        <div style={styles.group}>
          <label style={styles.label}>Max Tokens</label>
          <input style={styles.input} type="number" value={settings.max_tokens} onChange={(e) => handleChange('max_tokens', e.target.value)} />
        </div>
        <div style={styles.group}>
          <label style={styles.label}>Temperature</label>
          <input style={styles.input} type="number" step="0.1" min="0" max="2" value={settings.temperature} onChange={(e) => handleChange('temperature', e.target.value)} />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.group}>
          <label style={styles.label}>Context Window</label>
          <input style={styles.input} type="number" value={settings.context_window} onChange={(e) => handleChange('context_window', e.target.value)} />
        </div>
        <div style={styles.group}>
          <label style={styles.label}>Summary Threshold</label>
          <input style={styles.input} type="number" value={settings.summary_threshold} onChange={(e) => handleChange('summary_threshold', e.target.value)} />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Chunk Size (target tokens)</label>
        <input style={styles.input} type="number" value={settings.chunk_size} onChange={(e) => handleChange('chunk_size', e.target.value)} />
      </div>

      <button style={styles.saveBtn} onClick={handleSave}>Save Settings</button>
      {saved && <span style={styles.saved}>Saved!</span>}
    </div>
  );
}

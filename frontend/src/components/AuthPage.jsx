import React, { useState } from 'react';
import { login, register } from '../api';

const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e' },
  box: { width: 360, padding: 32, background: '#16213e', borderRadius: 12, border: '1px solid #0f3460' },
  header: { fontSize: 22, fontWeight: 600, color: '#e94560', marginBottom: 20, textAlign: 'center' },
  group: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#e94560', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', background: '#0f3460', border: '1px solid #1a1a2e', borderRadius: 6, padding: '10px 12px', color: '#fff', fontSize: 14 },
  btn: { width: '100%', padding: 12, border: 'none', borderRadius: 6, background: '#e94560', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 8 },
  toggle: { textAlign: 'center', marginTop: 16, color: '#888', fontSize: 13, cursor: 'pointer' },
  toggleLink: { color: '#e94560', fontWeight: 600 },
  error: { color: '#e94560', fontSize: 13, marginTop: 8, textAlign: 'center' },
};

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await login(username, password)
        : await register(username, password);
      localStorage.setItem('token', res.data.token);
      onAuth();
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.header}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</div>
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        <div style={styles.toggle} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span style={styles.toggleLink}>{mode === 'login' ? 'Sign Up' : 'Sign In'}</span>
        </div>
      </div>
    </div>
  );
}

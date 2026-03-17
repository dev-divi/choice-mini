import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppTemplate from './AppTemplate.jsx'

function Root() {
  const [mode, setMode] = useState('dashboard'); // 'dashboard' | 'demo'

  return (
    <>
      {/* MODE SWITCHER BAR */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
        display: 'flex', gap: 4, background: 'rgba(10,10,15,0.92)',
        border: '1px solid rgba(0,240,255,0.25)', borderRadius: 0,
        padding: '6px 10px', backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
      }}>
        <button
          onClick={() => setMode('dashboard')}
          style={{
            background: mode === 'dashboard' ? 'rgba(0,240,255,0.15)' : 'transparent',
            border: mode === 'dashboard' ? '1px solid rgba(0,240,255,0.5)' : '1px solid transparent',
            color: mode === 'dashboard' ? '#00f0ff' : 'rgba(255,255,255,0.35)',
            fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
            padding: '4px 12px', cursor: 'pointer', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
        >
          ◈ MY DASHBOARD
        </button>
        <button
          onClick={() => setMode('demo')}
          style={{
            background: mode === 'demo' ? 'rgba(0,255,136,0.1)' : 'transparent',
            border: mode === 'demo' ? '1px solid rgba(0,255,136,0.4)' : '1px solid transparent',
            color: mode === 'demo' ? '#00ff88' : 'rgba(255,255,255,0.35)',
            fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
            padding: '4px 12px', cursor: 'pointer', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
        >
          ⚡ OPERATOR DEMO
        </button>
      </div>

      {/* ACTIVE VIEW */}
      {mode === 'dashboard' ? <App /> : <AppTemplate />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

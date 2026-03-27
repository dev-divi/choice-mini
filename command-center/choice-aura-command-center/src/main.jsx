import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppTemplate from './AppTemplate.jsx'

function Root() {
  const [mode, setMode] = useState('demo'); // 'dashboard' | 'demo'
  const [themeName, setThemeName] = useState('clean'); // 'hud' | 'clean'

  const isClean = themeName === 'clean';

  // switcher bar adapts to current theme
  const barBg = isClean ? 'rgba(247,243,236,0.97)' : 'rgba(10,10,15,0.92)';
  const barBorder = isClean ? 'rgba(180,160,140,0.5)' : 'rgba(0,240,255,0.25)';
  const activeColorDash = isClean ? '#1a7a8a' : '#00f0ff';
  const activeColorDemo = isClean ? '#2e7a50' : '#00ff88';
  const inactiveColor = isClean ? 'rgba(90,83,74,0.5)' : 'rgba(255,255,255,0.35)';

  return (
    <>
      {/* MODE SWITCHER BAR */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
        display: 'flex', gap: 4, background: barBg,
        border: `1px solid ${barBorder}`, borderRadius: 0,
        padding: '6px 10px', backdropFilter: 'blur(8px)',
        boxShadow: isClean ? '0 2px 12px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.5)',
        fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
        transition: 'all 0.3s',
      }}>
        <button
          onClick={() => setMode('dashboard')}
          style={{
            background: mode === 'dashboard' ? (isClean ? 'rgba(26,122,138,0.12)' : 'rgba(0,240,255,0.15)') : 'transparent',
            border: mode === 'dashboard' ? `1px solid ${activeColorDash}80` : '1px solid transparent',
            color: mode === 'dashboard' ? activeColorDash : inactiveColor,
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
            background: mode === 'demo' ? (isClean ? 'rgba(46,122,80,0.1)' : 'rgba(0,255,136,0.1)') : 'transparent',
            border: mode === 'demo' ? `1px solid ${activeColorDemo}60` : '1px solid transparent',
            color: mode === 'demo' ? activeColorDemo : inactiveColor,
            fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
            padding: '4px 12px', cursor: 'pointer', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
        >
          ⚡ OPERATOR DEMO
        </button>
      </div>

      {/* ACTIVE VIEW — theme passed as controlled props */}
      {mode === 'dashboard'
        ? <App themeName={themeName} setThemeName={setThemeName} />
        : <AppTemplate themeName={themeName} setThemeName={setThemeName} />
      }
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

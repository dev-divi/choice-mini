import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppTemplate from './AppTemplate.jsx'

function Root() {
  const [themeName, setThemeName] = useState('clean');

  return <AppTemplate themeName={themeName} setThemeName={setThemeName} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

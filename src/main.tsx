import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function init() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const { initializeMSW } = await import('./msw');
    await initializeMSW();
  }

  // If the app is opened at the root path, make the first visible page the login page
  // (replace the URL without reloading so routing will render the login route)
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    window.history.replaceState(null, '', '/login');
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();

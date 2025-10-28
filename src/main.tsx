import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function init() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const { initializeMSW } = await import('./msw');
    await initializeMSW();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();

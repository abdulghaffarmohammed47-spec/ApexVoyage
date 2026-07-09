/* ═══════════════════════════════════════════════════════════════
   ApexVoyage — Application DOM Entry Point
   ═══════════════════════════════════════════════════════════════ */

// @ts-nocheck
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root DOM element not found. Ensure #root exists in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

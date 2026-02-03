import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { applyTheme, getStoredTheme } from './utils/themeService';

// Apply theme before React renders to ensure CSS variables are available
// for components like MatrixRain that read them on mount
applyTheme(getStoredTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

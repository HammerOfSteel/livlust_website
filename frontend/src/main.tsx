import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n/index';
import Home from './pages/Home';
import './index.css';

// Apply theme from env var (set data-theme on <html>)
document.documentElement.setAttribute(
  'data-theme',
  import.meta.env.VITE_THEME ?? 'ocean'
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Note: StrictMode is disabled in production builds automatically
// In development, it causes double-rendering which can trigger duplicate QR scanners
// We keep it enabled for development to catch potential issues, but the QRScanner
// component now handles this properly with cleanup logic
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


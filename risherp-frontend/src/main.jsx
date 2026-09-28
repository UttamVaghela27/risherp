import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * Entry Point
 * 
 * This is the very first JavaScript that runs.
 * It renders the <App /> component into the #root div in index.html.
 * 
 * StrictMode helps find bugs during development by:
 * - Rendering components twice to detect side effects
 * - Warning about deprecated APIs
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

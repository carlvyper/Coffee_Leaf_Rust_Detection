// Dynamically inject Google AdSense Script
if (typeof window !== 'undefined') {
  const script = document.createElement('script');
  script.async = true;
  script.src = "https://googlesyndication.com";
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
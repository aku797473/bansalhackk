import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { startKeepAlive } from './services/keepAlive';

// Wake up all Render microservices immediately + every 10 min
startKeepAlive();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

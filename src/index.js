// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/css/normalize.css';
import './assets/css/webflow.css';
import './assets/css/jeroen-paws.webflow.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

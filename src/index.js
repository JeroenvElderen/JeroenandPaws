// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/normalize.css';
import './assets/styles/webflow.css';
import './assets/styles/jeroen-paws.webflow.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

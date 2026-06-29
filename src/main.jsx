import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initAuthentication } from './keycloak.jsx';


const root = ReactDOM.createRoot(document.getElementById('root'));

initAuthentication((authenticated) => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
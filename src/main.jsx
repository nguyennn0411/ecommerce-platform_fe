import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App.jsx';
import './index.css';
import { initAuthentication } from './keycloak.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

initAuthentication((authenticated) => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

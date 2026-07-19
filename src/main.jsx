import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { initAuthentication } from './keycloak.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

initAuthentication((authProfile) => {
  root.render(
    <React.StrictMode>
      <App initialAuth={authProfile} />
    </React.StrictMode>
  );
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import keycloak from "./keycloak";

keycloak
  .init({
    onLoad: "login-required",
    pckeMethod: "S256"
  })
  .then((authenticated) => {
    if (authenticated) {
      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <App></App>
        </StrictMode>
      );
    }
  })

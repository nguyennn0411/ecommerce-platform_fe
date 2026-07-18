import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAuthentication } from './keycloak.jsx'

const root = createRoot(document.getElementById('root'))

initAuthentication(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

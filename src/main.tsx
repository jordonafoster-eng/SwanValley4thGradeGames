import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './contexts/UserContext.tsx'
import { ProgressProvider } from './contexts/ProgressContext.tsx'
import { AdminProvider } from './contexts/AdminContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminProvider>
      <UserProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </UserProvider>
    </AdminProvider>
  </StrictMode>,
)

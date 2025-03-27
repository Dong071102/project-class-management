import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthContextProvider } from "./hooks/user.tsx";
import { ClassProvider } from './contexts/classContext.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <ClassProvider>
        <App />
      </ClassProvider>

    </AuthContextProvider>
  </StrictMode>,
)

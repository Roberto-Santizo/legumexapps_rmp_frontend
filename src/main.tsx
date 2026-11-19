import '@/shared/validacion/zodLocale'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { clienteConsulta } from '@/app/providers/clienteConsulta'
import { AuthenticationProvider } from '@/features/authentication/context/AuthenticationContext'
import Aplicacion from './app/Aplicacion.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsulta}>
      <BrowserRouter>
        <AuthenticationProvider>
          <Aplicacion />
        </AuthenticationProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

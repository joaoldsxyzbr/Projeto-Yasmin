import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PortaoAcesso } from './componentes/PortaoAcesso'
import './styles.css'
import './autenticacao.css'
import './pwa.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    }).catch(() => {
      // O app continua funcional mesmo se o navegador não aceitar service workers.
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PortaoAcesso>
      <App />
    </PortaoAcesso>
  </StrictMode>,
)

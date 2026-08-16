import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PortaoAcesso } from './componentes/PortaoAcesso'
import './styles.css'
import './autenticacao.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PortaoAcesso>
      <App />
    </PortaoAcesso>
  </StrictMode>,
)

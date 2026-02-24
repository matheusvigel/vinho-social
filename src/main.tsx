import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Registrar service worker apenas em produção
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('workbox-window').then(({ Workbox }) => {
    const wb = new Workbox('/sw.js')

    wb.addEventListener('waiting', () => {
      if (confirm('Nova versão disponível! Atualizar agora?')) {
        wb.messageSkipWaiting()
        window.location.reload()
      }
    })

    wb.register()
  })
}

// Remover service workers antigos em desenvolvimento
if ('serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

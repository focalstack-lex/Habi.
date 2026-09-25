import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { userPrefsService } from './services/userPrefsService'

// Apply the saved theme and language before the first paint to avoid a flash.
userPrefsService.applyTheme()
document.documentElement.lang = userPrefsService.getLanguage() === 'bis' ? 'ceb' : 'en'
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (userPrefsService.getThemePreference() === 'system') userPrefsService.applyTheme()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Offline shell and home-screen install. Skipped in dev so Vite's HMR bundles are never cached.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

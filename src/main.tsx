import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the service worker for PWA behavior (auto update)
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(<App />)

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the service worker for PWA behavior (auto update)
const updateServiceWorker = registerSW({
	immediate: true,
	onNeedRefresh() {
		window.dispatchEvent(new Event('sw-update-available'));
	},
	onOfflineReady() {
		window.dispatchEvent(new Event('sw-offline-ready'));
	},
});

window.__updateServiceWorker = updateServiceWorker;

createRoot(document.getElementById('root')!).render(<App />)

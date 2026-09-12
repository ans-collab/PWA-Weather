import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

let updateServiceWorker: (reloadPage?: boolean) => Promise<void> = async () => undefined

// Check for a new worker on launch and reload after it takes control.
updateServiceWorker = registerSW({
	immediate: true,
	onNeedRefresh() {
		window.dispatchEvent(new Event('sw-update-available'));
		void updateServiceWorker(true);
	},
	onRegisteredSW(_swUrl: string, registration?: ServiceWorkerRegistration) {
		void registration?.update();
	},
	onOfflineReady() {
		window.dispatchEvent(new Event('sw-offline-ready'));
	},
});

window.__updateServiceWorker = updateServiceWorker;

createRoot(document.getElementById('root')!).render(<App />)

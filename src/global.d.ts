/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export function registerSW(options?: any): any
  export default registerSW
}

declare module '*.css'
declare module '*.png'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare const __APP_VERSION__: string;


/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export function registerSW(options?: any): any
  export default registerSW
}

declare module '*.css'
declare module '*.png'


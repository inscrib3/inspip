/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

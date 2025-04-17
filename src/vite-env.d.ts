/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  // adicione outras variáveis de ambiente aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 
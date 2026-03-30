/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPONSOR_LOGO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

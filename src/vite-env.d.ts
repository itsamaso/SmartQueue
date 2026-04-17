/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE44_APP_ID?: string;
  readonly VITE_BASE44_APP_BASE_URL?: string;
  readonly VITE_BASE44_BACKEND_URL?: string;
  /** Optional; required by some Base44 apps (see API reference createClient headers.api_key) */
  readonly VITE_BASE44_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

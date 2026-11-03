interface ImportMetaEnv {
  /** Backend base URL, e.g. http://localhost:9913 (v1: NUXT_PUBLIC_API_BASE). */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

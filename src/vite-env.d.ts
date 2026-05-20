/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MATRIX_MAX_DIM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

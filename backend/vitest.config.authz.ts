import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Pruebas de autorización (ítem 4.5): API real en memoria, sin base de datos
// ni credenciales. Ver test/authz/support/ambiente.ts.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['test/authz/**/*.authz.spec.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});

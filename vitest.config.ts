import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    alias: {
        '@domain': resolve(__dirname, './src/domain'),
        '@infrastructure': resolve(__dirname, './src/infrastructure'),
        '@presentation': resolve(__dirname, './src/presentation'),
        '@themes': resolve(__dirname, './src/presentation/themes'),
        '@engine': resolve(__dirname, './src/engine'),
        '@editor': resolve(__dirname, './src/editor'),
    },
    coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'json-summary', 'html'],
        exclude: [
            'node_modules/**',
            'dist/**',
            '**/*.test.ts',
            '**/*.test.tsx',
            'src/engine/demo/**',
            'src/engine/index.ts'
        ]
    }
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: './', // Important for Electron
    resolve: {
        alias: {
            '@engine': path.resolve(__dirname, 'src/engine'),
            '@editor': path.resolve(__dirname, 'src/editor')
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                editor: path.resolve(__dirname, 'editor.html'),
                splash: path.resolve(__dirname, 'splash.html')
            }
        }
    },
    server: {
        port: 5173
    }
});

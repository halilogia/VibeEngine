import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: './', // Important for Electron
    resolve: {
        alias: {
            '@engine': path.resolve(__dirname, 'src/engine'),
            '@editor': path.resolve(__dirname, 'src/editor'),
            '@presentation': path.resolve(__dirname, 'src/presentation'),
            '@themes': path.resolve(__dirname, 'src/presentation/themes'),
            '@domain': path.resolve(__dirname, 'src/domain'),
            '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
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

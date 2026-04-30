import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        // Listen on all network interfaces
        host: '0.0.0.0',
        port: 5173,
        cors: true,
        hmr: {
            // FIXED: Set to your Laptop Hotspot Gateway IP
            // This allows HMR to work when testing on mobile devices connected to your hotspot
            host: '192.168.137.1'
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
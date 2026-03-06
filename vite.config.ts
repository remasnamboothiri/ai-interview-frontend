import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    react(),
    commonjs({
      filter(id) {
        return id.includes('@ricky0123/vad-web');
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/constants': path.resolve(__dirname, './src/constants'),
    },
  },
  optimizeDeps: {
    exclude: [
      'lucide-react',
      '@ricky0123/vad-web',
      'onnxruntime-web',
    ],
  },
  // assetsInclude: ['**/*.onnx'],
  assetsInclude: ['**/*.onnx', '**/*.wasm'],
  worker: { format: 'es' },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});






// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//       '@/components': path.resolve(__dirname, './src/components'),
//       '@/pages': path.resolve(__dirname, './src/pages'),
//       '@/hooks': path.resolve(__dirname, './src/hooks'),
//       '@/services': path.resolve(__dirname, './src/services'),
//       '@/types': path.resolve(__dirname, './src/types'),
//       '@/utils': path.resolve(__dirname, './src/utils'),
//       '@/contexts': path.resolve(__dirname, './src/contexts'),
//       '@/constants': path.resolve(__dirname, './src/constants'),
//     },
//   },
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//     include: ['onnxruntime-web', '@ricky0123/vad-web'],
//   },
//   worker: {
//     format: 'es',
//   },
// });
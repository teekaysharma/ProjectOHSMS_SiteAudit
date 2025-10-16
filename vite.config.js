import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Set root to current directory
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      'ws-a-c-bebaeca-ikorkgfccu.cn-hongkong-vpc.fcapp.run',
      'localhost'
    ]
  },
  build: {
    outDir: 'dist'
  }
});

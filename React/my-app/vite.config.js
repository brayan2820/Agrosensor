import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Reemplaza 'nombre-de-tu-repositorio' con el nombre real de tu repositorio en GitHub
const repoName = 'Agrosensor'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`, // Configura la base para GitHub Pages
});
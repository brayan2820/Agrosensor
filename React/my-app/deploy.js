// c:\Users\bryan\Local\SIGMA-251\React\my-app\deploy.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para ES Modules (necesario porque tu package.json tiene "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
// URL de tu repositorio basada en tu package.json
const repoUrl = 'https://github.com/brayan2820/Agrosensor.git';

console.log(`Iniciando despliegue manual a ${repoUrl}...`);

try {
  // 1. Verificar que la carpeta 'dist' existe (creada por 'npm run build')
  if (!fs.existsSync(distDir)) {
    throw new Error('La carpeta "dist" no existe. Asegúrate de que el build se ejecutó correctamente.');
  }

  // Función auxiliar para ejecutar comandos y ver la salida
  const run = (command) => {
    console.log(`> ${command}`);
    execSync(command, { cwd: distDir, stdio: 'inherit' });
  };

  // 2. Limpiar cualquier configuración git previa en la carpeta dist para empezar de cero
  const gitFolder = path.join(distDir, '.git');
  if (fs.existsSync(gitFolder)) {
    console.log('Limpiando configuración git antigua en dist...');
    fs.rmSync(gitFolder, { recursive: true, force: true });
  }

  // 3. Inicializar nuevo repositorio y subir archivos
  run('git init');
  run('git checkout -b gh-pages');
  run('git add -A');
  run('git commit -m "Despliegue automático desde script"');
  
  // Force push es necesario porque reiniciamos el historial de gh-pages en cada despliegue
  run(`git remote add origin ${repoUrl}`);
  
  console.log('Subiendo archivos a GitHub...');
  try {
    run('git push -f origin gh-pages');
  } catch (err) {
    console.error('\n⚠️  ERROR DE AUTENTICACIÓN:');
    console.error('   GitHub rechazó la conexión. Es probable que necesites iniciar sesión.');
    console.error('   Intenta ejecutar un "git push" normal en tu terminal principal para refrescar tus credenciales.\n');
    throw err;
  }

  console.log('¡Despliegue completado con éxito!');
} catch (error) {
  console.error('❌ Error durante el despliegue:', error.message);
  process.exit(1);
}

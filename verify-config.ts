import * as fs from 'fs';
import * as path from 'path';

interface ConfigCheck {
  name: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  message: string;
}

const checks: ConfigCheck[] = [];

// Verificar .env existe
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  checks.push({
    name: '.env file',
    status: 'OK',
    message: 'Archivo .env encontrado',
  });
} else {
  checks.push({
    name: '.env file',
    status: 'ERROR',
    message: 'Archivo .env no encontrado. Ejecuta: cp .env.example .env',
  });
}

// Verificar tsconfig.json
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    if (tsconfig.compilerOptions.paths) {
      checks.push({
        name: 'tsconfig.json',
        status: 'OK',
        message: 'Rutas alias configuradas',
      });
    }
  } catch (e) {
    checks.push({
      name: 'tsconfig.json',
      status: 'ERROR',
      message: 'Error parsing tsconfig.json',
    });
  }
}

// Verificar package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const requiredDeps = [
      '@supabase/supabase-js',
      'axios',
      'zustand',
      'react-native',
      'expo',
    ];
    const missing = requiredDeps.filter((dep) => !pkg.dependencies[dep]);
    if (missing.length === 0) {
      checks.push({
        name: 'package.json',
        status: 'OK',
        message: 'Todas las dependencias requeridas presentes',
      });
    } else {
      checks.push({
        name: 'package.json',
        status: 'WARNING',
        message: `Dependencias faltantes: ${missing.join(', ')}`,
      });
    }
  } catch (e) {
    checks.push({
      name: 'package.json',
      status: 'ERROR',
      message: 'Error parsing package.json',
    });
  }
}

// Verificar estructura de directorios
const requiredDirs = [
  'src',
  'src/screens',
  'src/components',
  'src/services',
  'src/store',
  'src/hooks',
  'src/utils',
  'src/types',
  'src/theme',
];

requiredDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    checks.push({
      name: `${dir}/`,
      status: 'OK',
      message: 'Directorio encontrado',
    });
  } else {
    checks.push({
      name: `${dir}/`,
      status: 'WARNING',
      message: 'Directorio no encontrado',
    });
  }
});

// Imprimir resultados
console.log('\n📋 VERIFICACIÓN DE CONFIGURACIÓN\n');
console.log('═'.repeat(60));

let errorCount = 0;
let warningCount = 0;

checks.forEach((check) => {
  const icon = {
    OK: '✅',
    WARNING: '⚠️',
    ERROR: '❌',
  }[check.status];

  console.log(`${icon} ${check.name.padEnd(30)} ${check.message}`);

  if (check.status === 'ERROR') errorCount++;
  if (check.status === 'WARNING') warningCount++;
});

console.log('═'.repeat(60));
console.log(
  `\n📊 Resultados: ${checks.length} verificaciones | Errores: ${errorCount} | Advertencias: ${warningCount}\n`
);

if (errorCount > 0) {
  console.log('❌ Hay errores que deben ser corregidos antes de continuar.\n');
  process.exit(1);
} else if (warningCount > 0) {
  console.log('⚠️ Hay advertencias. Revisa la configuración.\n');
} else {
  console.log('✅ ¡Configuración correcta! Listo para desarrollar.\n');
  process.exit(0);
}

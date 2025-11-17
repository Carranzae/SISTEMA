#!/bin/bash

echo "🚀 OmniTienda BPM - Setup"
echo "=========================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo ""

# Crear .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ .env creado. Asegúrate de completar las variables."
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "🔍 Verificando configuración..."
npx ts-node verify-config.ts

echo ""
echo "✨ Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. npm start          - Para iniciar en desarrollo"
echo "2. npm run type-check - Para verificar tipos TypeScript"
echo "3. npm run lint       - Para verificar código"

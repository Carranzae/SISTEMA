#!/bin/bash

echo "🔍 Verificando OmniTienda BPM..."
echo ""

# Verificar Node
echo "✓ Node version:"
node -v

# Verificar npm
echo "✓ npm version:"
npm -v

# Verificar TypeScript
echo "✓ TypeScript:"
npx tsc --version

# Verificar dependencias
echo "✓ Instalando dependencias..."
npm install

# Verificar tipos
echo "✓ Verificando tipos TypeScript..."
npm run type-check

# Verificar linting
echo "✓ Ejecutando linter..."
npm run lint

echo ""
echo "✅ Verificación completada!"

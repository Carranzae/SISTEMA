# 🚀 Guía de Instalación - OmniTienda BPM

Instrucciones paso a paso para instalar y configurar OmniTienda BPM en tu máquina local.

## Requisitos Previos

### Windows, macOS o Linux
- Node.js v18+ ([Descargar](https://nodejs.org/))
- npm v9+ (incluido con Node.js)
- Git ([Descargar](https://git-scm.com/))

### Para desarrollo iOS (macOS)
- Xcode 14+
- CocoaPods

### Para desarrollo Android
- Android Studio
- Android SDK 30+
- Emulador configurado

### Cuentas Requeridas
- Supabase (gratis)
- PeruDevs API (para SUNAT)
- Gmail (para notificaciones)

---

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/omnitienda-bpm.git
cd omnitienda-bpm
```

---

## Paso 2: Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias del `package.json`.

---

## Paso 3: Configurar Variables de Entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://kllldcgrwvdjsvczsigx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
EXPO_PUBLIC_SUPABASE_PROJECT_ID=kllldcgrwvdjsvczsigx
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## Paso 4: Verificar Instalación

```bash
npm run type-check
npm run lint
```

---

## Paso 5: Iniciar Desarrollo

### Web
```bash
npm start
# Presiona 'w'
```

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

---

## Instalación Backend (Opcional)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app/main.py
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Supabase not configured"
- Verifica que `.env` esté en la raíz
- Revisa que las variables están sin espacios

### Error: Puerto 8000 en uso
```bash
lsof -i :8000  # Para encontrar el proceso
kill -9 <PID>  # Para matar el proceso
```

---

¡Listo! Ahora puedes comenzar a desarrollar.

# 🏪 OmniTienda BPM

**Software Multi-Negocio Inteligente para PyMEs en Perú**

> Una solución completa de gestión empresarial adaptada a diferentes rubros, con tecnología AR, marketplace integrado y reportes avanzados.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos por Rubro](#módulos-por-rubro)
- [API Documentation](#api-documentation)
- [Despliegue](#despliegue)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## ✨ Características

### 🎯 Características Principales

- ✅ **Multi-Plataforma**: iOS, Android, Web y Desktop
- ✅ **Adaptación por Rubro**: Configuración específica para cada tipo de negocio
- ✅ **POS Inteligente**: Punto de venta con reconocimiento de código de barras
- ✅ **Probador AR**: Espejo virtual para probar ropa en tiempo real
- ✅ **Marketplace Virtual**: Tienda online con enlace público y QR
- ✅ **Gestión de Inventario**: Control total de stock y alertas automáticas
- ✅ **Sistema Multi-Usuario**: Roles y permisos diferenciados
- ✅ **Control de Caja**: Apertura, cierre y conciliación
- ✅ **Reportes Avanzados**: PDF con estadísticas en tiempo real
- ✅ **Integración SUNAT**: Búsqueda de empresas y personas naturales
- ✅ **Notificaciones**: Push y email en eventos importantes

### 🛍️ Rubros Soportados

- 👕 Ropa, Calzado y Accesorios
- 🛒 Abarrotes / Bodega
- 🥔 Papa / Mayorista
- 📱 Electrónica y Tecnología
- 💊 Farmacia / Botica
- 🍕 Restaurante / Comida
- 🔧 Ferretería / Construcción
- Y más...

---

## 🛠️ Tecnologías

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React Native** | 0.73.0 | Framework principal |
| **Expo** | 50.0.0 | Build y deploy multi-plataforma |
| **Expo Router** | 3.4.0 | Navegación y rutas |
| **TypeScript** | 5.3.3 | Type safety |
| **Zustand** | 4.4.1 | State management |
| **Axios** | 1.6.2 | HTTP client |
| **React Navigation** | 6.1.9 | Navegación nativa |
| **TailwindCSS** | - | Estilos (React Native) |

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Python** | 3.11+ | Lenguaje backend |
| **FastAPI** | 0.104.1 | Framework web |
| **Uvicorn** | 0.24.0 | ASGI server |
| **SQLAlchemy** | 2.0.23 | ORM |
| **Pydantic** | 2.4.2 | Validación datos |

### Bases de Datos & Cloud

| Tecnología | Propósito |
|-----------|----------|
| **Supabase** | Base de datos PostgreSQL + Auth |
| **PostgreSQL** | Base de datos relacional |
| **AWS S3** | Almacenamiento de archivos (opcional) |

### Librerías Especializadas

| Librería | Propósito |
|----------|----------|
| **MediaPipe** | Detección de pose para AR |
| **OpenCV** | Procesamiento de imágenes |
| **QRCode** | Generación de códigos QR |
| **Expo Camera** | Acceso a cámara |
| **Date-fns** | Manejo de fechas |

---

## 📦 Requisitos

### Mínimo Sistema

- **Node.js**: v18+
- **npm**: v9+
- **Python**: 3.11+
- **Git**: Para control de versiones

### Para Desarrollo

```bash
# Frontend
- Expo CLI
- TypeScript
- VSCode (recomendado)

# Backend
- Docker (recomendado)
- Postman (para testing API)
```

### Cuentas Necesarias

- 🔐 **Supabase** - Base de datos
- 🌐 **PeruDevs API** - Consultas SUNAT
- 📧 **Gmail** - Notificaciones por email
- ☁️ **AWS (Opcional)** - Almacenamiento S3

---

## 🚀 Instalación

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/omnitienda-bpm.git
cd omnitienda-bpm
```

### 2. Instalar Dependencias Frontend

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://kllldcgrwvdjsvczsigx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
EXPO_PUBLIC_SUPABASE_PROJECT_ID=kllldcgrwvdjsvczsigx

# API
EXPO_PUBLIC_API_URL=http://localhost:8000

# SUNAT
EXPO_PUBLIC_SUNAT_TOKEN=tu-token-sunat
```

### 4. Instalar Backend (Opcional)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Verificar Configuración

```bash
npm run type-check
npm run lint
```

---

## ⚙️ Configuración

### Estructura del Proyecto

```bash
omnitienda-bpm
├── backend
│   ├── app
│   ├── tests
│   ├── Dockerfile
│   └── requirements.txt
├── mobile
│   ├── assets
│   ├── src
│   ├── App.tsx
│   ├── app.json
│   └── package.json
└── README.md
```

### Configuración de Supabase

1. Crear un proyecto en [Supabase](https://supabase.com/).
2. Obtener la URL y la clave anónima.
3. Configurar la autenticación en el panel de Supabase.
4. Crear las tablas necesarias según la [documentación](https://supabase.com/docs/guides/database).

### Configuración de API (Opcional)

- Si deseas utilizar el backend en Python, asegúrate de tener Docker instalado.
- Configura las variables de entorno en el archivo `backend/.env`.
- Levanta el contenedor de Docker:

```bash
cd backend
docker-compose up -d
```

---

## 🛠️ Uso

### Iniciar Aplicación

```bash
npm start
```

### Ejecutar en Dispositivos

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Acceder a la API

- Documentación de la API en `backend/docs`.
- Ejemplos de endpoints:

```bash
GET /api/products
POST /api/sales
```

---

## 📊 Módulos por Rubro

- **Abarrotes / Bodega**: Gestión de productos, control de stock, ventas rápidas.
- **Ropa, Calzado y Accesorios**: Catálogo de prendas, tallas, colores, ventas con código de barras.
- **Papa / Mayorista**: Manejo de grandes volúmenes de productos, precios al por mayor.
- **Electrónica y Tecnología**: Inventario de dispositivos electrónicos, accesorios, ventas con garantía.
- **Verdulería / Frutas**: Control de productos perecibles, gestión de proveedores locales.
- **Farmacia / Botica**: Venta de medicamentos, control de recetas, gestión de stock regulado.
- **Restaurante / Comida**: Gestión de mesas, pedidos en línea, integración con delivery.
- **Ferretería / Construcción**: Catálogo de herramientas, materiales de construcción, gestión de proyectos.
- **Servicios**: Facturación de servicios, gestión de citas, control de horarios.
- **Educación**: Gestión de cursos, inscripciones, seguimiento académico.
- **Salud**: Control de pacientes, citas médicas, historial clínico.
- **Turismo**: Reservas de hoteles, gestión de itinerarios, venta de paquetes turísticos.

Cada rubro cuenta con un módulo especializado que incluye:

- **Catálogo de Productos/Servicios**: Gestión y visualización.
- **Ventas**: Registro y seguimiento.
- **Compras**: Control de proveedores y órdenes.
- **Reportes**: Estadísticas y análisis.

---

## 📚 API Documentation

- La API está documentada usando OpenAPI.
- Acceso a la documentación en `http://localhost:8000/docs`.
- Ejemplo de uso de la API:

```bash
curl -X GET "http://localhost:8000/api/products" -H "accept: application/json"
```

---

## 🚀 Despliegue

- Para desplegar la aplicación, se recomienda usar Docker.
- Instrucciones básicas:

```bash
# Construir imagen
docker build -t omnitienda-bpm .

# Correr contenedor
docker run -p 8000:8000 omnitienda-bpm
```

---

## 🤝 Contribuir

1. Haz un fork del proyecto.
2. Crea una rama para tu feature: `git checkout -b mi-feature`.
3. Realiza tus cambios y haz commit: `git commit -m 'Agregué una nueva feature'`.
4. Haz push a tu rama: `git push origin mi-feature`.
5. Abre un Pull Request.

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.

---

¡Gracias por usar OmniTienda BPM! Para más información, visita nuestra [documentación](https://docs.omnitienda.com) o contáctanos a través de nuestro [formulario de soporte](https://omnitienda.com soporte).


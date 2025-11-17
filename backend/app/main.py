from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importar rutas
from app.routes import (
    ar_mirror_routes,
    marketplace_public_routes,
    products_routes,
    orders_routes,
    analytics_routes,
    notifications_routes,
    users_routes,
)

# Configuración CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
if not ALLOWED_ORIGINS or ALLOWED_ORIGINS == ['']:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8081",
        "https://omnitienda.pe",
        "https://app.omnitienda.pe",
    ]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 OmniTienda API iniciada")
    yield
    # Shutdown
    logger.info("🛑 API cerrada")

app = FastAPI(
    title="OmniTienda API",
    description="API para gestión multi-negocio de PyMEs",
    version="0.1.0",
    lifespan=lifespan,
)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_ORIGINS,
)

# Rutas
app.include_router(
    ar_mirror_routes.router,
    prefix="/api/v1/ar",
    tags=["AR - Realidad Aumentada"],
)
app.include_router(
    marketplace_public_routes.router,
    prefix="/api/v1/marketplace",
    tags=["Marketplace Público"],
)
app.include_router(
    products_routes.router,
    prefix="/api/v1/products",
    tags=["Productos"],
)
app.include_router(
    orders_routes.router,
    prefix="/api/v1/orders",
    tags=["Órdenes"],
)
app.include_router(
    analytics_routes.router,
    prefix="/api/v1/analytics",
    tags=["Analítica"],
)
app.include_router(
    notifications_routes.router,
    prefix="/api/v1/notifications",
    tags=["Notificaciones"],
)
app.include_router(
    users_routes.router,
    prefix="/api/v1/users",
    tags=["Usuarios"],
)

@app.get("/", tags=["Root"])
async def root():
    return {
        "nombre": "OmniTienda API",
        "version": "0.1.0",
        "documentación": "/docs",
        "estado": "✅ Online",
    }

@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "version": "0.1.0",
        "timestamp": str(os.popen('date').read()),
    }

@app.get("/api/v1/health", tags=["Health"])
async def api_health():
    return {
        "status": "healthy",
        "service": "omnitienda-api",
        "version": "0.1.0",
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("DEBUG", "True") == "True",
    )

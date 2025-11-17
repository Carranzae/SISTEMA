from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import uuid
import qrcode
import io
import base64
from datetime import datetime, timedelta
import os
from supabase import create_client, Client

router = APIRouter()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class CreatePublicLink(BaseModel):
    negocio_id: str
    nombre: str
    descripcion: str
    vigencia_dias: int = 30

class PublicMarketplaceLink(BaseModel):
    id: str
    codigo: str
    enlace: str
    qr_code: str
    negocio_id: str
    nombre: str
    descripcion: str
    estado: str
    fecha_creacion: str
    fecha_expiracion: str
    visitas: int

@router.post("/links/create")
async def create_public_link(link_data: CreatePublicLink):
    """
    Crea enlace público para marketplace
    Genera código único y QR
    """
    try:
        codigo = str(uuid.uuid4())[:8].upper()
        enlace = f"https://omnitienda.pe/marketplace/{codigo}"
        
        # Generar QR
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(enlace)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        fecha_expiracion = (
            datetime.now() + timedelta(days=link_data.vigencia_dias)
        ).isoformat()
        
        marketplace_data = {
            "codigo": codigo,
            "enlace": enlace,
            "qr_code": qr_base64,
            "negocio_id": link_data.negocio_id,
            "nombre": link_data.nombre,
            "descripcion": link_data.descripcion,
            "estado": "ACTIVO",
            "fecha_creacion": datetime.now().isoformat(),
            "fecha_expiracion": fecha_expiracion,
            "visitas": 0
        }
        
        response = supabase.table("marketplace_links").insert(
            marketplace_data
        ).execute()
        
        return {
            "success": True,
            "link": response.data[0],
            "message": "Enlace público creado"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/links/{negocio_id}")
async def get_marketplace_links(negocio_id: str):
    """Obtiene todos los enlaces del negocio"""
    try:
        data = supabase.table("marketplace_links").select("*").eq(
            "negocio_id", negocio_id
        ).execute()
        
        return {
            "success": True,
            "links": data.data,
            "total": len(data.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/access/{codigo}")
async def access_marketplace(codigo: str):
    """
    Acceso público al marketplace
    Verificar que el enlace esté activo
    """
    try:
        data = supabase.table("marketplace_links").select(
            "*, negocios:negocio_id(nombre_comercial, logo_url)"
        ).eq("codigo", codigo).eq("estado", "ACTIVO").single().execute()
        
        if not data.data:
            raise HTTPException(status_code=404, detail="Enlace no encontrado")
        
        # Incrementar visitas
        supabase.table("marketplace_links").update({
            "visitas": data.data["visitas"] + 1
        }).eq("id", data.data["id"]).execute()
        
        # Obtener productos del negocio
        products = supabase.table("clothing_products").select(
            "*"
        ).eq("negocio_id", data.data["negocio_id"]).eq("activo", True).execute()
        
        return {
            "success": True,
            "marketplace": {
                "nombre": data.data["nombre"],
                "descripcion": data.data["descripcion"],
                "negocio": data.data["negocios"],
                "productos": products.data,
                "total_productos": len(products.data),
                "visitas": data.data["visitas"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/links/{link_id}")
async def delete_marketplace_link(link_id: str):
    """Desactiva un enlace público"""
    try:
        supabase.table("marketplace_links").update({
            "estado": "INACTIVO"
        }).eq("id", link_id).execute()
        
        return {
            "success": True,
            "message": "Enlace desactivado"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/products/order")
async def create_order_from_marketplace(
    codigo: str,
    producto_id: str,
    talla: str,
    color: str,
    cantidad: int,
    cliente_nombre: str,
    cliente_email: str,
    cliente_telefono: str,
    cliente_direccion: str
):
    """Crea orden desde marketplace público"""
    try:
        # Obtener enlace
        link_data = supabase.table("marketplace_links").select(
            "negocio_id"
        ).eq("codigo", codigo).single().execute()
        
        # Obtener producto
        product_data = supabase.table("clothing_products").select(
            "nombre, precio_venta"
        ).eq("id", producto_id).single().execute()
        
        # Crear cliente guest
        cliente = supabase.table("clientes").insert({
            "negocio_id": link_data.data["negocio_id"],
            "nombre": cliente_nombre,
            "email": cliente_email,
            "telefono": cliente_telefono,
            "direccion": cliente_direccion,
            "es_empresa": False,
            "tipo_cliente": "CONSUMIDOR_FINAL"
        }).execute()
        
        # Crear orden
        orden = supabase.table("marketplace_orders").insert({
            "negocio_id": link_data.data["negocio_id"],
            "cliente_id": cliente.data[0]["id"],
            "producto_id": producto_id,
            "talla": talla,
            "color": color,
            "cantidad": cantidad,
            "precio_unitario": product_data.data["precio_venta"],
            "total": product_data.data["precio_venta"] * cantidad,
            "estado": "PENDIENTE",
            "origen": "MARKETPLACE_PUBLICO",
            "fecha_creacion": datetime.now().isoformat()
        }).execute()
        
        return {
            "success": True,
            "orden_id": orden.data[0]["id"],
            "message": "Orden creada. El vendedor se contactará pronto.",
            "total": product_data.data["precio_venta"] * cantidad
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

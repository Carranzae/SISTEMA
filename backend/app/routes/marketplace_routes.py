from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List
from datetime import datetime
import os
from supabase import create_client, Client

router = APIRouter()

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class ProductMarketplace(BaseModel):
    id: str
    nombre: str
    descripcion: str
    precio: float
    imagen_url: str
    negocio_id: str
    categoria: str
    stock: int

class OrderMarketplace(BaseModel):
    id: str
    cliente_id: str
    productos: List[dict]
    total: float
    estado: str
    fecha_entrega: str

@router.get("/products")
async def get_marketplace_products(
    negocio_id: str = Query(...),
    categoria: str = Query(None),
    limit: int = Query(20),
    offset: int = Query(0)
):
    """
    Obtiene productos del marketplace
    Filtrable por negocio, categoría, etc.
    """
    try:
        query = supabase.table("productos").select("*")
        
        if negocio_id:
            query = query.eq("negocio_id", negocio_id)
        if categoria:
            query = query.eq("categoria", categoria)
        
        # Paginación
        data = query.range(offset, offset + limit).execute()
        
        return {
            "success": True,
            "data": data.data,
            "total": len(data.data),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orders")
async def create_marketplace_order(order: OrderMarketplace):
    """
    Crea una orden en el marketplace
    """
    try:
        order_data = {
            "id": order.id,
            "cliente_id": order.cliente_id,
            "productos": order.productos,
            "total": order.total,
            "estado": "PENDIENTE",
            "fecha_creacion": datetime.now().isoformat(),
            "fecha_entrega": order.fecha_entrega
        }
        
        response = supabase.table("marketplace_orders").insert(order_data).execute()
        
        return {
            "success": True,
            "order_id": order.id,
            "message": "Orden creada",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}")
async def get_order_status(order_id: str):
    """
    Obtiene estado de una orden
    """
    try:
        data = supabase.table("marketplace_orders").select("*").eq("id", order_id).execute()
        
        if data.data:
            return {
                "success": True,
                "order": data.data[0]
            }
        else:
            raise HTTPException(status_code=404, detail="Orden no encontrada")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_products(q: str = Query(...), negocio_id: str = Query(None)):
    """
    Busca productos en el marketplace
    """
    try:
        query = supabase.table("productos").select("*")
        
        # Búsqueda simple por nombre
        if q:
            query = query.ilike("nombre", f"%{q}%")
        
        if negocio_id:
            query = query.eq("negocio_id", negocio_id)
        
        data = query.limit(20).execute()
        
        return {
            "success": True,
            "results": data.data,
            "count": len(data.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

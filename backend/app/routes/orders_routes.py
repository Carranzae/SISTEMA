from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import os
from supabase import create_client, Client

router = APIRouter()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class OrderItem(BaseModel):
    producto_id: str
    cantidad: int
    precio_unitario: float

class CreateOrder(BaseModel):
    negocio_id: str
    cliente_id: str
    items: List[OrderItem]
    total: float
    tipo: str  # 'CONTADO' o 'CREDITO'
    metodo_pago: str

@router.post("/create")
async def create_order(order: CreateOrder):
    """
    Crea una nueva orden de venta
    """
    try:
        order_data = {
            "negocio_id": order.negocio_id,
            "cliente_id": order.cliente_id,
            "items": [item.dict() for item in order.items],
            "total": order.total,
            "tipo": order.tipo,
            "metodo_pago": order.metodo_pago,
            "estado": "PENDIENTE",
            "created_at": datetime.now().isoformat()
        }
        
        response = supabase.table("ventas").insert(order_data).execute()
        
        return {
            "success": True,
            "order_id": response.data[0]["id"],
            "message": "Orden creada",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list/{negocio_id}")
async def list_orders(negocio_id: str, limit: int = 20, offset: int = 0):
    """
    Lista órdenes del negocio
    """
    try:
        data = supabase.table("ventas").select("*").eq(
            "negocio_id", negocio_id
        ).range(offset, offset + limit).order("created_at", desc=True).execute()
        
        return {
            "success": True,
            "orders": data.data,
            "total": len(data.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

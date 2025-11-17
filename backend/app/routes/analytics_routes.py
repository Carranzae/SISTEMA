from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import os
from supabase import create_client, Client

router = APIRouter()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

@router.get("/sales/{negocio_id}")
async def get_sales_analytics(negocio_id: str, days: int = 30):
    """
    Obtiene analítica de ventas
    """
    try:
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        data = supabase.table("ventas").select("*").eq(
            "negocio_id", negocio_id
        ).gte("created_at", start_date).execute()
        
        # Procesar datos
        total_ventas = sum(v["total"] for v in data.data)
        cantidad_ventas = len(data.data)
        promedio_venta = total_ventas / cantidad_ventas if cantidad_ventas > 0 else 0
        
        # Por método de pago
        por_metodo = {}
        for venta in data.data:
            metodo = venta["metodo_pago"]
            por_metodo[metodo] = por_metodo.get(metodo, 0) + venta["total"]
        
        return {
            "success": True,
            "periodo_dias": days,
            "total_ventas": total_ventas,
            "cantidad_ventas": cantidad_ventas,
            "promedio_venta": promedio_venta,
            "por_metodo_pago": por_metodo
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inventory/{negocio_id}")
async def get_inventory_analytics(negocio_id: str):
    """
    Obtiene analítica de inventario
    """
    try:
        data = supabase.table("productos").select("*").eq(
            "negocio_id", negocio_id
        ).execute()
        
        # Productos con stock bajo
        bajo_stock = [p for p in data.data if p["stock_actual"] < p["stock_minimo"]]
        
        # Valor total inventario
        valor_total = sum(p["precio_compra"] * p["stock_actual"] for p in data.data)
        
        return {
            "success": True,
            "total_productos": len(data.data),
            "productos_bajo_stock": len(bajo_stock),
            "valor_total_inventario": valor_total,
            "productos_bajo_stock_lista": bajo_stock
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clientes/{negocio_id}")
async def get_customers_analytics(negocio_id: str):
    """
    Obtiene analítica de clientes
    """
    try:
        # Obtener clientes
        clientes = supabase.table("clientes").select("*").eq(
            "negocio_id", negocio_id
        ).execute()
        
        # Obtener deudas
        cuentas = supabase.table("cuentas_por_cobrar").select("*").eq(
            "negocio_id", negocio_id
        ).eq("estado", "PENDIENTE").execute()
        
        total_deuda = sum(c["monto_pendiente"] for c in cuentas.data)
        
        return {
            "success": True,
            "total_clientes": len(clientes.data),
            "cuentas_pendientes": len(cuentas.data),
            "deuda_total": total_deuda
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

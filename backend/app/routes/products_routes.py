from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import Optional, List
import os
from supabase import create_client, Client
import boto3

router = APIRouter()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# S3 client (opcional)
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

class ProductCreate(BaseModel):
    nombre: str
    descripcion: str
    precio_compra: float
    precio_venta: float
    stock: int
    negocio_id: str
    categoria: str
    atributos: Optional[dict] = None

@router.post("/upload")
async def upload_product_image(file: UploadFile = File(...), product_id: str = None):
    """
    Carga imagen de producto a Supabase Storage
    """
    try:
        contents = await file.read()
        
        # Guardar en Supabase Storage
        file_path = f"productos/{product_id}/{file.filename}"
        
        response = supabase.storage.from_bucket("omnitienda").upload(
            file_path,
            contents
        )
        
        # Obtener URL pública
        public_url = supabase.storage.from_bucket("omnitienda").get_public_url(file_path)
        
        return {
            "success": True,
            "url": public_url.get("publicUrl"),
            "file_path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_product(product: ProductCreate):
    """
    Crea nuevo producto
    """
    try:
        product_data = product.dict()
        
        response = supabase.table("productos").insert(product_data).execute()
        
        return {
            "success": True,
            "product_id": response.data[0]["id"],
            "message": "Producto creado",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}")
async def get_product(product_id: str):
    """
    Obtiene detalles del producto
    """
    try:
        data = supabase.table("productos").select("*").eq("id", product_id).execute()
        
        if data.data:
            return {
                "success": True,
                "product": data.data[0]
            }
        else:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{product_id}")
async def update_product(product_id: str, product: ProductCreate):
    """
    Actualiza producto existente
    """
    try:
        response = supabase.table("productos").update(
            product.dict()
        ).eq("id", product_id).execute()
        
        return {
            "success": True,
            "message": "Producto actualizado",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

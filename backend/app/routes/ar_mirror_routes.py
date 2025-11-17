from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import mediapipe as mp
from PIL import Image
import io
from datetime import datetime
import os
from supabase import create_client, Client

router = APIRouter()

# MediaPipe setup
mp_pose = mp.solutions.pose
mp_hands = mp.solutions.hands
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1)
hands = mp_hands.Hands()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class PoseDetector:
    """Detecta pose corporal para probador AR"""
    
    def __init__(self):
        self.pose = pose
        
    def detect_pose(self, frame):
        """Detecta landmarks del cuerpo"""
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(frame_rgb)
        return results
    
    def get_body_measurements(self, landmarks, frame_height, frame_width):
        """Calcula medidas corporales"""
        if not landmarks:
            return None
        
        # Puntos clave
        shoulder_left = landmarks[11]
        shoulder_right = landmarks[12]
        hip_left = landmarks[23]
        hip_right = landmarks[24]
        ankle_left = landmarks[27]
        ankle_right = landmarks[28]
        
        # Convertir a píxeles
        shoulder_width_px = abs(
            int(shoulder_right.x * frame_width) - int(shoulder_left.x * frame_width)
        )
        hip_width_px = abs(
            int(hip_right.x * frame_width) - int(hip_left.x * frame_width)
        )
        height_px = abs(
            int(landmarks[0].y * frame_height) - int(landmarks[28].y * frame_height)
        )
        
        return {
            "shoulder_width": shoulder_width_px,
            "hip_width": hip_width_px,
            "height": height_px,
            "landmarks": landmarks
        }
    
    def recommend_size(self, measurements):
        """Recomienda talla basada en medidas"""
        shoulder_width = measurements["shoulder_width"]
        hip_width = measurements["hip_width"]
        
        # Lógica de recomendación
        avg_width = (shoulder_width + hip_width) / 2
        
        if avg_width < 150:
            return "XS", 0.95
        elif avg_width < 180:
            return "S", 0.92
        elif avg_width < 210:
            return "M", 0.90
        elif avg_width < 240:
            return "L", 0.88
        elif avg_width < 270:
            return "XL", 0.85
        else:
            return "XXL", 0.82

detector = PoseDetector()

@router.post("/mirror/process")
async def process_ar_mirror(
    image: UploadFile = File(...),
    product_id: str = Query(...),
    prenda_type: str = Query(...)  # 'top', 'bottom', 'full_body', 'shoes', 'accessories'
):
    """
    Procesa imagen para probador AR
    Detecta pose y superpone prenda virtual
    """
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.COLOR_BGR2RGB)
        
        h, w, c = frame.shape
        
        # Detectar pose
        results = detector.detect_pose(frame)
        
        if not results.pose_landmarks:
            raise HTTPException(status_code=400, detail="No se detectó pose corporal")
        
        landmarks = results.pose_landmarks.landmark
        measurements = detector.get_body_measurements(landmarks, h, w)
        
        # Obtener prenda del producto
        product_data = supabase.table("clothing_products").select(
            "imagen_3d_url, colores"
        ).eq("id", product_id).single().execute()
        
        if not product_data.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Superponer prenda según tipo
        if prenda_type == "top":
            frame = apply_top_overlay(frame, landmarks, measurements)
        elif prenda_type == "bottom":
            frame = apply_bottom_overlay(frame, landmarks, measurements)
        elif prenda_type == "full_body":
            frame = apply_full_body_overlay(frame, landmarks, measurements)
        elif prenda_type == "shoes":
            frame = apply_shoes_overlay(frame, landmarks, measurements)
        elif prenda_type == "accessories":
            frame = apply_accessories_overlay(frame, landmarks, measurements)
        
        # Convertir a bytes
        success, buffer = cv2.imencode('.jpg', frame)
        img_bytes = buffer.tobytes()
        
        # Talla recomendada
        recommended_size, confidence = detector.recommend_size(measurements)
        
        return {
            "success": True,
            "image_base64": img_bytes.hex(),
            "recommended_size": recommended_size,
            "size_confidence": confidence,
            "measurements": measurements,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mirror/size-comparison")
async def compare_sizes(
    image: UploadFile = File(...),
    product_id: str = Query(...),
    sizes: str = Query(...)  # "XS,S,M,L"
):
    """
    Compara cómo se vería la prenda en diferentes tallas
    """
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.COLOR_BGR2RGB)
        
        h, w, c = frame.shape
        results = detector.detect_pose(frame)
        
        if not results.pose_landmarks:
            raise HTTPException(status_code=400, detail="No se detectó pose")
        
        landmarks = results.pose_landmarks.landmark
        size_list = sizes.split(",")
        
        comparisons = {}
        for size in size_list:
            # Aplicar escala según talla
            scale = get_scale_by_size(size)
            frame_copy = frame.copy()
            
            # Superponer con escala
            frame_copy = apply_clothing_with_scale(
                frame_copy, landmarks, scale
            )
            
            success, buffer = cv2.imencode('.jpg', frame_copy)
            comparisons[size] = buffer.tobytes().hex()
        
        return {
            "success": True,
            "comparisons": comparisons,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def apply_top_overlay(frame, landmarks, measurements):
    """Superpone camiseta/blusa"""
    h, w = frame.shape[:2]
    
    shoulder_left = landmarks[11]
    shoulder_right = landmarks[12]
    hip_left = landmarks[23]
    hip_right = landmarks[24]
    
    # Crear área de prenda
    x1 = int(min(shoulder_left.x, shoulder_right.x) * w)
    y1 = int(shoulder_right.y * h)
    x2 = int(max(shoulder_left.x, shoulder_right.x) * w)
    y2 = int(max(hip_left.y, hip_right.y) * h)
    
    # Color aleatorio (representar prenda)
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (100, 200, 255), -1)
    
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    return frame

def apply_bottom_overlay(frame, landmarks, measurements):
    """Superpone pantalones/falda"""
    h, w = frame.shape[:2]
    
    hip_left = landmarks[23]
    hip_right = landmarks[24]
    ankle_left = landmarks[27]
    ankle_right = landmarks[28]
    
    x1 = int(min(hip_left.x, hip_right.x) * w)
    y1 = int(max(hip_left.y, hip_right.y) * h)
    x2 = int(max(hip_left.x, hip_right.x) * w)
    y2 = int(max(ankle_left.y, ankle_right.y) * h)
    
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (80, 100, 200), -1)
    
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    return frame

def apply_full_body_overlay(frame, landmarks, measurements):
    """Superpone vestido/abrigo"""
    frame = apply_top_overlay(frame, landmarks, measurements)
    frame = apply_bottom_overlay(frame, landmarks, measurements)
    return frame

def apply_shoes_overlay(frame, landmarks, measurements):
    """Superpone zapatos"""
    h, w = frame.shape[:2]
    
    ankle_left = landmarks[27]
    ankle_right = landmarks[28]
    foot_left = landmarks[31]
    foot_right = landmarks[32]
    
    # Zapato izquierdo
    x1 = int(ankle_left.x * w) - 20
    y1 = int(ankle_left.y * h)
    x2 = int(foot_left.x * w) + 20
    y2 = int(foot_left.y * h) + 40
    
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), -1)
    
    # Zapato derecho
    x1 = int(ankle_right.x * w) - 20
    y1 = int(ankle_right.y * h)
    x2 = int(foot_right.x * w) + 20
    y2 = int(foot_right.y * h) + 40
    
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), -1)
    
    return frame

def apply_accessories_overlay(frame, landmarks, measurements):
    """Superpone accesorios (collares, pulseras)"""
    h, w = frame.shape[:2]
    
    # Cuello
    neck = landmarks[0]
    x = int(neck.x * w)
    y = int(neck.y * h)
    cv2.circle(frame, (x, y), 30, (255, 215, 0), 2)
    
    # Muñecas
    wrist_left = landmarks[15]
    wrist_right = landmarks[16]
    
    x_l = int(wrist_left.x * w)
    y_l = int(wrist_left.y * h)
    cv2.circle(frame, (x_l, y_l), 15, (255, 215, 0), 2)
    
    x_r = int(wrist_right.x * w)
    y_r = int(wrist_right.y * h)
    cv2.circle(frame, (x_r, y_r), 15, (255, 215, 0), 2)
    
    return frame

def get_scale_by_size(size):
    """Obtiene escala según talla"""
    scales = {
        "XS": 0.85,
        "S": 0.90,
        "M": 1.0,
        "L": 1.10,
        "XL": 1.20,
        "XXL": 1.30
    }
    return scales.get(size, 1.0)

def apply_clothing_with_scale(frame, landmarks, scale):
    """Aplica overlay de ropa con escala"""
    h, w = frame.shape[:2]
    
    # Centro del cuerpo
    center_x = int((landmarks[11].x + landmarks[12].x) / 2 * w)
    center_y = int((landmarks[11].y + landmarks[12].y) / 2 * h)
    
    # Tamaño base
    width = int(abs(landmarks[12].x - landmarks[11].x) * w * scale)
    height = int(abs(landmarks[23].y - landmarks[12].y) * h * scale)
    
    x1 = center_x - width // 2
    y1 = center_y - height // 2
    x2 = center_x + width // 2
    y2 = center_y + height // 2
    
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (100, 200, 255), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    
    return frame

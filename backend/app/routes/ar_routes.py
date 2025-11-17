from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from PIL import Image
import io
import mediapipe as mp
from datetime import datetime

router = APIRouter()

# MediaPipe setup
mp_pose = mp.solutions.pose
mp_hands = mp.solutions.hands
pose = mp_pose.Pose()
hands = mp_hands.Hands()

@router.post("/virtual-try-on")
async def virtual_try_on(
    image: UploadFile = File(...),
    product_id: str = None,
    type: str = "clothing"
):
    """
    Procesa una imagen para probador virtual AR
    - Detecta pose corporal
    - Superpone la prenda
    - Retorna imagen procesada
    """
    try:
        # Leer imagen
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convertir a RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detectar pose
        results = pose.process(frame_rgb)
        
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Procesar según tipo
            if type == "clothing":
                processed_frame = apply_clothing_overlay(frame, landmarks, product_id)
            elif type == "jewelry":
                processed_frame = apply_jewelry_overlay(frame, landmarks)
            elif type == "makeup":
                processed_frame = apply_makeup_overlay(frame, landmarks)
            else:
                processed_frame = frame
            
            # Convertir a bytes
            _, buffer = cv2.imencode('.jpg', processed_frame)
            img_bytes = buffer.tobytes()
            
            return {
                "success": True,
                "message": "Imagen procesada",
                "image_base64": img_bytes.hex(),
                "timestamp": datetime.now().isoformat(),
                "landmarks_count": len(landmarks)
            }
        else:
            raise HTTPException(status_code=400, detail="No se detectó postura corporal")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-size")
async def detect_size(image: UploadFile = File(...)):
    """
    Detecta tamaño corporal desde imagen
    Retorna: ancho hombros, altura, etc.
    """
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.COLOR_BGR2RGB)
        
        results = pose.process(frame)
        
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Calcular medidas
            shoulder_left = landmarks[11]
            shoulder_right = landmarks[12]
            hip_left = landmarks[23]
            hip_right = landmarks[24]
            
            shoulder_width = abs(shoulder_right.x - shoulder_left.x)
            hip_width = abs(hip_right.x - hip_left.x)
            
            # Estimar talla
            if shoulder_width < 0.25:
                size = "XS"
            elif shoulder_width < 0.30:
                size = "S"
            elif shoulder_width < 0.35:
                size = "M"
            elif shoulder_width < 0.40:
                size = "L"
            elif shoulder_width < 0.45:
                size = "XL"
            else:
                size = "XXL"
            
            return {
                "success": True,
                "estimated_size": size,
                "shoulder_width": float(shoulder_width),
                "hip_width": float(hip_width),
                "confidence": 0.85
            }
        else:
            raise HTTPException(status_code=400, detail="No se detectó postura")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def apply_clothing_overlay(frame, landmarks, product_id):
    """
    Superpone ropa sobre la postura detectada
    """
    h, w, c = frame.shape
    
    # Obtener puntos clave
    shoulder_left = landmarks[11]
    shoulder_right = landmarks[12]
    hip_left = landmarks[23]
    hip_right = landmarks[24]
    
    # Convertir a píxeles
    x_left = int(shoulder_left.x * w)
    y_top = int(shoulder_left.y * h)
    x_right = int(shoulder_right.x * w)
    y_bottom = int(hip_left.y * h)
    
    # Dibujar rectángulo (simulación de prenda)
    cv2.rectangle(frame, (x_left, y_top), (x_right, y_bottom), (100, 200, 255), -1)
    
    return frame

def apply_jewelry_overlay(frame, landmarks):
    """Superpone joyas (collares, pulseras)"""
    # Detectar manos
    h, w, c = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    hand_results = hands.process(frame_rgb)
    
    if hand_results.multi_hand_landmarks:
        for hand_landmarks in hand_results.multi_hand_landmarks:
            # Dibujar círculos en muñecas
            wrist = hand_landmarks.landmark[0]
            x = int(wrist.x * w)
            y = int(wrist.y * h)
            cv2.circle(frame, (x, y), 15, (0, 215, 255), -1)
    
    return frame

def apply_makeup_overlay(frame, landmarks):
    """Superpone maquillaje (ojos, labios)"""
    h, w, c = frame.shape
    
    # Puntos faciales aproximados
    nose = landmarks[0]
    left_eye = landmarks[2]
    right_eye = landmarks[5]
    
    x_nose = int(nose.x * w)
    y_nose = int(nose.y * h)
    
    # Aplicar color rojo en los labios (aproximado)
    cv2.circle(frame, (x_nose, y_nose + 30), 20, (0, 0, 255), -1)
    
    return frame

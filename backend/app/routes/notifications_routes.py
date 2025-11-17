from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter()

class EmailNotification(BaseModel):
    to: str
    subject: str
    message: str
    nombre: str

@router.post("/email")
async def send_email_notification(notification: EmailNotification):
    """Envía notificación por email"""
    try:
        # Configuración SMTP (usar variables de entorno)
        sender_email = os.getenv("EMAIL_FROM", "notificaciones@omnitienda.pe")
        sender_password = os.getenv("EMAIL_PASSWORD", "")
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))

        # Crear mensaje
        message = MIMEMultipart("alternative")
        message["Subject"] = notification.subject
        message["From"] = sender_email
        message["To"] = notification.to

        # HTML del email
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2563EB;">OmniTienda</h2>
              <p>Hola {notification.nombre},</p>
              <p>{notification.message}</p>
              <p style="color: #999; font-size: 12px;">
                Este es un email automático. Por favor no respondas.
              </p>
            </div>
          </body>
        </html>
        """

        part = MIMEText(html, "html")
        message.attach(part)

        # Enviar email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(
                sender_email,
                notification.to,
                message.as_string()
            )

        return {
            "success": True,
            "message": "Email enviado correctamente"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

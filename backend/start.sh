#!/bin/bash

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones (si existen)
# alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

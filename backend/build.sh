#!/bin/bash

# Construir imagen Docker
docker build -t omnitienda-api:latest .

# Ejecutar con docker-compose
docker-compose up -d

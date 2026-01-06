#!/bin/bash
set -e

# Solo intentar instalar pre-commit si existe la carpeta .git
# y si estamos en un entorno interactivo/dev
if [ -d ".git" ]; then
    echo "🔧 Configurando pre-commit hooks..."
    uv run pre-commit install
else
    echo "⚠️ No se encontró .git o el volumen no está mapeado correctamente."
fi

# Ejecuta el comando final (el 'sleep infinity' del compose)
exec "$@"

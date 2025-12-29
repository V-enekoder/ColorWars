
FROM python:3.14-slim

# 1. Dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar UV (Copiamos también uvx por utilidad)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 3. Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Ubicación del venv
    UV_PROJECT_ENVIRONMENT="/app/.venv" \
    # Compilación de bytecode para arranque rápido
    UV_COMPILE_BYTECODE=1 \
    # Añadimos el venv al PATH para usar 'ruff' o 'python' directamente sin 'uv run'
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# 4. Instalación de dependencias (Caché optimizado)
COPY pyproject.toml uv.lock* ./

# Instalamos las dependencias sin instalar el proyecto todavía.
# Esto permite que Docker use el caché si pyproject.toml no ha cambiado.
RUN uv sync --frozen --no-install-project || uv sync --no-install-project

# 5. Copiar el código fuente y configs restantes
COPY ruff.toml .pre-commit-config.yaml* README.md ./
COPY src ./src

# 6. Sincronizar el proyecto (Instala el paquete actual en modo editable)
RUN uv sync

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Comando por defecto (mantiene el contenedor vivo para desarrollo)
CMD ["/bin/bash"]

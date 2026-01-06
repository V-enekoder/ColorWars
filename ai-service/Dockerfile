FROM python:3.14-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 1. Instalar UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT="/app/.venv" \
    UV_COMPILE_BYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# 2. Copiar archivos de dependencias
COPY pyproject.toml uv.lock* ./

# 3. Instalar dependencias (esto crea el .venv en la imagen)
RUN uv sync --frozen --no-install-project

# 4. Copiar el resto de archivos y el entrypoint
COPY . .
# Asegurar que el entrypoint sea ejecutable
RUN chmod +x entrypoint.sh

# 5. Ajustar el ENTRYPOINT a la ruta correcta
ENTRYPOINT ["./entrypoint.sh"]

CMD ["/bin/bash"]

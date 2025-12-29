set -e

if [ -d ".git" ]; then
    echo "🔧 Configurando pre-commit hooks..."
    uv run pre-commit install
else
    echo "⚠️ No se encontró .git, saltando instalación de pre-commit."
fi

exec "$@"

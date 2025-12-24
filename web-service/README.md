# 🦕 Color Wars - Web Service (Deno Fresh)

![Deno](https://img.shields.io/badge/Deno-v1.x-000000?style=flat&logo=deno&logoColor=white)
![Fresh](https://img.shields.io/badge/Fresh-Framework-F7DF1E?style=flat&logo=deno&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)

Este directorio contiene el **Frontend y Backend-for-Frontend (BFF)** del proyecto. Está construido sobre **Deno Fresh**, un framework web moderno que utiliza la **Arquitectura de Islas** para minimizar el JavaScript enviado al cliente.

Este servicio actúa como la **Fuente de Verdad** del estado del juego, validando movimientos y orquestando los turnos entre jugadores humanos y la IA.

## ⚡ Características Clave

*   **Islands Architecture:** El HTML se genera estáticamente en el servidor (SSR). Solo el tablero de juego (`island`) se hidrata con JavaScript para la interactividad.
*   **Gestión de Estado Reactiva:** Uso de **Preact Signals** para actualizaciones atómicas del DOM de alto rendimiento (crucial para animaciones de juegos).
*   **Lógica de Negocio en TypeScript:** Implementación estricta de las reglas del juego en el backend (`utils/gameLogic.ts`) para prevenir estados ilegales.
*   **Orquestación de IA:** Actúa como cliente HTTP para consumir el microservicio de Python cuando es el turno de la IA.
*   **Persistencia:** Uso de **Deno KV** para guardar el estado de las partidas.

---

## 🏗 Arquitectura del Componente

El servicio está dividido en capas para separar la UI de la lógica pura:

```bash
/web-service
├── /routes              # Endpoints API y Páginas (Server-Side)
│   ├── index.tsx        # Página de inicio
│   └── /api             # API interna (Proxy hacia la IA + Validación)
│
├── /islands             # Componentes Interactivos (Client-Side)
│   └── GameBoard.tsx    # El tablero reactivo (Preact + Signals)
│
├── /components          # Componentes "Tontos" (Stateless)
│   ├── Cell.tsx         # Representación visual de una celda
│   └── Button.tsx
│
└── /utils               # Lógica de Dominio Pura (Agnóstica del Framework)
    └── gameLogic.ts     # Motor de reglas, explosiones y validaciones
```

### Flujo de Datos (Data Flow)

1.  **Interacción:** El usuario hace clic en una celda en `GameBoard.tsx`.
2.  **Validación Local:** El motor local (`gameLogic.ts`) verifica preliminarmente si es válido.
3.  **Sincronización:** Se envía el movimiento a `/api/game`.
4.  **Turno IA:** Si el turno pasa a la IA, el servidor Deno hace una petición `POST` al contenedor de Python (`http://ai:8000`).
5.  **Respuesta:** Deno recibe la jugada de la IA, la valida nuevamente (Double-Check) y devuelve el estado actualizado al cliente.

---

## 🚀 Configuración y Ejecución

### Requisitos
*   [Deno](https://deno.land/) instalado (v1.30+).

### Variables de Entorno
Crea un archivo `.env` en esta carpeta (opcional, por defecto usa localhost):

```env
# URL del microservicio de Python (en Docker suele ser http://ai:8000)
AI_SERVICE_URL=http://localhost:8000
```

### Comandos de Desarrollo

```bash
# Iniciar el servidor en modo desarrollo (con Hot Reload)
deno task start

# Ejecutar tests unitarios de la lógica del juego
deno test
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

Dado que la lógica del juego está desacoplada de la UI en `utils/gameLogic.ts`, se pueden ejecutar pruebas unitarias rápidas:

```typescript
// Ejemplo de test (tests/logic_test.ts)
Deno.test("Chain Reaction Logic - Critical Mass Explosion", () => {
  const engine = new GameEngine(5, 5);
  // ... assertions ...
});
```

Ejecutar pruebas:
```bash
deno test
```

---

## 📦 Despliegue (Docker/Podman)

Este servicio incluye un `Dockerfile` optimizado para producción.

```bash
# Construir imagen
podman build -t color-wars-web .

# Correr contenedor (asegúrate de que el servicio de IA esté corriendo o falle la conexión)
podman run -p 3000:8000 -e AI_SERVICE_URL=http://host.docker.internal:8000 color-wars-web
```

---

**Nota Académica:** La elección de Deno Fresh sobre React tradicional (SPA) se justifica por la necesidad de reducir la latencia de carga (First Contentful Paint) y mantener un stack tecnológico unificado (TypeScript) en el backend de orquestación, eliminando la complejidad de configuración de bundlers como Webpack.

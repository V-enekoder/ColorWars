@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

' Configuración visual
LAYOUT_WITH_LEGEND()
title Container Diagram (Level 2) - Color Wars AI Platform

' 1. Actores y Sistemas Externos
Person(player, "Player / Researcher", "User who plays matches or analyzes strategies.")
System_Ext(colab, "Google Colab", "Trains agents using Deep Learning (PPO/DQN).")

' 2. Límite del Sistema (Tu Monorepo)
System_Boundary(c1, "Color Wars Platform Scope") {
    
    ' Contenedor Web (Deno)
    Container(web_app, "Web Service", "TypeScript, Deno, Fresh", "Provides the UI via SSR/Islands. Validates rules, manages game state, and handles user interaction.")

    ' Contenedor IA (Python + Rust)
    Container(ai_service, "AI Service", "Python, FastAPI, Rust (PyO3)", "Hosts the high-performance Game Engine and Neural Network inference models.")

    ' Contenedor Base de Datos (Postgres)
    ContainerDb(database, "DB Service", "PostgreSQL", "Stores match history (Event Sourcing), replays, and agent telemetry.")
}

' 3. Relaciones (Flujo de datos)

' Usuario -> Web (HTTPS para seguridad)
Rel(player, web_app, "Plays or Analyzes", "HTTPS")

' Web -> AI (Solicitud unificada Request/Response)
Rel(web_app, ai_service, "Requests move prediction", "HTTP / JSON")

' Web -> DB (Lectura y Escritura explícitas)
Rel(web_app, database, "Reads history / Replays", "SQL / TCP")
Rel(web_app, database, "Saves match results", "SQL / TCP")

' AI -> DB (Telemetría)
Rel(ai_service, database, "Writes telemetry & training stats", "SQL / TCP")

' Colab -> AI (Despliegue - Línea punteada para indicar que es en tiempo de despliegue)
Rel_D(colab, ai_service, "Deploys model artifacts (.onnx)", "File Transfer / DVC")

@enduml

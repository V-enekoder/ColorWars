# System Context (Level 1)

This diagram represents the high-level interaction between the user, the external training systems, and the Color Wars platform.

## Diagram

@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

' Visual settings
LAYOUT_WITH_LEGEND()
title Context Diagram (Level 1) - Color Wars AI Platform

' 1. The Actor (User)
' I changed "User" to "Player / Researcher" to be more specific about the role
Person(player, "Player / Researcher", "A user who wants to play Color Wars matches or analyze strategies.")

' 2. The External System (Google Colab)
System_Ext(colab, "Google Colab", "Allows training Deep Learning-based agents.")

' 3. The System Boundary
System_Boundary(boundary_id, "The System Scope") {
    System(colorwars_system, "Software System (Color Wars)", "Allows playing matches, visualizing predictions, and comparing algorithms.")
}

' 4. Relationships
Rel(player, colorwars_system, "Plays or analyzes")
Rel(colab, colorwars_system, "Delivers the agent (.onnx/.zip)")

@enduml

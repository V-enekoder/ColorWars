@startuml
!theme plain
skinparam linetype ortho
hide empty description

skinparam nodesep 120
skinparam ranksep 80

title State Machine Diagram - Game Lifecycle

state "Lobby / Menu" as Lobby : do / display start button

[*] --> Lobby

state "In Game Match" as Game {
    
    state "Turn Selector" as Selector <<choice>>

    ' --- DEFINICIÓN DE ESTADOS ---
    
    state "AI Turn (Thinking)" as Machine : do / POST /predict\ndo / serialize board

    state "Human Turn (Idle)" as Human {
        state "Waiting Input" as Idle : do / highlight legal moves
        state "Validating" as Validating : do / check rules (TS)
        
        ' Forzamos flujo izquierda-derecha dentro del humano
        Idle -right-> Validating : Click(r, c)
        Validating -left-> Idle : [Invalid]
    }

    ' TRUCO PRO: Flecha invisible para separar horizontalmente IA de Humano
    Machine -[hidden]right-> Human

    state "Resolving State" as Animation : do / apply chain reaction\ndo / render explosion frames

    state "Check Win Condition" as CheckWin : do / count active players

    ' --- CONEXIONES ---
    
    ' Inicio de turnos
    Selector --> Machine : [Player 2 (AI)]
    Selector --> Human : [Player 1]

    ' Convergencia
    Machine --> Animation : [Receive JSON]
    Validating --> Animation : [Valid Move]

    ' Resolución
    Animation --> CheckWin : Animation End
    
    ' Retorno (Bucle)
    CheckWin -up-> Selector : [No Winner]
}

' SALIDA
Lobby --> Selector : Start Game
CheckWin --> GameOver : [Winner Found]

state "Game Over Screen" as GameOver : do / display stats\ndo / update ELO

GameOver -up-> Lobby : Reset / Play Again
GameOver --> [*] : Quit

@enduml

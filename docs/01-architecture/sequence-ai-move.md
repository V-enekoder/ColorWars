@startuml
!theme plain
skinparam responseMessageBelowArrow true
autonumber

title Sequence Diagram: AI Turn (Minimax with Rust)

actor "Player" as User
participant "Web UI\n(Deno Fresh)" as UI
participant "GameEngine\n(TypeScript)" as TSEngine
participant "AI Service\n(FastAPI)" as API
participant "Core Engine\n(Rust / PyO3)" as Rust
database "PostgreSQL" as DB

' --- PHASE 1: TURN SWITCH ---
note over UI, TSEngine: Human finished move.\nUI detects turn switch.

UI -> UI : checkTurn()
activate UI
    
    ' --- PHASE 2: AI REQUEST ---
    note right of UI: Payload: Full Board State (Stateless)
    UI -> API : POST /predict { board: [...], rules: {...} }
    activate API
        
        ' --- PHASE 3: STATE RECONSTRUCTION (Python -> Rust) ---
        API -> Rust : new(rows, cols)
        activate Rust
        Rust --> API : Instance Created
        deactivate Rust
        
        API -> Rust : set_state(board_array)
        activate Rust
        note right of Rust: Conversion: JS Array -> u64 Bitboards
        Rust --> API : State Ready
        deactivate Rust

        ' --- PHASE 4: THINKING (Heavy Calculation) ---
        API -> API : Select Agent (Minimax)
        
        API -> Rust : get_best_move(depth=6)
        activate Rust
        
        loop Iterative Deepening
            Rust -> Rust : Generate Moves
            Rust -> Rust : Alpha-Beta Pruning
            Rust -> Rust : Transposition Table Lookup
        end
        
        Rust --> API : Result { row: 2, col: 3, score: 0.85 }
        deactivate Rust

        ' --- PHASE 5: TELEMETRY (Logging) ---
        API -> DB : INSERT INTO moves (duration_ms, eval, ...)
        activate DB
        DB --> API : ACK
        deactivate DB

    ' --- PHASE 6: RESPONSE & VISUALIZATION ---
    API --> UI : 200 OK { move: [2, 3] }
    deactivate API

    UI -> TSEngine : applyMove(2, 3)
    activate TSEngine
    note right of TSEngine: TS Logic handles\nvisual animation
    TSEngine --> UI : New Board State
    deactivate TSEngine

    UI -> User : Render Explosion 💥
deactivate UI

@enduml

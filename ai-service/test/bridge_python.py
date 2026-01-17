import json
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.enums import RuleOptions
from src.engines.python_naive import PythonNaive


def to_camel_case(snake_str: str) -> str:
    components = snake_str.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


def serialize_state(engine: PythonNaive):
    return {
        "board": [{"points": c.points, "player": c.player} for c in engine._board],
        "currentPlayerIndex": engine._current_player_index,  # <-- Asegura que se llame así
        "roundNumber": engine._round_number,  # <-- Y así
        "winner": engine._winner,
        "cellsByPlayer": engine._cells_by_player,
        # Importante: El orquestador necesita saber el ID para la siguiente jugada
        "currentPlayerId": engine._players[engine._current_player_index].id,
    }


def main():
    engine = None

    for line in sys.stdin:
        try:
            command = json.loads(line)
            action = command.get("action")

            if action == "init":
                engine = PythonNaive(
                    rows=command["rows"],
                    cols=command["cols"],
                    critical_points=command["criticalPoints"],
                    num_players=command["numPlayers"],
                    rules=RuleOptions(command["rules"]),
                )

            elif action == "play":
                if engine:
                    idx = command["index"]
                    player_id = command["player"]

                    if engine._is_legal_move(idx, player_id):
                        engine._add_orb(idx, player_id)

                        if engine._round_number > 1:
                            engine._check_eliminations()

                        engine._advance_turn()

            elif action == "quit":
                break

            # Enviar el estado resultante siempre
            if engine:
                print(json.dumps(serialize_state(engine)), flush=True)

        except Exception as e:
            # Enviamos el error por stderr para no ensuciar stdout
            print(f"Error in Python Bridge: {e}", file=sys.stderr)
            # Opcionalmente enviar un JSON de error
            print(json.dumps({"error": str(e)}), flush=True)


if __name__ == "__main__":
    main()

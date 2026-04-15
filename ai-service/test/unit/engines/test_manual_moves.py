import pytest

from src.core.enums import RuleOptions
from src.core.types import GameConfig, RuleOptions
from src.engines.python_naive import PythonNaive


def test_single_round_debug():
    # 1. Configuración de 3 jugadores en un tablero de 4x4
    config = GameConfig(rows=4, cols=4, critical_points=3, num_players=3, rules=RuleOptions.EMPTY_AND_OWN_ORBS)
    engine = PythonNaive(config)

    print("\nESTADO INICIAL")
    engine.debug_state()

    # 2. Cada jugador hace una jugada
    initial_players = list(engine._active_players_ids)

    for i, player_id in enumerate(initial_players):
        # Obtenemos movimientos legales para el jugador actual
        moves = engine.get_legal_moves(player_id)

        # Elegimos una posición estratégica (diagonal para evitar explosiones rápidas)
        # O simplemente la i-ésima jugada legal
        move = moves[i * 2]
        idx = engine._get_index(move.row, move.col)

        print(f"🕹️ Jugador {player_id} mueve a la celda {idx} (F:{move.row}, C:{move.col})")
        engine.apply_move(idx)

        # Mostramos el estado tras cada jugada
        engine.debug_state()

    # Verificación final
    assert engine._round_number >= 1
    assert len(engine._history) == 3

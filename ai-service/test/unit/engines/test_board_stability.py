import random

import pytest

from src.core.enums import RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_board_stability():
    print("\n🔍 Iniciando Test de Estabilidad del Tablero...")

    critical_limit = 4
    config = GameConfig(
        rows=8, cols=8, critical_points=critical_limit, num_players=2, rules=RuleOptions.EMPTY_AND_OWN_ORBS
    )
    engine = PythonNaive(config)

    iterations = 10000
    for i in range(iterations):
        moves = engine.get_legal_moves(engine.current_player_id)
        if not moves:
            print(f"🏁 Partida terminada en el turno {i} por falta de movimientos.")
            break

        move = random.choice(moves)
        idx = engine._get_index(move.row, move.col)

        engine.apply_move(idx)

        board = engine.get_board()
        for cell_idx, cell in enumerate(board):
            assert cell.points < critical_limit, (
                f"❌ ERROR: Celda {cell_idx} tiene {cell.points} puntos. Límite: {critical_limit}. Turno: {i + 1}"
            )

    print(f"✅ TEST PASADO: El tablero se mantuvo estable tras {iterations} movimientos.")


if __name__ == "__main__":
    test_board_stability()

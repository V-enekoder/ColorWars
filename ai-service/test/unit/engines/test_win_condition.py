import random

import pytest

from src.core.enums import GameStatus, RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_win_condition_detection():
    print("\n   🧪 Testing Win Condition detection...")
    config = GameConfig(rows=5, cols=5, critical_points=2, num_players=2, rules=RuleOptions.EMPTY_AND_OWN_ORBS)
    engine = PythonNaive(config)

    moves_count = 0
    max_moves = 2000

    while engine.game_result.status == GameStatus.PLAYING and moves_count < max_moves:
        current_player = engine.current_player_id
        legal_moves = engine.get_legal_moves(current_player)

        if not legal_moves:
            print("   ⚠️ No legal moves left!")
            break

        move = random.choice(legal_moves)
        idx = engine._get_index(move.row, move.col)

        try:
            engine.apply_move(idx)
            moves_count += 1
            # Opcional: imprimir cada paso si quieres ver la "película" completa
            # engine.debug_state()
        except Exception as e:
            print(f"\n❌ CRASH DETECTADO en movimiento {moves_count + 1}")
            print(f"Acción: Jugador {current_player} a índice {idx}")
            engine.debug_state()
            raise e

    print(f"   Game finished in {moves_count} moves. Final status: {engine.game_result.status}")
    assert engine.game_result.status != GameStatus.PLAYING

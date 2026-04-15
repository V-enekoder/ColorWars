import pytest

from src.core.enums import RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_explosion_distribution_and_captures():
    # Setup 3x3 board where critical limit is 2
    config = GameConfig(rows=3, cols=3, critical_points=2, num_players=2, rules=RuleOptions.EMPTY_AND_OWN_ORBS)
    engine = PythonNaive(config)

    p1_start = engine._get_index(0, 0)
    p2_start = engine._get_index(2, 2)
    target_idx = engine._get_index(1, 1)
    enemy_idx = engine._get_index(1, 2)

    # Round 1: Occupy distant cells to bypass adjacency rule
    engine.apply_move(p1_start)
    engine.apply_move(p2_start)

    # Round 2: Setup orbs for explosion
    engine.apply_move(target_idx)  # Player 1
    engine.apply_move(enemy_idx)  # Player 2

    # Round 3: Trigger explosion
    engine.apply_move(target_idx)  # Player 1 hits limit 2 -> EXPLODES

    final_board = engine.get_board()

    # 1. Origin cell should be empty
    assert final_board[target_idx].points == 0
    assert final_board[target_idx].player == 0

    # 2. Neighboring enemy should have received an orb and exploded as well
    assert final_board[enemy_idx].points == 0
    assert final_board[enemy_idx].player == 0

    # 3. Check distant neighbor captured during the chain reaction
    neighbor_idx = engine._get_index(0, 1)
    assert final_board[neighbor_idx].player == 1
    assert final_board[neighbor_idx].points == 1

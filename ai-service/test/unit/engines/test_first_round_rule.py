import pytest

from src.core.enums import RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_prevent_playing_next_to_enemy_in_round_1():
    # Setup 5x5 board
    config = GameConfig(rows=5, cols=5, critical_points=3, num_players=2, rules=RuleOptions.EMPTY_AND_OWN_ORBS)
    engine = PythonNaive(config)

    # Player 1 plays at center (2,2)
    p1_idx = engine._get_index(2, 2)
    engine.apply_move(p1_idx)

    # Player 2 tries to play at (2,3) - adjacent to Player 1
    p2_neighbor_idx = engine._get_index(2, 3)
    legal_moves_p2 = engine.get_legal_moves(2)

    # Check if the neighbor index is in the list of legal coordinates
    is_neighbor_legal = any(engine._get_index(m.row, m.col) == p2_neighbor_idx for m in legal_moves_p2)

    assert is_neighbor_legal is False, "Player 2 should not be allowed to play adjacent to Player 1 in Round 1"

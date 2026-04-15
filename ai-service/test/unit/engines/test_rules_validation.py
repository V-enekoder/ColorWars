import pytest

# Ensure your RuleOptions has the attribute ONLY_OWN_ORBS (plural) as per your previous TS code
from src.core.enums import RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_prevent_playing_on_enemy_cells():
    # Setup with ONLY_OWN_ORBS rule
    config = GameConfig(rows=5, cols=5, critical_points=3, num_players=2, rules=RuleOptions.ONLY_OWN_ORB)
    engine = PythonNaive(config)

    p1_move_idx = engine._get_index(0, 0)

    # Player 1 takes a cell
    engine.apply_move(p1_move_idx)

    # Player 2 attempts to play on Player 1's cell
    legal_moves_p2 = engine.get_legal_moves(2)

    # Verify P1's cell is not in P2's legal moves
    is_p1_cell_in_p2_moves = any(engine._get_index(m.row, m.col) == p1_move_idx for m in legal_moves_p2)

    assert is_p1_cell_in_p2_moves is False, "Player 2 should not be able to play on Player 1's cell"

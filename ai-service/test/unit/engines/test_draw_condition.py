import pytest

from src.core.enums import GameStatus, RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_draw_by_capture_limit():
    print("\n   🧪 Testing Draw Condition (Capture Limit)...")

    # Critical points set to 100 to prevent any accidental explosions
    config = GameConfig(rows=4, cols=4, critical_points=100, num_players=2, rules=RuleOptions.EMPTY_AND_OWN_ORBS)
    engine = PythonNaive(config)

    expected_limit = 50  # 25 * 2 players
    moves_count = 0

    # Play until draw is detected
    while engine.game_result.status == GameStatus.PLAYING and moves_count < 100:
        player = engine.current_player_id
        legal_moves = engine.get_legal_moves(player)
        if not legal_moves:
            break

        # Pick the first legal move to be deterministic
        move = legal_moves[0]
        idx = engine._get_index(move.row, move.col)
        engine.apply_move(idx)
        moves_count += 1

    print(f"   Final Counter: {engine._turns_without_captures}")
    print(f"   Total Moves: {moves_count}")

    # Assertions
    assert engine._turns_without_captures == expected_limit
    assert engine.game_result.status == GameStatus.DRAW


def test_draw_by_repetition_logic():
    config = GameConfig(rows=3, cols=3, critical_points=3, num_players=2, rules=RuleOptions.EMPTY_AND_OWN_ORBS)
    engine = PythonNaive(config)
    current_hash = engine.current_hash

    # Manually register the same position 3 times
    for _ in range(3):
        engine._register_position(current_hash)

    # Verify repetition logic
    assert engine._is_draw(current_hash) is True

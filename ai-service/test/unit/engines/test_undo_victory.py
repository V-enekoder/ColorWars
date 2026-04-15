import pytest

from src.core.enums import GameStatus, RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_undo_after_win_restores_state():
    print("\n   🧪 Testing Undo logic after a Victory state...")

    # 1. Setup: Small 3x3 board with critical limit 2 for fast game
    config = GameConfig(rows=3, cols=3, critical_points=2, num_players=2, rules=RuleOptions.EMPTY_AND_OWN_ORBS)
    engine = PythonNaive(config)

    moves_count = 0
    max_moves = 100

    # 2. Play automatically until someone wins
    while engine.game_result.status == GameStatus.PLAYING and moves_count < max_moves:
        current_player = engine.current_player_id
        legal_moves = engine.get_legal_moves(current_player)

        if not legal_moves:
            break

        # Pick the first legal move available
        move = legal_moves[0]
        idx = engine._get_index(move.row, move.col)
        engine.apply_move(idx)
        moves_count += 1

    # Verify we actually reached a win state
    assert engine.game_result.status == GameStatus.WIN, "Test should reach a WIN state"
    winning_hash = engine.current_hash

    print(f"   🏆 Player {engine.game_result.winner_id} won. Active players: {len(engine._active_players_ids)}")
    assert len(engine._active_players_ids) == 1

    # 3. ACTION: Undo the winning move
    print("   ⏪ Performing Undo of the winning move...")
    engine.undo_last_move()

    # 4. VERIFICATIONS
    # A. Status should return to playing
    assert engine.game_result.status == GameStatus.PLAYING

    # B. Both players should be active again
    assert len(engine._active_players_ids) == 2

    # C. Both players should have orbs on the board
    cell_counts = engine.get_cells_by_player()
    players_with_cells = [count for pid, count in cell_counts if count > 0]
    assert len(players_with_cells) == 2

    # D. Hash must be different from the winning hash
    assert engine.current_hash != winning_hash

    print("   ✅ Success: Undo after Win restored the game state perfectly.")

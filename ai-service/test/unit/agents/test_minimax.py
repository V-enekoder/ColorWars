import time

import pytest

from src.agents.minimax_variants.vanilla import Minimax
from src.core.dtos import GameConfig  # Ajusta según tu estructura de carpetas
from src.core.enums import GameStatus, RuleOptions
from src.engines.python_naive import PythonNaive


class TestMinimax5x5:
    @pytest.fixture
    def config_5x5(self):
        """Define la configuración para un tablero de 5x5."""
        return GameConfig(rows=5, cols=5, critical_points=4, num_players=2, rules=RuleOptions.ONLY_OWN_ORB)

    @pytest.fixture
    def engine(self, config_5x5):
        """Instancia el motor PythonNaive con la config de 5x5."""
        return PythonNaive(config=config_5x5)

    def test_minimax_respects_round_1_rule_5x5(self, engine):
        """Valida que el Minimax no elija celdas adyacentes al enemigo en Ronda 1."""
        center_idx = 12  # (2,2)
        engine.apply_move(center_idx)

        assert engine.current_player_id == 2
        assert engine._round_number == 1

        searcher = Minimax()
        best_move = searcher.search(engine, time_limit=0.5)

        forbidden_moves = [(1, 2), (3, 2), (2, 1), (2, 3)]
        chosen_move = (best_move.row, best_move.col)

        assert chosen_move not in forbidden_moves, f"IA eligió celda prohibida {chosen_move}"
        assert engine._board[best_move.row * 5 + best_move.col].player == 0

    def test_minimax_winning_move_explosion_5x5(self, engine):
        engine._board[0].player = 1
        engine._board[0].points = 1

        engine._board[1].player = 2
        engine._board[1].points = 1

        engine._cells_by_player[1] = 1
        engine._cells_by_player[2] = 1

        engine._current_player_id = 1
        engine._round_number = 2
        engine._active_players_ids = [1, 2]

        engine._legal_moves = []

        searcher = Minimax()
        best_move = searcher.search(engine, time_limit=0.5)

        assert best_move.row == 0
        assert best_move.col == 0

    def test_iterative_deepening_timeout_5x5(self, engine):
        """Verifica que en 5x5 se respete el límite de tiempo."""
        searcher = Minimax()

        start_t = time.time()
        searcher.search(engine, time_limit=0.4)
        end_t = time.time()

        assert end_t - start_t < 0.6

    def test_terminal_state_detection_immediate(self, engine):
        """Verifica el retorno de score máximo en estado terminal."""
        engine._active_player_ids = [1]
        engine._game_result.status = GameStatus.WIN
        engine._game_result.winner_id = 1

        searcher = Minimax()
        score, _ = searcher.minimax(
            engine=engine, depth=0, max_depth=1, is_maximizing=True, maximizing_player_id=1, deadline=time.time() + 1
        )

        assert score == 1000.0

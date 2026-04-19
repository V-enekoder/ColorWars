import pytest

from src.core.dtos import GameConfig
from src.core.enums import RuleOptions
from src.engines.python_naive import PythonNaive


class TestGameRules:
    @pytest.fixture
    def config_only_own(self):
        """Configuración con la regla de solo poder jugar en orbes propios tras ronda 1."""
        return GameConfig(rows=5, cols=5, critical_points=4, num_players=2, rules=RuleOptions.ONLY_OWN_ORB)

    @pytest.fixture
    def engine(self, config_only_own):
        return PythonNaive(config=config_only_own)

    def test_round_1_adjacency_restriction(self, engine):
        """
        Validar que en la Ronda 1 no se puede jugar en celdas vacías
        adyacentes a un enemigo (incluyendo diagonales según tu código).
        """
        # P1 juega en el centro (2, 2) -> índice 12
        engine.apply_move(12)

        # Ahora es el turno de P2, Ronda 1
        assert engine.current_player_id == 2
        assert engine._round_number == 1

        # Celdas prohibidas para P2 (adyacentes a 12 en 5x5):
        # (1,1), (1,2), (1,3), (2,1), (2,3), (3,1), (3,2), (3,3)
        forbidden_indices = [6, 7, 8, 11, 13, 16, 17, 18]

        for idx in forbidden_indices:
            assert engine._is_legal_move(idx, 2) is False, f"Índice {idx} debería ser ilegal en Ronda 1"

        # Celda lejana debería ser legal
        assert engine._is_legal_move(0, 2) is True  # Esquina (0,0)

    def test_only_own_orb_rule_after_round_1(self, engine):
        """
        Validar que con ONLY_OWN_ORB, en la Ronda 2+,
        un jugador NO puede jugar en celdas vacías.
        """
        # Simular que pasamos a la Ronda 2
        engine.apply_move(0)  # P1 juega en (0,0)
        engine.apply_move(24)  # P2 juega en (4,4)

        # Forzar Ronda 2
        engine._round_number = 2
        engine._current_player_id = 1

        # P1 tiene celda en 0. Intentar jugar en celda vacía 12
        assert engine._board[12].player == 0
        assert engine._is_legal_move(12, 1) is False, "En R2+ con ONLY_OWN_ORB no se puede jugar en vacías"

        # Intentar jugar en su propia celda 0
        assert engine._is_legal_move(0, 1) is True, "Debe poder jugar en su propia celda"

    def test_cannot_play_on_enemy_orb(self, engine):
        """Validar que nunca se puede jugar directamente sobre un orbe enemigo."""
        engine.apply_move(0)  # P1 pone orbe en 0

        # Turno de P2
        assert engine._is_legal_move(0, 2) is False, "P2 no puede jugar sobre orbe de P1"

    def test_get_legal_moves_count_round_1(self, engine):
        """Verifica que la lista de movimientos legales se filtre correctamente."""
        # Asegúrate de que el engine es realmente 5x5
        assert engine._rows == 5
        assert engine._cols == 5
        assert len(engine._board) == 25

        # Tablero vacío: todos los movimientos (25) son legales
        moves = engine.get_legal_moves(1)
        assert len(moves) == 25

        # P1 mueve al centro (2,2) -> Índice 12
        engine.apply_move(12)

        # P2 en Ronda 1:
        # Total (25) - Ocupada (1) - Vecinos 8 dir (8) = 16
        moves_p2 = engine.get_legal_moves(2)
        assert len(moves_p2) == 16

    def test_empty_and_own_orbs_rule(self, config_only_own):
        """Validar que si cambiamos la regla, sí se puede jugar en vacías en R2."""
        config_easy = config_only_own.model_copy()
        config_easy.rules = RuleOptions.EMPTY_AND_OWN_ORBS

        engine_easy = PythonNaive(config=config_easy)
        engine_easy._round_number = 2

        # En esta regla, aunque sea R2, una celda vacía es legal
        assert engine_easy._is_legal_move(10, 1) is True

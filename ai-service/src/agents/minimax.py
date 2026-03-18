import math

from src.core.interfaces import Agent, IGameEngine, Move
from src.core.types import GameState


class MinimaxAgent(Agent):
    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)
        self._maximizing_player_id = None
        self._is_maximizing = None
        self._depth = None

    def set_configuration(self, depth: int = 10, is_maximizing: bool = False, maximizing_player_id: int = None):
        self._depth: int = depth
        self._is_maximizing: bool = is_maximizing
        self._maximizing_player_id: int = maximizing_player_id

    def _calculate_move(self, engine: IGameEngine) -> Move:
        best_score: float = -math.inf
        best_move: Move | None = None
        player_id = engine.get_current_player_id()
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(row=0, col=0)

        prev_state = GameState(
            board=engine.get_board(),
            player_id=engine.get_current_player_id(),
            legal_moves=engine.get_legal_moves(engine.get_current_player_id()),
        )
        for move in available_moves:
            index: int = move.row * engine.cols + move.col
            engine.apply_move(index)
            score: float = self.minimax(
                engine=engine,
                depth=0,
                max_depth=10,
                is_maximizing=False,
                maximizing_player_id=player_id,
                winner=engine.get_winner(),
            )
            engine.set_state(prev_state)
            if score > best_score:
                best_score, best_move = score, move
        return best_move

    def minimax(
        self,
        engine: IGameEngine,
        depth: int,
        max_depth: int,
        is_maximizing: bool,
        maximizing_player_id: int,
        winner: int,
    ) -> float:
        if winner != 0:
            return 1000.0 if maximizing_player_id == 1 else -1000.0

        if depth == max_depth:
            return engine.evaluate_position(maximizing_player_id)

        legal_moves: list[Move] = engine.get_legal_moves(maximizing_player_id)
        if legal_moves is None or len(legal_moves) == 0:
            return 0

        prev_state = GameState(
            board=engine.get_board(),
            player_id=engine.get_current_player_id(),
            legal_moves=engine.get_legal_moves(engine.get_current_player_id()),
        )

        best_score: float = -math.inf if is_maximizing else math.inf

        for move in legal_moves:
            index: int = move.row * engine.cols + move.col
            engine.apply_move(index)
            score: float = self.minimax(
                engine=engine,
                depth=depth + 1,
                max_depth=10,
                is_maximizing=not is_maximizing,
                maximizing_player_id=maximizing_player_id,
                winner=engine.get_winner(),
            )
            engine.set_state(prev_state)
            best_score = max(score, best_score) if is_maximizing else min(score, best_score)

        return best_score

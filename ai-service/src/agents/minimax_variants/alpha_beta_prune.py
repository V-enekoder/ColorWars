import math
import time

from src.core.interfaces import EngineMinimax, ISearcher
from src.core.types import Move
from src.exceptions.TimeExpired import TimeExpired
from test.benchmarks.SearchStats import SearchStats


class MinimaxAlphaBeta(ISearcher):
    """
    Minimax searcher with alpha-beta pruning and move ordering.
    """

    def __init__(self):
        self.best_moves_by_depth: dict[int, Move] = {}
        self.history_scores = {}

    def search(self, engine: EngineMinimax, time_limit: float) -> Move:
        best_score: float = -math.inf
        best_move: Move | None = None
        player_id = engine.get_current_player_id()
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(row=0, col=0)

        engine.save_state()

        alpha: float = -math.inf
        beta: float = math.inf
        inicio = time.time()
        deadline: float = time.time() + time_limit
        max_depth: int = 1
        stats: SearchStats = SearchStats(start_time=time.time())
        while time.time() - inicio < deadline:
            sorted_moves = self.order_moves(moves_to_order=available_moves, engine=engine)

            try:
                score, move = self.minimax_alpha_beta(
                    engine=engine,
                    moves=sorted_moves,
                    depth=0,
                    max_depth=max_depth,
                    is_maximizing=True,
                    maximizing_player_id=player_id,
                    alpha=alpha,
                    beta=beta,
                    deadline=deadline,
                    stats=stats,
                )
            except TimeExpired:
                return best_move
            if score > best_score:
                best_score, best_move = score, move
            self.best_moves_by_depth[max_depth] = best_move
            max_depth += 1
        return best_move

    def minimax_alpha_beta(
        self,
        engine: EngineMinimax,
        moves: list[Move] | None,
        depth: int,
        max_depth: int,
        is_maximizing: bool,
        maximizing_player_id: int,
        alpha: float,
        beta: float,
        deadline: float,
        stats: SearchStats | None = None,
    ) -> tuple[float, Move | None]:
        stats.increment_nodes()
        if engine.get_winner() != 0:
            return (1000.0 if maximizing_player_id == 1 else -1000.0), None

        if depth == max_depth or depth == 100:
            return engine.evaluate_position(maximizing_player_id), None

        if time.time() > deadline:
            raise TimeExpired

        if moves is None or len(moves) == 0:
            moves: list[Move] = engine.get_legal_moves(maximizing_player_id)
        if depth <= 3:
            moves = self.order_moves(moves_to_order=moves, engine=engine)

        fav_move = self.best_moves_by_depth.get(depth)

        if fav_move in moves:
            moves.remove(fav_move)
            moves.insert(0, fav_move)

        engine.save_state()

        best_score: float = -math.inf if is_maximizing else math.inf
        best_move: Move | None = None
        for move in moves:
            index: int = move.row * engine.cols + move.col
            engine.apply_move(index)

            score, _ = self.minimax_alpha_beta(
                engine=engine,
                depth=depth + 1,
                moves=None,
                max_depth=max_depth,
                is_maximizing=not is_maximizing,
                maximizing_player_id=maximizing_player_id,
                alpha=alpha,
                beta=beta,
                deadline=deadline,
                stats=stats,
            )
            engine.restore_state()

            if is_maximizing:
                if score > best_score:
                    best_score = score
                    best_move = move
                alpha = max(alpha, best_score)
                if beta <= alpha:
                    break  # Poda Beta
            else:
                if score < best_score:
                    best_score = score
                    best_move = move
                beta = min(beta, best_score)
                if beta <= alpha:
                    break  # Poda Alpha
        return best_score, best_move

    def order_moves(self, moves_to_order: list[Move], engine: EngineMinimax) -> list[Move]:
        sorted_moves = sorted(moves_to_order, key=lambda m: self.history_scores.get(m, -math.inf), reverse=True)
        return sorted_moves

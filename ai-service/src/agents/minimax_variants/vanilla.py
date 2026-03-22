import math
import time

from src.core.interfaces import EngineMinimax, ISearcher
from src.core.types import Move
from src.exceptions.TimeExpired import TimeExpired
from test.benchmarks.SearchStats import SearchStats


class Minimax(ISearcher):
    def search(self, engine: EngineMinimax, time_limit: float) -> Move:
        best_score: float = -math.inf
        best_move: Move | None = None
        player_id = engine.get_current_player_id()
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(row=0, col=0)

        engine.save_state()
        inicio = time.time()
        deadline: float = time.time() + time_limit
        max_depth: int = 1
        stats: SearchStats = SearchStats(start_time=time.time())
        while time.time() - inicio < deadline:
            try:
                score, move = self.minimax(
                    engine=engine,
                    depth=0,
                    max_depth=max_depth,
                    is_maximizing=True,
                    maximizing_player_id=player_id,
                    deadline=deadline,
                    stats=stats,
                )
            except TimeExpired:
                print(f"Se exploraron {stats.get_nps():.3f}")
                return best_move
            if score > best_score:
                best_score, best_move = score, move
            max_depth += 1
        print(f"Se exploraron ya{stats.get_nps():.3f}")
        return best_move

    def minimax(
        self,
        engine: EngineMinimax,
        depth: int,
        max_depth: int,
        is_maximizing: bool,
        maximizing_player_id: int,
        deadline: float,
        stats: SearchStats | None = None,
    ) -> (float, Move | None):
        stats.increment_nodes()

        if engine.get_winner() != 0:
            return (1000.0 if maximizing_player_id == 1 else -1000.0), None

        if depth == max_depth or depth == 100:
            return engine.evaluate_position(maximizing_player_id), None

        if time.time() > deadline:
            raise TimeExpired()

        legal_moves: list[Move] = engine.get_legal_moves(maximizing_player_id)
        if legal_moves is None or len(legal_moves) == 0:
            return 0.0, None

        engine.save_state()

        best_score: float = -math.inf if is_maximizing else math.inf
        best_move: Move | None = None
        for move in legal_moves:
            index: int = move.row * engine.cols + move.col
            engine.apply_move(index)

            score, _ = self.minimax(
                engine=engine,
                depth=depth + 1,
                max_depth=max_depth,
                is_maximizing=not is_maximizing,
                maximizing_player_id=maximizing_player_id,
                deadline=deadline,
                stats=stats,
            )
            engine.restore_state()

            best_score = max(score, best_score) if is_maximizing else min(score, best_score)
            best_move = move
        return best_score, best_move

import math
import time

from typing_extensions import overload, override

from src.core.enums import GameStatus
from src.core.interfaces import EngineMinimax, ISearcher
from src.core.types import Move
from src.exceptions.TimeExpired import TimeExpired
from test.benchmarks.SearchStats import SearchStats


class Minimax(ISearcher):
    @override
    def search(self, engine: EngineMinimax, time_limit: float, stats: SearchStats | None = None) -> Move:
        player_id = engine.current_player_id
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(row=0, col=0)

        best_move: Move = available_moves[0]
        best_score: float = -math.inf

        inicio = time.time()
        deadline: float = time.time() + time_limit
        max_depth: int = 1
        if stats:
            stats.start_time = inicio
        while time.time() < deadline:
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
                best_score = score
                if move is not None:
                    best_move = move
                if stats:
                    stats.max_depth_reached = max_depth

                if best_score >= 1000.0:
                    break

                max_depth += 1

            except TimeExpired:
                break
        if stats:
            stats.end_time = time.time()
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
    ) -> tuple[float, Move | None]:
        if stats:
            stats.increment_nodes(depth)

        if engine.game_result.status == GameStatus.WIN:
            return (1000.0 if engine.game_result.winner_id == maximizing_player_id else -1000.0), None

        if engine.game_result.status == GameStatus.DRAW:
            return 0, None

        if depth == max_depth:  # or depth == 10:
            return engine.evaluate_position(maximizing_player_id), None

        if time.time() > deadline:
            raise TimeExpired()

        legal_moves: list[Move] = engine.get_legal_moves(engine.current_player_id)
        if not legal_moves:
            return engine.evaluate_position(maximizing_player_id), None

        best_score: float = -math.inf if is_maximizing else math.inf
        best_move: Move | None = None
        for move in legal_moves:
            index: int = move.row * engine.cols + move.col
            # engine.save_state()
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
            engine.undo_last_move()
            # engine.restore_state()

            if is_maximizing:
                if score > best_score:
                    best_score = score
                    best_move = move
            else:
                if score < best_score:
                    best_score = score
                    best_move = move
        return best_score, best_move

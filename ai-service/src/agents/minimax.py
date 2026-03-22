import math
import time

from src.core.dtos import MinimaxOptimizations
from src.core.interfaces import Agent, EngineMinimax, ISearcher, Move

# used strategy pattern


class MinimaxAgent(Agent):
    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)
        # self._optimizations: MinimaxOptimizations = MinimaxOptimizations()
        self._maximizing_player_id = None

    def set_configuration(
        self,
        optimizations,
    ):
        self._optimizations: MinimaxOptimizations = optimizations

    def _calculate_move(self, engine: EngineMinimax) -> Move:
        searcher = self.searcher_factory()

        return searcher.search(engine=engine, time_limit=1)  # self.time_limit)

    def searcher_factory(self):
        _SEARCHERS: dict[MinimaxOptimizations, type[ISearcher]] = {
            MinimaxOptimizations.VANILLA: Minimax,
            MinimaxOptimizations.ALPHA_BETA_PRUNING: MinimaxAlphaBeta,
            # MinimaxOptimizations.transposition_table: MinimaxWithTransposition,
            # MinimaxOptimizations.null_move_pruning: MinimaxWithNullMovePruning
        }

        searcher = _SEARCHERS.get(self._optimizations)

        if not searcher:
            return Minimax()

        return searcher()
        """
        best_score: float = -math.inf
        best_move: Move | None = None
        player_id = engine.get_current_player_id()
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(row=0, col=0)

        engine.save_state()

        alpha: float | None = -math.inf if self._optimizations.alpha_beta_pruning else None
        beta: float | None = math.inf if self._optimizations.alpha_beta_pruning else None

        counter = {"nodes": 0}
        inicio = time.time()
        deadline: float = time.time() + 5
        max_depth: int = 1
        while time.time() - inicio < deadline:
            try:
                score, move = self.minimax(
                    engine=engine,
                    depth=0,
                    max_depth=max_depth,
                    is_maximizing=True,
                    maximizing_player_id=player_id,
                    winner=engine.get_winner(),
                    counter=counter,
                    alpha=alpha,
                    beta=beta,
                    deadline=deadline,
                )
            except TimeExpired:
                return best_move
            if score > best_score:
                best_score, best_move = score, move
            max_depth += 1
        return best_move
        """


"""
    def minimax(
        self,
        engine: EngineMinimax,
        depth: int,
        max_depth: int,
        is_maximizing: bool,
        maximizing_player_id: int,
        winner: int,
        counter: dict[str, int],
        alpha: float,
        beta: float,
        deadline: float,
    ) -> (float, Move | None):
        counter["nodes"] += 1

        if winner != 0:
            return 1000.0, None if maximizing_player_id == 1 else -1000.0, None

        if depth == max_depth or depth == 5:
            return engine.evaluate_position(maximizing_player_id), None

        if time.time() > deadline:
            raise TimeExpired()

        legal_moves: list[Move] = engine.get_legal_moves(maximizing_player_id)
        if legal_moves is None or len(legal_moves) == 0:
            return 0.0, None

        engine.save_state()

        best_score: float = -math.inf if is_maximizing else math.inf
        best_move: Move | None = None
        # inicio = time.time()
        for move in legal_moves:
            index: int = move.row * engine.cols + move.col
            engine.apply_move(index)

            score, _ = self.minimax(
                engine=engine,
                depth=depth + 1,
                max_depth=max_depth,
                is_maximizing=not is_maximizing,
                maximizing_player_id=maximizing_player_id,
                winner=engine.get_winner(),
                counter=counter,
                alpha=alpha,
                beta=beta,
                deadline=deadline,
            )
            engine.restore_state()

            if self._optimizations.alpha_beta_pruning:
                if is_maximizing:
                    best_score = max(best_score, score)
                    best_move = move
                    alpha = max(alpha, best_score)
                    if beta <= alpha:
                        break  # Poda beta
                else:
                    best_score = min(best_score, score)
                    best_move = move
                    beta = min(beta, best_score)
                    if beta <= alpha:
                        break  # Poda alpha

            else:
                best_score = max(score, best_score) if is_maximizing else min(score, best_score)
                best_move = move
        return (best_score, best_move)
    """


class TimeExpired(Exception):
    def __init__(self):
        pass


class Minimax(ISearcher):
    def search(self, engine: EngineMinimax, time_limit: float) -> Move:
        best_score: float = -math.inf
        best_move: Move | None = None
        player_id = engine.get_current_player_id()
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(row=0, col=0)

        engine.save_state()
        counter = {"nodes": 0}
        inicio = time.time()
        deadline: float = time.time() + time_limit
        max_depth: int = 1
        while time.time() - inicio < deadline:
            try:
                score, move = self.minimax(
                    engine=engine,
                    depth=0,
                    max_depth=max_depth,
                    is_maximizing=True,
                    maximizing_player_id=player_id,
                    counter=counter,
                    deadline=deadline,
                )
            except TimeExpired:
                return best_move
            if score > best_score:
                best_score, best_move = score, move
            max_depth += 1
        return best_move

    def minimax(
        self,
        engine: EngineMinimax,
        depth: int,
        max_depth: int,
        is_maximizing: bool,
        maximizing_player_id: int,
        counter: dict[str, int],
        deadline: float,
    ) -> (float, Move | None):
        counter["nodes"] += 1

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
                counter=counter,
                deadline=deadline,
            )
            engine.restore_state()

            best_score = max(score, best_score) if is_maximizing else min(score, best_score)
            best_move = move
        return best_score, best_move


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
        counter = {"nodes": 0}
        inicio = time.time()
        deadline: float = time.time() + 5
        max_depth: int = 1

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
                    counter=counter,
                    alpha=alpha,
                    beta=beta,
                    deadline=deadline,
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
        counter: dict[str, int],
        alpha: float,
        beta: float,
        deadline: float,
    ) -> tuple[float, Move | None]:
        counter["nodes"] += 1

        if engine.get_winner() != 0:
            return (1000.0 if maximizing_player_id == 1 else -1000.0), None

        if depth == max_depth or depth == 100:
            return engine.evaluate_position(maximizing_player_id), None

        if time.time() > deadline:
            raise TimeExpired()

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
                counter=counter,
                alpha=alpha,
                beta=beta,
                deadline=deadline,
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

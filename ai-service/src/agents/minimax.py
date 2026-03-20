import math
import time

from src.core.dtos import MinimaxOptimizations
from src.core.interfaces import Agent, EngineMinimax, Move


class MinimaxAgent(Agent):
    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)
        self._optimizations: MinimaxOptimizations = MinimaxOptimizations()
        self._maximizing_player_id = None
        self._is_maximizing = None

    def set_configuration(
        self,
        optimizations,
    ):
        self._optimizations: MinimaxOptimizations = optimizations

    def _calculate_move(self, engine: EngineMinimax) -> Move:
        best_score: float = -math.inf
        best_move: Move | None = None
        player_id = engine.get_current_player_id()
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(row=0, col=0)

        engine.save_state()

        alpha: float = -math.inf if self._optimizations.alpha_beta_pruning else None
        beta: float = math.inf if self._optimizations.alpha_beta_pruning else None

        counter = {"nodes": 0}
        inicio = time.time()
        deadline: float = time.time() + 5
        max_depth: int = 1
        while time.time() - inicio < deadline:
            for move in available_moves:
                index: int = move.row * engine.cols + move.col
                engine.apply_move(index)
                try:
                    score: float = self.minimax(
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
                engine.restore_state()
                if score > best_score:
                    best_score, best_move = score, move
            max_depth = max_depth + 1
        # fin = time.time()
        # tiempo = fin - inicio
        # eficiencia = counter["nodes"] / tiempo
        # print(f"\nSe evaluaron {counter['nodes']} nodos  en {tiempo:.3f} segundos")
        # print(f"Nodos/segundo = {eficiencia:.3f}\n")
        return best_move

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
    ) -> float:
        counter["nodes"] += 1

        if winner != 0:
            return 1000.0 if maximizing_player_id == 1 else -1000.0

        if depth == max_depth or depth == 5:
            return engine.evaluate_position(maximizing_player_id)

        if time.time() > deadline:
            raise TimeExpired()

        legal_moves: list[Move] = engine.get_legal_moves(maximizing_player_id)
        if legal_moves is None or len(legal_moves) == 0:
            return 0

        engine.save_state()

        best_score: float = -math.inf if is_maximizing else math.inf
        # inicio = time.time()
        for move in legal_moves:
            index: int = move.row * engine.cols + move.col
            engine.apply_move(index)

            score: float = self.minimax(
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
                    alpha = max(alpha, best_score)
                    if beta <= alpha:
                        break  # Poda beta
                else:
                    best_score = min(best_score, score)
                    beta = min(beta, best_score)
                    if beta <= alpha:
                        break  # Poda alpha

            else:
                best_score = max(score, best_score) if is_maximizing else min(score, best_score)
        # fin = time.time()
        # tiempo = fin - inicio
        # eficiencia = counter["nodes"] / tiempo
        # print(f"\nSe evaluaron {counter['nodes']} nodos  en {tiempo:.3f} segundos")
        # print(f"Nodos/segundo = {eficiencia:.3f}\n")
        return best_score


class TimeExpired(Exception):
    def __init__(self):
        pass

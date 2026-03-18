import math

from src.core.types import CellData, GameState
from src.core.interfaces import Agent, IGameEngine, Move

class MinimaxAgent(Agent):
    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)
        self._maximizing_player_id = None
        self._is_maximizing = None
        self._depth = None

    def set_configuration(self, depth: int=10, is_maximizing: bool=False, maximizing_player_id: int=None):
        self._depth: int = depth
        self._is_maximizing: bool = is_maximizing
        self._maximizing_player_id: int = maximizing_player_id

    def _calculate_move(self, engine: IGameEngine) -> Move:
        board: list[CellData] = engine.get_board()
        best_score: float = -math.inf
        best_move: Move = None
        player_id = engine.get_current_player_id()
        available_moves: list[Move] = engine.get_legal_moves(player_id)

        if not available_moves:
            return Move(0,0)

        for move in available_moves:
            prev_state = GameState(
                board=engine.get_board(),
                player_id=engine.get_current_player_id(),
                legal_moves=engine.get_legal_moves(engine.get_current_player_id())

            )
            index: int = move.row * 8 + move.col  #row * self._cols + col
            engine.apply_move(index)
            score: int = self.minimax(engine=engine, depth=0, max_depth=10, is_maximizing=False,
                                      maximizing_player_id=player_id, winner=engine.get_winner())
            engine.set_state(prev_state)
            if score > best_score:
                best_score, best_move = score, move
        return best_move

    def minimax(self, engine: IGameEngine, depth: int,max_depth: int, is_maximizing: bool, maximizing_player_id: int, winner: int,
                ) -> None | int | float:

       if winner != 0:
        return 1000 if maximizing_player_id == 1 else -1000

       if depth == max_depth:
            return engine.evaluate_position(maximizing_player_id)
       if is_maximizing:
        best_score: float = -math.inf
        for move in engine.get_legal_moves(maximizing_player_id):
            prev_state = GameState(
                board=engine.get_board(),
                player_id=engine.get_current_player_id(),
                legal_moves=engine.get_legal_moves(engine.get_current_player_id())
            )
            index: int = move.row * 8 + move.col  #row * self._cols + col
            engine.apply_move(index)
            score: int = self.minimax(engine, depth
                                      + 1,max_depth=10, is_maximizing=False, maximizing_player_id=maximizing_player_id,
                                      winner=winner)
            engine.set_state(prev_state)
            best_score = max(score, best_score)
            return best_score
       else:
           best_score: float = math.inf
           for move in engine.get_legal_moves(maximizing_player_id):
               prev_state = GameState(
                   board=engine.get_board(),
                   player_id=engine.get_current_player_id(),
                   legal_moves=engine.get_legal_moves(engine.get_current_player_id())
               )
               index: int = move.row * 8 + move.col  # row * self._cols + col
               engine.apply_move(index)
               score: int = self.minimax(engine, depth
                                         + 1, max_depth=10, is_maximizing=True, maximizing_player_id=maximizing_player_id,
                                         winner=winner)
               engine.set_state(prev_state)
               best_score = min(score, best_score)
               return best_score

"""

    
def minimax_bruteforce(
    board: Board,
    depth: int,
    is_maximizing: bool,
    counter: Dict[str, int],
    maximizing_player_id: int,
) -> int:
    counter["nodes"] += 1

    if board.winner is not None and board.winner != 0:
        return 1 if board.winner == maximizing_player_id else -1

    if is_maximizing:
        best_score = -math.inf
        for move in board.get_available_moves():
            prev_state = (board.turn, board.winner, board.game_over, board.win_info)

            board.make_move(move[0], move[1])

            score = minimax_bruteforce(board, depth + 1, False, counter, maximizing_player_id)

            board.undo_move(move[0], move[1], *prev_state)

            best_score = max(score, best_score)
        return best_score
    else:
        best_score = math.inf
        for move in board.get_available_moves():
            prev_state = (board.turn, board.winner, board.game_over, board.win_info)

            board.make_move(move[0], move[1])

            score = minimax_bruteforce(board, depth + 1, True, counter, maximizing_player_id)

            board.undo_move(move[0], move[1], *prev_state)

            best_score = min(score, best_score)
        return best_score

"""






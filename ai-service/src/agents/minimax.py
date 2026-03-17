import random

from src.core.interfaces import Agent, IGameEngine, Move


class MinimaxAgent(Agent):
    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)



    def _calculate_move(self, engine: IGameEngine) -> Move:

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

    if board.is_full():
        return 0

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






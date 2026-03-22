from src.agents.minimax_variants.alpha_beta_prune import MinimaxAlphaBeta
from src.agents.minimax_variants.vanilla import Minimax
from src.core.dtos import MinimaxOptimizations
from src.core.interfaces import Agent, EngineMinimax, ISearcher, Move

# used strategy pattern


class MinimaxAgent(Agent):
    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)
        self._optimizations = None
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

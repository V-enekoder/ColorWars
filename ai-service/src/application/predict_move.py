from src.core.dtos import PredictRequest
from src.core.enums import AgentStrategy
from src.core.factories import AgentFactory, EngineFactory
from src.core.interfaces import Agent, IGameEngine


def execute_prediction(request: PredictRequest):
    engine: IGameEngine = EngineFactory.get_from_request(request)
    strategy: AgentStrategy = request.agent_policy.strategy
    player_id: int = request.game_state.player_id

    agent: Agent = AgentFactory.get_agent(strategy, player_id)
    agent.set_configuration(request.agent_policy.optimizations)
    move = agent.select_move(engine)
    return move

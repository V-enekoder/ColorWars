from src.core.dtos import PredictRequest
from src.core.factories import AgentFactory, EngineFactory


def execute_prediction(request: PredictRequest):
    engine = EngineFactory.get_engine(request)

    agent = AgentFactory.get_agent(algorithm_id=request.agent_strategy, player_id=request.player_id)

    move = agent.select_move(engine)
    return move

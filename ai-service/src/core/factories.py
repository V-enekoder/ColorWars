from typing import Dict, Type

from src.agents.random_agent import RandomAgent
from src.core.dtos import PredictRequest
from src.core.enums import AgentStrategy, EngineType
from src.core.interfaces import Agent, IGameEngine
from src.engines.mock_engine import MockEngine


class EngineFactory:
    @staticmethod
    def get_engine(request: PredictRequest) -> IGameEngine:
        # Usar el Enum como llave es más seguro que usar "default"
        engines: Dict[EngineType, Type[IGameEngine]] = {
            EngineType.MOCK: MockEngine,
            # EngineType.REAL: RealEngine,
        }
        engine_class = engines.get(request.config.engine, MockEngine)
        return engine_class(request)


class AgentFactory:
    @staticmethod
    def get_agent(algorithm_id: AgentStrategy, player_id: int) -> Agent:
        agents_map = {
            AgentStrategy.RANDOM: (RandomAgent, "Bot Aleatorio"),
        }

        config = agents_map.get(algorithm_id)

        if not config:
            raise ValueError(f"Agente {algorithm_id} no soportado")

        agent_class, display_name = config

        return agent_class(player_id=player_id, name=display_name)

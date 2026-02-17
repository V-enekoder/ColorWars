from typing import Dict, Type

from src.agents.random_agent import RandomAgent
from src.core.dtos import PredictRequest
from src.core.enums import AgentStrategy, EngineType
from src.core.interfaces import Agent, IGameEngine
from src.core.types import GameConfig
from src.engines.mock_engine import MockEngine
from src.engines.python_naive import PythonNaive


class EngineFactory:
    _ENGINES: Dict[EngineType, Type[IGameEngine]] = {
        EngineType.MOCK: MockEngine,
        EngineType.PYTHON_NAIVE: PythonNaive,
    }

    @classmethod
    def create(cls, config: GameConfig) -> IGameEngine:
        engine_class = cls._ENGINES.get(config.engine_type)
        if not engine_class:
            raise ValueError(f"Motor {config.engine_type} no implementado")

        return engine_class(config)

    @classmethod
    def get_from_request(cls, request: PredictRequest) -> IGameEngine:
        """Crea un motor y lo sincroniza con el estado de una petición."""
        engine = cls.create(request.config)

        # Cargamos el estado del tablero
        engine.set_state(request)
        return engine


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

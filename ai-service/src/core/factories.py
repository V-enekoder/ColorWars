from typing import Dict, Type

from src.agents.random_agent import RandomAgent
from src.core.dtos import AgentPolicy, PredictRequest
from src.core.enums import AgentStrategy, EngineType
from src.core.interfaces import Agent, IGameEngine
from src.core.types import GameConfig
from src.engines.mock_engine import MockEngine
from src.engines.python_naive import PythonNaive


class EngineFactory:
    _ENGINES: dict[EngineType, type[IGameEngine]] = {
        EngineType.MOCK: MockEngine,
        EngineType.PYTHON_NAIVE: PythonNaive,
    }

    @classmethod
    def create(cls, policy: AgentPolicy, game_config: GameConfig) -> IGameEngine:
        engine_class = cls._ENGINES.get(policy.engine)
        if not engine_class:
            raise ValueError(f"Motor {policy.engine} no implementado")

        return engine_class(game_config)

    @classmethod
    def get_from_request(cls, request: PredictRequest) -> IGameEngine:
        """Crea un motor y lo sincroniza con el estado de una petición."""
        engine: IGameEngine = cls.create(request.agent_policy, request.game_config)

        # Cargamos el estado del tablero
        engine.set_state(request.game_state)
        return engine


class AgentFactory:
    @staticmethod
    def get_agent(strategy: AgentStrategy, player_id: int) -> Agent:
        agents_map = {
            AgentStrategy.RANDOM: (RandomAgent, "Bot Aleatorio"),
        }

        config = agents_map.get(strategy)

        if not config:
            raise ValueError(f"Agente {strategy} no soportado")

        agent_class, display_name = config

        return agent_class(player_id=player_id, name=display_name)

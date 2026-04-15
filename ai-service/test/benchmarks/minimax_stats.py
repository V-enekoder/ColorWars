import math
import time
from dataclasses import dataclass
from typing import List

from src.agents.minimax_variants.vanilla import Minimax
from src.core.dtos import GameConfig
from src.core.enums import GameStatus, RuleOptions
from src.engines.python_naive import PythonNaive
from test.benchmarks.SearchStats import SearchStats  # Asegúrate de que el path sea correcto


def run_benchmark():
    # CONFIGURACIÓN DEL EXPERIMENTO
    TIME_BUDGETS = [1.0, 2.0, 3.0]
    GAMES_PER_BUDGET = 4
    MAX_TURNS = 50

    config = GameConfig(rows=8, cols=8, critical_points=4, num_players=2, rules=RuleOptions.ONLY_OWN_ORB)

    print(f"🚀 Iniciando Benchmark: {GAMES_PER_BUDGET} partidas de {MAX_TURNS} turnos.")
    print("-" * 60)

    for budget in TIME_BUDGETS:
        total_nodes = 0
        total_time = 0.0
        moves_count = 0
        total_depth = 0

        print(f"\n📊 Evaluando Presupuesto: {budget}s por movimiento...")

        for game_idx in range(GAMES_PER_BUDGET):
            engine = PythonNaive(config=config)
            searcher = Minimax()

            for turn_idx in range(MAX_TURNS):
                if engine.game_result.status != GameStatus.PLAYING:
                    break

                # Crear objeto de estadísticas para este movimiento
                stats = SearchStats()

                # Ejecutar búsqueda
                searcher.search(engine, time_limit=budget, stats=stats)

                # Acumular resultados
                total_nodes += stats.nodes_visited
                total_time += stats.end_time - stats.start_time
                total_depth += stats.max_depth_reached
                moves_count += 1

                legal_moves = engine.get_legal_moves(engine.current_player_id)
                if legal_moves:
                    engine.apply_move(legal_moves[0].row * 5 + legal_moves[0].col)

            print(f"  > Partida {game_idx + 1}/{GAMES_PER_BUDGET} completada.")

        avg_nodes_per_move = total_nodes / moves_count if moves_count > 0 else 0
        avg_nps = total_nodes / total_time if total_time > 0 else 0
        avg_depth = total_depth / moves_count if moves_count > 0 else 0

        print(f"\n✅ RESULTADOS PARA {budget}s:")
        print(f"   - Total de movimientos analizados: {moves_count}")
        print(f"   - Promedio de Profundidad alcanzada: {avg_depth:.2f}")
        print(f"   - Promedio de Nodos visitados: {avg_nodes_per_move:,.2f}")
        print(f"   - Promedio de NPS (Nodos por segundo): {avg_nps:,.2f}")
        print("-" * 70)


if __name__ == "__main__":
    run_benchmark()

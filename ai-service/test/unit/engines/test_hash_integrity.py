import random

import pytest

from src.core.enums import RuleOptions
from src.core.types import GameConfig
from src.engines.python_naive import PythonNaive


def test_hash_integrity():
    # 1. Configuración
    print("\n🚀 Iniciando Test de Integridad de Hash (Zobrist)...")
    config = GameConfig(rows=8, cols=8, critical_points=4, num_players=2, rules=RuleOptions.ONLY_OWN_ORB)
    engine = PythonNaive(config)

    initial_hash = engine.current_hash
    print(f"Hash inicial: {hex(initial_hash)}")

    history: list[int] = []

    # 2. Ejecutar 100 movimientos
    for _ in range(1000):
        moves = engine.get_legal_moves(engine.current_player_id)
        if not moves:
            break

        move = random.choice(moves)
        idx = engine._get_index(move.row, move.col)
        history.append(idx)

        # Ejecutar jugada
        engine.apply_move(idx)

    print(f"✅ Se completaron {len(history)} movimientos aleatorios.")

    # 3. Deshacer
    print(f"⏪ Deshaciendo {len(history)} movimientos...")
    for _ in range(len(history)):
        engine.undo_last_move()

    # 4. Verificación
    final_hash = engine.current_hash
    print(f"Hash final:   {hex(final_hash)}")

    assert final_hash == initial_hash, f"❌ Fallo: {hex(final_hash)} != {hex(initial_hash)}"
    print("✨ TEST PASADO: El hash final coincide perfectamente con el inicial.")

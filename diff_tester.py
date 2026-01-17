import json
import random
import subprocess
import sys

# CONFIGURACIÓN
CMD_PYTHON = ["make", "-C", "ai-service", "-s", "bridge"]
CMD_DENO = ["deno", "run", "--allow-all", "web-service/bridge_deno.ts"]


class EngineProcess:
    def __init__(self, name, command):
        self.name = name
        self.process = subprocess.Popen(
            command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )

    def send(self, action):
        line = json.dumps(action) + "\n"
        self.process.stdin.write(line)
        self.process.stdin.flush()

        while True:
            response = self.process.stdout.readline().strip()
            if not response:
                err = self.process.stderr.read()
                raise Exception(f"❌ El motor {self.name} murió.\nError: {err}")

            if response.startswith("{"):
                try:
                    data = json.loads(response)
                    # --- ESTA ES LA PARTE CLAVE PARA DEBUGEAR ---
                    if "error" in data:
                        print(f"\n❌ ERROR CRÍTICO EN {self.name}:")
                        print(f"Mensaje: {data['error']}")
                        # Intentamos leer el stderr por si hay un traceback de Python
                        sys.exit(1)
                    return data
                except json.JSONDecodeError:
                    continue
            else:
                continue

    def terminate(self):
        if self.process:
            self.process.terminate()
            self.process.wait()


def compare_states(step, py_state, ts_state):
    """Compara profundamente los dos estados."""
    if py_state == ts_state:
        return True, ""

    # Si hay error, mostramos qué llaves tiene cada uno para debuguear
    diff = [
        f"Llaves en Py: {list(py_state.keys())}",
        f"Llaves en TS: {list(ts_state.keys())}",
    ]

    # Comparamos valores específicos
    for key in ["currentPlayerIndex", "roundNumber", "winner", "currentPlayerId"]:
        py_val = py_state.get(key)
        ts_val = ts_state.get(key)
        if py_val != ts_val:
            diff.append(f"{key}: Py={py_val} vs TS={ts_val}")

    return False, "\n".join(diff)


def run_random_test(test_id, config):
    print(f"\n🚀 Iniciando Test #{test_id}: {config['rows']}x{config['cols']}...")

    py = EngineProcess("Python", CMD_PYTHON)
    ts = EngineProcess("Deno", CMD_DENO)

    try:
        # 1. Inicializar ambos
        init_cmd = {"action": "init", **config}
        py_state = py.send(init_cmd)
        ts_state = ts.send(init_cmd)

        moves_count = 0
        while py_state["winner"] == 0:
            # 2. Obtener jugador actual y elegir jugada aleatoria
            # Nota: En este nivel elegimos una celda al azar.
            # Si el motor dice que es ilegal, el test simplemente sigue intentando.
            idx = random.randint(0, (config["rows"] * config["cols"]) - 1)
            player = (
                py_state["currentPlayerId"]
                if "currentPlayerId" in py_state
                else ts_state.get("currentPlayerId")
            )  # Manejo de id si lo añades

            play_cmd = {"action": "play", "index": idx, "player": player}

            # 3. Ejecutar en ambos
            py_state = py.send(play_cmd)
            ts_state = ts.send(play_cmd)

            moves_count += 1

            # 4. Comparar
            success, report = compare_states(moves_count, py_state, ts_state)
            if not success:
                print(f"❌ DISCREPANCIA en jugada {moves_count} (Índice {idx}):")
                print(report)
                # Guardamos el histórico para debug
                with open("error_report.json", "w") as f:
                    json.dump(
                        {"last_move": play_cmd, "python": py_state, "ts": ts_state},
                        f,
                        indent=2,
                    )
                return False

            if moves_count > 1000:  # Failsafe
                print("⚠️ Demasiadas jugadas, posible bucle infinito.")
                break

        print(
            f"✅ Test #{test_id} completado con éxito ({moves_count} jugadas). Ganador: {py_state['winner']}"
        )
        return True

    finally:
        py.terminate()
        ts.terminate()


if __name__ == "__main__":
    # Configuraciones de prueba
    configs = [
        {
            "rows": 3,
            "cols": 3,
            "criticalPoints": 2,
            "numPlayers": 2,
            "rules": "EmptyAndOwnOrbs",
        },
        {
            "rows": 5,
            "cols": 5,
            "criticalPoints": 3,
            "numPlayers": 3,
            "rules": "OnlyOwnOrbs",
        },
        {
            "rows": 8,
            "cols": 8,
            "criticalPoints": 4,
            "numPlayers": 4,
            "rules": "EmptyAndOwnOrbs",
        },
    ]

    for i, cfg in enumerate(configs):
        if not run_random_test(i + 1, cfg):
            sys.exit(1)

    print("\n🌟 ¡Todos los motores son idénticos!")

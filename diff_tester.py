import json
import random
import subprocess
import sys
import time
from functools import wraps


def time_it(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"[Timer] {func.__name__}: {end - start:.6f}s")
        return result

    return wrapper


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
                    if "error" in data:
                        print(f"\n❌ ERROR CRÍTICO EN {self.name}:")
                        print(f"Mensaje: {data['error']}")
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

    diff = [
        f"Llaves en Py: {list(py_state.keys())}",
        f"Llaves en TS: {list(ts_state.keys())}",
    ]

    for key in ["currentPlayerIndex", "roundNumber", "winner", "currentPlayerId"]:
        py_val = py_state.get(key)
        ts_val = ts_state.get(key)
        if py_val != ts_val:
            diff.append(f"{key}: Py={py_val} vs TS={ts_val}")

    return False, "\n".join(diff)


@time_it
def run_random_test(test_id, config):
    print(f"\n🚀 Iniciando Test #{test_id}: {config['rows']}x{config['cols']}...")

    py = EngineProcess("Python", CMD_PYTHON)
    ts = EngineProcess("Deno", CMD_DENO)

    try:
        init_cmd = {"action": "init", **config}
        py_state = py.send(init_cmd)
        ts_state = ts.send(init_cmd)

        moves_count = 0
        while py_state["winner"] == 0:
            idx = random.randint(0, (config["rows"] * config["cols"]) - 1)
            player = (
                py_state["currentPlayerId"]
                if "currentPlayerId" in py_state
                else ts_state.get("currentPlayerId")
            )

            play_cmd = {"action": "play", "index": idx, "player": player}

            py_state = py.send(play_cmd)
            ts_state = ts.send(play_cmd)

            moves_count += 1

            success, report = compare_states(moves_count, py_state, ts_state)
            if not success:
                print(f"❌ DISCREPANCIA en jugada {moves_count} (Índice {idx}):")
                print(report)
                with open("error_report.json", "w") as f:
                    json.dump(
                        {"last_move": play_cmd, "python": py_state, "ts": ts_state},
                        f,
                        indent=2,
                    )
                return False

            if moves_count > 1000000:  # Failsafe
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
            "numPlayers": 8,
            "rules": "OnlyOwnOrbs",
        },
    ]

    for i, cfg in enumerate(configs):
        if not run_random_test(i + 1, cfg):
            sys.exit(1)

    print("\n🌟 ¡Todos los motores son idénticos!")

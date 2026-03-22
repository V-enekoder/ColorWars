import time
from dataclasses import dataclass


@dataclass
class SearchStats:
    nodes_visited: int = 0
    start_time: float = 0.0

    def increment_nodes(self):
        self.nodes_visited += 1

    def get_nps(self) -> float:
        elapsed = time.time() - self.start_time
        return self.nodes_visited / elapsed if elapsed > 0 else 0.0

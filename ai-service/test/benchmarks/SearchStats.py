from dataclasses import dataclass, field


@dataclass
class SearchStats:
    nodes_visited: int = 0
    start_time: float = 0.0
    end_time: float = 0.0

    max_depth_reached: int = 0

    cutoffs: int = 0

    nodes_per_depth: dict[int, int] = field(default_factory=dict)

    def increment_nodes(self, current_depth: int):
        self.nodes_visited += 1
        self.nodes_per_depth[current_depth] = self.nodes_per_depth.get(current_depth, 0) + 1

    def register_cutoff(self):
        self.cutoffs += 1

    def get_nps(self) -> float:
        elapsed = self.end_time - self.start_time
        return self.nodes_visited / elapsed if elapsed > 0 else 0.0

    def __str__(self):
        elapsed = self.end_time - self.start_time
        return (
            f"--- Search Statistics ---\n"
            f"Depth Reached: {self.max_depth_reached}\n"
            f"Nodes Visited: {self.nodes_visited}\n"
            f"Time: {elapsed:.3f}s\n"
            f"Nodes Per Second: {self.get_nps():.0f}\n"
            f"Cutoffs: {self.cutoffs}\n"
            f"Branching Factor (avg): {self._get_avg_branching():.2f}"
        )

    def _get_avg_branching(self) -> float:
        if self.max_depth_reached <= 1:
            return 0.0
        return self.nodes_visited ** (1 / self.max_depth_reached)

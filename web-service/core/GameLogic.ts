export interface CellData {
  points: number;
  player: number;
}

interface Player {
  id: number;
  active: boolean;
}

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export class GameEngine {
  rows: number;
  cols: number;
  critical_points: number;

  board: CellData[];
  players: Player[];
  currentPlayerIndex: number = 0;
  roundNumber: number = 1;
  winner: number = 0;
  cellsByPlayer: Map<number, number> = new Map<number, number>();
  private neighbors: number[][];

  constructor(
    rows: number,
    cols: number,
    critical_points: number,
    num_players: number,
  ) {
    this.rows = rows;
    this.cols = cols;
    this.critical_points = critical_points;

    this.players = Array.from({ length: num_players }, (_, i) => ({
      id: i + 1,
      active: true,
    }));

    this.board = Array.from({ length: rows * cols }, () => ({
      points: 0,
      player: 0,
    }));

    this.players.forEach((p) => this.cellsByPlayer.set(p.id, 0));

    this.neighbors = new Array(rows * cols);

    for (let i = 0; i < rows * cols; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const valid: number[] = [];
      for (const [dx, dy] of DIRECTIONS) {
        const nx = row + dx;
        const ny = col + dy;
        if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
          valid.push(nx * cols + ny);
        }
      }
      this.neighbors[i] = valid;
    }
  }

  getBoard(): CellData[] {
    return [...this.board];
  }

  getCellsByPlayer() {
    return [...this.cellsByPlayer]
      .filter(([id]) => id !== 0)
      .sort((a, b) => a[0] - b[0]);
  }

  getCurrentPlayerId(): number {
    return this.players[this.currentPlayerIndex].id;
  }

  getIndex(r: number, c: number): number {
    return r * this.cols + c;
  }

  getRoundNumber(): number {
    return this.roundNumber;
  }

  isValidCoord(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  *playGenerator(r: number, c: number): Generator<CellData[]> {
    if (this.winner !== 0) return;

    const currentPlayer = this.getCurrentPlayerId();
    const idx = this.getIndex(r, c);
    const cell = this.board[idx];

    const isValid =
      (cell.player === 0 && this.roundNumber === 1) ||
      cell.player === currentPlayer;

    if (!isValid) return;

    if (this.roundNumber === 1 && cell.player === 0) {
      const neighborIndices = this.neighbors[idx];

      for (const nIdx of neighborIndices) {
        const neighbor = this.board[nIdx];
        if (neighbor.player !== 0 && neighbor.player !== currentPlayer) {
          console.warn(
            "Movimiento inválido: No puedes jugar adyacente a un enemigo en el primer turno.",
          );
          return;
        }
      }
    }
    yield* this.addOrb(r, c, currentPlayer);

    if (this.roundNumber > 1) {
      this.checkEliminations();
    }

    this.nextTurn();
    yield this.getBoard();
  }

  private nextTurn() {
    if (this.winner !== 0) return;

    let attempts = 0;
    do {
      this.currentPlayerIndex++;

      if (this.currentPlayerIndex >= this.players.length) {
        this.currentPlayerIndex = 0;
        this.roundNumber++;
      }
      attempts++;
    } while (
      !this.players[this.currentPlayerIndex].active &&
      attempts < this.players.length * 2
    );
  }

  private checkEliminations() {
    let activeCount = 0;
    let lastActiveId = 0;

    for (const p of this.players) {
      const cellCount = this.cellsByPlayer.get(p.id) || 0;

      if (cellCount === 0 && p.active && this.roundNumber > 2) {
        p.active = false;
      }
      if (p.active) {
        activeCount++;
        lastActiveId = p.id;
      }
    }

    if (activeCount === 1) {
      this.winner = lastActiveId;
    }
  }

  private *addOrb(r: number, c: number, player: number): Generator<CellData[]> {
    if (!this.isValidCoord(r, c)) return;

    const idx = this.getIndex(r, c);
    const cell = this.board[idx];

    if (cell.player !== player) {
      this.setCellOwner(cell, player);
    }

    const pointsToAdd = this.roundNumber === 1 ? this.critical_points - 1 : 1;
    cell.points += pointsToAdd;

    const q: number[] = [];

    if (cell.points >= this.critical_points) {
      cell.points -= this.critical_points;
      if (cell.points === 0) {
        this.setCellOwner(cell, 0);
      }
      q.push(idx);
    }

    yield this.getBoard();

    while (q.length > 0) {
      const currIdx = q.shift();
      if (currIdx === undefined) continue;

      const currentNeighbors = this.neighbors[currIdx];

      for (const nIdx of currentNeighbors) {
        const neighbor = this.board[nIdx];

        if (neighbor.player !== player) this.setCellOwner(neighbor, player);

        neighbor.points += 1;

        if (neighbor.points >= this.critical_points) {
          neighbor.points -= this.critical_points;
          if (neighbor.points === 0) this.setCellOwner(neighbor, 0);
          q.push(nIdx);
        }
      }
      yield this.getBoard();
    }
  }

  private updateCellCount(playerId: number, change: number) {
    const current = this.cellsByPlayer.get(playerId) || 0;
    this.cellsByPlayer.set(playerId, current + change);
  }

  private setCellOwner(cell: CellData, newPlayer: number) {
    const oldPlayer = cell.player;

    if (oldPlayer === newPlayer) return;

    cell.player = newPlayer;

    if (oldPlayer !== 0) {
      this.updateCellCount(oldPlayer, -1);
    }
    if (newPlayer !== 0) {
      this.updateCellCount(newPlayer, 1);
    }
  }
}

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
  }

  getBoard(): CellData[] {
    return [...this.board];
  }

  getCurrentPlayerId(): number {
    return this.players[this.currentPlayerIndex].id;
  }

  getIndex(r: number, c: number): number {
    return r * this.cols + c;
  }

  isValidCoord(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  play(r: number, c: number): boolean {
    if (this.winner !== 0) return false;

    const currentPlayer = this.getCurrentPlayerId();

    const idx = this.getIndex(r, c);
    const cell = this.board[idx];

    const isValid =
      (cell.player === 0 && this.roundNumber === 1) ||
      cell.player === currentPlayer;
    if (!isValid) return false;

    this.addOrb(r, c, currentPlayer);

    if (this.roundNumber > 1) {
      this.checkEliminations();
    }

    this.nextTurn();

    return true;
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
    const counts = new Map<number, number>();
    this.players.forEach((p) => counts.set(p.id, 0));

    for (const cell of this.board) {
      if (cell.player !== 0) {
        counts.set(cell.player, (counts.get(cell.player) || 0) + 1);
      }
    }

    let activeCount = 0;
    let lastActiveId = 0;

    for (const p of this.players) {
      const cellCount = counts.get(p.id) || 0;
      if (cellCount === 0 && p.active) {
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

  private addOrb(r: number, c: number, player: number) {
    if (!this.isValidCoord(r, c)) return;

    const idx = this.getIndex(r, c);
    const cell = this.board[idx];

    const pointsToAdd = this.roundNumber === 1 ? this.critical_points - 1 : 1;

    cell.player = player;
    cell.points += pointsToAdd;

    const q: number[][] = [];

    if (cell.points >= this.critical_points) {
      cell.points -= this.critical_points;
      cell.player = 0;
      q.push([r, c]);
    }

    while (q.length > 0) {
      const item = q.shift();
      if (!item) continue;
      const [cx, cy] = item;

      for (const [dx, dy] of DIRECTIONS) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (!this.isValidCoord(nx, ny)) continue;

        const nIdx = this.getIndex(nx, ny);
        const neighbor = this.board[nIdx];

        neighbor.player = player;
        neighbor.points += 1;

        if (neighbor.points >= this.critical_points) {
          neighbor.points -= this.critical_points;
          if (neighbor.points === 0) neighbor.player = 0;
          q.push([nx, ny]);
        }
      }
    }
  }
}

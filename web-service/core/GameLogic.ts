import { RulesOptions } from "../utils/types";

export interface CellData {
  points: number;
  player: number;
}

interface Player {
  id: number;
  active: boolean;
}

type Direction = readonly [number, number];

type DirectionList = readonly Direction[];

const CARDINALS: DirectionList = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

const DIAGONALS: DirectionList = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

const ALL_DIRECTIONS: DirectionList = [...CARDINALS, ...DIAGONALS];

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
  private fullAdjacencies: number[][];
  private playRule: RulesOptions;

  constructor(
    rows: number,
    cols: number,
    critical_points: number,
    num_players: number,
    playRule: RulesOptions,
  ) {
    this.rows = rows;
    this.cols = cols;
    this.critical_points = critical_points;
    this.playRule = playRule;

    this.players = Array.from({ length: num_players }, (_, i) => ({
      id: i + 1,
      active: true,
    }));

    this.board = Array.from({ length: rows * cols }, () => ({
      points: 0,
      player: 0,
    }));

    this.players.forEach((p) => this.cellsByPlayer.set(p.id, 0));

    this.neighbors = this.calculateNeighbors(CARDINALS);
    this.fullAdjacencies = this.calculateNeighbors(ALL_DIRECTIONS);
  }

  private calculateNeighbors(list: DirectionList): number[][] {
    const neighbors: number[][] = new Array(this.rows * this.cols);

    for (let i = 0; i < this.rows * this.cols; i++) {
      const row = Math.floor(i / this.cols);
      const col = i % this.cols;
      const valid: number[] = [];
      for (const [dx, dy] of list) {
        const nx = row + dx;
        const ny = col + dy;
        if (this.isValidCoord(nx, ny)) {
          valid.push(this.getIndex(nx, ny));
        }
      }
      neighbors[i] = valid;
    }
    return neighbors;
  }

  private isValidCoord(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  getIndex(r: number, c: number): number {
    return r * this.cols + c;
  }

  *playGenerator(r: number, c: number): Generator<CellData[]> {
    if (this.winner !== 0) return;

    const currentPlayer = this.getCurrentPlayerId();
    const idx = this.getIndex(r, c);

    if (!this.isLegalMove(idx, currentPlayer)) return;

    yield* this.addOrb(idx, currentPlayer);

    if (this.roundNumber > 1) {
      this.checkEliminations();
    }

    this.nextTurn();
    yield this.getBoard();
  }

  getCurrentPlayerId(): number {
    return this.players[this.currentPlayerIndex].id;
  }

  private isLegalMove(idx: number, currentPlayerId: number): boolean {
    const cell = this.board[idx];
    let passRule = false;

    switch (this.playRule) {
      case RulesOptions.OnlyOwnOrbs:
        passRule =
          (cell.player === 0 && this.roundNumber === 1) ||
          cell.player === currentPlayerId;
        break;

      case RulesOptions.EmptyAndOwnOrbs:
        passRule = cell.player === 0 || cell.player === currentPlayerId;
        break;

      default:
        passRule = false;
    }

    if (passRule && this.roundNumber === 1 && cell.player === 0) {
      const neighborIndices = this.fullAdjacencies[idx];

      for (const nIdx of neighborIndices) {
        const neighbor = this.board[nIdx];
        if (neighbor.player !== 0 && neighbor.player !== currentPlayerId) {
          console.warn(
            "No puedes jugar adyacente a un enemigo en el primer turno.",
          );
          passRule = false;
          break;
        }
      }
    }

    return passRule;
  }

  private *addOrb(idx: number, player: number): Generator<CellData[]> {
    const cell = this.board[idx];

    this.setCellOwner(cell, player);

    cell.points += this.getPointsToAdd();

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
      this.checkEliminations();
      if (this.winner !== 0) break;
      yield this.getBoard();
    }
  }

  private getPointsToAdd(): number {
    const isFirstRound = this.roundNumber === 1;

    switch (this.playRule) {
      case RulesOptions.OnlyOwnOrbs:
        return isFirstRound ? this.critical_points - 1 : 1;
      default:
        return 1;
    }
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

  getBoard(): CellData[] {
    return [...this.board];
  }

  getCellsByPlayer() {
    return [...this.cellsByPlayer]
      .filter(([id]) => id !== 0)
      .sort((a, b) => a[0] - b[0]);
  }

  getRoundNumber(): number {
    return this.roundNumber;
  }

  private updateCellCount(playerId: number, change: number) {
    const current = this.cellsByPlayer.get(playerId) || 0;
    this.cellsByPlayer.set(playerId, current + change);
  }
}

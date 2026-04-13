import {
  CellData,
  DirectionList,
  GameResult,
  GameState,
  RulesOptions,
  Turn,
} from "../utils/types.ts";

import { Stack } from "../utils/stack.ts";

interface Player {
  id: number;
  active: boolean;
}

export interface Move {
  row: number;
  col: number;
}
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
  board: CellData[];
  players: Player[];
  currentPlayerIndex: number = 0;
  roundNumber: number = 1;
  cellsByPlayer: Map<number, number> = new Map<number, number>();
  private totalCells: number;
  private neighbors: number[][];
  private fullAdjacencies: number[][];
  private zobristTable: bigint[][][]; // [cell][points][player]
  private turnRandoms: bigint[]; // [actual_player]
  private currentHash: bigint;
  private _gameResult: GameResult;
  private repetitionTable: Map<bigint, number>;
  private turnsWithoutCaptures: number;

  private readonly MAX_REPETITIONS = 3;
  private readonly MAX_TURNS_WITHOUT_CAPTURES;
  private activePlayerIds: number[] = [];
  private history: Stack<Turn>;
  private currentTurn: Turn | null;
  constructor(
    public readonly rows: number,
    public readonly cols: number,
    public readonly critical_points: number,
    numPlayers: number,
    public readonly playRule: RulesOptions,
  ) {
    this.rows = rows;
    this.cols = cols;
    this.critical_points = critical_points;
    this.playRule = playRule;
    this.turnsWithoutCaptures = 0;
    this.players = Array.from({ length: numPlayers }, (_, i) => ({
      id: i + 1,
      active: true,
    }));

    this.activePlayerIds = this.players.map((p) => p.id);
    this.MAX_TURNS_WITHOUT_CAPTURES = 25 * numPlayers;
    this.board = Array.from({ length: rows * cols }, () => ({
      points: 0,
      player: 0,
    }));
    this.totalCells = this.rows * this.cols;
    this.players.forEach((p) => this.cellsByPlayer.set(p.id, 0));

    this.neighbors = this.calculateNeighbors(CARDINALS);
    this.fullAdjacencies = this.calculateNeighbors(ALL_DIRECTIONS);
    this.repetitionTable = new Map<bigint, number>();

    this.zobristTable = this.initZobristTable();
    this.turnRandoms = this.initTurnHash();
    this.currentHash = this.initZobristhHash();
    this._gameResult = { status: GameState.Playing, winnerId: null };
    this.history = new Stack<Turn>();
    this.currentTurn = null;
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
  private initZobristTable(): bigint[][][] {
    const numStates = this.critical_points + 1;
    const numPlayers = this.getNumPlayers() + 1; //Add empty player
    const zobristTable: bigint[][][] = [];
    for (let i = 0; i < this.totalCells; i++) {
      zobristTable[i] = [];

      for (let p = 0; p < numStates; p++) {
        zobristTable[i][p] = [];
        for (let j = 0; j < numPlayers; j++) {
          zobristTable[i][p][j] = this.getRandom64();
        }
      }
    }
    return zobristTable;
  }

  getNumPlayers(): number {
    return this.players.length;
  }

  private getRandom64(): bigint {
    const buffer = new BigUint64Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0];
  }

  private initTurnHash(): bigint[] {
    const numTurnPlayers = this.getNumPlayers() + 1;
    const turnRandoms = [];
    for (let j = 0; j < numTurnPlayers; j++) {
      turnRandoms[j] = this.getRandom64();
    }
    return turnRandoms;
  }

  private initZobristhHash(): bigint {
    let initialHash = 0n;
    for (let i = 0; i < this.totalCells; i++) {
      initialHash ^= this.zobristTable[i][0][0];
    }

    initialHash ^= this.turnRandoms[this.currentPlayerId];
    return initialHash;
  }

  private getZobristHash(): bigint {
    let hash = 0n;
    for (let i = 0; i < this.totalCells; i++) {
      hash ^= this.getHashForCell(
        i,
        this.board[i].points,
        this.board[i].player,
      );
    }

    hash ^= this.turnRandoms[this.currentPlayerId];
    this.registerPosition(hash);
    return hash;
  }

  private getHashForCell(idx: number, points: number, player: number): bigint {
    return this.zobristTable[idx][points][player];
  }

  private registerPosition(key: bigint): void {
    const count = this.repetitionTable.get(key) ?? 0;
    this.repetitionTable.set(key, count + 1);
  }

  private unregisterPosition(key: bigint): void {
    const count = this.repetitionTable.get(key);

    if (!count) return;

    if (count === 1) {
      this.repetitionTable.delete(key);
    } else {
      this.repetitionTable.set(key, count - 1);
    }
  }

  private getIndex(r: number, c: number): number {
    return r * this.cols + c;
  }

  get gameResult(): GameResult {
    return this._gameResult;
  }

  set gameResult(result: GameResult) {
    this._gameResult = result;
  }

  undoLastMove(): void {
    const lastTurn: Turn | undefined = this.history.pop();
    if (!lastTurn) {
      return;
    }

    this.currentPlayerIndex = lastTurn.initialPlayerId;
    this.activePlayerIds = [...lastTurn.activePlayers];
    this.gameResult = { ...lastTurn.gameResult };
    this.roundNumber = lastTurn.roundNumber;

    for (const [idx, data] of lastTurn.cellChanges) {
      const cell = this.board[idx];
      if (cell) {
        this.setCellOwner(cell, data.player);
        cell.points = data.points;
      }
    }

    this.unregisterPosition(lastTurn.turnHash);

    const previousTurn: Turn | undefined = this.history.peek();
    this.currentHash = previousTurn ? previousTurn.turnHash : 0n;
  }

  private initCurrentTurn(): Turn {
    return {
      initialPlayerId: this.currentPlayerIndex,
      activePlayers: [...this.activePlayerIds],
      cellChanges: new Map<number, CellData>(),
      gameResult: { ...this._gameResult },
      roundNumber: this.roundNumber,
      turnHash: 0n,
    };
  }

  private addCellChange(idx: number, player: number, points: number) {
    if (!this.currentTurn!.cellChanges.has(idx)) {
      this.currentTurn!.cellChanges.set(idx, {
        player: player,
        points: points,
      });
    }
  }

  private printRepetitionTable(): void {
    console.log("--- Repetition Table ---");
    if (this.repetitionTable.size === 0) {
      console.log("Table is empty.");
      return;
    }

    this.repetitionTable.forEach((count, hash) => {
      // Convertimos el bigint a hexadecimal para que sea más legible
      const hexHash = `0x${hash.toString(16).padStart(16, "0")}`;
      console.log(`${hexHash} => Count: ${count}`);
    });
    console.log("-------------------------");
  }

  private printHexHash(hash: bigint): void {
    const hex = `0x${hash.toString(16).padStart(16, "0")}`;
    console.log(hex);
  }

  *playGenerator(index: number): Generator<CellData[]> {
    if (this._gameResult.status !== GameState.Playing) {
      return;
    }

    const currentPlayer = this.currentPlayerId;

    if (!this.isLegalMove(index, currentPlayer)) return;

    this.currentHash ^= this.turnRandoms[this.currentPlayerId];

    this.currentTurn = this.initCurrentTurn();

    const prev = this.turnsWithoutCaptures;
    yield* this.addOrb(index, currentPlayer);
    if (this.turnsWithoutCaptures === prev) {
      this.turnsWithoutCaptures += 1;
    }

    if (this.roundNumber > 1) {
      this.checkEliminations();
    }

    this.advanceTurn();
    this.currentHash ^= this.turnRandoms[this.currentPlayerId];

    this.registerPosition(this.currentHash);
    this.currentTurn.turnHash = this.currentHash;

    if (this.isDraw(this.currentHash)) {
      this._gameResult = { status: GameState.Draw, winnerId: null };
    }

    this.history.push(this.currentTurn);
    this.currentTurn = null;
    //this.printRepetitionTable();
    yield this.getBoard();
  }

  get currentPlayerId(): number {
    return this.players[this.currentPlayerIndex].id;
  }

  private isLegalMove(idx: number, currentPlayerId: number): boolean {
    const cell = this.board[idx];

    if (cell.player !== 0 && cell.player !== currentPlayerId) {
      return false;
    }

    let canPlayOnEmpty = false;
    const canPlayOnOwned = true;

    switch (this.playRule) {
      case RulesOptions.OnlyOwnOrbs:
        if (this.roundNumber === 1) canPlayOnEmpty = true;
        break;
      case RulesOptions.EmptyAndOwnOrbs:
        canPlayOnEmpty = true;
        break;
      default:
        return false;
    }

    const isEmpty = cell.player === 0;
    const isOwned = cell.player === currentPlayerId;

    if ((isEmpty && !canPlayOnEmpty) || (isOwned && !canPlayOnOwned)) {
      return false;
    }

    if (this.roundNumber === 1 && isEmpty) {
      const neighborIndices = this.fullAdjacencies[idx];

      for (const nIdx of neighborIndices) {
        const neighbor = this.board[nIdx];
        if (neighbor.player !== 0 && neighbor.player !== currentPlayerId) {
          return false;
        }
      }
    }

    return true;
  }

  private *addOrb(idx: number, player: number): Generator<CellData[]> {
    const cell = this.board[idx];

    this.updateCellHash(idx, cell.points, cell.player);

    this.addCellChange(idx, cell.player, cell.points);

    this.setCellOwner(cell, player);
    cell.points += this.getPointsToAdd();

    this.updateCellHash(idx, cell.points, cell.player);

    const q: number[] = [];

    if (cell.points >= this.critical_points) {
      this.updateCellHash(idx, cell.points, cell.player);

      cell.points = 0;
      this.setCellOwner(cell, 0);

      this.updateCellHash(idx, cell.points, cell.player);
      q.push(idx);
    }

    yield this.getBoard();

    while (q.length > 0) {
      const currIdx = q.shift()!;
      const currentNeighbors = this.neighbors[currIdx];

      for (const nIdx of currentNeighbors) {
        const neighbor = this.board[nIdx];

        this.updateCellHash(nIdx, neighbor.points, neighbor.player);

        this.addCellChange(nIdx, neighbor.player, neighbor.points);

        if (neighbor.player !== player) {
          this.setCellOwner(neighbor, player);
        }
        neighbor.points += 1;

        if (neighbor.points >= this.critical_points) {
          neighbor.points = 0;
          this.setCellOwner(neighbor, 0);
          q.push(nIdx);
        }

        this.updateCellHash(nIdx, neighbor.points, neighbor.player);
      }
      this.checkEliminations();
      if (this._gameResult.status !== GameState.Playing) break;

      yield this.getBoard();
    }
  }

  private updateCellHash(idx: number, points: number, player: number): void {
    this.currentHash ^= this.getHashForCell(idx, points, player);
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
      this.turnsWithoutCaptures = 0;
    }
    if (newPlayer !== 0) {
      this.updateCellCount(newPlayer, 1);
    }
  }

  private updateCellCount(playerId: number, change: number) {
    const current = this.cellsByPlayer.get(playerId) || 0;
    this.cellsByPlayer.set(playerId, current + change);
  }

  private checkEliminations(): void {
    for (const p of this.players) {
      if (
        p.active &&
        this.roundNumber > 2 &&
        (this.cellsByPlayer.get(p.id) || 0) === 0
      ) {
        p.active = false;
      }
    }

    this.activePlayerIds = this.players
      .filter((p) => p.active)
      .map((p) => p.id);

    if (this.activePlayerIds.length === 1) {
      this._gameResult.status = GameState.Win;
      this._gameResult.winnerId = this.activePlayerIds[0];
    }
  }

  private advanceTurn(): void {
    if (this._gameResult.status !== GameState.Playing) return;

    const currentId = this.players[this.currentPlayerIndex].id;
    const activeIdx = this.activePlayerIds.indexOf(currentId);

    const nextActiveIdx = (activeIdx + 1) % this.activePlayerIds.length;
    const nextPlayerId = this.activePlayerIds[nextActiveIdx];

    if (nextPlayerId < currentId) {
      this.roundNumber++;
    }

    this.currentPlayerIndex = this.players.findIndex(
      (p) => p.id === nextPlayerId,
    );
  }

  private isDraw(key: bigint): boolean {
    const count = this.repetitionTable.get(key) || 0;
    if (count >= this.MAX_REPETITIONS) {
      return true;
    }
    if (this.turnsWithoutCaptures >= this.MAX_TURNS_WITHOUT_CAPTURES) {
      return true;
    }
    return false;
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

  getLegalMoves(playerId: number): Move[] {
    const moves: Move[] = [];

    for (let i = 0; i < this.board.length; i++) {
      if (this.isLegalMove(i, playerId)) {
        moves.push(this.getCoordinates(i));
      }
    }

    return moves;
  }

  getCoordinates(index: number): Move {
    return {
      row: Math.floor(index / this.cols),
      col: index % this.cols,
    };
  }
}

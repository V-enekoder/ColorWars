import { GameState } from "@/utils/enums.ts";
import { Stack } from "../utils/stack.ts";
import { RulesOptions } from "@/utils/types.ts";
import { CellData, GameResult, Turn } from "@/utils/types/game.ts";
import { DirectionList } from "@/utils/types/math.ts";

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
  // ==========================================
  // 1. STATE & PROPERTIES
  // ==========================================

  private board: CellData[];
  private _currentPlayerId: number;
  private _roundNumber: number = 1;
  private cellsByPlayer: Map<number, number> = new Map<number, number>();
  private totalCells: number;
  private neighbors: number[][];
  private fullAdjacencies: number[][];
  private zobristTable: bigint[][][]; // [cell][points][player]
  private turnRandoms: bigint[]; // [actual_player]
  private _currentHash: bigint;
  private _gameResult: GameResult;
  private repetitionTable: Map<bigint, number>;
  private turnsWithoutCaptures: number;

  private readonly MAX_REPETITIONS = 3;
  private readonly MAX_TURNS_WITHOUT_CAPTURES;
  private readonly EMPTY_PLAYER = 0;
  private activePlayerIds: number[] = [];
  private history: Stack<Turn>;
  private currentTurn: Turn | null;

  // ==========================================
  // 2. CONSTRUCTOR & INITIALIZATION
  // ==========================================

  constructor(
    private readonly _rows: number,
    private readonly _cols: number,
    private readonly _critical_points: number,
    private readonly totalPlayers: number,
    private readonly _playRule: RulesOptions,
  ) {
    this.turnsWithoutCaptures = 0;

    this.activePlayerIds = Array.from(
      { length: totalPlayers },
      (_, i) => i + 1,
    );

    this._currentPlayerId = 1;
    this.MAX_TURNS_WITHOUT_CAPTURES = 25 * totalPlayers;
    this.board = Array.from({ length: _rows * _cols }, () => ({
      points: 0,
      player: 0,
    }));
    this.totalCells = this.rows * this.cols;
    for (let i = 1; i <= totalPlayers; i++) {
      this.cellsByPlayer.set(i, 0);
    }

    this.neighbors = this.calculateNeighbors(CARDINALS);
    this.fullAdjacencies = this.calculateNeighbors(ALL_DIRECTIONS);
    this.repetitionTable = new Map<bigint, number>();

    this.zobristTable = this.initZobristTable();
    this.turnRandoms = this.initTurnHash();
    this._currentHash = this.initZobristHash();
    this._gameResult = { status: GameState.Playing, winnerId: null };
    this.history = new Stack<Turn>();
    this.currentTurn = null;
  }
  private initZobristTable(): bigint[][][] {
    const numStates = this.critical_points + 1;
    const numPlayers = this.numPlayers + 1; //Add empty player
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

  private initTurnHash(): bigint[] {
    const numTurnPlayers = this.numPlayers + 1;
    const turnRandoms: bigint[] = [];
    for (let j = 0; j < numTurnPlayers; j++) {
      turnRandoms[j] = this.getRandom64();
    }
    return turnRandoms;
  }

  private initZobristHash(): bigint {
    let initialHash = 0n;
    for (let i = 0; i < this.totalCells; i++) {
      initialHash ^= this.zobristTable[i][0][0];
    }

    initialHash ^= this.turnRandoms[this.currentPlayerId];
    return initialHash;
  }

  private initCurrentTurn(): Turn {
    return {
      initialPlayerId: this.currentPlayerId,
      activePlayers: [...this.activePlayerIds],
      cellChanges: new Map<number, CellData>(),
      gameResult: { ...this._gameResult },
      roundNumber: this.roundNumber,
      turnHash: 0n,
    };
  }
  // ==========================================
  // 3. PUBLIC INTERFACE (API)
  // ==========================================
  // --- Getters ---

  get numPlayers(): number {
    return this.totalPlayers;
  }

  get gameResult(): GameResult {
    return this._gameResult;
  }

  set gameResult(result: GameResult) {
    this._gameResult = result;
  }

  get currentPlayerId(): number {
    return this._currentPlayerId;
  }

  get roundNumber(): number {
    return this._roundNumber;
  }

  get currentHash(): bigint {
    return this._currentHash;
  }

  get rows(): number {
    return this._rows;
  }
  get cols(): number {
    return this._cols;
  }
  get critical_points(): number {
    return this._critical_points;
  }
  get play_rule(): RulesOptions {
    return this._playRule;
  }
  // --- Game Actions ---
  public undoLastMove(): void {
    const lastTurn: Turn | undefined = this.history.pop();
    if (!lastTurn) {
      return;
    }

    this._currentPlayerId = lastTurn.initialPlayerId;
    this.activePlayerIds = [...lastTurn.activePlayers];
    this.gameResult = { ...lastTurn.gameResult };
    this._roundNumber = lastTurn.roundNumber;

    for (const [idx, data] of lastTurn.cellChanges) {
      const cell = this.board[idx];

      this.updateCellHash(idx, cell.points, cell.player);

      this.setCellOwner(cell, data.player);
      cell.points = data.points;

      this.updateCellHash(idx, cell.points, cell.player);
    }

    this.unregisterPosition(lastTurn.turnHash);

    const previousTurn: Turn | undefined = this.history.peek();
    this._currentHash = previousTurn
      ? previousTurn.turnHash
      : this.initZobristHash();
  }

  public *playGenerator(index: number): Generator<CellData[]> {
    if (this._gameResult.status !== GameState.Playing) {
      return;
    }

    const currentPlayer = this.currentPlayerId;

    if (!this.isLegalMove(index, currentPlayer)) return;

    this._currentHash ^= this.turnRandoms[this.currentPlayerId];

    this.currentTurn = this.initCurrentTurn();

    const prev = this.turnsWithoutCaptures;
    yield* this.addOrb(index, currentPlayer);
    if (this.turnsWithoutCaptures === prev) {
      this.turnsWithoutCaptures += 1;
    }

    if (this.roundNumber > 2) {
      this.checkEliminations();
    }
    this._gameResult = this.checkGameStatus();

    if (this._gameResult.status === GameState.Playing) {
      this.advanceTurn();
      this._currentHash ^= this.turnRandoms[this.currentPlayerId];
    }

    this.registerPosition(this._currentHash);
    this.currentTurn.turnHash = this._currentHash;

    this.history.push(this.currentTurn);
    this.currentTurn = null;
    yield this.board;
  }

  // --- Data Queries ---
  public getBoard(): CellData[] {
    return [...this.board];
  }

  public getCellsByPlayer() {
    return [...this.cellsByPlayer]
      .filter(([id]) => id !== 0)
      .sort((a, b) => a[0] - b[0]);
  }

  public getLegalMoves(playerId: number): Move[] {
    const moves: Move[] = [];

    for (let i = 0; i < this.board.length; i++) {
      if (this.isLegalMove(i, playerId)) {
        moves.push(this.getCoordinates(i));
      }
    }

    return moves;
  }

  public getIndex(r: number, c: number): number {
    return r * this.cols + c;
  }

  public getCoordinates(index: number): Move {
    return {
      row: Math.floor(index / this.cols),
      col: index % this.cols,
    };
  }

  // ==========================================
  // 4. CORE GAME LOGIC (Add Orb & Chain Reaction)
  // ==========================================

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
      this.setCellOwner(cell, this.EMPTY_PLAYER);

      this.updateCellHash(idx, cell.points, cell.player);
      q.push(idx);
    }

    yield this.board;

    const explodedInThisChain = new Set<number>();
    while (q.length > 0) {
      const currIdx = q.shift()!;
      explodedInThisChain.add(currIdx);
      for (const nIdx of this.neighbors[currIdx]) {
        if (explodedInThisChain.has(nIdx)) continue;
        const didExplode = this.processNeighborCell(nIdx, player);
        if (didExplode) {
          q.push(nIdx);
        }
      }

      this.checkEliminations();
      if (this._gameResult.status !== GameState.Playing) break;

      yield this.board;
    }
  }

  private processNeighborCell(nIdx: number, explodingPlayer: number): boolean {
    const neighbor = this.board[nIdx];

    this.updateCellHash(nIdx, neighbor.points, neighbor.player);
    this.addCellChange(nIdx, neighbor.player, neighbor.points);

    if (neighbor.player !== explodingPlayer) {
      this.setCellOwner(neighbor, explodingPlayer);
    }

    neighbor.points += 1;

    let exploded = false;
    if (neighbor.points >= this.critical_points) {
      neighbor.points = 0;
      this.setCellOwner(neighbor, this.EMPTY_PLAYER);
      exploded = true;
    }

    this.updateCellHash(nIdx, neighbor.points, neighbor.player);
    return exploded;
  }

  private getPointsToAdd(): number {
    const isFirstRound = this.roundNumber === 1;

    switch (this._playRule) {
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

    if (oldPlayer !== this.EMPTY_PLAYER) {
      this.updateCellCount(oldPlayer, -1);
      this.turnsWithoutCaptures = 0;
    }
    if (newPlayer !== this.EMPTY_PLAYER) {
      this.updateCellCount(newPlayer, 1);
    }
  }

  private updateCellCount(playerId: number, change: number) {
    const current = this.cellsByPlayer.get(playerId) || 0;
    this.cellsByPlayer.set(playerId, current + change);
  }

  private checkEliminations(): void {
    if (this.roundNumber <= 2) return;

    this.activePlayerIds = this.activePlayerIds.filter(
      (id) => (this.cellsByPlayer.get(id) || 0) > 0,
    );
  }
  // ==========================================
  // 5. TURN & GAME STATUS LOGIC
  // ==========================================

  private advanceTurn(): void {
    if (this._gameResult.status !== GameState.Playing) return;

    const nextId = this.nextPlayerId;

    if (this.isNewRound(nextId)) {
      this._roundNumber++;
    }

    this._currentPlayerId = nextId;
  }

  private get nextPlayerId(): number {
    const activeIdx = this.activePlayerIds.indexOf(this._currentPlayerId);
    const nextActiveIdx = (activeIdx + 1) % this.activePlayerIds.length;
    return this.activePlayerIds[nextActiveIdx];
  }

  private isNewRound(nextId: number): boolean {
    return nextId <= this._currentPlayerId;
  }

  private checkGameStatus(): GameResult {
    if (this.isDraw(this.currentHash)) {
      return { status: GameState.Draw, winnerId: null };
    }

    if (this.activePlayerIds.length === 1) {
      return { status: GameState.Win, winnerId: this.activePlayerIds[0] };
    }

    return { status: GameState.Playing, winnerId: null };
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

  // ==========================================
  // 6. VALIDATION HELPERS
  // ==========================================

  private isLegalMove(idx: number, currentPlayerId: number): boolean {
    const cell = this.board[idx];

    if (cell.player !== 0 && cell.player !== currentPlayerId) {
      return false;
    }

    let canPlayOnEmpty = false;
    const canPlayOnOwned = true;

    switch (this._playRule) {
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

  // ==========================================
  // 7. HASHING & REPETITION SYSTEM (Zobrist)
  // ==========================================
  private getRandom64(): bigint {
    const buffer = new BigUint64Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0];
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

  private addCellChange(idx: number, player: number, points: number) {
    if (!this.currentTurn!.cellChanges.has(idx)) {
      this.currentTurn!.cellChanges.set(idx, {
        player: player,
        points: points,
      });
    }
  }

  private updateCellHash(idx: number, points: number, player: number): void {
    this._currentHash ^= this.getHashForCell(idx, points, player);
  }
  // ==========================================
  // 8. DEBUG & UTILS
  // ==========================================

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

  private debugPrintBoard(): void {
    console.log(`\n--- TABLERO (Estado: ${this._gameResult.status}) ---`);
    for (let r = 0; r < this.rows; r++) {
      const rowStr = [];
      for (let c = 0; c < this.cols; c++) {
        const idx = this.getIndex(r, c);
        const cell = this.board[idx];
        rowStr.push(`[${cell.player}:${cell.points}]`);
      }
      console.log(rowStr.join(" "));
    }
    console.log("------------------------------------------\n");
  }
}

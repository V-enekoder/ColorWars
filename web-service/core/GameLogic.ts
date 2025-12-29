export interface CellData {
  points: number;
  player: number;
}

export type Board = CellData[];

export class GameEngine {
  rows: number;
  cols: number;
  critical_points: number;
  players_points: number[] = [0, 0];
  constructor(rows: number, cols: number, critical_points: number) {
    this.rows = rows;
    this.cols = cols;
    this.critical_points = critical_points;
  }

  getIndex(r: number, c: number): number {
    return r * this.cols + c;
  }
  isValidCoord(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  canPlay(
    board: Board,
    r: number,
    c: number,
    playerTurn: number,
    turn: number,
  ): boolean {
    const idx = this.getIndex(r, c);
    const cell = board[idx];

    return (cell.player === 0 && turn === 1) || cell.player === playerTurn;
  }

  applyMove(
    currentBoard: Board,
    r: number,
    c: number,
    player: number,
    isFirstMove: boolean,
  ): Board {
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    this.addOrb(newBoard, r, c, player, isFirstMove);

    return newBoard;
  }

  private addOrb(
    board: Board,
    r: number,
    c: number,
    player: number,
    isFirstMove: boolean,
  ): void {
    if (!this.isValidCoord(r, c)) return;

    const idx = this.getIndex(r, c);
    const cell = board[idx];

    if (isFirstMove) {
      cell.points = this.critical_points - 1;
      this.players_points[player - 1] += this.critical_points - 1;
      isFirstMove = false;
    } else {
      cell.points += 1;
      this.players_points[player - 1] += this.critical_points - 1;
    }
    cell.player = player;

    if (cell.points >= this.critical_points) {
      cell.points -= this.critical_points;
      this.players_points[player - 1] += this.critical_points;

      if (cell.points === 0) cell.player = 0;

      this.addOrb(board, r - 1, c, player, false);
      this.addOrb(board, r + 1, c, player, false);
      this.addOrb(board, r, c - 1, player, false);
      this.addOrb(board, r, c + 1, player, false);
    }
  }
  checkWinner(_board: Board, turn: number): number {
    if (turn <= 2) return 0;
    if (this.players_points[0] == 0) return 2;
    if (this.players_points[1] == 0) return 1;
    return 0;
  }
}

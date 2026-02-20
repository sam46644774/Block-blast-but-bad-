export type Point = { x: number; y: number };

export type Piece = {
  id: string;
  shape: number[][]; // 2D array representing the shape (1 for block, 0 for empty)
  color: string;
};

export type GameState = {
  grid: (string | null)[][]; // null if empty, color string if occupied
  score: number;
  highScore: number;
  currentPieces: (Piece | null)[];
  gameOver: boolean;
  combo: number;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  changes: string[];
};

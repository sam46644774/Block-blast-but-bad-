/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Trophy, RotateCcw, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Piece, GameState, Point } from './types';
import { GRID_SIZE, COLORS, PIECE_TEMPLATES, CHANGELOG } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const generatePiece = (): Piece => {
  const template = PIECE_TEMPLATES[Math.floor(Math.random() * PIECE_TEMPLATES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    id: Math.random().toString(36).substr(2, 9),
    shape: template.shape,
    color,
  };
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
    score: 0,
    highScore: parseInt(localStorage.getItem('block-blast-high-score') || '0'),
    currentPieces: [generatePiece(), generatePiece(), generatePiece()],
    gameOver: false,
    combo: 0,
  });

  const [showChangelog, setShowChangelog] = useState(false);
  const [draggedPieceIndex, setDraggedPieceIndex] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<Point | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Check if a piece can be placed at a specific position
  const canPlacePiece = useCallback((grid: (string | null)[][], piece: Piece, x: number, y: number) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          const gridX = x + col;
          const gridY = y + row;

          if (
            gridX < 0 ||
            gridX >= GRID_SIZE ||
            gridY < 0 ||
            gridY >= GRID_SIZE ||
            grid[gridY][gridX] !== null
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  // Check if game is over
  const checkGameOver = useCallback((grid: (string | null)[][], pieces: (Piece | null)[]) => {
    const remainingPieces = pieces.filter((p): p is Piece => p !== null);
    if (remainingPieces.length === 0) return false;

    for (const piece of remainingPieces) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (canPlacePiece(grid, piece, x, y)) {
            return false;
          }
        }
      }
    }
    return true;
  }, [canPlacePiece]);

  const placePiece = (pieceIndex: number, x: number, y: number) => {
    const piece = gameState.currentPieces[pieceIndex];
    if (!piece || !canPlacePiece(gameState.grid, piece, x, y)) return;

    const newGrid = gameState.grid.map(row => [...row]);
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          newGrid[y + row][x + col] = piece.color;
        }
      }
    }

    // Check for completed rows and columns
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      if (newGrid[i].every(cell => cell !== null)) rowsToClear.push(i);
      if (newGrid.every(row => row[i] !== null)) colsToClear.push(i);
    }

    let pointsEarned = piece.shape.flat().filter(v => v === 1).length;
    const clearedCount = rowsToClear.length + colsToClear.length;

    if (clearedCount > 0) {
      rowsToClear.forEach(rowIdx => {
        newGrid[rowIdx] = Array(GRID_SIZE).fill(null);
      });
      colsToClear.forEach(colIdx => {
        newGrid.forEach(row => {
          row[colIdx] = null;
        });
      });

      const comboBonus = (clearedCount * 10) * (gameState.combo + 1);
      pointsEarned += comboBonus;
      
      if (clearedCount >= 2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    const newPieces = [...gameState.currentPieces];
    newPieces[pieceIndex] = null;

    // If all pieces used, generate new ones
    const allUsed = newPieces.every(p => p === null);
    const finalPieces = allUsed ? [generatePiece(), generatePiece(), generatePiece()] : newPieces;

    const newScore = gameState.score + pointsEarned;
    const isNewHighScore = newScore > gameState.highScore;
    const newHighScore = Math.max(newScore, gameState.highScore);
    
    if (isNewHighScore) {
      localStorage.setItem('block-blast-high-score', newHighScore.toString());
      if (gameState.score <= gameState.highScore && newScore > gameState.highScore && gameState.highScore > 0) {
        // Just beat high score for the first time this session
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.3 },
          colors: ['#FFD700', '#FFA500', '#FF4500']
        });
      }
    }

    const isGameOver = checkGameOver(newGrid, finalPieces);

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      score: newScore,
      highScore: newHighScore,
      currentPieces: finalPieces,
      gameOver: isGameOver,
      combo: clearedCount > 0 ? prev.combo + 1 : 0,
    }));

    // Visual feedback for placement
    if (gridRef.current) {
      gridRef.current.classList.add('ring-4', 'ring-zinc-400/20');
      setTimeout(() => {
        gridRef.current?.classList.remove('ring-4', 'ring-zinc-400/20');
      }, 200);
    }
  };

  const resetGame = () => {
    setGameState({
      grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
      score: 0,
      highScore: parseInt(localStorage.getItem('block-blast-high-score') || '0'),
      currentPieces: [generatePiece(), generatePiece(), generatePiece()],
      gameOver: false,
      combo: 0,
    });
  };

  const handleDragEnd = (event: any, info: any, index: number) => {
    setDraggedPieceIndex(null);
    setHoverPos(null);

    if (!gridRef.current) return;

    const piece = gameState.currentPieces[index];
    if (!piece) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cellSize = gridRect.width / GRID_SIZE;

    // Calculate the top-left corner of the piece relative to the grid
    // We account for the -70px Y offset used during drag
    const dragOffsetY = -70;
    const adjustedY = info.point.y - dragOffsetY;
    
    // Calculate grid coordinates based on the center of the piece relative to the pointer
    // This makes the "snapping" feel much more natural
    const pieceWidth = piece.shape[0].length * cellSize;
    const pieceHeight = piece.shape.length * cellSize;
    
    const x = Math.round((info.point.x - gridRect.left - pieceWidth / 2) / cellSize);
    const y = Math.round((adjustedY - gridRect.top - pieceHeight / 2) / cellSize);

    placePiece(index, x, y);
  };

  const handleDrag = (event: any, info: any) => {
    if (!gridRef.current || draggedPieceIndex === null) return;
    const piece = gameState.currentPieces[draggedPieceIndex];
    if (!piece) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cellSize = gridRect.width / GRID_SIZE;
    
    const dragOffsetY = -70;
    const adjustedY = info.point.y - dragOffsetY;

    const pieceWidth = piece.shape[0].length * cellSize;
    const pieceHeight = piece.shape.length * cellSize;

    const x = Math.round((info.point.x - gridRect.left - pieceWidth / 2) / cellSize);
    const y = Math.round((adjustedY - gridRect.top - pieceHeight / 2) / cellSize);

    if (x >= -2 && x < GRID_SIZE && y >= -2 && y < GRID_SIZE) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center py-8 px-4 select-none overflow-x-hidden">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tighter text-zinc-900">BLOCK BLAST</h1>
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
            <Trophy size={14} className="text-yellow-500" />
            <span>High Score: {gameState.highScore}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowChangelog(true)}
            className="p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={resetGame}
            className="p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="mb-8 text-center relative">
        <AnimatePresence>
          {gameState.score > gameState.highScore && gameState.highScore > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm z-10"
            >
              New Record
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div 
          key={gameState.score}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black text-zinc-900 tracking-tight"
        >
          {gameState.score}
        </motion.div>
        {gameState.combo > 1 && (
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-orange-500 font-bold text-lg"
          >
            {gameState.combo}X COMBO!
          </motion.div>
        )}
      </div>

      {/* Game Board */}
      <div 
        ref={gridRef}
        className="relative w-full max-w-md aspect-square bg-zinc-200 p-2 rounded-xl shadow-inner grid grid-cols-8 gap-1"
      >
        {gameState.grid.map((row, y) => 
          row.map((cell, x) => {
            const piece = draggedPieceIndex !== null ? gameState.currentPieces[draggedPieceIndex] : null;
            const isHovered = piece && hoverPos && 
              piece.shape.some((r, ry) => 
                r.some((val, rx) => val === 1 && hoverPos.x + rx === x && hoverPos.y + ry === y)
              );
            
            const canPlace = piece && hoverPos && 
              canPlacePiece(gameState.grid, piece, hoverPos.x, hoverPos.y);

            return (
              <div 
                key={`${x}-${y}`}
                className={cn(
                  "grid-cell relative overflow-hidden",
                  cell ? cell : "bg-zinc-100/50",
                  isHovered && !cell && (canPlace ? "bg-zinc-400/40 shadow-inner" : "bg-red-200/60")
                )}
              >
                {/* Ghost piece indicator */}
                {isHovered && !cell && canPlace && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn("absolute inset-0 opacity-40", piece?.color)}
                  />
                )}
              </div>
            );
          })
        )}

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameState.gameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <h2 className="text-4xl font-black text-zinc-900 mb-2">GAME OVER</h2>
              <p className="text-zinc-600 mb-6">No more moves possible!</p>
              <div className="text-2xl font-bold text-zinc-900 mb-8">
                Final Score: {gameState.score}
              </div>
              <button 
                onClick={resetGame}
                className="bg-zinc-900 text-white px-8 py-3 rounded-full font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Piece Tray */}
      <div className="mt-8 w-full max-w-md flex justify-around items-center h-24 sm:h-32">
        {gameState.currentPieces.map((piece, index) => (
          <div key={index} className="w-1/3 flex justify-center items-center h-full">
            {piece ? (
              <motion.div
                drag
                dragSnapToOrigin
                onDragStart={() => setDraggedPieceIndex(index)}
                onDragEnd={(e, info) => handleDragEnd(e, info, index)}
                onDrag={handleDrag}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileDrag={{ 
                  scale: 1.3, 
                  zIndex: 50,
                  y: -70, // Slightly higher for better visibility
                  filter: "drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))"
                }}
                className="cursor-grab active:cursor-grabbing touch-none p-4"
              >
                <div 
                  className="grid gap-0.5"
                  style={{ 
                    gridTemplateColumns: `repeat(${piece.shape[0].length}, minmax(0, 1fr))`,
                  }}
                >
                  {piece.shape.map((row, y) => 
                    row.map((val, x) => (
                      <div 
                        key={`${x}-${y}`}
                        className={cn(
                          "w-4 h-4 sm:w-6 sm:h-6 rounded-sm",
                          val === 1 ? piece.color : "bg-transparent"
                        )}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-100 border-2 border-dashed border-zinc-200" />
            )}
          </div>
        ))}
      </div>

      {/* Changelog Modal */}
      <AnimatePresence>
        {showChangelog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-bottom border-zinc-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Changelog</h2>
                <button 
                  onClick={() => setShowChangelog(false)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {CHANGELOG.slice(0, 1).map((entry, idx) => (
                  <div key={idx} className="mb-0">
                    <div className="flex items-baseline justify-between mb-4">
                      <h3 className="font-bold text-xl text-zinc-900">Version {entry.version}</h3>
                      <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">{entry.date}</span>
                    </div>
                    <ul className="space-y-3">
                      {entry.changes.map((change, cIdx) => (
                        <li key={cIdx} className="flex gap-3 text-zinc-600 text-sm leading-relaxed">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-zinc-50 flex justify-end">
                <button 
                  onClick={() => setShowChangelog(false)}
                  className="bg-zinc-900 text-white px-6 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-auto pt-12 text-zinc-400 text-xs text-center max-w-xs">
        Drag and drop pieces onto the grid. Clear rows and columns to score. 
        Game ends when no more pieces can be placed.
      </div>
    </div>
  );
}

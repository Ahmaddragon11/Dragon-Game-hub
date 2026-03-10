'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

type Board = number[][];

export function Game2048({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);

  const targetScore = difficulty === 'easy' ? 512 : difficulty === 'medium' ? 1024 : difficulty === 'hard' ? 2048 : 4096;

  const addRandomTile = useCallback((currentBoard: Board): Board => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }, []);

  const initBoard = useCallback(() => {
    let newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    Promise.resolve().then(() => {
      setBoard(newBoard);
      setScore(0);
      setGameOver(false);
      setWon(false);
      setHasContinued(false);
    });
  }, [addRandomTile]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);
  const checkGameOver = (currentBoard: Board) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) return false;
        if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
        if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver || (won && !hasContinued)) return;

    let newBoard = board.map(row => [...row]);
    let scoreInc = 0;
    let moved = false;

    const rotateRight = (matrix: Board) => {
      const result = Array(4).fill(null).map(() => Array(4).fill(0));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          result[c][3 - r] = matrix[r][c];
        }
      }
      return result;
    };

    const rotateLeft = (matrix: Board) => {
      const result = Array(4).fill(null).map(() => Array(4).fill(0));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          result[3 - c][r] = matrix[r][c];
        }
      }
      return result;
    };

    const moveLeft = (matrix: Board) => {
      const result = [];
      for (let r = 0; r < 4; r++) {
        let row = matrix[r].filter(val => val !== 0);
        for (let c = 0; c < row.length - 1; c++) {
          if (row[c] === row[c + 1]) {
            row[c] *= 2;
            scoreInc += row[c];
            row.splice(c + 1, 1);
          }
        }
        while (row.length < 4) row.push(0);
        if (row.join(',') !== matrix[r].join(',')) moved = true;
        result.push(row);
      }
      return result;
    };

    if (direction === 'RIGHT') {
      newBoard = newBoard.map(row => row.reverse());
      newBoard = moveLeft(newBoard);
      newBoard = newBoard.map(row => row.reverse());
    } else if (direction === 'LEFT') {
      newBoard = moveLeft(newBoard);
    } else if (direction === 'UP') {
      newBoard = rotateLeft(newBoard);
      newBoard = moveLeft(newBoard);
      newBoard = rotateRight(newBoard);
    } else if (direction === 'DOWN') {
      newBoard = rotateRight(newBoard);
      newBoard = moveLeft(newBoard);
      newBoard = rotateLeft(newBoard);
    }

    if (moved) {
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(prev => prev + scoreInc);
      playSound('click', soundEnabled);

      if (!won && !hasContinued) {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (newBoard[r][c] >= targetScore) {
              setWon(true);
              updateGameStats('2048', score + scoreInc + 500, true);
              playSound('win', soundEnabled);
              confetti();
            }
          }
        }
      }

      if (checkGameOver(newBoard)) {
        setGameOver(true);
        updateGameStats('2048', score + scoreInc, false);
        playSound('lose', soundEnabled);
      }
    }
  }, [board, gameOver, won, hasContinued, targetScore, score, soundEnabled, updateGameStats, addRandomTile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) move('UP');
      if (['ArrowDown', 's', 'S'].includes(e.key)) move('DOWN');
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) move('LEFT');
      if (['ArrowRight', 'd', 'D'].includes(e.key)) move('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileColor = (val: number) => {
    const colors: Record<number, string> = {
      0: 'bg-slate-800/50',
      2: 'bg-slate-700 text-slate-200',
      4: 'bg-slate-600 text-slate-100',
      8: 'bg-orange-500 text-white',
      16: 'bg-orange-600 text-white',
      32: 'bg-red-500 text-white',
      64: 'bg-red-600 text-white',
      128: 'bg-yellow-500 text-white shadow-[0_0_10px_rgba(234,179,8,0.5)]',
      256: 'bg-yellow-400 text-white shadow-[0_0_15px_rgba(250,204,21,0.6)]',
      512: 'bg-yellow-300 text-slate-900 shadow-[0_0_20px_rgba(253,224,71,0.7)]',
      1024: 'bg-yellow-200 text-slate-900 shadow-[0_0_25px_rgba(254,240,138,0.8)]',
      2048: 'bg-yellow-100 text-slate-900 shadow-[0_0_30px_rgba(254,252,216,0.9)]',
    };
    return colors[val] || 'bg-violet-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.9)]';
  };

  // Touch handling
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
    }
    setTouchStart(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h3 className="text-3xl font-black text-slate-100 tracking-wider">2048</h3>
          <p className="text-slate-400 text-sm">الهدف: {targetScore}</p>
        </div>
        <div className="bg-slate-800/80 px-6 py-2 rounded-xl border border-slate-700/50 text-center">
          <div className="text-xs text-slate-400 font-bold tracking-wider uppercase">النقاط</div>
          <div className="text-2xl font-bold text-white">{score}</div>
        </div>
      </div>

      <div 
        className="bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-700/50 shadow-2xl relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {board.map((row, r) => (
            row.map((val, c) => (
              <div 
                key={`${r}-${c}`}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black transition-all duration-150 ${getTileColor(val)}`}
              >
                {val !== 0 ? val : ''}
              </div>
            ))
          ))}
        </div>

        {(gameOver || (won && !hasContinued)) && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
            <div className="text-5xl mb-4">{won ? '🏆' : '💀'}</div>
            <h3 className="text-3xl font-bold text-white mb-2">{won ? 'لقد فزت!' : 'انتهت اللعبة!'}</h3>
            <p className="text-slate-300 mb-6 font-medium">النقاط: {score}</p>
            <div className="flex gap-3">
              <button
                onClick={initBoard}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
              >
                🔄 إعادة اللعب
              </button>
              {won && !hasContinued && (
                <button
                  onClick={() => setHasContinued(true)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all hover:scale-105"
                >
                  استمرار
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-slate-400 text-sm text-center">
        استخدم <strong className="text-slate-200">الأسهم</strong> أو <strong className="text-slate-200">اسحب الشاشة</strong> لتحريك المربعات.
      </p>
    </div>
  );
}

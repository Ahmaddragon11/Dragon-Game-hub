'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

type Player = 'red' | 'yellow';
type Board = (Player | null)[][];

const ROWS = 6;
const COLS = 7;

export function ConnectFour({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [board, setBoard] = useState<Board>(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const checkWin = (b: Board, player: Player) => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) return true;
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) return true;
      }
    }
    // Diagonal Right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) return true;
      }
    }
    // Diagonal Left
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 3; c < COLS; c++) {
        if (b[r][c] === player && b[r+1][c-1] === player && b[r+2][c-2] === player && b[r+3][c-3] === player) return true;
      }
    }
    return false;
  };

  const getAvailableRow = (b: Board, col: number) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!b[r][col]) return r;
    }
    return -1;
  };

  const makeMove = useCallback((col: number, player: Player) => {
    if (winner || isAiThinking) return false;
    
    const row = getAvailableRow(board, col);
    if (row === -1) return false;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = player;
    setBoard(newBoard);
    playSound('click', soundEnabled);

    if (checkWin(newBoard, player)) {
      setWinner(player);
      if (player === 'red') {
        playSound('win', soundEnabled);
        confetti();
        updateGameStats('connectfour', 60, true);
      } else {
        playSound('lose', soundEnabled);
        updateGameStats('connectfour', 10, false);
      }
    } else if (newBoard.every(r => r.every(cell => cell !== null))) {
      setWinner('draw');
      playSound('wrong', soundEnabled);
      updateGameStats('connectfour', 20, false);
    } else {
      setCurrentPlayer(player === 'red' ? 'yellow' : 'red');
    }
    return true;
  }, [board, winner, isAiThinking, soundEnabled, updateGameStats]);

  const aiMove = useCallback(() => {
    if (winner || currentPlayer === 'red') return;
    Promise.resolve().then(() => setIsAiThinking(true));

    setTimeout(() => {
      let bestCol = -1;
      const validCols = [];
      for (let c = 0; c < COLS; c++) {
        if (getAvailableRow(board, c) !== -1) validCols.push(c);
      }

      if (validCols.length === 0) return;

      // Simple AI Logic
      if (difficulty !== 'easy') {
        // 1. Can AI win?
        for (const c of validCols) {
          const r = getAvailableRow(board, c);
          const tempBoard = board.map(row => [...row]);
          tempBoard[r][c] = 'yellow';
          if (checkWin(tempBoard, 'yellow')) { bestCol = c; break; }
        }
        
        // 2. Can Player win? Block them
        if (bestCol === -1) {
          for (const c of validCols) {
            const r = getAvailableRow(board, c);
            const tempBoard = board.map(row => [...row]);
            tempBoard[r][c] = 'red';
            if (checkWin(tempBoard, 'red')) { bestCol = c; break; }
          }
        }
      }

      if (bestCol === -1) {
        bestCol = validCols[Math.floor(Math.random() * validCols.length)];
      }

      makeMove(bestCol, 'yellow');
      setIsAiThinking(false);
    }, 600);
  }, [board, winner, currentPlayer, difficulty, makeMove]);

  useEffect(() => {
    if (currentPlayer === 'yellow' && !winner) {
      aiMove();
    }
  }, [currentPlayer, winner, aiMove]);

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setIsAiThinking(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h3 className="text-2xl font-bold text-slate-100">أربعة في صف</h3>
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
          <div className={`w-4 h-4 rounded-full ${currentPlayer === 'red' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-slate-700'}`} />
          <span className="text-sm font-bold text-slate-300">أنت</span>
          <div className="w-px h-4 bg-slate-600 mx-2" />
          <span className="text-sm font-bold text-slate-300">الخصم</span>
          <div className={`w-4 h-4 rounded-full ${currentPlayer === 'yellow' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-slate-700'}`} />
        </div>
      </div>

      <div className="bg-blue-900 p-3 sm:p-4 rounded-3xl border-4 border-blue-800 shadow-2xl relative">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {board.map((row, r) => (
            row.map((cell, c) => (
              <div 
                key={`${r}-${c}`}
                onClick={() => currentPlayer === 'red' && makeMove(c, 'red')}
                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full cursor-pointer transition-all duration-300 shadow-inner ${
                  cell === 'red' ? 'bg-red-500 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4)]' : 
                  cell === 'yellow' ? 'bg-yellow-400 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4)]' : 
                  'bg-slate-900/80 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] hover:bg-slate-800'
                }`}
              />
            ))
          ))}
        </div>

        {winner && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
            <div className="text-6xl mb-4">{winner === 'red' ? '🏆' : winner === 'yellow' ? '💀' : '🤝'}</div>
            <h3 className="text-3xl font-bold text-white mb-6">
              {winner === 'red' ? 'لقد فزت!' : winner === 'yellow' ? 'فاز الخصم!' : 'تعادل!'}
            </h3>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
            >
              🔄 العب مرة أخرى
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-slate-400 text-sm text-center">
        اضغط على أي عمود لإسقاط القرص الأحمر الخاص بك.
      </p>
    </div>
  );
}

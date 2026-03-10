'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

const checkWinner = (squares: (string | null)[]) => {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (squares.every(s => s !== null)) return { winner: 'draw', line: [] };
  return null;
};

const minimax = (squares: (string | null)[], isAI: boolean): { score: number; index?: number } => {
  const res = checkWinner(squares);
  if (res?.winner === 'O') return { score: 10 };
  if (res?.winner === 'X') return { score: -10 };
  if (res?.winner === 'draw') return { score: 0 };

  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const newBoard = [...squares];
      newBoard[i] = isAI ? 'O' : 'X';
      const result = minimax(newBoard, !isAI);
      moves.push({ index: i, score: result.score });
    }
  }

  let bestMove;
  if (isAI) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove!];
};

export function TicTacToe({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const aiMove = useCallback(() => {
    if (winner) return;
    
    let move = -1;
    if (difficulty === 'hard' || difficulty === 'expert') {
      move = minimax(board, true).index!;
    } else {
      // Simple AI logic for easy/medium
      const emptyIndices = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
      if (difficulty === 'easy' && Math.random() < 0.4) {
        move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      } else {
        // Try to win
        for (let i = 0; i < 9; i++) {
          if (!board[i]) {
            const b = [...board]; b[i] = 'O';
            if (checkWinner(b)?.winner === 'O') { move = i; break; }
          }
        }
        // Block
        if (move === -1) {
          for (let i = 0; i < 9; i++) {
            if (!board[i]) {
              const b = [...board]; b[i] = 'X';
              if (checkWinner(b)?.winner === 'X') { move = i; break; }
            }
          }
        }
        if (move === -1 && !board[4]) move = 4;
        if (move === -1) move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }

    if (move !== -1) {
      const newBoard = [...board];
      newBoard[move] = 'O';
      setBoard(newBoard);
      playSound('click', soundEnabled);
      setIsPlayerTurn(true);
    }
  }, [winner, difficulty, board, soundEnabled]);

  useEffect(() => {
    if (winner) return;
    const res = checkWinner(board);
    if (res) {
      Promise.resolve().then(() => {
        setWinner(res.winner);
        setWinningLine(res.line);
        const pts = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : difficulty === 'hard' ? 50 : 100;
        if (res.winner === 'X') {
          updateGameStats('tictactoe', pts, true);
          playSound('win', soundEnabled);
          confetti();
        } else if (res.winner === 'O') {
          updateGameStats('tictactoe', 0, false);
          playSound('lose', soundEnabled);
        } else {
          updateGameStats('tictactoe', 5, false);
          playSound('click', soundEnabled);
        }
      });
    } else if (!isPlayerTurn) {
      const timer = setTimeout(aiMove, 500);
      return () => clearTimeout(timer);
    }
  }, [board, isPlayerTurn, aiMove, difficulty, soundEnabled, updateGameStats, winner]);

  const handleSquareClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    playSound('click', soundEnabled);
    setIsPlayerTurn(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine([]);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">
          {winner === 'X' ? '🎉 رائع! فزتَ!' : 
           winner === 'O' ? '😔 خسرتَ! حاول مرة أخرى' : 
           winner === 'draw' ? '🤝 تعادل!' : 
           isPlayerTurn ? '🎮 دورك — أنت X' : '🤖 الذكاء الاصطناعي يفكر...'}
        </h3>
        {(difficulty === 'hard' || difficulty === 'expert') && !winner && (
          <p className="text-amber-400 text-sm font-bold bg-amber-500/10 px-4 py-1.5 rounded-full inline-block border border-amber-500/20">⚠️ صعوبة عالية — الذكاء الاصطناعي لا يُهزم!</p>
        )}
      </motion.div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-black/40 p-4 sm:p-6 rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay rounded-[2rem] pointer-events-none"></div>
        {board.map((square, i) => {
          const isWinningSquare = winningLine.includes(i);
          return (
            <motion.button
              whileHover={!square && !winner && isPlayerTurn ? { scale: 1.05 } : {}}
              whileTap={!square && !winner && isPlayerTurn ? { scale: 0.95 } : {}}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              key={i}
              onClick={() => handleSquareClick(i)}
              disabled={!!square || !!winner || !isPlayerTurn}
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl text-5xl sm:text-6xl font-black flex items-center justify-center transition-all duration-300 overflow-hidden ${
                square === 'X' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-500/30 border-b-4 border-blue-800' :
                square === 'O' ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-500/30 border-b-4 border-red-800' :
                'bg-slate-800/80 hover:bg-slate-700 border-2 border-white/5 text-transparent cursor-pointer'
              } ${isWinningSquare ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 scale-110 z-10' : ''}`}
            >
              {square && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="drop-shadow-lg"
                >
                  {square}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {winner && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="mt-10 px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 flex items-center gap-3 border border-white/20"
          >
            <span className="text-2xl">🔄</span> العب مرة أخرى
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

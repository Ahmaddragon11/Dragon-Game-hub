'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

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
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-100 mb-2">
          {winner === 'X' ? '🎉 رائع! فزتَ!' : 
           winner === 'O' ? '😔 خسرتَ! حاول مرة أخرى' : 
           winner === 'draw' ? '🤝 تعادل!' : 
           isPlayerTurn ? '🎮 دورك — أنت X' : '🤖 الذكاء الاصطناعي يفكر...'}
        </h3>
        {(difficulty === 'hard' || difficulty === 'expert') && !winner && (
          <p className="text-amber-400 text-sm">⚠️ صعوبة عالية — الذكاء الاصطناعي لا يُهزم!</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-800/50 p-3 sm:p-4 rounded-2xl border border-slate-700/50 shadow-xl">
        {board.map((square, i) => {
          const isWinningSquare = winningLine.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleSquareClick(i)}
              disabled={!!square || !!winner || !isPlayerTurn}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-4xl sm:text-5xl font-bold flex items-center justify-center transition-all duration-200 ${
                square === 'X' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20' :
                square === 'O' ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/20' :
                'bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-transparent'
              } ${isWinningSquare ? 'ring-4 ring-green-500 scale-105 z-10' : ''}`}
            >
              {square}
            </button>
          );
        })}
      </div>

      {winner && (
        <button
          onClick={resetGame}
          className="mt-8 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 لعبة جديدة
        </button>
      )}
    </div>
  );
}

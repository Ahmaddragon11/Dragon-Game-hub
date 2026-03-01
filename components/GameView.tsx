'use client';

import { useState } from 'react';
import { games } from '@/lib/games-data';
import { ArrowRight } from 'lucide-react';
import { TicTacToe } from './games/TicTacToe';
import { GuessNumber } from './games/GuessNumber';
import { Quiz } from './games/Quiz';
import { MathChallenge } from './games/MathChallenge';
import { MemoryGame } from './games/MemoryGame';
import { Snake } from './games/Snake';
import { RockPaperScissors } from './games/RockPaperScissors';
import { WordScramble } from './games/WordScramble';
import { ReactionTime } from './games/ReactionTime';
import { Game2048 } from './games/Game2048';
import { ConnectFour } from './games/ConnectFour';
import { Hangman } from './games/Hangman';

interface GameViewProps {
  gameId: string;
  onClose: () => void;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export function GameView({ gameId, onClose }: GameViewProps) {
  const game = games.find(g => g.id === gameId);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  if (!game) return null;

  const renderGame = () => {
    const key = `${gameId}-${difficulty}`;
    switch (gameId) {
      case 'tictactoe': return <TicTacToe key={key} difficulty={difficulty} />;
      case 'guessnumber': return <GuessNumber key={key} difficulty={difficulty} />;
      case 'quiz': return <Quiz key={key} difficulty={difficulty} />;
      case 'math': return <MathChallenge key={key} difficulty={difficulty} />;
      case 'memory': return <MemoryGame key={key} difficulty={difficulty} />;
      case 'snake': return <Snake key={key} difficulty={difficulty} />;
      case 'rps': return <RockPaperScissors key={key} difficulty={difficulty} />;
      case 'wordscramble': return <WordScramble key={key} difficulty={difficulty} />;
      case 'reaction': return <ReactionTime key={key} difficulty={difficulty} />;
      case '2048': return <Game2048 key={key} difficulty={difficulty} />;
      case 'connectfour': return <ConnectFour key={key} difficulty={difficulty} />;
      case 'hangman': return <Hangman key={key} difficulty={difficulty} />;
      default: return <div>Game not implemented yet</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-900/80 border border-violet-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-500/10">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                {game.icon} {game.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1">{game.nameEn}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  difficulty === diff
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {diff === 'easy' ? 'سهل' : diff === 'medium' ? 'متوسط' : diff === 'hard' ? 'صعب' : 'خبير'}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-950/50 rounded-2xl border border-slate-800/50 p-6">
          {renderGame()}
        </div>

      </div>
    </div>
  );
}

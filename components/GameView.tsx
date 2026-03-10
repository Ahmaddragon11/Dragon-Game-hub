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
import { ClickerGame } from './games/ClickerGame';
import { motion, AnimatePresence } from 'motion/react';

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
      case 'clicker': return <ClickerGame key={key} difficulty={difficulty} />;
      default: return <div>Game not implemented yet</div>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-violet-900/20">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-2xl transition-all font-medium hover:text-white"
            >
              <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              العودة
            </button>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-3xl drop-shadow-md">{game.icon}</span> 
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{game.name}</span>
              </h2>
              <p className="text-xs text-violet-400 font-mono uppercase tracking-widest mt-1">{game.nameEn}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto bg-black/20 p-1.5 rounded-2xl border border-white/5">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`relative flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                  difficulty === diff
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {difficulty === diff && (
                  <motion.div
                    layoutId="difficultyTab"
                    className="absolute inset-0 bg-violet-600 rounded-xl shadow-lg shadow-violet-600/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {diff === 'easy' ? 'سهل' : diff === 'medium' ? 'متوسط' : diff === 'hard' ? 'صعب' : 'خبير'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px] flex flex-col items-center justify-center bg-black/40 rounded-[2rem] border border-white/5 p-6 relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${gameId}-${difficulty}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-full relative z-10 flex flex-col items-center"
            >
              {renderGame()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}

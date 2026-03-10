'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';
import { memoryEmojis } from '@/lib/game-content';
import { motion, AnimatePresence } from 'motion/react';

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export function MemoryGame({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const pairsCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : difficulty === 'hard' ? 8 : 10;

  const initGame = useCallback(() => {
    const selectedEmojis = [...memoryEmojis].sort(() => Math.random() - 0.5).slice(0, pairsCount);
    const gameCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    
    setCards(gameCards);
    setFlippedIndices([]);
    setMatchedCount(0);
    setMoves(0);
    setIsLocked(false);
    setGameOver(false);
  }, [pairsCount]);

  useEffect(() => {
    Promise.resolve().then(() => initGame());
  }, [initGame]);

  const handleFlip = (index: number) => {
    if (isLocked || cards[index].flipped || cards[index].matched || flippedIndices.length >= 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    playSound('flip', soundEnabled);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(prev => prev + 1);

      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[a].matched = true;
          matchedCards[b].matched = true;
          setCards(matchedCards);
          setMatchedCount(prev => prev + 1);
          setFlippedIndices([]);
          setIsLocked(false);
          playSound('correct', soundEnabled);

          if (matchedCount + 1 === pairsCount) {
            setGameOver(true);
            const pts = Math.max(10, 80 + (pairsCount * 2 - (moves + 1)) * 5);
            updateGameStats('memory', pts, true);
            playSound('win', soundEnabled);
            confetti();
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[a].flipped = false;
          resetCards[b].flipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
          playSound('wrong', soundEnabled);
        }, 1000);
      }
    }
  };

  if (gameOver) {
    const pts = Math.max(10, 80 + (pairsCount * 2 - moves) * 5);
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center bg-black/40 p-10 rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="text-7xl mb-6 drop-shadow-xl"
        >
          🧠
        </motion.div>
        <h3 className="text-4xl font-black text-white mb-4 drop-shadow-md">أحسنت!</h3>
        <p className="text-slate-400 mb-6 text-lg font-medium">وجدت كل الأزواج في <strong className="text-violet-400 text-2xl mx-1">{moves}</strong> حركة</p>
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl mb-10">
          <p className="text-3xl text-emerald-400 font-black">النقاط: {pts}</p>
        </div>
        <br />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={initGame}
          className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 flex items-center gap-3 border border-white/20 mx-auto"
        >
          <span className="text-2xl">🔄</span> العب مرة أخرى
        </motion.button>
      </motion.div>
    );
  }

  const progressPercent = (matchedCount / pairsCount) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-8 px-6 bg-black/30 p-4 rounded-3xl border border-white/5 shadow-inner"
      >
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">حركات</span>
          <span className="text-2xl font-black text-white drop-shadow-sm">{moves}</span>
        </div>
        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">
            <span>الأزواج المتطابقة</span>
            <span className="text-violet-400">{matchedCount}/{pairsCount}</span>
          </div>
          <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">أزواج</span>
          <span className="text-2xl font-black text-emerald-400 drop-shadow-sm">{matchedCount}</span>
        </div>
      </motion.div>

      <div className={`grid gap-3 sm:gap-4 p-4 sm:p-6 bg-black/40 rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 relative ${
        pairsCount <= 4 ? 'grid-cols-4' : pairsCount <= 6 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-5'
      }`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay rounded-[2rem] pointer-events-none"></div>
        {cards.map((card, i) => (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
            whileHover={!card.flipped && !card.matched && !isLocked ? { scale: 1.05, y: -2 } : {}}
            whileTap={!card.flipped && !card.matched && !isLocked ? { scale: 0.95 } : {}}
            key={card.id}
            onClick={() => handleFlip(i)}
            disabled={card.flipped || card.matched || isLocked}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl text-3xl sm:text-4xl md:text-5xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
              card.flipped || card.matched
                ? 'bg-gradient-to-br from-white to-slate-200 text-slate-900 shadow-inner border-2 border-white/50'
                : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-transparent shadow-lg shadow-violet-500/30 border-b-4 border-violet-800 cursor-pointer'
            } ${card.matched ? 'opacity-50 scale-95 grayscale-[0.3] border-emerald-400/50' : ''}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center backface-hidden"
              style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
            >
              {(card.flipped || card.matched) && (
                <span className="drop-shadow-md">{card.emoji}</span>
              )}
            </div>
            
            <div 
              className="absolute inset-0 flex items-center justify-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {!(card.flipped || card.matched) && (
                <span className="text-white/50 font-black text-2xl sm:text-3xl">?</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

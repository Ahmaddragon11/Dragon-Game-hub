'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

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
    const emojis = ['🎮','🎲','🎯','🏆','⭐','🎪','🎨','🎭','🎵','🎸'];
    const selectedEmojis = emojis.slice(0, pairsCount);
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
      <div className="text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">🧠</div>
        <h3 className="text-3xl font-bold text-slate-100 mb-2">أحسنت!</h3>
        <p className="text-slate-400 mb-4">وجدت كل الأزواج في <strong className="text-violet-400">{moves}</strong> حركة</p>
        <p className="text-2xl text-green-400 mb-8 font-medium">النقاط: {pts}</p>
        <button
          onClick={initGame}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 العب مرة أخرى
        </button>
      </div>
    );
  }

  const progressPercent = (matchedCount / pairsCount) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">حركات</span>
          <span className="text-xl font-bold text-slate-100">{moves}</span>
        </div>
        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>الأزواج المتطابقة</span>
            <span>{matchedCount}/{pairsCount}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">أزواج</span>
          <span className="text-xl font-bold text-green-400">{matchedCount}</span>
        </div>
      </div>

      <div className={`grid gap-3 sm:gap-4 p-4 bg-slate-800/30 rounded-3xl border border-slate-700/50 ${
        pairsCount <= 4 ? 'grid-cols-4' : pairsCount <= 6 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-5'
      }`}>
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleFlip(i)}
            disabled={card.flipped || card.matched || isLocked}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300 transform ${
              card.flipped || card.matched
                ? 'bg-white text-slate-900 rotate-0'
                : 'bg-gradient-to-br from-violet-500 to-pink-500 text-transparent -rotate-180'
            } ${card.matched ? 'opacity-40 scale-90 grayscale-[0.5]' : 'shadow-lg shadow-violet-500/20 hover:scale-105'}`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

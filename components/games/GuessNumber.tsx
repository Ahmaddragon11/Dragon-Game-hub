'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

export function GuessNumber({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const maxNum = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : difficulty === 'hard' ? 500 : 1000;
  const maxAttempts = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : difficulty === 'hard' ? 12 : 15;

  const [target, setTarget] = useState(() => Math.floor(Math.random() * maxNum) + 1);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hints, setHints] = useState<{ text: string; type: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [gameOver]);

  const handleGuess = () => {
    if (gameOver) return;
    const input = inputRef.current?.value;
    if (!input) return;
    const guess = parseInt(input);

    if (isNaN(guess) || guess < 1 || guess > maxNum) {
      playSound('wrong', soundEnabled);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess === target) {
      setGameOver(true);
      setHints([{ text: `🎉 أحسنت! الرقم هو ${target} — وجدتَه في ${newAttempts} محاولة`, type: 'success' }, ...hints]);
      const pts = Math.max(5, 50 + (maxAttempts - newAttempts) * 8);
      updateGameStats('guessnumber', pts, true);
      playSound('win', soundEnabled);
      confetti();
    } else if (newAttempts >= maxAttempts) {
      setGameOver(true);
      setHints([{ text: `😔 انتهت المحاولات! الرقم كان ${target}`, type: 'error' }, ...hints]);
      updateGameStats('guessnumber', 0, false);
      playSound('lose', soundEnabled);
    } else {
      const diff = Math.abs(guess - target);
      const dir = guess < target ? '⬆️ أكبر' : '⬇️ أصغر';
      const proximity = diff <= 5 ? '🔥 قريب جداً!' : diff <= 15 ? '🌡️ دافئ!' : diff <= 30 ? '❄️ بارد' : '🧊 بارد جداً';
      setHints([{ text: `${proximity} — الرقم ${dir}`, type: diff <= 15 ? 'warning' : 'info' }, ...hints]);
      playSound(diff <= 10 ? 'correct' : 'click', soundEnabled);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const resetGame = () => {
    setTarget(Math.floor(Math.random() * maxNum) + 1);
    setAttempts(0);
    setGameOver(false);
    setHints([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const remaining = maxAttempts - attempts;
  const progressPercent = (remaining / maxAttempts) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full mb-8"
      >
        <h3 className="text-3xl font-black text-white mb-3 drop-shadow-md">🔢 تخمين الرقم</h3>
        <p className="text-slate-400 mb-6 font-medium">خمّن رقماً بين 1 و <strong className="text-violet-400 text-lg">{maxNum}</strong></p>
        
        <div className="mb-8 bg-black/30 p-4 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex justify-between text-sm mb-3 font-bold uppercase tracking-wider">
            <span className="text-slate-400">المحاولات المتبقية</span>
            <span className={remaining <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-400'}>{remaining}</span>
          </div>
          <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`h-full rounded-full ${remaining <= 3 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'}`}
            />
          </div>
        </div>

        <motion.input
          whileFocus={{ scale: 1.05 }}
          type="number"
          ref={inputRef}
          disabled={gameOver}
          placeholder="أدخل رقماً"
          min="1"
          max={maxNum}
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          className="w-48 text-center text-4xl font-black px-4 py-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all disabled:opacity-50 shadow-inner"
        />
        
        <br />
        
        <AnimatePresence mode="wait">
          {!gameOver ? (
            <motion.button
              key="guess"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGuess}
              className="mt-8 px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 flex items-center gap-3 border border-white/20 mx-auto"
            >
              <span className="text-2xl">🎯</span> خمّن
            </motion.button>
          ) : (
            <motion.button
              key="reset"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="mt-8 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center gap-3 border border-white/20 mx-auto"
            >
              <span className="text-2xl">🔄</span> جرّب مرة أخرى
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="w-full max-h-56 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-transparent">
        <AnimatePresence>
          {hints.map((hint, i) => (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              key={i} 
              className={`p-4 rounded-2xl text-center text-sm font-bold shadow-lg ${
                hint.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/10' :
                hint.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-red-500/10' :
                hint.type === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-amber-500/10' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-blue-500/10'
              }`}
            >
              {hint.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

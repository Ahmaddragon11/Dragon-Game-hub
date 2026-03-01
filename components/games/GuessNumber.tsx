'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

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
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="text-center w-full mb-6">
        <h3 className="text-2xl font-bold text-slate-100 mb-2">🔢 تخمين الرقم</h3>
        <p className="text-slate-400 mb-4">خمّن رقماً بين 1 و <strong className="text-violet-400">{maxNum}</strong></p>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-slate-400">المحاولات المتبقية</span>
            <span className={remaining <= 3 ? 'text-red-400' : 'text-amber-400'}>{remaining}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${remaining <= 3 ? 'bg-red-500' : 'bg-gradient-to-r from-violet-500 to-pink-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <input
          type="number"
          ref={inputRef}
          disabled={gameOver}
          placeholder="أدخل رقماً"
          min="1"
          max={maxNum}
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          className="w-48 text-center text-3xl font-bold px-4 py-3 bg-slate-800/50 border-2 border-violet-500/50 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all disabled:opacity-50"
        />
        
        <br />
        
        {!gameOver ? (
          <button
            onClick={handleGuess}
            className="mt-6 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
          >
            🎯 خمّن
          </button>
        ) : (
          <button
            onClick={resetGame}
            className="mt-6 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
          >
            🔄 جرّب مرة أخرى
          </button>
        )}
      </div>

      <div className="w-full max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-transparent">
        {hints.map((hint, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-xl text-center text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
              hint.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              hint.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              hint.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}
          >
            {hint.text}
          </div>
        ))}
      </div>
    </div>
  );
}

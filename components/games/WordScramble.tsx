'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

import { wordList } from '@/lib/game-content';

export function WordScramble({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const usedWordsRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const totalQuestions = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : difficulty === 'hard' ? 9 : 12;
  const questionTime = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 25 : difficulty === 'hard' ? 20 : 15;

  const scramble = useCallback((w: string) => {
    if (w.length <= 2) return w.split('').reverse().join('');
    let s;
    let attempts = 0;
    do {
      s = w.split('').sort(() => Math.random() - 0.5).join('');
      attempts++;
    } while (s === w && attempts < 20);
    return s;
  }, []);

  const generateWord = useCallback(() => {
    const available = wordList.filter(w => !usedWordsRef.current.has(w));
    const nextWord = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : wordList[Math.floor(Math.random() * wordList.length)];
    setWord(nextWord);
    setScrambled(scramble(nextWord));
    usedWordsRef.current.add(nextWord);
    setTimeLeft(questionTime);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [scramble, questionTime]);

  useEffect(() => {
    Promise.resolve().then(() => {
      usedWordsRef.current.clear();
      generateWord();
      setScore(0);
      setCurrentQ(0);
      setGameOver(false);
    });
  }, [generateWord]);

  const handleSkip = useCallback(() => {
    if (gameOver) return;
    playSound('wrong', soundEnabled);
    if (currentQ + 1 >= totalQuestions) {
      setGameOver(true);
      const percent = Math.round((score / totalQuestions) * 100);
      updateGameStats('wordscramble', score * 12, percent >= 50);
    } else {
      setCurrentQ(prev => prev + 1);
      generateWord();
    }
  }, [gameOver, soundEnabled, currentQ, totalQuestions, score, updateGameStats, generateWord]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) {
      if (timeLeft <= 0 && !gameOver) {
        Promise.resolve().then(() => handleSkip());
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, handleSkip]);

  const handleSubmit = () => {
    if (gameOver) return;
    const guess = inputRef.current?.value.trim();
    if (guess === word) {
      setScore(prev => prev + 1);
      playSound('correct', soundEnabled);
    } else {
      playSound('wrong', soundEnabled);
    }

    if (currentQ + 1 >= totalQuestions) {
      setGameOver(true);
      const finalScore = score + (guess === word ? 1 : 0);
      const percent = Math.round((finalScore / totalQuestions) * 100);
      updateGameStats('wordscramble', finalScore * 12, percent >= 50);
      if (percent >= 80) {
        playSound('win', soundEnabled);
        confetti();
      }
    } else {
      setCurrentQ(prev => prev + 1);
      generateWord();
    }
  };

  if (gameOver) {
    const percent = Math.round((score / totalQuestions) * 100);
    return (
      <div className="text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">{percent >= 80 ? '🏆' : '🎉'}</div>
        <h3 className="text-3xl font-bold text-slate-100 mb-2">{percent >= 80 ? 'ممتاز!' : 'جيد!'}</h3>
        <p className="text-slate-400 mb-4">خمّنت <strong className="text-violet-400">{score}</strong> من <strong className="text-violet-400">{totalQuestions}</strong> بشكل صحيح</p>
        <p className="text-2xl text-green-400 mb-8 font-medium">النقاط: {score * 12}</p>
        <button
          onClick={() => { setGameOver(false); setScore(0); setCurrentQ(0); usedWordsRef.current.clear(); generateWord(); }}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 جولة جديدة
        </button>
      </div>
    );
  }

  const progressPercent = (currentQ / totalQuestions) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-4 text-sm font-medium">
        <span className="text-slate-400">الكلمة {currentQ + 1}/{totalQuestions}</span>
        <span className={`px-3 py-1 rounded-lg border ${
          timeLeft < 8 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
        }`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-slate-400 text-sm mb-4">رتّب الحروف لتكوين الكلمة:</p>
      
      <div className="text-4xl sm:text-5xl font-bold text-slate-100 bg-slate-800/80 border-2 border-violet-500/30 rounded-3xl p-8 sm:p-12 mb-8 shadow-xl tracking-[0.5em] font-mono text-center w-full flex justify-center items-center gap-2 flex-wrap">
        {scrambled.split('').map((char, i) => (
          <span key={i} className="animate-in zoom-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>{char}</span>
        ))}
      </div>

      <input
        type="text"
        ref={inputRef}
        placeholder="اكتب الكلمة"
        dir="rtl"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-full text-center text-3xl font-bold px-4 py-4 bg-slate-800/50 border-2 border-violet-500/50 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all"
      />

      <div className="flex gap-4 mt-8 w-full">
        <button
          onClick={handleSubmit}
          className="flex-1 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          ✓ تحقق
        </button>
        <button
          onClick={handleSkip}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded-xl transition-all"
        >
          تخطي ⏭
        </button>
      </div>
      
      <p className="mt-6 text-green-400 font-bold">النقاط: {score * 12}</p>
    </div>
  );
}

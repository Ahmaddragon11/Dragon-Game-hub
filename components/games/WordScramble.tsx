'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

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
          {percent >= 80 ? '🏆' : '🎉'}
        </motion.div>
        <h3 className="text-4xl font-black text-white mb-4 drop-shadow-md">{percent >= 80 ? 'ممتاز!' : 'جيد!'}</h3>
        <p className="text-slate-400 mb-6 text-lg font-medium">خمّنت <strong className="text-violet-400 text-2xl mx-1">{score}</strong> من <strong className="text-violet-400 text-2xl mx-1">{totalQuestions}</strong> بشكل صحيح</p>
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl mb-10">
          <p className="text-3xl text-emerald-400 font-black">النقاط: {score * 12}</p>
        </div>
        <br />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setGameOver(false); setScore(0); setCurrentQ(0); usedWordsRef.current.clear(); generateWord(); }}
          className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 flex items-center gap-3 border border-white/20 mx-auto"
        >
          <span className="text-2xl">🔄</span> جولة جديدة
        </motion.button>
      </motion.div>
    );
  }

  const progressPercent = (currentQ / totalQuestions) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-6 px-6 bg-black/30 p-4 rounded-3xl border border-white/5 shadow-inner"
      >
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">الكلمة</span>
          <span className="text-xl font-black text-white drop-shadow-sm">{currentQ + 1} / {totalQuestions}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">الوقت</span>
          <span className={`text-xl font-black drop-shadow-sm ${timeLeft < 8 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
            {timeLeft}s
          </span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full h-3 bg-slate-900/80 rounded-full overflow-hidden mb-8 border border-white/5 shadow-inner"
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
        />
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 text-sm font-bold tracking-widest mb-4 uppercase"
      >
        رتّب الحروف لتكوين الكلمة:
      </motion.p>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={scrambled}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-4xl sm:text-5xl font-black text-white bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-violet-500/30 rounded-[2rem] p-8 sm:p-12 mb-8 shadow-2xl shadow-violet-500/10 tracking-[0.5em] font-mono text-center w-full flex justify-center items-center gap-2 flex-wrap"
        >
          {scrambled.split('').map((char, i) => (
            <motion.span 
              key={i} 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 15 }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.input
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        type="text"
        ref={inputRef}
        placeholder="اكتب الكلمة"
        dir="rtl"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-full text-center text-3xl font-black px-6 py-5 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all shadow-inner"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 mt-8 w-full"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 transition-all border border-white/20"
        >
          ✓ تحقق
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSkip}
          className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700 border-2 border-white/10 text-slate-300 font-bold text-lg rounded-2xl transition-all shadow-lg"
        >
          تخطي ⏭
        </motion.button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full"
      >
        <p className="text-emerald-400 font-bold tracking-widest">النقاط: {score * 12}</p>
      </motion.div>
    </div>
  );
}

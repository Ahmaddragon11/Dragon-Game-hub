'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

export function MathChallenge({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [problem, setProblem] = useState({ n1: 0, n2: 0, op: '', answer: 0 });
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalQuestions = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : difficulty === 'hard' ? 15 : 20;
  const questionTime = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 12 : difficulty === 'hard' ? 9 : 6;

  const generateProblem = useCallback(() => {
    const ops = difficulty === 'easy' ? ['+','-'] : difficulty === 'medium' ? ['+','-','*'] : ['+','-','*','/'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const max = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : difficulty === 'hard' ? 100 : 200;
    let n1, n2, answer;

    switch(op) {
      case '+': n1 = Math.floor(Math.random()*max)+1; n2 = Math.floor(Math.random()*max)+1; answer = n1+n2; break;
      case '-': n1 = Math.floor(Math.random()*max)+1; n2 = Math.floor(Math.random()*n1)+1;  answer = n1-n2; break;
      case '*': n1 = Math.floor(Math.random()*12)+1;  n2 = Math.floor(Math.random()*12)+1;  answer = n1*n2; break;
      case '/': n2 = Math.floor(Math.random()*12)+1; answer = Math.floor(Math.random()*12)+1; n1 = n2*answer; break;
      default: n1=0; n2=0; answer=0;
    }
    setProblem({ n1, n2, op: op === '*' ? '×' : op === '/' ? '÷' : op, answer });
    setTimeLeft(questionTime);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [difficulty, questionTime]);

  useEffect(() => {
    Promise.resolve().then(() => {
      generateProblem();
      setScore(0);
      setCorrectCount(0);
      setGameOver(false);
    });
  }, [generateProblem]);

  const handleSubmit = useCallback((timeout = false) => {
    if (gameOver) return;
    const input = inputRef.current?.value;
    const answer = parseInt(input || '');
    const isCorrect = !timeout && answer === problem.answer;

    if (isCorrect) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      const pts = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : difficulty === 'hard' ? 22 : 35;
      setScore(prev => prev + pts);
      playSound('correct', soundEnabled);
      
      if (newCorrect >= totalQuestions) {
        setGameOver(true);
        updateGameStats('math', score + pts, true);
        playSound('win', soundEnabled);
        confetti();
      } else {
        generateProblem();
      }
    } else {
      playSound('wrong', soundEnabled);
      if (correctCount + 1 >= totalQuestions) {
        setGameOver(true);
        updateGameStats('math', score, correctCount >= totalQuestions / 2);
      } else {
        setCorrectCount(prev => prev + 1);
        generateProblem();
      }
    }
  }, [gameOver, problem.answer, correctCount, totalQuestions, difficulty, score, soundEnabled, updateGameStats, generateProblem]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) {
      if (timeLeft <= 0 && !gameOver) {
        Promise.resolve().then(() => handleSubmit(true));
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, handleSubmit]);

  if (gameOver) {
    const percent = Math.round((correctCount / totalQuestions) * 100);
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
          {percent >= 80 ? '🧮' : '🎉'}
        </motion.div>
        <h3 className="text-4xl font-black text-white mb-4 drop-shadow-md">{percent >= 80 ? 'عبقري رياضي!' : 'جيد!'}</h3>
        <p className="text-slate-400 mb-6 text-lg font-medium">أجبت على <strong className="text-violet-400 text-2xl mx-1">{correctCount}</strong> من <strong className="text-violet-400 text-2xl mx-1">{totalQuestions}</strong> بشكل صحيح</p>
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl mb-10">
          <p className="text-3xl text-emerald-400 font-black">النقاط: {score}</p>
        </div>
        <br />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setGameOver(false); setCorrectCount(0); setScore(0); generateProblem(); }}
          className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 flex items-center gap-3 border border-white/20 mx-auto"
        >
          <span className="text-2xl">🔄</span> جولة جديدة
        </motion.button>
      </motion.div>
    );
  }

  const progress = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-6 text-sm font-bold uppercase tracking-wider bg-black/30 p-4 rounded-2xl border border-white/5 shadow-inner"
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1">السؤال</span>
          <span className="text-xl text-violet-400">{correctCount + 1}/{totalQuestions}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1">النقاط</span>
          <span className="text-xl text-emerald-400">{score}</span>
        </div>
        <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${
          timeLeft < 4 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
        }`}>
          <span className="text-xs opacity-70 mb-1">الوقت</span>
          <span className="text-xl">⏱️ {timeLeft}s</span>
        </div>
      </motion.div>

      <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-8 border border-white/5 p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${problem.n1}-${problem.op}-${problem.n2}`}
          initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-6xl sm:text-7xl font-black text-white bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white/10 rounded-[2rem] p-10 sm:p-14 mb-8 shadow-2xl shadow-black/50 tracking-widest font-mono w-full text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          <span className="drop-shadow-lg relative z-10">{problem.n1} <span className="text-violet-400">{problem.op}</span> {problem.n2}</span>
        </motion.div>
      </AnimatePresence>

      <motion.input
        whileFocus={{ scale: 1.05 }}
        type="number"
        ref={inputRef}
        placeholder="?"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-48 text-center text-5xl font-black px-4 py-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all shadow-inner"
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleSubmit()}
        className="mt-8 px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center gap-3 border border-white/20"
      >
        <span className="text-2xl">✓</span> تأكيد
      </motion.button>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

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
      <div className="text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">{percent >= 80 ? '🧮' : '🎉'}</div>
        <h3 className="text-3xl font-bold text-slate-100 mb-2">{percent >= 80 ? 'عبقري رياضي!' : 'جيد!'}</h3>
        <p className="text-slate-400 mb-4">أجبت على <strong className="text-violet-400">{correctCount}</strong> من <strong className="text-violet-400">{totalQuestions}</strong> بشكل صحيح</p>
        <p className="text-2xl text-green-400 mb-8 font-medium">النقاط: {score}</p>
        <button
          onClick={() => { setGameOver(false); setCorrectCount(0); setScore(0); generateProblem(); }}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 جولة جديدة
        </button>
      </div>
    );
  }

  const progress = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-4 text-sm font-medium">
        <span className="text-slate-400">{correctCount + 1}/{totalQuestions}</span>
        <span className={`px-3 py-1 rounded-lg border ${
          timeLeft < 4 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
        }`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-5xl sm:text-6xl font-bold text-slate-100 bg-slate-800/80 border-2 border-violet-500/30 rounded-3xl p-8 sm:p-12 mb-8 shadow-xl tracking-wider font-mono">
        {problem.n1} {problem.op} {problem.n2}
      </div>

      <input
        type="number"
        ref={inputRef}
        placeholder="?"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-40 text-center text-4xl font-bold px-4 py-4 bg-slate-800/50 border-2 border-violet-500/50 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all"
      />

      <button
        onClick={() => handleSubmit()}
        className="mt-8 px-10 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
      >
        ✓ تأكيد
      </button>
      
      <p className="mt-6 text-green-400 font-bold">النقاط: {score}</p>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Snake({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState([{ x: 140, y: 140 }]);
  const [food, setFood] = useState({ x: 200, y: 200 });
  const [direction, setDirection] = useState('right');
  const [nextDirection, setNextDirection] = useState('right');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const speed = difficulty === 'easy' ? 220 : difficulty === 'medium' ? 155 : difficulty === 'hard' ? 105 : 70;

  const spawnFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let newFood: { x: number; y: number };
    do {
      newFood = { x: Math.floor(Math.random() * 15) * 20, y: Math.floor(Math.random() * 15) * 20 };
    } while (currentSnake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const initGame = useCallback(() => {
    setSnake([{ x: 140, y: 140 }]);
    setDirection('right');
    setNextDirection('right');
    setScore(0);
    setGameOver(false);
    setFood(spawnFood([{ x: 140, y: 140 }]));
  }, [spawnFood]);

  useEffect(() => {
    Promise.resolve().then(() => initGame());
  }, [initGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const map: Record<string, string> = { 
        arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right', 
        w: 'up', s: 'down', a: 'left', d: 'right' 
      };
      const dir = map[e.key.toLowerCase()];
      if (dir) {
        const opposite: Record<string, string> = { up: 'down', down: 'up', left: 'right', right: 'left' };
        const lastDir = directionQueue.current.length > 0 
          ? directionQueue.current[directionQueue.current.length - 1] 
          : directionRef.current;
        
        if (dir !== opposite[lastDir] && dir !== lastDir) {
          directionQueue.current.push(dir);
          setNextDirection(dir);
        }
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const snakeRef = useRef(snake);
  const directionRef = useRef(nextDirection);
  const directionQueue = useRef<string[]>([]);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const currentSnake = snakeRef.current;
      const currentDir = directionQueue.current.length > 0 ? directionQueue.current.shift()! : directionRef.current;
      directionRef.current = currentDir;
      const currentFood = foodRef.current;
      const currentScore = scoreRef.current;

      setDirection(currentDir);
      const head = { ...currentSnake[0] };
      if (currentDir === 'up') head.y -= 20;
      if (currentDir === 'down') head.y += 20;
      if (currentDir === 'left') head.x -= 20;
      if (currentDir === 'right') head.x += 20;

      if (head.x < 0 || head.x >= 300 || head.y < 0 || head.y >= 300 || currentSnake.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        updateGameStats('snake', currentScore, currentScore >= 50);
        playSound('lose', soundEnabled);
        return;
      }

      const newSnake = [head, ...currentSnake];
      if (head.x === currentFood.x && head.y === currentFood.y) {
        setScore(prev => prev + 10);
        const spawned = spawnFood(newSnake);
        setFood(spawned);
        playSound('correct', soundEnabled);
      } else {
        newSnake.pop();
      }
      setSnake(newSnake);
    };

    const timer = setInterval(moveSnake, speed);
    return () => clearInterval(timer);
  }, [gameOver, speed, soundEnabled, updateGameStats, spawnFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 300, 300);

    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < 300; x += 20)
      for (let y = 0; y < 300; y += 20)
        ctx.fillRect(x + 9, y + 9, 2, 2);

    // Snake
    snake.forEach((s, i) => {
      const alpha = 1 - (i / snake.length) * 0.5;
      ctx.fillStyle = i === 0 ? `rgba(34,197,94,${alpha})` : `rgba(22,163,74,${alpha})`;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(s.x + 2, s.y + 2, 16, 16, 4) : ctx.rect(s.x + 2, s.y + 2, 16, 16);
      ctx.fill();

      if (i === 0) {
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(s.x + 6, s.y + 6, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s.x + 14, s.y + 6, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.arc(s.x + 6, s.y + 6, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s.x + 14, s.y + 6, 1.2, 0, Math.PI * 2); ctx.fill();
      }
    });

    // Food
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  const handleSetDir = (dir: string) => {
    const opposite: Record<string, string> = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const lastDir = directionQueue.current.length > 0 
      ? directionQueue.current[directionQueue.current.length - 1] 
      : directionRef.current;
    if (dir !== opposite[lastDir] && dir !== lastDir) {
      directionQueue.current.push(dir);
      setNextDirection(dir);
    }
  };

  if (gameOver) {
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
          💀
        </motion.div>
        <h3 className="text-4xl font-black text-white mb-4 drop-shadow-md">انتهت اللعبة!</h3>
        <p className="text-slate-400 mb-6 text-lg font-medium">الطول النهائي: <strong className="text-violet-400 text-2xl mx-1">{snake.length}</strong></p>
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl mb-10">
          <p className="text-3xl text-emerald-400 font-black">النقاط: {score}</p>
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

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-6 px-6 bg-black/30 p-4 rounded-3xl border border-white/5 shadow-inner"
      >
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">النقاط</span>
          <span className="text-2xl font-black text-emerald-400 drop-shadow-sm">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">الطول</span>
          <span className="text-2xl font-black text-white drop-shadow-sm">{snake.length}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative p-2 bg-slate-900 rounded-[2rem] border-2 border-violet-500/30 shadow-2xl shadow-violet-500/20"
      >
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          className="bg-[#0f172a] rounded-3xl"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3 mt-8"
      >
        <div />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSetDir('up')} className="w-16 h-16 bg-slate-800/80 hover:bg-violet-600 border-2 border-white/5 rounded-2xl flex items-center justify-center transition-colors shadow-lg"><ArrowUp className="w-8 h-8 text-white" /></motion.button>
        <div />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSetDir('left')} className="w-16 h-16 bg-slate-800/80 hover:bg-violet-600 border-2 border-white/5 rounded-2xl flex items-center justify-center transition-colors shadow-lg"><ArrowLeft className="w-8 h-8 text-white" /></motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSetDir('down')} className="w-16 h-16 bg-slate-800/80 hover:bg-violet-600 border-2 border-white/5 rounded-2xl flex items-center justify-center transition-colors shadow-lg"><ArrowDown className="w-8 h-8 text-white" /></motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSetDir('right')} className="w-16 h-16 bg-slate-800/80 hover:bg-violet-600 border-2 border-white/5 rounded-2xl flex items-center justify-center transition-colors shadow-lg"><ArrowRight className="w-8 h-8 text-white" /></motion.button>
      </motion.div>
      
      <p className="text-xs text-slate-500 mt-8 uppercase tracking-widest font-bold bg-black/20 px-4 py-2 rounded-full border border-white/5">⌨️ الأسهم / WASD | 📱 السحب للمس</p>
    </div>
  );
}

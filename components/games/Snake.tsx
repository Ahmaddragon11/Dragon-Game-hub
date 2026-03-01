'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

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
        if (dir !== opposite[direction]) setNextDirection(dir);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const snakeRef = useRef(snake);
  const directionRef = useRef(nextDirection);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { directionRef.current = nextDirection; }, [nextDirection]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const currentSnake = snakeRef.current;
      const currentDir = directionRef.current;
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
    if (dir !== opposite[direction]) setNextDirection(dir);
  };

  if (gameOver) {
    return (
      <div className="text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">💀</div>
        <h3 className="text-3xl font-bold text-slate-100 mb-2">انتهت اللعبة!</h3>
        <p className="text-2xl text-green-400 mb-2 font-medium">النقاط: {score}</p>
        <p className="text-slate-400 mb-8">الطول النهائي: {snake.length}</p>
        <button
          onClick={initGame}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 العب مرة أخرى
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-4 px-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">النقاط</span>
          <span className="text-xl font-bold text-green-400">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">الطول</span>
          <span className="text-xl font-bold text-slate-100">{snake.length}</span>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300} 
        className="bg-slate-950 rounded-2xl border-2 border-violet-500/30 shadow-2xl shadow-violet-500/10"
      />

      <div className="grid grid-cols-3 gap-2 mt-8">
        <div />
        <button onClick={() => handleSetDir('up')} className="w-14 h-14 bg-slate-800 hover:bg-violet-600 border border-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"><ArrowUp className="w-6 h-6" /></button>
        <div />
        <button onClick={() => handleSetDir('left')} className="w-14 h-14 bg-slate-800 hover:bg-violet-600 border border-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"><ArrowLeft className="w-6 h-6" /></button>
        <button onClick={() => handleSetDir('down')} className="w-14 h-14 bg-slate-800 hover:bg-violet-600 border border-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"><ArrowDown className="w-6 h-6" /></button>
        <button onClick={() => handleSetDir('right')} className="w-14 h-14 bg-slate-800 hover:bg-violet-600 border border-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"><ArrowRight className="w-6 h-6" /></button>
      </div>
      
      <p className="text-[10px] text-slate-500 mt-6 uppercase tracking-widest">⌨️ الأسهم / WASD | 📱 السحب للمس</p>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

export function ReactionTime({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [state, setState] = useState<'waiting' | 'ready' | 'early' | 'result'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : difficulty === 'hard' ? 7 : 10;

  const startWaiting = useCallback(() => {
    setState('waiting');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const delay = Math.random() * 3500 + 1500;
    timeoutRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      startWaiting();
      setTimes([]);
      setCurrentRound(0);
      setGameOver(false);
    });
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [startWaiting]);

  const handleClick = () => {
    if (gameOver) return;

    if (state === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState('early');
      playSound('wrong', soundEnabled);
      setTimeout(startWaiting, 1800);
    } else if (state === 'ready') {
      const time = Date.now() - startTime;
      const newTimes = [...times, time];
      setTimes(newTimes);
      setCurrentRound(prev => prev + 1);
      playSound('correct', soundEnabled);

      if (currentRound + 1 >= totalRounds) {
        setGameOver(true);
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        const pts = Math.max(5, 100 - Math.floor(avg / 5));
        updateGameStats('reaction', pts, avg < 350);
        if (avg < 250) {
          playSound('win', soundEnabled);
          confetti();
        }
      } else {
        setState('result');
        setTimeout(startWaiting, 1400);
      }
    }
  };

  if (gameOver) {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const best = Math.min(...times);
    const rating = avg < 200 ? '🚀 أسرع من البرق!' : avg < 280 ? '⚡ ممتاز جداً!' : avg < 350 ? '✅ جيد!' : '👍 تدرّب أكثر';
    const pts = Math.max(5, 100 - Math.floor(avg / 5));

    return (
      <div className="text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">{avg < 250 ? '🚀' : avg < 350 ? '⚡' : '👍'}</div>
        <h3 className="text-3xl font-bold text-slate-100 mb-2">النتائج</h3>
        <p className="text-slate-400 mb-6">{rating}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400 mb-1">{avg}ms</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">متوسط</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{best}ms</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">أفضل</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">{pts}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">نقاط</div>
          </div>
        </div>

        <p className="text-slate-500 text-xs mb-8">الأوقات: {times.join(' | ')}ms</p>
        
        <button
          onClick={() => { setGameOver(false); setTimes([]); setCurrentRound(0); startWaiting(); }}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 العب مرة أخرى
        </button>
      </div>
    );
  }

  const progressPercent = (currentRound / totalRounds) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <span className="text-sm text-slate-400 font-medium">الجولة {currentRound + 1} من {totalRounds}</span>
        <div className="flex-1 mx-8">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div 
        onClick={handleClick}
        className={`w-full aspect-square rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-150 select-none shadow-2xl ${
          state === 'waiting' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' :
          state === 'ready' ? 'bg-green-500 hover:bg-green-400 shadow-green-500/30 scale-105' :
          state === 'early' ? 'bg-amber-500 shadow-amber-500/20' :
          'bg-slate-800 shadow-slate-900/50'
        }`}
      >
        {state === 'waiting' && (
          <>
            <span className="text-6xl mb-4">⏳</span>
            <p className="text-2xl font-bold text-white">انتظر...</p>
            <p className="text-sm text-white/70 mt-2">سيتحول للأخضر</p>
          </>
        )}
        {state === 'ready' && (
          <>
            <span className="text-7xl mb-4">✋</span>
            <p className="text-3xl font-bold text-white">انقر الآن!</p>
          </>
        )}
        {state === 'early' && (
          <>
            <span className="text-6xl mb-4">⚠️</span>
            <p className="text-2xl font-bold text-white">مبكر جداً!</p>
            <p className="text-sm text-white/70 mt-2">انتظر الأخضر</p>
          </>
        )}
        {state === 'result' && (
          <>
            <span className="text-5xl mb-4">⚡</span>
            <p className="text-4xl font-bold text-white">{times[times.length - 1]}ms</p>
            <p className="text-sm text-white/70 mt-4">{times[times.length - 1] < 250 ? 'رائع!' : times[times.length - 1] < 350 ? 'ممتاز!' : 'جيد!'}</p>
          </>
        )}
      </div>
      
      {state === 'waiting' && times.length > 0 && (
        <p className="text-slate-500 text-sm mt-6">آخر محاولة: <strong className="text-violet-400">{times[times.length - 1]}ms</strong></p>
      )}
    </div>
  );
}

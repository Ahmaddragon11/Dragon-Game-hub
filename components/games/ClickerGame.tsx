'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import { Zap, MousePointer2, Clock, Trophy } from 'lucide-react';

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  cps: number; // Clicks per second
  icon: string;
  count: number;
}

export function ClickerGame({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [clicks, setClicks] = useState(0);
  const [cps, setCps] = useState(0);
  
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    { id: 'cursor', name: 'مؤشر تلقائي', cost: 15, cps: 0.5, icon: '👆', count: 0 },
    { id: 'grandma', name: 'جدة مساعدة', cost: 100, cps: 2, icon: '👵', count: 0 },
    { id: 'farm', name: 'مزرعة نقرات', cost: 500, cps: 8, icon: '🚜', count: 0 },
    { id: 'mine', name: 'منجم ذهب', cost: 2000, cps: 20, icon: '⛏️', count: 0 },
    { id: 'factory', name: 'مصنع نقرات', cost: 7000, cps: 50, icon: '🏭', count: 0 },
    { id: 'bank', name: 'بنك مركزي', cost: 20000, cps: 100, icon: '🏦', count: 0 },
    { id: 'temple', name: 'معبد قديم', cost: 100000, cps: 300, icon: '🏛️', count: 0 },
    { id: 'rocket', name: 'صاروخ فضاء', cost: 500000, cps: 1000, icon: '🚀', count: 0 },
  ]);

  // Difficulty multiplier
  const multiplier = difficulty === 'easy' ? 1.5 : difficulty === 'medium' ? 1 : difficulty === 'hard' ? 0.8 : 0.5;

  const handleClick = () => {
    setClicks(prev => prev + 1);
    playSound('click', soundEnabled);
    
    // Visual effect could be added here
    const btn = document.getElementById('click-btn');
    if (btn) {
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = 'scale(1)', 50);
    }
  };

  const buyUpgrade = (id: string) => {
    setUpgrades(prev => prev.map(u => {
      if (u.id === id && clicks >= u.cost) {
        setClicks(c => c - u.cost);
        playSound('correct', soundEnabled);
        return { ...u, count: u.count + 1, cost: Math.floor(u.cost * 1.15) };
      }
      return u;
    }));
  };

  // Auto-click loop
  useEffect(() => {
    const totalCps = upgrades.reduce((acc, u) => acc + (u.cps * u.count), 0) * multiplier;
    Promise.resolve().then(() => setCps(totalCps));

    if (totalCps === 0) return;

    const interval = setInterval(() => {
      setClicks(prev => prev + (totalCps / 10));
    }, 100);

    return () => clearInterval(interval);
  }, [upgrades, multiplier]);

  // Save progress to global stats occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (clicks > 100) {
        // Just updating points, not "winning" per se
        updateGameStats('clicker', Math.floor(clicks / 100), false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [clicks, updateGameStats]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full max-h-[600px] animate-in fade-in duration-300">
      {/* Click Area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-3xl p-8 border border-slate-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 mb-2">
            {Math.floor(clicks).toLocaleString()}
          </h3>
          <p className="text-slate-400 font-medium">نقرة</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/20">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">{cps.toFixed(1)} / ثانية</span>
          </div>
        </div>

        <button
          id="click-btn"
          onClick={handleClick}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_50px_rgba(124,58,237,0.5)] border-4 border-white/20 flex items-center justify-center text-8xl hover:scale-105 active:scale-95 transition-all duration-100 cursor-pointer relative z-10 group"
        >
          <span className="group-hover:animate-bounce">💎</span>
        </button>
      </div>

      {/* Upgrades Shop */}
      <div className="flex-1 bg-slate-800/80 rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800">
          <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-blue-400" />
            المتجر
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {upgrades.map(upgrade => (
            <button
              key={upgrade.id}
              onClick={() => buyUpgrade(upgrade.id)}
              disabled={clicks < upgrade.cost}
              className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all ${
                clicks >= upgrade.cost
                  ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-violet-500/50 cursor-pointer'
                  : 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                {upgrade.icon}
              </div>
              
              <div className="flex-1 text-right">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-200">{upgrade.name}</h4>
                  <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
                    x{upgrade.count}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-emerald-400">+{upgrade.cps} / ث</p>
                  <p className={`text-sm font-bold ${clicks >= upgrade.cost ? 'text-amber-400' : 'text-slate-500'}`}>
                    {upgrade.cost.toLocaleString()} 💎
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

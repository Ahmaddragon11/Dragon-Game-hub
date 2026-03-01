'use client';

import { useAppStore } from './Providers';
import { achievements } from '@/lib/games-data';
import { Star, CheckCircle2, Lock } from 'lucide-react';

export function AchievementsView() {
  const { stats, unlockedAchievements } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">الإنجازات</h2>
            <p className="text-slate-400 text-sm mt-1">
              {unlockedAchievements.length} من {achievements.length} مفتوح
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {achievements.map((a) => {
          const isUnlocked = unlockedAchievements.includes(a.id);
          const progress = a.type === 'games' ? stats.games : a.type === 'wins' ? stats.wins : stats.points;
          const pct = Math.min(100, Math.round((progress / a.target) * 100));

          return (
            <div 
              key={a.id}
              className={`relative p-6 rounded-3xl border transition-all duration-300 ${
                isUnlocked 
                  ? 'bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5 hover:bg-amber-500/10' 
                  : 'bg-slate-800/40 border-slate-700/50 grayscale-[0.5] opacity-70 hover:opacity-100 hover:grayscale-0'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{a.icon}</div>
                {isUnlocked ? (
                  <CheckCircle2 className="w-6 h-6 text-amber-400" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-500" />
                )}
              </div>
              
              <h4 className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-amber-300' : 'text-slate-300'}`}>
                {a.name}
              </h4>
              <p className="text-sm text-slate-400 mb-4">{a.desc}</p>

              {isUnlocked ? (
                <div className="flex items-center gap-2 text-sm text-green-400 font-medium bg-green-500/10 px-3 py-1.5 rounded-lg w-fit">
                  <CheckCircle2 className="w-4 h-4" />
                  مفتوح
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>التقدم</span>
                    <span>{Math.min(progress, a.target)} / {a.target}</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-500 rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

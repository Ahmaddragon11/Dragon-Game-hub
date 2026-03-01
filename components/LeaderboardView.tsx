'use client';

import { useAppStore } from './Providers';
import { games } from '@/lib/games-data';
import { Trophy, Medal } from 'lucide-react';

export function LeaderboardView() {
  const { gameStats } = useAppStore();

  const entries = Object.entries(gameStats).sort((a, b) => b[1].bestScore - a[1].bestScore);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="bg-slate-900/80 border border-violet-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-500/10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">أفضل الألعاب</h2>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">لم تلعب أي لعبة بعد!</h3>
            <p className="text-slate-400">العب ألعاباً لترى إحصائياتك هنا</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(([id, data], i) => {
              const game = games.find(g => g.id === id);
              const winRate = data.plays ? Math.round((data.wins / data.plays) * 100) : 0;
              
              let rankClass = 'bg-slate-800 text-slate-400 border border-slate-700';
              let rankIcon = <span className="text-lg font-bold">{i + 1}</span>;
              
              if (i === 0) {
                rankClass = 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/20';
                rankIcon = <Medal className="w-5 h-5" />;
              } else if (i === 1) {
                rankClass = 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 shadow-lg shadow-slate-400/20';
                rankIcon = <Medal className="w-5 h-5" />;
              } else if (i === 2) {
                rankClass = 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-950 shadow-lg shadow-orange-500/20';
                rankIcon = <Medal className="w-5 h-5" />;
              }

              return (
                <div 
                  key={id}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-violet-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rankClass}`}>
                      {rankIcon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-violet-300 transition-colors">
                        {game ? `${game.icon} ${game.name}` : id}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        {data.plays} مرة لعب • نسبة الفوز: {winRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="text-lg sm:text-xl font-bold text-amber-400">{data.bestScore}</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">أحسن نتيجة</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

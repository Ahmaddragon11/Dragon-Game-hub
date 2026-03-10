'use client';

import { useAppStore } from './Providers';
import { games } from '@/lib/games-data';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'motion/react';

export function LeaderboardView() {
  const { gameStats } = useAppStore();

  const entries = Object.entries(gameStats).sort((a, b) => b[1].bestScore - a[1].bestScore);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-violet-900/20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-white/20">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">أفضل الألعاب</h2>
            <p className="text-sm text-amber-400/80 font-medium mt-1">إحصائياتك وأرقامك القياسية</p>
          </div>
        </motion.div>

        {entries.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-black/20 rounded-3xl border border-white/5"
          >
            <div className="text-7xl mb-6 animate-bounce">🎮</div>
            <h3 className="text-2xl font-black text-white mb-3">لم تلعب أي لعبة بعد!</h3>
            <p className="text-slate-400 text-lg">العب ألعاباً لترى إحصائياتك هنا</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {entries.map(([id, data], i) => {
              const game = games.find(g => g.id === id);
              const winRate = data.plays ? Math.round((data.wins / data.plays) * 100) : 0;
              
              let rankClass = 'bg-slate-800 text-slate-400 border border-slate-700';
              let rankIcon = <span className="text-lg font-bold">{i + 1}</span>;
              
              if (i === 0) {
                rankClass = 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/30 border-white/20';
                rankIcon = <Medal className="w-6 h-6" />;
              } else if (i === 1) {
                rankClass = 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 shadow-lg shadow-slate-400/30 border-white/20';
                rankIcon = <Medal className="w-6 h-6" />;
              } else if (i === 2) {
                rankClass = 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-950 shadow-lg shadow-orange-500/30 border-white/20';
                rankIcon = <Medal className="w-6 h-6" />;
              }

              return (
                <motion.div 
                  variants={itemVariants}
                  key={id}
                  className="group flex items-center justify-between p-5 rounded-2xl bg-black/30 border border-white/5 hover:bg-white/5 hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${rankClass}`}>
                      {rankIcon}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-2">
                        <span className="text-2xl">{game?.icon}</span>
                        {game ? game.name : id}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                          {data.plays} مرة لعب
                        </span>
                        <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                          نسبة الفوز: {winRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center shrink-0 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <div className="text-2xl font-black text-amber-400 drop-shadow-sm">{data.bestScore}</div>
                    <div className="text-[10px] text-amber-400/60 font-bold uppercase tracking-wider mt-0.5">أحسن نتيجة</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useAppStore } from './Providers';
import { achievements } from '@/lib/games-data';
import { Star, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export function AchievementsView() {
  const { stats, unlockedAchievements } = useAppStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-violet-900/20"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 border border-white/20">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">الإنجازات</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full"
                />
              </div>
              <p className="text-violet-300 text-sm font-bold">
                {unlockedAchievements.length} من {achievements.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {achievements.map((a) => {
          const isUnlocked = unlockedAchievements.includes(a.id);
          const progress = a.type === 'games' ? stats.games : a.type === 'wins' ? stats.wins : stats.points;
          const pct = Math.min(100, Math.max(0, (progress / a.target) * 100));

          return (
            <motion.div 
              variants={itemVariants}
              key={a.id}
              className={`group relative p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-1' 
                  : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80 hover:border-white/10'
              }`}
            >
              {isUnlocked && (
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full group-hover:bg-amber-500/30 transition-colors"></div>
              )}
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isUnlocked ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800 border border-white/5 grayscale opacity-50'}`}>
                  {a.icon}
                </div>
                {isUnlocked ? (
                  <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30">
                    <CheckCircle2 className="w-6 h-6 text-amber-400" />
                  </div>
                ) : (
                  <div className="bg-slate-800 p-2 rounded-xl border border-white/5">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                )}
              </div>
              
              <div className="relative z-10">
                <h4 className={`text-xl font-black mb-2 ${isUnlocked ? 'text-amber-300 drop-shadow-sm' : 'text-slate-300'}`}>
                  {a.name}
                </h4>
                <p className={`text-sm mb-6 leading-relaxed ${isUnlocked ? 'text-amber-100/70' : 'text-slate-500'}`}>{a.desc}</p>

                {isUnlocked ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl w-fit shadow-inner">
                    <CheckCircle2 className="w-4 h-4" />
                    تم الفتح بنجاح
                  </div>
                ) : (
                  <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>التقدم</span>
                      <span className="text-slate-300">{Math.min(progress, a.target)} / {a.target}</span>
                    </div>
                    <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-slate-600 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

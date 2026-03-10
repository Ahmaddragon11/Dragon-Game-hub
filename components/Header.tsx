'use client';

import { useAppStore } from './Providers';
import { Home, Trophy, Star, Settings, Gamepad2 } from 'lucide-react';
import type { ViewState } from '@/app/page';
import { motion } from 'motion/react';

interface HeaderProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { playerName, stats } = useAppStore();

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'leaderboard', label: 'المتصدرين', icon: Trophy },
    { id: 'achievements', label: 'الإنجازات', icon: Star },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 border border-white/10">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                Games Hub
              </h1>
              <p className="text-xs text-violet-400 font-medium tracking-wide uppercase">مركز الألعاب المتطور</p>
            </div>
          </motion.div>

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-violet-400' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 shrink-0 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5"
          >
            <div className="flex flex-col items-end px-3 hidden sm:flex">
              <span className="text-sm font-bold text-white">{playerName}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">المستوى {stats.level}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 flex items-center gap-2 border border-white/10">
              <Trophy className="w-4 h-4 text-amber-100" />
              <span className="font-black">{stats.points}</span>
            </div>
          </motion.div>

        </div>
      </div>
    </header>
  );
}

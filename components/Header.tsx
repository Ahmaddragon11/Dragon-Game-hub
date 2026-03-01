'use client';

import { useAppStore } from './Providers';
import { Home, Trophy, Star, Settings, Gamepad2 } from 'lucide-react';
import type { ViewState } from '@/app/page';

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
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-violet-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-br from-violet-400 to-pink-400 bg-clip-text text-transparent">
                Games Hub
              </h1>
              <p className="text-xs text-slate-400">مركز الألعاب المتطور</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-slate-400 hidden sm:inline-block">{playerName}</span>
            <span className="px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              المستوى {stats.level}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold shadow-md shadow-amber-500/20">
              {stats.points} نقطة
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}

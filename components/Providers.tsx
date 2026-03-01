'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSound } from '@/lib/audio';
import { achievements } from '@/lib/games-data';
import confetti from 'canvas-confetti';

interface Stats {
  points: number;
  wins: number;
  games: number;
  level: number;
}

interface GameStat {
  plays: number;
  wins: number;
  totalPoints: number;
  bestScore: number;
}

interface AppState {
  playerName: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  stats: Stats;
  gameStats: Record<string, GameStat>;
  unlockedAchievements: string[];
}

interface AppContextType extends AppState {
  setPlayerName: (name: string) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  updateGameStats: (gameId: string, points: number, won: boolean) => void;
  resetData: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'achievement' | 'info') => void;
}

const defaultState: AppState = {
  playerName: 'اللاعب',
  soundEnabled: false,
  vibrationEnabled: true,
  stats: { points: 0, wins: 0, games: 0, level: 1 },
  gameStats: {},
  unlockedAchievements: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<{id: number, message: string, type: string}[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gameshub_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Promise.resolve().then(() => {
          setState(prev => ({ ...prev, ...parsed }));
          setIsLoaded(true);
        });
      } catch (e) {
        console.error('Failed to parse save data');
        Promise.resolve().then(() => setIsLoaded(true));
      }
    } else {
      Promise.resolve().then(() => setIsLoaded(true));
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gameshub_data', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const addToast = (message: string, type: string = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const checkAchievements = (newStats: Stats, currentUnlocked: string[]) => {
    const newlyUnlocked: string[] = [];
    achievements.forEach(a => {
      if (currentUnlocked.includes(a.id)) return;
      const progress = a.type === 'games' ? newStats.games : a.type === 'wins' ? newStats.wins : newStats.points;
      if (progress >= a.target) {
        newlyUnlocked.push(a.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      setState(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked]
      }));
      
      newlyUnlocked.forEach((id, i) => {
        const a = achievements.find(x => x.id === id);
        if (a) {
          setTimeout(() => {
            addToast(`${a.icon} إنجاز جديد: ${a.name}!`, 'achievement');
            playSound('win', state.soundEnabled);
            if (i === 0) confetti();
          }, i * 800);
        }
      });
    }
  };

  const updateGameStats = (gameId: string, points: number, won: boolean) => {
    setState(prev => {
      const newStats = { ...prev.stats };
      newStats.points += points;
      newStats.games++;
      if (won) newStats.wins++;
      
      const newLevel = Math.floor(newStats.points / 100) + 1;
      if (newLevel > newStats.level) {
        addToast(`🎊 ترقية! وصلت للمستوى ${newLevel}`, 'achievement');
        confetti();
      }
      newStats.level = newLevel;

      const newGameStats = { ...prev.gameStats };
      if (!newGameStats[gameId]) {
        newGameStats[gameId] = { plays: 0, wins: 0, totalPoints: 0, bestScore: 0 };
      }
      newGameStats[gameId].plays++;
      newGameStats[gameId].totalPoints += points;
      if (won) newGameStats[gameId].wins++;
      if (points > newGameStats[gameId].bestScore) {
        newGameStats[gameId].bestScore = points;
      }

      checkAchievements(newStats, prev.unlockedAchievements);

      return {
        ...prev,
        stats: newStats,
        gameStats: newGameStats
      };
    });
  };

  const setPlayerName = (name: string) => setState(prev => ({ ...prev, playerName: name }));
  const toggleSound = () => {
    setState(prev => {
      const newState = !prev.soundEnabled;
      if (newState) playSound('correct', true);
      return { ...prev, soundEnabled: newState };
    });
  };
  const toggleVibration = () => {
    setState(prev => {
      const newState = !prev.vibrationEnabled;
      if (newState && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      return { ...prev, vibrationEnabled: newState };
    });
  };
  const resetData = () => setState(defaultState);

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{ ...state, setPlayerName, toggleSound, toggleVibration, updateGameStats, resetData, addToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            t.type === 'success' ? 'bg-green-500/10 border border-green-500/40 text-green-100' :
            t.type === 'error' ? 'bg-red-500/10 border border-red-500/40 text-red-100' :
            t.type === 'achievement' ? 'bg-amber-500/10 border border-amber-500/50 text-amber-100' :
            'bg-slate-800 border border-violet-500/30 text-slate-100'
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};

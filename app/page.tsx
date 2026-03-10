'use client';

import { useState } from 'react';
import { useAppStore } from '@/components/Providers';
import { Header } from '@/components/Header';
import { HomeView } from '@/components/HomeView';
import { LeaderboardView } from '@/components/LeaderboardView';
import { AchievementsView } from '@/components/AchievementsView';
import { SettingsView } from '@/components/SettingsView';
import { GameView } from '@/components/GameView';
import { AnimatePresence, motion } from 'motion/react';
import { Heart } from 'lucide-react';

export type ViewState = 'home' | 'leaderboard' | 'achievements' | 'settings' | 'game';

export default function Page() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const handleOpenGame = (gameId: string) => {
    setActiveGameId(gameId);
    setCurrentView('game');
  };

  const handleCloseGame = () => {
    setActiveGameId(null);
    setCurrentView('home');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {currentView === 'home' && <HomeView onOpenGame={handleOpenGame} />}
            {currentView === 'leaderboard' && <LeaderboardView />}
            {currentView === 'achievements' && <AchievementsView />}
            {currentView === 'settings' && <SettingsView />}
            {currentView === 'game' && activeGameId && (
              <GameView gameId={activeGameId} onClose={handleCloseGame} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/5 bg-slate-950/50 backdrop-blur-md mt-auto">
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2 font-medium">
          صُنع بحب <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> بواسطة 
          <a 
            href="https://ahmaddragon.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 font-bold transition-colors"
          >
            AHMAD DRAGON
          </a>
        </p>
      </footer>
    </div>
  );
}

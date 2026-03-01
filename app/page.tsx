'use client';

import { useState } from 'react';
import { useAppStore } from '@/components/Providers';
import { Header } from '@/components/Header';
import { HomeView } from '@/components/HomeView';
import { LeaderboardView } from '@/components/LeaderboardView';
import { AchievementsView } from '@/components/AchievementsView';
import { SettingsView } from '@/components/SettingsView';
import { GameView } from '@/components/GameView';

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
    <div className="flex flex-col min-h-screen">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'home' && <HomeView onOpenGame={handleOpenGame} />}
        {currentView === 'leaderboard' && <LeaderboardView />}
        {currentView === 'achievements' && <AchievementsView />}
        {currentView === 'settings' && <SettingsView />}
        {currentView === 'game' && activeGameId && (
          <GameView gameId={activeGameId} onClose={handleCloseGame} />
        )}
      </main>
    </div>
  );
}

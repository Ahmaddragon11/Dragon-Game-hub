'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { createUserProfile, UserProfile } from '@/lib/user-service';
import { useAppStore } from './Providers';
import { LogIn, LogOut, User as UserIcon, Shield } from 'lucide-react';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { setPlayerName, importData } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Create or fetch profile
        const userProfile = await createUserProfile(currentUser);
        setProfile(userProfile);
        setPlayerName(userProfile.displayName || 'اللاعب');
        
        // Sync local state with cloud profile (basic sync)
        if (userProfile.stats) {
          importData({
            stats: {
              points: userProfile.stats.points,
              level: userProfile.stats.level,
              games: userProfile.stats.gamesPlayed,
              wins: userProfile.stats.wins
            },
            // achievements: userProfile.achievements // Need to map format
          });
        }
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, [setPlayerName, importData]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload(); // Simple reload to clear state
  };

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 backdrop-blur-md"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">تسجيل الدخول</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {profile?.isAdmin && (
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs font-bold border border-red-500/20">
          <Shield className="w-3 h-3" />
          Admin
        </div>
      )}
      
      <div className="flex items-center gap-2 bg-slate-800/50 pr-1 pl-3 py-1 rounded-full border border-white/10">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border-2 border-violet-500" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white">
            <UserIcon className="w-4 h-4" />
          </div>
        )}
        <span className="text-sm font-medium text-slate-200 hidden sm:block">
          {user.displayName?.split(' ')[0]}
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all"
        title="تسجيل الخروج"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}

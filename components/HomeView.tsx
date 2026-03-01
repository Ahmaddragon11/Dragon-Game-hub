'use client';

import { useState } from 'react';
import { useAppStore } from './Providers';
import { games, Category } from '@/lib/games-data';
import { Search, Trophy, Gamepad2, Star, Flame, Play, Sparkles } from 'lucide-react';
import { AuthButton } from './AuthButton';

import { CommunityView } from './CommunityView';
import { AdminDashboard } from './AdminDashboard';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface HomeViewProps {
  onOpenGame: (gameId: string) => void;
}

export function HomeView({ onOpenGame }: HomeViewProps) {
  const { playerName, stats, gameStats } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'community' | 'admin'>('all');
  const [user] = useAuthState(auth);
  const isAdmin = user?.email === 'ahmad22dragon113@gmail.com';

  const categories: { id: Category | 'community' | 'admin'; label: string; icon: string }[] = [
    { id: 'all', label: 'الكل', icon: '🎮' },
    { id: 'community', label: 'المجتمع', icon: '🌍' },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'الإدارة', icon: '🛡️' }] : []),
    { id: 'puzzle', label: 'ألغاز', icon: '🧩' },
    { id: 'strategy', label: 'استراتيجية', icon: '♟️' },
    { id: 'trivia', label: 'أسئلة', icon: '📝' },
    { id: 'action', label: 'حركة', icon: '🎯' },
    { id: 'memory', label: 'ذاكرة', icon: '🧠' },
    { id: 'math', label: 'رياضيات', icon: '🔢' },
    { id: 'word', label: 'كلمات', icon: '🔤' },
  ];

  const filteredGames = games.filter(g => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchesSearch = !searchQuery || 
      g.name.includes(searchQuery) || 
      g.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.tags.some(t => t.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const xpInLevel = stats.points % 100;
  const xpNeeded = 100;
  const progressPercent = (xpInLevel / xpNeeded) * 100;

  const bestGameEntry = Object.entries(gameStats).sort((a, b) => b[1].bestScore - a[1].bestScore)[0];
  const bestGame = bestGameEntry ? games.find(g => g.id === bestGameEntry[0]) : null;
  const featuredGame = games.find(g => g.id === 'snake');

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-8 sm:p-12 text-center shadow-2xl shadow-violet-500/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" />
            مرحباً بك في عالم الألعاب
          </div>
          <div className="absolute top-6 left-6 z-20">
            <AuthButton />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            مرحباً <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">{playerName}</span>!
            <br />
            جاهز للتحدي؟
          </h1>
          <p className="text-lg text-white/80 mb-8 font-medium">
            اختر من بين مجموعة متنوعة من الألعاب الكلاسيكية والحديثة، اجمع النقاط، وافتح الإنجازات!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Trophy className="w-5 h-5 text-amber-300" />
              <span className="text-white font-bold">{stats.points} نقطة</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Star className="w-5 h-5 text-amber-300" />
              <span className="text-white font-bold">المستوى {stats.level}</span>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex justify-between text-sm text-white/90 mb-2 font-medium">
              <span>تقدم المستوى</span>
              <span>{xpInLevel}/{xpNeeded} XP</span>
            </div>
            <div className="h-3 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Game */}
      {activeCategory === 'all' && featuredGame && (
        <section className="animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <Gamepad2 className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold text-slate-100">اللعبة المميزة</h2>
          </div>
          <div 
            onClick={() => onOpenGame(featuredGame.id)}
            className="group relative overflow-hidden rounded-3xl bg-slate-800/50 border border-slate-700/50 p-6 sm:p-8 cursor-pointer hover:bg-slate-800 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20 flex flex-col sm:flex-row items-center gap-8"
          >
            <div className="w-32 h-32 shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-6xl shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-500">
              {featuredGame.icon}
            </div>
            <div className="flex-1 text-center sm:text-right">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-3 border border-amber-500/20">
                الأكثر لعباً 🔥
              </div>
              <h3 className="text-3xl font-bold text-slate-100 mb-2">{featuredGame.name}</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto sm:mx-0">{featuredGame.description}</p>
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-600/20">
                <Play className="w-5 h-5" />
                العب الآن
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن لعبة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-slate-800/50 border border-violet-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-slate-800/50 text-slate-300 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content Area */}
      {activeCategory === 'community' ? (
        <CommunityView />
      ) : activeCategory === 'admin' && isAdmin ? (
        <AdminDashboard />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-200 mb-2">لم يتم العثور على ألعاب</h3>
            <p className="text-slate-400">جرب كلمة أخرى أو فلتر مختلف</p>
          </div>
        ) : (
          filteredGames.map((game) => {
            const gs = gameStats[game.id];
            const bestScore = gs ? `🏅 أحسن نتيجة: ${gs.bestScore}` : '';
            const playCount = gs ? `${gs.plays} مرة` : 'جديد';

              return (
              <div 
                key={game.id}
                onClick={() => onOpenGame(game.id)}
                className="group relative bg-slate-800/40 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/5 hover:border-violet-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/20 cursor-pointer flex flex-col h-full"
              >
                {/* Card Header / Icon */}
                <div className="relative h-32 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {game.hasAI && <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/20 backdrop-blur-md">🤖 AI</span>}
                    {game.badge === 'new' && <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 backdrop-blur-md">✨ جديد</span>}
                    {game.badge === 'hot' && <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/20 backdrop-blur-md">🔥 شائع</span>}
                  </div>

                  <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 border-4 border-slate-800 flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 z-10">
                    {game.icon}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 pt-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-100 mb-1 group-hover:text-violet-400 transition-colors">{game.name}</h3>
                  <p className="text-xs text-slate-500 mb-4 font-mono uppercase tracking-wider">{game.nameEn}</p>
                  
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-2 flex-1">
                    {game.description}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 bg-slate-900/50 rounded-xl p-3 mb-4 border border-white/5">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-violet-400">+{game.points}</span>
                      <span>نقطة</span>
                    </div>
                    <div className="w-px h-8 bg-white/5"></div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-300">{gs ? gs.plays : 0}</span>
                      <span>لعب</span>
                    </div>
                    <div className="w-px h-8 bg-white/5"></div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-amber-400">{gs ? gs.bestScore : '-'}</span>
                      <span>أفضل</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {game.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 bg-violet-600/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <button className="px-8 py-3 bg-white text-violet-900 rounded-2xl font-black text-lg shadow-2xl hover:scale-110 transition-transform flex items-center gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    العب الآن
                  </button>
                </div>
              </div>
            );
          })
          )}
        </section>
      )}
    </div>
  );
}

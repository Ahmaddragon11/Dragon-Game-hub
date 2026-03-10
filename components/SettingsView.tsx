'use client';

import { useRef } from 'react';
import { useAppStore } from './Providers';
import { Settings, User, BarChart3, Volume2, Trash2, Code, Send, Vibrate } from 'lucide-react';

export function SettingsView() {
  const { playerName, setPlayerName, stats, gameStats, unlockedAchievements, soundEnabled, toggleSound, vibrationEnabled, toggleVibration, resetData, addToast } = useAppStore();

  const handleSaveName = () => {
    const nameInput = document.getElementById('playerNameInput') as HTMLInputElement;
    const name = nameInput.value.trim() || 'اللاعب';
    setPlayerName(name);
    addToast('✅ تم حفظ الاسم!', 'success');
  };

  const handleReset = () => {
    if (confirm('⚠️ هل أنت متأكد؟\nسيُحذف كل شيء بشكل نهائي!')) {
      resetData();
      addToast('🗑️ تم حذف جميع البيانات', 'info');
    }
  };

  const winRate = stats.games ? Math.round((stats.wins / stats.games) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-500/20">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">الإعدادات</h2>
      </div>

      {/* Profile */}
      <section className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-violet-400" />
          <h3 className="text-xl font-bold text-slate-200">الملف الشخصي</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            id="playerNameInput"
            defaultValue={playerName}
            placeholder="أدخل اسمك"
            maxLength={20}
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
          <button
            onClick={handleSaveName}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/20"
          >
            حفظ
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-bold text-slate-200">الإحصائيات التفصيلية</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">{stats.points}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">نقطة</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400 mb-1">{stats.level}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">مستوى</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.wins}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">فوز</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.games}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">لعبة</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-400 mb-1">{winRate}%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">نسبة الفوز</div>
          </div>
        </div>
      </section>

      {/* Audio & Vibration */}
      <section className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Volume2 className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-bold text-slate-200">التجربة الحسية</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={toggleSound}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${soundEnabled ? 'bg-violet-600' : 'bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-slate-300 font-medium group-hover:text-white transition-colors">تفعيل المؤثرات الصوتية</span>
          </label>

          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={vibrationEnabled}
                onChange={toggleVibration}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${vibrationEnabled ? 'bg-violet-600' : 'bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${vibrationEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-slate-300 font-medium group-hover:text-white transition-colors">تفعيل الاهتزاز (للأجهزة المدعومة)</span>
          </label>
        </div>
      </section>

      {/* Developer Info */}
      <section className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Code className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-slate-200">عن المطور</h3>
        </div>
        <div className="flex flex-col items-center text-center bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 mb-4">
            🐉
          </div>
          <h4 className="text-2xl font-bold text-slate-100 mb-1">AHMAD DRAGON</h4>
          <p className="text-slate-400 text-sm mb-6">مطور ومصمم واجهات الويب. أضع لمساتي الإبداعية في كل كود أكتبه.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://t.me/ahmaddragon"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0088cc]/20 hover:scale-105"
            >
              <Send className="w-5 h-5" />
              تيليجرام
            </a>
            <a
              href="https://ahmaddragon.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:scale-105"
            >
              <Code className="w-5 h-5" />
              موقعي الشخصي
            </a>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-950/20 border border-red-900/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
          <h3 className="text-xl font-bold text-red-400">إعادة التعيين</h3>
        </div>
        <p className="text-red-300/70 text-sm mb-6">تحذير: هذا سيحذف جميع بياناتك وإنجازاتك بشكل نهائي ولا يمكن التراجع عنه!</p>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 hover:text-red-300 font-bold rounded-xl transition-colors"
        >
          حذف جميع البيانات
        </button>
      </section>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { useAppStore } from './Providers';
import { Settings, User, BarChart3, Volume2, Database, Trash2, Download, Upload } from 'lucide-react';

export function SettingsView() {
  const { playerName, setPlayerName, stats, gameStats, unlockedAchievements, soundEnabled, toggleSound, resetData, importData, addToast } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = () => {
    const nameInput = document.getElementById('playerNameInput') as HTMLInputElement;
    const name = nameInput.value.trim() || 'اللاعب';
    setPlayerName(name);
    addToast('✅ تم حفظ الاسم!', 'success');
  };

  const handleExport = () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      stats,
      gameStats,
      achievements: unlockedAchievements,
      playerName,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gameshub-save.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('📤 تم تصدير البيانات!', 'success');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const imported = {
          stats: data.stats || stats,
          gameStats: data.gameStats || gameStats,
          unlockedAchievements: data.achievements || unlockedAchievements,
          playerName: data.playerName || playerName,
        };
        importData(imported);
        addToast('📥 تم الاستيراد بنجاح!', 'success');
      } catch {
        addToast('❌ فشل الاستيراد — تأكد من صحة الملف', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

      {/* Audio */}
      <section className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Volume2 className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-bold text-slate-200">الصوت</h3>
        </div>
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
      </section>

      {/* Data Management */}
      <section className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-slate-200">بيانات اللعبة</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            استيراد
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
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

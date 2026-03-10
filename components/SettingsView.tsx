'use client';

import { useRef } from 'react';
import { useAppStore } from './Providers';
import { Settings, User, BarChart3, Volume2, Trash2, Code, Send, Vibrate } from 'lucide-react';
import { motion } from 'motion/react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-6 pb-20"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-violet-900/20">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-500/30 border border-white/10">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">الإعدادات</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">تخصيص تجربتك في اللعب</p>
        </div>
      </motion.div>

      {/* Profile */}
      <motion.section variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/20">
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white">الملف الشخصي</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            id="playerNameInput"
            defaultValue={playerName}
            placeholder="أدخل اسمك"
            maxLength={20}
            className="flex-1 px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-bold"
          />
          <button
            onClick={handleSaveName}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95"
          >
            حفظ التغييرات
          </button>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/20">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">الإحصائيات التفصيلية</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center hover:bg-white/5 transition-colors">
            <div className="text-3xl font-black text-amber-400 mb-1 drop-shadow-sm">{stats.points}</div>
            <div className="text-[10px] text-amber-400/60 font-bold uppercase tracking-wider">نقطة</div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center hover:bg-white/5 transition-colors">
            <div className="text-3xl font-black text-violet-400 mb-1 drop-shadow-sm">{stats.level}</div>
            <div className="text-[10px] text-violet-400/60 font-bold uppercase tracking-wider">مستوى</div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center hover:bg-white/5 transition-colors">
            <div className="text-3xl font-black text-emerald-400 mb-1 drop-shadow-sm">{stats.wins}</div>
            <div className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-wider">فوز</div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center hover:bg-white/5 transition-colors">
            <div className="text-3xl font-black text-blue-400 mb-1 drop-shadow-sm">{stats.games}</div>
            <div className="text-[10px] text-blue-400/60 font-bold uppercase tracking-wider">لعبة</div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center hover:bg-white/5 transition-colors">
            <div className="text-3xl font-black text-pink-400 mb-1 drop-shadow-sm">{winRate}%</div>
            <div className="text-[10px] text-pink-400/60 font-bold uppercase tracking-wider">نسبة الفوز</div>
          </div>
        </div>
      </motion.section>

      {/* Audio & Vibration */}
      <motion.section variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
            <Volume2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">التجربة الحسية</h3>
        </div>
        <div className="space-y-6">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5 cursor-pointer group hover:bg-white/5 transition-colors">
            <span className="text-slate-300 font-bold group-hover:text-white transition-colors">تفعيل المؤثرات الصوتية</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={toggleSound}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5 cursor-pointer group hover:bg-white/5 transition-colors">
            <span className="text-slate-300 font-bold group-hover:text-white transition-colors">تفعيل الاهتزاز (للأجهزة المدعومة)</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={vibrationEnabled}
                onChange={toggleVibration}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${vibrationEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${vibrationEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
      </motion.section>

      {/* Developer Info */}
      <motion.section variants={itemVariants} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
            <Code className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">عن المطور</h3>
        </div>
        <div className="flex flex-col items-center text-center bg-black/40 rounded-3xl p-8 border border-white/5 relative z-10 shadow-inner">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30 mb-6 border-4 border-slate-900">
            🐉
          </div>
          <h4 className="text-3xl font-black text-white mb-2 tracking-tight">AHMAD DRAGON</h4>
          <p className="text-emerald-400/80 text-sm mb-8 font-medium max-w-md leading-relaxed">مطور ومصمم واجهات الويب. أضع لمساتي الإبداعية في كل كود أكتبه لبناء تجارب مستخدم استثنائية.</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a
              href="https://t.me/ahmaddragon"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#0088cc]/20 hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
              تيليجرام
            </a>
            <a
              href="https://ahmaddragon.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95"
            >
              <Code className="w-5 h-5" />
              موقعي الشخصي
            </a>
          </div>
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section variants={itemVariants} className="bg-red-950/30 backdrop-blur-xl border border-red-900/50 rounded-[2rem] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/20">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-400">منطقة الخطر</h3>
        </div>
        <p className="text-red-300/70 text-sm mb-6 font-medium">تحذير: هذا الإجراء سيحذف جميع بياناتك وإنجازاتك بشكل نهائي ولا يمكن التراجع عنه!</p>
        <button
          onClick={handleReset}
          className="w-full sm:w-auto px-8 py-4 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 hover:text-red-300 font-bold rounded-2xl transition-colors"
        >
          حذف جميع البيانات
        </button>
      </motion.section>
    </motion.div>
  );
}

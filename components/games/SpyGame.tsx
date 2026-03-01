'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

const locations = ['مطعم','مستشفى','مدرسة','سوق','مطار','سينما','فندق','شاطئ','بنك','متحف','حديقة حيوان','ملعب'];
const roles: Record<string, string[]> = {
  'مطعم':       ['زبون','نادل','طباخ','مدير'],
  'مستشفى':     ['طبيب','ممرض','مريض','زائر'],
  'مدرسة':      ['معلم','طالب','مدير','حارس'],
  'سوق':        ['بائع','مشتري','حارس','مندوب'],
  'مطار':       ['مسافر','طيار','ضابط','مضيف'],
  'سينما':      ['مشاهد','موظف','مدير','بائع'],
  'فندق':       ['نزيل','موظف استقبال','عامل نظافة','مدير'],
  'شاطئ':       ['سباح','منقذ','بائع','سائح'],
  'بنك':        ['زبون','موظف','مدير','حارس'],
  'متحف':       ['زائر','مرشد','حارس','مدير'],
  'حديقة حيوان':['زائر','حارس حيوانات','بائع تذاكر','مرشد'],
  'ملعب':       ['لاعب','مدرب','حكم','مشجع'],
};

export function SpyGame({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [location, setLocation] = useState('');
  const [isSpy, setIsSpy] = useState(false);
  const [role, setRole] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [showGuess, setShowGuess] = useState(false);

  const initGame = useCallback(() => {
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const spy = Math.random() < 0.35;
    setLocation(loc);
    setIsSpy(spy);
    setRole(spy ? '🔍 أنت الجاسوس!' : roles[loc][Math.floor(Math.random() * roles[loc].length)]);
    setTimeLeft(difficulty === 'easy' ? 120 : difficulty === 'medium' ? 90 : difficulty === 'hard' ? 60 : 45);
    setGameOver(false);
    setResultMsg('');
    setShowGuess(false);
  }, [difficulty]);

  useEffect(() => {
    Promise.resolve().then(() => initGame());
  }, [initGame]);

  const endGame = useCallback((won: boolean, msg: string) => {
    setGameOver(true);
    setResultMsg(msg);
    updateGameStats('spy', won ? 30 : 0, won);
    if (won) {
      playSound('win', soundEnabled);
      confetti();
    } else {
      playSound('lose', soundEnabled);
    }
  }, [soundEnabled, updateGameStats]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) {
      if (timeLeft <= 0 && !gameOver) {
        Promise.resolve().then(() => endGame(false, '⏰ انتهى الوقت!'));
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, endGame]);

  const handleClaim = (claimedSpy: boolean) => {
    if (claimedSpy === isSpy) {
      endGame(true, claimedSpy ? '🎉 أصبت! أنت فعلاً الجاسوس!' : '🎉 أصبت! لست الجاسوس!');
    } else {
      endGame(false, claimedSpy ? '😔 لستَ الجاسوس!' : '😔 كنتَ الجاسوس!');
    }
  };

  const handleGuess = (guess: string) => {
    if (guess === location) {
      endGame(true, `🎉 أحسنت! المكان هو "${location}"`);
    } else {
      endGame(false, `😔 خطأ! المكان كان "${location}"`);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="bg-slate-800/80 border border-violet-500/30 rounded-3xl p-8 text-center w-full shadow-xl mb-6">
        <div className="text-2xl font-bold text-amber-400 mb-4">{role}</div>
        {!isSpy ? (
          <>
            <div className="text-xl text-green-400 mb-2">📍 المكان: {location}</div>
            <p className="text-slate-400 text-sm">اكتشف من بينكم الجاسوس!</p>
          </>
        ) : (
          <>
            <p className="text-amber-500 font-medium mb-2">⚠️ أنت لا تعرف المكان — خمّنه!</p>
            <p className="text-slate-400 text-sm">اطرح أسئلة ذكية وخمّن الموقع</p>
          </>
        )}
      </div>

      <div className={`text-2xl font-bold px-6 py-2 rounded-xl border mb-6 ${
        timeLeft < 30 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      }`}>
        ⏱️ {formatTime(timeLeft)}
      </div>

      {!gameOver && !showGuess && (
        <div className="flex flex-wrap justify-center gap-3 w-full">
          <button
            onClick={() => handleClaim(false)}
            className="flex-1 min-w-[140px] px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl transition-colors"
          >
            ✅ لست الجاسوس
          </button>
          <button
            onClick={() => handleClaim(true)}
            className="flex-1 min-w-[140px] px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl transition-colors"
          >
            🕵️ أنا الجاسوس!
          </button>
          {isSpy && (
            <button
              onClick={() => setShowGuess(true)}
              className="w-full px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-colors"
            >
              🔍 خمّن المكان
            </button>
          )}
        </div>
      )}

      {!gameOver && showGuess && (
        <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
          <p className="text-slate-400 text-sm text-center mb-4">الأماكن المحتملة:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {locations.map(l => (
              <button
                key={l}
                onClick={() => handleGuess(l)}
                className="px-4 py-2 bg-slate-800 hover:bg-violet-600 border border-slate-700 hover:border-violet-500 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="w-full text-center animate-in zoom-in-95 duration-300">
          <div className={`p-4 rounded-xl mb-6 font-bold text-lg ${
            resultMsg.includes('🎉') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {resultMsg}
          </div>
          <button
            onClick={initGame}
            className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
          >
            🔄 جولة جديدة
          </button>
        </div>
      )}
    </div>
  );
}

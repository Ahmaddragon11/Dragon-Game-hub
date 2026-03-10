'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

const getAiChoice = (history: string[], choices: readonly string[]) => {
  if (history.length >= 3 && Math.random() < 0.5) {
    const freq: Record<string, number> = { rock: 0, paper: 0, scissors: 0 };
    history.forEach(c => freq[c]++);
    const mostLikely = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    const beats: Record<string, string> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
    return beats[mostLikely] as any;
  }
  return choices[Math.floor(Math.random() * 3)];
};

export function RockPaperScissors({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [aiChoice, setAiChoice] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const totalRounds = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : difficulty === 'hard' ? 7 : 10;

  const choices = ['rock', 'paper', 'scissors'] as const;
  const icons: Record<string, string> = { rock: '🪨', paper: '📄', scissors: '✂️' };
  const names: Record<string, string> = { rock: 'حجر', paper: 'ورقة', scissors: 'مقص' };

  const initGame = useCallback(() => {
    setPlayerScore(0);
    setAiScore(0);
    setHistory([]);
    setResult(null);
    setPlayerChoice(null);
    setAiChoice(null);
    setGameOver(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => initGame());
  }, [initGame]);

  const handlePlay = (choice: typeof choices[number]) => {
    if (gameOver || result !== null) return;

    const aiC = getAiChoice(history, choices);

    setPlayerChoice(choice);
    setAiChoice(aiC);

    let res = '';
    if (choice === aiC) {
      res = '🤝 تعادل!';
    } else if (
      (choice === 'rock' && aiC === 'scissors') ||
      (choice === 'paper' && aiC === 'rock') ||
      (choice === 'scissors' && aiC === 'paper')
    ) {
      res = '✅ فزت!';
      setPlayerScore(prev => prev + 1);
      playSound('correct', soundEnabled);
    } else {
      res = '❌ خسرت!';
      setAiScore(prev => prev + 1);
      playSound('wrong', soundEnabled);
    }

    setResult(res);
    setHistory(prev => [...prev, choice]);

    setTimeout(() => {
      if (history.length + 1 >= totalRounds) {
        setGameOver(true);
        const wonGame = playerScore + (res === '✅ فزت!' ? 1 : 0) > aiScore + (res === '❌ خسرت!' ? 1 : 0);
        updateGameStats('rps', wonGame ? (playerScore + (res === '✅ فزت!' ? 1 : 0)) * 12 : 0, wonGame);
        if (wonGame) {
          playSound('win', soundEnabled);
          confetti();
        }
      } else {
        setResult(null);
        setPlayerChoice(null);
        setAiChoice(null);
      }
    }, 1500);
  };

  if (gameOver) {
    const wonGame = playerScore > aiScore;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center bg-black/40 p-10 rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="text-7xl mb-6 drop-shadow-xl"
        >
          {wonGame ? '🏆' : playerScore === aiScore ? '🤝' : '😔'}
        </motion.div>
        <h3 className="text-4xl font-black text-white mb-4 drop-shadow-md">{wonGame ? 'فزت!' : playerScore === aiScore ? 'تعادل!' : 'خسرت!'}</h3>
        <p className="text-3xl mt-2 font-black text-slate-300 tracking-widest">{playerScore} - {aiScore}</p>
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl mt-8 mb-10">
          <p className="text-3xl text-emerald-400 font-black">النقاط: {wonGame ? playerScore * 12 : 0}</p>
        </div>
        <br />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={initGame}
          className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 flex items-center gap-3 border border-white/20 mx-auto"
        >
          <span className="text-2xl">🔄</span> العب مرة أخرى
        </motion.button>
      </motion.div>
    );
  }

  const progressPercent = (history.length / totalRounds) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center mb-10 px-6 bg-black/30 p-4 rounded-3xl border border-white/5 shadow-inner"
      >
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">أنت</span>
          <span className="text-3xl font-black text-emerald-400 drop-shadow-sm">{playerScore}</span>
        </div>
        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">
            <span>الجولة {history.length + 1} من {totalRounds}</span>
            <span className="text-violet-400">{totalRounds - history.length} متبقي</span>
          </div>
          <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">الذكاء</span>
          <span className="text-3xl font-black text-red-500 drop-shadow-sm">{aiScore}</span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {playerChoice && aiChoice ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center bg-black/40 p-8 rounded-[2rem] border border-white/10 shadow-2xl w-full"
          >
            <div className="flex gap-8 items-center mb-8 w-full justify-center">
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <div className="text-7xl sm:text-8xl mb-3 drop-shadow-xl">{icons[playerChoice]}</div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{names[playerChoice]}</span>
              </motion.div>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                className="text-3xl font-black text-slate-600 italic"
              >
                VS
              </motion.div>
              
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <div className="text-7xl sm:text-8xl mb-3 drop-shadow-xl">{icons[aiChoice]}</div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{names[aiChoice]}</span>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-4xl font-black drop-shadow-md px-8 py-3 rounded-2xl ${
                result?.includes('فزت') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                result?.includes('خسرت') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {result}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="choices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-4 sm:gap-6 justify-center w-full"
          >
            {choices.map((choice, i) => (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.1, y: -10 }}
                whileTap={{ scale: 0.9 }}
                key={choice}
                onClick={() => handlePlay(choice)}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white/10 hover:border-violet-500/50 flex flex-col items-center justify-center transition-colors shadow-xl shadow-black/50 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-5xl sm:text-6xl mb-3 drop-shadow-lg relative z-10">{icons[choice]}</span>
                <span className="text-sm text-slate-300 font-bold relative z-10">{names[choice]}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

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
      <div className="text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">{wonGame ? '🏆' : playerScore === aiScore ? '🤝' : '😔'}</div>
        <h3 className="text-3xl font-bold text-slate-100 mb-2">{wonGame ? 'فزت!' : playerScore === aiScore ? 'تعادل!' : 'خسرت!'}</h3>
        <p className="text-2xl mt-1 font-bold text-slate-300">{playerScore} - {aiScore}</p>
        <p className="text-xl text-green-400 mt-4 font-medium">النقاط: {wonGame ? playerScore * 12 : 0}</p>
        <button
          onClick={initGame}
          className="mt-8 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 العب مرة أخرى
        </button>
      </div>
    );
  }

  const progressPercent = (history.length / totalRounds) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">أنت</span>
          <span className="text-2xl font-bold text-green-400">{playerScore}</span>
        </div>
        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>الجولة {history.length + 1} من {totalRounds}</span>
            <span>{totalRounds - history.length} متبقي</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">الذكاء</span>
          <span className="text-2xl font-bold text-red-400">{aiScore}</span>
        </div>
      </div>

      {playerChoice && aiChoice ? (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="flex gap-8 items-center mb-6">
            <div className="flex flex-col items-center">
              <div className="text-6xl sm:text-7xl mb-2">{icons[playerChoice]}</div>
              <span className="text-xs text-slate-500">{names[playerChoice]}</span>
            </div>
            <div className="text-2xl font-bold text-slate-600">VS</div>
            <div className="flex flex-col items-center">
              <div className="text-6xl sm:text-7xl mb-2">{icons[aiChoice]}</div>
              <span className="text-xs text-slate-500">{names[aiChoice]}</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100">{result}</p>
        </div>
      ) : (
        <div className="flex gap-4 sm:gap-6 justify-center w-full">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handlePlay(choice)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-800/50 border-2 border-violet-500/20 hover:border-violet-500/60 hover:bg-slate-800 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-500/20 group"
            >
              <span className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform">{icons[choice]}</span>
              <span className="text-xs text-slate-400 font-bold">{names[choice]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

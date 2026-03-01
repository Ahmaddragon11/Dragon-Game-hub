'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';
import { wordList } from '@/lib/game-content';

const ARABIC_ALPHABET = 'ابتثجحخدذرزسشصضطظعغفقكلمنهويأإآةىؤئ'.split('');
const MAX_MISTAKES = 6;

export function Hangman({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    Promise.resolve().then(() => {
      setWord(randomWord);
      setGuessedLetters(new Set());
      setMistakes(0);
      setGameOver(false);
      setWon(false);
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleGuess = useCallback((letter: string) => {
    if (gameOver || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      playSound('wrong', soundEnabled);

      if (newMistakes >= MAX_MISTAKES) {
        setGameOver(true);
        setWon(false);
        playSound('lose', soundEnabled);
        updateGameStats('hangman', 10, false);
      }
    } else {
      playSound('click', soundEnabled);
      const isWon = word.split('').every(char => newGuessed.has(char) || char === ' ');
      if (isWon) {
        setGameOver(true);
        setWon(true);
        playSound('win', soundEnabled);
        confetti();
        updateGameStats('hangman', 50, true);
      }
    }
  }, [word, guessedLetters, mistakes, gameOver, soundEnabled, updateGameStats]);

  const renderHangman = () => {
    const parts = [
      <circle key="head" cx="150" cy="50" r="20" stroke="white" strokeWidth="4" fill="none" />,
      <line key="body" x1="150" y1="70" x2="150" y2="130" stroke="white" strokeWidth="4" />,
      <line key="armL" x1="150" y1="90" x2="120" y2="120" stroke="white" strokeWidth="4" />,
      <line key="armR" x1="150" y1="90" x2="180" y2="120" stroke="white" strokeWidth="4" />,
      <line key="legL" x1="150" y1="130" x2="120" y2="170" stroke="white" strokeWidth="4" />,
      <line key="legR" x1="150" y1="130" x2="180" y2="170" stroke="white" strokeWidth="4" />,
    ];

    return (
      <svg width="200" height="220" className="mb-8">
        {/* Gallows */}
        <line x1="20" y1="200" x2="100" y2="200" stroke="#64748b" strokeWidth="8" />
        <line x1="60" y1="200" x2="60" y2="20" stroke="#64748b" strokeWidth="8" />
        <line x1="60" y1="20" x2="150" y2="20" stroke="#64748b" strokeWidth="8" />
        <line x1="150" y1="20" x2="150" y2="30" stroke="#64748b" strokeWidth="4" />
        {/* Hangman Parts */}
        {parts.slice(0, mistakes)}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h3 className="text-2xl font-bold text-slate-100">الجلاد</h3>
        <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
          <span className="text-sm font-bold text-slate-300">الأخطاء: </span>
          <span className="text-lg font-black text-red-400">{mistakes} / {MAX_MISTAKES}</span>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-2xl w-full flex flex-col items-center relative">
        {renderHangman()}

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10" dir="ltr">
          {word.split('').map((char, index) => (
            <div 
              key={index} 
              className={`w-10 h-12 sm:w-14 sm:h-16 border-b-4 flex items-center justify-center text-3xl sm:text-4xl font-black transition-all ${
                char === ' ' ? 'border-transparent' : 'border-slate-500'
              } ${guessedLetters.has(char) || gameOver ? 'text-white' : 'text-transparent'}`}
            >
              {char}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-lg" dir="rtl">
          {ARABIC_ALPHABET.map(letter => {
            const isGuessed = guessedLetters.has(letter);
            const isCorrect = word.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isGuessed || gameOver}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-lg sm:text-xl font-bold transition-all ${
                  isGuessed
                    ? isCorrect
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-red-500/20 text-red-400 border border-red-500/50 opacity-50'
                    : 'bg-slate-800 text-slate-200 hover:bg-violet-600 hover:text-white border border-slate-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-10">
            <div className="text-6xl mb-4">{won ? '🏆' : '💀'}</div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {won ? 'لقد نجوت!' : 'لقد تم شنقك!'}
            </h3>
            <p className="text-slate-300 mb-8 text-lg">
              الكلمة كانت: <strong className="text-violet-400 text-2xl">{word}</strong>
            </p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
            >
              🔄 العب مرة أخرى
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

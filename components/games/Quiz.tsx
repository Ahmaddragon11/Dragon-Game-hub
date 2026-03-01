'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../Providers';
import { playSound } from '@/lib/audio';
import type { Difficulty } from '../GameView';
import confetti from 'canvas-confetti';

const quizQuestions = [
  { q:'ما هي عاصمة المملكة العربية السعودية؟', options:['جدة','الرياض','مكة المكرمة','الدمام'], answer:1 },
  { q:'كم عدد أيام الأسبوع؟', options:['5','6','7','8'], answer:2 },
  { q:'ما هو أكبر كوكب في المجموعة الشمسية؟', options:['الأرض','المريخ','المشتري','زحل'], answer:2 },
  { q:'كم عدد أحرف اللغة العربية؟', options:['26','28','30','32'], answer:1 },
  { q:'ما هي أصغر دولة في العالم؟', options:['موناكو','الفاتيكان','سان مارينو','مالطا'], answer:1 },
  { q:'في أي عام هبط أول إنسان على القمر؟', options:['1965','1969','1972','1975'], answer:1 },
  { q:'ما هو العنصر الكيميائي الذي رمزه Au؟', options:['الفضة','الذهب','النحاس','الحديد'], answer:1 },
  { q:'ما هو أطول نهر في العالم؟', options:['الأمازون','النيل','المسيسيبي','اليانغتسي'], answer:1 },
  { q:'كم عدد كواكب المجموعة الشمسية؟', options:['7','8','9','10'], answer:1 },
  { q:'ما هي أكبر قارة في العالم؟', options:['إفريقيا','أمريكا الشمالية','آسيا','أوروبا'], answer:2 },
  { q:'من هو مخترع المصباح الكهربائي؟', options:['نيوتن','إديسون','تسلا','فولتا'], answer:1 },
  { q:'ما هي لغة البرمجة التي طوّرها جيمس غوسلينج؟', options:['Python','C++','Java','JavaScript'], answer:2 },
  { q:'ما عاصمة اليابان؟', options:['كيوتو','أوساكا','طوكيو','سيول'], answer:2 },
  { q:'كم عدد أضلاع المربع؟', options:['3','4','5','6'], answer:1 },
  { q:'ما هي أسرع حيوان بري في العالم؟', options:['الأسد','النمر','الفهد','الذئب'], answer:2 },
  { q:'ما هو رقم باي (π) تقريباً؟', options:['2.14','3.14','4.14','3.41'], answer:1 },
  { q:'في أي دولة بُنيت برج إيفل؟', options:['إيطاليا','بريطانيا','فرنسا','ألمانيا'], answer:2 },
  { q:'ما هو أعمق محيط في العالم؟', options:['الأطلسي','الهادي','الهندي','المتجمد'], answer:1 },
  { q:'ما هو الرمز الكيميائي للماء؟', options:['O2','CO2','H2O','NaCl'], answer:2 },
  { q:'كم عدد ألوان قوس قزح؟', options:['5','6','7','8'], answer:2 },
];

export function Quiz({ difficulty }: { difficulty: Difficulty }) {
  const { soundEnabled, updateGameStats } = useAppStore();
  const [questions, setQuestions] = useState<typeof quizQuestions>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const initGame = useCallback(() => {
    const numQ = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, numQ);
    setQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(difficulty === 'easy' ? 30 : difficulty === 'medium' ? 22 : difficulty === 'hard' ? 15 : 10);
    setGameOver(false);
    setSelectedAnswer(null);
  }, [difficulty]);

  useEffect(() => {
    Promise.resolve().then(() => initGame());
  }, [initGame]);

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null || gameOver) return;
    
    setSelectedAnswer(index);
    const q = questions[currentQ];
    const isCorrect = index === q.answer;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      const pts = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : difficulty === 'hard' ? 35 : 55;
      setScore(prev => prev + pts);
      playSound('correct', soundEnabled);
    } else {
      playSound('wrong', soundEnabled);
    }

    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setGameOver(true);
        const percent = Math.round((correctCount + (isCorrect ? 1 : 0)) / questions.length * 100);
        updateGameStats('quiz', score + (isCorrect ? (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : difficulty === 'hard' ? 35 : 55) : 0), percent >= 50);
        if (percent >= 80) {
          playSound('win', soundEnabled);
          confetti();
        }
      } else {
        setCurrentQ(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(difficulty === 'easy' ? 30 : difficulty === 'medium' ? 22 : difficulty === 'hard' ? 15 : 10);
      }
    }, 1200);
  }, [selectedAnswer, gameOver, questions, currentQ, difficulty, score, soundEnabled, correctCount, updateGameStats]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0 || selectedAnswer !== null) {
      if (timeLeft <= 0 && !gameOver && selectedAnswer === null) {
        Promise.resolve().then(() => handleAnswer(-1)); // Timeout
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, selectedAnswer, handleAnswer]);

  if (questions.length === 0) return null;

  if (gameOver) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">{percent >= 80 ? '🏆' : percent >= 50 ? '🎉' : '😔'}</div>
        <h3 className="text-3xl font-bold text-slate-100 mb-2">{percent >= 80 ? 'ممتاز!' : percent >= 50 ? 'جيد!' : 'حظ أوفر!'}</h3>
        <p className="text-slate-400 mb-4">أجبت على <strong className="text-violet-400">{correctCount}</strong> من <strong className="text-violet-400">{questions.length}</strong> بشكل صحيح</p>
        <div className="text-4xl font-bold text-amber-400 mb-2">{percent}%</div>
        <p className="text-xl text-green-400 mb-8 font-medium">النقاط المكتسبة: {score}</p>
        <button
          onClick={initGame}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-105"
        >
          🔄 جولة جديدة
        </button>
      </div>
    );
  }

  const q = questions[currentQ];
  const progress = Math.round((currentQ / questions.length) * 100);

  return (
    <div className="flex flex-col items-center w-full max-w-lg animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center mb-4 text-sm font-medium">
        <span className="text-slate-400">السؤال {currentQ + 1}/{questions.length}</span>
        <span className={`px-3 py-1 rounded-lg border ${
          timeLeft < 8 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
        }`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="w-full bg-slate-800/80 border border-violet-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-xl mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-relaxed">{q.q}</h3>
      </div>

      <div className="w-full grid gap-3 sm:gap-4">
        {q.options.map((opt, i) => {
          let btnClass = 'bg-slate-800/50 hover:bg-slate-700 border-slate-700 text-slate-200';
          if (selectedAnswer !== null) {
            if (i === q.answer) {
              btnClass = 'bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/20';
            } else if (i === selectedAnswer) {
              btnClass = 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20';
            } else {
              btnClass = 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selectedAnswer !== null}
              className={`w-full text-right px-6 py-4 rounded-2xl border-2 font-medium transition-all duration-300 ${btnClass} ${selectedAnswer === null ? 'hover:-translate-y-1 hover:border-violet-500/50' : ''}`}
            >
              <span className="inline-block w-8 text-slate-500 font-bold opacity-70">
                {String.fromCharCode(0x0660 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

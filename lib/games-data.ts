export type Category = 'all' | 'puzzle' | 'strategy' | 'trivia' | 'action' | 'memory' | 'math' | 'word';

export interface Game {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  category: Category;
  hasAI: boolean;
  description: string;
  tags: string[];
  points: number;
  badge?: 'ai' | 'new' | 'hot';
}

export const games: Game[] = [
  { id:'tictactoe', name:'تيك تاك تو', nameEn:'Tic Tac Toe', icon:'⭕', category:'strategy', hasAI:true,  description:'اللعبة الكلاسيكية X وO ضد ذكاء اصطناعي متطور', tags:['كلاسيكي','استراتيجية','AI'], points:50, badge:'ai' },
  { id:'guessnumber', name:'تخمين الرقم', nameEn:'Guess the Number', icon:'🔢', category:'puzzle', hasAI:false, description:'اكتشف الرقم المخفي بأقل عدد من المحاولات', tags:['أرقام','منطق'], points:30 },
  { id:'quiz', name:'لعبة الأسئلة', nameEn:'Quiz Game', icon:'📝', category:'trivia', hasAI:false, description:'اختبر معلوماتك العامة بأسئلة متنوعة وشيّقة', tags:['ثقافة','معرفة'], points:50 },
  { id:'math', name:'تحدي الرياضيات', nameEn:'Math Challenge', icon:'🧮', category:'math', hasAI:false, description:'حل المسائل الرياضية بأسرع ما يمكن', tags:['رياضيات','سرعة'], points:60 },
  { id:'memory', name:'لعبة الذاكرة', nameEn:'Memory Game', icon:'🧠', category:'memory', hasAI:false, description:'طابق أزواج البطاقات لاختبار ذاكرتك القوية', tags:['ذاكرة','بطاقات'], points:80 },
  { id:'snake', name:'الثعبان', nameEn:'Snake', icon:'🐍', category:'action', hasAI:false, description:'لعبة الثعبان الكلاسيكية — كُل الطعام واكبر!', tags:['كلاسيكي','آركيد'], points:100, badge:'hot' },
  { id:'rps', name:'حجر ورقة مقص', nameEn:'Rock Paper Scissors', icon:'✂️', category:'strategy', hasAI:true,  description:'تحدَّ الذكاء الاصطناعي في أشهر لعبة بالعالم', tags:['كلاسيكي','سريع'], points:30 },
  { id:'wordscramble', name:'ترتيب الحروف', nameEn:'Word Scramble', icon:'🔤', category:'word', hasAI:false, description:'رتّب الحروف المبعثرة لتكوين الكلمة الصحيحة', tags:['كلمات','لغة'], points:50 },
  { id:'reaction', name:'سرعة الاستجابة', nameEn:'Reaction Time', icon:'⚡', category:'action', hasAI:false, description:'اضغط عند رؤية اللون الأخضر — كن الأسرع!', tags:['سرعة','ردود فعل'], points:40, badge:'new' },
  { id:'2048', name:'2048', nameEn:'2048', icon:'🧩', category:'puzzle', hasAI:false, description:'اجمع الأرقام المتشابهة للوصول إلى الرقم 2048', tags:['أرقام','ذكاء'], points:100, badge:'hot' },
  { id:'connectfour', name:'أربعة في صف', nameEn:'Connect Four', icon:'🔴', category:'strategy', hasAI:true, description:'قم بتوصيل 4 أقراص من لونك في صف واحد قبل خصمك', tags:['كلاسيكي','استراتيجية'], points:60, badge:'new' },
  { id:'hangman', name:'الجلاد', nameEn:'Hangman', icon:'🪢', category:'word', hasAI:false, description:'خمن الكلمة المخفية قبل اكتمال المشنقة', tags:['كلمات','كلاسيكي'], points:50, badge:'new' },
  { id:'clicker', name:'جامع الجواهر', nameEn:'Gem Clicker', icon:'💎', category:'action', hasAI:false, description:'اجمع الجواهر وطور معداتك لتصبح الأغنى!', tags:['نقرات','تطوير'], points:10, badge:'hot' },
];

export const achievements = [
  { id:'first_game',   name:'الخطوة الأولى',   desc:'العب لعبتك الأولى',      icon:'🎮', type:'games',  target:1 },
  { id:'five_games',   name:'مستكشف',          desc:'العب 5 ألعاب مختلفة',    icon:'🧭', type:'games',  target:5 },
  { id:'ten_games',    name:'على الطريق',       desc:'العب 10 ألعاب',          icon:'🎯', type:'games',  target:10 },
  { id:'fifty_games',  name:'شغوف الألعاب',    desc:'العب 50 لعبة',           icon:'🕹️', type:'games',  target:50 },
  { id:'hundred_games',name:'مدمن ألعاب',      desc:'العب 100 لعبة',          icon:'🎰', type:'games',  target:100 },
  
  { id:'first_win',    name:'الفائز',           desc:'افز في لعبتك الأولى',    icon:'🥇', type:'wins',   target:1 },
  { id:'five_wins',    name:'محترف',            desc:'افز في 5 ألعاب',         icon:'🎖️', type:'wins',   target:5 },
  { id:'ten_wins',     name:'البطل',            desc:'افز في 10 ألعاب',        icon:'🏆', type:'wins',   target:10 },
  { id:'twenty_wins',  name:'الأسطورة',         desc:'افز في 20 لعبة',         icon:'👑', type:'wins',   target:20 },
  { id:'fifty_wins',   name:'لا يقهر',          desc:'افز في 50 لعبة',         icon:'🔥', type:'wins',   target:50 },

  { id:'points_100',   name:'جامع النقاط',      desc:'اجمع 100 نقطة',          icon:'💰', type:'points', target:100 },
  { id:'points_500',   name:'سيد النقاط',       desc:'اجمع 500 نقطة',          icon:'🏅', type:'points', target:500 },
  { id:'points_1000',  name:'الإمبراطور',       desc:'اجمع 1000 نقطة',         icon:'💎', type:'points', target:1000 },
  { id:'points_5000',  name:'المليونير',        desc:'اجمع 5000 نقطة',         icon:'🏦', type:'points', target:5000 },
  { id:'points_10000', name:'أسطورة النقاط',    desc:'اجمع 10000 نقطة',        icon:'🌌', type:'points', target:10000 },

  { id:'clicker_novice', name:'ناقر مبتدئ',     desc:'اجمع 1000 جوهرة في الكليكر', icon:'👆', type:'points', target:1000 }, // Custom logic needed for specific games later
  { id:'clicker_master', name:'ناقر محترف',     desc:'اجمع 10000 جوهرة في الكليكر', icon:'⚡', type:'points', target:10000 },
];

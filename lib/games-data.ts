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
  { id:'spy', name:'من الجاسوس؟', nameEn:'Who is the Spy?', icon:'🕵️', category:'puzzle', hasAI:true,  description:'هل أنت الجاسوس أم المواطن؟ اكتشف المكان أو أخفِ هويتك', tags:['اجتماعية','استنتاج'], points:40 },
  { id:'quiz', name:'لعبة الأسئلة', nameEn:'Quiz Game', icon:'📝', category:'trivia', hasAI:false, description:'اختبر معلوماتك العامة بأسئلة متنوعة وشيّقة', tags:['ثقافة','معرفة'], points:50 },
  { id:'math', name:'تحدي الرياضيات', nameEn:'Math Challenge', icon:'🧮', category:'math', hasAI:false, description:'حل المسائل الرياضية بأسرع ما يمكن', tags:['رياضيات','سرعة'], points:60 },
  { id:'memory', name:'لعبة الذاكرة', nameEn:'Memory Game', icon:'🧠', category:'memory', hasAI:false, description:'طابق أزواج البطاقات لاختبار ذاكرتك القوية', tags:['ذاكرة','بطاقات'], points:80 },
  { id:'snake', name:'الثعبان', nameEn:'Snake', icon:'🐍', category:'action', hasAI:false, description:'لعبة الثعبان الكلاسيكية — كُل الطعام واكبر!', tags:['كلاسيكي','آركيد'], points:100, badge:'hot' },
  { id:'rps', name:'حجر ورقة مقص', nameEn:'Rock Paper Scissors', icon:'✂️', category:'strategy', hasAI:true,  description:'تحدَّ الذكاء الاصطناعي في أشهر لعبة بالعالم', tags:['كلاسيكي','سريع'], points:30 },
  { id:'wordscramble', name:'ترتيب الحروف', nameEn:'Word Scramble', icon:'🔤', category:'word', hasAI:false, description:'رتّب الحروف المبعثرة لتكوين الكلمة الصحيحة', tags:['كلمات','لغة'], points:50 },
  { id:'reaction', name:'سرعة الاستجابة', nameEn:'Reaction Time', icon:'⚡', category:'action', hasAI:false, description:'اضغط عند رؤية اللون الأخضر — كن الأسرع!', tags:['سرعة','ردود فعل'], points:40, badge:'new' },
];

export const achievements = [
  { id:'first_game',   name:'الخطوة الأولى',   desc:'العب لعبتك الأولى',      icon:'🎮', type:'games',  target:1 },
  { id:'ten_games',    name:'على الطريق',       desc:'العب 10 ألعاب',          icon:'🎯', type:'games',  target:10 },
  { id:'fifty_games',  name:'شغوف الألعاب',    desc:'العب 50 لعبة',           icon:'🕹️', type:'games',  target:50 },
  { id:'first_win',    name:'الفائز',           desc:'افز في لعبتك الأولى',    icon:'🥇', type:'wins',   target:1 },
  { id:'ten_wins',     name:'البطل',            desc:'افز في 10 ألعاب',        icon:'🎖️', type:'wins',   target:10 },
  { id:'twenty_wins',  name:'الأسطورة',         desc:'افز في 20 لعبة',         icon:'👑', type:'wins',   target:20 },
  { id:'points_100',   name:'جامع النقاط',      desc:'اجمع 100 نقطة',          icon:'💰', type:'points', target:100 },
  { id:'points_500',   name:'سيد النقاط',       desc:'اجمع 500 نقطة',          icon:'🏅', type:'points', target:500 },
  { id:'points_1000',  name:'الإمبراطور',       desc:'اجمع 1000 نقطة',         icon:'💎', type:'points', target:1000 },
];

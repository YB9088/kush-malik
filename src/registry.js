// ════════════════════════════════════════════════════════════════
//  كوش ملك — سجل الألعاب (Game Registry)
//  لإضافة لعبة جديدة: أنشئ ملف اللعبة في games/، ثم أضف سطراً واحداً
//  هنا. المدينة (الواجهة) ستكتشفها وتعرضها تلقائياً. هذا كل شيء.
// ════════════════════════════════════════════════════════════════
import Ludo from './games/classic/Ludo.jsx';
import Snake from './games/classic/Snake.jsx';
import TicTacToe from './games/classic/TicTacToe.jsx';
import Memory from './games/classic/Memory.jsx';
import Game2048 from './games/classic/Game2048.jsx';
import FlappyKush from './games/classic/FlappyKush.jsx';
import Breakout from './games/classic/Breakout.jsx';
import WhackMole from './games/classic/WhackMole.jsx';

import QuizGame from './games/puzzle/QuizGame.jsx';
import Hangman from './games/puzzle/Hangman.jsx';
import RPS from './games/puzzle/RPS.jsx';
import Simon from './games/puzzle/Simon.jsx';
import SlidePuzzle from './games/puzzle/SlidePuzzle.jsx';
import Reaction from './games/puzzle/Reaction.jsx';
import { SUDAN_QUIZ, GENERAL_QUIZ } from './games/puzzle/quizData.js';

import StoryReader from './games/stories/StoryReader.jsx';
import { STORY_LION, STORY_FOLK, STORY_KIDS } from './games/stories/storyData.js';

import Jokes from './games/comedy/Jokes.jsx';
import SpinWheel from './games/comedy/SpinWheel.jsx';
import GuessNumber from './games/comedy/GuessNumber.jsx';

export const CATEGORIES = [
  { id: 'classic', title: 'ألعاب كلاسيكية', sub: 'متعة لا تنتهي', emoji: '🕹️', color: 'var(--c-classic)', color2: 'var(--c-classic2)' },
  { id: 'puzzle',  title: 'ألغاز وذكاء',    sub: 'حدِّ عقلك',     emoji: '🧠', color: 'var(--c-puzzle)',  color2: 'var(--c-puzzle2)' },
  { id: 'stories', title: 'قصص وحكايات',    sub: 'للصغار والكبار', emoji: '📖', color: 'var(--c-story)',   color2: 'var(--c-story2)' },
  { id: 'comedy',  title: 'كوميديا ومرح',   sub: 'اضحك من قلبك',  emoji: '😂', color: 'var(--c-comedy)',  color2: 'var(--c-comedy2)' },
];

export const GAMES = [
  // ── كلاسيكية ──
  { id: 'ludo',     title: 'لودو ملك',    emoji: '🎲', cat: 'classic', tag: '٤ لاعبين', isNew: true,  Component: Ludo },
  { id: 'snake',    title: 'الثعبان',     emoji: '🐍', cat: 'classic', tag: 'كلاسيكية', isNew: true,  Component: Snake },
  { id: 'xo',       title: 'إكس أو',      emoji: '⭕', cat: 'classic', tag: 'لاعبان',   Component: TicTacToe },
  { id: 'memory',   title: 'الذاكرة',     emoji: '🃏', cat: 'classic', tag: 'تركيز',    Component: Memory },
  { id: '2048',     title: '٢٠٤٨',        emoji: '🔢', cat: 'classic', tag: 'أرقام',    Component: Game2048 },
  { id: 'flappy',   title: 'طائر كوش',    emoji: '🐦', cat: 'classic', tag: 'سرعة',     isNew: true, Component: FlappyKush },
  { id: 'breakout', title: 'كسر الطوب',   emoji: '🧱', cat: 'classic', tag: 'تصويب',    Component: Breakout },
  { id: 'whack',    title: 'اضرب الخلد',  emoji: '🔨', cat: 'classic', tag: 'تسلية',    Component: WhackMole },

  // ── ألغاز وذكاء ──
  { id: 'quiz-sudan',   title: 'تحدّي سوداني', emoji: '🇸🇩', cat: 'puzzle', tag: 'سودان', isNew: true,
    Component: QuizGame, props: { data: SUDAN_QUIZ, gameId: 'quiz-sudan', title: 'تحدّي سوداني', accent: 'var(--c-puzzle)' } },
  { id: 'quiz-general', title: 'معلومات عامة', emoji: '🌍', cat: 'puzzle', tag: 'ثقافة',
    Component: QuizGame, props: { data: GENERAL_QUIZ, gameId: 'quiz-general', title: 'معلومات عامة', accent: 'var(--royal)' } },
  { id: 'hangman',  title: 'كلمة السر',   emoji: '🔤', cat: 'puzzle', tag: 'حروف',  Component: Hangman },
  { id: 'rps',      title: 'حجر ورقة مقص', emoji: '✊', cat: 'puzzle', tag: 'حظ',    Component: RPS },
  { id: 'simon',    title: 'تسلسل الألوان', emoji: '🎨', cat: 'puzzle', tag: 'ذاكرة', Component: Simon },
  { id: 'slide',    title: 'ترتيب الأرقام', emoji: '🧩', cat: 'puzzle', tag: 'لغز',   Component: SlidePuzzle },
  { id: 'reaction', title: 'سرعة البديهة', emoji: '⚡', cat: 'puzzle', tag: 'سرعة',   Component: Reaction },

  // ── قصص وحكايات ──
  { id: 'story-lion', title: 'الأسد والفأر', emoji: '🦁', cat: 'stories', tag: 'حكمة',
    Component: StoryReader, props: { story: STORY_LION } },
  { id: 'story-folk', title: 'فاطمة السمحة', emoji: '🏜️', cat: 'stories', tag: 'سودانية', isNew: true,
    Component: StoryReader, props: { story: STORY_FOLK } },
  { id: 'story-kids', title: 'نجمة الصغيرة', emoji: '🌙', cat: 'stories', tag: 'أطفال',
    Component: StoryReader, props: { story: STORY_KIDS } },

  // ── كوميديا ومرح ──
  { id: 'jokes',  title: 'نكت سودانية', emoji: '😂', cat: 'comedy', tag: 'ضحك', isNew: true, Component: Jokes },
  { id: 'wheel',  title: 'عجلة الحظ',   emoji: '🎡', cat: 'comedy', tag: 'حظ',  Component: SpinWheel },
  { id: 'guess',  title: 'خمّن الرقم',  emoji: '🔮', cat: 'comedy', tag: 'تحدٍ', Component: GuessNumber },
];

export const gamesByCat = (catId) => GAMES.filter(g => g.cat === catId);

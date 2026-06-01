import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal, Confetti } from '../../components/ui.jsx';
import { useRewardedAd } from '../../systems/RewardedAd.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const WORDS = [
  { w:'الخرطوم', h:'عاصمة السودان' },
  { w:'النيل', h:'أطول نهر' },
  { w:'العصيدة', h:'أكلة سودانية' },
  { w:'الجمل', h:'سفينة الصحراء' },
  { w:'القهوة', h:'مشروب الصباح' },
  { w:'الصحراء', h:'أرض رملية واسعة' },
  { w:'الكركدي', h:'مشروب أحمر' },
  { w:'مروي', h:'مدينة الأهرامات السودانية' },
  { w:'الذهب', h:'معدن ثمين' },
  { w:'النخيل', h:'شجرة التمر' },
];
const LETTERS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');

export default function Hangman({ onExit }) {
  const [item, setItem] = React.useState(() => WORDS[Math.floor(Math.random()*WORDS.length)]);
  const [guessed, setGuessed] = React.useState([]);
  const [wrong, setWrong] = React.useState(0);
  const [showHint, setShowHint] = React.useState(false);
  const ad = useRewardedAd();
  const MAX = 6;

  const letters = [...item.w].filter(ch => ch !== ' ');
  const win = letters.every(ch => guessed.includes(ch));
  const lose = wrong >= MAX;
  const done = win || lose;

  React.useEffect(() => {
    if (win) { sfx.win(); addCoins(30); }
    else if (lose) sfx.lose();
  }, [win, lose]);

  const guess = (ch) => {
    if (guessed.includes(ch) || done) return;
    setGuessed(g => [...g, ch]);
    if (item.w.includes(ch)) sfx.correct(); else { setWrong(w=>w+1); sfx.wrong(); }
  };

  const reset = () => {
    setItem(WORDS[Math.floor(Math.random()*WORDS.length)]);
    setGuessed([]); setWrong(0); setShowHint(false);
  };

  const watchHint = async () => {
    const w = await ad.show({ reward: 0, label: 'اكشف تلميحاً', emoji: '💡' });
    if (w) setShowHint(true);
  };

  return (
    <GameShell title="🔤 كلمة السر" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:18, paddingTop:6 }}>
        {/* hearts */}
        <div style={{ fontSize:22, letterSpacing:4 }}>
          {Array.from({length:MAX}).map((_,i)=> i<MAX-wrong ? '❤️' : '🖤')}
        </div>
        {/* word */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
          {[...item.w].map((ch,i) => (
            <span key={i} style={{
              width:38, height:46, borderRadius:10,
              background: ch===' '?'transparent':'var(--surface)',
              border: ch===' '?'none':'1px solid var(--border-2)',
              borderBottom: ch===' '?'none':'3px solid var(--c-puzzle)',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontSize:24, fontWeight:900, color:'var(--c-puzzle2)',
            }}>{guessed.includes(ch)||done ? ch : ''}</span>
          ))}
        </div>
        {showHint && <div style={{ color:'var(--gold)', fontWeight:700 }}>💡 {item.h}</div>}
        {/* keyboard */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, width:'min(94vw,360px)' }}>
          {LETTERS.map(ch => {
            const used = guessed.includes(ch);
            const ok = used && item.w.includes(ch);
            return (
              <button key={ch} onClick={()=>guess(ch)} disabled={used||done} style={{
                aspectRatio:'1', borderRadius:9, fontSize:17, fontWeight:800, cursor:'pointer',
                background: used ? (ok?'rgba(43,217,168,0.25)':'rgba(255,90,110,0.18)') : 'var(--surface-2)',
                color: used ? (ok?'var(--success)':'var(--danger)') : 'var(--text)',
                border:'1px solid var(--border-2)', opacity: used&&!ok?0.5:1,
              }}>{ch}</button>
            );
          })}
        </div>
        {!done && !showHint && (
          <button className="km-ad-btn" onClick={watchHint} style={{ maxWidth:280 }}>
            <span className="play">💡</span> شاهد إعلاناً لكشف تلميح
          </button>
        )}
      </div>
      {done && (
        <ResultModal emoji={win?'🎉':'😢'} title={win?'أحسنت!':'خسرت'}
          subtitle={win?'ربحت 30 🪙':`الكلمة: ${item.w}`}>
          {win && <Confetti run />}
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>كلمة جديدة</button>
        </ResultModal>
      )}
    </GameShell>
  );
}

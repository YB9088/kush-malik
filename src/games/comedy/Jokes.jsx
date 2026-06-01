import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const JOKES = [
  { q: 'ليه الموبايل دخل المستشفى؟', a: 'عشان البطارية ضعفت! 🔋😄' },
  { q: 'شنو أكتر حاجة بتزعل الساعة؟', a: 'لما الناس تقول ليها "وقفي"! ⏰😆' },
  { q: 'مرة واحد بخيل اشترى مروحة...', a: 'وقعد يلوّح بإيده عشان ما تستهلك كهربا! 🤚😂' },
  { q: 'ليه الكتاب كان زعلان؟', a: 'عشان مليان مشاكل (فصول)! 📚😅' },
  { q: 'شنو الفرق بين الفول والطعمية؟', a: 'الفول صبور، والطعمية بتتقلب بسرعة! 🫘😄' },
  { q: 'مرة واحد نسيان قال لأمه...', a: 'يا ماما نسيت أقول ليك حاجة... بس نسيتها! 🤔😂' },
  { q: 'ليه الشاي ما بيكضب؟', a: 'عشان دايماً صادق ومسكّر! 🍵😆' },
  { q: 'شنو بيقول النيل للبحر؟', a: 'لا تتفلسف، أنا جاي من زمان قبلك! 🌊😄' },
  { q: 'مرة واحد كسلان شنو عمل؟', a: 'ما عمل حاجة... دي القصة كلها! 😴😂' },
  { q: 'ليه الجمل ما عندو مشاكل؟', a: 'عشان دايماً شايل همّو على ضهرو ويمشي! 🐫😅' },
  { q: 'شنو بتقول العصيدة للملاح؟', a: 'من غيرك أنا ناشفة وما ليّ طعم! 🍲😄' },
  { q: 'مرة ساعة الحائط زهجت...', a: 'قالت: طول اليوم بدور وما حد بيشكرني! 🕐😆' },
];
const shuffle = (a)=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);

export default function Jokes({ onExit }) {
  const [deck] = React.useState(()=>shuffle(JOKES));
  const [i, setI] = React.useState(0);
  const [reveal, setReveal] = React.useState(false);
  const [rated, setRated] = React.useState(false);
  const j = deck[i % deck.length];

  const show = () => { setReveal(true); sfx.pop(); };
  const laugh = () => { if (!rated){ addCoins(5); setRated(true); sfx.win(); } };
  const next = () => { setI(v=>v+1); setReveal(false); setRated(false); sfx.swipe(); };

  return (
    <GameShell title="😂 نكت سودانية" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:20, padding:'10px 4px' }}>
        <div style={{
          width:'100%', maxWidth:360, minHeight:230,
          background:'linear-gradient(160deg,var(--c-comedy),var(--c-comedy2))',
          borderRadius:'var(--r-xl)', padding:'28px 22px', boxShadow:'var(--sh-pop)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:18,
          textAlign:'center',
        }}>
          <div style={{ fontSize:46 }}>🤡</div>
          <div style={{ fontSize:21, fontWeight:900, lineHeight:1.6, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.25)' }}>{j.q}</div>
          {reveal && (
            <div style={{ fontSize:19, fontWeight:800, lineHeight:1.7, color:'#2A1208',
              background:'rgba(255,255,255,0.92)', borderRadius:16, padding:'14px 16px',
              animation:'km-pop .4s var(--ease-bounce)' }}>{j.a}</div>
          )}
        </div>

        {!reveal ? (
          <button className="km-btn km-btn-gold" onClick={show} style={{ minWidth:200 }}>اكشف الإجابة 👀</button>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:360 }}>
            <button className="km-ad-btn" onClick={laugh} disabled={rated} style={{ opacity:rated?0.6:1 }}>
              <span className="play">😂</span> {rated ? 'ضحكت! +5 🪙' : 'ضحكتني! (+5 🪙)'}
            </button>
            <button className="km-btn km-btn-royal km-btn-block" onClick={next}>نكتة تانية ◀</button>
          </div>
        )}
        <div style={{ fontSize:12.5, color:'var(--text-mute)' }}>نكتة {(i%deck.length)+1} من {deck.length}</div>
      </div>
    </GameShell>
  );
}

import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

export default function StoryReader({ onExit, story }) {
  const [page, setPage] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [narrating, setNarrating] = React.useState(false);
  const last = page === story.pages.length - 1;
  const p = story.pages[page];

  const next = () => {
    if (last) { finish(); return; }
    sfx.swipe(); setPage(v=>v+1);
  };
  const prev = () => { if (page>0){ sfx.swipe(); setPage(v=>v-1); } };

  const finish = () => { if (!done) { addCoins(25); sfx.win(); } setDone(true); };

  // Text-to-speech narration (Arabic) — uses the browser voice if available.
  const narrate = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(p.text);
      u.lang = 'ar-SA'; u.rate = 0.92;
      u.onend = () => setNarrating(false);
      setNarrating(true); window.speechSynthesis.speak(u); sfx.tap();
    } catch {}
  };
  React.useEffect(() => () => { try { window.speechSynthesis.cancel(); } catch {} }, []);
  React.useEffect(() => { try { window.speechSynthesis.cancel(); setNarrating(false); } catch {} }, [page]);

  if (done) {
    return (
      <GameShell title={`${story.emoji} ${story.title}`} onExit={onExit}>
        <div className="km-fill km-center" style={{ gap:18, padding:20, textAlign:'center' }}>
          <div style={{ fontSize:80 }}>🌟</div>
          <h2 style={{ fontSize:24, fontWeight:900, margin:0 }}>انتهت القصة</h2>
          <div style={{ background:'rgba(43,217,168,0.12)', border:'1px solid var(--success)',
            borderRadius:18, padding:'16px 18px', maxWidth:320 }}>
            <div style={{ fontSize:13, color:'var(--success)', fontWeight:800, marginBottom:6 }}>✦ العبرة ✦</div>
            <div style={{ fontSize:16, fontWeight:700, lineHeight:1.7 }}>{story.moral}</div>
          </div>
          <div style={{ color:'var(--gold)', fontWeight:800 }}>+25 🪙</div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="km-btn km-btn-ghost" onClick={()=>{sfx.tap();setPage(0);setDone(false);}}>إعادة 🔄</button>
            <button className="km-btn km-btn-royal" onClick={()=>{sfx.tap();onExit();}}>قصص أخرى 📚</button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title={`${story.emoji} ${story.title}`} onExit={onExit}>
      <div className="km-fill" style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {/* progress dots */}
        <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
          {story.pages.map((_,i) => (
            <span key={i} style={{ width:i===page?22:8, height:8, borderRadius:99,
              background: i<=page?'var(--c-story)':'var(--surface-2)', transition:'all .3s' }} />
          ))}
        </div>

        {/* illustration */}
        <div key={page} style={{
          borderRadius:'var(--r-xl)', overflow:'hidden', border:'1px solid var(--border-2)',
          background:`linear-gradient(160deg, ${p.bg[0]}, ${p.bg[1]})`,
          aspectRatio:'4/3', display:'flex', alignItems:'center', justifyContent:'center',
          position:'relative', boxShadow:'var(--sh-card)',
          animation:'km-game-in .4s var(--ease-out)',
        }}>
          <span style={{ fontSize:100, filter:'drop-shadow(0 10px 20px rgba(0,0,0,0.4))', animation:'km-float 4s ease-in-out infinite' }}>{p.art}</span>
        </div>

        {/* text */}
        <div style={{
          background:'linear-gradient(160deg,var(--card-2),var(--card))', border:'1px solid var(--border-2)',
          borderRadius:'var(--r-lg)', padding:'20px 18px', fontSize:18, fontWeight:600,
          lineHeight:2, textAlign:'center', minHeight:120,
        }}>{p.text}</div>

        {/* narrate */}
        <button className="km-btn km-btn-ghost" onClick={narrate} style={{ alignSelf:'center' }}>
          {narrating ? '🔊 جارٍ القراءة…' : '🔈 اقرأ لي القصة'}
        </button>

        {/* nav */}
        <div style={{ display:'flex', gap:12, marginTop:'auto' }}>
          <button className="km-btn km-btn-ghost" onClick={prev} disabled={page===0} style={{ flex:1 }}>السابق ▶</button>
          <button className="km-btn km-btn-royal" onClick={next} style={{ flex:2,
            background: last?'linear-gradient(180deg,var(--c-story),var(--c-story2))':undefined }}>
            {last ? 'أنهِ القصة ✦' : '◀ التالي'}
          </button>
        </div>
      </div>
    </GameShell>
  );
}

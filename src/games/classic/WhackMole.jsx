import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal } from '../../components/ui.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

export default function WhackMole({ onExit }) {
  const [holes, setHoles] = React.useState(Array(9).fill(null)); // null | 'mole' | 'bomb'
  const [score, setScore] = React.useState(0);
  const [time, setTime] = React.useState(30);
  const [state, setState] = React.useState('ready'); // ready | play | over
  const [best, setBest] = React.useState(getHighScore('whack'));
  const scoreRef = React.useRef(0);

  React.useEffect(() => {
    if (state !== 'play') return;
    const pop = setInterval(() => {
      setHoles(prev => {
        const nh = Array(9).fill(null);
        const n = 1 + Math.floor(Math.random()*3);
        const idx = [...Array(9).keys()].sort(()=>Math.random()-0.5).slice(0,n);
        idx.forEach(i => nh[i] = Math.random()<0.78 ? 'mole':'bomb');
        return nh;
      });
    }, 720);
    const timer = setInterval(() => setTime(t => {
      if (t<=1) { clearInterval(pop); clearInterval(timer); end(); return 0; }
      return t-1;
    }), 1000);
    return () => { clearInterval(pop); clearInterval(timer); };
  }, [state]);

  const end = () => {
    setState('over'); sfx.win();
    addCoins(Math.floor(scoreRef.current/2));
    if (setHighScore('whack', scoreRef.current)) setBest(scoreRef.current);
  };

  const hit = (i) => {
    if (state!=='play' || !holes[i]) return;
    const what = holes[i];
    setHoles(prev => { const n=prev.slice(); n[i]=null; return n; });
    if (what==='mole') { setScore(s=>{scoreRef.current=s+1;return s+1;}); sfx.pop(); }
    else { setScore(s=>{scoreRef.current=Math.max(0,s-2);return Math.max(0,s-2);}); sfx.wrong(); }
  };

  const start = () => { setScore(0); scoreRef.current=0; setTime(30); setHoles(Array(9).fill(null)); setState('play'); sfx.tap(); };

  return (
    <GameShell title="🔨 اضرب الخلد" onExit={onExit}>
      <div className="km-center km-fill" style={{ gap:16 }}>
        <div style={{ display:'flex', gap:14 }}>
          <Box label="النقاط" value={score} />
          <Box label="الوقت" value={time+'ث'} gold />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, width:'min(88vw,330px)' }}>
          {holes.map((h,i) => (
            <button key={i} onClick={()=>hit(i)} style={{
              aspectRatio:'1', borderRadius:'50%', cursor:'pointer', fontSize:40,
              background:'radial-gradient(circle at 50% 70%, #3A2A14, #1A1208)',
              border:'3px solid #2A1E0E', overflow:'hidden', position:'relative',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ transform: h?'translateY(0)':'translateY(40px)', transition:'transform 0.18s var(--ease-bounce)' }}>
                {h==='mole'?'🦔':h==='bomb'?'💣':''}
              </span>
            </button>
          ))}
        </div>
        <div style={{ fontSize:12.5, color:'var(--text-mute)' }}>اضرب 🦔 وتجنّب 💣 · الأفضل: {best}</div>
      </div>
      {state==='ready' && (
        <ResultModal emoji="🔨" title="اضرب الخلد" subtitle="٣٠ ثانية · كل خلد نقطة، والقنبلة تخصم!">
          <button className="km-btn km-btn-gold km-btn-block" onClick={start}>ابدأ اللعب ▶</button>
        </ResultModal>
      )}
      {state==='over' && (
        <ResultModal emoji="🎉" title="انتهى الوقت!" score={score} best={best} subtitle={`ربحت ${Math.floor(score/2)} 🪙`}>
          <button className="km-btn km-btn-royal km-btn-block" onClick={start}>العب مجدداً</button>
        </ResultModal>
      )}
    </GameShell>
  );
}
function Box({ label, value, gold }) {
  return <div style={{ background:'var(--surface)', border:'1px solid var(--border-2)', borderRadius:14, padding:'8px 20px', textAlign:'center', minWidth:80 }}>
    <div style={{ fontSize:22, fontWeight:900, color: gold?'var(--gold)':'var(--text)' }}>{value}</div>
    <div style={{ fontSize:11, color:'var(--text-mute)', fontWeight:700 }}>{label}</div>
  </div>;
}

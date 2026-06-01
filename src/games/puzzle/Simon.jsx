import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal } from '../../components/ui.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const PADS = [
  { id:0, color:'#FF6B6B', lit:'#FFB3B3', freq:330 },
  { id:1, color:'#2BD9A8', lit:'#9FF3DD', freq:415 },
  { id:2, color:'#3B82F6', lit:'#A7C7FF', freq:494 },
  { id:3, color:'#F5C542', lit:'#FFE9A8', freq:587 },
];

export default function Simon({ onExit }) {
  const [seq, setSeq] = React.useState([]);
  const [active, setActive] = React.useState(null);
  const [playing, setPlaying] = React.useState(false); // showing sequence
  const [userIdx, setUserIdx] = React.useState(0);
  const [state, setState] = React.useState('ready'); // ready | go | over
  const [best, setBest] = React.useState(getHighScore('simon'));

  const beep = (id) => {
    setActive(id); sfx.pop();
    setTimeout(()=>setActive(null), 320);
  };

  const playSeq = async (s) => {
    setPlaying(true);
    await new Promise(r=>setTimeout(r, 600));
    for (const id of s) {
      beep(id);
      await new Promise(r=>setTimeout(r, 560));
    }
    setPlaying(false); setUserIdx(0);
  };

  const addStep = () => {
    const ns = [...seq, Math.floor(Math.random()*4)];
    setSeq(ns); playSeq(ns);
  };

  const start = () => { setState('go'); setSeq([]); setTimeout(()=>{ const ns=[Math.floor(Math.random()*4)]; setSeq(ns); playSeq(ns); },100); };

  const tap = (id) => {
    if (playing || state!=='go') return;
    beep(id);
    if (id === seq[userIdx]) {
      if (userIdx + 1 === seq.length) {
        addCoins(5);
        setTimeout(addStep, 700);
      } else setUserIdx(u=>u+1);
    } else {
      sfx.lose();
      if (setHighScore('simon', seq.length-1)) setBest(seq.length-1);
      setState('over');
    }
  };

  return (
    <GameShell title="🎨 تسلسل الألوان" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:18, paddingTop:8 }}>
        <div style={{ fontSize:16, fontWeight:800, color:'var(--text-soft)' }}>
          المستوى: <b style={{color:'var(--gold)'}}>{Math.max(0,seq.length-(state==='over'?1:0))}</b> · الأفضل: <b style={{color:'var(--success)'}}>{best}</b>
        </div>
        <div style={{ position:'relative', width:'min(80vw,300px)', aspectRatio:'1',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {PADS.map(p => (
            <button key={p.id} onClick={()=>tap(p.id)} disabled={playing||state!=='go'} style={{
              borderRadius:20, cursor: playing?'default':'pointer',
              background: active===p.id ? p.lit : p.color,
              border:'3px solid rgba(255,255,255,0.12)',
              boxShadow: active===p.id ? `0 0 40px ${p.color}` : 'none',
              transition:'all .12s', transform: active===p.id?'scale(0.96)':'none',
            }} />
          ))}
          <div style={{ position:'absolute', inset:0, margin:'auto', width:80, height:80, borderRadius:'50%',
            background:'var(--navy-800)', border:'4px solid var(--navy-700)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, pointerEvents:'none' }}>
            {playing?'👀':state==='go'?'👆':'🎨'}
          </div>
        </div>
        <div style={{ fontSize:13, color:'var(--text-mute)' }}>
          {playing ? 'راقب التسلسل…' : state==='go' ? 'كرّر التسلسل!' : 'احفظ وكرّر تسلسل الألوان'}
        </div>
      </div>
      {state==='ready' && (
        <ResultModal emoji="🎨" title="تسلسل الألوان" subtitle="راقب الأضواء ثم كرّرها بالترتيب">
          <button className="km-btn km-btn-gold km-btn-block" onClick={start}>ابدأ ▶</button>
        </ResultModal>
      )}
      {state==='over' && (
        <ResultModal emoji="🎯" title="خطأ!" score={seq.length-1} best={best} subtitle="وصلت لهذا المستوى">
          <button className="km-btn km-btn-royal km-btn-block" onClick={start}>حاول مجدداً</button>
        </ResultModal>
      )}
    </GameShell>
  );
}

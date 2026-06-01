import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { useRewardedAd } from '../../systems/RewardedAd.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const SEGMENTS = [
  { label:'10', value:10, color:'#FF6B6B' },
  { label:'50', value:50, color:'#2BD9A8' },
  { label:'5',  value:5,  color:'#3B82F6' },
  { label:'100',value:100,color:'#F5C542' },
  { label:'20', value:20, color:'#6C5CE7' },
  { label:'0',  value:0,  color:'#FF4FA3' },
  { label:'30', value:30, color:'#FF8E53' },
  { label:'200',value:200,color:'#00B894' },
];
const SEG = 360 / SEGMENTS.length;

export default function SpinWheel({ onExit }) {
  const [angle, setAngle] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [spinsLeft, setSpinsLeft] = React.useState(3);
  const ad = useRewardedAd();

  const spin = () => {
    if (spinning || spinsLeft<=0) return;
    setSpinning(true); setResult(null); sfx.swipe();
    const winIdx = Math.floor(Math.random()*SEGMENTS.length);
    const turns = 5 + Math.floor(Math.random()*3);
    const target = turns*360 + (360 - winIdx*SEG - SEG/2);
    setAngle(a => a - (a % 360) + target);
    setSpinsLeft(s=>s-1);
    setTimeout(() => {
      const seg = SEGMENTS[winIdx];
      setResult(seg); setSpinning(false);
      if (seg.value>0) { addCoins(seg.value); sfx.win(); } else sfx.lose();
    }, 4200);
  };

  const moreSpins = async () => {
    const w = await ad.show({ reward: 0, label: 'احصل على ٣ لفّات', emoji:'🎡' });
    if (w) { setSpinsLeft(s=>s+3); }
  };

  const gradient = `conic-gradient(${SEGMENTS.map((s,i)=>`${s.color} ${i*SEG}deg ${(i+1)*SEG}deg`).join(',')})`;

  return (
    <GameShell title="🎡 عجلة الحظ" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:22, paddingTop:6 }}>
        <div style={{ fontWeight:800, color:'var(--text-soft)' }}>لفّات متبقية: <b style={{color:'var(--gold)'}}>{spinsLeft}</b></div>
        <div style={{ position:'relative', width:'min(80vw,300px)', aspectRatio:'1' }}>
          {/* pointer */}
          <div style={{ position:'absolute', top:-6, insetInlineStart:'50%', transform:'translateX(-50%)',
            zIndex:3, fontSize:34, filter:'drop-shadow(0 3px 4px rgba(0,0,0,0.5))' }}>🔻</div>
          {/* wheel */}
          <div style={{
            width:'100%', height:'100%', borderRadius:'50%',
            background:gradient, border:'8px solid var(--gold)',
            boxShadow:'var(--sh-pop), inset 0 0 30px rgba(0,0,0,0.3)',
            transform:`rotate(${angle}deg)`,
            transition: spinning ? 'transform 4.1s cubic-bezier(0.17,0.67,0.18,0.99)' : 'none',
            position:'relative',
          }}>
            {SEGMENTS.map((s,i) => (
              <div key={i} style={{
                position:'absolute', top:'50%', left:'50%', transformOrigin:'0 0',
                transform:`rotate(${i*SEG + SEG/2}deg) translate(0, -120px)`,
                color:'#fff', fontWeight:900, fontSize:18, textShadow:'0 1px 3px rgba(0,0,0,0.5)',
              }}>{s.label}</div>
            ))}
          </div>
          {/* hub */}
          <div style={{ position:'absolute', inset:0, margin:'auto', width:52, height:52, borderRadius:'50%',
            background:'var(--navy-800)', border:'5px solid var(--gold)', zIndex:2,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🎡</div>
        </div>

        <div style={{ height:30, fontSize:20, fontWeight:900,
          color: result?(result.value>0?'var(--success)':'var(--danger)'):'transparent' }}>
          {result && (result.value>0 ? `🎉 ربحت ${result.value} 🪙!` : '😅 حظ أوفر!')}
        </div>

        {spinsLeft>0 ? (
          <button className="km-btn km-btn-gold" onClick={spin} disabled={spinning} style={{ minWidth:200 }}>
            {spinning ? 'تدور…' : 'لُفّ العجلة 🎯'}
          </button>
        ) : (
          <button className="km-ad-btn" onClick={moreSpins} style={{ maxWidth:300 }}>
            <span className="play">▶</span> شاهد إعلاناً واحصل على ٣ لفّات
          </button>
        )}
      </div>
    </GameShell>
  );
}

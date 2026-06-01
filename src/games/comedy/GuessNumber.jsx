import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal, Confetti } from '../../components/ui.jsx';
import { useRewardedAd } from '../../systems/RewardedAd.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

export default function GuessNumber({ onExit }) {
  const [target, setTarget] = React.useState(() => 1 + Math.floor(Math.random()*100));
  const [val, setVal] = React.useState('');
  const [tries, setTries] = React.useState(0);
  const [hint, setHint] = React.useState('فكّر برقم بين ١ و١٠٠');
  const [history, setHistory] = React.useState([]);
  const [won, setWon] = React.useState(false);
  const MAX = 8;
  const ad = useRewardedAd();

  const guess = () => {
    const n = parseInt(val); if (!n || n<1 || n>100) return;
    const t = tries+1; setTries(t); setVal('');
    setHistory(h => [{ n, dir: n<target?'up':n>target?'down':'eq' }, ...h].slice(0,6));
    if (n === target) {
      const reward = Math.max(10, 90 - t*10); addCoins(reward); setWon(true); sfx.win();
    } else if (t >= MAX) {
      setHint(`نفدت محاولاتك! الرقم كان ${target}`); sfx.lose();
    } else {
      const close = Math.abs(n-target);
      setHint(n < target
        ? (close<6?'🔥 أكبر بقليل!':'⬆️ الرقم أكبر')
        : (close<6?'🔥 أصغر بقليل!':'⬇️ الرقم أصغر'));
      sfx.tap();
    }
  };

  const extraTries = async () => {
    const w = await ad.show({ reward:0, label:'محاولات إضافية', emoji:'🔮' });
    if (w) { setTries(t=>Math.max(0,t-4)); setHint('حصلت على ٤ محاولات إضافية!'); }
  };

  const reset = () => {
    setTarget(1+Math.floor(Math.random()*100)); setVal(''); setTries(0);
    setHint('فكّر برقم بين ١ و١٠٠'); setHistory([]); setWon(false);
  };

  const lost = tries>=MAX && !won;

  return (
    <GameShell title="🔮 خمّن الرقم" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:18, paddingTop:8 }}>
        <div style={{ fontSize:64 }}>🔮</div>
        <div style={{ fontSize:19, fontWeight:800, color:'var(--gold)', textAlign:'center', minHeight:28 }}>{hint}</div>
        <div style={{ fontSize:14, color:'var(--text-soft)', fontWeight:700 }}>
          محاولة {tries}/{MAX}
        </div>

        {!won && !lost && (
          <div style={{ display:'flex', gap:10, width:'min(86vw,320px)' }}>
            <input type="number" value={val} onChange={e=>setVal(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&guess()}
              placeholder="رقمك..." style={{
                flex:1, padding:'14px 18px', borderRadius:16, fontSize:20, fontWeight:800, textAlign:'center',
                background:'var(--surface)', border:'1.5px solid var(--border-2)', color:'var(--text)', outline:'none',
              }} />
            <button className="km-btn km-btn-gold" onClick={guess}>خمّن</button>
          </div>
        )}

        {/* history */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', maxWidth:320 }}>
          {history.map((h,i) => (
            <span key={i} style={{
              padding:'6px 12px', borderRadius:99, fontWeight:800, fontSize:14,
              background:'var(--surface-2)', border:'1px solid var(--border-2)',
            }}>{h.n} {h.dir==='up'?'⬆️':h.dir==='down'?'⬇️':'✅'}</span>
          ))}
        </div>

        {lost && (
          <button className="km-ad-btn" onClick={extraTries} style={{ maxWidth:300 }}>
            <span className="play">▶</span> شاهد إعلاناً لـ ٤ محاولات إضافية
          </button>
        )}
      </div>

      {won && (
        <ResultModal emoji="🎉" title="أصبت!" subtitle={`الرقم ${target} في ${tries} محاولة · ربحت ${Math.max(10,90-tries*10)} 🪙`}>
          <Confetti run />
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>رقم جديد</button>
        </ResultModal>
      )}
      {lost && (
        <ResultModal emoji="😅" title="نفدت المحاولات" subtitle={`الرقم كان ${target}`}>
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>حاول مجدداً</button>
        </ResultModal>
      )}
    </GameShell>
  );
}

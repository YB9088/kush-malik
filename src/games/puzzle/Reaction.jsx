import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal } from '../../components/ui.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

export default function Reaction({ onExit }) {
  const [phase, setPhase] = React.useState('idle'); // idle | wait | go | result | early
  const [ms, setMs] = React.useState(0);
  const [best, setBest] = React.useState(getHighScore('reaction') ? 9999 - getHighScore('reaction') : null);
  const startRef = React.useRef(0);
  const timer = React.useRef(null);

  const begin = () => {
    setPhase('wait'); sfx.tap();
    const delay = 1200 + Math.random()*2600;
    timer.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase('go'); sfx.pop();
    }, delay);
  };

  const click = () => {
    if (phase === 'wait') { clearTimeout(timer.current); setPhase('early'); sfx.wrong(); return; }
    if (phase === 'go') {
      const t = Math.round(performance.now() - startRef.current);
      setMs(t); setPhase('result'); sfx.correct();
      const coins = t<250?50:t<350?30:t<500?15:5; addCoins(coins);
      // store best as lowest ms (encode as 9999-ms so higher=better)
      if (setHighScore('reaction', 9999 - t)) setBest(t);
    }
  };

  const reset = () => { setPhase('idle'); setMs(0); };

  const bg = phase==='go' ? 'linear-gradient(160deg,#2BD9A8,#00B894)'
    : phase==='wait' ? 'linear-gradient(160deg,#FF6B6B,#FF4FA3)'
    : phase==='early' ? 'linear-gradient(160deg,#FF5A6E,#C0392B)'
    : 'linear-gradient(160deg,var(--card-2),var(--card))';

  return (
    <GameShell title="⚡ سرعة البديهة" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:18, paddingTop:6 }}>
        {best!=null && <div style={{ fontWeight:800, color:'var(--gold)' }}>أسرع زمن: {best} ms</div>}
        <button onClick={phase==='idle'||phase==='result'||phase==='early' ? (phase==='idle'?begin:reset) : click}
          style={{
            width:'min(86vw,330px)', aspectRatio:'1', borderRadius:30, border:'2px solid var(--border-2)',
            background:bg, color:'#fff', cursor:'pointer', fontWeight:900,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10,
            boxShadow:'var(--sh-card)', textAlign:'center', padding:20,
          }}>
          {phase==='idle' && <><div style={{fontSize:54}}>⚡</div><div style={{fontSize:20}}>اضغط للبدء</div></>}
          {phase==='wait' && <><div style={{fontSize:48}}>⏳</div><div style={{fontSize:20}}>انتظر اللون الأخضر…</div></>}
          {phase==='go' && <><div style={{fontSize:60}}>👆</div><div style={{fontSize:24}}>اضغط الآن!</div></>}
          {phase==='early' && <><div style={{fontSize:48}}>😅</div><div style={{fontSize:18}}>مبكر جداً! اضغط لإعادة</div></>}
          {phase==='result' && <><div style={{fontSize:44}}>{ms<250?'🚀':ms<400?'⚡':'🐢'}</div><div style={{fontSize:40}}>{ms} ms</div><div style={{fontSize:15}}>اضغط لإعادة المحاولة</div></>}
        </button>
        <div style={{ fontSize:13, color:'var(--text-mute)', textAlign:'center', maxWidth:280 }}>
          انتظر تحوّل اللون للأخضر ثم اضغط بأسرع ما يمكن. أقل من ٢٥٠ms = ٥٠ 🪙!
        </div>
      </div>
    </GameShell>
  );
}

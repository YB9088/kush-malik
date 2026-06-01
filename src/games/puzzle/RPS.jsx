import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const MOVES = [
  { id:'rock', e:'✊', name:'حجر' },
  { id:'paper', e:'✋', name:'ورقة' },
  { id:'scissors', e:'✌️', name:'مقص' },
];
const beats = { rock:'scissors', paper:'rock', scissors:'paper' };

export default function RPS({ onExit }) {
  const [you, setYou] = React.useState(null);
  const [cpu, setCpu] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [wins, setWins] = React.useState(0);
  const [losses, setLosses] = React.useState(0);
  const [rolling, setRolling] = React.useState(false);

  const play = (m) => {
    if (rolling) return;
    setRolling(true); setYou(m); setResult(null); sfx.tap();
    let ticks = 0;
    const spin = setInterval(() => {
      setCpu(MOVES[ticks % 3].id); ticks++;
      if (ticks > 9) {
        clearInterval(spin);
        const c = MOVES[Math.floor(Math.random()*3)].id; setCpu(c);
        let r;
        if (m === c) { r='tie'; sfx.pop(); }
        else if (beats[m] === c) { r='win'; setWins(w=>w+1); addCoins(15); sfx.win(); }
        else { r='lose'; setLosses(l=>l+1); sfx.lose(); }
        setResult(r); setRolling(false);
      }
    }, 90);
  };

  const M = (id) => MOVES.find(m=>m.id===id);

  return (
    <GameShell title="✊ حجر ورقة مقص" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:22, paddingTop:10 }}>
        <div style={{ display:'flex', gap:24, fontWeight:800 }}>
          <span style={{ color:'var(--success)' }}>فوز: {wins}</span>
          <span style={{ color:'var(--danger)' }}>خسارة: {losses}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <Hand label="أنت" e={you?M(you).e:'❔'} color="var(--royal-2)" />
          <div style={{ fontSize:24, fontWeight:900, color:'var(--text-mute)' }}>VS</div>
          <Hand label="الخصم" e={cpu?M(cpu).e:'❔'} color="var(--c-comedy)" flip />
        </div>
        <div style={{ height:36, fontSize:22, fontWeight:900,
          color: result==='win'?'var(--success)':result==='lose'?'var(--danger)':'var(--gold)' }}>
          {result==='win'?'🎉 فزت! +15 🪙':result==='lose'?'😅 خسرت':result==='tie'?'🤝 تعادل':''}
        </div>
        <div style={{ display:'flex', gap:14 }}>
          {MOVES.map(m => (
            <button key={m.id} onClick={()=>play(m.id)} disabled={rolling} style={{
              width:84, height:84, borderRadius:22, fontSize:40, cursor:'pointer',
              background:'linear-gradient(160deg,var(--c-puzzle),var(--c-puzzle2))',
              border:'1px solid var(--border-2)', boxShadow:'var(--sh-card)',
              transition:'transform .15s var(--ease-bounce)',
            }}>{m.e}</button>
          ))}
        </div>
        <div style={{ fontSize:13, color:'var(--text-mute)' }}>اختر حركتك!</div>
      </div>
    </GameShell>
  );
}
function Hand({ label, e, color, flip }) {
  return (
    <div className="km-center" style={{ gap:8 }}>
      <div style={{
        width:96, height:96, borderRadius:'50%', fontSize:48,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'var(--surface)', border:`2px solid ${color}`,
        transform: flip?'scaleX(-1)':'none',
      }}>{e}</div>
      <div style={{ fontWeight:800, fontSize:14, color }}>{label}</div>
    </div>
  );
}

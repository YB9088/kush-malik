import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal, Confetti } from '../../components/ui.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const EMOJIS = ['🦁','🐘','🐫','🌴','🍉','⭐','🥁','🏺'];
const shuffle = (a) => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);

export default function Memory({ onExit }) {
  const make = () => shuffle([...EMOJIS, ...EMOJIS]).map((e,i)=>({ id:i, e, up:false, done:false }));
  const [cards, setCards] = React.useState(make);
  const [sel, setSel] = React.useState([]);
  const [moves, setMoves] = React.useState(0);
  const [won, setWon] = React.useState(false);
  const [lock, setLock] = React.useState(false);

  const flip = (i) => {
    if (lock || cards[i].up || cards[i].done) return;
    sfx.tap();
    const nc = cards.slice(); nc[i] = { ...nc[i], up:true }; setCards(nc);
    const ns = [...sel, i]; setSel(ns);
    if (ns.length === 2) {
      setMoves(m=>m+1); setLock(true);
      const [a,b] = ns;
      if (nc[a].e === nc[b].e) {
        setTimeout(() => {
          const c2 = nc.slice(); c2[a]={...c2[a],done:true}; c2[b]={...c2[b],done:true};
          setCards(c2); setSel([]); setLock(false); sfx.correct();
          if (c2.every(c=>c.done)) {
            const reward = Math.max(10, 80 - moves*3); addCoins(reward);
            const isBest = setHighScore('memory', 1000 - moves); setWon(true); sfx.win();
          }
        }, 420);
      } else {
        setTimeout(() => {
          const c2 = nc.slice(); c2[a]={...c2[a],up:false}; c2[b]={...c2[b],up:false};
          setCards(c2); setSel([]); setLock(false); sfx.wrong();
        }, 720);
      }
    }
  };

  const reset = () => { setCards(make()); setSel([]); setMoves(0); setWon(false); setLock(false); };

  return (
    <GameShell title="🃏 الذاكرة" onExit={onExit}>
      <div className="km-center km-fill" style={{ gap:16 }}>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--text-soft)' }}>الحركات: <b style={{color:'var(--gold)'}}>{moves}</b></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, width:'min(90vw,330px)' }}>
          {cards.map((c,i) => (
            <button key={c.id} onClick={()=>flip(i)} style={{
              aspectRatio:'1', borderRadius:14, cursor:'pointer', fontSize:34,
              border:'1px solid var(--border-2)',
              background: c.up||c.done ? 'linear-gradient(160deg,#243168,#16204D)' : 'linear-gradient(160deg,var(--c-classic),var(--c-classic2))',
              opacity: c.done ? 0.45 : 1,
              transition:'transform 0.3s var(--ease-bounce)',
              transform: c.up||c.done ? 'rotateY(0)' : 'rotateY(0)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{c.up||c.done ? c.e : '❓'}</button>
          ))}
        </div>
      </div>
      {won && (
        <ResultModal emoji="🎉" title="أحسنت!" subtitle={`أنهيتها في ${moves} حركة`}>
          <Confetti run />
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>العب مجدداً</button>
        </ResultModal>
      )}
    </GameShell>
  );
}

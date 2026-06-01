import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal, Confetti } from '../../components/ui.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const SZ = 3;
const solved = [...Array(SZ*SZ).keys()]; // 0..8, 8 = blank

const shuffle = () => {
  let a = solved.slice();
  // do valid random moves to guarantee solvable
  let blank = SZ*SZ-1;
  for (let k=0;k<200;k++) {
    const moves = neighbors(blank);
    const m = moves[Math.floor(Math.random()*moves.length)];
    [a[blank],a[m]]=[a[m],a[blank]]; blank=m;
  }
  return a;
};
const neighbors = (i) => {
  const r = Math.floor(i/SZ), c = i%SZ, n=[];
  if (r>0) n.push(i-SZ); if (r<SZ-1) n.push(i+SZ);
  if (c>0) n.push(i-1); if (c<SZ-1) n.push(i+1);
  return n;
};

export default function SlidePuzzle({ onExit }) {
  const [tiles, setTiles] = React.useState(shuffle);
  const [moves, setMoves] = React.useState(0);
  const win = tiles.every((v,i)=>v===solved[i]);

  React.useEffect(() => { if (win && moves>0) { sfx.win(); addCoins(40); } }, [win]);

  const blank = tiles.indexOf(SZ*SZ-1);
  const move = (i) => {
    if (win || !neighbors(blank).includes(i)) return;
    const t = tiles.slice(); [t[blank],t[i]]=[t[i],t[blank]];
    setTiles(t); setMoves(m=>m+1); sfx.swipe();
  };
  const reset = () => { setTiles(shuffle()); setMoves(0); };

  return (
    <GameShell title="🧩 ترتيب الأرقام" onExit={onExit}>
      <div className="km-fill km-center" style={{ gap:18, paddingTop:8 }}>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--text-soft)' }}>الحركات: <b style={{color:'var(--gold)'}}>{moves}</b></div>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${SZ},1fr)`, gap:10,
          width:'min(82vw,300px)', aspectRatio:'1' }}>
          {tiles.map((v,i) => {
            const blankTile = v === SZ*SZ-1;
            return (
              <button key={i} onClick={()=>move(i)} disabled={blankTile} style={{
                borderRadius:16, fontSize:34, fontWeight:900, cursor: blankTile?'default':'pointer',
                background: blankTile ? 'transparent' : 'linear-gradient(160deg,var(--c-puzzle),var(--c-puzzle2))',
                border: blankTile ? '2px dashed var(--border-2)' : '1px solid var(--border-2)',
                color:'#fff', boxShadow: blankTile?'none':'var(--sh-card)',
                transition:'all .15s var(--ease-bounce)',
              }}>{blankTile ? '' : v+1}</button>
            );
          })}
        </div>
        <button className="km-btn km-btn-ghost" onClick={()=>{sfx.tap();reset();}}>خلط 🔀</button>
        <div style={{ fontSize:12.5, color:'var(--text-mute)' }}>رتّب الأرقام من ١ إلى ٨</div>
      </div>
      {win && moves>0 && (
        <ResultModal emoji="🏆" title="رائع!" subtitle={`حللتها في ${moves} حركة · ربحت 40 🪙`}>
          <Confetti run />
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>لغز جديد</button>
        </ResultModal>
      )}
    </GameShell>
  );
}

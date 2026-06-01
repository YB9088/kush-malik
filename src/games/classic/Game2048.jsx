import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal } from '../../components/ui.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const SZ = 4;
const COLORS = {
  2:'#3B4A7A',4:'#465699',8:'#FF8E53',16:'#FF6B6B',32:'#FF4FA3',64:'#A66BFF',
  128:'#6C5CE7',256:'#2BD9A8',512:'#00B894',1024:'#F5C542',2048:'#E0A422',
};
const empty = () => Array.from({length:SZ},()=>Array(SZ).fill(0));
const spawn = (g) => {
  const cells = []; g.forEach((r,i)=>r.forEach((v,j)=>{ if(!v) cells.push([i,j]); }));
  if (!cells.length) return g;
  const [i,j] = cells[Math.floor(Math.random()*cells.length)];
  g[i][j] = Math.random()<0.9?2:4; return g;
};
const init = () => spawn(spawn(empty()));

const slide = (row) => {
  let a = row.filter(Boolean); let gained = 0;
  for (let i=0;i<a.length-1;i++) if (a[i]===a[i+1]) { a[i]*=2; gained+=a[i]; a.splice(i+1,1); }
  while (a.length<SZ) a.push(0);
  return { row:a, gained };
};
const rotate = (g) => g[0].map((_,c)=>g.map(r=>r[c]).reverse());
const move = (grid, dir) => {
  let g = grid.map(r=>r.slice());
  for (let r=0;r<dir;r++) g = rotate(g);
  let gained=0, moved=false;
  g = g.map(row=>{ const {row:nr,gained:gg}=slide(row); gained+=gg; if(nr.join()!==row.join()) moved=true; return nr; });
  for (let r=0;r<(4-dir)%4;r++) g = rotate(g);
  return { g, gained, moved };
};
const canMove = (g) => {
  for (let d=0;d<4;d++) if (move(g,d).moved) return true; return false;
};

export default function Game2048({ onExit }) {
  const [grid, setGrid] = React.useState(init);
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(getHighScore('2048'));
  const [over, setOver] = React.useState(false);
  const [won, setWon] = React.useState(false);

  const doMove = (dir) => {
    if (over) return;
    const { g, gained, moved } = move(grid, dir);
    if (!moved) return;
    spawn(g); sfx.swipe();
    const ns = score + gained; setScore(ns); setGrid(g);
    if (gained) sfx.pop();
    if (!won && g.some(r=>r.includes(2048))) { setWon(true); sfx.win(); addCoins(200); }
    if (!canMove(g)) {
      setOver(true); sfx.lose();
      addCoins(Math.floor(ns/50));
      if (setHighScore('2048', ns)) setBest(ns);
    }
  };

  React.useEffect(() => {
    const onKey = (e) => {
      const m = { ArrowLeft:0, ArrowUp:1, ArrowRight:2, ArrowDown:3 };
      if (m[e.key]!=null){ e.preventDefault(); doMove(m[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const touch = React.useRef(null);
  const onStart = (e) => { const t=e.touches[0]; touch.current=[t.clientX,t.clientY]; };
  const onEnd = (e) => {
    if (!touch.current) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-touch.current[0], dy=t.clientY-touch.current[1];
    if (Math.abs(dx)<24 && Math.abs(dy)<24) return;
    if (Math.abs(dx)>Math.abs(dy)) doMove(dx>0?2:0); else doMove(dy>0?3:1);
    touch.current=null;
  };

  const reset = () => { setGrid(init()); setScore(0); setOver(false); setWon(false); };

  return (
    <GameShell title="🔢 ٢٠٤٨" onExit={onExit}>
      <div className="km-center km-fill" style={{ gap:16 }}>
        <div style={{ display:'flex', gap:14 }}>
          <Box label="النقاط" value={score} />
          <Box label="الأفضل" value={best} gold />
        </div>
        <div onTouchStart={onStart} onTouchEnd={onEnd} style={{
          background:'#0F1A40', padding:10, borderRadius:18, border:'2px solid var(--border-2)',
          display:'grid', gridTemplateColumns:`repeat(${SZ},1fr)`, gap:10,
          width:'min(90vw,340px)', touchAction:'none',
        }}>
          {grid.flat().map((v,i) => (
            <div key={i} style={{
              aspectRatio:'1', borderRadius:12,
              background: v ? COLORS[v]||'#E0A422' : 'rgba(255,255,255,0.04)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:900, color:'#fff',
              fontSize: v>=1024?20:v>=128?24:28,
              transition:'all 0.12s var(--ease-bounce)',
            }}>{v||''}</div>
          ))}
        </div>
        <div style={{ fontSize:12.5, color:'var(--text-mute)' }}>اسحب للتحريك · ادمج الأرقام المتشابهة</div>
        <button className="km-btn km-btn-ghost" onClick={()=>{sfx.tap();reset();}}>إعادة 🔄</button>
      </div>
      {over && (
        <ResultModal emoji="🔢" title="انتهت!" score={score} best={best} subtitle={`ربحت ${Math.floor(score/50)} 🪙`}>
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>لعبة جديدة</button>
        </ResultModal>
      )}
    </GameShell>
  );
}
function Box({ label, value, gold }) {
  return <div style={{ background:'var(--surface)', border:'1px solid var(--border-2)', borderRadius:14, padding:'8px 18px', textAlign:'center', minWidth:84 }}>
    <div style={{ fontSize:22, fontWeight:900, color: gold?'var(--gold)':'var(--text)' }}>{value}</div>
    <div style={{ fontSize:11, color:'var(--text-mute)', fontWeight:700 }}>{label}</div>
  </div>;
}

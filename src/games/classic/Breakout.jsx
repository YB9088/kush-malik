import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal } from '../../components/ui.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const W = 320, H = 420, COLS = 6, ROWS = 5, BW = 46, BH = 18, PADW = 72, PADH = 12, BALLR = 7;
const COLORS = ['#FF6B6B','#FF8E53','#F5C542','#2BD9A8','#6C5CE7'];

export default function Breakout({ onExit }) {
  const cv = React.useRef(null);
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(getHighScore('breakout'));
  const [state, setState] = React.useState('ready'); // ready | play | win | over
  const st = React.useRef(null);
  const scoreRef = React.useRef(0);

  const reset = () => {
    const bricks = [];
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++)
      bricks.push({ x: 8+c*(BW+4), y: 50+r*(BH+6), alive:true, color:COLORS[r] });
    st.current = { px:(W-PADW)/2, bx:W/2, by:H-60, vx:2.6, vy:-3.2, bricks };
    setScore(0); scoreRef.current=0; setState('ready');
  };
  React.useEffect(() => { reset(); }, []);

  React.useEffect(() => {
    let raf;
    const ctx = cv.current.getContext('2d');
    const loop = () => {
      const s = st.current; if (!s) return;
      ctx.fillStyle = '#0F1A40'; ctx.fillRect(0,0,W,H);
      if (state==='play') {
        s.bx += s.vx; s.by += s.vy;
        if (s.bx<BALLR || s.bx>W-BALLR) { s.vx*=-1; sfx.tap(); }
        if (s.by<BALLR) { s.vy*=-1; sfx.tap(); }
        // paddle
        if (s.by>H-30-BALLR && s.by<H-30+BH && s.bx>s.px && s.bx<s.px+PADW && s.vy>0) {
          s.vy*=-1; const hit=(s.bx-(s.px+PADW/2))/(PADW/2); s.vx=hit*4.2; sfx.pop();
        }
        if (s.by>H) { sfx.lose(); end('over'); }
        // bricks
        s.bricks.forEach(b => {
          if (!b.alive) return;
          if (s.bx>b.x && s.bx<b.x+BW && s.by>b.y && s.by<b.y+BH) {
            b.alive=false; s.vy*=-1; sfx.coin();
            setScore(v=>{scoreRef.current=v+10;return v+10;});
          }
        });
        if (s.bricks.every(b=>!b.alive)) { sfx.win(); end('win'); }
      }
      // draw bricks
      s.bricks.forEach(b => { if(!b.alive) return; ctx.fillStyle=b.color; rr(ctx,b.x,b.y,BW,BH,5); ctx.fill(); });
      // paddle
      ctx.fillStyle='#3B82F6'; rr(ctx,s.px,H-30,PADW,PADH,6); ctx.fill();
      // ball
      ctx.fillStyle='#F5C542'; ctx.beginPath(); ctx.arc(s.bx,s.by,BALLR,0,7); ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    const end = (r) => {
      addCoins(Math.floor(scoreRef.current/5) + (r==='win'?50:0));
      if (setHighScore('breakout', scoreRef.current)) setBest(scoreRef.current);
      setState(r);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const movePaddle = (clientX) => {
    const s = st.current; const rect = cv.current.getBoundingClientRect();
    const x = (clientX-rect.left)/rect.width*W;
    s.px = Math.max(0, Math.min(W-PADW, x-PADW/2));
  };

  return (
    <GameShell title="🧱 كسر الطوب" onExit={onExit}>
      <div className="km-center km-fill" style={{ gap:12 }}>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--text-soft)' }}>
          النقاط: <b style={{color:'var(--gold)'}}>{score}</b> · الأفضل: <b style={{color:'var(--success)'}}>{best}</b>
        </div>
        <div style={{ position:'relative' }}
          onTouchMove={(e)=>movePaddle(e.touches[0].clientX)}
          onMouseMove={(e)=>e.buttons&&movePaddle(e.clientX)}>
          <canvas ref={cv} width={W} height={H} style={{
            width:'min(86vw,320px)', borderRadius:18, border:'2px solid var(--border-2)',
            touchAction:'none', boxShadow:'var(--sh-card)',
          }} />
          {state==='ready' && (
            <button onClick={()=>{setState('play');sfx.tap();}} style={{
              position:'absolute', inset:0, margin:'auto', width:'fit-content', height:'fit-content',
            }} className="km-btn km-btn-gold">ابدأ ▶</button>
          )}
        </div>
        <div style={{ fontSize:12.5, color:'var(--text-mute)' }}>حرّك إصبعك يميناً ويساراً</div>
      </div>
      {(state==='win'||state==='over') && (
        <ResultModal emoji={state==='win'?'🏆':'🧱'} title={state==='win'?'فزت!':'انتهت'} score={score} best={best}
          subtitle={`ربحت ${Math.floor(score/5)+(state==='win'?50:0)} 🪙`}>
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>لعبة جديدة</button>
        </ResultModal>
      )}
    </GameShell>
  );
}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

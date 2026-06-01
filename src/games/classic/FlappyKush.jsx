import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal } from '../../components/ui.jsx';
import { useRewardedAd } from '../../systems/RewardedAd.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const W = 320, H = 440, GAP = 130, PIPE_W = 56, GRAV = 0.42, JUMP = -7;

export default function FlappyKush({ onExit }) {
  const cv = React.useRef(null);
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(getHighScore('flappy'));
  const [over, setOver] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const ad = useRewardedAd();
  const st = React.useRef(null);
  const scoreRef = React.useRef(0);

  const reset = () => {
    st.current = { y: H/2, v: 0, pipes: [], t: 0, dead: false };
    setScore(0); scoreRef.current = 0; setOver(false); setStarted(false);
  };
  React.useEffect(() => { reset(); }, []);

  const flap = () => {
    const s = st.current; if (!s || s.dead) return;
    if (!started) setStarted(true);
    s.v = JUMP; sfx.swipe();
  };

  React.useEffect(() => {
    let raf;
    const ctx = cv.current.getContext('2d');
    const draw = () => {
      const s = st.current; if (!s) return;
      // bg
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#1B2A66'); g.addColorStop(1,'#0B1437');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

      if (started && !s.dead) {
        s.t++;
        s.v += GRAV; s.y += s.v;
        if (s.t % 95 === 0) s.pipes.push({ x: W, gap: 70 + Math.random()*(H-GAP-160), scored:false });
        s.pipes.forEach(p => p.x -= 2.4);
        s.pipes = s.pipes.filter(p => p.x > -PIPE_W);
        // collision + scoring
        s.pipes.forEach(p => {
          if (!p.scored && p.x + PIPE_W < 60) { p.scored = true; setScore(v=>{scoreRef.current=v+1;return v+1;}); sfx.coin(); }
          const inX = 60+18 > p.x && 60-18 < p.x + PIPE_W;
          if (inX && (s.y-16 < p.gap || s.y+16 > p.gap+GAP)) die();
        });
        if (s.y > H-14 || s.y < 0) die();
      }

      // pipes
      s.pipes.forEach(p => {
        ctx.fillStyle = '#2BD9A8';
        rr(ctx, p.x, 0, PIPE_W, p.gap, 8); ctx.fill();
        rr(ctx, p.x, p.gap+GAP, PIPE_W, H-(p.gap+GAP), 8); ctx.fill();
        ctx.fillStyle = '#00B894';
        rr(ctx, p.x-3, p.gap-16, PIPE_W+6, 16, 6); ctx.fill();
        rr(ctx, p.x-3, p.gap+GAP, PIPE_W+6, 16, 6); ctx.fill();
      });
      // bird
      ctx.font = '30px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.save(); ctx.translate(60, s.y);
      ctx.rotate(Math.max(-0.5, Math.min(0.9, s.v/12)));
      ctx.fillText('🐦', 0, 0); ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    const die = () => {
      const s = st.current; if (s.dead) return;
      s.dead = true; sfx.lose();
      addCoins(scoreRef.current * 2);
      if (setHighScore('flappy', scoreRef.current)) setBest(scoreRef.current);
      setOver(true);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  React.useEffect(() => {
    const k = (e) => { if (e.code==='Space'){ e.preventDefault(); flap(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [started]);

  return (
    <GameShell title="🐦 طائر كوش" onExit={onExit}>
      <div className="km-center km-fill" style={{ gap:14 }}>
        <div style={{ fontSize:38, fontWeight:900, color:'var(--gold)' }}>{score}</div>
        <div onClick={flap} onTouchStart={(e)=>{e.preventDefault();flap();}} style={{ position:'relative' }}>
          <canvas ref={cv} width={W} height={H} style={{
            width:'min(86vw,320px)', borderRadius:20, border:'2px solid var(--border-2)',
            touchAction:'none', boxShadow:'var(--sh-card)', cursor:'pointer',
          }} />
          {!started && !over && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:8, pointerEvents:'none' }}>
              <div style={{ fontSize:48 }}>👆</div>
              <div style={{ fontWeight:800, fontSize:16 }}>اضغط للطيران</div>
            </div>
          )}
        </div>
        <div style={{ fontSize:13, color:'var(--text-mute)' }}>أفضل نتيجة: <b style={{color:'var(--gold)'}}>{best}</b></div>
      </div>
      {over && (
        <ResultModal emoji="🐦" title="اصطدمت!" score={score} best={best} subtitle={`ربحت ${score*2} 🪙`}>
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>حاول مجدداً</button>
        </ResultModal>
      )}
    </GameShell>
  );
}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

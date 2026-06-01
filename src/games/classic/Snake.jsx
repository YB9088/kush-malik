import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal } from '../../components/ui.jsx';
import { useRewardedAd } from '../../systems/RewardedAd.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const N = 17;
const SPEED = 130;

export default function Snake({ onExit }) {
  const canvasRef = React.useRef(null);
  const [score, setScore] = React.useState(0);
  const [over, setOver] = React.useState(false);
  const [best, setBest] = React.useState(getHighScore('snake'));
  const ad = useRewardedAd();

  const game = React.useRef(null);
  const dirRef = React.useRef([1, 0]);
  const reviveRef = React.useRef(false);

  const reset = (keep = false) => {
    if (!keep) { setScore(0); }
    game.current = {
      snake: [[8, 8], [7, 8], [6, 8]],
      food: [12, 8],
      dir: [1, 0], next: [1, 0], dead: false,
    };
    dirRef.current = [1, 0];
    setOver(false);
  };

  React.useEffect(() => { reset(); }, []);

  React.useEffect(() => {
    let raf, last = 0;
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const SIZE = cv.width;
    const cell = SIZE / N;

    const place = (g) => {
      let f;
      do { f = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; }
      while (g.snake.some(s => s[0] === f[0] && s[1] === f[1]));
      g.food = f;
    };

    const step = () => {
      const g = game.current; if (!g || g.dead) return;
      g.dir = g.next;
      const head = [g.snake[0][0] + g.dir[0], g.snake[0][1] + g.dir[1]];
      if (head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N ||
          g.snake.some(s => s[0] === head[0] && s[1] === head[1])) {
        g.dead = true; sfx.lose();
        const won = setHighScore('snake', scoreRef.current);
        if (won) setBest(scoreRef.current);
        addCoins(Math.floor(scoreRef.current / 2));
        setOver(true);
        return;
      }
      g.snake.unshift(head);
      if (head[0] === g.food[0] && head[1] === g.food[1]) {
        sfx.coin(); setScore(s => { scoreRef.current = s + 1; return s + 1; });
        place(g);
      } else g.snake.pop();
    };

    const draw = () => {
      const g = game.current; if (!g) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      // board
      ctx.fillStyle = '#0F1A40'; ctx.fillRect(0, 0, SIZE, SIZE);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        if ((i + j) % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.015)'; ctx.fillRect(i*cell, j*cell, cell, cell); }
      }
      // food
      ctx.font = `${cell*0.9}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🍎', g.food[0]*cell + cell/2, g.food[1]*cell + cell/2);
      // snake
      g.snake.forEach((s, i) => {
        const t = i / g.snake.length;
        ctx.fillStyle = i === 0 ? '#2BD9A8' : `rgba(43,217,168,${0.95 - t*0.5})`;
        const pad = cell * 0.08;
        roundRect(ctx, s[0]*cell+pad, s[1]*cell+pad, cell-pad*2, cell-pad*2, cell*0.28);
        ctx.fill();
        if (i === 0) {
          ctx.fillStyle = '#06241B';
          const e = cell*0.13;
          ctx.beginPath(); ctx.arc(s[0]*cell+cell*0.38, s[1]*cell+cell*0.4, e, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(s[0]*cell+cell*0.62, s[1]*cell+cell*0.4, e, 0, 7); ctx.fill();
        }
      });
    };

    const loop = (t) => {
      if (t - last > SPEED) { last = t; step(); }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scoreRef = React.useRef(0);
  React.useEffect(() => { scoreRef.current = score; }, [score]);

  const turn = (d) => {
    const g = game.current; if (!g) return;
    const [cx, cy] = g.dir;
    if (d[0] === -cx && d[1] === -cy) return; // no 180°
    g.next = d; sfx.swipe();
  };

  // swipe
  const touch = React.useRef(null);
  const onStart = (e) => { const t = e.touches[0]; touch.current = [t.clientX, t.clientY]; };
  const onMove = (e) => {
    if (!touch.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touch.current[0], dy = t.clientY - touch.current[1];
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) turn([dx > 0 ? 1 : -1, 0]); else turn([0, dy > 0 ? 1 : -1]);
    touch.current = null;
  };

  React.useEffect(() => {
    const onKey = (e) => {
      const m = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };
      if (m[e.key]) { e.preventDefault(); turn(m[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const revive = async () => {
    const watched = await ad.show({ reward: 0, label: 'أكمل اللعب', emoji: '🐍' });
    if (watched) {
      const g = game.current;
      g.snake = [[8, 8], [7, 8], [6, 8]]; g.dir = [1, 0]; g.next = [1, 0]; g.dead = false;
      setOver(false);
    }
  };

  return (
    <GameShell title="🐍 الثعبان" onExit={onExit}>
      <div className="km-center km-fill" style={{ gap: 14, paddingTop: 6 }}>
        <div style={{ fontSize: 15, color: 'var(--text-soft)', fontWeight: 800 }}>
          النقاط: <b style={{ color: 'var(--success)' }}>{score}</b> · الأفضل: <b style={{ color: 'var(--gold)' }}>{best}</b>
        </div>
        <canvas
          ref={canvasRef} width={340} height={340}
          onTouchStart={onStart} onTouchMove={onMove}
          style={{ width: 'min(86vw, 340px)', height: 'min(86vw, 340px)', borderRadius: 22, border: '2px solid var(--border-2)', touchAction: 'none', boxShadow: 'var(--sh-card)' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,52px)', gap: 8, marginTop: 4 }}>
          <span />
          <Pad onClick={() => turn([0,-1])}>▲</Pad>
          <span />
          <Pad onClick={() => turn([-1,0])}>◀</Pad>
          <Pad onClick={() => turn([0,1])}>▼</Pad>
          <Pad onClick={() => turn([1,0])}>▶</Pad>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>اسحب على اللوحة أو استخدم الأزرار</div>
      </div>

      {over && (
        <ResultModal emoji="🐍" title="انتهت اللعبة!" score={score} best={best}
          subtitle={`ربحت ${Math.floor(score/2)} 🪙`}>
          <button className="km-ad-btn" onClick={revive} style={{ marginBottom: 10 }}>
            <span className="play">▶</span> شاهد إعلاناً وأكمل من حيث توقفت
          </button>
          <button className="km-btn km-btn-royal km-btn-block" onClick={() => { sfx.tap(); reset(); }}>
            لعبة جديدة
          </button>
        </ResultModal>
      )}
    </GameShell>
  );
}

function Pad({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 52, height: 52, borderRadius: 16, fontSize: 20,
      background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)',
      cursor: 'pointer',
    }}>{children}</button>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

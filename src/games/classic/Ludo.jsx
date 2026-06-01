import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal, Confetti } from '../../components/ui.jsx';
import { useRewardedAd } from '../../systems/RewardedAd.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';
import {
  RING, SAFE, COLORS, COLOR_BY_ID, cellAt, ringIndexAt,
  legalMoves, applyMove, cpuPick, allHome, FINISH,
} from './ludoEngine.js';

const CELL = 24;             // بكسل لكل خانة
const BOARD = CELL * 15;     // 360
const DICE_FACE = ['','⚀','⚁','⚂','⚃','⚄','⚅'];

// ─── شاشة الإعداد ───
function Setup({ onStart }) {
  const [seats, setSeats] = React.useState(['human','cpu','cpu','cpu']);
  const cycle = (i) => setSeats(s => {
    const n = s.slice(); const order = ['human','cpu','off'];
    n[i] = order[(order.indexOf(n[i]) + 1) % 3];
    return n;
  });
  const active = seats.filter(s => s !== 'off').length;
  const preset = (arr) => setSeats(arr);

  return (
    <div className="km-fill km-center" style={{ gap:18, padding:'10px 4px' }}>
      <div style={{ fontSize:60 }}>🎲</div>
      <h2 style={{ margin:0, fontSize:24, fontWeight:900 }}>لودو ملك</h2>
      <p style={{ color:'var(--text-soft)', margin:0, fontSize:14, textAlign:'center' }}>
        اختر اللاعبين — اضغط على كل لون لتبديله
      </p>

      <div style={{ display:'flex', gap:10 }}>
        <button className="km-btn km-btn-ghost" style={{ fontSize:13, padding:'9px 14px' }}
          onClick={()=>preset(['human','cpu','cpu','cpu'])}>ضد الكمبيوتر 🤖</button>
        <button className="km-btn km-btn-ghost" style={{ fontSize:13, padding:'9px 14px' }}
          onClick={()=>preset(['human','off','human','off'])}>لاعبان 👥</button>
        <button className="km-btn km-btn-ghost" style={{ fontSize:13, padding:'9px 14px' }}
          onClick={()=>preset(['human','human','human','human'])}>٤ لاعبين</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:'min(90vw,330px)' }}>
        {COLORS.map((c,i) => (
          <button key={c.id} onClick={()=>{cycle(i);sfx.tap();}} style={{
            padding:'14px 12px', borderRadius:16, cursor:'pointer',
            background: seats[i]==='off' ? 'var(--surface)' : `linear-gradient(160deg, ${c.hex}, ${c.dark})`,
            border:`2px solid ${seats[i]==='off'?'var(--border-2)':c.hex}`,
            opacity: seats[i]==='off' ? 0.5 : 1, color:'#fff',
            display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          }}>
            <span style={{ fontSize:26 }}>{seats[i]==='human'?'🧑':seats[i]==='cpu'?'🤖':'➖'}</span>
            <span style={{ fontWeight:800, fontSize:14 }}>{c.name}</span>
            <span style={{ fontSize:11, opacity:0.9 }}>
              {seats[i]==='human'?'إنسان':seats[i]==='cpu'?'كمبيوتر':'معطّل'}
            </span>
          </button>
        ))}
      </div>

      <button className="km-btn km-btn-gold" disabled={active<2} style={{ minWidth:200, marginTop:4 }}
        onClick={()=>{ sfx.win(); onStart(seats); }}>
        {active<2 ? 'اختر لاعبَين على الأقل' : `ابدأ اللعب (${active} لاعبين) ▶`}
      </button>
    </div>
  );
}

// ─── اللوحة ───
function Board({ tokens, activeColors, movable, turnColor, onToken, dice }) {
  // تجميع البيادق حسب الخانة لإزاحة المتراكمة
  const placed = [];
  activeColors.forEach(cid => {
    tokens[cid].forEach((pos, i) => {
      const c = COLOR_BY_ID[cid];
      let r, col;
      if (pos === -1) { [r, col] = c.yard[i]; }
      else { const [rr, cc] = cellAt(cid, pos); r = rr; col = cc; }
      placed.push({ cid, i, pos, r, col, hex:c.hex, dark:c.dark });
    });
  });
  // إزاحة بسيطة عند التراكم على نفس الخانة
  const key = (p) => `${Math.round(p.r)},${Math.round(p.col)}`;
  const groups = {};
  placed.forEach(p => { if (p.pos>=0) { (groups[key(p)] ||= []).push(p); } });

  return (
    <div style={{
      position:'relative', width:BOARD, height:BOARD, flexShrink:0,
      borderRadius:16, overflow:'hidden', background:'#0F1A40',
      border:'3px solid var(--border-2)', boxShadow:'var(--sh-card)',
    }}>
      {/* الساحات (yards) */}
      {COLORS.map(c => {
        const isTop = c.id==='red'||c.id==='green';
        const isLeft = c.id==='red'||c.id==='blue';
        return (
          <div key={c.id} style={{
            position:'absolute', width:CELL*6, height:CELL*6,
            top: isTop?0:CELL*9, left: isLeft?0:CELL*9,
            background:`linear-gradient(160deg, ${c.hex}, ${c.dark})`,
            opacity: activeColors.includes(c.id)?1:0.28,
          }}>
            <div style={{ position:'absolute', inset:CELL*0.9, background:'#0F1A40', borderRadius:10 }} />
          </div>
        );
      })}

      {/* مسار الحلقة */}
      {RING.map(([r,col],idx) => (
        <span key={'r'+idx} style={{
          position:'absolute', top:r*CELL, left:col*CELL, width:CELL, height:CELL,
          border:'1px solid rgba(255,255,255,0.08)', boxSizing:'border-box',
          background: SAFE.has(idx) ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:11,
        }}>{SAFE.has(idx)?'★':''}</span>
      ))}
      {/* خانات انطلاق ملوّنة */}
      {COLORS.filter(c=>activeColors.includes(c.id)).map(c => {
        const [r,col] = RING[c.start];
        return <span key={'s'+c.id} style={{ position:'absolute', top:r*CELL, left:col*CELL,
          width:CELL, height:CELL, background:c.hex, opacity:0.6, boxSizing:'border-box' }} />;
      })}
      {/* أعمدة البيوت */}
      {COLORS.filter(c=>activeColors.includes(c.id)).map(c =>
        [51,52,53,54,55,56].map(p => {
          const [r,col] = cellAt(c.id, p);
          return <span key={`h${c.id}${p}`} style={{ position:'absolute', top:r*CELL, left:col*CELL,
            width:CELL, height:CELL, background:c.hex, opacity:0.55, boxSizing:'border-box',
            border:'1px solid rgba(0,0,0,0.15)' }} />;
        })
      )}
      {/* المركز */}
      <div style={{ position:'absolute', top:CELL*6, left:CELL*6, width:CELL*3, height:CELL*3,
        background:'radial-gradient(circle, #243168, #0F1A40)', display:'flex',
        alignItems:'center', justifyContent:'center', fontSize:26 }}>🏆</div>

      {/* البيادق */}
      {placed.map(p => {
        const g = p.pos>=0 ? groups[key(p)] : null;
        let dx = 0, dy = 0;
        if (g && g.length > 1) {
          const k = g.indexOf(p);
          dx = (k % 2) * 9 - 4.5; dy = (Math.floor(k/2)) * 9 - 4.5;
        }
        const canMove = p.cid === turnColor && movable.includes(p.i);
        return (
          <button key={p.cid+p.i} onClick={()=> canMove && onToken(p.i)} style={{
            position:'absolute',
            top: p.r*CELL + CELL/2 - 9 + dy, left: p.col*CELL + CELL/2 - 9 + dx,
            width:18, height:18, borderRadius:'50%', padding:0,
            background:`radial-gradient(circle at 35% 30%, #fff 0%, ${p.hex} 45%, ${p.dark} 100%)`,
            border:'2px solid #fff', cursor: canMove?'pointer':'default',
            boxShadow: canMove ? `0 0 0 3px ${p.hex}, 0 0 12px ${p.hex}` : '0 2px 4px rgba(0,0,0,0.4)',
            animation: canMove ? 'km-coinpop 0.9s var(--ease-bounce) infinite' : 'none',
            zIndex: canMove ? 5 : 2, transition:'top .25s var(--ease-out), left .25s var(--ease-out)',
          }} />
        );
      })}
    </div>
  );
}

export default function Ludo({ onExit }) {
  const ad = useRewardedAd();
  const [seats, setSeats] = React.useState(null);
  const [tokens, setTokens] = React.useState(null);
  const [turnIdx, setTurnIdx] = React.useState(0);   // فهرس داخل activeColors
  const [dice, setDice] = React.useState(null);
  const [phase, setPhase] = React.useState('roll');  // roll | move | over
  const [movable, setMovable] = React.useState([]);
  const [winner, setWinner] = React.useState(null);
  const [msg, setMsg] = React.useState('');
  const [rolling, setRolling] = React.useState(false);
  const [luckyUsed, setLuckyUsed] = React.useState(false);
  const sixRef = React.useRef(0);

  const activeColors = React.useMemo(
    () => seats ? COLORS.filter((_,i)=>seats[i]!=='off').map(c=>c.id) : [], [seats]);
  const turnColor = activeColors[turnIdx];
  const isCPU = seats && turnColor && seats[COLORS.findIndex(c=>c.id===turnColor)] === 'cpu';

  const start = (s) => {
    setSeats(s);
    const tk = {};
    COLORS.forEach((c,i)=>{ if (s[i]!=='off') tk[c.id] = [-1,-1,-1,-1]; });
    setTokens(tk); setTurnIdx(0); setPhase('roll'); setDice(null);
    setWinner(null); setMsg(''); setLuckyUsed(false); sixRef.current = 0;
  };

  const nextTurn = (extra=false) => {
    setDice(null); setMovable([]);
    if (!extra) { sixRef.current = 0; setTurnIdx(t => (t + 1) % activeColors.length); }
    setPhase('roll');
  };

  const doRoll = (forced) => {
    if (rolling || phase!=='roll') return;
    setRolling(true); sfx.swipe();
    let ticks = 0;
    const spin = setInterval(() => {
      setDice(1 + Math.floor(Math.random()*6)); ticks++;
      if (ticks > 8) {
        clearInterval(spin);
        const d = forced || (1 + Math.floor(Math.random()*6));
        setDice(d); setRolling(false); resolveRoll(d);
      }
    }, 70);
  };

  const resolveRoll = (d) => {
    sfx.pop();
    if (d === 6) sixRef.current++;
    const moves = legalMoves(tokens, turnColor, d);
    if (sixRef.current === 3) { setMsg('ثلاث ستات! تفوت الدور'); setTimeout(()=>{setMsg('');nextTurn(false);}, 900); return; }
    if (moves.length === 0) {
      setMsg(d===6?'لا حركة ممكنة':'لا حركة — الدور التالي');
      setTimeout(()=>{ setMsg(''); nextTurn(d===6 && sixRef.current<3 ? true : false); }, 850);
      return;
    }
    setMovable(moves); setPhase('move');
  };

  const move = (tokenIdx) => {
    if (phase!=='move') return;
    const tk = JSON.parse(JSON.stringify(tokens));
    const res = applyMove(tk, turnColor, tokenIdx, dice);
    setTokens(tk);
    if (res.captured) sfx.coin(); else sfx.tap();

    if (allHome(tk[turnColor])) {
      setPhase('over'); setWinner(turnColor);
      const human = seats[COLORS.findIndex(c=>c.id===turnColor)]==='human';
      if (human) { addCoins(120); sfx.win(); } else sfx.lose();
      return;
    }
    const extra = dice === 6 || res.captured || res.finished;
    setMovable([]); setPhase('roll'); setDice(extra?dice:null);
    setTimeout(()=>nextTurn(extra), 350);
  };

  // قيادة الكمبيوتر
  React.useEffect(() => {
    if (!tokens || phase==='over' || !isCPU) return;
    if (phase==='roll' && !rolling && dice==null) {
      const id = setTimeout(()=>doRoll(), 650); return ()=>clearTimeout(id);
    }
    if (phase==='move' && movable.length) {
      const id = setTimeout(()=>{
        const pick = cpuPick(tokens, turnColor, dice, movable);
        move(pick);
      }, 700); return ()=>clearTimeout(id);
    }
  }, [phase, isCPU, rolling, movable, dice, tokens]);

  // رمية الحظ المضمونة (إعلان مكافأة) — للإنسان فقط حين كل البيادق بالبيت ولا ٦
  const luckySix = async () => {
    const w = await ad.show({ reward:0, label:'رمية ٦ مضمونة', emoji:'🎲' });
    if (w) { setLuckyUsed(true); doRoll(6); }
  };

  if (!seats) {
    return <GameShell title="🎲 لودو ملك" onExit={onExit}><Setup onStart={start} /></GameShell>;
  }

  const tc = COLOR_BY_ID[turnColor];
  const humanTurn = !isCPU && phase!=='over';
  const allInYard = tokens && tokens[turnColor]?.every(p=>p===-1);

  return (
    <GameShell title="🎲 لودو ملك" onExit={onExit}>
      <div className="km-fill" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        {/* مؤشر الدور */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:10, padding:'8px 18px', borderRadius:999,
          background:`linear-gradient(160deg, ${tc.hex}, ${tc.dark})`, color:'#fff', fontWeight:800,
          boxShadow:`0 6px 18px -4px ${tc.hex}`,
        }}>
          <span style={{ fontSize:18 }}>{isCPU?'🤖':'🧑'}</span>
          <span>دور {tc.name}</span>
          {msg && <span style={{ fontSize:12, opacity:0.9 }}>· {msg}</span>}
        </div>

        <Board tokens={tokens} activeColors={activeColors} movable={movable}
          turnColor={turnColor} onToken={move} dice={dice} />

        {/* النرد والتحكم */}
        <div style={{ display:'flex', alignItems:'center', gap:14, minHeight:64 }}>
          <div style={{
            width:58, height:58, borderRadius:14, background:'#fff', color:'#1A2540',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:44,
            boxShadow:'0 6px 16px -4px rgba(0,0,0,0.5)',
            transform: rolling?'rotate(12deg) scale(1.05)':'none', transition:'transform .1s',
          }}>{dice ? DICE_FACE[dice] : '🎲'}</div>

          {humanTurn && phase==='roll' && (
            <button className="km-btn km-btn-gold" onClick={()=>doRoll()} disabled={rolling}>
              {rolling ? 'ترمي…' : 'ارمِ النرد 🎲'}
            </button>
          )}
          {humanTurn && phase==='move' && (
            <div style={{ fontSize:14, fontWeight:800, color:'var(--gold)' }}>اختر بيدقاً يلمع ✨</div>
          )}
          {isCPU && phase!=='over' && (
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text-soft)' }}>الكمبيوتر يلعب…</div>
          )}
        </div>

        {/* رمية الحظ عبر إعلان */}
        {humanTurn && phase==='roll' && allInYard && !luckyUsed && (
          <button className="km-ad-btn" onClick={luckySix} style={{ maxWidth:300 }}>
            <span className="play">🎲</span> عالق؟ شاهد إعلاناً واحصل على ٦ مضمونة
          </button>
        )}

        <div style={{ fontSize:11.5, color:'var(--text-mute)', textAlign:'center', maxWidth:330 }}>
          اطرح ٦ لإخراج البيدق · ★ خانات آمنة · من يُدخل بيادقه الأربعة للبيت 🏆 يفوز
        </div>
      </div>

      {phase==='over' && (
        <ResultModal emoji="🏆" title={`فاز ${COLOR_BY_ID[winner].name}!`}
          subtitle={seats[COLORS.findIndex(c=>c.id===winner)]==='human' ? 'ربحت 120 🪙 🎉' : 'حظ أوفر المرة القادمة'}>
          <Confetti run />
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();setSeats(null);}}>
            لعبة جديدة
          </button>
        </ResultModal>
      )}
    </GameShell>
  );
}

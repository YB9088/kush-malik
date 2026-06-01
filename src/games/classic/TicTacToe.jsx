import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal, Confetti } from '../../components/ui.jsx';
import { addCoins } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winner = (b) => { for (const [a,c,d] of LINES) if (b[a] && b[a]===b[c] && b[a]===b[d]) return b[a]; return null; };

const best = (b, player) => { // minimax for 'O' (AI)
  const w = winner(b);
  if (w === 'O') return { score: 1 };
  if (w === 'X') return { score: -1 };
  if (b.every(Boolean)) return { score: 0 };
  let move = null, bestScore = player === 'O' ? -2 : 2;
  b.forEach((v, i) => {
    if (v) return;
    const nb = b.slice(); nb[i] = player;
    const s = best(nb, player === 'O' ? 'X' : 'O').score;
    if (player === 'O' ? s > bestScore : s < bestScore) { bestScore = s; move = i; }
  });
  return { score: bestScore, move };
};

export default function TicTacToe({ onExit }) {
  const [board, setBoard] = React.useState(Array(9).fill(null));
  const [turn, setTurn] = React.useState('X');
  const [result, setResult] = React.useState(null); // 'X' | 'O' | 'draw'
  const [hard, setHard] = React.useState(true);

  const w = winner(board);
  React.useEffect(() => {
    if (w) { setResult(w); if (w === 'X') { sfx.win(); addCoins(20); } else sfx.lose(); return; }
    if (board.every(Boolean)) { setResult('draw'); sfx.pop(); return; }
    if (turn === 'O') {
      const id = setTimeout(() => {
        const empty = board.map((v,i)=>v?null:i).filter(v=>v!=null);
        let move;
        if (hard) move = best(board, 'O').move;
        else move = empty[Math.floor(Math.random()*empty.length)];
        const nb = board.slice(); nb[move] = 'O'; sfx.tap();
        setBoard(nb); setTurn('X');
      }, 420);
      return () => clearTimeout(id);
    }
  }, [board, turn]);

  const play = (i) => {
    if (board[i] || turn !== 'X' || result) return;
    const nb = board.slice(); nb[i] = 'X'; sfx.pop();
    setBoard(nb); setTurn('O');
  };
  const reset = () => { setBoard(Array(9).fill(null)); setTurn('X'); setResult(null); };

  return (
    <GameShell title="⭕ إكس أو" onExit={onExit}>
      <div className="km-center km-fill" style={{ gap: 18 }}>
        <div style={{ display:'flex', gap:8 }}>
          <Chip on={hard} onClick={()=>{setHard(true);reset();}}>صعب 🤖</Chip>
          <Chip on={!hard} onClick={()=>{setHard(false);reset();}}>سهل 😊</Chip>
        </div>
        <div style={{ fontSize:16, fontWeight:800, color:'var(--text-soft)' }}>
          {result ? ' ' : turn === 'X' ? 'دورك (X) ✖️' : 'دور الخصم (O) ⭕'}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,90px)', gridTemplateRows:'repeat(3,90px)', gap:10 }}>
          {board.map((v,i) => (
            <button key={i} onClick={()=>play(i)} style={{
              borderRadius:18, fontSize:46, fontWeight:900, cursor:'pointer',
              background: v ? 'var(--card-2)' : 'var(--surface)',
              border:'1px solid var(--border-2)',
              color: v==='X' ? 'var(--c-classic)' : 'var(--royal-2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'transform 0.15s var(--ease-bounce)',
            }}>{v==='X'?'✖️':v==='O'?'⭕':''}</button>
          ))}
        </div>
      </div>
      {result && (
        <ResultModal
          emoji={result==='X'?'🏆':result==='O'?'😅':'🤝'}
          title={result==='X'?'فزت!':result==='O'?'خسرت':'تعادل'}
          subtitle={result==='X'?'ربحت 20 🪙':result==='O'?'حاول مرة أخرى':'لا غالب ولا مغلوب'}>
          {result==='X' && <Confetti run />}
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();reset();}}>
            العب مجدداً
          </button>
        </ResultModal>
      )}
    </GameShell>
  );
}

function Chip({ children, on, onClick }) {
  return <button onClick={onClick} style={{
    padding:'8px 16px', borderRadius:999, cursor:'pointer', fontWeight:800, fontSize:13.5,
    background: on ? 'linear-gradient(180deg,var(--royal-2),var(--royal))' : 'var(--surface)',
    color:'#fff', border: on?'none':'1px solid var(--border-2)',
  }}>{children}</button>;
}

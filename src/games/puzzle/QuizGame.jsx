import React from 'react';
import GameShell from '../../components/GameShell.jsx';
import { ResultModal, Confetti } from '../../components/ui.jsx';
import { useRewardedAd } from '../../systems/RewardedAd.jsx';
import { addCoins, getHighScore, setHighScore } from '../../systems/wallet.js';
import { sfx } from '../../systems/sound.js';

const shuffle = (a) => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);

export default function QuizGame({ onExit, data, gameId, title, accent }) {
  const [qs] = React.useState(() => shuffle(data.questions).slice(0, 10));
  const [idx, setIdx] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [hintUsed, setHintUsed] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [removed, setRemoved] = React.useState([]);
  const [done, setDone] = React.useState(false);
  const [best, setBest] = React.useState(getHighScore(gameId));
  const ad = useRewardedAd();

  const q = qs[idx];

  const pick = (i) => {
    if (picked != null) return;
    setPicked(i);
    if (i === q.c) { sfx.correct(); setScore(s=>s+1); addCoins(10); }
    else sfx.wrong();
    setTimeout(next, 1100);
  };

  const next = () => {
    if (idx + 1 >= qs.length) {
      setDone(true); sfx.win();
      const finalScore = score; // score already updated via state batching; recompute below
      return;
    }
    setIdx(i=>i+1); setPicked(null); setShowHint(false); setHintUsed(false); setRemoved([]);
  };

  React.useEffect(() => {
    if (done) {
      addCoins(score * 5);
      if (setHighScore(gameId, score)) setBest(score);
    }
  }, [done]);

  // Rewarded-ad: hint (reveals tip), or 50/50 (removes two wrong)
  const watchForHint = async () => {
    const w = await ad.show({ reward: 0, label: 'احصل على تلميح', emoji: '💡' });
    if (w) { setShowHint(true); setHintUsed(true); }
  };
  const watchFor5050 = async () => {
    const w = await ad.show({ reward: 0, label: 'احذف إجابتين خاطئتين', emoji: '✂️' });
    if (w) {
      const wrong = q.a.map((_,i)=>i).filter(i=>i!==q.c);
      setRemoved(shuffle(wrong).slice(0,2));
    }
  };

  const restart = () => {
    setIdx(0); setScore(0); setPicked(null); setShowHint(false); setHintUsed(false);
    setRemoved([]); setDone(false);
  };

  return (
    <GameShell title={`${data.emoji} ${title}`} onExit={onExit} accent={accent}>
      <div className="km-fill" style={{ display:'flex', flexDirection:'column', gap:16, paddingTop:6 }}>
        {/* progress */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:8, borderRadius:99, background:'var(--surface)', overflow:'hidden' }}>
            <div style={{ width:`${(idx)/qs.length*100}%`, height:'100%', background:`linear-gradient(90deg,${accent},var(--gold))`, transition:'width .4s var(--ease-out)' }} />
          </div>
          <span style={{ fontSize:13, fontWeight:800, color:'var(--text-soft)' }}>{idx+1}/{qs.length}</span>
        </div>

        <div style={{ textAlign:'center', fontSize:13, fontWeight:800, color:'var(--gold)' }}>النقاط: {score} 🪙</div>

        {/* question */}
        <div style={{
          background:'linear-gradient(160deg,var(--card-2),var(--card))', border:'1px solid var(--border-2)',
          borderRadius:'var(--r-lg)', padding:'24px 18px', textAlign:'center', minHeight:120,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:19, fontWeight:800, lineHeight:1.6, boxShadow:'var(--sh-card)',
        }}>{q.q}</div>

        {showHint && (
          <div style={{ background:'rgba(245,197,66,0.12)', border:'1px solid rgba(245,197,66,0.4)',
            borderRadius:14, padding:'10px 14px', fontSize:14, color:'var(--gold)', fontWeight:700, textAlign:'center' }}>
            💡 {q.hint}
          </div>
        )}

        {/* options */}
        <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
          {q.a.map((opt,i) => {
            const isC = i === q.c, isP = i === picked;
            let bg = 'var(--surface)', bd = 'var(--border-2)', col = 'var(--text)';
            if (picked!=null) {
              if (isC) { bg='rgba(43,217,168,0.18)'; bd='var(--success)'; col='var(--success)'; }
              else if (isP) { bg='rgba(255,90,110,0.16)'; bd='var(--danger)'; col='var(--danger)'; }
            }
            if (removed.includes(i)) return <div key={i} style={{ height:0 }} />;
            return (
              <button key={i} onClick={()=>pick(i)} disabled={picked!=null} style={{
                background:bg, border:`1.5px solid ${bd}`, color:col,
                borderRadius:16, padding:'15px 18px', fontSize:16, fontWeight:800,
                textAlign:'start', cursor: picked!=null?'default':'pointer',
                display:'flex', alignItems:'center', gap:12,
                transition:'all .2s',
              }}>
                <span style={{ width:28, height:28, borderRadius:'50%', flexShrink:0,
                  background:'var(--surface-2)', display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, fontWeight:900 }}>{['أ','ب','ج','د'][i]}</span>
                <span style={{ flex:1 }}>{opt}</span>
                {picked!=null && isC && '✅'}
                {picked!=null && isP && !isC && '❌'}
              </button>
            );
          })}
        </div>

        {/* rewarded lifelines — user taps to watch */}
        {picked==null && (
          <div style={{ display:'flex', gap:10, marginTop:2 }}>
            <button className="km-ad-btn" onClick={watchForHint} disabled={hintUsed}
              style={{ flex:1, opacity:hintUsed?0.5:1 }}>
              <span className="play">💡</span> تلميح
            </button>
            <button className="km-ad-btn" onClick={watchFor5050} disabled={removed.length>0}
              style={{ flex:1, opacity:removed.length?0.5:1 }}>
              <span className="play">✂️</span> ٥٠/٥٠
            </button>
          </div>
        )}
      </div>

      {done && (
        <ResultModal emoji={score>=qs.length*0.7?'🏆':'📚'} title={`${score}/${qs.length}`}
          subtitle={`ربحت ${score*5 + score*10} 🪙 إجمالاً`} best={best} score={score}>
          {score>=qs.length*0.7 && <Confetti run />}
          <button className="km-btn km-btn-royal km-btn-block" onClick={()=>{sfx.tap();restart();}}>
            تحدَّ مرة أخرى
          </button>
        </ResultModal>
      )}
    </GameShell>
  );
}

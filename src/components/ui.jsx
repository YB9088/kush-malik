import React from 'react';

export function Confetti({ run, count = 28 }) {
  const pieces = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    dur: 1.4 + Math.random() * 1.2,
    color: ['#F5C542', '#FF6B6B', '#6C5CE7', '#2BD9A8', '#3B82F6', '#FF4FA3'][i % 6],
    rot: Math.random() * 360,
    size: 7 + Math.random() * 7,
  })), [count, run]);
  if (!run) return null;
  return (
    <>
      {pieces.map(p => (
        <span key={p.i} className="km-confetti" style={{
          left: `${p.left}%`, width: p.size, height: p.size, background: p.color,
          borderRadius: p.i % 2 ? '50%' : 2,
          animation: `km-fall ${p.dur}s ${p.delay}s var(--ease-out) forwards`,
        }} />
      ))}
      <style>{`@keyframes km-fall{to{transform:translateY(120vh) rotate(${720}deg);opacity:0}}`}</style>
    </>
  );
}

// Reusable game-over / win modal with optional rewarded "continue" or "double".
export function ResultModal({ emoji, title, subtitle, score, best, children }) {
  return (
    <div className="km-backdrop">
      <div className="km-modal">
        <div style={{ fontSize: 56 }}>{emoji}</div>
        <h3 style={{ margin: '8px 0 2px', fontSize: 24, fontWeight: 900 }}>{title}</h3>
        {subtitle && <p style={{ color: 'var(--text-soft)', fontSize: 14.5, margin: '0 0 8px' }}>{subtitle}</p>}
        {score != null && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 26, margin: '10px 0 18px' }}>
            <Stat label="نقاطك" value={score} />
            {best != null && <Stat label="أفضل نتيجة" value={best} gold />}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Stat({ label, value, gold }) {
  return (
    <div>
      <div style={{ fontSize: 30, fontWeight: 900, color: gold ? 'var(--gold)' : 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-mute)', fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// A reward CTA the player taps to earn coins via a rewarded ad.
export function RewardAdCTA({ onWatch, label = 'شاهد إعلاناً واربح 50 🪙', reward = 50 }) {
  return (
    <button className="km-ad-btn" onClick={onWatch} style={{ marginBottom: 10 }}>
      <span className="play">▶</span>
      {label}
    </button>
  );
}

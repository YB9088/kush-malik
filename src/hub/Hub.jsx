import React from 'react';
import { CATEGORIES, GAMES, gamesByCat } from '../registry.js';
import { useWallet } from '../systems/wallet.js';
import { useRewardedAd } from '../systems/RewardedAd.jsx';
import { sfx, toggleMute, isMuted } from '../systems/sound.js';

function GameCard({ game, onOpen }) {
  const cat = CATEGORIES.find(c => c.id === game.cat);
  return (
    <button className="km-card" onClick={() => { sfx.pop(); onOpen(game.id); }}>
      <div className="km-card-art" style={{
        background: `linear-gradient(160deg, ${cat.color} 0%, ${cat.color2} 100%)`,
      }}>
        <span className="km-card-emoji">{game.emoji}</span>
        <span className="km-card-shine" />
        <span className="km-card-badge">{game.tag}</span>
        {game.isNew && <span className="km-card-new">جديد ✦</span>}
      </div>
      <div className="km-card-body">
        <div className="km-card-name">{game.title}</div>
        <div className="km-card-meta">اضغط للعب ▸</div>
      </div>
    </button>
  );
}

function CategoryRow({ cat, onOpen }) {
  const games = gamesByCat(cat.id);
  return (
    <section className="km-cat">
      <div className="km-cat-head">
        <span className="km-cat-badge" style={{
          background: `linear-gradient(160deg, ${cat.color}, ${cat.color2})`,
        }}>{cat.emoji}</span>
        <div>
          <div className="km-cat-title">{cat.title}</div>
          <div className="km-cat-sub">{cat.sub} · {games.length} ألعاب</div>
        </div>
      </div>
      <div className="km-row">
        {games.map(g => <GameCard key={g.id} game={g} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

export default function Hub({ onOpen }) {
  const { coins } = useWallet();
  const ad = useRewardedAd();
  const [muted, setMuted] = React.useState(isMuted());
  const [toast, setToast] = React.useState(null);

  const dailyGift = async () => {
    sfx.tap();
    const watched = await ad.show({ reward: 100, label: 'هديتك اليومية!', emoji: '🎁' });
    if (watched) { setToast('+100 🪙 أضيفت لرصيدك'); setTimeout(() => setToast(null), 2200); }
  };

  return (
    <div style={{ position: 'relative', zIndex: 2, paddingBottom: 30, height: '100dvh', overflowY: 'auto' }}>
      <div className="km-hub-head">
        <div className="km-wallet">
          <span className="km-coin-spin">🪙</span>
          <span>{coins}</span>
        </div>
        <button className="km-iconbtn" onClick={() => { const m = toggleMute(); setMuted(m); sfx.tap(); }}
          aria-label="الصوت">
          {muted ? '🔇' : '🔊'}
        </button>
        <h1 className="km-logo"><span className="crown">👑</span> كوش ملك</h1>
        <div className="km-tag">مدينة الألعاب · {GAMES.length} لعبة وتزيد</div>
      </div>

      {/* daily reward banner */}
      <div style={{ padding: '6px 18px 4px', position: 'relative', zIndex: 2 }}>
        <button className="km-ad-btn" onClick={dailyGift}>
          <span className="play">🎁</span>
          استلم هديتك اليومية — شاهد إعلاناً واربح 100 🪙
        </button>
      </div>

      {CATEGORIES.map(cat => <CategoryRow key={cat.id} cat={cat} onOpen={onOpen} />)}

      <div style={{ textAlign: 'center', color: 'var(--text-mute)', fontSize: 12, marginTop: 8 }}>
        المزيد من الألعاب قريباً 🚀
      </div>

      {toast && <div className="km-toast">✅ {toast}</div>}
    </div>
  );
}

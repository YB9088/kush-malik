import React from 'react';
import { sfx } from './sound.js';
import { addCoins } from './wallet.js';

/*
 * Rewarded Ad system — USER-INITIATED ONLY.
 * No interstitials, no surprise pop-ups. The player taps a clearly
 * labelled button, watches a short video, then receives the reward.
 *
 * ▼▼▼ REAL ADMOB INTEGRATION POINT ▼▼▼
 * This simulates a rewarded video. To go live, replace `runAd()` with the
 * AdMob/AdSense Rewarded call. On the reward callback, resolve(true).
 *   - Web (H5 games / AdSense for Games):  googletag rewarded slot
 *   - Android wrapper (Capacitor/Cordova): admob-plus RewardVideo
 * Keep the same resolve(true=watched / false=skipped) contract and every
 * game keeps working unchanged.
 * ▲▲▲ ------------------------------- ▲▲▲
 */

const AdContext = React.createContext(null);
export const useRewardedAd = () => React.useContext(AdContext);

export function RewardedAdProvider({ children }) {
  const [ad, setAd] = React.useState(null); // { reward, label, resolve }
  const [phase, setPhase] = React.useState('offer'); // offer | playing | done
  const [secs, setSecs] = React.useState(5);
  const resolveRef = React.useRef(null);

  // show({ reward, label }) → Promise<boolean watched>
  const show = React.useCallback(({ reward = 0, label = '', emoji = '🎁' } = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setAd({ reward, label, emoji });
      setPhase('offer');
      setSecs(5);
    });
  }, []);

  const finish = (watched) => {
    const r = resolveRef.current; resolveRef.current = null;
    setAd(null); setPhase('offer');
    if (watched && ad?.reward) { addCoins(ad.reward); sfx.reward(); }
    r && r(watched);
  };

  // countdown while "playing"
  React.useEffect(() => {
    if (phase !== 'playing') return;
    if (secs <= 0) { setPhase('done'); sfx.win(); return; }
    const id = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, secs]);

  const startWatch = () => {
    sfx.tap();
    // ◀ REAL ADMOB: call rewarded.show() here instead of the timer.
    setPhase('playing');
  };

  return (
    <AdContext.Provider value={{ show }}>
      {children}
      {ad && (
        <div className="km-backdrop">
          <div className="km-modal">
            {phase === 'offer' && (
              <>
                <div style={{ fontSize: 54 }}>{ad.emoji}</div>
                <h3 style={{ margin: '10px 0 4px', fontSize: 21, fontWeight: 900 }}>
                  {ad.label || 'شاهد إعلاناً واربح'}
                </h3>
                <p style={{ color: 'var(--text-soft)', fontSize: 14, margin: '0 0 18px', lineHeight: 1.6 }}>
                  شاهد فيديو قصيراً واحصل على
                  <b style={{ color: 'var(--gold)' }}> {ad.reward} <span>🪙</span></b>
                </p>
                <button className="km-ad-btn" onClick={startWatch}>
                  <span className="play">▶</span>
                  شاهد الإعلان الآن
                </button>
                <button className="km-btn km-btn-ghost km-btn-block" style={{ marginTop: 10 }}
                  onClick={() => finish(false)}>
                  لا، شكراً
                </button>
              </>
            )}

            {phase === 'playing' && (
              <>
                <div className="km-center" style={{ gap: 14, padding: '14px 0' }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    border: '5px solid rgba(255,255,255,0.12)',
                    borderTopColor: 'var(--gold)',
                    animation: 'spin 0.9s linear infinite',
                  }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>الإعلان قيد التشغيل…</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--gold)' }}>{secs}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>
                    لا تُغلق النافذة لتحصل على مكافأتك
                  </div>
                </div>
              </>
            )}

            {phase === 'done' && (
              <>
                <div style={{ fontSize: 56 }}>🎉</div>
                <h3 style={{ margin: '10px 0 4px', fontSize: 22, fontWeight: 900 }}>أحسنت!</h3>
                <p style={{ color: 'var(--text-soft)', fontSize: 15, margin: '0 0 18px' }}>
                  ربحت <b style={{ color: 'var(--gold)' }}>{ad.reward} 🪙</b>
                </p>
                <button className="km-btn km-btn-gold km-btn-block" onClick={() => finish(true)}>
                  استلم المكافأة
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AdContext.Provider>
  );
}

import React from 'react';
import { useWallet } from '../systems/wallet.js';
import { sfx } from '../systems/sound.js';

// Wraps every game: top bar with back button, title, and live coin counter.
export default function GameShell({ title, accent, onExit, children, right }) {
  const { coins } = useWallet();
  return (
    <div className="km-game" style={accent ? { ['--accent']: accent } : undefined}>
      <div className="km-game-bar">
        <button className="km-back" onClick={() => { sfx.tap(); onExit(); }} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
        <div className="km-game-title">{title}</div>
        {right}
        <div className="km-wallet" style={{ position: 'static' }}>
          <span className="km-coin-spin">🪙</span>
          <span>{coins}</span>
        </div>
      </div>
      <div className="km-game-body">{children}</div>
    </div>
  );
}

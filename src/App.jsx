import React from 'react';
import { RewardedAdProvider } from './systems/RewardedAd.jsx';
import Hub from './hub/Hub.jsx';
import { GAMES } from './registry.js';

function StarField() {
  const stars = React.useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    i, top: Math.random() * 100, left: Math.random() * 100,
    size: 1 + Math.random() * 2.4, delay: Math.random() * 3,
  })), []);
  return (
    <div className="km-stars">
      {stars.map(s => (
        <span key={s.i} className="km-star" style={{
          top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [activeId, setActiveId] = React.useState(null);
  const active = GAMES.find(g => g.id === activeId) || null;

  return (
    <RewardedAdProvider>
      <div className="km-app">
        <div className="km-frame">
          <StarField />
          {!active && <Hub onOpen={setActiveId} />}
          {active && (
            <active.Component
              key={active.id}
              onExit={() => setActiveId(null)}
              {...(active.props || {})}
            />
          )}
        </div>
      </div>
    </RewardedAdProvider>
  );
}

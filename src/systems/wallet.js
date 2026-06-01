import React from 'react';

// Global coin wallet, persisted to localStorage. Shared by every game.
const KEY = 'km_coins';
const HS_KEY = 'km_highscores';

const read = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); }
  catch { return fallback; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const listeners = new Set();
let coins = read(KEY, 100); // start with a small gift

export const getCoins = () => coins;
export const addCoins = (n) => { coins = Math.max(0, coins + n); write(KEY, coins); listeners.forEach(l => l(coins)); return coins; };
export const spendCoins = (n) => {
  if (coins < n) return false;
  coins -= n; write(KEY, coins); listeners.forEach(l => l(coins)); return true;
};

export function useWallet() {
  const [c, setC] = React.useState(coins);
  React.useEffect(() => {
    const l = (v) => setC(v);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return { coins: c, add: addCoins, spend: spendCoins };
}

// Per-game high scores
export const getHighScore = (gameId) => read(HS_KEY, {})[gameId] || 0;
export const setHighScore = (gameId, score) => {
  const all = read(HS_KEY, {});
  if (score > (all[gameId] || 0)) { all[gameId] = score; write(HS_KEY, all); return true; }
  return false;
};

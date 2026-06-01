// ═══ محرّك لودو — المسارات والقواعد ═══
// لوحة 15×15. حلقة رئيسية 52 خانة + عمود بيت لكل لون (6) + المركز.

// الحلقة الرئيسية (52 خانة) بترتيب عقارب الساعة، تبدأ من خانة انطلاق الأحمر.
export const RING = [
  [6,1],[6,2],[6,3],[6,4],[6,5],            // 0-4
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],      // 5-10
  [0,7],                                     // 11
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],      // 12-17
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14], // 18-23
  [7,14],                                    // 24
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9], // 25-30
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8], // 31-36
  [14,7],                                    // 37
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6], // 38-43
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],      // 44-49
  [7,0],                                     // 50
  [6,0],                                     // 51
];

// خانات آمنة (انطلاق + نجوم): لا أكل فيها
export const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// أعمدة البيوت (٦ خانات لكل لون، الأخيرة ملاصقة للمركز = الوصول)
const HOME = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  green:  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  blue:   [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

export const COLORS = [
  { id:'red',    name:'الأحمر',  hex:'#FF5A6E', dark:'#C0283A', start:0,  yard:[[1.3,1.3],[1.3,3.7],[3.7,1.3],[3.7,3.7]] },
  { id:'green',  name:'الأخضر',  hex:'#2BD9A8', dark:'#0E8C68', start:13, yard:[[1.3,10.3],[1.3,12.7],[3.7,10.3],[3.7,12.7]] },
  { id:'yellow', name:'الأصفر',  hex:'#F5C542', dark:'#B98A12', start:26, yard:[[10.3,10.3],[10.3,12.7],[12.7,10.3],[12.7,12.7]] },
  { id:'blue',   name:'الأزرق',  hex:'#3B82F6', dark:'#1E54B5', start:39, yard:[[10.3,1.3],[10.3,3.7],[12.7,1.3],[12.7,3.7]] },
];
export const COLOR_BY_ID = Object.fromEntries(COLORS.map(c=>[c.id,c]));

// إحداثيات [صف،عمود] لخانة على مسار اللون عند موضع pos (0..56)
export function cellAt(colorId, pos) {
  const c = COLOR_BY_ID[colorId];
  if (pos <= 50) return RING[(c.start + pos) % 52];
  return HOME[colorId][pos - 51];
}

// فهرس الخانة على الحلقة (للأكل) أو null إن كان في عمود البيت
export function ringIndexAt(colorId, pos) {
  if (pos > 50) return null;
  return (COLOR_BY_ID[colorId].start + pos) % 52;
}

export const FINISH = 56; // الوصول للبيت

// الحركات القانونية للون بنرد معيّن
export function legalMoves(tokens, colorId, dice) {
  const arr = tokens[colorId];
  const moves = [];
  arr.forEach((pos, i) => {
    if (pos === -1) { if (dice === 6) moves.push(i); }
    else if (pos < FINISH) { if (pos + dice <= FINISH) moves.push(i); }
  });
  return moves;
}

// تطبيق حركة — يعدّل tokens (نسخة) ويرجع {captured, finished}
export function applyMove(tokens, colorId, tokenIdx, dice) {
  const arr = tokens[colorId];
  let pos = arr[tokenIdx];
  let newPos = pos === -1 ? 0 : pos + dice;
  arr[tokenIdx] = newPos;
  let captured = false;
  const ring = ringIndexAt(colorId, newPos);
  if (ring != null && !SAFE.has(ring)) {
    for (const oc of COLORS) {
      if (oc.id === colorId) continue;
      const oarr = tokens[oc.id]; if (!oarr) continue;
      oarr.forEach((op, oi) => {
        if (op >= 0 && op <= 50 && ringIndexAt(oc.id, op) === ring) {
          oarr[oi] = -1; captured = true;
        }
      });
    }
  }
  return { captured, finished: newPos === FINISH };
}

// اختيار الكمبيوتر لأفضل حركة
export function cpuPick(tokens, colorId, dice, moves) {
  let best = moves[0], bestScore = -Infinity;
  for (const m of moves) {
    const sim = JSON.parse(JSON.stringify(tokens));
    const r = applyMove(sim, colorId, m, dice);
    let score = 0;
    const pos = tokens[colorId][m];
    if (r.captured) score += 100;            // الأكل أولوية
    if (r.finished) score += 80;             // الوصول للبيت
    if (pos === -1) score += 40;             // إخراج بيدق
    score += (pos === -1 ? 0 : pos);         // تقدّم البيادق الأبعد
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

export const allHome = (arr) => arr.every(p => p === FINISH);

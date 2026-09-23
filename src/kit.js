// kit.js - shared FX helpers + shared props used by several scenes. Read-only for scene authors.

// ---------- motion FX ----------
function shake(amt, seed = 0) { if (amt <= 0) return; translate(RS(G.boil * 1.7 + seed, 11) * amt, RS(G.boil * 1.7 + seed, 12) * amt); }
// twinkling sprites scattered in a box
function twinkles(T, n, seed, box, names = ['spark'], smin = 0.15, smax = 0.4, rate = 2.2) {
  for (let i = 0; i < n; i++) {
    const x = box[0] + R(i, seed) * box[2], y = box[1] + R(i, seed + 1) * box[3];
    const k = 0.5 + 0.5 * Math.sin(T * rate + R(i, seed + 2) * TAU);
    spr(names[i % names.length], x, y, { s: lerp(smin, smax, R(i, seed + 3)) * (0.4 + 0.6 * k), r: T * 0.4 + i, seed: i, a: 0.35 + 0.65 * k });
  }
}
// radial burst of sprites that starts at time t0 (o: n, names, spd, g, drag, life, s, spread, ang0, even, spin, seed)
function burst(T, t0, x, y, o = {}) {
  const age = T - t0, life = o.life ?? 1.2;
  if (age < 0 || age > life) return;
  const n = o.n ?? 16, names = o.names || ['spark'];
  for (let i = 0; i < n; i++) {
    const seed = (o.seed || 0) + i;
    const ang = (o.ang0 ?? 0) + (o.spread ?? TAU) * (o.even ? i / n : R(seed, 1)) - (o.spread && o.spread < TAU ? o.spread / 2 : 0);
    const sp = (o.spd ?? 700) * (0.45 + 0.55 * R(seed, 2));
    const e = 1 - Math.exp(-age * (o.drag ?? 3));
    const d = (sp / (o.drag ?? 3)) * e;
    const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d + 0.5 * (o.g ?? 400) * age * age;
    const fade = 1 - inv(life * 0.6, life, age);
    spr(names[i % names.length], px, py, { s: (o.s ?? 0.4) * (0.6 + 0.6 * R(seed, 3)) * (0.3 + 0.7 * Ez.outBack(clamp(age * 5))), r: age * (o.spin ?? 4) * RS(seed, 4) + R(seed, 5) * TAU, a: fade, seed });
  }
}
// looping rising (dir -1) or falling (dir 1) sprites in a box
function floaters(T, n, seed, names, box, spd = 80, s0 = 0.3, sway = 30, dir = -1) {
  for (let i = 0; i < n; i++) {
    const ph = fract(R(i, seed) + (T * spd) / box[3] * (0.6 + 0.4 * R(i, seed + 1)));
    const y = dir < 0 ? box[1] + box[3] * (1 - ph) : box[1] + box[3] * ph;
    const x = box[0] + R(i, seed + 2) * box[2] + Math.sin(T * 1.5 + i) * sway;
    const a = sstep(0, 0.12, ph) * (1 - sstep(0.85, 1, ph));
    spr(names[i % names.length], x, y, { s: s0 * (0.6 + 0.8 * R(i, seed + 3)), r: Math.sin(T * 2 + i) * 0.4, a, seed: i });
  }
}
// horizontal speed streaks (dir -1 moves left)
function speedLines(T, n, seed, c = '#FFFFFF', a = 0.6, len = 300, wgt = 5, spd = 3000, dir = -1, box = [0, 0, W, H]) {
  for (let i = 0; i < n; i++) {
    const y = box[1] + R(i, seed) * box[3];
    const x = box[0] + fract(R(i, seed + 1) + dir * T * spd * (0.6 + 0.4 * R(i, seed + 2)) / box[2]) * (box[2] + len) - len;
    segLine(x, y, x + len * (0.5 + R(i, seed + 3)), y, c, wgt * (0.5 + R(i, seed + 4)), a);
  }
}
// many line segments in one draw call (much faster than repeated segLine). segs = [[x1,y1,x2,y2], ...]
function segLines(segs, c, wgt, a = 1) {
  if (!segs.length) return;
  stroke(withAlphaCol(c, a)); strokeWeight(wgt); noFill();
  beginShape(LINES); for (const q of segs) { vertex(q[0], q[1]); vertex(q[2], q[3]); } endShape();
  noStroke();
}
// soft additive glow (keep a low; it blows out on light grounds)
function glow(x, y, r, c, a = 0.5) { blendMode(ADD); for (let i = 3; i >= 1; i--) disc(x, y, r * i * 0.5, c, a * 0.07 * (4 - i)); blendMode(BLEND); }
// register a lyric line style (see ANIMATION_GUIDE.md)
function lyr(i, st) { LSTYLE[i] = st; }
// time of the n-th beat
const beatT = (n) => BEATS[clamp(n, 0, BEATS.length - 1)];
// time of word j in lyric line i
const wordT = (i, j) => SONG.lines[i].w[j][1];
// point at fraction t along a polyline
function pathPoint(path, t) {
  let total = 0; const segs = [];
  for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push(d); total += d; }
  let d = clamp(t) * total;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const k = d / segs[i]; return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)]; } d -= segs[i]; }
  return path[path.length - 1];
}

// ---------- shared props ----------
// P(doom) gauge dial (1100x640). Use drawGauge() to include the needle.
defSprite('gauge', 1100, 640, () => {
  const cx = 550, cy = 590, r1 = 500, r2 = 330;
  const zones = [[PAL.mint, 0, 0.35], [PAL.butter, 0.35, 0.6], [PAL.orange, 0.6, 0.8], [PAL.red, 0.8, 1]];
  const face = []; for (let i = 0; i <= 48; i++) { const a = Math.PI + (i / 48) * Math.PI; face.push([cx + Math.cos(a) * (r1 + 30), cy + Math.sin(a) * (r1 + 30)]); }
  face.push([cx + r1 + 30, cy + 30], [cx - r1 - 30, cy + 30]);
  paint(face, PAL.paper, { baseC: '#FFFDF6', a: 110, lw: 3 });
  for (const [c, a0, a1] of zones) {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI + (a0 + (a1 - a0) * (i / 16)) * Math.PI; pts.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]); }
    for (let i = 16; i >= 0; i--) { const a = Math.PI + (a0 + (a1 - a0) * (i / 16)) * Math.PI; pts.push([cx + Math.cos(a) * r2, cy + Math.sin(a) * r2]); }
    paint(pts, c, { baseC: lite(c, 0.2), lw: 1.6 });
  }
  pen(PAL.ink, 3, '2B');
  for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; brush.line(cx + Math.cos(a) * (r2 - 10), cy + Math.sin(a) * (r2 - 10), cx + Math.cos(a) * (r2 - 50), cy + Math.sin(a) * (r2 - 50)); }
  brush.noStroke();
  for (let i = 0; i <= 10; i += 2) { const a = Math.PI + (i / 10) * Math.PI; const t = textImg(i * 10 + '', { font: 'pixel', size: 34, fill: PAL.ink }); image(t.img, cx + Math.cos(a) * (r2 - 90) - t.w / 2, cy + Math.sin(a) * (r2 - 90) - t.h / 2); }
  const lab = textImg('P(doom)', { font: 'pixel', size: 64, fill: PAL.ink, weight: 700 });
  image(lab.img, cx - lab.w / 2, cy - 130 - lab.h / 2);
});
// draw the gauge centred at (x,y) (sprite centre), value 0..100, s scale. o.wobble adds needle jitter.
function drawGauge(x, y, s, val, o = {}) {
  push(); translate(x, y); scale(s);
  spr('gauge', 0, 0, { jit: 0.4, a: o.a });
  const ang = Math.PI + clamp(val / 100) * Math.PI + (o.wobble ? Math.sin(G.T * 60) * o.wobble : 0);
  const hy = 255;
  segLine(0, hy, Math.cos(ang) * 400, hy + Math.sin(ang) * 400, PAL.ink, 22, o.a ?? 1);
  segLine(0, hy, Math.cos(ang) * 380, hy + Math.sin(ang) * 380, PAL.coral, 8, o.a ?? 1);
  disc(0, hy, 46, PAL.ink, o.a ?? 1); disc(0, hy, 18, PAL.coral, o.a ?? 1);
  pop();
}
defSprite('rocket', 300, 520, () => {
  const body = [[150, 20], [205, 90], [225, 200], [225, 380], [75, 380], [75, 200], [95, 90]];
  paint(rrPtsPoly(body, 30), '#FFFFFF', { baseC: '#FFFFFF', a: 80, lw: 2.4 });
  paint([[150, 20], [205, 90], [95, 90]], PAL.coral, { baseC: '#F77A63' });
  paint([[75, 280], [20, 420], [75, 390]], PAL.coral, { baseC: '#F77A63' });
  paint([[225, 280], [280, 420], [225, 390]], PAL.coral, { baseC: '#F77A63' });
  paint(rrPts(110, 380, 80, 50, 8), PAL.gray, { baseC: '#C6C0D4' });
  paint(ellPts(150, 200, 48, 48, 32), PAL.sky, { baseC: '#BFE4FF', lw: 2.4 });
  flat(rrPts(122, 188, 56, 36, 3), PAL.coral); flat(rrPts(130, 194, 10, 10, 1), PAL.black); flat(rrPts(160, 194, 10, 10, 1), PAL.black);
  pen(PAL.ink, 1.6, 'pen'); brush.line(75, 300, 225, 300); brush.noStroke();
}, { ay: 0.75 });
// a graphics card (300x130)
defSprite('gpu', 300, 130, () => {
  paint(rrPts(12, 14, 276, 100, 12), '#3F4658', { baseC: '#5A6278', lw: 2 });
  for (const x of [85, 215]) { paint(ellPts(x, 64, 40, 40, 28), '#2A2F3E', { baseC: '#3A4152', lw: 1.6 }); pen(PAL.gray, 2, 'pen'); for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; brush.line(x, 64, x + Math.cos(a) * 34, 64 + Math.sin(a) * 34); } brush.noStroke(); }
  pen(PAL.green, 6, 'marker'); brush.line(20, 110, 280, 110); brush.noStroke();
  for (let i = 0; i < 12; i++) flat(rrPts(40 + i * 18, 114, 10, 12, 2), PAL.gold);
}, { v: 2 });
// candle / rocket flame (80x120, anchor at base)
defSprite('flame', 80, 120, () => { paint([[40, 6], [66, 64], [58, 100], [40, 110], [22, 100], [14, 64]], PAL.orange, { baseC: PAL.butter, lw: 1.2, lc: PAL.coralDk }); blob(40, 84, 12, '#FFFFFF', 200, 0.1); }, { v: 3, ay: 0.9 });
// a paperclip (recurring motif; 90x200)
defSprite('paperclip', 110, 230, () => {
  // three nested loops of bent wire; thin strokes so the loops stay open and readable when small
  const pts = [[70, 172], [70, 52], [70, 40], [62, 30], [52, 28], [42, 30], [36, 40], [36, 52], [36, 190], [40, 202], [52, 210], [66, 210], [80, 202], [86, 190], [86, 40], [82, 24], [70, 14], [36, 14], [24, 24], [20, 40], [20, 168]];
  noFill(); strokeJoin(ROUND); strokeCap(ROUND);
  stroke(PAL.ink); strokeWeight(9); beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape();
  stroke('#A7B0C4'); strokeWeight(5.5); beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape();
  stroke('#EEF2FA'); strokeWeight(1.6); beginShape(); for (const p of pts) vertex(p[0] - 1, p[1] - 1); endShape();
  noStroke();
}, { v: 1 });
// theatre curtain panel (shared by s14 closing and s15 opening so they match). 700x1180, anchor top.
defSprite('curtain', 700, 1180, () => {
  const pts = [[20, 0], [690, 0], [690, 1180], [20, 1180]];
  paint(pts, '#C2263B', { baseC: '#D63A4E', a: 200, lw: 2.4 });
  for (let i = 0; i < 7; i++) { const x = 70 + i * 95; wc('#8E1428', 90, 0.08, 0.5, 0.6); brush.rect(x, 0, 34, 1180); brush.noFill(); pen('#FF6A7A', 2.5, 'marker'); brush.line(x + 60, 10, x + 64, 1170); brush.noStroke(); }
  paint(rrPts(10, 1090, 690, 80, 20), PAL.gold, { baseC: '#FFD75A', lw: 2 });
  for (let i = 0; i < 12; i++) blob(40 + i * 56, 1170, 14, PAL.gold, 230, 0.1);
}, { ax: 0.5, ay: 0 });
// curtains: open 0 = closed (meet at centre), 1 = fully open
function drawCurtains(open, T = G.T) {
  const sway = Math.sin(T * 2.2) * 8 * (1 - open);
  const off = lerp(0, 760, Ez.inOut(clamp(open)));
  spr('curtain', 960 - 350 - off + sway, -40, { s: 1, sx: 1 - open * 0.35, jit: 0.3 });
  spr('curtain', 960 + 350 + off - sway, -40, { s: 1, sx: 1 - open * 0.35, flip: true, jit: 0.3, seed: 3 });
  // valance
  noStroke(); fill('#9E1830'); rect(-20, -20, W + 40, 90);
  for (let i = 0; i < 17; i++) { disc(i * 120 + 20, 70, 62, '#9E1830'); }
  segLine(-20, 40, W + 20, 40, PAL.gold, 10);
}

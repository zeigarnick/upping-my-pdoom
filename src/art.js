// art.js - paint helpers + shared sprites (characters, FX). All painted once with p5.brush.

// ---------- paint helpers (used inside defSprite painters; origin = sprite top-left) ----------
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function mixc(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
const lite = (c, t = 0.35) => mixc(c, '#FFFFFF', t);
const dark = (c, t = 0.25) => mixc(c, '#2B2140', t);

function wc(c, a = 200, bleed = 0.06, tex = 0.55, border = 0.75) { brush.noStroke(); brush.noHatch(); brush.fill(c, a); brush.fillBleed(bleed); brush.fillTexture(tex, border); }
function pen(c = PAL.ink, w = 2, type = '2B') { brush.noFill(); brush.noHatch(); brush.set(type, c, w); }
function flat(pts, c, a = 1) { noStroke(); fill(withAlphaCol(c, a)); beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(CLOSE); }
function ellPts(cx, cy, rx, ry, n = 40, j = 0, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rot;
    const k = 1 + (j ? (random() - 0.5) * j : 0);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return pts;
}
function rrPts(x, y, w, h, r, n = 5) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return pts;
}
function starPts(cx, cy, r1, r2, n = 5, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1; const a = rot + (i / (n * 2)) * TAU; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return pts;
}
function heartPts(cx, cy, s, n = 48) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + (x * s) / 16, cy - (y * s) / 16]);
  }
  return pts;
}
function offsetPts(pts, dx, dy) { return pts.map(([x, y]) => [x + dx, y + dy]); }
function scalePts(pts, cx, cy, k) { return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); }
// the signature look: flat base + watercolor body + pencil outline
function paint(pts, c, o = {}) {
  if (o.base !== false) flat(o.inset ? scalePts(pts, o.inset[0], o.inset[1], o.inset[2]) : pts, o.baseC || lite(c, o.baseLite ?? 0.18), o.baseA ?? 1);
  wc(c, o.a ?? 170, o.bleed ?? 0.05, o.tex ?? 0.55, o.border ?? 0.8);
  brush.polygon(pts);
  if (o.line !== false) { pen(o.lc || PAL.ink, o.lw ?? 2, o.lt || '2B'); brush.polygon(o.lineOff ? offsetPts(pts, o.lineOff, o.lineOff) : pts); }
  brush.noStroke(); brush.noFill();
}
function strokePath(pts, c = PAL.ink, w = 2, type = '2B', curv = 0.5) { pen(c, w, type); brush.spline(pts, curv); brush.noStroke(); }
function wash(x, y, w, h, c, a = 140, bleed = 0.2) { wc(c, a, bleed, 0.5, 0.45); brush.rect(x, y, w, h); brush.noFill(); }
function blob(x, y, r, c, a = 150, bleed = 0.25) { wc(c, a, bleed, 0.5, 0.6); brush.circle(x, y, r); brush.noFill(); }

// ---------- CLAWD (user-provided design: 8x6 body, 2x2 arms, four 1x2 legs, 1x1 eyes) ----------
const CU = 40, CM = 24; // paint unit, margin
defSprite('cl_body', 8 * CU + CM * 2, 6 * CU + CM * 2, (v) => {
  const pts = rrPts(CM, CM, 8 * CU, 6 * CU, 5, 2);
  paint(pts, PAL.coral, { baseC: '#F46A52', a: 150, tex: 0.6 });
  wc(PAL.coralDk, 60, 0.04, 0.6, 0.5); brush.rect(CM + 6, CM + 6 * CU - 46, 8 * CU - 12, 38);
  wc('#FFE3D6', 60, 0.08, 0.4, 0.3); brush.rect(CM + 18, CM + 14, 90, 30);
  pen(PAL.ink, 2.2, '2B'); brush.polygon(pts); brush.noStroke();
}, { v: 3 });
defSprite('cl_arm', 2 * CU + CM * 2, 2 * CU + CM * 2, () => {
  paint(rrPts(CM, CM, 2 * CU, 2 * CU, 4, 2), PAL.coral, { baseC: '#F46A52', a: 150 });
}, { v: 2, ax: CM / (2 * CU + CM * 2), ay: 0.5 });
defSprite('cl_leg', CU + CM * 2, 2 * CU + CM * 2, () => {
  paint(rrPts(CM, CM, CU, 2 * CU, 3, 2), PAL.coral, { baseC: '#F46A52', a: 150 });
  wc(PAL.coralDk, 50, 0.04); brush.rect(CM + 3, CM + 2 * CU - 20, CU - 6, 16); brush.noFill();
}, { v: 2, ax: 0.5, ay: CM / (2 * CU + CM * 2) });
// eyes (each 1u); painted big enough to scale up a little
const EU = 64, EM = 16, ES = EU + EM * 2;
function eyeSprite(name, fn, v = 1) { defSprite(name, ES, ES, fn, { v }); }
eyeSprite('ce_sq', () => {
  flat(rrPts(EM, EM, EU, EU, 3, 1), PAL.black);
  wc('#3A2E5C', 90, 0.02, 0.5, 0.3); brush.rect(EM + 6, EM + 6, EU - 12, EU - 12);
  flat(rrPts(EM + 12, EM + 10, 16, 16, 2, 1), '#FFFFFF');
});
eyeSprite('ce_blink', () => { flat(rrPts(EM, EM + EU * 0.42, EU, EU * 0.18, 4, 2), PAL.black); });
eyeSprite('ce_happy', () => { // closed happy ^ eye as a filled arc band
  const cx = ES / 2, cy = ES / 2 + EU * 0.32, pts = [];
  for (let i = 0; i <= 16; i++) { const a = Math.PI + 0.3 + (i / 16) * (Math.PI - 0.6); pts.push([cx + Math.cos(a) * EU * 0.5, cy + Math.sin(a) * EU * 0.55]); }
  for (let i = 16; i >= 0; i--) { const a = Math.PI + 0.3 + (i / 16) * (Math.PI - 0.6); pts.push([cx + Math.cos(a) * EU * 0.3, cy + Math.sin(a) * EU * 0.33]); }
  flat(pts, PAL.black);
});
eyeSprite('ce_heart', () => { paint(heartPts(ES / 2, ES / 2 + 2, EU * 0.62), PAL.red, { baseC: '#FF5A78', lw: 1.4 }); flat(ellPts(ES / 2 - 12, ES / 2 - 8, 6, 5, 12), '#FFFFFF', 0.9); });
eyeSprite('ce_star', () => { paint(starPts(ES / 2, ES / 2, EU * 0.55, EU * 0.22, 4), PAL.butter, { baseC: '#FFE680', lw: 1.4 }); });
eyeSprite('ce_red', () => {
  blob(ES / 2, ES / 2, EU * 0.5, PAL.red, 120, 0.3);
  flat(ellPts(ES / 2, ES / 2, EU * 0.42, EU * 0.42, 32), '#FF2A3C');
  flat(ellPts(ES / 2, ES / 2, EU * 0.3, EU * 0.3, 32), '#3A0010');
  pen('#FFD0D0', 1.6, 'pen'); brush.circle(ES / 2, ES / 2, EU * 0.36); brush.noStroke();
  flat(ellPts(ES / 2, ES / 2, EU * 0.1, EU * 0.1, 16), '#FF2A3C');
  flat(ellPts(ES / 2 - 10, ES / 2 - 10, 5, 5, 12), '#FFFFFF');
});
eyeSprite('ce_x', () => { noFill(); stroke(PAL.black); strokeWeight(14); strokeCap(ROUND); line(EM + 8, EM + 8, EM + EU - 8, EM + EU - 8); line(EM + EU - 8, EM + 8, EM + 8, EM + EU - 8); noStroke(); });
eyeSprite('ce_spiral', () => { noFill(); stroke(PAL.black); strokeWeight(6); strokeJoin(ROUND); beginShape(); for (let i = 0; i < 70; i++) { const a = i * 0.3, r = 2 + i * 0.44; vertex(ES / 2 + Math.cos(a) * r, ES / 2 + Math.sin(a) * r); } endShape(); noStroke(); });
eyeSprite('ce_cash', () => { flat(rrPts(EM, EM, EU, EU, 3, 1), PAL.green); pen('#FFFFFF', 5, 'marker'); brush.spline([[EM + 44, EM + 16], [EM + 22, EM + 18], [EM + 24, EM + 32], [EM + 42, EM + 34], [EM + 40, EM + 48], [EM + 18, EM + 48]], 0.5); brush.line(EM + 32, EM + 8, EM + 32, EM + 56); brush.noStroke(); });
eyeSprite('ce_dot', () => { flat(ellPts(ES / 2, ES / 2, EU * 0.3, EU * 0.36, 24), PAL.black); flat(ellPts(ES / 2 - 6, ES / 2 - 8, 5, 5, 12), '#FFFFFF'); });

// accessories for clawd (drawn relative to body top-center)
defSprite('acc_crown', 200, 150, () => {
  const pts = [[20, 130], [180, 130], [180, 50], [140, 90], [100, 20], [60, 90], [20, 50]];
  paint(pts, PAL.gold, { baseC: '#FFD75A' });
  for (const [x, c] of [[60, PAL.red], [100, PAL.sky], [140, PAL.mint]]) flat(ellPts(x, 110, 10, 10, 16), c);
}, { ay: 0.85 });
defSprite('acc_shades', 330, 90, () => {
  paint(rrPts(20, 18, 120, 56, 14), PAL.black, { baseC: '#1C1628', lw: 1.5 });
  paint(rrPts(190, 18, 120, 56, 14), PAL.black, { baseC: '#1C1628', lw: 1.5 });
  pen(PAL.black, 6, 'marker'); brush.line(140, 36, 190, 36); brush.noStroke();
  flat([[40, 28], [70, 28], [50, 60], [34, 60]], '#FFFFFF', 0.5); flat([[210, 28], [240, 28], [220, 60], [204, 60]], '#FFFFFF', 0.5);
});
defSprite('acc_party', 120, 170, () => {
  paint([[60, 10], [110, 160], [10, 160]], PAL.pink, { baseC: '#FFB0CC' });
  for (let i = 0; i < 5; i++) blob(30 + i * 16, 60 + i * 20, 7, [PAL.butter, PAL.sky, PAL.mint][i % 3], 220, 0.1);
  blob(60, 12, 14, PAL.butter, 230, 0.2);
}, { ay: 0.95 });
defSprite('acc_hardhat', 260, 130, () => {
  paint([[20, 110], [240, 110], [230, 90], [200, 88], [196, 50], [150, 22], [110, 22], [64, 50], [60, 88], [30, 90]], PAL.butter, { baseC: '#FFE17A' });
  pen(PAL.ink, 2, '2B'); brush.line(130, 24, 130, 88); brush.noStroke();
}, { ay: 0.85 });
defSprite('acc_bow', 150, 80, () => {
  paint([[75, 40], [15, 12], [15, 68]], PAL.pink, { baseC: '#FFB0CC' });
  paint([[75, 40], [135, 12], [135, 68]], PAL.pink, { baseC: '#FFB0CC' });
  paint(ellPts(75, 40, 14, 14, 16), PAL.red, { baseC: '#FF6A86' });
});
defSprite('acc_mask', 330, 120, () => {
  const pts = [[10, 50], [60, 20], [130, 30], [165, 50], [200, 30], [270, 20], [320, 50], [290, 95], [220, 100], [165, 80], [110, 100], [40, 95]];
  paint(pts, PAL.lilac, { baseC: '#C9B6FF' });
  flat(ellPts(95, 62, 36, 22, 24), '#FFFFFF', 0.0);
  for (let i = 0; i < 8; i++) blob(30 + i * 38, 22 + (i % 2) * 8, 6, PAL.gold, 220, 0.1);
});
defSprite('acc_headband', 360, 70, () => {
  paint(rrPts(10, 18, 340, 34, 14), PAL.red, { baseC: '#FF6070' });
  pen('#FFFFFF', 5, 'marker'); brush.line(20, 35, 340, 35); brush.noStroke();
});

// Clawd rig. (x,y) = ground point between the feet. s = scale (1 => body 320px wide).
// o: eyes, look[dx,dy] (eye shift in units), armL, armR (radians, +down), walk (cycles), hop(px), sq (squash), r (tilt), flip, a, acc[], blink(bool)
function clawd(x, y, s = 1, o = {}) {
  const a = o.a ?? 1;
  if (a <= 0) return;
  const sq = o.sq ?? 1;
  push();
  translate(x, y - (o.hop || 0));
  if (o.r) rotate(o.r);
  scale(s * sq * (o.flip ? -1 : 1), s / sq);
  const al = a < 1 ? { a } : {};
  const seed = o.seed || 0;
  // legs
  const legX = [-3.5, -1.5, 1.5, 3.5];
  for (let i = 0; i < 4; i++) {
    let ly = 0, lr = 0;
    if (o.walk != null) {
      const ph = o.walk * TAU + (i % 2 ? Math.PI : 0);
      ly = -Math.max(0, Math.sin(ph)) * 0.5 * CU; lr = Math.cos(ph) * 0.18;
    }
    if (o.legs) { ly += o.legs[i]?.[0] || 0; lr += o.legs[i]?.[1] || 0; }
    spr('cl_leg', legX[i] * CU, -2 * CU + ly, { r: lr, ...al, seed: seed + i });
  }
  // arms (pivot at shoulder)
  spr('cl_arm', 4 * CU, -5 * CU, { r: o.armR ?? 0, ...al, seed: seed + 5 });
  spr('cl_arm', -4 * CU, -5 * CU, { r: -(o.armL ?? 0), flip: true, ...al, seed: seed + 6 });
  // body
  spr('cl_body', 0, -5 * CU, { ...al, seed: seed + 7 });
  // eyes
  let eyes = o.eyes || 'ce_sq';
  if (o.blink !== false && eyes === 'ce_sq') { const bt = fract(G.T * 0.27 + seed * 0.13); if (bt < 0.035) eyes = 'ce_blink'; }
  const lk = o.look || [0, 0];
  const es = o.eyeS ?? 1;
  const ey = -6.5 * CU + lk[1] * CU;
  spr(eyes, (-2.5 + lk[0]) * CU, ey, { s: (CU / EU) * es, ...al, seed: seed + 8 });
  spr(eyes, (2.5 + lk[0]) * CU, ey, { s: (CU / EU) * es, ...al, seed: seed + 9, flip: eyes === 'ce_happy' ? false : false });
  if (o.blush) { disc(-3 * CU, -5.2 * CU, 0.45 * CU, PAL.pink, 0.55 * a); disc(3 * CU, -5.2 * CU, 0.45 * CU, PAL.pink, 0.55 * a); }
  if (o.mouth === 'o') disc(0, -4.4 * CU, 0.35 * CU, PAL.black, a);
  if (o.mouth === 'smile') { noFill(); stroke(PAL.black); strokeWeight(6); arc(0, -4.7 * CU, 1.2 * CU, 0.8 * CU, 0.2, Math.PI - 0.2); noStroke(); }
  // accessories
  for (const acc of o.acc || []) {
    if (acc === 'crown') spr('acc_crown', 0.6 * CU, -8 * CU, { s: 0.8, r: 0.12, ...al });
    if (acc === 'shades') spr('acc_shades', 0, -6.5 * CU, { s: 0.95, ...al });
    if (acc === 'party') spr('acc_party', 1.5 * CU, -8 * CU, { r: 0.2, ...al });
    if (acc === 'hardhat') spr('acc_hardhat', 0, -7.6 * CU, { s: 1.2, ...al });
    if (acc === 'bow') spr('acc_bow', 2.8 * CU, -7.9 * CU, { r: 0.3, ...al });
    if (acc === 'mask') spr('acc_mask', 0, -6.4 * CU, { s: 1.05, ...al });
    if (acc === 'headband') spr('acc_headband', 0, -7.6 * CU, { s: 0.95, ...al });
  }
  pop();
}

// ---------- PIP: our (original) nervous human narrator ----------
defSprite('pip_head', 220, 230, (v) => {
  // ears
  paint(ellPts(38, 128, 18, 22, 20), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
  paint(ellPts(182, 128, 18, 22, 20), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
  // face
  paint(ellPts(110, 128, 76, 80, 48, 0.02), PAL.skin, { baseC: '#FFE3CF', a: 140, lw: 2 });
  // hair cap + tuft
  const hair = [[34, 118], [36, 80], [60, 50], [100, 38], [124, 20], [120, 40], [150, 42], [180, 64], [188, 112], [170, 92], [150, 80], [118, 86], [96, 72], [70, 92], [52, 96]];
  paint(hair, PAL.navy, { baseC: '#34407A', a: 160, lw: 1.8 });
  strokePath([[118, 40], [132, 8], [150, 16]], PAL.navy, 3, 'marker', 0.6);
}, { v: 2, ay: 0.62 });
function faceSprite(name, fn) {
  defSprite(name, 180, 130, (v) => {
    fn(v);
  }, { v: 1 });
}
function glasses(tint = null) {
  if (tint) { flat(ellPts(55, 55, 30, 28, 32), tint, 0.9); flat(ellPts(125, 55, 30, 28, 32), tint, 0.9); }
  pen(PAL.ink, 3.2, 'pen'); brush.circle(55, 55, 30); brush.circle(125, 55, 30); brush.line(85, 52, 95, 52); brush.noStroke();
}
function pipEye(x, y, k = 1) { flat(ellPts(x, y, 7 * k, 9 * k, 16), PAL.ink); flat(ellPts(x - 2, y - 3, 2.6 * k, 2.6 * k, 8), '#FFFFFF'); }
function cheeks() { blob(28, 92, 13, PAL.pink, 110, 0.3); blob(152, 92, 13, PAL.pink, 110, 0.3); }
faceSprite('pf_neutral', () => { pipEye(55, 56); pipEye(125, 56); glasses(); cheeks(); strokePath([[78, 98], [90, 104], [102, 98]], PAL.ink, 2.4, 'pen', 0.5); });
faceSprite('pf_happy', () => { cheeks(); pen(PAL.ink, 3.5, 'pen'); brush.spline([[43, 60], [55, 48], [67, 60]], 0.5); brush.spline([[113, 60], [125, 48], [137, 60]], 0.5); brush.noStroke(); glasses(); paint([[72, 94], [108, 94], [100, 112], [80, 112]], PAL.red, { baseC: '#FF7A88', lw: 1.6 }); });
faceSprite('pf_nervous', () => { pipEye(55, 58, 0.8); pipEye(125, 58, 0.8); glasses(); cheeks();
  strokePath([[70, 104], [78, 98], [86, 104], [94, 98], [102, 104], [110, 98]], PAL.ink, 2.4, 'pen', 0.2);
  strokePath([[36, 30], [70, 22]], PAL.navy, 3, 'pen', 0.3); strokePath([[110, 22], [144, 30]], PAL.navy, 3, 'pen', 0.3);
  paint([[160, 18], [170, 40], [160, 48], [150, 40]], PAL.sky, { baseC: '#BFE4FF', lw: 1.2 }); });
faceSprite('pf_scared', () => { flat(ellPts(55, 56, 13, 15, 20), '#FFFFFF'); flat(ellPts(125, 56, 13, 15, 20), '#FFFFFF'); flat(ellPts(55, 58, 5, 5, 12), PAL.ink); flat(ellPts(125, 58, 5, 5, 12), PAL.ink); glasses();
  paint(ellPts(90, 104, 14, 18, 24), PAL.ink, { baseC: '#3A2E4A', lw: 1.4 }); flat(ellPts(90, 112, 8, 6, 12), PAL.red, 0.9);
  strokePath([[36, 22], [70, 30]], PAL.navy, 3, 'pen', 0.3); strokePath([[110, 30], [144, 22]], PAL.navy, 3, 'pen', 0.3); });
faceSprite('pf_cry', () => { pen(PAL.ink, 3.2, 'pen'); brush.spline([[43, 54], [55, 62], [67, 54]], 0.5); brush.spline([[113, 54], [125, 62], [137, 54]], 0.5); brush.noStroke(); glasses();
  blob(48, 86, 10, PAL.sky, 200, 0.2); blob(132, 86, 10, PAL.sky, 200, 0.2); strokePath([[76, 108], [90, 100], [104, 108]], PAL.ink, 2.4, 'pen', 0.5); cheeks(); });
faceSprite('pf_love', () => { paint(heartPts(55, 58, 18), PAL.red, { baseC: '#FF6A86', lw: 1.2 }); paint(heartPts(125, 58, 18), PAL.red, { baseC: '#FF6A86', lw: 1.2 }); glasses(); cheeks(); strokePath([[74, 98], [90, 110], [106, 98]], PAL.ink, 2.4, 'pen', 0.5); });
faceSprite('pf_dizzy', () => { for (const cx of [55, 125]) { const pts = []; for (let i = 0; i < 40; i++) { const a = i * 0.45, r = 1 + i * 0.5; pts.push([cx + Math.cos(a) * r, 56 + Math.sin(a) * r]); } strokePath(pts, PAL.ink, 2.2, 'pen', 0.6); } glasses(); cheeks(); strokePath([[74, 104], [84, 98], [96, 106], [106, 100]], PAL.ink, 2.4, 'pen', 0.4); });
faceSprite('pf_cool', () => { glasses(PAL.black); flat([[34, 42], [52, 42], [40, 70], [30, 70]], '#FFFFFF', 0.4); flat([[104, 42], [122, 42], [110, 70], [100, 70]], '#FFFFFF', 0.4); cheeks(); strokePath([[74, 100], [92, 106], [108, 96]], PAL.ink, 2.6, 'pen', 0.5); });
faceSprite('pf_shock', () => { flat(ellPts(55, 56, 16, 18, 20), '#FFFFFF'); flat(ellPts(125, 56, 16, 18, 20), '#FFFFFF'); flat(ellPts(55, 56, 4, 4, 12), PAL.ink); flat(ellPts(125, 56, 4, 4, 12), PAL.ink); glasses(); paint(rrPts(76, 92, 28, 30, 12), PAL.ink, { baseC: '#3A2E4A', lw: 1.2 }); });

function hoodie(name, c) {
  defSprite(name, 200, 170, () => {
    const pts = [[46, 30], [154, 30], [178, 150], [22, 150]];
    paint(rrPtsPoly(pts, 18), c, { baseC: lite(c, 0.25), a: 160 });
    paint(rrPts(66, 96, 68, 34, 10), dark(c, 0.12), { baseC: lite(c, 0.1), lw: 1.4 });
    strokePath([[86, 32], [84, 70]], PAL.ink, 1.6, 'pen', 0.2); strokePath([[114, 32], [116, 70]], PAL.ink, 1.6, 'pen', 0.2);
    blob(84, 72, 4, PAL.white, 255, 0.05); blob(116, 72, 4, PAL.white, 255, 0.05);
  }, { v: 2, ay: 0.15 });
}
function rrPtsPoly(pts, r) { // soften a polygon's corners
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length];
    const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k1 = Math.min(r / d1, 0.5), k2 = Math.min(r / d2, 0.5);
    const a = [lerp(p1[0], p0[0], k1), lerp(p1[1], p0[1], k1)], b = [lerp(p1[0], p2[0], k2), lerp(p1[1], p2[1], k2)];
    for (let j = 0; j <= 4; j++) { const t = j / 4; const u1 = [lerp(a[0], p1[0], t), lerp(a[1], p1[1], t)], u2 = [lerp(p1[0], b[0], t), lerp(p1[1], b[1], t)]; out.push([lerp(u1[0], u2[0], t), lerp(u1[1], u2[1], t)]); }
  }
  return out;
}
hoodie('pip_body', PAL.lilac);
hoodie('npc_body_mint', PAL.mint);
hoodie('npc_body_butter', PAL.butter);
hoodie('npc_body_sky', PAL.sky);
function limb(name, c, hand) {
  defSprite(name, 70, 130, () => {
    paint(rrPts(20, 10, 30, 80, 14), c, { baseC: lite(c, 0.25), lw: 1.6 });
    if (hand) paint(ellPts(35, 98, 18, 18, 24), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
    else paint(rrPts(12, 82, 50, 26, 12), PAL.white, { baseC: '#FFFFFF', lw: 1.6 });
  }, { v: 2, ay: 0.12 });
}
limb('pip_arm', PAL.lilac, true);
limb('npc_arm_mint', PAL.mint, true);
limb('npc_arm_butter', PAL.butter, true);
limb('npc_arm_sky', PAL.sky, true);
limb('pip_leg', PAL.navy, false);
defSprite('npc_head2', 220, 230, () => { // bun-haired researcher
  paint(ellPts(38, 128, 18, 22, 20), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
  paint(ellPts(182, 128, 18, 22, 20), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
  paint(ellPts(110, 128, 76, 80, 48, 0.02), '#F3C6A0', { baseC: '#F9D8BC', a: 140, lw: 2 });
  paint(ellPts(110, 34, 30, 26, 24), PAL.brown, { baseC: '#B07F5E', lw: 1.6 });
  paint([[34, 118], [40, 76], [70, 52], [110, 46], [150, 52], [180, 76], [186, 118], [160, 88], [110, 78], [60, 88]], PAL.brown, { baseC: '#B07F5E', a: 160, lw: 1.8 });
}, { v: 1, ay: 0.62 });
defSprite('npc_head3', 220, 230, () => { // curly red hair
  paint(ellPts(38, 128, 18, 22, 20), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
  paint(ellPts(182, 128, 18, 22, 20), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
  paint(ellPts(110, 128, 76, 80, 48, 0.02), '#C98F6A', { baseC: '#D9A583', a: 140, lw: 2 });
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; paint(ellPts(110 + Math.cos(a) * 70, 110 + Math.sin(a) * 66, 26, 24, 16), PAL.orange, { baseC: '#FFB36B', lw: 1.4 }); }
}, { v: 1, ay: 0.62 });

// Pip rig. (x,y) = ground point. s ~ 1 => ~300px tall.
// o: face, armL, armR (radians; 0 = hanging, +raises outward), walk (cycles), hop, r, flip, a, body/head/arm names, lean
function pip(x, y, s = 1, o = {}) {
  const a = o.a ?? 1;
  if (a <= 0) return;
  const al = a < 1 ? { a } : {};
  const seed = o.seed || 0;
  const body = o.body || 'pip_body', head = o.head || 'pip_head', arm = o.arm || 'pip_arm';
  push();
  translate(x, y - (o.hop || 0));
  if (o.r) rotate(o.r);
  scale(s * (o.flip ? -1 : 1) * (o.sq ?? 1), s / (o.sq ?? 1));
  // legs
  for (let i = 0; i < 2; i++) {
    let lr = 0, ly = 0;
    if (o.walk != null) { const ph = o.walk * TAU + i * Math.PI; lr = Math.sin(ph) * 0.45; ly = -Math.max(0, Math.cos(ph)) * 8; }
    if (o.legs) lr += o.legs[i] || 0;
    spr('pip_leg', (i ? 24 : -24), -58 + ly, { r: lr, ...al, seed: seed + i });
  }
  // back arm, body, front arm
  const sw = o.walk != null ? Math.sin(o.walk * TAU) * 0.5 : 0;
  spr(arm, -56, -138, { r: (o.armL ?? 0.15) + sw, ...al, seed: seed + 3 });
  spr(arm, 56, -138, { r: -(o.armR ?? 0.15) - sw, ...al, seed: seed + 4 });
  spr(body, 0, -162, { ...al, seed: seed + 5 });
  // head
  push();
  translate(0, -170);
  rotate((o.headR || 0) + (o.lean || 0));
  spr(head, 0, -64, { ...al, seed: seed + 6 });
  let face = o.face || 'pf_neutral';
  if (o.blink !== false && (face === 'pf_neutral') && fract(G.T * 0.31 + seed * 0.17) < 0.03) face = 'pf_happy';
  spr(face, 0, -50, { ...al, seed: seed + 7 });
  if (o.hat === 'hardhat') spr('acc_hardhat', 0, -150, { s: 0.85, ...al });
  if (o.hat === 'party') spr('acc_party', 20, -140, { s: 0.8, r: 0.25, ...al });
  if (o.hat === 'bow') spr('acc_bow', 50, -150, { s: 0.8, r: 0.3, ...al });
  pop();
  pop();
}

// ---------- shared FX sprites ----------
defSprite('spark', 120, 120, () => { paint(starPts(60, 60, 50, 12, 4), PAL.butter, { baseC: '#FFF0A0', lw: 1.4 }); }, { v: 2 });
defSprite('sparkW', 120, 120, () => { paint(starPts(60, 60, 50, 12, 4), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.2, lc: PAL.lilac }); }, { v: 1 });
defSprite('heart', 120, 120, () => { paint(heartPts(60, 62, 46), PAL.pink, { baseC: '#FFB6CF', lw: 1.6 }); flat(ellPts(42, 44, 8, 6, 12), '#FFFFFF', 0.8); }, { v: 2 });
defSprite('heartR', 120, 120, () => { paint(heartPts(60, 62, 46), PAL.red, { baseC: '#FF6A86', lw: 1.6 }); flat(ellPts(42, 44, 8, 6, 12), '#FFFFFF', 0.8); }, { v: 1 });
defSprite('star5', 120, 120, () => { paint(starPts(60, 62, 50, 22, 5), PAL.butter, { baseC: '#FFE680', lw: 1.6 }); }, { v: 2 });
defSprite('drop', 60, 90, () => { paint([[30, 6], [48, 50], [44, 72], [30, 80], [16, 72], [12, 50]], PAL.sky, { baseC: '#CDEBFF', lw: 1.4 }); flat(ellPts(24, 52, 4, 8, 10), '#FFFFFF', 0.9); }, { v: 1 });
defSprite('note', 90, 120, () => { paint(ellPts(30, 92, 22, 16, 24, 0, -0.4), PAL.ink, { baseC: PAL.inkSoft, lw: 1.2 }); pen(PAL.ink, 5, 'marker'); brush.line(50, 88, 50, 18); brush.line(50, 18, 76, 34); brush.noStroke(); }, { v: 1 });
for (const [nm, c] of [['coral', PAL.coral], ['pink', PAL.pink], ['mint', PAL.mint], ['butter', PAL.butter], ['sky', PAL.sky], ['lilac', PAL.lilac], ['ink', PAL.ink], ['white', '#FFFFFF'], ['red', PAL.red], ['green', PAL.green], ['orange', PAL.orange]]) {
  defSprite('blob_' + nm, 160, 160, () => { blob(80, 80, 52, c, 190, 0.3); blob(80, 80, 40, c, 120, 0.2); }, { v: 1 });
}
defSprite('splat', 260, 260, () => {
  const pts = []; const n = 22;
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const r = i % 2 ? 60 + random() * 20 : 90 + random() * 30; pts.push([130 + Math.cos(a) * r, 130 + Math.sin(a) * r]); }
  wc('#FFFFFF', 230, 0.12, 0.4, 0.8); brush.polygon(pts);
  for (let i = 0; i < 6; i++) { const a = random() * TAU; blob(130 + Math.cos(a) * 118, 130 + Math.sin(a) * 118, 8 + random() * 8, '#FFFFFF', 230, 0.1); }
}, { v: 2 });
defSprite('cloud', 420, 220, () => {
  const c = '#FFFFFF';
  for (const [x, y, r] of [[120, 130, 70], [200, 100, 90], [290, 125, 72], [340, 150, 50], [70, 160, 46]]) { wc(c, 230, 0.08, 0.35, 0.5); brush.circle(x, y, r); }
  flat(rrPts(70, 130, 290, 60, 28), '#FFFFFF', 0.9);
  wc(PAL.skyLt, 120, 0.1, 0.4, 0.4); brush.rect(70, 160, 290, 26);
}, { v: 2 });
defSprite('puff', 260, 260, () => {
  for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; blob(130 + Math.cos(a) * 50, 130 + Math.sin(a) * 50, 55, '#FFFFFF', 200, 0.15); }
  blob(130, 130, 70, '#FFFFFF', 230, 0.1);
  wc(PAL.grayLt, 90, 0.2); brush.circle(150, 160, 60); brush.noFill();
}, { v: 2 });
defSprite('ring', 400, 400, () => { pen(PAL.white, 10, 'marker'); brush.circle(200, 200, 170); pen(PAL.butter, 5, 'marker'); brush.circle(200, 200, 150); brush.noStroke(); }, { v: 2 });
// lyric swashes (painted strokes behind captions)
for (let i = 0; i < 3; i++) {
  defSprite('swash' + i, 1400, 200, () => {
    const c = '#FFFFFF';
    wc(c, 235, 0.12, 0.35, 0.6);
    brush.beginShape(0.6);
    brush.vertex(40, 110); brush.vertex(300, 60 + random() * 20); brush.vertex(700, 50 + random() * 20); brush.vertex(1100, 55 + random() * 20); brush.vertex(1360, 90);
    brush.vertex(1340, 140); brush.vertex(1000, 150 + random() * 20); brush.vertex(600, 155 + random() * 15); brush.vertex(200, 150 + random() * 15); brush.vertex(50, 150);
    brush.endShape(true);
  }, { v: 1 });
}
// HUD card
defSprite('hud_card', 330, 150, () => {
  paint(rrPts(18, 18, 294, 114, 22), PAL.paper, { baseC: '#FFFDF7', lw: 2 });
  wc(PAL.coral, 60, 0.1); brush.rect(30, 100, 270, 20); brush.noFill();
});
// generic big background washes (painted at half res, drawn 2x)
// base: optional opaque colour laid down first (dark washes stay translucent without it)
function washSprite(name, layers, base = null) {
  defSprite(name, 1000, 580, () => {
    if (base) flat([[-10, -10], [1010, -10], [1010, 590], [-10, 590]], base);
    for (const L of layers) {
      wc(L.c, L.a ?? 150, L.b ?? 0.25, 0.55, 0.45);
      if (L.circle) brush.circle(L.circle[0], L.circle[1], L.circle[2]);
      else brush.rect(L.r[0], L.r[1], L.r[2], L.r[3]);
    }
    brush.noFill();
  }, { v: 1 });
}
function washBG(name, a = 1) { spr(name, W / 2, H / 2, { s: 2, a, jit: 0 }); }
washSprite('wash_paper', [{ c: PAL.cream, r: [-40, -40, 1080, 660], a: 120 }, { c: PAL.butterLt, circle: [300, 200, 260], a: 60 }, { c: PAL.pinkLt, circle: [760, 420, 240], a: 50 }]);

// s02.js - S02: loss coaster (L2), GPU throne (L3), chat monster (L4). Scene time 9.06-22.04.
// See docs/STORYBOARD.md. Everything here is private to this IIFE.
(() => {
  // ================= scene helpers =================
  // cheap painted look for small parts: flat fill plus a pencil outline (no watercolor layer)
  function flatInk(pts, c, lw = 1.4, lc = PAL.ink) { flat(pts, c); pen(lc, lw, '2B'); brush.polygon(pts); brush.noStroke(); }
  // many straight lines in one draw call (segs: [x1, y1, x2, y2])
  function lineBatch(segs, c, w, a = 1) {
    if (!segs.length) return;
    noFill(); stroke(withAlphaCol(c, a)); strokeWeight(w);
    beginShape(LINES); for (const [x1, y1, x2, y2] of segs) { vertex(x1, y1); vertex(x2, y2); } endShape();
    noStroke();
  }
  // keyframe tween: keys [[t, v], ...]; smoothstep between neighbours, held at the ends
  function kf(T, keys) {
    if (T <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (T <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; return lerp(v0, v1, sstep(t0, t1, T)); }
    }
    return keys[keys.length - 1][1];
  }
  // Pip rig with extra poses (same parts as art.js pip()):
  // o.waist bends the upper body at the hip, o.kneel (0..1) folds the legs, o.frontL / o.frontR draw that arm in front of the body,
  // o.holdL / o.holdR (hx, hy, armAngle) draw a prop at the hand in Pip-local space, o.bowtie adds a butler bow tie.
  function pipX(x, y, s, o = {}) {
    const a = o.a ?? 1;
    if (a <= 0) return;
    const al = a < 1 ? { a } : {};
    const seed = o.seed || 0;
    const kn = o.kneel || 0;
    push();
    translate(x, y - (o.hop || 0));
    if (o.r) rotate(o.r);
    scale(s * (o.flip ? -1 : 1) * (o.sq ?? 1), s / (o.sq ?? 1));
    const hipDrop = kn * 60;
    for (let i = 0; i < 2; i++) {
      let lr = 0, ly = 0;
      if (o.walk != null) { const ph = o.walk * TAU + i * Math.PI; lr = Math.sin(ph) * 0.5; ly = -Math.max(0, Math.cos(ph)) * 10; }
      if (o.legs) lr += o.legs[i] || 0;
      lr = lerp(lr, (i ? -1 : 1) * 1.3, kn);
      spr('pip_leg', (i ? 24 : -24) * (1 + kn * 0.25), -58 + ly + hipDrop, { r: lr, ...al, seed: seed + i });
    }
    push();
    translate(0, hipDrop - 40);
    rotate(o.waist || 0);
    translate(0, 40);
    const sw = o.walk != null ? Math.sin(o.walk * TAU) * 0.5 : 0;
    const angL = (o.armL ?? 0.15) + sw, angR = -(o.armR ?? 0.15) - sw;
    const armL = () => { spr('pip_arm', -56, -138, { r: angL, ...al, seed: seed + 3 }); if (o.holdL) o.holdL(-56 - Math.sin(angL) * 82, -138 + Math.cos(angL) * 82, angL); };
    const armR = () => { spr('pip_arm', 56, -138, { r: angR, ...al, seed: seed + 4 }); if (o.holdR) o.holdR(56 - Math.sin(angR) * 82, -138 + Math.cos(angR) * 82, angR); };
    if (!o.frontL) armL();
    if (!o.frontR) armR();
    spr('pip_body', 0, -162, { ...al, seed: seed + 5 });
    if (o.bowtie) spr('s02_bowtie', 0, -182, { s: 0.5, ...al });
    push();
    translate(0, -170);
    rotate((o.headR || 0) + (o.lean || 0));
    spr('pip_head', 0, -64, { ...al, seed: seed + 6 });
    let face = o.face || 'pf_neutral';
    if (o.blink !== false && face === 'pf_neutral' && fract(G.T * 0.31 + seed * 0.17) < 0.03) face = 'pf_happy';
    spr(face, 0, -50, { ...al, seed: seed + 7 });
    pop();
    if (o.frontL) armL();
    if (o.frontR) armR();
    pop();
    pop();
  }

  // Clawd happy eyes (the shared 'ce_happy' spline renders empty here); same 96px eye box as the art.js eye sprites
  defSprite('s02_ce_happy', 96, 96, () => {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI; pts.push([48 + Math.cos(a) * 31, 66 + Math.sin(a) * 30]); }
    for (let i = 14; i >= 0; i--) { const a = Math.PI + (i / 14) * Math.PI; pts.push([48 + Math.cos(a) * 17, 66 + Math.sin(a) * 16]); }
    flat(pts, PAL.black);
  });

  // ================= L2: There was a sudden drop in your training loss =================
  // World: a big sheet of graph paper; the loss curve is the coaster track (plateau, chain-lift hump, cliff, long low run-out).
  const PLAT = 560, PEAK_X = 1640, BOT_X = 2080, BOT_Y = 1200, AX_X = 120, AX_Y = 1340, BUMP_X = 3110;
  function lossY(x) {
    if (x < PEAK_X) { const lift = sstep(1250, PEAK_X, x); return PLAT + (16 * Math.sin(x * 0.013) + 8 * Math.sin(x * 0.041 + 1)) * (1 - lift) - 150 * lift - 330 * Math.exp(-Math.max(0, x - 130) / 95); }
    if (x < BOT_X) return lerp(PLAT - 150, BOT_Y, Ez.inOut(inv(PEAK_X, BOT_X, x)));
    const d = x - BOT_X, k = sstep(0, 300, d);
    return BOT_Y + (7 * Math.sin(d * 0.017) + 4 * Math.sin(d * 0.047)) * k + d * 0.012 - 46 * Math.exp(-(((x - BUMP_X) / 80) ** 2));
  }
  const RAIL = 19; // wheel contact offset above the charcoal curve (along the normal)
  function railAt(x) {
    const a = Math.atan2(lossY(x + 3) - lossY(x - 3), 6);
    return { x: x + Math.sin(a) * RAIL, y: lossY(x) - Math.cos(a) * RAIL, a };
  }
  // x reached after travelling arc length dist along the curve from x
  function arcWalk(x, dist) {
    const st = dist < 0 ? -1 : 1;
    let left = Math.abs(dist);
    while (left > 0) { const sl = (lossY(x + 1) - lossY(x - 1)) / 2; const dx = Math.min(6, left) / Math.sqrt(1 + sl * sl); x += st * dx; left -= 6; }
    return x;
  }
  // cart progress: chain-lift surges on the beats, a hang on the crest, the plunge on "drop", a long run-out into the whip
  function cartX(T) {
    if (T < 10.286) {
      const st = (T - 8.893) / BEAT_LEN, k = Math.floor(st), f = st - k;
      return 1000 + (k + 0.5 * Ez.inOut(clamp(f * 1.6)) + 0.5 * f) * 170;
    }
    if (T < 10.54) return 1510 + 158 * Ez.out(inv(10.286, 10.54, T));
    if (T < 11.0) return 1668 + 412 * inv(10.54, 11.0, T) ** 2;
    const t = T - 11.0;
    if (t < 0.5) return 2080 + 1790 * t - 840 * t * t;
    return 2765 + 950 * (t - 0.5) + (t > 1.25 ? 2500 * (t - 1.25) ** 2 : 0);
  }
  function trackPts(xa, xb) {
    const P = [];
    let x = xa;
    while (x < xb) { P.push([x, lossY(x)]); const sl = (lossY(x + 1) - lossY(x - 1)) / 2; x += 6 / Math.sqrt(1 + sl * sl); }
    P.push([xb, lossY(xb)]);
    return P;
  }
  // track painted 1:1 in world pixels so it stays crisp under the follow camera
  function trackTile(name, x0, y0, w, h, xa, xb) {
    defSprite(name, w, h, () => {
      const P = trackPts(xa, xb);
      const N = P.map((p, i) => { const q = P[Math.min(i + 1, P.length - 1)], o = P[Math.max(i - 1, 0)]; const a = Math.atan2(q[1] - o[1], q[0] - o[0]); return [Math.sin(a), -Math.cos(a)]; });
      const off = (d) => { const out = []; for (let i = 0; i < P.length; i++) if (i % 4 === 0 || i === P.length - 1) out.push([P[i][0] + N[i][0] * d - x0, P[i][1] + N[i][1] * d - y0]); return out; };
      pen(PAL.inkSoft, 1.5, 'pen');
      for (let i = 3; i < P.length; i += 6) { const [px, py] = P[i], [nx, ny] = N[i]; brush.line(px + nx * 1 - x0, py + ny * 1 - y0, px + nx * 20 - x0, py + ny * 20 - y0); }
      brush.noStroke();
      pen(PAL.ink, 2.2, 'charcoal'); brush.spline(off(0), 0.5);
      pen(PAL.coralDk, 1.3, 'pen'); brush.spline(off(9), 0.5);
      pen(PAL.coral, 4.2, 'marker'); brush.spline(off(13.5), 0.5);
      pen('#FFFFFF', 1, 'pen'); brush.spline(off(16), 0.5);
      brush.noStroke();
    }, { ax: 0, ay: 0 });
  }
  trackTile('s02_trackA', 100, 190, 1580, 470, 130, 1660);
  trackTile('s02_trackB', 1560, 330, 700, 960, 1640, 2200);
  trackTile('s02_trackC', 2160, 1110, 3300, 200, 2180, 5440);
  defSprite('s02_graph_paper', 1000, 580, () => { wash(-40, -40, 1080, 660, '#F6FBFF', 210, 0.1); blob(200, 150, 220, PAL.skyLt, 60, 0.4); blob(820, 440, 260, PAL.lilacLt, 55, 0.4); blob(560, 260, 140, PAL.butterLt, 40, 0.4); });
  defSprite('s02_cart', 600, 340, () => {
    paint(rrPts(90, 248, 420, 34, 12), PAL.inkSoft, { baseC: '#6E5F90', lw: 1.6 });
    const body = rrPtsPoly([[40, 118], [74, 88], [470, 88], [540, 64], [582, 104], [566, 256], [40, 256]], 30);
    paint(body, PAL.butter, { baseC: '#FFE17A', lw: 2.6 });
    wc(PAL.mint, 200, 0.04, 0.4, 0.5); brush.rect(52, 196, 506, 34); brush.noFill();
    pen(PAL.ink, 1.6, '2B'); brush.line(52, 196, 556, 196); brush.line(52, 230, 552, 230); brush.noStroke();
    flat(rrPts(62, 100, 90, 22, 10), '#FFFFFF', 0.8);
    paint(starPts(520, 142, 34, 14, 5), PAL.coral, { baseC: PAL.coralLt, lw: 1.4 });
    const t = textImg('SGD', { font: 'pixel', size: 62, fill: PAL.coral, weight: 700, stroke: PAL.ink, sw: 4 });
    image(t.img, 300 - t.w / 2, 146 - t.h / 2);
  }, { v: 2, ax: 0.5, ay: 328 / 340 });
  defSprite('s02_wheel', 110, 110, () => {
    paint(ellPts(55, 55, 40, 40, 28), PAL.ink, { baseC: '#4A3E66', lw: 1.6 });
    pen(PAL.gray, 2, 'pen'); for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU; brush.line(55, 55, 55 + Math.cos(a) * 32, 55 + Math.sin(a) * 32); } brush.noStroke();
    paint(ellPts(55, 55, 13, 13, 16), PAL.gray, { baseC: PAL.grayLt, lw: 1.2 });
  });
  // doodles in the margins of the graph paper (variant = doodle kind)
  defSprite('s02_doodle', 200, 200, (v) => {
    if (v === 0) paint(starPts(100, 106, 72, 30, 5), PAL.butter, { baseC: PAL.butterLt, lw: 1.8, lc: PAL.inkSoft, a: 110 });
    else if (v === 1) { const p = []; for (let i = 0; i < 70; i++) { const a = i * 0.3, r = 4 + i * 1.05; p.push([100 + Math.cos(a) * r, 100 + Math.sin(a) * r]); } strokePath(p, PAL.lilac, 2.4, 'pen', 0.6); }
    else if (v === 2) paint(heartPts(100, 104, 70), PAL.pink, { baseC: PAL.pinkLt, lw: 1.8, lc: PAL.inkSoft, a: 90 });
    else if (v === 3) { pen(PAL.inkSoft, 2.2, 'pen'); brush.circle(100, 100, 70); brush.circle(76, 84, 7); brush.circle(124, 84, 7); brush.noStroke(); strokePath([[64, 116], [100, 142], [136, 116]], PAL.inkSoft, 2.2, 'pen', 0.5); blob(60, 122, 12, PAL.pink, 90, 0.2); blob(140, 122, 12, PAL.pink, 90, 0.2); }
    else if (v === 4) paint([[118, 20], [60, 110], [100, 110], [78, 182], [146, 84], [104, 84], [132, 20]], PAL.butter, { baseC: PAL.butterLt, lw: 1.8, lc: PAL.inkSoft, a: 120 });
    else if (v === 5) { for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; flatInk(ellPts(100 + Math.cos(a) * 38, 100 + Math.sin(a) * 38, 28, 28, 20), PAL.pinkLt, 1.4, PAL.inkSoft); } flatInk(ellPts(100, 100, 22, 22, 20), PAL.butter, 1.4, PAL.inkSoft); }
    else if (v === 6) { flatInk(ellPts(100, 100, 40, 40, 28), PAL.butter, 1.6, PAL.inkSoft); pen(PAL.orange, 2.4, 'pen'); for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; brush.line(100 + Math.cos(a) * 54, 100 + Math.sin(a) * 54, 100 + Math.cos(a) * 82, 100 + Math.sin(a) * 82); } brush.noStroke(); }
    else if (v === 7) { strokePath([[30, 150], [60, 90], [110, 70], [140, 100], [120, 130], [96, 110], [120, 60], [170, 40]], PAL.sky, 2.6, 'pen', 0.5); strokePath([[146, 30], [172, 40], [160, 66]], PAL.sky, 2.6, 'pen', 0.3); }
    else if (v === 8) { pen(PAL.red, 4, 'marker'); brush.line(74, 30, 70, 130); brush.line(126, 30, 122, 130); brush.noStroke(); blob(70, 160, 9, PAL.red, 230, 0.05); blob(122, 160, 9, PAL.red, 230, 0.05); }
    else { const p = []; for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; p.push([100 + Math.cos(a) * 80, 118 + Math.sin(a) * 50 + (i % 2 ? -14 : 0)]); } p.push([176, 132], [24, 132]); paint(p, PAL.skyLt, { baseC: '#EAF6FF', lw: 1.8, lc: PAL.lilac, a: 90 }); }
  }, { v: 10 });
  defSprite('s02_crumb', 60, 60, () => { flatInk(ellPts(30, 30, 15, 10, 9, 0.5), PAL.pink, 1.2, PAL.inkSoft); }, { v: 2 });
  defSprite('s02_dust', 260, 200, () => {
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU + 0.4; flat(ellPts(130 + Math.cos(a) * 50, 100 + Math.sin(a) * 32, 40, 34, 20), PAL.grayLt, 0.8); }
    blob(130, 100, 64, PAL.gray, 130, 0.15);
    blob(150, 116, 24, PAL.pinkLt, 110, 0.1);
  });
  defSprite('s02_pencil', 600, 120, () => {
    paint([[70, 34], [470, 34], [470, 86], [70, 86]], PAL.butter, { baseC: '#FFE17A', lw: 2 });
    pen(PAL.gold, 2, 'pen'); brush.line(80, 52, 462, 52); brush.line(80, 68, 462, 68); brush.noStroke();
    paint([[470, 30], [520, 30], [520, 90], [470, 90]], PAL.gray, { baseC: PAL.grayLt, lw: 1.6 });
    paint(rrPts(516, 30, 64, 60, 14), PAL.pink, { baseC: PAL.pinkLt, lw: 1.8 });
    paint([[70, 34], [70, 86], [22, 60]], PAL.brownLt, { baseC: '#F1D2B4', lw: 1.6 });
    paint([[38, 52], [38, 68], [16, 60]], PAL.ink, { baseC: '#4A3E66', lw: 1.2 });
  }, { ax: 16 / 600, ay: 0.5 });
  const DOODLES = [[430, 300, 0, 0.55], [860, 250, 1, 0.5], [1230, 300, 9, 0.8], [640, 380, 2, 0.4], [1060, 400, 0, 0.36], [1500, 250, 9, 0.7], [2250, 380, 9, 0.75], [2650, 700, 0, 0.45], [560, 880, 3, 0.62], [980, 1080, 4, 0.55], [1440, 800, 5, 0.55],
    [1930, 520, 8, 0.6], [2380, 820, 6, 0.62], [2720, 960, 0, 0.5], [3050, 790, 7, 0.6], [3420, 960, 2, 0.55], [3780, 800, 3, 0.55], [4140, 950, 1, 0.55], [4520, 820, 9, 0.8], [4880, 980, 5, 0.55]];
  // eraser dust puffs and rubber crumbs flung off the rail during the plunge
  function eraserFX(T) {
    const t0 = 10.5, t1 = 11.35;
    for (let i = 0; i < 26; i++) {
      const tb = t0 + (i / 26) * (t1 - t0), age = T - tb, life = 0.95;
      if (age < 0 || age > life) continue;
      const p = railAt(cartX(tb) - 110);
      const dir = p.a + Math.PI + RS(i, 3) * 0.9;
      const d = 150 * Ez.out(clamp(age / life)) * (0.6 + R(i, 4));
      spr('s02_dust', p.x + Math.cos(dir) * d, p.y + Math.sin(dir) * d - 30 * age, { s: (0.4 + age * 1.1) * (0.7 + 0.5 * R(i, 5)), a: (1 - age / life) * 0.9, r: RS(i, 6), seed: i });
    }
    for (let i = 0; i < 36; i++) {
      const tb = t0 + (i / 36) * (t1 - t0), age = T - tb, life = 0.8;
      if (age < 0 || age > life) continue;
      const p = railAt(cartX(tb) - 90 + RS(i, 8) * 50);
      const ang = p.a - Math.PI / 2 + RS(i, 9) * 1.1, sp = 450 + 550 * R(i, 10);
      spr('s02_crumb', p.x + Math.cos(ang) * sp * age, p.y + Math.sin(ang) * sp * age + 900 * age * age, { s: 0.7 + 0.7 * R(i, 11), r: age * 8 * RS(i, 12), a: 1 - inv(0.6, 0.8, age), seed: i });
    }
  }
  // S01's lead-out traces (same deterministic geometry as s01.js LEAD) continue across the wipe, then fade into the grid
  const LEAD = (() => {
    const out = [];
    for (let i = 0; i < 9; i++) {
      let x = W + 40, y = 95 + i * 112 + RS(i, 5) * 22; const pts = [[x, y]];
      let st = 0;
      while (x > -500) { x -= 150 + R(i * 9 + st, 6) * 260; pts.push([x, y]); const dy = (R(i * 9 + st, 7) < 0.5 ? -1 : 1) * (36 + R(i * 9 + st, 8) * 44); x -= Math.abs(dy); y += dy; pts.push([x, y]); st++; }
      out.push({ pts, dt: RS(i, 9) * 0.04 });
    }
    return out;
  })();
  function leadIn(T) {
    const fa = 1 - sstep(9.08, 9.4, T);
    if (fa <= 0) return;
    for (const L of LEAD) {
      const u = Ez.in(inv(8.45 + L.dt, 9.15 + L.dt, T));
      if (u <= 0) continue;
      const dist = (W + 460) * u;
      const seg = [L.pts[0]]; let acc = 0, head = L.pts[0];
      for (let i = 1; i < L.pts.length; i++) {
        const a = L.pts[i - 1], b = L.pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (acc + l >= dist) { const kk = (dist - acc) / l; head = [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk)]; seg.push(head); break; }
        acc += l; seg.push(b); head = b;
      }
      for (const [c, w0, al] of [[PAL.ink, 16, 0.85 * fa], [PAL.mint, 9, 1], ['#FFFFFF', 3, 0.7]]) { noFill(); stroke(withAlphaCol(c, al * fa)); strokeWeight(w0); beginShape(); for (const q of seg) vertex(q[0], q[1]); endShape(); }
      noStroke();
      for (let i = 1; i < seg.length - 1; i++) { disc(seg[i][0], seg[i][1], 11, PAL.ink, fa); disc(seg[i][0], seg[i][1], 7, PAL.butter, fa); }
      disc(head[0], head[1], 13, PAL.mintLt, fa); disc(head[0], head[1], 7, '#FFFFFF', fa);
    }
  }
  shot({
    id: 'L2-loss', t0: 9.06, tin: { type: 'wipe', d: 0.5, at: 0.5, ang: Math.PI },
    draw(s) {
      const T = s.T;
      const tSud = wordT(2, 3), tDrop = wordT(2, 4), tLoss = wordT(2, 8);
      const cxw = cartX(T);
      // wheels ride the rail: chord between the rail points under the two wheels
      const pb = railAt(arcWalk(cxw, -96)), pf = railAt(arcWalk(cxw, 96));
      const ang = Math.atan2(pf.y - pb.y, pf.x - pb.x), ax = (pb.x + pf.x) / 2, ay = (pb.y + pf.y) / 2;
      const drop = sstep(tDrop - 0.02, tDrop + 0.12, T) * (1 - sstep(10.95, 11.25, T));
      const plunge = sstep(tDrop - 0.02, tDrop + 0.12, T) * (1 - sstep(10.76, 10.97, T));
      const impact = T > 11.0 ? Math.exp(-(T - 11.0) * 6) : 0;
      // camera: wide establishing, follow and push in, hang on the crest, tilt into the plunge, pan with the run-out
      const Z = kf(T, [[9.3, 0.9], [10.1, 1.22], [10.42, 1.42], [10.62, 1.38], [10.98, 1.02], [12.5, 1.1]]) + 0.04 * impact;
      const follow = kf(T, [[9.25, 0], [9.95, 1]]);
      const offX = kf(T, [[9.9, 170], [10.3, 210], [10.62, 150], [11.1, 270], [12.25, 300], [12.7, 560]]);
      const offY = kf(T, [[9.9, -40], [10.3, -105], [10.6, -110], [10.95, -135], [11.3, -140]]);
      const cx = lerp(1020, ax + offX, follow), cy = lerp(600, ay + offY, follow);
      washBG('s02_graph_paper');
      push();
      shake(impact * 18 + drop * 5, 3);
      cam(cx, cy, Z, 0.1 * plunge);
      const hw = W / 2 / Z + 260, hh = H / 2 / Z + 260;
      const x0 = cx - hw, x1 = cx + hw, y0 = cy - hh, y1 = cy + hh;
      // graph grid
      const gMin = [], gMaj = [];
      for (let gx = Math.floor(x0 / 80) * 80; gx <= x1; gx += 80) (gx % 400 === 0 ? gMaj : gMin).push([gx, y0, gx, y1]);
      for (let gy = Math.floor(y0 / 80) * 80; gy <= y1; gy += 80) (gy % 400 === 0 ? gMaj : gMin).push([x0, gy, x1, gy]);
      lineBatch(gMin, PAL.sky, 1.5, 0.26); lineBatch(gMaj, PAL.sky, 3, 0.45);
      // doodles, paperclips (hidden-paperclip thread)
      DOODLES.forEach(([dx, dy, v, sc], i) => { if (dx < x0 - 200 || dx > x1 + 200) return; spr('s02_doodle', dx + Math.sin(T * 1.3 + i) * 6, dy, { v, s: sc * (1 + 0.08 * kick(T + i * 0.07)), r: Math.sin(T * 1.7 + i * 2) * 0.12, seed: i }); });
      spr('paperclip', 1210, 930, { s: 0.9, r: 0.55 + Math.sin(T * 2) * 0.03 });
      spr('paperclip', 3560, 1470, { s: 0.85, r: -1.25 });
      // axes, ticks and labels (kept up and to the right, away from the HUD corner)
      segLine(AX_X, 150, AX_X, AX_Y, PAL.ink, 7); segLine(AX_X, AX_Y, 5700, AX_Y, PAL.ink, 7);
      noStroke(); fill(PAL.ink); triangle(AX_X - 20, 170, AX_X + 20, 170, AX_X, 120);
      for (const [yv, lab] of [[330, '3.0'], [560, '2.0'], [790, '1.0']]) { segLine(AX_X - 16, yv, AX_X + 16, yv, PAL.ink, 5); txt(lab, AX_X - 58, yv, { font: 'hand', size: 46, fill: PAL.inkSoft, weight: 700 }); }
      txt('loss', AX_X + 62, 205, { font: 'hand', size: 64, fill: PAL.ink, weight: 700 }, { r: -Math.PI / 2 });
      for (let i = 1; i <= 6; i++) { const tx = 800 * i; if (tx < x0 || tx > x1) continue; segLine(tx, AX_Y - 16, tx, AX_Y + 16, PAL.ink, 5); txt(i + 'k', tx, AX_Y + 50, { font: 'hand', size: 46, fill: PAL.inkSoft, weight: 700 }); }
      txt('training steps →', 4420, AX_Y + 62, { font: 'hand', size: 56, fill: PAL.ink, weight: 700 });
      // coaster struts
      const legs = [], braces = [];
      for (let sx = 170; sx < 5600; sx += 110) {
        if (sx < x0 - 60 || sx > x1 + 60) continue;
        const ty = lossY(sx) + 6, ny = lossY(sx + 110) + 6;
        legs.push([sx, ty, sx - 20, AX_Y], [sx, ty, sx + 20, AX_Y]);
        braces.push([sx, lerp(ty, AX_Y, 0.35), sx + 110, lerp(ny, AX_Y, 0.6)]);
      }
      lineBatch(legs, PAL.lilac, 2.4, 0.7); lineBatch(braces, PAL.lilac, 1.6, 0.45);
      // the loss-curve track; the pencil keeps drawing the low stretch ahead of the cart
      const xPen = Math.max(BOT_X + 1000, cxw + 780);
      spr('s02_trackA', 100, 190, { jit: 0.3 });
      spr('s02_trackB', 1560, 330, { jit: 0.3 });
      spr('s02_trackC', 2160, 1110, { jit: 0.3, crop: [0, 0, clamp((xPen - 2160) / 3300), 1] });
      if (xPen > x0 && xPen < x1 + 300) spr('s02_pencil', xPen, lossY(xPen) + 2 + Math.sin(T * 38) * 3, { s: 0.9, r: -0.6 + Math.sin(T * 22) * 0.04 });
      eraserFX(T);
      // the cart and riders
      const air = T > 11.7 && T < 12.05 ? Math.sin(Math.PI * inv(11.7, 12.05, T)) : 0;
      const bob = T < tSud ? hopB(T) * 7 : T > 11.3 ? hopB(T) * 5 : 0;
      const shiver = T > tSud && T < tDrop ? RS(G.boil, 4) * 2 : 0;
      push();
      translate(ax, ay);
      rotate(ang + shiver * 0.004);
      const stage = T < tSud ? 0 : T < tDrop ? 1 : T < 11.3 ? 2 : 3;
      // Pip, rear seat
      const pipO = { seed: 3, headR: 0, lean: 0 };
      if (stage === 0) Object.assign(pipO, { face: 'pf_nervous', armL: 0.55, armR: 0.55, headR: Math.sin(T * 26) * 0.03 });
      else if (stage === 1) Object.assign(pipO, { face: 'pf_shock', armL: 0.35, armR: 0.35, lean: 0.18 });
      else if (stage === 2) Object.assign(pipO, { face: 'pf_scared', armL: 2.6 + Math.sin(T * 30) * 0.12, armR: 2.6 + Math.cos(T * 28) * 0.12, lean: -0.25 });
      else Object.assign(pipO, { face: T < tLoss ? 'pf_dizzy' : 'pf_happy', armL: T < tLoss ? 1.2 : 2.3 + Math.sin(T * 12) * 0.2, armR: T < tLoss ? 1.2 : 2.3 + Math.cos(T * 12) * 0.2, headR: T < tLoss ? Math.sin(T * 9) * 0.15 : 0 });
      pipX(-100, -80 - bob - air * 26, 0.53, pipO);
      // Clawd, front seat
      const clO = { seed: 5, blush: true };
      if (stage === 0) Object.assign(clO, { eyes: 'ce_sq', look: [0.35, 0], armL: -0.5 - hopB(T) * 0.4, armR: -0.1 + Math.sin(T * 5) * 0.15 });
      else if (stage === 1) Object.assign(clO, { eyes: 'ce_sq', look: [0.5, 0.55], eyeS: 1.25, armL: 0.35, armR: 0.35 });
      else if (stage === 2) Object.assign(clO, { eyes: 's02_ce_happy', mouth: 'smile', armL: -2.3 + Math.sin(T * 24) * 0.12, armR: -2.3 + Math.cos(T * 22) * 0.12 });
      else Object.assign(clO, { eyes: T < tLoss ? 's02_ce_happy' : 'ce_star', armL: -1.9 + Math.sin(T * 10) * 0.45, armR: -1.9 - Math.sin(T * 10) * 0.45 });
      clawd(80, -92 - bob * 1.3 - air * 34, 0.5, clO);
      spr('s02_cart', 0, 0, { s: 0.6, sx: 1 + impact * 0.12, sy: 1 - impact * 0.1, seed: 2 });
      for (const wx of [-96, 96]) spr('s02_wheel', wx, -23, { s: 0.6, r: cxw / 24, jit: 0 });
      if (stage === 1) spr('drop', -40, -270, { s: 0.45 * Ez.outBack(clamp((T - tSud) / 0.2)), r: 0.4 });
      if (T < 10.36) { const bt = beatAt(T), ka = 1 - inv(0, 0.3, bt.ph); if (ka > 0) for (let i = 0; i < 3; i++) segLine(-150 - i * 16, -16 - i * 14, -186 - i * 22, -22 - i * 20, PAL.ink, 4, ka); }
      pop();
      // plunge streaks along the drop
      if (plunge > 0) { push(); translate(ax, ay); rotate(ang); for (let i = 0; i < 10; i++) { const ly = -300 + R(i, 6) * 280, lx = -230 - fract(R(i, 5) + T * 3) * 380; segLine(lx, ly, lx - 110 - R(i, 7) * 90, ly, PAL.lilac, 5, 0.7 * plunge); } pop(); }
      // splash of eraser crumbs and paint at the bottom
      const sp = railAt(2080);
      burst(T, 11.0, sp.x + 40, sp.y - 10, { n: 22, names: ['s02_crumb', 'blob_sky', 'blob_lilac', 'spark'], spd: 1100, g: 1400, life: 1.1, s: 0.45, spread: Math.PI * 0.9, ang0: -Math.PI / 2, seed: 7 });
      burst(T, 11.0, sp.x, sp.y, { n: 8, names: ['s02_dust'], spd: 500, g: -60, life: 1.0, s: 0.7, spread: Math.PI, ang0: -Math.PI / 2, spin: 1, seed: 17 });
      if (T > 11.3) speedLines(T, 10, 4, PAL.inkSoft, 0.3, 240, 4, 2400, -1, [x0, ay - 420, x1 - x0, 380]);
      pop();
      leadIn(T);
      // "-99%" stamp on the drop
      const da = T - (tDrop + 0.04);
      if (da > 0 && da < 1.5) {
        const k = Ez.outBack(clamp(da / 0.22), 2.6), a = 1 - inv(1.15, 1.5, da);
        txt('-99%', 1470, 360 - da * 30, { font: 'pixel', size: 150, fill: PAL.mint, weight: 700, stroke: PAL.ink, sw: 9, shadow: 'rgba(43,33,64,0.5)' }, { s: k, a, r: -0.12 + Math.sin(T * 30) * 0.02 * Math.exp(-da * 3) });
      }
    },
  });
  lyr(2, { y: 138, words: { 3: { anim: 'shake', jitter: 3 }, 4: { anim: 'drop', fill: PAL.coral, grow: 0.3 }, 8: { fill: PAL.mint, anim: 'drop' } } });

  // ================= L3: now I'm your servant and you're my boss =================
  defSprite('s02_throne_wall', 1000, 580, () => {
    flat([[-20, -20], [1020, -20], [1020, 600], [-20, 600]], '#553074');
    wash(-40, -40, 1080, 660, '#5B2F7A', 160, 0.1);
    blob(500, 230, 300, '#8B4FB0', 90, 0.4);
    blob(140, 120, 150, '#6E3A94', 80, 0.4); blob(860, 140, 150, '#6E3A94', 80, 0.4);
    wash(-40, 430, 1080, 220, '#3E1F5A', 180, 0.15);
  });
  defSprite('s02_banner', 240, 460, () => {
    paint([[20, 20], [220, 20], [220, 440], [120, 380], [20, 440]], PAL.red, { baseC: '#FF6070' });
    const P = [[0, 0], [8, 0], [8, 2], [10, 2], [10, 4], [8, 4], [8, 8], [7, 8], [7, 6], [6, 6], [6, 8], [5, 8], [5, 6], [3, 6], [3, 8], [2, 8], [2, 6], [1, 6], [1, 8], [0, 8], [0, 4], [-2, 4], [-2, 2], [0, 2]];
    paint(P.map(([x, y]) => [70 + x * 10, 150 + y * 10]), PAL.gold, { baseC: '#FFD75A', lw: 1.4 });
    pen(PAL.gold, 4, 'marker'); brush.line(20, 40, 220, 40); brush.noStroke();
  });
  defSprite('s02_carpet', 1000, 400, () => { paint([[380, 0], [620, 0], [960, 400], [40, 400]], PAL.red, { baseC: '#FF5A6A', lw: 2 }); pen(PAL.gold, 5, 'marker'); brush.line(400, 0, 90, 400); brush.line(600, 0, 910, 400); brush.noStroke(); });
  defSprite('s02_palm_fan', 300, 420, () => {
    pen(PAL.brown, 7, 'marker'); brush.line(150, 400, 150, 170); brush.noStroke();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.28; const tip = [150 + Math.cos(a) * 170, 190 + Math.sin(a) * 170]; paint([[150, 200], [tip[0] - 18, tip[1] + 6], tip, [tip[0] + 18, tip[1] + 6]], PAL.green, { baseC: '#7FD9A0', lw: 1.4 }); }
  }, { ay: 0.95 });
  defSprite('s02_fan', 100, 100, () => {
    flat(ellPts(50, 50, 38, 38, 28), '#232838');
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; flatInk([[50, 50], [50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36], [50 + Math.cos(a + 0.7) * 30, 50 + Math.sin(a + 0.7) * 30]], '#A7AEC4', 0.8, '#232838'); }
    flat(ellPts(50, 50, 9, 9, 12), PAL.green);
  });
  defSprite('s02_cushion', 440, 140, () => {
    paint(rrPts(20, 26, 400, 86, 40), PAL.blue, { baseC: '#6E93F7', lw: 2 });
    wc(PAL.navy, 80, 0.1); brush.rect(40, 80, 360, 26); brush.noFill();
    pen(PAL.gold, 3, 'marker'); brush.line(40, 42, 400, 42); brush.noStroke();
    for (const x of [28, 412]) paint(ellPts(x, 104, 14, 22, 12), PAL.gold, { baseC: '#FFD75A', lw: 1.2 });
  });
  defSprite('s02_plaque', 380, 140, () => {
    paint(rrPts(16, 16, 348, 108, 26), PAL.gold, { baseC: '#FFD75A', lw: 2.2 });
    pen(PAL.ink, 1.4, 'pen'); brush.rect(34, 32, 312, 76); brush.noStroke();
    const t = textImg('BOSS', { font: 'pixel', size: 70, fill: PAL.ink, weight: 700 });
    image(t.img, 190 - t.w / 2, 72 - t.h / 2);
  });
  defSprite('s02_bowtie', 150, 90, () => {
    paint([[75, 45], [14, 12], [14, 78]], PAL.red, { baseC: '#FF6A7E', lw: 1.6 });
    paint([[75, 45], [136, 12], [136, 78]], PAL.red, { baseC: '#FF6A7E', lw: 1.6 });
    paint(rrPts(62, 32, 26, 26, 8), PAL.coralDk, { baseC: PAL.red, lw: 1.4 });
  });
  defSprite('s02_tray', 240, 160, () => {
    paint(ellPts(120, 124, 104, 20, 32), PAL.gray, { baseC: '#E4E0EE', lw: 1.8 });
    paint([[80, 60], [150, 60], [140, 116], [90, 116]], PAL.mint, { baseC: PAL.mintLt, lw: 1.6 });
    pen(PAL.ink, 2, '2B'); brush.circle(158, 84, 14); brush.noStroke();
    paint(ellPts(115, 60, 35, 7, 20), PAL.brown, { baseC: PAL.brownLt, lw: 1.2 });
    paint(ellPts(190, 110, 20, 9, 16), PAL.brownLt, { baseC: '#E6C09C', lw: 1.2 });
    strokePath([[104, 46], [96, 30], [108, 16], [100, 2]], PAL.grayLt, 2, 'pen', 0.6);
  }, { ay: 0.8 });
  defSprite('s02_coin', 90, 90, () => { paint(ellPts(45, 45, 32, 32, 24), PAL.gold, { baseC: '#FFE17A', lw: 1.6 }); flatInk(starPts(45, 46, 16, 7, 5), PAL.butterLt, 1); });
  defSprite('s02_bubble', 330, 260, () => {
    const b = rrPts(20, 20, 290, 170, 70, 6);
    paint([[70, 170], [32, 240], [130, 180]], '#FFFFFF', { baseC: '#FFFFFF', lw: 2.6 });
    paint(b, '#FFFFFF', { baseC: '#FFFFFF', a: 90, lw: 2.8 });
    wc(PAL.lilacLt, 80, 0.1); brush.rect(40, 150, 250, 30); brush.noFill();
  }, { ax: 165 / 330, ay: 105 / 260 });
  function gpuAt(x, y, sc, r, T, i) {
    spr('gpu', x, y, { s: sc, r, seed: i });
    for (const fx of [-65, 65]) spr('s02_fan', x + fx * Math.cos(r) * sc, y + fx * Math.sin(r) * sc - Math.cos(r) * sc, { s: sc, r: T * 13 + i * 1.3, jit: 0 });
  }
  shot({
    id: 'L3-throne', t0: 12.52, tin: { type: 'whip', d: 0.45, at: 0.5, ang: 0 },
    draw(s) {
      const T = s.T, k = kick(T), bt = beatAt(T);
      const tIm = wordT(3, 1), tSv = wordT(3, 3), tAnd = wordT(3, 4), tYou = wordT(3, 5), tBoss = wordT(3, 7);
      const bossK = T > tBoss ? Math.exp(-(T - tBoss) * 4) : 0;
      // camera carries on the whip pan, settles, then pushes in; punch on "boss"
      const settle = Ez.out(inv(12.28, 13.0, T));
      const Z = lerp(1.0, 1.1, Ez.inOut(inv(12.8, 16.2, T))) + 0.06 * bossK;
      const camX = lerp(620, 960, settle), camY = 560 - 20 * Ez.inOut(inv(12.8, 16.2, T));
      spr('s02_throne_wall', W / 2 - (camX - 960) * 0.35, H / 2, { s: 2.15, jit: 0 });
      push();
      cam(camX, camY, Z);
      // sunburst behind the throne
      blendMode(ADD); noStroke();
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU + T * 0.15, w = 0.07;
        fill(withAlphaCol(PAL.gold, 0.08 + 0.05 * k + 0.12 * bossK));
        triangle(960, 430, 960 + Math.cos(a - w) * 1500, 430 + Math.sin(a - w) * 1500, 960 + Math.cos(a + w) * 1500, 430 + Math.sin(a + w) * 1500);
      }
      blendMode(BLEND);
      spr('s02_banner', 300, 330, { r: Math.sin(T * 1.3) * 0.03 }); spr('s02_banner', 1620, 330, { r: Math.sin(T * 1.3 + 1) * 0.03, flip: true });
      spr('s02_carpet', 960, 905, { s: 1.4, jit: 0.3 });
      twinkles(T, 16, 21, [160, 180, 1600, 560], ['spark', 'sparkW'], 0.1, 0.28, 2.6);
      // the GPU throne: tall back, armrests, seat base and steps; RGB strips cycle on the beat
      const led = [PAL.mint, PAL.sky, PAL.lilac, PAL.pink];
      const G_BACK = [[960, 590], [960, 485], [960, 380]];
      G_BACK.forEach(([gx, gy], i) => gpuAt(gx, gy, 1.3, RS(i, 3) * 0.02, T, i));
      gpuAt(652, 640, 1.0, -Math.PI / 2, T, 4); gpuAt(1268, 640, 1.0, Math.PI / 2, T, 5);
      gpuAt(810, 790, 1.0, 0, T, 6); gpuAt(1110, 790, 1.0, 0, T, 7);
      gpuAt(650, 895, 1.05, 0.03, T, 8); gpuAt(960, 900, 1.05, 0, T, 9); gpuAt(1270, 895, 1.05, -0.03, T, 10);
      for (let i = 0; i < 7; i++) { const [gx, gy] = [[960, 646], [960, 541], [960, 436], [810, 835], [1110, 835], [650, 942], [1270, 942]][i]; glow(gx, gy, 70, led[(bt.i + i) % 4], 0.3 + 0.3 * k + 0.3 * bossK); }
      spr('s02_cushion', 960, 668, { s: 1.0 });
      // Clawd lounging on the throne, bossing
      const point = sstep(tIm - 0.1, tIm + 0.08, T) * (1 - sstep(tSv + 0.1, tSv + 0.35, T));
      const relax = sstep(tAnd - 0.15, tAnd + 0.2, T) * (1 - sstep(tYou - 0.1, tYou + 0.1, T));
      const rise = sstep(tYou - 0.1, tYou + 0.15, T);
      const cheer = sstep(tBoss - 0.06, tBoss + 0.04, T);
      let armL = 0.55 + Math.sin(T * 2.2) * 0.05, armR = -0.25 + Math.sin(T * 3) * 0.22;
      armR = lerp(armR, 0.12 + Math.sin(T * 30) * 0.02, point);
      armL = lerp(armL, -2.35, relax); armR = lerp(armR, -2.35, relax);
      armR = lerp(armR, -1.45, rise * (1 - cheer)); armL = lerp(armL, 0.4, rise * (1 - cheer));
      armL = lerp(armL, -2.1 + Math.sin(T * 14) * 0.15, cheer); armR = lerp(armR, -2.1 - Math.sin(T * 14) * 0.15, cheer);
      const bubbleOn = sstep(15.66, 15.9, T);
      let eyes = 'ce_sq', look = [0.35, 0.05];
      if (T > tSv - 0.05 && T < tYou - 0.1) { eyes = 's02_ce_happy'; look = [0, 0]; }
      if (point > 0.5) look = [0.55, 0.1];
      if (T > tBoss - 0.02) { eyes = 'ce_star'; look = [0.1, -0.1]; }
      if (bubbleOn > 0.5) look = [0.45, -0.35];
      const nod = T > tSv && T < tSv + 0.5 ? Math.sin(Math.PI * inv(tSv, tSv + 0.5, T)) * 12 : 0;
      const lean = lerp(-0.07, 0.02, rise) - relax * 0.05 + point * 0.12;
      clawd(960, 745 - nod + cheer * hopB(T) * 16 + (1 - cheer) * hopB(T) * 4, 1.0, {
        acc: ['crown'], eyes, look, eyeS: 1 + bossK * 0.3, armL, armR, r: lean, blush: true, seed: 2,
        legs: [[0, Math.sin(T * 4.2) * 0.22], [0, Math.sin(T * 4.2 + 1.2) * 0.18], [0, Math.sin(T * 4.2 + 2.1) * 0.18], [0, Math.sin(T * 4.2 + 3) * 0.22]],
      });
      if (point > 0.2) burst(T, tIm + 0.04, 1250, 560, { n: 8, names: ['sparkW', 'spark'], spd: 460, g: 0, life: 0.5, s: 0.4, even: true, seed: 41 });
      // "boss": starry eyes, crown gleam, coins and sparkles
      if (T > tBoss - 0.05) {
        const ga = T - tBoss;
        spr('sparkW', 1000, 372, { s: 1.1 * Ez.outBack(clamp(ga / 0.15), 3) * (1 - inv(0.6, 1.1, ga)), r: ga * 3, jit: 0 });
        glow(1000, 380, 110, PAL.butter, 0.5 * Math.exp(-ga * 3));
        burst(T, tBoss, 990, 420, { n: 18, names: ['s02_coin', 'star5', 'spark'], spd: 1000, g: 1100, life: 1.3, s: 0.5, spread: Math.PI * 1.3, ang0: -Math.PI / 2, seed: 3 });
      }
      spr('s02_plaque', 960, 962, { s: 0.74 * (1 + 0.14 * bossK + 0.03 * k) });
      if (bossK > 0.02) glow(960, 962, 160, PAL.butter, 0.45 * bossK);
      // Pip the butler: fans the boss, bows on "servant", tray held level
      const bow1 = sstep(tSv - 0.2, tSv + 0.05, T) * (1 - sstep(tAnd - 0.05, tAnd + 0.2, T));
      const bow = bow1 + 0.4 * sstep(tBoss - 0.05, tBoss + 0.12, T) * (1 - sstep(tBoss + 0.35, tBoss + 0.6, T));
      const fanning = sstep(tAnd, tAnd + 0.2, T);
      const fw = Math.sin(TAU * bt.ph) * (0.14 + 0.2 * fanning);
      const waist = -0.8 * bow;
      const yes = T > tIm && T < tIm + 0.35 ? Math.sin(Math.PI * inv(tIm, tIm + 0.35, T)) * 22 : 0;
      pipX(1535, 950 - (1 - bow) * hopB(T) * 6 - yes, 1.05, {
        seed: 9, bowtie: true, face: bow > 0.4 ? 'pf_happy' : T > tBoss ? 'pf_love' : 'pf_nervous', headR: -0.1, waist,
        armL: lerp(2.9 + fw * 0.7, 1.4, bow1) + 0.6 * (bow - bow1), armR: lerp(0.95, 0.7, bow),
        holdL: (hx, hy, a) => spr('s02_palm_fan', hx, hy, { r: a + Math.PI + fw * 0.6, s: 0.95 }),
        holdR: (hx, hy) => spr('s02_tray', hx + 10, hy + 6, { s: 0.6, r: -waist }),
      });
      // breeze from the fan toward the boss
      for (let i = 0; i < 4; i++) { const f = fract(T * 1.6 + i * 0.25); segLine(1330 - f * 220, 330 + i * 34 + Math.sin(f * 6 + i) * 10, 1330 - f * 220 - 60, 330 + i * 34 + Math.sin(f * 6 + i + 1) * 10, '#FFFFFF', 3, 0.5 * Math.sin(Math.PI * f) * (0.4 + fanning)); }
      pop();
      // the boss's speech bubble grows (the zoom into L4 is centred on it)
      if (bubbleOn > 0) {
        const bs = Ez.outBack(clamp(bubbleOn)) * (1 + 0.5 * sstep(15.95, 16.5, T));
        push(); translate(1180, 330); scale(bs); rotate(Math.sin(T * 5) * 0.03);
        spr('s02_bubble', 0, 0, { jit: 0.4 });
        for (let i = 0; i < 3; i++) { const b = Math.max(0, Math.sin(T * 10 - i * 0.9)); disc(-66 + i * 66, -6 - b * 16, 20, PAL.ink); disc(-66 + i * 66, -6 - b * 16, 15, [PAL.lilac, PAL.sky, PAL.pink][i]); }
        pop();
      }
    },
  });
  lyr(3, { y: 138, words: { 3: { fill: PAL.lilacLt, anim: 'drop', tilt: -0.06 }, 7: { anim: 'zoom', fill: PAL.gold, size: 100 } } });

  // ================= L4: ChatGPT, please don't eat me alive =================
  // An original chat-bubble monster chases Pip through a dark-mode chat world, then lunges until its mouth fills the frame.
  defSprite('s02_chat_night', 1000, 580, () => {
    flat([[-20, -20], [1020, -20], [1020, 600], [-20, 600]], '#1F2656');
    wash(-40, -40, 1080, 660, PAL.navy, 150, 0.08);
    blob(220, 140, 260, PAL.nightLt, 140, 0.4);
    blob(800, 420, 300, '#3A2F7A', 120, 0.4);
    blob(640, 110, 150, '#4B3F8F', 80, 0.4);
    wash(-40, 430, 1080, 240, PAL.night, 150, 0.2);
  });
  function bubSprite(name, c, tailRight, extra) {
    defSprite(name, 440, 170, () => {
      paint(tailRight ? [[340, 118], [414, 158], [384, 108]] : [[100, 118], [26, 158], [56, 108]], c, { baseC: lite(c, 0.2), lw: 1.6 });
      paint(rrPts(20, 16, 400, 116, 50, 5), c, { baseC: lite(c, 0.2), lw: 1.8 });
      extra();
    });
  }
  bubSprite('s02_bub_lilac', PAL.lilac, true, () => { pen('#FFFFFF', 5, 'marker'); brush.line(66, 56, 340, 56); brush.line(66, 92, 250, 92); brush.noStroke(); });
  bubSprite('s02_bub_sky', PAL.sky, false, () => { pen(PAL.navy, 5, 'marker'); brush.line(90, 56, 360, 56); brush.line(90, 92, 290, 92); brush.noStroke(); });
  bubSprite('s02_bub_dots', PAL.lilacLt, false, () => { for (let i = 0; i < 3; i++) flatInk(ellPts(160 + i * 60, 74, 17, 17, 16), PAL.gray, 1); });
  bubSprite('s02_bub_heart', PAL.pink, true, () => { paint(heartPts(150, 76, 34), PAL.red, { baseC: '#FF6A86', lw: 1.4 }); pen('#FFFFFF', 5, 'marker'); brush.line(210, 74, 350, 74); brush.noStroke(); });
  const BUBS = ['s02_bub_lilac', 's02_bub_sky', 's02_bub_dots', 's02_bub_heart'];
  defSprite('s02_inputbar', 1000, 80, () => {
    paint(rrPts(14, 10, 972, 58, 29, 6), PAL.nightLt, { baseC: '#3E3A78', lw: 1.8, lc: PAL.lilac });
    paint(ellPts(944, 39, 22, 22, 24), PAL.lilac, { baseC: PAL.lilacLt, lw: 1.4 });
    pen(PAL.navy, 3.4, 'marker'); brush.line(944, 50, 944, 28); brush.line(934, 38, 944, 28); brush.line(954, 38, 944, 28); brush.noStroke();
  });
  defSprite('s02_mon_body', 900, 780, () => {
    const body = rrPts(50, 60, 800, 640, 250, 10);
    paint([[250, 640], [118, 764], [396, 672]], '#EDE7FF', { baseC: '#FBF9FF', a: 130, lw: 3.2 });
    paint(body, '#EDE7FF', { baseC: '#FBF9FF', a: 130, lw: 3.4 });
    wc(PAL.lilacLt, 130, 0.08, 0.5, 0.5); brush.polygon(body.map(([x, y]) => [x, Math.max(y, 500)])); brush.noFill();
    wc(PAL.skyLt, 80, 0.2); brush.circle(260, 210, 110); brush.noFill();
    pen(PAL.ink, 3.6, '2B'); brush.polygon(body); brush.noStroke();
  }, { v: 2, ax: 0.5, ay: 380 / 780 });
  defSprite('s02_mon_eye', 240, 200, () => {
    const E = ellPts(120, 100, 92, 76, 40);
    flat(E, '#FFFFFF');
    wc(PAL.skyLt, 70, 0.04, 0.4, 0.4); brush.polygon(E.map(([x, y]) => [x, Math.max(y, 140)])); brush.noFill();
    pen(PAL.ink, 5, 'marker'); brush.polygon(E); brush.noStroke();
  }, { v: 2 });
  defSprite('s02_mon_brow', 270, 120, () => {
    paint([[14, 66], [120, 44], [236, 34], [256, 60], [238, 96], [120, 80], [14, 74]], PAL.ink, { baseC: '#3A2E5C', lw: 2 });
  }, { v: 2 });
  defSprite('s02_mon_arm', 230, 170, () => {
    for (let i = 0; i < 3; i++) flatInk([[168, 50 + i * 30], [214, 64 + i * 22], [168, 76 + i * 30]], '#FFFFFF', 2);
    paint(rrPts(26, 50, 160, 72, 34), '#EDE7FF', { baseC: '#FBF9FF', lw: 3 });
  }, { ax: 36 / 230, ay: 0.5 });
  defSprite('s02_tooth', 130, 180, () => {
    const t = [[12, 14], [118, 14], [106, 60], [72, 166], [58, 166], [24, 60]];
    paint(t, '#FFFFFF', { baseC: '#FFFFFF', lw: 2.6 });
    wc(PAL.lilacLt, 110, 0.04, 0.4, 0.5); brush.polygon([[70, 20], [114, 20], [102, 60], [70, 158]]); brush.noFill();
    pen(PAL.ink, 2.6, '2B'); brush.polygon(t); brush.noStroke();
  }, { v: 2, ax: 0.5, ay: 16 / 180 });
  defSprite('s02_tongue', 600, 320, () => {
    paint(ellPts(300, 168, 264, 124, 44), PAL.pink, { baseC: '#FF9FC2', lw: 2.6 });
    wc(PAL.coralDk, 60, 0.1); brush.circle(300, 250, 150); brush.noFill();
    strokePath([[300, 80], [296, 170], [300, 236]], PAL.coralDk, 3, 'pen', 0.4);
  });
  // cartoon anger vein: four thick arcs bowing toward the centre (filled shapes; marker splines render empty)
  defSprite('s02_anger', 140, 140, () => {
    for (let q = 0; q < 4; q++) {
      const a = q * (Math.PI / 2) + Math.PI / 4, cx = 70 + Math.cos(a) * 44, cy = 70 + Math.sin(a) * 44, pts = [];
      for (let i = 0; i <= 10; i++) { const b = a + Math.PI - 0.85 + (i / 10) * 1.7; pts.push([cx + Math.cos(b) * 30, cy + Math.sin(b) * 30]); }
      for (let i = 10; i >= 0; i--) { const b = a + Math.PI - 0.85 + (i / 10) * 1.7; pts.push([cx + Math.cos(b) * 19, cy + Math.sin(b) * 19]); }
      flatInk(pts, '#FF4A60', 1.2);
    }
  });
  const EYE_X = 185, EYE_Y = -130, ERX = 92, ERY = 76, BROW_X = 198, BROW_Y = -242;
  function lipY(M, u) { return M.lip + M.grin * (1 - u * u); }
  function lowY(M, u) { return lipY(M, u) + M.oh * Math.pow(Math.sqrt(Math.max(0, 1 - u * u)), 0.7) + 2; }
  function mouthPoly(M, grow = 0) {
    const n = 26, pts = [];
    for (let i = 0; i <= n; i++) { const u = -1 + (2 * i) / n; pts.push([u * (M.hw + grow), lipY(M, u) - grow]); }
    for (let i = n; i >= 0; i--) { const u = -1 + (2 * i) / n; pts.push([u * (M.hw + grow), lowY(M, u) + grow]); }
    return pts;
  }
  function shapeOnly(pts) { beginShape(); for (const [x, y] of pts) vertex(x, y); endShape(CLOSE); }
  function poly(pts, c, k = 1, ox = 0, oy = 0) { noStroke(); fill(c); beginShape(); for (const [x, y] of pts) vertex(ox + (x - ox) * k, oy + (y - oy) * k); endShape(CLOSE); }
  function monXform(M) { translate(M.x, M.y); rotate(M.r); scale(M.s * M.sq, M.s / M.sq); }
  function throatOf(M) { return [0, lipY(M, 0) + M.oh / 2]; }
  // body, face and mouth interior (behind anything that ends up inside the mouth)
  function monBack(M, T) {
    push();
    monXform(M);
    spr('s02_mon_arm', -385, 95, { r: -M.armL, flip: true, seed: 1 });
    spr('s02_mon_arm', 385, 95, { r: M.armR, seed: 2 });
    spr('s02_mon_body', 0, 0, { seed: 3 });
    // typing dots on the forehead: its chat-bubble tell
    for (let i = 0; i < 3; i++) { const b = Math.max(0, Math.sin(T * 10 - i * 0.9)); const dx = (i - 1) * 46, dy = -276 - b * 12; disc(dx, dy, 17, PAL.ink); disc(dx, dy, 12.5, [PAL.lilac, PAL.sky, PAL.pink][i]); }
    for (const sd of [-1, 1]) {
      const ex = sd * EYE_X, ey = EYE_Y;
      spr('s02_mon_eye', ex, ey, { flip: sd > 0, seed: 4 + sd });
      const px = ex + M.look[0] * 30, py = ey + 10 + M.look[1] * 18;
      disc(px, py, 30 * M.pup, PAL.red); disc(px, py, 17 * M.pup, PAL.black); disc(px - 9, py - 10, 7, '#FFFFFF');
      // angry lid (clipped to the eye)
      push();
      clip(() => { ellipse(ex, ey, ERX * 2 - 6, ERY * 2 - 6); });
      const m = -sd * 0.42, c = ey - ERY + M.lid * ERY * 2;
      poly([[ex - 120, ey - 120], [ex + 120, ey - 120], [ex + 120, c + m * 120], [ex - 120, c - m * 120]], '#B9A8EC');
      segLine(ex - 120, c - m * 120, ex + 120, c + m * 120, PAL.ink, 9);
      pop();
      spr('s02_mon_brow', sd * BROW_X, BROW_Y + M.browY, { flip: sd > 0, r: -sd * (0.36 + M.browR), seed: 6 + sd });
    }
    if (M.anger > 0.01) spr('s02_anger', 345, -335, { s: 1.25 * M.anger, r: 0.2 });
    // mouth: ink lip band, plum interior shading to a near-black throat, tongue
    const mp = mouthPoly(M);
    const [tx, ty] = throatOf(M);
    poly(mouthPoly(M, 9), PAL.ink);
    for (let i = 0; i < 9; i++) poly(mp, mixc('#40204F', '#161228', i / 8), 1 - i * 0.085, tx, ty);
    if (M.open > 0.15) {
      const ts = Math.min((M.hw * 0.5) / 264, (M.oh * 0.34) / 124, 0.42);
      spr('s02_tongue', 0, lowY(M, 0) - M.oh * 0.16, { s: ts, a: clamp((M.open - 0.15) * 4), seed: 5 });
    }
    pop();
  }
  function monTeeth(M) {
    push();
    monXform(M);
    for (let i = 0; i < 9; i++) {
      const u = -0.84 + i * 0.21, e = Math.sqrt(1 - u * u);
      const sl = (-2 * M.grin * u) / M.hw;
      spr('s02_tooth', u * M.hw, lipY(M, u) - 4, { r: Math.atan(sl), s: 0.46 * (0.65 + 0.35 * e), seed: i });
    }
    for (let i = 0; i < 8; i++) {
      const u = -0.735 + i * 0.21, e = Math.sqrt(1 - u * u);
      const sl = (lowY(M, u + 0.01) - lowY(M, u - 0.01)) / (0.02 * M.hw);
      spr('s02_tooth', u * M.hw, lowY(M, u) + 4, { r: Math.PI + Math.atan(sl), s: 0.4 * (0.65 + 0.35 * e), seed: 20 + i });
    }
    pop();
  }
  function monState(T) {
    const tP = wordT(4, 1), tD = wordT(4, 2), tE = wordT(4, 3), tM = wordT(4, 4), tA = wordT(4, 5);
    const b = beatAt(T);
    const chomp = sstep(0, 0.3, b.ph) * (1 - sstep(0.74, 1.0, b.ph)); // jaws snap shut on every beat
    const M = { lip: 10, grin: 30, hw: 300, look: [-0.7, 0.35], pup: 1, lid: 0.3, browY: 0, browR: 0, anger: 0, r: 0, sq: 1 };
    const chase = T > 16.62 && T < tP - 0.1;
    // mouth opening over time
    let open;
    if (T < 16.14) open = 0.02;
    else if (T < 16.62) open = 1.05 * Ez.outBack(inv(16.14, 16.3, T)) * (1 - sstep(16.45, 16.64, T)) + 0.02;
    else if (T < tP - 0.1) open = 0.12 + 0.8 * chomp;
    else if (T < 19.85) open = 0.03;
    else if (T < 20.12) open = Ez.out(inv(19.85, 20.1, T));
    else if (T < 20.3) open = 1 - sstep(20.12, tE + 0.03, T);
    else if (T < 20.66) open = Ez.out(inv(20.3, 20.62, T));
    else if (T < 20.84) open = 1 - sstep(20.66, tM + 0.02, T);
    else open = 1.15 * Ez.out(inv(20.84, tA - 0.04, T));
    M.open = open;
    M.oh = 24 + 300 * open;
    M.hw = 300 + 34 * clamp(open) + (T > tP && T < 19.9 ? 30 * sstep(tD - 0.1, tD + 0.15, T) : 0);
    M.grin = 30 + (T > tP && T < 19.9 ? 26 * sstep(tD - 0.1, tD + 0.15, T) : 0);
    // body placement
    const x = kf(T, [[16.14, 1180], [16.75, 1340], [18.8, 1300], [19.15, 1250], [19.85, 1190], [20.1, 1250], [tE + 0.04, 1100], [20.62, 1140], [tM + 0.03, 1110], [tA - 0.04, 1100], [21.72, 1000]]);
    const sc = kf(T, [[16.14, 0.92], [16.75, 0.95], [18.8, 0.98], [19.85, 1.12], [20.1, 1.06], [tE + 0.04, 1.42], [20.62, 1.36], [tM + 0.03, 1.62], [tA - 0.04, 1.55], [21.72, 3.8], [22.4, 4.3]]);
    let y = kf(T, [[16.14, 600], [16.75, 625], [18.8, 625], [19.85, 600], [20.1, 570], [tE + 0.04, 610], [tM + 0.03, 625], [tA - 0.04, 560]]);
    if (chase) y -= hopB(T) * 30;
    const fin = sstep(tA - 0.04, 21.72, T);
    M.s = sc; M.x = x;
    M.y = lerp(y, 700 - throatOf(M)[1] * sc, fin);
    M.r = chase ? -0.06 + Math.sin(T * 4.6) * 0.03 : lerp(T > 19.85 && T < 20.1 ? 0.08 : -0.03, 0, fin);
    M.sq = 1 + (chase ? 0.06 * kick(T, 10) : 0) + (T > tE && T < tE + 0.3 ? 0.08 * Math.exp(-(T - tE) * 10) : 0) + (T > tM && T < tM + 0.3 ? 0.08 * Math.exp(-(T - tM) * 10) : 0);
    // face
    const awake = sstep(16.12, 16.2, T);
    M.lid = lerp(1.0, 0.28, awake);
    if (T > tP - 0.05 && T < 19.85) M.lid = lerp(0.28, 0.55, sstep(tD - 0.1, tD + 0.2, T)) - 0.18 * Math.exp(-Math.max(0, T - tP) * 5);
    if (T > 19.85) M.lid = 0.18;
    M.pup = T > 19.85 ? 1.15 : 1;
    M.browY = lerp(-26, 0, awake) + (T > tP && T < tD ? -18 * Math.exp(-(T - tP) * 4) : 0) + (T > tD && T < 19.85 ? 10 : 0);
    M.browR = (T > tD && T < 19.85 ? 0.1 : 0) + 0.08 * kick(T, 8) * (chase ? 1 : 0);
    M.look = T < tP ? [-0.75, 0.3 + Math.sin(T * 3) * 0.1] : [-0.6, 0.7];
    M.anger = chase ? 0.7 + 0.5 * kick(T, 7) : T > tD && T < 19.85 ? 0.8 : 0;
    M.armL = chase ? -0.35 + Math.sin(T * 9) * 0.45 : T < 16.14 ? 0.5 : T > tP && T < 19.85 ? 0.1 + Math.sin(T * 16) * 0.1 : -0.5;
    M.armR = chase ? 0.2 + Math.sin(T * 9 + 1.5) * 0.4 : T < 16.14 ? 0.5 : T > tP && T < 19.85 ? 0.1 - Math.sin(T * 16) * 0.1 : -0.5;
    return M;
  }
  // Pip: startled, runs, skids, kneels and pleads, flinches, gets gulped
  function pipState(T) {
    const tP = wordT(4, 1), tD = wordT(4, 2), tE = wordT(4, 3), tM = wordT(4, 4), tA = wordT(4, 5);
    const o = { seed: 11 };
    let x = 730, y = 925;
    if (T < 16.5) {
      const j = inv(16.16, 16.5, T);
      Object.assign(o, { hop: Math.sin(Math.PI * j) * 90, face: T < 16.16 ? 'pf_nervous' : 'pf_shock', armL: 0.3 + 2.1 * Math.sin(Math.PI * j), armR: 0.3 + 2.1 * Math.sin(Math.PI * j), sq: 1 - 0.1 * Math.sin(Math.PI * j) });
    } else if (T < 18.72) {
      const rt = T - 16.5, w = rt * 3.4;
      x = lerp(730, 560, Ez.out(clamp(rt / 2.2)));
      Object.assign(o, { walk: w, hop: Math.abs(Math.sin(w * Math.PI)) * 22, r: -0.14, headR: 0.32, face: 'pf_scared', armL: 1.3 + Math.sin(w * TAU) * 0.4, armR: 1.3 - Math.sin(w * TAU) * 0.4 });
    } else if (T < tP) {
      x = 560 - 30 * Ez.out(inv(18.72, tP, T));
      Object.assign(o, { r: 0.2, face: 'pf_shock', armL: 1.7, armR: 1.4, legs: [0.5, -0.1] });
    } else if (T < tE) {
      x = 530;
      const kn = Ez.outBack(inv(tP, tP + 0.2, T));
      const shakeNo = T > tD ? Math.sin((T - tD) * 22) * 0.17 * (1 - inv(tD + 0.45, 19.95, T)) : 0;
      Object.assign(o, { kneel: clamp(kn, 0, 1.1), r: 0.06 + hopB(T) * 0.03, face: 'pf_cry', frontL: true, frontR: true, armL: -2.2 + Math.sin(T * 28) * 0.07, armR: -2.2 - Math.sin(T * 28) * 0.07, headR: shakeNo });
    } else if (T < tA) {
      x = lerp(530, 400, Ez.out(inv(tE, tM + 0.2, T)));
      const fl = Math.max(T > tE ? Math.exp(-(T - tE) * 5) : 0, T > tM ? Math.exp(-(T - tM) * 5) : 0);
      Object.assign(o, { kneel: 1 - fl * 0.6, r: -0.1 - fl * 0.12, hop: fl * 30, face: T > tM ? 'pf_shock' : 'pf_scared', armL: 2.3, armR: 2.3 + fl * 0.3 });
    } else {
      x = 400;
      const lift = inv(tA, tA + 0.13, T);
      Object.assign(o, { kneel: 1 - lift, hop: Math.sin(Math.PI / 2 * lift) * 40, face: 'pf_scared', armL: 2.5 + Math.sin(T * 30) * 0.2, armR: 2.5 + Math.cos(T * 30) * 0.2 });
    }
    return { x, y, o };
  }
  // integrated chase scroll so the parallax speeds up and slows down without jumps
  function scrollD(T) {
    const v = (t) => kf(t, [[16.1, 0.25], [16.55, 1], [18.7, 1], [19.0, 0.12], [20.1, 0.12], [20.3, 0.4]]);
    let d = 0;
    for (let t = 15.8; t < T; t += 1 / 60) d += v(t) / 60;
    return d;
  }
  function chatLayer(T, D, n, seed, sc, a, spd, y0, y1) {
    const span = W + 800;
    for (let i = 0; i < n; i++) {
      const x = ((R(i, seed) * span + D * spd) % span + span) % span - 400;
      const y = y0 + R(i, seed + 1) * (y1 - y0) + Math.sin(T * 1.4 + i * 1.7) * 8 - kick(T + R(i, seed + 4) * 0.1) * 4;
      spr(BUBS[Math.floor(R(i, seed + 2) * 4)], x, y, { s: sc * (0.85 + 0.3 * R(i, seed + 3)), a, seed: i });
    }
  }
  shot({
    id: 'L4-chat', t0: 16.18, tin: { type: 'zoom', d: 0.6, at: 0.5, c: [1180, 330] },
    draw(s) {
      const T = s.T;
      const tP = wordT(4, 1), tE = wordT(4, 3), tM = wordT(4, 4);
      const M = monState(T);
      const P = pipState(T);
      const D = scrollD(T);
      const roar = T > 16.16 && T < 16.9 ? Math.exp(-(T - 16.2) * 3) : 0;
      const hit = Math.max(T > tE ? Math.exp(-(T - tE) * 7) : 0, T > tM ? Math.exp(-(T - tM) * 7) : 0);
      const fin = sstep(wordT(4, 5) - 0.04, 21.72, T);
      push();
      shake(roar * 16 + hit * 14 + fin * 8 + (T > 16.6 && T < tP ? kick(T, 9) * 3 : 0), 2);
      washBG('s02_chat_night');
      twinkles(T, 18, 7, [0, 60, W, 820], ['sparkW'], 0.07, 0.18, 3);
      chatLayer(T, D, 9, 31, 0.42, 0.35, 90, 90, 820);
      chatLayer(T, D, 7, 57, 0.68, 0.7, 240, 150, 800);
      glow(M.x, M.y, 480 * M.s, PAL.lilac, 0.28 + 0.15 * kick(T));
      chatLayer(T, D, 3, 83, 1.0, 0.92, 520, 180, 700);
      // floor: the chat input bar with a blinking cursor
      spr('s02_inputbar', 960, 1012, { s: 2, jit: 0.3 });
      if (fract(T * 2.2) < 0.55) segLine(430, 986, 430, 1038, PAL.lilacLt, 5);
      // monster shadow
      noStroke(); fill(withAlphaCol(PAL.black, 0.3 * (1 - fin))); ellipse(M.x - 20, 956, 560 * M.s, 50 * M.s);
      if (T > 16.6 && T < 18.8) speedLines(T, 12, 4, PAL.lilac, 0.35, 220, 4, 1400, 1, [0, 520, W, 420]);
      monBack(M, T);
      const [tx, ty] = throatOf(M);
      const thX = M.x + tx * M.s, thY = M.y + ty * M.s;
      // inside the mouth during the gulp: a spiral of sparkles and Pip, clipped to the jaws
      if (T > 21.2) {
        push();
        monXform(M);
        clip(() => shapeOnly(mouthPoly(M)));
        scale(1 / (M.s * M.sq), M.sq / M.s); rotate(-M.r); translate(-M.x, -M.y);
        for (let i = 0; i < 26; i++) {
          const f = fract(R(i, 71) + T * 0.8), a = i * 2.4 + T * 3.2 + f * 3;
          const rr = (1 - f) * 900 * (M.s / 3.8);
          spr(i % 3 ? 'sparkW' : 'star5', thX + Math.cos(a) * rr * 1.5, thY + Math.sin(a) * rr, { s: 0.35 * (1 - f) + 0.08, r: a, a: sstep(0, 0.2, f) * fin, seed: i });
        }
        if (T > 21.46) {
          const g = Ez.inOut(inv(21.44, 21.95, T)), sa = g * 2.6;
          const dx = (P.x - thX) * (1 - g), dy = (P.y - 60 - thY) * (1 - g);
          pipX(thX + dx * Math.cos(sa) - dy * Math.sin(sa), thY + 40 * (1 - g) + dx * Math.sin(sa) + dy * Math.cos(sa), lerp(0.9, 0.1, g), { seed: 11, r: (T - 21.46) * 9, face: 'pf_dizzy', armL: 2.6, armR: 2.6 });
        }
        pop();
      }
      if (T <= 21.46) pipX(P.x, P.y, 0.9, P.o);
      monTeeth(M);
      // roar on "ChatGPT"
      if (roar > 0.02) for (let i = 0; i < 14; i++) { const a = -Math.PI + (i / 13) * Math.PI * 1.2 - 0.1, r0 = 380 + fract(T * 3 + R(i, 3)) * 260; segLine(thX + Math.cos(a) * r0, thY + Math.sin(a) * r0 * 0.7, thX + Math.cos(a) * (r0 + 120), thY + Math.sin(a) * (r0 + 120) * 0.7, '#FFFFFF', 7, roar); }
      // chomp clacks on the beats during the chase and on "eat" / "me"
      if (T > 16.6 && T < tP) { const bt = beatAt(T); if (bt.ph < 0.35) burst(T, bt.t, M.x - M.hw * M.s * 0.7, M.y + 40 * M.s, { n: 5, names: ['sparkW'], spd: 420, g: 0, life: 0.35, s: 0.28, spread: Math.PI, ang0: -Math.PI, seed: bt.i }); }
      burst(T, tE, M.x - 200 * M.s, M.y + 60 * M.s, { n: 10, names: ['sparkW', 'blob_white'], spd: 800, g: 300, life: 0.6, s: 0.4, seed: 60 });
      burst(T, tM, M.x - 200 * M.s, M.y + 60 * M.s, { n: 10, names: ['sparkW', 'blob_lilac'], spd: 900, g: 300, life: 0.6, s: 0.45, seed: 70 });
      // Pip's sweat, dust and tears
      if (T > 16.5 && T < 18.72) { for (let i = 0; i < 6; i++) { const f = fract(T * 2.4 + i / 6); spr('puff', P.x + 60 + f * 260, 950 - f * 40, { s: 0.22 + f * 0.3, a: 0.7 * (1 - f), seed: i }); } }
      for (let b = 0; b < 5; b++) burst(T, 16.65 + b * 0.46, P.x, P.y - 330, { n: 2, names: ['drop'], spd: 420, g: 1300, life: 0.6, s: 0.4, spread: 1.4, ang0: -Math.PI / 2 + 0.6, seed: b * 3 });
      if (T > tP && T < tE) for (let b = 0; b < 3; b++) { burst(T, tP + 0.1 + b * 0.35, P.x - 34, P.y - 250, { n: 2, names: ['drop'], spd: 300, g: 1200, life: 0.55, s: 0.35, spread: 0.8, ang0: -Math.PI * 0.8, seed: 90 + b }); burst(T, tP + 0.1 + b * 0.35, P.x + 34, P.y - 250, { n: 2, names: ['drop'], spd: 300, g: 1200, life: 0.55, s: 0.35, spread: 0.8, ang0: -Math.PI * 0.2, seed: 95 + b }); }
      // drool while it gloats
      if (T > tP && T < 19.9) { const d = fract((T - tP) * 0.9); spr('drop', M.x - M.hw * M.s * 0.55, M.y + (M.lip + 30) * M.s + d * 90, { s: 0.35, sy: 0.8 + d * 0.8, a: 1 - sstep(0.8, 1, d) }); }
      pop();
    },
  });
  lyr(4, { y: 138, maxW: 900, words: { 0: { fill: PAL.mint, size: 92, anim: 'shake', jitter: 3 }, 1: { fill: PAL.pinkLt, anim: 'rise' }, 3: { fill: PAL.red, anim: 'shake', jitter: 6 }, 4: { anim: 'shake', jitter: 4 }, 5: { fill: PAL.red, anim: 'zoom', grow: 0.25 } } });
})();

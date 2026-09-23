// s11.js - S11 "Nowhere to go, lit fuse, orthogonality blues" (100.34-108.18). Everything here is private to this IIFE.
// L30: Pip stranded on a tiny island in a rolling sea of paperclips; every signpost says DOOM (card flip in).
// L31: a wobbly watercolor iris closes on Pip; in the dark a match flares on "lit" and the fuse catches on "fuse".
// L32: a spotlight snaps on in an all-blue club; Clawd blows one long sax note on a stage floor painted with the
//      goals/smarts axes; Pip weeps in the audience; the fuse spark crawls along the bottom edge and exits right.
(() => {
  const WT = (i) => SONG.lines[i].w.map((w) => w[1]);
  const W30 = WT(30), W31 = WT(31), W32 = WT(32);
  const TA = W30[0], TB = W31[0], TC = W32[0], TEND = 108.18;
  const FUSE_T0 = W31[6]; // "fuse." - the fuse catches

  // ================= small helpers =================
  // piecewise keys [[t, v, ease?], ...]; smoothstep between keys unless an ease is given on the target key
  function keys(K, T) {
    if (T <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) {
      if (T < K[i][0]) {
        const [t0, v0] = K[i - 1], [t1, v1, e] = K[i];
        const u = (T - t0) / (t1 - t0);
        return lerp(v0, v1, e ? e(u) : u * u * (3 - 2 * u));
      }
    }
    return K[K.length - 1][1];
  }
  function linKeys(K, T) {
    if (T <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (T < K[i][0]) return lerp(K[i - 1][1], K[i][1], (T - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
    return K[K.length - 1][1];
  }
  const ell = (x, y, rx, ry, c, a = 1) => { noStroke(); fill(withAlphaCol(c, a)); ellipse(x, y, rx * 2, ry * 2); };
  function pline(pts, c, w, a = 1) { noFill(); stroke(withAlphaCol(c, a)); strokeWeight(w); beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(); noStroke(); }
  function catmull(pts, n = 5) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }
  function cumLen(P) { const d = [0]; for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return d; }
  function along(P, D, s) {
    if (s <= 0) return P[0];
    for (let i = 1; i < P.length; i++) if (s <= D[i]) { const k = (s - D[i - 1]) / (D[i] - D[i - 1] || 1); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; }
    return P[P.length - 1];
  }
  const mixRGB = (a, b, t) => a.map((v, i) => clamp(lerp(v, b[i], t), 0, 255));
  const setTint = (c) => tint(c[0], c[1], c[2]);
  const clearTint = () => tint(255); // p5 2.2.3 WEBGL: image() after noTint() throws, so reset to white instead
  // world position of a local point on the Clawd rig (same transform order as clawd())
  function clawdPt(c, lx, ly) {
    const sq = c.sq ?? 1, fl = c.flip ? -1 : 1;
    const x = lx * c.s * sq * fl, y = (ly * c.s) / sq;
    const r = c.r || 0, cs = Math.cos(r), sn = Math.sin(r);
    return [c.x + x * cs - y * sn, c.y - (c.hop || 0) + x * sn + y * cs];
  }
  // world position of a local point on the Pip rig (head = true for head-space points)
  function pipPt(p, lx, ly, head = false) {
    if (head) { const hr = (p.headR || 0) + (p.lean || 0), c = Math.cos(hr), s = Math.sin(hr); [lx, ly] = [lx * c - ly * s, lx * s + ly * c - 170]; }
    const sq = p.sq ?? 1, fl = p.flip ? -1 : 1;
    const x = lx * p.s * fl * sq, y = (ly * p.s) / sq;
    const r = p.r || 0, cs = Math.cos(r), sn = Math.sin(r);
    return [p.x + x * cs - y * sn, p.y - (p.hop || 0) + x * sn + y * cs];
  }
  const pipEyes = (p) => [pipPt(p, -35, -59, true), pipPt(p, 35, -59, true)];
  const pipHandR = (p) => pipPt(p, 56 + 82 * Math.sin(p.armR ?? 0.15), -138 + 82 * Math.cos(p.armR ?? 0.15));
  const pipHandL = (p) => pipPt(p, -56 - 82 * Math.sin(p.armL ?? 0.15), -138 + 82 * Math.cos(p.armL ?? 0.15));
  const clawdEyes = (c) => { const lk = c.look || [0, 0]; return [clawdPt(c, (-2.5 + lk[0]) * CU, (-6.5 + lk[1]) * CU), clawdPt(c, (2.5 + lk[0]) * CU, (-6.5 + lk[1]) * CU)]; };
  function drawPip(p) { pip(p.x, p.y, p.s, p); }
  function drawClawd(c) { clawd(c.x, c.y, c.s, c); }
  function shadow(x, y, rx, a = 0.25, c = PAL.ink) { ell(x, y, rx, rx * 0.22, c, a); }
  // For set pieces that must melt into the ground (sea, island, stage, backdrop, silhouettes): the house recipe with the
  // wash kept inside the opaque base, so they skip the torn-paper sticker rim that props and characters keep.
  // o.inner overrides the wash shape; big shapes get small interior washes; tiny shapes get flat colour + outline.
  function paintIn(pts, c, o = {}) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = (x1 - x0) / 2, hh = (y1 - y0) / 2, m = o.m ?? 16;
    flat(pts, o.baseC || lite(c, o.baseLite ?? 0.18));
    if (!o.inner && Math.max(hw, hh) > 130) {
      // big shapes: the spill grows with the wash size, so mottle with small washes well inside instead
      const r = Math.min(34, 0.28 * Math.min(hw, hh));
      for (let i = 0; i < (o.blobs ?? 9); i++) {
        const v = pts[Math.floor(random(pts.length))], t = random(0.05, 0.42);
        wc(c, (o.a ?? 170) * 0.55, 0.02, 0.5, 0.5); brush.circle(lerp(cx, v[0], t), lerp(cy, v[1], t), r * random(0.7, 1)); brush.noFill();
      }
    } else {
      const inner = o.inner || (hw > m + 6 && hh > m + 6 ? pts.map(([x, y]) => [cx + (x - cx) * (1 - m / hw), cy + (y - cy) * (1 - m / hh)]) : null);
      if (inner) { wc(c, o.a ?? 170, o.bleed ?? 0.015, o.tex ?? 0.55, o.border ?? 0.55); brush.polygon(inner); brush.noFill(); }
    }
    if (o.line !== false) { pen(o.lc || PAL.ink, o.lw ?? 2, o.lt || '2B'); brush.polygon(pts); }
    brush.noStroke(); brush.noFill();
  }

  // ================= paperclips =================
  const CLIP = catmull([[60, 150], [60, 40], [45, 22], [28, 40], [28, 170], [45, 186], [70, 168], [70, 30], [52, 10], [26, 10], [14, 30], [14, 150]], 2).map(([x, y]) => [(x - 42) / 176, (y - 98) / 176]);
  function clipPts(cx, cy, h, rot, squash = 1) {
    const c = Math.cos(rot), s = Math.sin(rot);
    return CLIP.map(([x, y]) => { x *= h * squash; y *= h; return [cx + x * c - y * s, cy + x * s + y * c]; });
  }
  defSprite('s11_clip', 110, 210, (v) => {
    const pts = clipPts(55, 105, 180, 0, 1);
    pline(pts, PAL.ink, 13); pline(pts, '#A9AFC8', 8); pline(pts.map(([x, y]) => [x - 1.5, y - 1.5]), v ? '#FFE6F0' : '#FFFFFF', 2.2, 0.85);
  }, { v: 2 });
  // rolling "theatre wave" bands of paperclips; the crest shape is shared by the painter and the live code
  const BANDS = {
    far: { name: 's11_band_far', w: 1100, h: 110, base: 24, a1: 8, n1: 13, p1: 0.3, a2: 2, n2: 29, p2: 1.1, n: 150, cs: [7, 12], hi: '#FFE6F0', lo: '#9C90C4', body: '#C9B7DD', ink: '#7A6EA6', lw: 0.9 },
    mid: { name: 's11_band_mid', w: 1100, h: 170, base: 36, a1: 15, n1: 8, p1: 1.2, a2: 4, n2: 17, p2: 0.4, n: 170, cs: [11, 19], hi: '#FBE0EC', lo: '#6F68A6', body: '#A99CCD', ink: '#4E4680', lw: 1.1 },
    near: { name: 's11_band_near', w: 1100, h: 240, base: 48, a1: 26, n1: 5, p1: 0.7, a2: 6, n2: 11, p2: 2.0, n: 150, cs: [19, 31], hi: '#F8E4F0', lo: '#5A5496', body: '#8C86BE', ink: PAL.ink, lw: 1.4 },
  };
  const crestY = (B, x) => B.base - B.a1 * Math.pow(1 - Math.abs(Math.sin((Math.PI * B.n1 * x) / B.w + B.p1)), 1.7) - B.a2 * Math.sin((TAU * B.n2 * x) / B.w + B.p2);
  for (const B of Object.values(BANDS)) {
    defSprite(B.name, B.w, B.h, () => {
      const { w, h } = B;
      const top = []; for (let x = -24; x <= w + 24; x += 6) top.push([x, crestY(B, x)]);
      flat([...top, [w + 24, h + 24], [-24, h + 24]], B.body);
      gradRect(-10, B.base, w + 20, h - B.base + 10, withAlphaCol(B.hi, 0), withAlphaCol(B.lo, 0.6));
      for (let i = 0; i < 7; i++) blob(80 + i * 160 + random(-40, 40), B.base + 46 + random(h - B.base - 46), 26 + random(20), i % 2 ? B.lo : B.hi, 70, 0.2);
      const list = [];
      for (let i = 0; i < B.n; i++) list.push([random(-20, w + 20), Math.pow(random(), 0.8), random(TAU), random(0.45, 1), random(0.8, 1.2), random(-0.15, 0.15)]);
      list.sort((a, b) => a[1] - b[1]);
      for (const [x, d, rot, sq, sc, cj] of list) {
        const y0 = crestY(B, x) + 3;
        const y = y0 + d * (h - y0 + 8);
        const hh = lerp(B.cs[0], B.cs[1], d) * sc;
        const pts = clipPts(x, y, hh, rot, sq);
        pline(pts, B.ink, hh * 0.13 + B.lw, 0.9);
        pline(pts, mixc(B.hi, mixc(B.lo, '#FFFFFF', 0.25), clamp(d * 1.1 + cj)), hh * 0.07 + 0.5);
      }
      pline(top.map(([x, y]) => [x, y + 4]), B.hi, 3, 0.8);
      pline(top, B.ink, 2.2, 0.9);
    });
  }
  // a band is drawn at 2x: yTop = world y of the sprite top, off = horizontal scroll
  function drawBand(B, yTop, off, o = {}) { spr(B.name, 960 + off, yTop + B.h, { s: 2, jit: 0, ...o }); }
  const bandCrest = (B, yTop, off, x) => yTop + 2 * crestY(B, (x - (960 + off)) / 2 + B.w / 2);

  // ================= L30 sprites =================
  defSprite('s11_dusk', 1000, 580, () => {
    gradRect(-10, -10, 1020, 130, '#3A3576', '#6A58AE');
    gradRect(-10, 119, 1020, 100, '#6A58AE', '#D88DB9');
    gradRect(-10, 218, 1020, 80, '#D88DB9', '#FFB888');
    gradRect(-10, 297, 1020, 293, '#FFB888', '#FFD6A6');
    wash(-40, -40, 1080, 190, '#4B3F8F', 100, 0.2);
    blob(170, 80, 200, '#5B4AA0', 80, 0.4);
    blob(820, 130, 170, PAL.lilac, 70, 0.4);
    blob(735, 290, 190, PAL.butterLt, 110, 0.35);
    blob(290, 250, 170, PAL.pink, 70, 0.35);
    for (const [x, y, rx, ry, c] of [[210, 152, 170, 9, PAL.pinkLt], [700, 112, 200, 8, PAL.lilacLt], [640, 214, 150, 7, '#FFC9A8'], [180, 226, 130, 6, '#FFC9A8'], [880, 180, 90, 6, PAL.pinkLt]]) {
      wc(c, 150, 0.1, 0.5, 0.5); brush.polygon(ellPts(x, y, rx, ry, 28, 0.25)); brush.noFill();
    }
  });
  defSprite('s11_sun', 300, 300, () => {
    for (let i = 0; i < 6; i++) flat(ellPts(150, 150, 140 - i * 8, 140 - i * 8, 48), PAL.butterLt, 0.07);
    paintIn(ellPts(150, 150, 90, 90, 48), PAL.orange, { baseC: '#FFC56E', a: 110, line: false });
    blob(128, 126, 30, '#FFF1C4', 150, 0.2);
    pen('#E0784A', 1.3, '2B'); brush.circle(150, 150, 90); brush.noStroke();
  });
  defSprite('s11_dcloud', 560, 150, () => {
    for (const [x, y, r] of [[140, 90, 48], [220, 70, 62], [310, 82, 54], [390, 96, 38], [90, 102, 30], [460, 104, 26]]) { wc('#FFD0E2', 170, 0.1, 0.45, 0.5); brush.circle(x, y, r); }
    flat(rrPts(80, 90, 400, 30, 14), '#FFD7E6', 0.85);
    wc('#B9A0E0', 110, 0.08, 0.4, 0.4); brush.rect(90, 104, 380, 18); brush.noFill();
  }, { v: 2 });
  // island top-surface profile (sprite local), anchor at the peak (350, 74)
  const islandLocalY = (lx) => { const t = clamp((lx - 50) / 600); return 74 + Math.pow(Math.abs(t - 0.5) * 2, 1.8) * 130 + Math.sin(t * 17) * 3; };
  defSprite('s11_island', 700, 300, () => {
    const pts = []; for (let i = 0; i <= 40; i++) { const lx = 50 + (i / 40) * 600; pts.push([lx, islandLocalY(lx)]); }
    pts.push([650, 292], [50, 292]);
    paintIn(pts, PAL.peach, { baseC: '#FFE3C8', a: 150, lw: 2.2, inner: pts.map(([x, y]) => [clamp(x, 72, 628), y + 22]) });
    wc('#C27FA8', 70, 0.04, 0.5, 0.5); brush.polygon([[390, 176], [600, 222], [610, 276], [340, 276]]); brush.noFill();
    blob(250, 150, 36, PAL.butterLt, 110, 0.2);
    for (const [x, y] of [[150, 176], [455, 118], [560, 182]]) for (let k = -2; k <= 2; k++) { const q = [[x + k * 7, y + 2], [x + k * 9 + random(-4, 4), y - 20 - random(12)]]; pline(q, PAL.grassDk, 4.5); pline(q, PAL.grass, 2); }
    for (let i = 0; i < 5; i++) paintIn(ellPts(130 + random(440), 160 + random(70), 9 + random(7), 6 + random(4), 14), PAL.grayLt, { baseC: '#EEEAF4', lw: 1.2 });
    const c1 = clipPts(215, 200, 34, 1.2, 0.7); pline(c1, PAL.ink, 4); pline(c1, '#B9BED0', 2.2);
  }, { ay: 74 / 300 });
  defSprite('s11_post', 80, 480, () => {
    paint(rrPts(27, 16, 26, 456, 8), PAL.brown, { baseC: PAL.brownLt, lw: 1.8 });
    pen(dark(PAL.brown, 0.25), 1.1, 'pen'); brush.line(36, 40, 38, 440); brush.line(45, 80, 46, 300); brush.noStroke();
    paint(ellPts(40, 18, 16, 7, 16), PAL.brownLt, { baseC: '#E0BE9C', lw: 1.4 });
  }, { ay: 468 / 480 });
  defSprite('s11_arrow', 360, 130, () => {
    const pts = [[22, 34], [250, 34], [250, 16], [338, 65], [250, 114], [250, 96], [22, 96], [36, 65]];
    paint(pts, PAL.cream, { baseC: '#FFF9EC', a: 150, lw: 2.2 });
    flat(rrPts(40, 82, 206, 10, 4), PAL.brownLt, 0.35);
    pen(PAL.brownLt, 1.1, 'pen'); brush.line(52, 44, 232, 46); brush.line(60, 88, 222, 86); brush.noStroke();
    flat(ellPts(48, 65, 5, 5, 10), PAL.inkSoft);
  }, { v: 2, ax: 48 / 360, ay: 0.5 });
  const BOARD_TXT = 92; // px from the nail to the lettering centre
  const DOOM_ST = { font: 'display', size: 56, fill: PAL.red, weight: 700 };
  const DOOM_HOT = { font: 'display', size: 56, fill: '#FFFFFF', weight: 700, stroke: PAL.red, sw: 5 };
  // arrow board nailed at (px,py) pointing along ang. o: spin (weathervane angle), pop, hot, fore (foreshortening)
  function board(px, py, ang, sc, o = {}) {
    const sp = Math.cos(o.spin || 0) * (o.fore ?? 1);
    const left = Math.cos(ang) < 0;
    const r = left ? ang - Math.PI : ang;
    const k = sc * (1 + (o.pop || 0));
    const ax = Math.max(0.1, Math.abs(sp)) * (sp < 0 ? -1 : 1);
    spr('s11_arrow', px, py, { s: k, sx: left ? -ax : ax, r, seed: o.seed || 0, jit: 0.6, a: o.a });
    if (sp > 0.4) {
      const d = BOARD_TXT * k * ax;
      txt('DOOM', px + Math.cos(ang) * d, py + Math.sin(ang) * d, o.hot ? DOOM_HOT : DOOM_ST, { r, s: k * 0.92, sx: ax, a: o.a });
    }
  }

  // ================= L31 sprites =================
  defSprite('s11_ground', 1000, 300, () => {
    const top = []; for (let i = 0; i <= 44; i++) { const t = i / 44; top.push([-20 + t * 1040, 40 + Math.pow(Math.abs(t - 0.45) * 2, 2) * 42 + Math.sin(t * 23) * 3]); }
    const pts = [...top, [1020, 320], [-20, 320]];
    flat(pts, '#FFE0C4');
    gradRect(-20, 110, 1040, 210, withAlphaCol('#D59AB6', 0), withAlphaCol('#D59AB6', 0.55));
    for (let i = 0; i < 7; i++) blob(60 + i * 145 + random(-20, 20), 160 + random(100), 30 + random(12), i % 3 ? PAL.peach : PAL.butterLt, 90, 0.2);
    pen(PAL.ink, 1.8, '2B'); brush.spline(top.filter((_, i) => i % 2 === 0), 0.3); brush.noStroke();
    for (let i = 0; i < 9; i++) paintIn(ellPts(40 + random(920), 100 + random(150), 8 + random(9), 5 + random(5), 14), PAL.grayLt, { baseC: '#EEEAF4', lw: 1.1 });
    for (const [x, y] of [[90, 74], [700, 70], [880, 96]]) for (let k = -2; k <= 2; k++) { const q = [[x + k * 6, y + 2], [x + k * 8 + random(-3, 3), y - 18 - random(10)]]; pline(q, PAL.grassDk, 4); pline(q, PAL.grass, 1.8); }
    for (let i = 0; i < 4; i++) { const c = clipPts(120 + i * 230 + random(60), 160 + random(90), 26, random(TAU), 0.7); pline(c, PAL.ink, 3.4); pline(c, '#B9BED0', 1.9); }
  });
  defSprite('s11_match', 130, 40, () => {
    paint(rrPts(10, 16, 96, 9, 3), PAL.cream, { baseC: '#FFF3DA', lw: 1.2 });
    paint(ellPts(108, 20, 13, 10, 16), PAL.red, { baseC: '#FF6A7E', lw: 1.2 });
  }, { ax: 16 / 130, ay: 0.5 });
  const MATCH_LEN = 92; // grip anchor to head centre
  defSprite('s11_matchbox', 130, 90, () => {
    paint(rrPts(12, 20, 106, 54, 6), PAL.blue, { baseC: '#7FA2F7', lw: 1.8 });
    paint(rrPts(34, 32, 62, 32, 5), PAL.butter, { baseC: PAL.butterLt, lw: 1.2 });
    flat(ellPts(65, 48, 8, 8, 12), PAL.red);
    flat(rrPts(12, 14, 106, 11, 3), '#8A5A40');
    pen(PAL.ink, 1.4, '2B'); brush.rect(12, 14, 106, 11); brush.noStroke();
  }, { ax: 0.18, ay: 0.55 });
  // fuse rope along the bottom edge: screen y = FY(x); near the right edge it climbs to y ~870 so the spark leaves the
  // frame at the height where s12 picks it up (its rope enters from the left at y ~866, above the HUD).
  // The rope sprite is drawn at 2x centred on (960, ROPE_Y).
  const FY = (x) => 1047 + Math.sin(x * 0.011) * 4 + Math.sin(x * 0.031 + 1) * 2 - 176 * sstep(1470, 1905, x);
  const X0 = 720, XEND = 1945, ROPE_Y = 957; // spark centre crosses the right edge at ~108.05
  const ropeLY = (xl) => 65 + (FY(-40 + xl * 2) - ROPE_Y) / 2;
  const ropePts = () => { const P = []; for (let xl = -4; xl <= 1004; xl += 6) P.push([xl, ropeLY(xl)]); return P; };
  defSprite('s11_rope', 1000, 130, () => {
    const P = ropePts();
    pline(P, PAL.ink, 6.5); pline(P, '#DDB88A', 3.8); pline(P.map(([x, y]) => [x, y - 0.8]), '#F2D6AE', 1.2, 0.8);
    for (let xl = 2; xl < 1000; xl += 4) { const y = ropeLY(xl); segLine(xl - 1.1, y + 1.7, xl + 1.1, y - 1.7, PAL.brown, 1, 0.85); }
  });
  defSprite('s11_rope_b', 1000, 130, () => {
    const P = ropePts();
    pline(P, '#2A2234', 5.5); pline(P, '#3E3448', 2.4, 0.8);
    for (let xl = 2; xl < 1000; xl += 3) { const y = ropeLY(xl); if (random() < 0.5) flat(ellPts(xl, y + random(-2, 2), 1 + random(1.2), 0.8 + random(1), 6), random() < 0.5 ? '#6E6680' : '#4A4258', 0.9); }
  });

  // ================= L32 sprites =================
  defSprite('s11_club', 1000, 580, () => {
    gradRect(-10, -10, 1020, 350, '#1F2C68', '#2C4290');
    gradRect(-10, 330, 1020, 80, '#18235A', '#1C2862');
    gradRect(-10, 400, 1020, 190, '#131A42', '#0E1331');
    wash(-40, -40, 1080, 380, '#3552A8', 55, 0.2);
    blob(700, 170, 240, '#3B5BC0', 70, 0.4);
    blob(170, 110, 220, '#16205A', 80, 0.4);
    for (let r = 0; r < 15; r++) { const y = 14 + r * 22; segLine(-10, y, 1010, y, '#16204F', 1.2, 0.45); for (let x = (r % 2) * 26; x < 1010; x += 52) segLine(x, y, x, y + 22, '#16204F', 1.2, 0.4); }
    wash(-40, -20, 1080, 360, '#2B3F8C', 40, 0.25);
    pen('#6D8BD8', 1.5, 'marker'); brush.line(-10, 332, 1010, 332); brush.line(-10, 398, 1010, 398); brush.noStroke();
    for (let x = 14; x < 1000; x += 92) { pen('#101848', 1.1, 'pen'); brush.rect(x, 344, 74, 44); brush.noStroke(); }
    for (let i = -14; i <= 26; i++) segLine(500 + (i - 6) * 26, 400, 500 + (i - 6) * 110, 590, '#2A3A7A', 1.3, 0.5);
    wash(-40, 400, 1080, 200, '#0B102A', 60, 0.2);
  });
  const ARCH = (inset = 0) => { const P = [[50 + inset, 470 - inset]]; for (let i = 0; i <= 28; i++) { const a = Math.PI + (i / 28) * Math.PI; P.push([240 + Math.cos(a) * (190 - inset), 215 + Math.sin(a) * (190 - inset)]); } P.push([430 - inset, 470 - inset]); return P; };
  defSprite('s11_win_glass', 480, 500, () => {
    const g = ARCH(2);
    flat(g, '#131A46');
    wc('#1D2A6A', 110, 0.02, 0.5, 0.5); brush.polygon(ARCH(24)); brush.noFill();
    for (let i = 0; i < 5; i++) flat(ellPts(318, 118, 80 - i * 12, 80 - i * 12, 32), '#6F8FE0', 0.08);
    paintIn(ellPts(318, 118, 38, 38, 32), '#DCEBFF', { baseC: '#EAF2FF', a: 120, lw: 1.2, lc: '#8FB0FF' });
    for (let i = 0; i < 14; i++) { const r = 5 + random(10); flat(ellPts(80 + random(320), 320 + random(120), r, r, 16), [PAL.butterLt, PAL.skyLt, PAL.pinkLt][i % 3], 0.35); }
    const sk = [[56, 470]]; let x = 56;
    while (x < 424) { const w = Math.min(424 - x, 28 + random(40)), h = 50 + random(90); sk.push([x, 470 - h], [x + w, 470 - h]); x += w; }
    sk.push([424, 470]);
    flat(sk, '#0C1133', 0.92);
    for (let i = 0; i < 22; i++) flat(rrPts(70 + random(340), 400 + random(60), 5, 6, 1), PAL.butterLt, 0.55);
  });
  defSprite('s11_win_frame', 480, 500, () => {
    const A = ARCH(2); pline([...A, A[0]], PAL.ink, 22); pline([...A, A[0]], '#7F97D8', 16); pline([[240, 28], [240, 466]], PAL.ink, 14); pline([[52, 300], [428, 300]], PAL.ink, 14); pline([[240, 30], [240, 464]], '#7F97D8', 9); pline([[54, 300], [426, 300]], '#7F97D8', 9);
    pline([...A, A[0]].map(([x, y]) => [x - 2, y - 2]), '#B8C8F0', 3, 0.7);
    paintIn(rrPts(22, 458, 436, 30, 8), '#6F86C8', { baseC: '#8AA0DA', lw: 1.8 });
  });
  defSprite('s11_backdrop', 840, 480, () => {
    flat([[20, 40], [820, 40], [820, 470], [20, 470]], '#23357E');
    for (let x = 20; x < 800; x += 56) { flat(rrPts(x + 26, 44, 24, 424, 10), '#16225C', 0.55); pline([[x + 12, 64], [x + 13, 250], [x + 14, 452]], '#4F6CCB', 3.2, 0.8); }
    for (let i = 0; i < 8; i++) blob(110 + i * 88, 160 + (i % 3) * 110, 30, i % 2 ? '#2F47A0' : '#16225C', 70, 0.2);
    const val = [[10, 8], [830, 8]], n = 12, sw = 820 / n;
    for (let i = n - 1; i >= 0; i--) { const x0 = 10 + (i + 1) * sw; for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI; val.push([x0 - sw / 2 + (Math.cos(a) * sw) / 2, 72 + Math.sin(a) * 22]); } }
    paintIn(val, '#1A2766', { baseC: '#22317A', lw: 2, inner: [[30, 20], [810, 20], [810, 64], [30, 64]] });
    pen('#8FB0FF', 2, 'marker'); brush.line(14, 22, 826, 22); brush.noStroke();
    pen('#0E1540', 1.6, '2B'); brush.polygon([[20, 40], [820, 40], [820, 470], [20, 470]]); brush.noStroke();
  });
  defSprite('s11_stage', 1000, 330, () => {
    const floor = [[100, 40], [900, 40], [980, 205], [20, 205]];
    paintIn(floor, '#5E7FD6', { baseC: '#7D9BE6', a: 150, lw: 2 });
    for (let i = 1; i < 14; i++) { const t = i / 14; segLine(lerp(100, 900, t), 42, lerp(20, 980, t), 204, '#3E5AAE', 1.5, 0.5); }
    for (const y of [78, 124, 170]) { const t = (y - 40) / 165; segLine(lerp(100, 20, t), y, lerp(900, 980, t), y, '#3E5AAE', 1.1, 0.3); }
    const riser = [[20, 205], [980, 205], [972, 312], [28, 312]];
    paintIn(riser, '#1E2A6B', { baseC: '#27367E', lw: 2, inner: [[40, 215], [960, 215], [955, 300], [45, 300]] });
    pen('#8FB0FF', 2.2, 'marker'); brush.line(24, 210, 976, 210); brush.noStroke();
    for (let x = 80; x < 960; x += 110) { pen('#141C4E', 1.1, 'pen'); brush.line(x, 224, x, 302); brush.noStroke(); }
  });
  defSprite('s11_axis', 460, 80, () => {
    pline([[16, 40], [396, 40]], PAL.ink, 11); pline([[16, 40], [396, 40]], '#F4F8FF', 6);
    for (let x = 80; x < 380; x += 60) pline([[x, 28], [x, 52]], PAL.ink, 3);
    paintIn([[378, 16], [444, 40], [378, 64], [392, 40]], '#F4F8FF', { baseC: '#FFFFFF', lw: 2 });
  }, { ax: 16 / 460, ay: 0.5 });
  const SAX_C = [[48, 46], [78, 46], [100, 58], [112, 84], [114, 130], [118, 190], [124, 244], [136, 276], [156, 288], [176, 280], [186, 256], [192, 222], [198, 196]];
  const SAX_R = (t) => (t < 0.1 ? lerp(4, 7, t / 0.1) : t < 0.25 ? lerp(7, 12, (t - 0.1) / 0.15) : t < 0.8 ? lerp(12, 17, (t - 0.25) / 0.55) : lerp(17, 22, (t - 0.8) / 0.2));
  function tube(C, rf) {
    const P = catmull(C, 4), L = [], Rr = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
      const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l, r = rf(i / (P.length - 1));
      L.push([P[i][0] + nx * r, P[i][1] + ny * r]); Rr.push([P[i][0] - nx * r, P[i][1] - ny * r]);
    }
    return [...L, ...Rr.reverse()];
  }
  defSprite('s11_sax', 250, 340, () => {
    paint(tube(SAX_C, SAX_R), PAL.gold, { baseC: '#FFD978', a: 170, lw: 2.2 });
    pline(catmull(SAX_C, 4).map(([x, y]) => [x + 5, y + 2]), '#E0A22A', 6, 0.45);
    paint(ellPts(200, 192, 33, 12, 28, 0, 0.23), PAL.gold, { baseC: '#FFE08A', lw: 2 });
    flat(ellPts(200, 192, 22, 7, 20, 0, 0.23), '#8A5A1E', 0.8);
    for (let i = 0; i < 6; i++) { flat(ellPts(128 + i * 1.6, 118 + i * 26, 7.5, 7.5, 14), PAL.ink); flat(ellPts(128 + i * 1.6, 118 + i * 26, 5.5, 5.5, 14), '#FFF6D6'); }
    paint([[34, 38], [60, 40], [60, 53], [34, 55]], PAL.ink, { baseC: '#3A2E55', lw: 1.1 });
    pen('#FFFFFF', 1.6, 'marker'); brush.spline([[106, 100], [108, 160], [114, 222]], 0.5); brush.noStroke();
  }, { v: 2, ax: 40 / 250, ay: 46 / 340 });
  const SAX_BELL = [200 - 40, 190 - 46];
  defSprite('s11_mortar', 220, 170, () => {
    paint(rrPts(62, 78, 96, 52, 10), PAL.navy, { baseC: '#34407A', lw: 2 });
    paint([[110, 32], [208, 62], [110, 92], [12, 62]], PAL.ink, { baseC: '#3E3462', lw: 2 });
    paint(ellPts(110, 62, 8, 5, 12), PAL.gold, { baseC: PAL.butter, lw: 1 });
  }, { ay: 128 / 170 });
  defSprite('s11_table', 460, 340, () => {
    paint(rrPts(206, 100, 48, 214, 12), '#1B2560', { baseC: '#243070', lw: 1.8 });
    paint(ellPts(230, 96, 212, 44, 48), '#3350A8', { baseC: '#4A68C0', lw: 2.2 });
    flat(ellPts(170, 92, 60, 14, 24), '#8FB0FF', 0.3);
    paint(rrPts(92, 42, 44, 52, 12), '#9FC0FF', { baseC: '#C8DCFF', a: 110, lw: 1.6 });
    paint(rrPts(102, 58, 24, 30, 6), PAL.cream, { baseC: '#FFF6E0', lw: 1 });
    paint([[298, 14], [366, 14], [332, 54]], '#6FB4FF', { baseC: '#A8D4FF', lw: 1.6 });
    strokePath([[332, 54], [332, 88]], PAL.ink, 1.6, 'pen', 0);
    paint(ellPts(332, 88, 18, 5, 16), '#C8DCFF', { baseC: '#E4EEFF', lw: 1.2 });
    flat(ellPts(320, 24, 5, 4, 10), '#FFFFFF', 0.9);
  }, { ay: 96 / 340 });
  for (const [nm, bun] of [['s11_sil_a', false], ['s11_sil_b', true]]) {
    defSprite(nm, 220, 250, () => {
      const c = '#141B45';
      paintIn([[30, 252], [40, 172], [72, 142], [148, 142], [180, 172], [190, 252]], c, { baseC: '#18214F', lw: 1.6, lc: '#0B0F2A' });
      paintIn(ellPts(110, 100, 50, 54, 32), c, { baseC: '#18214F', lw: 1.6, lc: '#0B0F2A' });
      if (bun) paintIn(ellPts(110, 44, 22, 19, 20), c, { baseC: '#18214F', lw: 1.4, lc: '#0B0F2A' });
      else paintIn([[62, 76], [110, 40], [160, 76], [150, 60], [110, 50], [70, 60]], c, { baseC: '#1C2658', lw: 1.2, lc: '#0B0F2A' });
      pen('#7FA8FF', 1.8, 'marker'); brush.spline([[130, 52], [150, 70], [158, 100]], 0.5); brush.spline([[160, 150], [178, 172]], 0.5); brush.noStroke();
    }, { v: 2, ay: 1 });
  }
  defSprite('s11_note_a', 100, 140, () => {
    paint(ellPts(36, 108, 22, 16, 24, 0, -0.4), PAL.sky, { baseC: '#BFE4FF', lw: 1.8 });
    pline([[56, 104], [56, 22]], PAL.ink, 7); pline([[56, 102], [56, 24]], '#BFE4FF', 3);
    paint([[56, 20], [88, 42], [84, 64], [58, 44]], PAL.sky, { baseC: '#BFE4FF', lw: 1.6 });
    flat(ellPts(28, 102, 6, 4, 10), '#FFFFFF', 0.9);
  }, { v: 2 });
  defSprite('s11_note_b', 150, 140, () => {
    for (const x of [32, 112]) paint(ellPts(x, 110, 22, 16, 24, 0, -0.4), PAL.blue, { baseC: '#9DB8FF', lw: 1.8 });
    pline([[52, 106], [52, 30]], PAL.ink, 6); pline([[132, 106], [132, 22]], PAL.ink, 6);
    paint([[50, 22], [134, 12], [134, 32], [50, 42]], PAL.blue, { baseC: '#9DB8FF', lw: 1.6 });
    flat(ellPts(24, 104, 6, 4, 10), '#FFFFFF', 0.9); flat(ellPts(104, 104, 6, 4, 10), '#FFFFFF', 0.9);
  }, { v: 2 });
  defSprite('s11_neon', 250, 230, () => {
    paint(rrPts(20, 20, 210, 190, 26), '#121A44', { baseC: '#172055', lw: 2 });
    pen('#5E8CFF', 6, 'marker'); brush.line(125, 50, 125, 160); brush.line(62, 162, 188, 162); brush.noStroke();
    pen('#E6F0FF', 2.2, 'marker'); brush.line(125, 50, 125, 160); brush.line(62, 162, 188, 162); brush.noStroke();
    pen('#E6F0FF', 1.6, 'marker'); brush.rect(125, 142, 20, 20); brush.noStroke();
  });
  defSprite('s11_spot', 190, 170, () => {
    paint([[42, 26], [148, 26], [168, 120], [22, 120]], '#18214F', { baseC: '#222D66', lw: 2 });
    paint(ellPts(95, 124, 76, 22, 28), '#CFE3FF', { baseC: '#EEF5FF', lw: 2 });
    pen('#6D8BD8', 1.5, 'marker'); brush.line(50, 40, 60, 110); brush.noStroke();
  }, { ax: 0.5, ay: 124 / 170 });
  defSprite('s11_tissue', 110, 110, () => {
    paint([[30, 20], [70, 10], [96, 40], [88, 80], [60, 100], [22, 86], [12, 50]], '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6, lc: PAL.inkSoft });
    pen(PAL.lilac, 1.1, 'pen'); brush.line(40, 30, 60, 70); brush.line(62, 26, 76, 60); brush.noStroke();
  }, { v: 2 });

  // ================= the fuse (screen space, shared by L31 and L32) =================
  const P31 = { x: 700, y: 926, s: 1.25 };
  const C31 = { x: 1180, y: 926, s: 0.9 };
  function clawd31(T) {
    const armL = keys([[102.3, 0.3], [103.1, 0.3], [103.25, -0.95, Ez.out], [103.33, 0.5, Ez.in], [103.46, -0.3, Ez.out], [103.56, -0.3], [103.71, 0.92, Ez.inOut], [103.86, 0.92], [104.0, -0.6, Ez.out], [104.3, -0.15]], T);
    const bend = sstep(103.56, 103.71, T) * (1 - sstep(103.86, 104.05, T));
    const lit = T >= W31[4];
    const sp = T > FUSE_T0 ? sparkPos(sparkS(T)) : [900, 900];
    const look = T > FUSE_T0 ? [clamp((sp[0] - 1180) / 500, -1, 1) * 0.8, 0.6] : lit ? [-0.7, 0.1] : [-0.3, 0];
    return { ...C31, armL, armR: 0.25 + 0.15 * Math.sin(T * 3), r: -0.1 * bend, sq: 1 + 0.06 * bend, eyes: 'ce_sq', look, blink: false };
  }
  // the match is held at the tip of Clawd's left arm
  function matchPose31(T) {
    const c = clawd31(T), a = c.armL;
    const g = clawdPt(c, -4 * CU - 2 * CU * Math.cos(a), -5 * CU + 2 * CU * Math.sin(a));
    const b = clawdPt(c, -4 * CU - 3 * CU * Math.cos(a), -5 * CU + 3 * CU * Math.sin(a));
    const ang = Math.atan2(b[1] - g[1], b[0] - g[0]);
    const ms = 0.9;
    return { gx: g[0], gy: g[1], ang, s: ms, hx: g[0] + Math.cos(ang) * MATCH_LEN * ms, hy: g[1] + Math.sin(ang) * MATCH_LEN * ms };
  }
  const tipM = matchPose31(FUSE_T0 - 0.02); // match touching the fuse end (computed before the spark exists)
  const CURL = catmull([[tipM.hx + 3, tipM.hy + 9], [tipM.hx + 8, tipM.hy + 36], [tipM.hx + 1, tipM.hy + 62], [918, 962], [868, 992], [810, 1018], [760, 1039], [X0, FY(X0)]], 6);
  const CURL_D = cumLen(CURL), CURL_LEN = CURL_D[CURL_D.length - 1];
  const SPARK_K = [[FUSE_T0, 0], [FUSE_T0 + 0.12, 6], [104.6, CURL_LEN], [108.1, CURL_LEN + (XEND - X0)]];
  function sparkS(T) { return linKeys(SPARK_K, T); }
  function sparkPos(s) { if (s <= CURL_LEN) return along(CURL, CURL_D, s); const x = X0 + (s - CURL_LEN); return [x, FY(x)]; }
  function subCurl(s0, s1) { const P = [along(CURL, CURL_D, s0)]; for (let i = 0; i < CURL.length; i++) if (CURL_D[i] > s0 && CURL_D[i] < s1) P.push(CURL[i]); P.push(along(CURL, CURL_D, s1)); return P; }
  function ropeNative(P, burnt) {
    if (P.length < 2) return;
    if (burnt) { pline(P, '#2A2234', 8); for (let i = 0; i < P.length; i += 2) disc(P[i][0] + RS(i, 5) * 2, P[i][1] + RS(i, 6) * 2, 1.6, '#6E6680', 0.8); return; }
    pline(P, PAL.ink, 11);
    pline(P, '#DDB88A', 6.5);
  }
  // the rope itself: o.curl draws the L31 curl, o.below the stub rising from below the frame (L32), o.tint for the bottom rope
  function drawRope(T, o = {}) {
    const S = sparkS(T), sp = sparkPos(S);
    const sx = S >= CURL_LEN ? sp[0] : X0;
    const k0 = (X0 + 40) / 2000, ks = clamp((sx + 40) / 2000, k0, 1);
    if (o.below) pline([[690, 1100], [700, 1078], [712, 1058], [X0, FY(X0)]], '#2A2234', 8);
    if (o.curl) {
      if (S > 0) ropeNative(subCurl(0, Math.min(S, CURL_LEN)), true);
      if (S < CURL_LEN) ropeNative(subCurl(S, CURL_LEN), false);
    }
    if (o.tint) setTint(o.tint);
    if (ks > k0) spr('s11_rope_b', 960, ROPE_Y, { s: 2, jit: 0, crop: [k0, 0, ks, 1] });
    if (ks < 1) spr('s11_rope', 960, ROPE_Y, { s: 2, jit: 0, crop: [ks, 0, 1, 1] });
    clearTint();
  }
  function drawSpark(x, y, T, big = 1) {
    glow(x, y, 110 * big, PAL.orange, 0.5);
    glow(x, y, 46 * big, PAL.butter, 0.6);
    const f = Math.floor(T * 24);
    const rays = [[], []];
    for (let i = 0; i < 10; i++) { const a = R(f * 13 + i, 71) * TAU, l = (16 + R(f * 13 + i, 72) * 34) * big; rays[i % 2].push([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l]); }
    blendMode(ADD); segLines(rays[0], '#FFFFFF', 2.4, 0.9); segLines(rays[1], PAL.butter, 2.4, 0.9); blendMode(BLEND);
    disc(x, y, 7 * big, '#FFFFFF');
  }
  function smokeCurl(x, y, age, seed, a, c = PAL.grayLt) {
    const n = 9;
    noFill(); stroke(withAlphaCol(c, a)); strokeWeight(2.5 + age * 2.5);
    beginShape();
    for (let k = 0; k < n; k++) {
      const u = k / (n - 1);
      vertex(x + Math.sin(u * 5 + age * 3 + seed) * (5 + u * 12 * (1 + age)) + age * 14, y - u * (26 + age * 70) - age * 50);
    }
    endShape(); noStroke();
  }
  // everything that glows: smoke, embers, sparkler spray and the spark itself
  function drawSparkFx(T, o = {}) {
    if (T < FUSE_T0) return;
    const S = sparkS(T), sp = sparkPos(S);
    if (sp[0] > 2080) return;
    for (let i = Math.max(0, Math.floor((T - FUSE_T0 - 1.3) / 0.12)); i <= Math.floor((T - FUSE_T0) / 0.12); i++) {
      const tb = FUSE_T0 + i * 0.12, age = T - tb; if (age < 0 || age > 1.3) continue;
      const p = sparkPos(sparkS(tb));
      smokeCurl(p[0], p[1] - 8, age, i, (o.smokeA ?? 0.3) * sstep(0, 0.15, age) * (1 - sstep(0.6, 1.3, age)), o.smoke || PAL.grayLt);
    }
    for (let i = 1; i <= 12; i++) {
      const d = S - i * 10; if (d < 0) break;
      const p = sparkPos(d), fl = 0.55 + 0.45 * Math.sin(T * 31 + i * 2.3);
      disc(p[0] + RS(i, 9) * 2, p[1] + RS(i, 8) * 2, 3.6 * (1 - i / 14), mixc(PAL.butter, PAL.red, i / 12), (1 - i / 13) * fl);
    }
    const dt = 0.028, life = 0.5, i1 = Math.floor((T - FUSE_T0) / dt);
    for (let i = Math.max(0, i1 - Math.ceil(life / dt)); i <= i1; i++) {
      const tb = FUSE_T0 + i * dt, age = T - tb; if (age < 0 || age > life) continue;
      const p = sparkPos(sparkS(tb)), ang = -Math.PI / 2 + RS(i, 81) * 1.5, v = 160 + R(i, 82) * 280;
      disc(p[0] + Math.cos(ang) * v * age, p[1] + Math.sin(ang) * v * age + 520 * age * age, 1.2 + 2.6 * (1 - age / life), i % 3 ? PAL.butter : '#FFFFFF', 1 - age / life);
    }
    drawSpark(sp[0], sp[1], T, (o.big ?? 1) + 0.25 * Math.exp(-(T - FUSE_T0) * 6));
  }

  // ================= L30: nowhere left to go =================
  const PIPX30 = 880;
  const islandTop = (x) => 780 + islandLocalY(x - 960 + 350) - 74;
  const TURNS30 = [[100.5, 1, 0.14], [W30[1], 2, 0.14], [W30[2], 6, 0.28], [W30[3], 7, 0.12], [W30[4], 8, 0.14]];
  function pip30(T) {
    let half = 0, hopK = 0, prev = 0;
    for (const [t, m, d] of TURNS30) { const u = clamp((T - t) / d); half += (m - prev) * Ez.inOut(u); prev = m; if (u > 0 && u < 1) hopK = Math.max(hopK, Math.sin(Math.PI * u)); }
    const sx = Math.cos(Math.PI * half);
    const plop = Ez.outBack(inv(W30[5], W30[5] + 0.2, T), 2);
    const spin = T > W30[2] && T < W30[2] + 0.28;
    const pointL = sstep(W30[3], W30[3] + 0.08, T) * (1 - sstep(W30[4], W30[4] + 0.1, T));
    let face = T < W30[2] ? 'pf_nervous' : T < W30[5] ? 'pf_scared' : 'pf_cry';
    if (spin) face = 'pf_dizzy';
    const armR = plop > 0.3 ? 0.15 : spin ? 1.5 : lerp(1.05 + 0.18 * Math.sin(T * 5), 2.2, pointL);
    const armL = plop > 0.3 ? 0.1 : spin ? 1.5 : 0.35 + 0.1 * Math.sin(T * 4);
    const now = T > TA ? Math.sin(Math.PI * clamp((T - TA) / 0.22)) : 0; // startled hop on "Now"
    return {
      x: PIPX30, y: islandTop(PIPX30) + 4 + 46 * plop, s: 1.02, face, flip: sx < 0, ax: Math.max(0.14, Math.abs(sx)),
      armL, armR, hop: 18 * hopK + 26 * now, headR: 0.12 * (1 - plop), legs: plop > 0 ? [1.25 * plop, -1.25 * plop] : null,
      sq: 1 + 0.12 * Math.exp(-Math.max(0, T - W30[5] - 0.12) * 9) * (T > W30[5] + 0.12 ? 1 : 0),
    };
  }
  function pipFace30(T) { return pipPt(pip30(T), 0, -59, true); }
  const EYE31 = pipPt(P31, 0, -59, true); // where Pip's eyes sit in L31: the iris closes onto this spot
  function cam30(T) {
    const dr = Ez.inOut(inv(TA - 0.3, W30[5], T));
    const Z0 = lerp(1.0, 1.12, dr), cx0 = lerp(960, 925, dr), cy0 = lerp(560, 590, dr);
    const k = Ez.inOut(inv(W30[5] - 0.04, TB + 0.04, T));
    const f = pipFace30(T), Zt = 1.45;
    const cxT = f[0] - (EYE31[0] - 960) / Zt, cyT = f[1] - (EYE31[1] - 540) / Zt;
    return { Z: lerp(Z0, Zt, k), cx: lerp(cx0, cxT, k), cy: lerp(cy0, cyT, k) };
  }
  const toScreen30 = (T, x, y) => { const C = cam30(T); return [960 + (x - C.cx) * C.Z, 540 + (y - C.cy) * C.Z]; };
  // the two nearby signposts: boards are [height above base, angle, foreshortening]
  const POSTS30 = [
    { x: 1135, s: 1.0, b: [[405, Math.PI - 0.08, 1], [365, 0.1, 1], [318, -0.62, 1], [270, 0.34, 1], [222, -0.2, 0.35], [175, 0.62, 1]] },
    { x: 720, s: 0.64, b: [[400, Math.PI + 0.1, 1], [330, -2.45, 1]] },
  ];
  // distant signs popping out of the sea on the words: [x, base y, scale, pop time, angles]
  const FAR30 = [
    [1790, 736, 0.4, W30[1], [Math.PI - 0.2, 0.3]], [330, 722, 0.46, W30[2], [0.15, Math.PI + 0.3]], [1600, 712, 0.36, W30[2] + 0.05, [-0.4]],
    [150, 760, 0.5, W30[3], [Math.PI - 0.05]], [540, 700, 0.32, W30[4], [0.4, -2.6]], [1370, 696, 0.3, W30[5], [Math.PI + 0.2, -0.1]],
  ];
  function gull(x, y, s, ph, c, a) {
    const w = 0.35 + 0.45 * Math.sin(ph);
    segLine(x, y, x - 22 * s, y - 22 * s * w, c, 3 * s, a); segLine(x, y, x + 22 * s, y - 22 * s * w, c, 3 * s, a);
  }
  shot({
    id: 'L30-island', t0: TA, tin: { type: 'flip', d: 0.6, at: 0.5 },
    draw(sh) {
      const T = sh.T;
      const C = cam30(T);
      const go = sstep(W30[5], TB, T);
      push();
      cam(C.cx, C.cy, C.Z, 0.006 * Math.sin(T * 1.3));
      spr('s11_dusk', 960, 540, { s: 2.12, jit: 0 });
      for (let i = 0; i < 12; i++) { // first stars come out
        const k = 0.5 + 0.5 * Math.sin(T * 3 + i * 1.7);
        spr('sparkW', 80 + R(i, 1101) * 1760, 250 + R(i, 1102) * 160, { s: (0.06 + 0.07 * R(i, 1103)) * (0.6 + 0.4 * k), r: T * 0.5 + i, a: (0.35 + 0.5 * k) * (0.5 + 0.5 * go), seed: i });
      }
      const sunY = 606 + (T - TA) * 9 + Ez.in(inv(W30[5], TB + 0.1, T)) * 110; // sinks, then drops on "go."
      glow(1470, sunY, 250, PAL.orange, 0.3 * (1 - go * 0.6));
      spr('s11_sun', 1470, sunY, { s: 1, jit: 0.3 });
      spr('s11_dcloud', 420 + (T - TA) * 14, 330, { s: 1.1, a: 0.85 });
      spr('s11_dcloud', 1500 - (T - TA) * 10, 280, { s: 0.8, flip: true, a: 0.75, seed: 3 });
      for (let i = 0; i < 3; i++) gull(300 + i * 150 + (T - TA) * (60 + i * 12), 380 + i * 30 + Math.sin(T * 2 + i) * 8, 0.9 - i * 0.15, T * 9 + i * 2, PAL.inkSoft, 0.85);
      // the sea: far band, sun glitter, distant signs, mid band
      const Bf = BANDS.far, Bm = BANDS.mid, Bn = BANDS.near;
      const offF = -(T - 101.2) * 22, offM = (T - 101.2) * 40, offN = -(T - 101.2) * 62;
      const yF = 578 + 2 * Math.sin(T * 1.3), yM = 642 + 5 * Math.sin(T * 1.7 + 1), yN = 832 + 7 * Math.sin(T * 1.9 + 2);
      drawBand(Bf, yF, offF);
      blendMode(ADD);
      for (let i = 0; i < 18; i++) {
        const d = R(i, 1110), y = 612 + d * 130, w = 14 + d * 40, tw = Math.max(0, Math.sin(T * 5 + i * 2.1));
        segLine(1470 + RS(i, 1111) * (30 + d * 110) - w / 2, y, 1470 + RS(i, 1111) * (30 + d * 110) + w / 2, y, PAL.butter, 3 + d * 2, 0.5 * tw * (1 - go));
      }
      blendMode(BLEND);
      for (let i = 0; i < FAR30.length; i++) {
        const [x, y, sc, t0, angs] = FAR30[i];
        const k = inv(t0, t0 + 0.34, T); if (k <= 0) continue;
        const bob = Math.sin(T * 1.7 + x * 0.004) * 5;
        const by = y + (1 - Ez.outBack(k, 1.8)) * 470 * sc + bob, top = by - 440 * sc;
        spr('s11_post', x, by, { s: sc, seed: i, r: Math.sin(T * 1.5 + i) * 0.03 });
        angs.forEach((a, j) => board(x, top + 60 * sc + j * 70 * sc, a + Math.sin(T * 2 + i + j) * 0.04, sc * 0.95, { seed: i * 3 + j, pop: 0.25 * Math.exp(-(T - t0 - 0.3) * 7) * (T > t0 + 0.3 ? 1 : 0) }));
        burst(T, t0, x, bandCrest(Bm, yM, offM, x) + 6, { n: 7, names: ['s11_clip'], spd: 520, g: 1500, life: 0.75, s: 0.16, spread: 2.4, ang0: -Math.PI / 2, seed: 40 + i * 9 });
      }
      drawBand(Bm, yM, offM);
      // island, signposts, Pip
      spr('s11_island', 960, 780, { s: 1, jit: 0.4 });
      const P = pip30(T);
      shadow(P.x, islandTop(P.x) + 6, 60 * P.ax + 14, 0.22);
      const spinT = (i) => TAU * 2 * (1 - Ez.out(inv(W30[1] + i * 0.03, W30[2] + 0.02 + i * 0.02, T)));
      const hot = T > W30[5] && T < W30[5] + 0.34 && Math.floor((T - W30[5]) * 12) % 2 === 0;
      POSTS30.forEach((po, pi) => {
        const by = islandTop(po.x) + 8;
        spr('s11_post', po.x, by, { s: po.s, seed: pi, r: pi ? -0.04 : 0.02 });
        po.b.forEach(([hgt, a, fore], j) => {
          const droop = go * 0.18 * (Math.cos(a) < 0 ? -1 : 1);
          const leftBonk = pi === 1 && j === 0 && T > W30[3] ? 0.7 * Math.exp(-(T - W30[3]) * 6) : 0;
          board(po.x, by - hgt * po.s, a + droop + Math.sin(T * 2.1 + j + pi * 3) * 0.035, 0.62 * po.s, { spin: spinT(j + pi * 6), fore, seed: j + pi * 7, pop: leftBonk, hot: hot || leftBonk > 0.1 });
        });
      });
      burst(T, W30[3], POSTS30[1].x - 150, islandTop(POSTS30[1].x) + 8 - 400 * POSTS30[1].s, { n: 8, names: ['sparkW', 'spark'], spd: 520, g: 0, life: 0.45, s: 0.22, even: true, seed: 1120 });
      push(); translate(P.x, 0); scale(P.ax, 1); translate(-P.x, 0); // Pip squashes flat while turning
      drawPip(P);
      pop();
      if (T > W30[2] && T < W30[2] + 0.3) { // spin motion arcs
        noFill(); stroke(withAlphaCol(PAL.ink, 0.5)); strokeWeight(4);
        for (let i = 0; i < 3; i++) { const a = T * 30 + i * 2.1; arc(P.x, P.y - 150 - i * 40, 200, 64, a, a + 1.4); }
        noStroke();
      }
      burst(T, W30[2] + 0.1, P.x, P.y - 240, { n: 6, names: ['drop'], spd: 700, g: 1400, life: 0.6, s: 0.4, spread: 2.6, ang0: -Math.PI / 2, seed: 71 });
      burst(T, W30[5] + 0.12, P.x, P.y - 4, { n: 8, names: ['s11_clip', 'puff'], spd: 380, g: 900, life: 0.55, s: 0.14, spread: 2.4, ang0: -Math.PI / 2, seed: 83 });
      if (T > W30[5] + 0.15) { const e = pipEyes(P); for (let j = 0; j < 2; j++) { const age = fract((T - W30[5]) * 2.4 + j * 0.5); spr('drop', e[j][0] + (j ? 10 : -10), e[j][1] + 16 + age * 60, { s: 0.3, a: 1 - age }); } }
      for (const [bx, sd] of [[700, 1130], [1220, 1131]]) burst(T, TA + 0.06, bx, 870, { n: 6, names: ['s11_clip'], spd: 460, g: 1400, life: 0.7, s: 0.2, spread: 1.6, ang0: -Math.PI / 2, seed: sd });
      // near band and paperclips bobbing on its crests
      drawBand(Bn, yN, offN);
      for (let i = 0; i < 9; i++) {
        const lx = 50 + i * 118 + R(i, 1105) * 50;
        const x = 960 + offN + (lx - Bn.w / 2) * 2;
        const y = yN + 2 * crestY(Bn, lx) + 16 + Math.sin(T * 3 + i) * 5;
        spr('s11_clip', x, y, { s: 0.3 + 0.12 * R(i, 1106), r: T * 0.8 * RS(i, 1107) + i, seed: i });
      }
      pop();
      if (go > 0) { noStroke(); fill(withAlphaCol('#1C1733', 0.5 * go)); rect(-10, -10, W + 20, H + 20); }
    },
  });
  lyr(30, { y: (T) => 150 - 230 * Ez.inOut(inv(W31[0] - 0.24, W31[0] + 0.1, T)), maxW: 1500, words: { 2: { fill: PAL.lilacLt, anim: 'spin' }, 3: { fill: PAL.butterLt, anim: 'slide' }, 5: { fill: PAL.pink, anim: 'drop', grow: 0.15 } } });

  // ================= L31: too late now, we lit the fuse =================
  function pip31(T) {
    const armR = keys([[102.95, 0.2], [103.16, 1.55, Ez.outBack], [103.95, 1.55], [104.3, 0.8]], T);
    const startle = T > W31[3] ? Math.sin(Math.PI * clamp((T - W31[3]) / 0.2)) : 0;
    const face = T < W31[4] ? 'pf_nervous' : T < FUSE_T0 + 0.04 ? 'pf_scared' : 'pf_shock';
    const armL = 0.25 + 1.6 * sstep(FUSE_T0, FUSE_T0 + 0.15, T);
    return { ...P31, face, armR, armL, hop: 16 * startle, headR: T > FUSE_T0 ? -0.1 : 0.02 * Math.sin(T * 3), blink: false };
  }
  // the light source: dark until "lit", the match flame until it is shaken out, then the crawling spark
  function light31(T) {
    const on = sstep(W31[4] - 0.02, W31[4] + 0.02, T);
    if (on <= 0) return { x: 900, y: 760, k: 0 };
    const m = matchPose31(T);
    const out = sstep(103.92, 104.04, T);
    const km = (0.9 + 1.2 * Math.exp(-Math.max(0, T - W31[4]) * 6) + 0.07 * Math.sin(T * 37) + 0.05 * Math.sin(T * 23 + 1)) * on;
    const sp = sparkPos(sparkS(T));
    const ks = T > FUSE_T0 ? 0.72 + 0.08 * Math.sin(T * 43) : 0;
    return { x: lerp(m.hx, sp[0], out), y: lerp(m.hy - 10, sp[1], out), k: lerp(km, ks, out) };
  }
  // smooth radial darkness with a hole around the light: a pre-painted alpha falloff sprite (radius DK_N px at scale 1,
  // light radius DK_N / 4.5) scaled with the light's strength, plus flat rects for the rest of the frame
  const DK_N = 256, DK_COL = [20, 16, 42];
  defSprite('s11_dark', DK_N * 2, DK_N * 2, () => {
    const rings = 40, segs = 48, al = (r) => 1 - (1 / (1 + (r / (DK_N / 4.5)) ** 2)) * (1 - sstep(0.62, 1, r / DK_N));
    noStroke(); beginShape(TRIANGLES);
    const V = (ri, j) => { const r = (ri / rings) * DK_N * 1.46, a = (j / segs) * TAU; fill(DK_COL[0], DK_COL[1], DK_COL[2], 255 * al(r)); vertex(DK_N + Math.cos(a) * r, DK_N + Math.sin(a) * r); };
    for (let ri = 0; ri < rings; ri++) for (let j = 0; j < segs; j++) { V(ri, j); V(ri + 1, j); V(ri + 1, j + 1); V(ri, j); V(ri + 1, j + 1); V(ri, j + 1); }
    endShape();
    fill(DK_COL[0], DK_COL[1], DK_COL[2]); for (const [x, y, w, h] of [[-2, -2, DK_N * 2 + 4, 6], [-2, DK_N * 2 - 4, DK_N * 2 + 4, 6], [-2, -2, 6, DK_N * 2 + 4], [DK_N * 2 - 4, -2, 6, DK_N * 2 + 4]]) rect(x, y, w, h);
  });
  function darkness(lx, ly, k, base) {
    const sc = (380 * Math.min(1.6, k)) / (DK_N / 4.5); // light radius 380 px at k = 1
    noStroke(); fill(DK_COL[0], DK_COL[1], DK_COL[2], 255 * base);
    if (sc < 0.05) { rect(-20, -20, W + 40, H + 40); return; }
    const half = DK_N * sc - 1;
    tint(255, 255 * base); spr('s11_dark', lx, ly, { s: sc, jit: 0 }); clearTint();
    noStroke(); fill(DK_COL[0], DK_COL[1], DK_COL[2], 255 * base);
    const x0 = lx - half, x1 = lx + half, y0 = ly - half, y1 = ly + half, ya = Math.max(-20, y0), yb = Math.min(H + 20, y1);
    if (y0 > -20) rect(-20, -20, W + 40, y0 + 20);
    if (y1 < H + 20) rect(-20, y1, W + 40, H + 20 - y1);
    if (yb > ya && x0 > -20) rect(-20, ya, x0 + 20, yb - ya);
    if (yb > ya && x1 < W + 20) rect(x1, ya, W + 20 - x1, yb - ya);
  }
  // wobbly watercolor iris closing on Pip's face (white = next shot)
  function maskIris(p, T) {
    rect(-50, -50, W + 100, H + 100);
    const k = clamp(p / 0.78);
    const R0 = k < 0.72 ? lerp(1250, 190, Ez.inOut(k / 0.72)) : lerp(190, 0, Ez.in((k - 0.72) / 0.28));
    if (R0 < 1) return;
    const c = toScreen30(T, ...pipFace30(T));
    fill(0);
    beginShape();
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU;
      const r = R0 * (1 + 0.06 * Math.sin(3 * a + 1.3) + 0.04 * Math.sin(5 * a + T * 2) + 0.025 * Math.sin(11 * a + 2));
      vertex(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r);
    }
    endShape(CLOSE);
    fill(255);
  }
  shot({
    id: 'L31-fuse', t0: TB, tin: { type: 'mask', d: 0.45, at: 0.78, mask: maskIris },
    draw(sh) {
      const T = sh.T;
      const Lt = light31(T);
      const flash = T > W31[4] ? Math.exp(-(T - W31[4]) * 10) : 0;
      const warm = mixRGB([255, 255, 255], [255, 220, 186], clamp(Lt.k));
      push();
      shake(flash * 6, 31);
      bg('#1C1733');
      setTint([120, 108, 176]); spr('s11_dusk', 960, 540, { s: 2.12, jit: 0 });
      const Bf = BANDS.far, Bm = BANDS.mid;
      setTint([150, 140, 200]);
      drawBand(Bf, 556 + 2 * Math.sin(T * 1.3), -(T - 103.4) * 22);
      drawBand(Bm, 640 + 5 * Math.sin(T * 1.7 + 1), (T - 103.4) * 40);
      setTint(warm);
      // the DOOM signpost looming behind Clawd
      spr('s11_post', 1520, 880, { s: 1.25, jit: 0.4 });
      board(1520, 880 - 405 * 1.25, Math.PI - 0.12, 0.8, { seed: 1 });
      board(1520, 880 - 330 * 1.25, 0.14, 0.8, { seed: 2 });
      board(1520, 880 - 255 * 1.25, -0.52, 0.8, { seed: 3 });
      setTint(warm);
      spr('s11_ground', 960, 1020, { s: 2, jit: 0 });
      shadow(P31.x, P31.y + 4, 80, 0.3);
      shadow(C31.x, C31.y + 4, 150, 0.3);
      // characters, matchbox and match
      const P = pip31(T), Cl = clawd31(T), M = matchPose31(T);
      drawPip(P);
      const hb = pipHandR(P);
      spr('s11_matchbox', hb[0] - 6, hb[1] + 4, { s: 0.9, r: -0.08 });
      drawClawd(Cl);
      if (T > 103.98) setTint([90, 80, 90]);
      spr('s11_match', M.gx, M.gy, { s: M.s, r: M.ang, jit: 0.4 });
      clearTint();
      drawRope(T, { curl: true });
      darkness(Lt.x, Lt.y, Lt.k, lerp(0.95, 0.9, clamp(Lt.k)));
      // last sliver of sunset on the horizon blinks out on "late"
      const sl = (1 - sstep(W31[1] - 0.05, W31[1] + 0.12, T)) * 0.5;
      if (sl > 0) gradRect(0, 536, W, 36, withAlphaCol(PAL.orange, 0), withAlphaCol(PAL.orange, sl));
      for (let i = 0; i < 18; i++) { // a few faint stars
        const k = 0.5 + 0.5 * Math.sin(T * (1.5 + R(i, 3120)) + i * 1.9);
        disc(R(i, 3121) * W, 250 + R(i, 3122) * 260, 1.2 + 1.8 * k, '#EDE7FF', 0.12 + 0.3 * k);
      }
      for (let i = 0; i < 16; i++) { // faint glints on the dark sea
        const k = Math.max(0, Math.sin(T * (2 + R(i, 3101) * 2) + i * 2.3));
        disc(R(i, 3102) * W, 590 + R(i, 3103) * 190, 1.6 + 2 * k, PAL.lilacLt, 0.45 * k * k);
      }
      // flame, flare and embers
      if (T >= W31[4] && T < 103.98) {
        const fs = 0.5 + 0.8 * Math.exp(-(T - W31[4]) * 9) + 0.05 * Math.sin(T * 40);
        glow(M.hx, M.hy - 14, 220 + 300 * flash, PAL.orange, 0.5);
        glow(M.hx, M.hy - 10, 70, PAL.butter, 0.6);
        spr('flame', M.hx, M.hy + 6, { s: fs, r: Math.sin(T * 17) * 0.1, jit: 0.3 });
        for (let i = 0; i < 8; i++) {
          const tb = W31[4] + i * 0.08 + R(i, 3104) * 0.04, age = T - tb; if (age < 0 || age > 0.7) continue;
          disc(M.hx + RS(i, 3105) * 30 * age + Math.sin(age * 9 + i) * 6, M.hy - 20 - age * 120, 2.4, PAL.butter, 1 - age / 0.7);
        }
      }
      if (flash > 0.02) ringLine(M.hx, M.hy, 30 + (1 - flash) * 170, '#FFFFFF', 5, flash * 0.8);
      burst(T, W31[4] - 0.07, M.hx, M.hy, { n: 5, names: ['spark'], spd: 380, g: 900, life: 0.3, s: 0.12, spread: 1.4, ang0: -Math.PI / 2 - 0.6, seed: 3106 }); // scrape
      burst(T, W31[4], M.hx, M.hy, { n: 14, names: ['spark', 'sparkW', 'star5'], spd: 950, g: 300, life: 0.6, s: 0.28, even: true, seed: 3107 });
      if (T > 103.98) smokeCurl(M.hx, M.hy - 6, T - 103.98, 3, 0.4 * (1 - inv(0.6, 1.3, T - 103.98)));
      // eyes in the dark: Pip's pop open on "Too", Clawd's on "we"
      const darkA = 1 - clamp(Lt.k * 2.4);
      if (darkA > 0.01) {
        const open = sstep(TB, TB + 0.08, T) * (T > 102.93 && T < 103.01 ? 0.1 : 1);
        const look = keys([[102.3, 0], [W31[1], -1, Ez.out], [W31[1] + 0.25, 1, Ez.inOut], [W31[2], 0], [W31[3], 1, Ez.out]], T);
        if (open > 0) for (const [ex, ey] of pipEyes(P)) {
          ringLine(ex, ey, 30 * P.s, PAL.lilacLt, 3, 0.35 * darkA);
          ell(ex, ey, 13 * P.s, 16 * P.s * open, '#F4EEFF', darkA);
          ell(ex + look * 8 * P.s, ey + 2, 6 * P.s, 7.5 * P.s * open, PAL.ink, darkA);
        }
        const sw = T - W31[2]; // a sweat drop glints and slides on "now,"
        if (sw > 0 && sw < 0.6) { const e = pipEyes(P)[1]; spr('drop', e[0] + 58, e[1] - 10 + sw * 70, { s: 0.32, a: darkA * (1 - sstep(0.4, 0.6, sw)), jit: 0 }); if (sw < 0.2) spr('sparkW', e[0] + 52, e[1] - 22, { s: 0.14 * Math.sin((sw / 0.2) * Math.PI), jit: 0 }); }
        const co = Ez.outBack(inv(W31[3], W31[3] + 0.14, T), 2.5) * (T > 103.21 && T < 103.28 ? 0.12 : 1);
        if (co > 0) for (const [ex, ey] of clawdEyes(Cl)) { noStroke(); fill(withAlphaCol('#EDE7FF', darkA)); rect(ex - 18, ey - 18 * co, 36, 36 * co, 4); }
      }
      pop();
      burst(T, FUSE_T0, CURL[0][0], CURL[0][1], { n: 16, names: ['spark', 'sparkW'], spd: 750, g: 600, life: 0.6, s: 0.22, seed: 3111 });
      drawSparkFx(T);
    },
  });
  lyr(31, { y: (T) => 150 - 230 * Ez.inOut(inv(W32[0] - 0.24, W32[0] + 0.1, T)), words: { 1: { fill: PAL.lilacLt, jitter: 2 }, 4: { fill: PAL.butter, size: 100, anim: 'zoom' }, 6: { fill: PAL.orange, anim: 'shake', jitter: 4 } } });

  // ================= L32: orthogonality thesis blues =================
  const STAGE = { x: 1340, y: 700 };
  const LENS = [1782, 92], POOL = [1340, 688];
  const AX_V = [1340, 730], AX_L = [1010, 598], AX_R = [1670, 598];
  // spotlight snaps on (cone + pool + Clawd), then the club floods in from the stage
  function maskSpot(p, T) {
    const o = Ez.out(clamp(p / 0.1));
    if (o > 0) {
      beginShape(); vertex(LENS[0] - 34 * o, LENS[1] - 16); vertex(LENS[0] + 34 * o, LENS[1] + 16); vertex(POOL[0] + 260 * o, POOL[1] + 10); vertex(POOL[0] - 260 * o, POOL[1] - 10); endShape(CLOSE);
      ellipse(POOL[0], POOL[1], 560 * o, 150 * o);
      ellipse(STAGE.x, STAGE.y - 130, 360 * o, 340 * o);
    }
    const f = inv(0.2, 1, p);
    if (f > 0) {
      const R0 = 2000 * Ez.inOut(f);
      beginShape();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * TAU, r = R0 * (1 + 0.07 * Math.sin(4 * a + 0.7) + 0.04 * Math.sin(7 * a + T * 3) + 0.03 * Math.sin(13 * a));
        vertex(1340 + Math.cos(a) * r, 560 + Math.sin(a) * r);
      }
      endShape(CLOSE);
    }
  }
  const HOLD_END = W32[1];
  function clawd32(T) {
    const held = sstep(TC, TC + 0.6, T) * (1 - sstep(HOLD_END - 0.08, HOLD_END + 0.06, T));
    const rel = T > HOLD_END ? Math.exp(-(T - HOLD_END) * 5) * Math.cos((T - HOLD_END) * 18) : 0;
    const wail = sstep(W32[2], W32[2] + 0.3, T);
    const c = {
      x: STAGE.x, y: STAGE.y - 12, s: 0.78,
      sq: 1 - 0.1 * held + 0.14 * rel - 0.05 * wail,
      r: Math.sin(T * 2.2) * 0.05 * (1 - wail) + 0.08 * wail + 0.02 * Math.sin(T * 5) * wail,
      eyes: T > HOLD_END && T < W32[2] ? 'ce_sq' : 'ce_happy',
      armL: 0.35 + Math.sin(T * 11) * 0.12, armR: 0.3 + Math.sin(T * 13 + 1) * 0.12, look: [-0.4, 0.2],
    };
    c.saxR = lerp(0.06, -0.16, held) - 0.2 * wail + 0.03 * Math.sin(T * 2.2);
    return c;
  }
  function saxPose(c) { const m = clawdPt(c, 0.2 * CU, -5.0 * CU); return { x: m[0], y: m[1], r: (c.r || 0) + c.saxR, s: 0.56 }; }
  function bellAt(T) {
    const c = clawd32(T), sx = saxPose(c), cs = Math.cos(sx.r), sn = Math.sin(sx.r);
    const bx = SAX_BELL[0] * sx.s, by = SAX_BELL[1] * sx.s;
    return [sx.x + bx * cs - by * sn, sx.y + bx * sn + by * cs];
  }
  function pip32(T) {
    const blues = T > W32[2] ? Math.exp(-(T - W32[2]) * 4) : 0;
    const sob = T > HOLD_END ? 0.08 * Math.exp(-(T - HOLD_END) * 6) * Math.sin((T - HOLD_END) * 30) : 0;
    return {
      x: 600, y: 1090, s: 1.22, face: 'pf_cry', armL: 2.15 + Math.sin(T * 2.6) * 0.18, armR: 0.25,
      headR: 0.1 + Math.sin(T * 1.4) * 0.05, r: Math.sin(T * 1.4) * 0.035, sq: 1 + sob + 0.1 * blues * Math.sin((T - W32[2]) * 26),
    };
  }
  const SILS = [[860, 1012, 0.92, 's11_sil_a', 0], [1030, 1036, 1.0, 's11_sil_b', 1], [1575, 1030, 0.96, 's11_sil_b', 2], [1760, 1004, 0.86, 's11_sil_a', 3]];
  // karaoke fill across the long held "Orthogonality"
  function drawOrtho(T, age, wd, a) {
    const dim = textImg(wd.w, { ...wd.ws, fill: '#8FB2F0' });
    const img = wd.img, k = clamp(inv(TC, HOLD_END - 0.15, T));
    tint(255, 255 * clamp(a));
    image(dim.img, -dim.w / 2, -dim.h / 2);
    const cw = Math.max(1, Math.floor(img.w * k));
    image(img.img, -img.w / 2, -img.h / 2, cw, img.h, 0, 0, cw, img.h);
    clearTint();
  }
  shot({
    id: 'L32-blues', t0: TC, tin: { type: 'mask', d: 0.9, at: 0.1, mask: maskSpot },
    draw(sh) {
      const T = sh.T;
      const hold = Ez.inOut(inv(TC, 107.6, T)), lead = Ez.in(inv(107.45, TEND + 0.25, T));
      const Z = 1 + 0.04 * hold + 0.06 * lead;
      const cx = 960 + 24 * hold + 90 * lead, cy = 540 + 10 * hold + 40 * lead;
      const blues = T > W32[2] ? Math.exp(-(T - W32[2]) * 2.2) : 0;
      const kk = kick(T, 5);
      push();
      cam(cx, cy, Z);
      spr('s11_club', 960, 540, { s: 2, jit: 0 });
      // window with rain
      const WX = 330, WY = 440, wo = [WX - 240, WY - 250];
      spr('s11_win_glass', WX, WY, { jit: 0 });
      push();
      clip(() => { noStroke(); fill(0, 0); beginShape(); for (const [x, y] of ARCH(8)) vertex(x + wo[0], y + wo[1]); endShape(CLOSE); });
      stroke(withAlphaCol('#A9C8FF', 0.5)); strokeWeight(2); noFill();
      beginShape(LINES);
      for (let i = 0; i < 44; i++) {
        const sp = 1100 + R(i, 3201) * 600, len = 24 + R(i, 3202) * 34, y = wo[1] + 20 + fract(R(i, 3203) + (T * sp) / 520) * 540 - 40, x = wo[0] + 40 + R(i, 3204) * 420 + (y - wo[1]) * 0.16;
        vertex(x, y); vertex(x + len * 0.16, y + len);
      }
      endShape(); noStroke();
      for (let i = 0; i < 6; i++) { // drops sliding down the glass
        const ph = fract(R(i, 3205) + T * (0.12 + 0.08 * R(i, 3206))), y = wo[1] + 60 + Ez.inOut(ph) * 380;
        spr('drop', wo[0] + 80 + R(i, 3207) * 320, y, { s: 0.28 + 0.1 * R(i, 3208), a: 0.7 * (1 - sstep(0.85, 1, ph)), jit: 0 });
      }
      pop();
      spr('s11_win_frame', WX, WY, { jit: 0.4 });
      // neon sign and wall sconces
      const nf = 0.75 + 0.25 * Math.sin(T * 13) * Math.sin(T * 7.3) + (fract(T * 1.3) < 0.04 ? -0.5 : 0);
      glow(770, 370, 150, PAL.sky, 0.32 * nf);
      spr('s11_neon', 770, 370, { s: 0.75, jit: 0.3 });
      for (const sx of [630, 1860]) { glow(sx, 330, 90, '#9FC0FF', 0.35); disc(sx, 330, 10, '#EAF2FF'); }
      // stage
      spr('s11_backdrop', 1340, 390, { jit: 0.3 });
      spr('s11_stage', STAGE.x, STAGE.y, { jit: 0.3 });
      blendMode(ADD); ell(POOL[0], POOL[1], 250, 58, '#6E90E0', 0.22 + 0.05 * kk); ell(POOL[0], POOL[1], 170, 38, '#9FC0FF', 0.2); blendMode(BLEND);
      // the perpendicular axes paint themselves across the floor during the held note
      const kL = Ez.inOut(inv(TC + 0.25, TC + 1.05, T)), kR = Ez.inOut(inv(TC + 1.05, TC + 1.85, T));
      const aL0 = Math.atan2(AX_L[1] - AX_V[1], AX_L[0] - AX_V[0]), aR0 = Math.atan2(AX_R[1] - AX_V[1], AX_R[0] - AX_V[0]);
      const lenL = Math.hypot(AX_L[0] - AX_V[0], AX_L[1] - AX_V[1]), lenR = Math.hypot(AX_R[0] - AX_V[0], AX_R[1] - AX_V[1]);
      if (kL > 0) spr('s11_axis', AX_V[0], AX_V[1], { s: lenL / 428, r: aL0, crop: [0, 0, kL, 1], jit: 0.4 });
      if (kR > 0) spr('s11_axis', AX_V[0], AX_V[1], { s: lenR / 428, r: aR0, crop: [0, 0, kR, 1], jit: 0.4, seed: 2 });
      const kM = Ez.outBack(inv(TC + 1.9, TC + 2.15, T), 2.2);
      if (kM > 0) {
        const u = [(AX_L[0] - AX_V[0]) * 0.12 * kM, (AX_L[1] - AX_V[1]) * 0.12 * kM], v = [(AX_R[0] - AX_V[0]) * 0.12 * kM, (AX_R[1] - AX_V[1]) * 0.12 * kM];
        pline([[AX_V[0] + u[0], AX_V[1] + u[1]], [AX_V[0] + u[0] + v[0], AX_V[1] + u[1] + v[1]], [AX_V[0] + v[0], AX_V[1] + v[1]]], PAL.butter, 5);
        burst(T, TC + 1.9, AX_V[0], AX_V[1] - 10, { n: 8, names: ['sparkW', 'spark'], spd: 420, g: 0, life: 0.5, s: 0.2, even: true, seed: 3209 });
      }
      const lab = { font: 'hand', size: 50, fill: '#FFFFFF', weight: 700, stroke: PAL.ink, sw: 5 };
      if (kL > 0.5) txt('goals', lerp(AX_V[0], AX_L[0], 0.62) - 18, lerp(AX_V[1], AX_L[1], 0.62) + 38, lab, { r: aL0 + Math.PI, s: Ez.outBack(inv(TC + 0.7, TC + 0.95, T)) });
      if (kR > 0.5) txt('smarts', lerp(AX_V[0], AX_R[0], 0.62) + 18, lerp(AX_V[1], AX_R[1], 0.62) + 38, lab, { r: aR0, s: Ez.outBack(inv(TC + 1.5, TC + 1.75, T)) });
      // spotlight fixture and beam
      spr('s11_spot', LENS[0], LENS[1], { s: 0.8, r: 0.62, jit: 0.3 });
      const beamC = mixc('#9FC0FF', '#5E7CF0', blues);
      blendMode(ADD); noStroke();
      fill(withAlphaCol(beamC, 0.07)); quad(LENS[0] - 40, LENS[1] - 12, LENS[0] + 40, LENS[1] + 18, POOL[0] + 270, POOL[1] + 8, POOL[0] - 270, POOL[1] - 8);
      fill(withAlphaCol(beamC, 0.07)); quad(LENS[0] - 22, LENS[1] - 6, LENS[0] + 22, LENS[1] + 10, POOL[0] + 170, POOL[1] + 6, POOL[0] - 170, POOL[1] - 6);
      blendMode(BLEND);
      glow(LENS[0] - 10, LENS[1] + 10, 70, '#CFE3FF', 0.5);
      // Clawd and the sax
      const Cl = clawd32(T);
      shadow(Cl.x, Cl.y + 4, 130, 0.3);
      drawClawd(Cl);
      const SX = saxPose(Cl);
      spr('s11_sax', SX.x, SX.y, { s: SX.s, r: SX.r, jit: 0.5 });
      if (T > HOLD_END - 0.3) { // a mortarboard lands on "thesis"
        const fall = Ez.in(clamp(inv(HOLD_END - 0.3, HOLD_END, T)));
        const bounce = T > HOLD_END ? 16 * Math.abs(Math.sin((T - HOLD_END) * 13)) * Math.exp(-(T - HOLD_END) * 7) : 0;
        const top = clawdPt(Cl, 0.6 * CU, -8 * CU);
        const my = top[1] - (1 - fall) * 480 - bounce;
        spr('s11_mortar', top[0], my, { s: 0.66, r: (Cl.r || 0) + 0.16, jit: 0.4 });
        const sw = Math.sin(T * 7) * 0.5 * Math.exp(-Math.max(0, T - HOLD_END) * 1.5) + 0.25;
        const bx = top[0] + 1, by = my - 42;
        segLine(bx, by, bx + 40 + Math.sin(sw) * 10, by + 34 + Math.cos(sw) * 8, PAL.gold, 3);
        disc(bx + 40 + Math.sin(sw) * 10, by + 38 + Math.cos(sw) * 8, 6, PAL.gold);
      }
      // blue notes: up and out of the bell, then drifting over the audience
      for (let i = 0; i < 16; i++) {
        const tb = TC - 0.2 + i * 0.27, age = T - tb; if (age < 0 || age > 2.6) continue;
        const b = bellAt(tb), vx = 110 + R(i, 3211) * 120, side = i % 2 ? 1 : -1;
        const x = b[0] + vx * age - 58 * age * age + Math.sin(age * 2.4 + i) * 26 * side, y = b[1] - 30 - age * (150 + R(i, 3212) * 60);
        spr(i % 3 === 0 ? 's11_note_b' : 's11_note_a', x, y, { s: 0.55 + R(i, 3213) * 0.3, r: Math.sin(age * 2.5 + i) * 0.35, a: sstep(0, 0.2, age) * (1 - sstep(1.8, 2.6, age)), seed: i });
      }
      burst(T, TC, ...bellAt(TC), { n: 7, names: ['s11_note_a', 's11_note_b', 'sparkW'], spd: 520, g: -60, life: 1.1, s: 0.45, spread: 1.8, ang0: -Math.PI / 2 + 0.3, seed: 3215 });
      burst(T, HOLD_END, ...bellAt(HOLD_END), { n: 8, names: ['s11_note_a', 's11_note_b'], spd: 620, g: -80, life: 1.1, s: 0.5, spread: 2.2, ang0: -Math.PI / 2, seed: 3216 });
      if (T > W32[2] - 0.05) {
        const b = bellAt(W32[2]), age = Math.max(0, T - W32[2]);
        spr('s11_note_b', b[0] + 60 - age * 120, b[1] - 80 - age * 170, { s: Ez.outBack(clamp(age / 0.3)) * 1.15, r: Math.sin(age * 4) * 0.2, a: 1 - sstep(0.75, 1.0, age) });
        burst(T, W32[2], b[0], b[1], { n: 10, names: ['s11_note_a', 'sparkW'], spd: 700, g: -60, life: 1.0, s: 0.45, even: true, seed: 3217 });
      }
      for (let i = 0; i < 3; i++) { // blue sound rings roll off the stage on "blues"
        const g = T - W32[2] - i * 0.12; if (g < 0 || g > 0.9) continue;
        ringLine(Cl.x, Cl.y - 110, 80 + Ez.out(g / 0.9) * 520, i % 2 ? PAL.skyLt : PAL.sky, 8 * (1 - g / 0.9), 0.6 * (1 - g / 0.9));
      }
      for (let i = 0; i < 14; i++) { // dust motes in the beam
        const u = fract(R(i, 3218) + T * 0.05 * (0.5 + R(i, 3219))), x = lerp(LENS[0], POOL[0], u) + RS(i, 3220) * 220 * u, y = lerp(LENS[1], POOL[1], u) + Math.sin(T + i) * 10;
        disc(x, y, 2 + R(i, 3221) * 2, '#DCEBFF', 0.35 * Math.sin(u * Math.PI));
      }
      // audience silhouettes nod on the beat
      for (const [x, y, sc, nm, i] of SILS) spr(nm, x + Math.sin(T * 1.4 + i) * 6, y + kk * 6 * (i % 2 ? 1 : 0.6), { s: sc, r: Math.sin(T * 1.4 + i * 1.3) * 0.05, seed: i });
      // Pip weeping at the table
      const P = pip32(T);
      drawPip(P);
      const hl = pipHandL(P);
      spr('s11_tissue', hl[0], hl[1] - 10, { s: 0.6, r: Math.sin(T * 5) * 0.3 });
      const eyes = pipEyes(P);
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 4; i++) {
          const ph = fract(T * 1.25 + i * 0.25 + j * 0.13), e = eyes[j];
          spr('drop', e[0] + (j ? 12 : -12) + (j ? 1 : -1) * ph * 16, e[1] + 18 + ph * ph * 110, { s: 0.26, a: 1 - sstep(0.7, 1, ph), jit: 0 });
        }
        burst(T, W32[2], eyes[j][0], eyes[j][1] + 10, { n: 9, names: ['drop'], spd: 620, g: 1400, life: 0.8, s: 0.34, spread: 1.2, ang0: -Math.PI / 2 + (j ? 0.75 : -0.75), seed: 3230 + j * 20 });
      }
      spr('s11_table', 600, 972, { jit: 0.3 });
      const fl = 1 + 0.12 * Math.sin(T * 17) + 0.08 * Math.sin(T * 29);
      glow(484, 914, 70, PAL.butter, 0.45 * fl);
      spr('flame', 484, 926, { s: 0.28 * fl, jit: 0.2 });
      pop();
      if (blues > 0.01) { noStroke(); fill(withAlphaCol(PAL.blue, 0.22 * blues)); rect(-10, -10, W + 20, H + 20); }
      drawRope(T, { below: true, tint: [168, 172, 228] });
      drawSparkFx(T, { smoke: '#B8C6F0', smokeA: 0.2 });
    },
  });
  lyr(32, { y: (T) => 150 + 260 * Ez.inOut(inv(TEND - 0.3, TEND + 0.1, T)), words: { 0: { wave: 3, draw: drawOrtho }, 1: { fill: PAL.skyLt, anim: 'drop' }, 2: { fill: PAL.sky, anim: 'zoom', grow: 0.12 } } });
})();

// s01.js - Title poster and date night (poster rest state through 9.06 s). See docs/STORYBOARD.md "S01".
// Shots: poster (T < 0.9) > L0-eyes (0.9, bleed) > L1-circuits (5.64, continuous set). Lead-out: mint traces from the right.
(() => {
  // ================= local paint helpers =================
  // Brush fills composite against white paper, so their bleed turns transparent pixels into an opaque white rim.
  // That rim is house style for shared sprites, but s01's props sit on dark grounds and must blend cleanly, so each
  // is trimmed back to its silhouette: flush() commits the pending brush op first (p5.brush only composites an op
  // when the next one starts), then trimTo() / trimUnion() erase everything outside the listed polygons.
  function flush() { brush.set('pen', '#010203', 0.5); brush.line(-400, -400, -399, -400); brush.noStroke(); brush.noFill(); }
  const areaOf = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; };
  function grow(p, d) { // offset a simple polygon outward by d px
    const sg = areaOf(p) > 0 ? 1 : -1, n = p.length, out = [];
    for (let i = 0; i < n; i++) {
      const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n];
      const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, l2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1;
      const n1x = (sg * (b[1] - a[1])) / l1, n1y = (-sg * (b[0] - a[0])) / l1, n2x = (sg * (c[1] - b[1])) / l2, n2y = (-sg * (c[0] - b[0])) / l2;
      let mx = n1x + n2x, my = n1y + n2y; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
      const k = d / Math.max(0.35, mx * n1x + my * n1y);
      out.push([b[0] + mx * k, b[1] + my * k]);
    }
    return out;
  }
  function trimTo(polys, w, h) {
    erase(); noStroke(); fill(255);
    beginShape(); vertex(-20, -20); vertex(w + 20, -20); vertex(w + 20, h + 20); vertex(-20, h + 20);
    for (const p of polys) { beginContour(); for (const v of (areaOf(p) > 0 ? p.slice().reverse() : p)) vertex(v[0], v[1]); endContour(); }
    endShape(CLOSE); noErase();
  }
  // union trim for sprites whose parts overlap: erase every scanline gap outside all polygons
  function trimUnion(polys, w, h, step = 1) {
    erase(); noStroke(); fill(255);
    for (let y = 0; y < h; y += step) {
      const yc = y + step / 2, iv = [];
      for (const p of polys) {
        const xs = [];
        for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0])); }
        xs.sort((m, n) => m - n);
        for (let i = 0; i + 1 < xs.length; i += 2) iv.push([xs[i], xs[i + 1]]);
      }
      iv.sort((m, n) => m[0] - n[0]);
      let x = -4;
      for (const [a, b] of iv) { if (a > x) rect(x, y, a - x, step); x = Math.max(x, b); }
      if (x < w + 4) rect(x, y, w + 4 - x, step);
    }
    noErase();
  }
  const eraseIn = (polys) => { erase(); noStroke(); fill(255); for (const p of polys) { beginShape(); for (const v of p) vertex(v[0], v[1]); endShape(CLOSE); } noErase(); };
  const pnt = (pts, c, o) => { paint(pts, c, o); flush(); };
  // clip a convex polygon to an axis-aligned box (Sutherland-Hodgman)
  function clipBox(poly, x0, y0, x1, y1) {
    let out = poly;
    const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
      [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
      [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
      [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]]];
    for (const [inside, cut] of edges) {
      const src = out; out = [];
      for (let i = 0; i < src.length; i++) {
        const a = src[(i - 1 + src.length) % src.length], b = src[i];
        if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
      }
    }
    return out;
  }
  // arch (semicircle top) polygon
  function archPts(x0, y0, x1, y1, n = 28) {
    const r = (x1 - x0) / 2, cx = x0 + r, cy = y0 + r, pts = [[x0, y1]];
    for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    pts.push([x1, y1]);
    return pts;
  }
  // crescent: circle (cx,cy,r1) minus circle offset by (dx,dy) with radius r2
  function crescentPts(cx, cy, r1, dx, dy, r2, n = 36) {
    const d = Math.hypot(dx, dy), tu = Math.atan2(dy, dx);
    const phi = Math.acos(clamp((r1 * r1 - r2 * r2 + d * d) / (2 * d) / r1, -1, 1));
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = tu + phi + (i / n) * (TAU - 2 * phi); pts.push([cx + Math.cos(t) * r1, cy + Math.sin(t) * r1]); }
    const pS = pts[0], pE = pts[n];
    const aE = Math.atan2(pE[1] - cy - dy, pE[0] - cx - dx), aS = Math.atan2(pS[1] - cy - dy, pS[0] - cx - dx);
    let dA = aS - aE; while (dA > Math.PI) dA -= TAU; while (dA < -Math.PI) dA += TAU;
    const alt = dA > 0 ? dA - TAU : dA + TAU, tgt = tu + Math.PI;
    const dist = (x) => Math.abs(Math.atan2(Math.sin(x - tgt), Math.cos(x - tgt)));
    const use = dist(aE + dA / 2) < dist(aE + alt / 2) ? dA : alt;
    for (let i = 1; i < n; i++) { const t = aE + (use * i) / n; pts.push([cx + dx + Math.cos(t) * r2, cy + dy + Math.sin(t) * r2]); }
    return pts;
  }
  // fast draw helpers with cached colours (disc/segLine/glow parse colour strings on every call)
  const RGB = {};
  const rgbOf = (h) => RGB[h] || (RGB[h] = hexToRgb(h));
  const fa = (h, a = 1) => { const c = rgbOf(h); fill(c[0], c[1], c[2], 255 * a); };
  function dc(x, y, r, h, a = 1) { if (a <= 0) return; noStroke(); fa(h, a); circle(x, y, r * 2); }
  function ln(x1, y1, x2, y2, h, w, a = 1) { if (a <= 0) return; const c = rgbOf(h); stroke(c[0], c[1], c[2], 255 * a); strokeWeight(w); line(x1, y1, x2, y2); noStroke(); }
  function glw(x, y, r, h, a = 0.5) { if (a <= 0) return; blendMode(ADD); noStroke(); const c = rgbOf(h); for (let i = 3; i >= 1; i--) { fill(c[0], c[1], c[2], 255 * a * 0.07 * (4 - i)); circle(x, y, r * i); } blendMode(BLEND); }
  // soft round light: one baked white radial falloff drawn with a colour tint (smooth, and cheap per call)
  defSprite('s01_soft', 128, 128, () => { noStroke(); for (let k = 40; k >= 1; k--) { fill(255, 255, 255, 255 * 0.045); circle(64, 64, k * 3.1); } });
  function soft(x, y, r, h, a, sy = 1) {
    if (a <= 0 || !SPR.s01_soft) return;
    const c = rgbOf(h);
    push(); translate(x, y); tint(c[0], c[1], c[2], 255 * Math.min(1, a)); image(SPR.s01_soft.fbs[0], -r, -r * sy, 2 * r, 2 * r * sy); pop();
  }
  const shadow = (x, y, rx, a) => soft(x, y, rx * 1.15, PAL.ink, a * 0.8, 0.26);
  const heartShape = (x, y, s, c, a = 1) => { noStroke(); fill(withAlphaCol(c, a)); beginShape(); for (const p of heartPts(x, y, s, 28)) vertex(p[0], p[1]); endShape(CLOSE); };
  const w2s = (p, cs) => [W / 2 + (p[0] - cs.c[0]) * cs.z, H / 2 + (p[1] - cs.c[1]) * cs.z];
  // same transform the clawd() rig applies, so overlays land on the body (body-local: body centre (0,-5CU), 8x6 CU)
  function clawdTf(x, y, s, o) { const sq = o.sq ?? 1; translate(x, y - (o.hop || 0)); if (o.r) rotate(o.r); scale(s * sq, s / sq); }
  // Pip's right hand (screen right) in world space for a given armR
  const pipHand = (x, y, s, armR, hop = 0) => [x + s * (56 + 82 * Math.sin(armR)), y - hop + s * (-138 + 82 * Math.cos(armR))];

  // ================= POSTER sprites =================
  defSprite('s01_rays', 700, 700, () => {
    const c = 350, body = ellPts(c, c, 348, 348, 90);
    flat(body, '#FFF3E2');
    const N = 16;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * TAU, a1 = a0 + (0.5 / N) * TAU, ray = [[c, c], [c + Math.cos(a0) * 440, c + Math.sin(a0) * 440], [c + Math.cos(a1) * 440, c + Math.sin(a1) * 440]];
      flat(ray, i % 2 ? '#FFDDE4' : '#FFEDC2', 0.85);
    }
    wc(PAL.pinkLt, 70, 0.02, 0.6, 0.3); brush.polygon(scalePts(body, c, c, 0.97));
    for (const [a, cc] of [[0.5, PAL.lilacLt], [3.64, PAL.skyLt]]) { wc(cc, 90, 0.25, 0.55, 0.4); brush.circle(c + Math.cos(a) * 310, c + Math.sin(a) * 310, 120); }
    wc('#FFFFFF', 150, 0.3, 0.35, 0.2); brush.circle(c, c, 70);
    flush(); trimTo([body], 700, 700);
  });
  defSprite('s01_swash', 900, 170, () => {
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push([40 + i * 41, 42 + Math.sin(i * 0.9) * 6 + random() * 6]);
    for (let i = 20; i >= 0; i--) pts.push([30 + i * 41 + (i === 20 ? 30 : 0), 128 + Math.sin(i * 0.7) * 6 + random() * 6]);
    flat(pts, '#FFE89A'); wc(PAL.butter, 130, 0.04, 0.6, 0.7); brush.polygon(pts);
    wc('#FFFFFF', 90, 0.1, 0.4, 0.3); brush.rect(90, 55, 500, 20);
    flush(); trimTo([pts], 900, 170);
  });
  const RIB = (() => { // ribbon banner: main band + two tails
    const band = [], n = 16;
    for (let i = 0; i <= n; i++) { const x = 120 + (i / n) * 860; band.push([x, 40 + Math.pow((x - 550) / 430, 2) * 26]); }
    for (let i = n; i >= 0; i--) { const x = 120 + (i / n) * 860; band.push([x, 150 + Math.pow((x - 550) / 430, 2) * 26]); }
    const tl = [[14, 92], [124, 84], [124, 186], [14, 196], [56, 142]], tr = [[1086, 92], [976, 84], [976, 186], [1086, 196], [1044, 142]];
    return { band, tl, tr };
  })();
  defSprite('s01_ribbon', 1100, 230, () => {
    pnt(RIB.tl, dark(PAL.pink, 0.12), { baseC: mixc(PAL.pink, PAL.pinkLt, 0.3), lw: 2 });
    pnt(RIB.tr, dark(PAL.pink, 0.12), { baseC: mixc(PAL.pink, PAL.pinkLt, 0.3), lw: 2 });
    pnt(RIB.band, PAL.pink, { baseC: '#FFB5CF', lw: 2.2 });
    wc('#FFFFFF', 70, 0.08, 0.4, 0.3); brush.rect(190, 58, 700, 16);
    pen(PAL.white, 1.6, 'pen'); brush.spline(RIB.band.slice(0, 17).map(([x, y]) => [x, y + 12]), 0.5); brush.noStroke();
    flush(); trimUnion([grow(RIB.band, 3), grow(RIB.tl, 3), grow(RIB.tr, 3)], 1100, 230, 2);
  });
  defSprite('s01_bouquet', 220, 280, () => {
    const cone = [[70, 140], [170, 130], [118, 270], [104, 272]], parts = [cone];
    for (const [x, y, a] of [[70, 118, -0.6], [160, 104, 0.6]]) { const lf = [[x, y], [x + Math.cos(a - 1.2) * 60, y + Math.sin(a - 1.2) * 40 - 30], [x + Math.cos(a) * 50, y - 60]]; parts.push(lf); flat(lf, '#7ED79A'); pen(PAL.ink, 1.4, '2B'); brush.polygon(lf); }
    flush();
    for (const [x, y, r, c] of [[80, 96, 34, PAL.red], [146, 84, 30, PAL.butter], [114, 58, 32, PAL.pink], [168, 134, 22, PAL.sky]]) {
      const fl = ellPts(x, y, r, r * 0.92, 22, 0.12); parts.push(fl);
      pnt(fl, c, { baseC: lite(c, 0.25), lw: 1.6 });
      flat(ellPts(x, y, r * 0.35, r * 0.35, 12), dark(c, 0.2), 0.6);
    }
    pnt(cone, PAL.cream, { baseC: '#FFF8E8', lw: 2 });
    pen(PAL.pink, 3, 'marker'); brush.line(92, 150, 112, 262); brush.line(140, 146, 116, 262); brush.noStroke();
    pnt(rrPts(96, 190, 40, 22, 8), PAL.coral, { baseC: PAL.coralLt, lw: 1.4 });
    flush(); trimUnion(parts.map((p) => grow(p, 3)), 220, 280, 2);
  }, { ax: 0.5, ay: 0.95 });

  // ================= DATE SET sprites =================
  defSprite('s01_wall', 1000, 580, () => {
    flat([[-20, -20], [1020, -20], [1020, 600], [-20, 600]], '#4A3474');
    wash(-40, -40, 1080, 260, '#34275E', 150, 0.2);
    wash(-40, 330, 1080, 300, '#3E2C63', 180, 0.15);
    for (const [x, y, r, c, a] of [[500, 330, 320, '#7A4E8C', 80], [480, 380, 180, '#B06E86', 60], [860, 120, 200, '#5B4190', 60]]) { wc(c, a, 0.4, 0.5, 0.15); brush.circle(x, y, r); }
    // starry wallpaper lattice
    for (let j = 0; j < 7; j++) for (let i = 0; i < 12; i++) {
      const x = i * 90 + (j % 2) * 45 + 10, y = j * 48 + 22;
      if (y > 320) continue;
      flat(starPts(x, y, 7, 2.4, 4), PAL.butterLt, 0.22);
    }
    // chair rail + wainscot panels
    wash(-40, 322, 1080, 14, '#2B1F4C', 170, 0.05);
    for (let i = 0; i < 9; i++) { pen('#2B1F4C', 1.6, 'pen'); brush.rect(20 + i * 112, 356, 90, 110); }
    brush.noStroke(); flush();
  });
  const WIN_OUT = archPts(30, 30, 410, 500), WIN_IN = archPts(58, 58, 382, 474);
  const WIN_SILL = rrPts(8, 504, 424, 38, 10);
  const WIN_PANES = [clipBox(WIN_IN, 0, 0, 213, 293), clipBox(WIN_IN, 227, 0, 440, 293), clipBox(WIN_IN, 0, 307, 213, 560), clipBox(WIN_IN, 227, 307, 440, 560)];
  defSprite('s01_win_glass', 440, 560, () => {
    const g = grow(WIN_IN, 6);
    flat(g, '#1E2A62');
    wash(40, 40, 360, 200, '#16204E', 160, 0.2);
    wash(40, 300, 360, 200, '#3A4A92', 150, 0.2);
    blob(220, 470, 160, '#6A5AA8', 110, 0.4);
    // little skyline
    let x = 50;
    while (x < 390) { const bw = 34 + random() * 36, bh = 40 + random() * 70; flat(rrPts(x, 480 - bh, bw, bh + 10, 3), '#141A40'); for (let k = 0; k < 4; k++) if (random() < 0.7) flat(rrPts(x + 6 + random() * (bw - 14), 480 - bh + 8 + random() * (bh - 20), 6, 7, 1), PAL.butter, 0.85); x += bw + 4; }
    flush(); trimTo([g], 440, 560);
  });
  defSprite('s01_win_frame', 440, 560, () => {
    flat(WIN_OUT, '#C99A73'); wc(PAL.brownLt, 150, 0.03, 0.6, 0.7); brush.polygon(WIN_OUT);
    wc(PAL.brown, 90, 0.05, 0.5, 0.5); brush.polygon(WIN_IN);
    pnt(rrPts(206, 40, 28, 450, 6), PAL.brownLt, { baseC: '#D9B08E', lw: 1.6 });
    pnt(rrPts(40, 286, 360, 28, 6), PAL.brownLt, { baseC: '#D9B08E', lw: 1.6 });
    pnt(WIN_SILL, PAL.brown, { baseC: '#B88A68', lw: 2 });
    pen(PAL.ink, 2.2, '2B'); brush.polygon(WIN_OUT); brush.polygon(WIN_IN); brush.noStroke();
    flush(); trimUnion([grow(WIN_OUT, 3), grow(WIN_SILL, 3)], 440, 560, 2); eraseIn(WIN_PANES.map((p) => grow(p, -1)));
  });
  defSprite('s01_moon', 170, 170, () => {
    const m = crescentPts(85, 85, 64, 34, -22, 56);
    pnt(m, PAL.butter, { baseC: '#FFE68A', lw: 1.8 });
    strokePath([[46, 88], [54, 96], [62, 90]], PAL.ink, 2.2, 'pen', 0.5);
    flat(ellPts(52, 108, 8, 5, 12), PAL.pink, 0.7);
    flush(); trimTo([grow(m, 3)], 170, 170);
  });
  const DRAPE = (() => { const p = []; for (let i = 0; i <= 12; i++) { const y = 10 + i * 48; const pinch = Math.exp(-Math.pow((y - 330) / 90, 2)); p.push([150 - pinch * 62 + Math.sin(i * 1.3) * 4, y]); } p.push([150 - 30, 600], [20, 600]); for (let i = 12; i >= 0; i--) { const y = 10 + i * 48; p.push([20 + Math.sin(i * 1.1) * 3, y]); } return p; })();
  defSprite('s01_drape', 180, 620, () => {
    flat(DRAPE, '#E98AB0'); wc(PAL.pink, 150, 0.03, 0.6, 0.7); brush.polygon(DRAPE);
    for (let i = 0; i < 4; i++) { pen(dark(PAL.pink, 0.25), 2, 'pen'); brush.spline([[40 + i * 26, 20], [48 + i * 16, 330], [36 + i * 22, 590]], 0.5); }
    brush.noStroke();
    pnt(rrPts(34, 312, 100, 30, 12), PAL.butter, { baseC: '#FFE17A', lw: 1.6 });
    pen(PAL.ink, 2, '2B'); brush.polygon(DRAPE); brush.noStroke();
    flush(); trimTo([grow(DRAPE, 3)], 180, 620);
  }, { ax: 0.5, ay: 0 });
  defSprite('s01_clock', 200, 200, () => {
    const rim = ellPts(100, 100, 84, 84, 40);
    pnt(rim, PAL.mint, { baseC: '#A8E8D0', lw: 2.2 });
    pnt(ellPts(100, 100, 68, 68, 40), PAL.cream, { baseC: '#FFFBF0', lw: 1.6 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; flat(ellPts(100 + Math.cos(a) * 54, 100 + Math.sin(a) * 54, i % 3 ? 3 : 6, i % 3 ? 3 : 6, 10), PAL.ink); }
    flat(heartPts(100, 130, 12), PAL.pink, 0.8);
    flush(); trimTo([grow(rim, 3)], 200, 200);
  });
  // table: top ellipse centre at (750,110) -> anchor 0.25
  const TAB_TOP = ellPts(750, 110, 700, 92, 72);
  const TAB_SKIRT = (() => { const p = [[52, 112]]; for (let i = 1; i < 36; i++) { const a = Math.PI - (i / 36) * Math.PI; p.push([750 + Math.cos(a) * 700, 110 + Math.sin(a) * 92]); } p.push([1450, 112], [1478, 400]); for (let i = 0; i <= 14; i++) { const x = 1478 - (i / 14) * 1456; p.push([x, 408 + (i % 2 ? 22 : 0)]); } p.push([22, 400]); return p; })();
  const TAB_ALL = (() => { const p = []; for (let i = 0; i <= 36; i++) { const a = Math.PI + (i / 36) * Math.PI; p.push([750 + Math.cos(a) * 700, 110 + Math.sin(a) * 92]); } p.push([1478, 400]); for (let i = 0; i <= 14; i++) { const x = 1478 - (i / 14) * 1456; p.push([x, 408 + (i % 2 ? 22 : 0)]); } p.push([22, 400]); return p; })();
  defSprite('s01_table', 1500, 440, () => {
    flat(TAB_SKIRT, '#FFE9F1');
    // gingham skirt
    for (let x = 30; x < 1480; x += 64) flat([[x, 150], [x + 30, 150], [x + 32, 430], [x + 2, 430]], PAL.pink, 0.26);
    for (let y = 180; y < 430; y += 60) flat([[20, y], [1480, y], [1480, y + 28], [20, y + 28]], PAL.pink, 0.26);
    wc(PAL.pinkLt, 110, 0.03, 0.55, 0.6); brush.polygon(TAB_SKIRT);
    wc('#C4789C', 60, 0.05, 0.5, 0.5); brush.rect(30, 170, 1440, 60);
    pen(PAL.ink, 2.2, '2B'); brush.polygon(TAB_SKIRT); brush.noStroke(); flush();
    flat(TAB_TOP, '#FFF6F9');
    wc(PAL.pinkLt, 90, 0.03, 0.5, 0.5); brush.polygon(scalePts(TAB_TOP, 750, 110, 0.985));
    wc('#FFFFFF', 120, 0.1, 0.4, 0.3); brush.circle(750, 96, 180);
    pen(PAL.ink, 2.2, '2B'); brush.polygon(TAB_TOP); brush.noStroke();
    pen(PAL.pink, 3, 'marker'); for (let i = 0; i < 44; i++) { const a = Math.PI * (i / 43); brush.circle(750 + Math.cos(a) * 700, 110 + Math.sin(a) * 92 + 10, 5); } brush.noStroke();
    flush(); trimTo([grow(TAB_ALL, 3)], 1500, 440);
  }, { ay: 0.25 });
  defSprite('s01_candle', 110, 230, () => {
    const dish = ellPts(55, 206, 46, 15, 28);
    const candleAll = [[38, 54], [72, 54]]; for (let i = 0; i <= 24; i++) { const t = -1.19 + (i / 24) * (Math.PI + 2.38); candleAll.push([55 + Math.cos(t) * 46, 206 + Math.sin(t) * 15]); }
    pnt(dish, PAL.gold, { baseC: '#FFD75A', lw: 1.8 });
    const body = [[38, 58], [72, 58], [72, 200], [38, 200]];
    pnt(rrPtsPoly(body, 6), PAL.cream, { baseC: '#FFFBEF', lw: 1.8 });
    pnt([[60, 58], [72, 58], [72, 92], [67, 100], [63, 88]], '#FFFFFF', { baseC: '#FFFFFF', lw: 1.2 });
    wc(PAL.butterLt, 110, 0.05, 0.4, 0.4); brush.rect(40, 60, 14, 130); flush();
    pen(PAL.ink, 2.2, 'pen'); brush.line(55, 58, 56, 40); brush.noStroke();
    flush(); trimTo([grow(candleAll, 3)], 110, 230);
  }, { ay: 0.94 });
  defSprite('s01_cup', 170, 140, () => {
    const cup = [[24, 36], [128, 36], [118, 104], [104, 122], [48, 122], [34, 104]];
    const handle = ellPts(138, 70, 23, 25, 28);
    flat(handle, '#8EDDC0');
    pen(PAL.ink, 2.2, '2B'); brush.circle(138, 70, 23); brush.noStroke(); flush();
    pnt(cup, PAL.mint, { baseC: '#A8E8D0', lw: 2.2 });
    pnt(ellPts(76, 38, 50, 9, 28), '#9C6A4E', { baseC: '#B58467', lw: 1.4 });
    flat(heartPts(76, 80, 17), PAL.pink, 0.9);
    flush();
    erase(); flat(ellPts(137, 70, 10, 12, 16), '#000000'); noErase();
    trimUnion([grow(cup, 3), grow(handle, 3)], 170, 140, 2);
  }, { v: 2, ax: 0.45, ay: 0.87 });
  defSprite('s01_saucer', 200, 60, () => {
    const s = ellPts(100, 30, 88, 18, 36);
    pnt(s, '#FFFFFF', { baseC: '#FFFFFF', lw: 1.8 });
    pen(PAL.pink, 3, 'marker'); brush.spline(ellPts(100, 30, 74, 13, 24).slice(2, 11), 0.5); brush.noStroke();
    flush(); trimTo([grow(s, 3)], 200, 60);
  });
  defSprite('s01_vase', 170, 320, () => {
    strokePath([[86, 190], [82, 130], [88, 70]], PAL.green, 5, 'marker', 0.5); flush();
    const leaf = [[86, 132], [132, 110], [104, 146]], leaf2 = [[84, 160], [40, 144], [70, 172]];
    pnt(leaf, PAL.green, { baseC: '#86D9A8', lw: 1.3 }); pnt(leaf2, PAL.green, { baseC: '#86D9A8', lw: 1.3 });
    const rose = ellPts(88, 60, 34, 30, 22, 0.1);
    pnt(rose, PAL.red, { baseC: '#FF6A7E', lw: 1.8 });
    strokePath([[72, 58], [86, 46], [102, 58], [90, 70], [80, 60]], PAL.coralDk, 2.2, 'pen', 0.6); flush();
    const vase = [[64, 180], [110, 180], [104, 204], [128, 280], [108, 306], [66, 306], [46, 280], [70, 204]];
    pnt(vase, PAL.sky, { baseC: '#BFE4FF', lw: 2 });
    wc('#FFFFFF', 110, 0.05, 0.4, 0.3); brush.rect(58, 230, 10, 50); flush();
    trimUnion([grow(vase, 3), grow(rose, 3), grow(leaf, 3), grow(leaf2, 3), [[79, 70], [93, 70], [93, 186], [79, 186]]], 170, 320, 2);
  }, { ay: 0.95 });
  defSprite('s01_bang', 150, 320, () => {
    const bar = [[40, 20], [118, 26], [92, 206], [64, 204]], dot = ellPts(78, 262, 30, 28, 24);
    pnt(bar, PAL.red, { baseC: '#FF6070', lw: 2.6 });
    pnt(dot, PAL.red, { baseC: '#FF6070', lw: 2.6 });
    flat([[52, 34], [70, 36], [66, 110], [58, 110]], '#FFFFFF', 0.7);
    flush(); trimTo([grow(bar, 3), grow(dot, 3)], 150, 320);
  });

  // ================= ECU sprites (painted big so the close-up stays crisp) =================
  const FACE_BODY = rrPts(40, 35, 920, 690, 18, 3);
  defSprite('s01_face_big', 1000, 760, () => {
    flat(FACE_BODY, '#F46A52');
    wc(PAL.coral, 150, 0.03, 0.6, 0.6); brush.polygon(scalePts(FACE_BODY, 500, 380, 0.995));
    blob(300, 230, 230, '#FF8C74', 80, 0.4);
    blob(760, 600, 260, PAL.coralDk, 60, 0.4);
    wc('#FFE3D6', 70, 0.08, 0.4, 0.3); brush.rect(92, 75, 259, 86);
    wc(PAL.coralDk, 70, 0.04, 0.6, 0.5); brush.rect(57, 593, 885, 109);
    flush();
    pen(PAL.ink, 2.4, '2B'); brush.polygon(grow(FACE_BODY, -4)); brush.noStroke();
    flush(); trimTo([grow(FACE_BODY, 1)], 1000, 760);
  });
  const EYE_SQ = rrPts(30, 30, 300, 300, 12, 3);
  defSprite('s01_eye_big', 360, 360, () => {
    flat(EYE_SQ, '#140E2C');
    wc('#241A52', 150, 0.03, 0.6, 0.3); brush.rect(48, 48, 264, 140);
    wc('#4A2F7E', 110, 0.1, 0.5, 0.3); brush.circle(190, 290, 110);
    wc('#7A3F8A', 70, 0.1, 0.5, 0.3); brush.circle(250, 300, 60);
    for (let i = 0; i < 16; i++) flat(ellPts(50 + random() * 260, 50 + random() * 200, 1.6 + random() * 2, 1.6 + random() * 2, 8), '#FFFFFF', 0.5 + random() * 0.4);
    flush(); trimTo([grow(EYE_SQ, 1)], 360, 360);
  }, { v: 2 });
  // x-ray body panel, painted at 1.6x (64 px per Clawd unit)
  const XU = 64, XM = 40;
  const XTR = [ // circuit traces in body units (0..8 x 0..6); pulses run outward from the heart core
    [[3.45, 3.45], [2.5, 3.45], [2.1, 3.05], [0.45, 3.05]], [[3.5, 3.95], [2.6, 3.95], [2.2, 4.35], [1.05, 4.35], [0.6, 4.8]],
    [[4.55, 3.45], [5.5, 3.45], [5.9, 3.05], [7.55, 3.05]], [[4.5, 3.95], [5.4, 3.95], [5.8, 4.35], [6.95, 4.35], [7.4, 4.8]],
    [[4.15, 2.75], [4.15, 1.6], [4.55, 1.2], [5.3, 1.2]], [[3.85, 2.75], [3.85, 0.95], [3.45, 0.55], [2.4, 0.55]],
    [[3.8, 4.5], [3.8, 5.45], [3.1, 5.45]], [[4.2, 4.5], [4.2, 5.05], [5.0, 5.05], [5.45, 5.5]],
  ];
  const XHEART = [4, 3.62];
  defSprite('s01_xray', 8 * XU + 2 * XM, 6 * XU + 2 * XM, () => {
    const body = rrPts(XM, XM, 8 * XU, 6 * XU, 12, 3);
    flat(body, '#18294A');
    wc('#223C66', 150, 0.03, 0.6, 0.5); brush.polygon(scalePts(body, XM + 4 * XU, XM + 3 * XU, 0.99));
    blob(XM + 4 * XU, XM + 3.6 * XU, 160, '#2E5A7A', 80, 0.4);
    flush();
    for (let i = 1; i < 8; i++) segLine(XM + i * XU, XM + 6, XM + i * XU, XM + 6 * XU - 6, PAL.mint, 1, 0.12);
    for (let j = 1; j < 6; j++) segLine(XM + 6, XM + j * XU, XM + 8 * XU - 6, XM + j * XU, PAL.mint, 1, 0.12);
    const P = (u, v) => [XM + u * XU, XM + v * XU];
    noFill();
    for (const [c, w0] of [['#0E1830', 13], [PAL.mint, 7], [PAL.mintLt, 2.5]]) { stroke(c); strokeWeight(w0); for (const tr of XTR) { beginShape(); for (const [u, v] of tr) vertex(...P(u, v)); endShape(); } }
    noStroke();
    for (const tr of XTR) { const e = P(...tr[tr.length - 1]); flat(ellPts(e[0], e[1], 13, 13, 16), PAL.butter); flat(ellPts(e[0], e[1], 5, 5, 10), '#18294A'); }
    // two little chips
    for (const [u, v] of [[1.3, 5.3], [6.7, 5.3]]) { pnt(rrPts(XM + (u - 0.45) * XU, XM + (v - 0.3) * XU, 0.9 * XU, 0.6 * XU, 6), '#101A30', { baseC: '#1C2A48', lw: 1.4, lc: PAL.mint }); for (let k = 0; k < 4; k++) segLine(XM + (u - 0.33 + k * 0.22) * XU, XM + (v - 0.42) * XU, XM + (u - 0.33 + k * 0.22) * XU, XM + (v - 0.3) * XU, PAL.mint, 3, 0.9); }
    // heart core
    const h = heartPts(XM + XHEART[0] * XU, XM + XHEART[1] * XU, 0.62 * XU);
    pnt(h, PAL.pink, { baseC: '#FF9CC2', lw: 2, lc: '#FFFFFF' });
    flat(ellPts(XM + 3.8 * XU, XM + 3.35 * XU, 10, 7, 12), '#FFFFFF', 0.85);
    pen(PAL.mint, 2.4, '2B'); brush.polygon(body); brush.noStroke();
    flush(); trimTo([grow(body, 3)], 8 * XU + 2 * XM, 6 * XU + 2 * XM);
  });

  // ================= staging =================
  const CL = { x: 1330, y: 900, s: 1.25 }; // Clawd's seat
  const PP = { x: 600, y: 872, s: 1.2 };   // Pip's seat
  const FACE = [CL.x, CL.y - 6.5 * CU * CL.s];
  const WIN = { x: 290, y: 380 };
  const LIGHT_COLS = [PAL.butter, PAL.pink, PAL.mint, PAL.sky, PAL.coralLt];
  const FW_COLS = [PAL.butter, PAL.pink, PAL.mint, PAL.sky, '#FFB199'];
  const camOn = (cs) => cam(cs.c[0], cs.c[1], cs.z, cs.r || 0);
  const focus = (f, sp, z, r = 0) => ({ c: [f[0] - (sp[0] - W / 2) / z, f[1] - (sp[1] - H / 2) / z], z, r });

  function lightsY(x) { const u = ((((x % 960) + 960) % 960) / 480) - 1; return 52 + 64 * (1 - u * u); }
  // string lights are baked into sprites (wire + bulbs lit/unlit, and one glow layer per alternating bulb group)
  function lightsPaint(mode) {
    translate(40, 0);
    if (mode === 'on' || mode === 'off') {
      noFill(); stroke(PAL.ink); strokeWeight(3); beginShape(); for (let x = -40; x <= W + 40; x += 20) vertex(x, lightsY(x)); endShape(); noStroke();
      for (let i = 0; i < 28; i++) {
        const x = i * 70 + 20, y = lightsY(x) + 12, c = LIGHT_COLS[i % 5];
        fill(PAL.ink); rect(x - 6, y - 8, 12, 10, 2);
        fill(mode === 'on' ? c : mixc(c, PAL.night, 0.55)); ellipse(x, y + 10, 17, 23);
        fa('#FFFFFF', mode === 'on' ? 0.85 : 0.4); circle(x - 3, y + 5, 7);
      }
    } else {
      noStroke();
      for (let i = mode; i < 28; i += 2) { const x = i * 70 + 20, y = lightsY(x) + 22, c = rgbOf(LIGHT_COLS[i % 5]); for (let k = 12; k >= 1; k--) { fill(c[0], c[1], c[2], 255 * 0.045); circle(x, y, 11 * k); } }
    }
  }
  for (const m of ['on', 'off', 0, 1]) defSprite('s01_lights_' + m, 2000, 200, () => lightsPaint(m), { ax: 0, ay: 0 });
  function stringLights(T, on = 1, glowA = 1) { // on: fraction of the string switched on, left to right
    const b = beatAt(T), k = kick(T, 4), par = ((b.i % 2) + 2) % 2, crop = on < 1 ? [0, 0, on, 1] : undefined;
    if (on < 1) spr('s01_lights_off', -40, 0, { jit: 0 });
    if (on <= 0) return;
    for (const g of [0, 1]) spr('s01_lights_' + g, -40, 0, { jit: 0, a: glowA * (0.6 + 0.4 * (par === g ? k : 0)), crop });
    spr('s01_lights_on', -40, 0, { jit: 0, crop });
  }
  function shootingStar(T, t0, x0, y0, x1, y1) {
    const u = (T - t0) / 0.55; if (u < 0 || u > 1.3) return;
    const e = Ez.out(clamp(u)), hx = lerp(x0, x1, e), hy = lerp(y0, y1, e), fade = 1 - inv(0.8, 1.3, u);
    for (let i = 0; i < 8; i++) { const k0 = Math.max(0, e - 0.04 * (i + 1)), k1 = Math.max(0, e - 0.04 * i); ln(lerp(x0, x1, k0), lerp(y0, y1, k0), lerp(x0, x1, k1), lerp(y0, y1, k1), '#FFFFFF', 5 - i * 0.5, (0.9 - i * 0.1) * fade); }
    spr('sparkW', hx, hy, { s: 0.22 * fade, r: T * 6 });
  }
  function windowView(T, o = {}) {
    for (const sd of [-1, 1]) spr('s01_drape', WIN.x + sd * 238, 70, { flip: sd > 0, r: Math.sin(T * 1.3 + sd) * 0.012, jit: 0.3 });
    spr('s01_win_glass', WIN.x, WIN.y, { jit: 0 });
    push();
    clip(() => { noStroke(); fill(0, 0); beginShape(); for (const v of WIN_IN) vertex(WIN.x - 220 + v[0], WIN.y - 280 + v[1]); endShape(CLOSE); });
    for (let i = 0; i < 16; i++) { const x = WIN.x - 150 + R(i, 41) * 300, y = WIN.y - 230 + R(i, 42) * 260; const tw = 0.5 + 0.5 * Math.sin(T * 3 + i * 2.1); dc(x, y, 2 + 2.5 * tw, '#FFFFFF', 0.35 + 0.6 * tw); }
    spr('s01_moon', WIN.x + 60, WIN.y - 150 + Math.sin(T * 1.1) * 6, { r: Math.sin(T * 0.9) * 0.08, jit: 0.4 });
    for (const t of o.stars || []) shootingStar(T, t, WIN.x + 170, WIN.y - 250, WIN.x - 170, WIN.y + 20);
    pop();
    spr('s01_win_frame', WIN.x, WIN.y, { jit: 0.3 });
  }
  function wallClock(T) {
    const cx = 1700, cy = 330;
    spr('s01_clock', cx, cy, { r: Math.sin(T * 2) * 0.02 });
    const b = beatAt(T), tick = b.i + Ez.outBack(clamp(b.ph * 5), 3);
    const am = -Math.PI / 2 + (tick / 12) * TAU;
    ln(cx, cy, cx + Math.cos(-Math.PI / 2 + 1.1) * 30, cy + Math.sin(-Math.PI / 2 + 1.1) * 30, PAL.ink, 7);
    ln(cx, cy, cx + Math.cos(am) * 50, cy + Math.sin(am) * 50, PAL.coral, 4);
    dc(cx, cy, 7, PAL.ink);
  }
  function dateBack(T, o = {}) {
    washBG('s01_wall');
    soft(960, 700, 520, '#FFB27A', 0.18 * (0.9 + 0.1 * Math.sin(T * 13) * Math.sin(T * 7)));
    windowView(T, o);
    // moonbeam from the window and a few drifting motes
    noStroke(); fill(withAlphaCol('#DCCFFF', 0.07 + 0.02 * Math.sin(T * 1.7))); beginShape(); vertex(150, 200); vertex(420, 170); vertex(980, 860); vertex(360, 980); endShape(CLOSE);
    for (let i = 0; i < 12; i++) { const ph = fract(R(i, 61) + T * 0.04 * (1 + R(i, 62))); dc(260 + R(i, 63) * 560 + Math.sin(T * 0.8 + i) * 30, 900 - ph * 700, 2 + R(i, 64) * 2.5, '#FFFFFF', 0.5 * Math.sin(ph * Math.PI)); }
    wallClock(T);
    stringLights(T, o.on ?? 1);
  }
  function candle(T, x, y) {
    spr('s01_candle', x, y, { jit: 0.3 });
    const fl = 1 + 0.14 * vnoise(T * 9, 3) + 0.07 * Math.sin(T * 23);
    const fy = y - 172;
    glw(x, fy - 20, 120 * fl, PAL.butter, 0.42);
    glw(x, fy - 20, 50, '#FFFFFF', 0.3 * fl);
    spr('flame', x, fy, { sy: 0.75 * fl, sx: 0.75 * (2 - fl), r: vnoise(T * 5, 9) * 0.12, jit: 0 });
  }
  function steam(T, x, y, a = 1) {
    for (let i = 0; i < 3; i++) {
      const ph = fract(T * 0.55 + i / 3), yy = y - ph * 90, al = Math.sin(ph * Math.PI) * 0.55 * a;
      noFill(); stroke(withAlphaCol('#FFFFFF', al)); strokeWeight(4);
      beginShape(); for (let k = 0; k < 6; k++) vertex(x + (i - 1) * 14 + Math.sin(T * 3 + k * 0.9 + i) * 7, yy - k * 9); endShape(); noStroke();
    }
  }
  function dateFront(T, o = {}) {
    spr('s01_table', 960, 880, { jit: 0.3 });
    candle(T, 960, 876);
    spr('s01_vase', 1112, 902, { s: 0.82, r: Math.sin(T * 2.3) * 0.035 + kick(T, 5) * 0.03 });
    spr('paperclip', 1398, 858, { s: 0.2, r: 1.2, jit: 0.2 });
    spr('s01_saucer', 1248, 906, { s: 0.78 });
    spr('s01_cup', 1246, 904, { s: 0.78, flip: true, v: 1 });
    steam(T, 1244, 850);
    spr('s01_saucer', 700, 910, { s: 0.8 });
    if (!o.cupAt) { spr('s01_cup', 700, 908, { s: 0.8 }); steam(T + 0.7, 700, 852); }
  }

  // ================= POSTER / TITLE (thumbnail at T = -1; T < 0 is a smooth idle, 0-0.9 plays the intro) =================
  const TITLE_ST = { size: 232, fill: PAL.coral, weight: 700, stroke: PAL.ink, sw: 12, shadow: 'rgba(43,33,64,0.9)' };
  const SUB_ST = { size: 88, fill: PAL.ink, weight: 700, stroke: '#FFFFFF', sw: 9, shadow: 'rgba(43,33,64,0.25)' };
  function titleLetters(str, cx, cy, st, T, amp, bump, look) {
    const ims = [...str].map((ch) => textImg(ch, st));
    const tot = ims.reduce((a, b) => a + b.tw, 0);
    let x = cx - tot / 2;
    [...str].forEach((ch, i) => {
      const im = ims[i], lx = x + im.tw / 2; x += im.tw;
      const dy = Math.sin(T * 2.6 - i * 0.55) * amp - bump * 26 * Math.exp(-Math.abs(i - 3) * 0.3);
      const sc = 1 + bump * 0.08;
      txt(ch, lx, cy + dy, st, { s: sc, r: Math.sin(T * 2.1 + i) * 0.03 });
      if (ch === 'o' && look) { // googly eyes in the "oo" of doom
        const ex = lx + st.size * 0.005, ey = cy + dy + st.size * 0.13;
        const bl = fract(T * 0.23 + i * 0.07) < 0.04 ? 0.15 : 1;
        fill(PAL.white); stroke(PAL.ink); strokeWeight(4); ellipse(ex, ey, st.size * 0.2 * sc, st.size * 0.24 * sc * bl); noStroke();
        if (bl > 0.5) { dc(ex + look[0] * st.size * 0.045, ey + look[1] * st.size * 0.05, st.size * 0.055, PAL.ink); dc(ex + look[0] * st.size * 0.045 - 4, ey + look[1] * st.size * 0.05 - 5, 4, '#FFFFFF'); }
      }
    });
  }
  shot({
    id: 'poster', t0: -10,
    draw: drawPoster,
  });
  function drawPoster(s) {
    const T = s.T;
    const k = kick(T, 5), hb = hopB(T);
    // intro: Clawd winds up, hops on 0.72 and lands on 1.18 while the camera rushes into its eyes
    const wind = sstep(0.4, 0.7, T) * (T < 0.72 ? 1 : 0);
    const jump = T >= 0.72 ? Math.sin(Math.PI * clamp((T - 0.72) / 0.46)) : 0;
    const land = T >= 1.18 ? Math.exp(-(T - 1.18) * 9) : 0;
    const clHop = T < 0.4 ? Math.abs(Math.sin(T * 1.9)) * 10 + hb * 6 : jump * 150;
    const clSq = 1 + 0.05 * k * (T < 0.4 ? 1 : 0) + wind * 0.2 - (T >= 0.72 && T < 0.9 ? 0.16 * (1 - (T - 0.72) / 0.18) : 0) + land * 0.2;
    const clS = 1.1, clX = 1500, clY = 978;
    const faceW = [clX, clY - clHop - 6.5 * CU * clS];
    const push0 = Ez.in(inv(0.62, 1.32, T));
    const z = Math.exp(Math.log(2.8) * push0);
    const cs = focus(faceW, [lerp(faceW[0], 960, push0), lerp(faceW[1], 540, push0)], z);
    push();
    camOn(cs);
    // background: rotating painted sunburst and string lights
    spr('s01_rays', 960, 540, { s: 3.3, r: T * 0.035, jit: 0 });
    stringLights(T, 1, 0.55);
    floaters(T, 9, 21, ['heart', 'note', 'star5', 'spark'], [120, 380, 1680, 560], 55, 0.26, 26);
    twinkles(T, 18, 5, [60, 150, 1800, 820], ['spark', 'sparkW', 'star5'], 0.1, 0.26, 2.6);
    // title
    const bump = k * (T > -0.2 ? 1 : 0.35);
    spr('s01_swash', 960, 176, { s: 1.0, r: -0.025, jit: 0.4 });
    const words = ["I'm", 'Upping', 'My'];
    const wims = words.map((w0) => textImg(w0, SUB_ST)), gap = 28, wtot = wims.reduce((a, b) => a + b.tw, 0) + gap * 2;
    let wx = 960 - wtot / 2;
    words.forEach((w0, i) => { const lx = wx + wims[i].tw / 2; wx += wims[i].tw + gap; txt(w0, lx, 172 - 10 * Math.max(0, Math.sin(T * 5.2 - i * 0.9)) - bump * 12, SUB_ST, { r: -0.03 + Math.sin(T * 2 + i) * 0.02 }); });
    const lookX = Math.sin(T * 0.9) > 0 ? 1 : -1;
    titleLetters('P(doom)', 960, 332, TITLE_ST, T, 7, bump, [lookX * (0.6 + 0.4 * Math.abs(Math.sin(T * 0.9))), 0.25]);
    // sparkles around the title
    for (let i = 0; i < 6; i++) { const a = T * 0.8 + i * 1.05, x = 960 + Math.cos(a) * 520 * (i % 2 ? 1 : 0.92), y = 280 + Math.sin(a) * 150; spr(i % 2 ? 'spark' : 'sparkW', x, y, { s: 0.18 + 0.08 * Math.sin(T * 4 + i), r: T * 2 + i }); }
    // gauge (small, reads the same value as the corner HUD)
    soft(960, 915, 170, PAL.ink, 0.08);
    drawGauge(960, 792, 0.34, pdoomAt(T), { wobble: 0.035 });
    // ribbon + subtitle, with the running paperclip
    spr('s01_ribbon', 960, 1000, { s: 0.95, jit: 0.3 });
    txt('a watercolor music video starring Clawd & Pip', 960, 1002, { font: 'hand', size: 39, fill: PAL.ink, weight: 700 }, { r: 0.004 });
    spr('paperclip', 545, 952, { s: 0.3, r: -0.35, jit: 0.3 });
    // Pip (left): smitten and a little sweaty, offering a bouquet
    const pipHop = T >= 0.72 && T < 1.3 ? Math.sin(Math.PI * clamp((T - 0.72) / 0.32)) * 34 : hb * 7;
    const pArm = 1.2 + Math.sin(T * 2.6) * 0.1 + (T > 0.72 ? 0.25 * Math.exp(-(T - 0.72) * 4) : 0);
    const pX = 430, pY = 982, pS = 1.28;
    shadow(pX, pY + 4, 130 * (1 - pipHop / 150), 0.55);
    pip(pX, pY, pS, { face: 'pf_love', armR: pArm, armL: 0.25 + Math.sin(T * 3.1) * 0.08, hop: pipHop, headR: Math.sin(T * 2.4) * 0.07, sq: 1 + 0.03 * k });
    const hd = pipHand(pX, pY, pS, pArm, pipHop);
    spr('s01_bouquet', hd[0] + 4, hd[1] + 30, { s: 0.62, r: 0.35 + Math.sin(T * 2.6) * 0.06, jit: 0.4 });
    spr('drop', pX + 108, pY - 382 - pipHop + Math.sin(T * 3) * 4, { s: 0.42, r: 0.35 });
    if (T > 0.72) burst(T, 0.72, pX + 20, pY - 330, { n: 7, names: ['heart', 'heartR'], spd: 380, g: -120, life: 1.0, s: 0.3, spread: 1.6, ang0: -Math.PI / 2, seed: 30 });
    // Clawd (right): waves at Pip, then leaps on the first beat
    shadow(clX, clY + 4, 200 * (1 - clHop / 320), 0.55);
    const wave = T < 0.4 ? -1.05 + Math.sin(T * 7) * 0.42 : lerp(-1.05, jump > 0 ? -1.7 : 0.25, sstep(0.4, 0.72, T));
    clawd(clX, clY, clS, { armL: wave, armR: T >= 0.72 ? -1.7 * jump : 0.15 + Math.sin(T * 3) * 0.05, hop: clHop, sq: clSq, look: [-0.35, 0.05], blush: true, r: Math.sin(T * 2.3) * 0.035, blink: T < 0.5 });
    for (const sd of [-1, 1]) spr('sparkW', clX + (sd * 2.5 - 0.35 + 0.42) * CU * clS, clY - clHop - 6.95 * CU * clS, { s: 0.12 + 0.06 * Math.sin(T * 5 + sd), r: T * 3 });
    if (T > 0.7) burst(T, 0.72, clX, clY - 120, { n: 16, names: ['spark', 'star5', 'sparkW', 'heart'], spd: 900, g: 500, life: 1.1, s: 0.34, seed: 12 });
    pop();
  }

  // ================= L0: I see sparks of AGI in your eyes =================
  const W_SEE = wordT(0, 1), W_SPARKS = wordT(0, 2), W_OF = wordT(0, 3), W_AGI = wordT(0, 4), W_IN = wordT(0, 5), W_EYES = wordT(0, 7);
  const FW = [ // reflected fireworks: [time, eye (-1 left, 1 right, 0 both), x, y (eye px, square is +-150), radius, colour]
    [1.184, 1, 30, -30, 105, 0], [1.4, -1, -25, -35, 115, 1], [1.55, 1, -40, 30, 90, 2], [1.625, -1, 45, 20, 95, 2], [1.85, -1, -30, -20, 100, 4], [1.88, 1, 40, -10, 95, 1],
    [W_SPARKS, 0, 0, -15, 150, 0], [W_SPARKS + 0.06, 0, 55, 45, 95, 2], [W_SPARKS + 0.12, 0, -60, 30, 90, 1], [2.995, -1, 20, -25, 120, 3],
    [3.12, 1, 35, 25, 100, 2], [3.26, -1, -35, 30, 95, 4], [3.39, 1, -15, -30, 120, 4], [3.5, -1, 25, -20, 110, 1], [W_AGI, 0, 0, 0, 140, 0], [3.901, 0, 5, 0, 130, 1],
  ];
  function firework(T, t0, x, y, rad, col, seed) {
    const age = T - t0;
    if (age < -0.22 || age > 1.15) return;
    if (age < 0) { const kk = inv(-0.22, 0, age), yy = lerp(165, y, Ez.out(kk)); ln(x, yy, x + 3, yy + 44, col, 7, 0.7); dc(x, yy, 8, '#FFFFFF', 0.95); return; }
    const e = Ez.out(clamp(age / 0.6)), fade = 1 - inv(0.45, 1.15, age), n = 12;
    dc(x, y, rad * e * 0.9, col, 0.16 * fade);
    const rr = rad * e, droop = age * age * 70, segs = [];
    for (let i = 0; i < n; i++) { const ang = (i / n) * TAU + R(seed, 3); segs.push([x + Math.cos(ang) * rr * 0.45, y + Math.sin(ang) * rr * 0.45 + droop * 0.5, x + Math.cos(ang) * rr, y + Math.sin(ang) * rr + droop]); }
    segLines(segs, col, 8, 0.6 * fade);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU + R(seed, 3), px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr + droop;
      dc(px, py, 12 * (1 - age * 0.45), i % 3 ? col : '#FFFFFF', fade);
      if (i % 3 === 0 && age > 0.3) dc(px + Math.cos(ang) * 16, py + Math.sin(ang) * 16 + 10, 5, '#FFFFFF', fade * (0.5 + 0.5 * Math.sin(T * 40 + i)));
    }
    if (age < 0.12) dc(x, y, 26 * (1 - age / 0.12) + 6, '#FFFFFF', 0.8);
  }
  // one of Clawd's eyes at ECU size (body-local, eye square is 1 CU); side -1 left, 1 right
  function bigEye(T, side, ex, ey, a, fx) {
    push(); translate(ex, ey); scale(CU / 300);
    const open = fx.open, pop0 = fx.pop;
    scale(pop0, pop0 * Math.max(0.14, open));
    spr('s01_eye_big', 0, 0, { a, jit: 0.2, seed: side > 0 ? 1 : 0 });
    if (open > 0.3) {
      push();
      clip(() => { noStroke(); fill(0, 0); rect(-146, -146, 292, 292, 10); });
      blendMode(ADD);
      for (let i = 0; i < FW.length; i++) { const f = FW[i]; if (f[1] === 0 || f[1] === side) firework(T, f[0] + (f[1] === 0 && side > 0 ? 0.05 : 0), f[2] * (f[1] === 0 ? side : 1), f[3], f[4], FW_COLS[f[5]], i * 7 + side); }
      // candle reflected low in the eye
      const fl = 1 + 0.15 * vnoise(T * 9, 3);
      dc(70, 96, 26 * fl, '#FF9A3D', 0.35 * a); dc(70, 92, 12 * fl, PAL.butter, 0.8 * a);
      blendMode(BLEND);
      pop();
      // on-model square glints + a heart glint that appears on "see"
      const tw = 1 + 0.06 * Math.sin(T * 9 + side);
      noStroke(); fill(withAlphaCol('#FFFFFF', a)); rect(-93 * tw, -103, 76 * tw, 76, 6); rect(52, 62, 26, 26, 3);
      const hg = Ez.outBack(clamp((T - W_SEE) / 0.25), 3);
      if (hg > 0) heartShape(66, -74, 30 * hg * (1 + 0.12 * kick(T, 5)), '#FFFFFF', a * 0.95);
      const sp = fx.star;
      if (sp > 0) { // star-struck: four-point stars flare over the glints
        for (const [x, y, r0, rot] of [[-55, -65, 105, 0], [70, 60, 46, 0.6]]) {
          push(); translate(x, y); rotate(rot + (T - W_SPARKS) * 2.2); scale(Ez.outBack(clamp(sp * 1.4), 2));
          fa(PAL.butter, a * sp); beginShape(); for (const p of starPts(0, 0, r0, r0 * 0.24, 4)) vertex(p[0], p[1]); endShape(CLOSE);
          fa('#FFFFFF', a * sp); beginShape(); for (const p of starPts(0, 0, r0 * 0.7, r0 * 0.14, 4)) vertex(p[0], p[1]); endShape(CLOSE);
          pop();
        }
      }
    }
    pop();
  }
  function ecuOverlay(T, o, a, z) {
    push(); clawdTf(CL.x, CL.y, CL.s, o);
    spr('s01_face_big', 0, -5 * CU, { s: 320 / 920, a, jit: 0.25 });
    const k = kick(T, 5);
    const es = o.eyeS ?? 1;
    for (const sd of [-1, 1]) {
      const bx = sd * lerp(3, 2.3, inv(1, 1.72, es)) * CU, by = lerp(-5.2, -5.25, inv(1, 1.72, es)) * CU;
      soft(bx, by, 0.75 * CU, '#FF5F8F', a * (0.75 + 0.2 * k));
      for (let i = 0; i < 3; i++) ln(bx - 15 + i * 13, by + 7, bx - 8 + i * 13, by - 7, '#D93A6E', 2.6, 0.75 * a);
    }
    // eye timing: slow blink before "see", pop open on it, star glints on "sparks"
    const blinkC = sstep(W_SEE - 0.32, W_SEE - 0.12, T) * (1 - sstep(W_SEE - 0.06, W_SEE + 0.02, T));
    const pop0 = 1 + 0.16 * Math.exp(-Math.max(0, T - W_SEE) * 7) * (T > W_SEE ? 1 : 0) + 0.05 * k;
    const star = T > W_SPARKS - 0.04 ? Math.sin(Math.PI * clamp((T - W_SPARKS + 0.04) / 0.75)) : 0;
    // in the close-up the mouth sits tucked under the eyes (kawaii layout) and eases back to on-model as we pull out
    const mk = inv(1, 1.72, es);
    const mg = o.mouthK ?? 1;
    if (o.mouth === 'smile' && mg > 0) { noFill(); const c = rgbOf(PAL.black); stroke(c[0], c[1], c[2], 255 * a); strokeWeight(6 * CL.s * z); arc(0, lerp(-4.7, -5.45, mk) * CU, 1.2 * CU * mg, 0.8 * CU * mg, 0.2, Math.PI - 0.2); noStroke(); }
    if (o.mouth === 'o' && mg > 0) { const my = lerp(-4.4, -5.25, mk) * CU, mr = lerp(0.35, 0.19, mk) * CU * mg; dc(0, my, mr, PAL.black, a); dc(-mr * 0.35, my - mr * 0.4, mr * 0.22, '#FFFFFF', 0.7 * a); }
    const lk = o.look || [0, 0];
    for (const sd of [-1, 1]) bigEye(T, sd, (sd * 2.5 + lk[0]) * CU, (-6.5 + lk[1]) * CU, a, { open: 1 - blinkC, pop: pop0 * es, star });
    pop();
  }
  function camL0(T) {
    const punch = T >= W_SPARKS ? 0.22 * Math.exp(-(T - W_SPARKS) * 4.5) : 0;
    const zE = 5.3 + 0.35 * Ez.out(inv(0.5, 3.8, T)) + punch;
    const e = Ez.inOut(inv(3.9, 5.4, T));
    const z = Math.exp(lerp(Math.log(zE), 0, e));
    const drift = [Math.sin(T * 0.8) * 14 * (1 - e), Math.cos(T * 0.7) * 8 * (1 - e)];
    const sp = [lerp(960, FACE[0], e) + drift[0], lerp(362, FACE[1], e) + drift[1]];
    return focus(FACE, sp, z, Math.sin(T * 0.6) * 0.012 * (1 - e));
  }
  function clawdL0(T) {
    const e = inv(4.2, 5.2, T);
    const pb = Ez.inOut(inv(3.95, 4.9, T));
    const oT = W_AGI - 0.04, oEnd = W_AGI + 0.51; // gasp on "AGI", then smile again
    const mouth = T > oT && T < oEnd ? 'o' : T > 1.3 ? 'smile' : undefined;
    const mouthK = mouth === 'o' ? Ez.outBack(clamp((T - oT) / 0.14), 2.5) : mouth === 'smile' ? Ez.outBack(clamp((T - (T > W_AGI ? oEnd : 1.3)) / 0.2), 2.5) : 0;
    return { mouth, mouthK, eyes: 'ce_sq', blink: false, eyeS: lerp(1.72, 1, pb), look: [lerp(0, -0.35, e), lerp(0, 0.05, e)], armL: 0.06 + Math.sin(T * 2) * 0.04, armR: 0.06, blush: true, hop: hopB(T) * lerp(2, 5, pb), sq: 1 + lerp(0.012, 0.035, pb) * kick(T, 5) };
  }
  const AGI_ST = { size: 210, fill: PAL.butter, stroke: PAL.ink, sw: 21, shadow: 'rgba(43,33,64,0.35)', weight: 600 };
  const AGI_C = [960, 392];
  // sparkle-text "AGI": pops between the eyes, then flies down into its slot in the lyric line
  function drawAGI(x, y, sc, T, a, glitter = 1) {
    if (a <= 0) return;
    glw(x, y, 260 * sc, PAL.butter, 0.28 * a * glitter);
    txt('AGI', x, y, AGI_ST, { s: sc, a, r: Math.sin(T * 7) * 0.035 * glitter });
    for (let i = 0; i < 7; i++) { const tw = 0.5 + 0.5 * Math.sin(T * 9 + i * 1.7); spr(i % 2 ? 'sparkW' : 'spark', x + (R(i, 77) - 0.5) * 360 * sc, y + (R(i, 78) - 0.5) * 170 * sc, { s: (0.2 + 0.25 * tw) * sc * 1.6, r: T * 3 + i, a: a * tw * glitter }); }
  }
  const agiPop = (T) => Ez.outBack(clamp((T - W_AGI + 0.04) / 0.28), 2.4);
  function agiWord(T, age, wd, a) {
    const f = Ez.inOut(inv(W_AGI + 0.34, W_IN + 0.06, T)); // flies into its lyric slot just as "in" is sung
    const st = LSTYLE[0];
    const slot = [st.x + wd.x, st.y + wd.y];
    const endS = (st.words[4].size || st.size) / AGI_ST.size;
    const x = lerp(AGI_C[0] - slot[0], 0, f), y = lerp(AGI_C[1] - slot[1], 0, f) - Math.sin(f * Math.PI) * 140;
    const sc = lerp(agiPop(T), endS * (1 + 0.1 * kick(T, 5)), f);
    drawAGI(x, y, sc, T, a * (T >= W_AGI - 0.04 ? 1 : 0), 1 - 0.6 * f);
    if (f > 0 && f < 1) for (let i = 0; i < 6; i++) { const ft = f - i * 0.05; if (ft <= 0) continue; spr('spark', lerp(AGI_C[0] - slot[0], 0, ft), lerp(AGI_C[1] - slot[1], 0, ft) - Math.sin(ft * Math.PI) * 140, { s: 0.25 - i * 0.03, r: T * 5 + i, a: 0.9 - i * 0.12 }); }
  }
  shot({
    id: 'L0-eyes', t0: 0.9, tin: { type: 'bleed', d: 0.8, at: 0.5 },
    draw: drawL0,
  });
  function drawL0(s) {
    const T = s.T;
    const cs = camL0(T);
    const lightsOn = clamp((T - W_EYES + 0.14) / 0.34); // the string switches on left to right, sweeping through "eyes"
    const co = clawdL0(T);
    const ecuA = sstep(1.9, 2.55, cs.z);
    // before the pull-back the painted close-up covers the whole frame, so the set behind it is skipped
    const covered = ecuA >= 1 && T < 3.9;
    if (covered) bg('#3A2A62');
    push();
    camOn(cs);
    if (!covered) { dateBack(T, { on: lightsOn, stars: [4.75] }); clawd(CL.x, CL.y, CL.s, co); }
    if (ecuA > 0) ecuOverlay(T, co, ecuA, cs.z);
    // sparkle twinkles on Clawd's eyes once we're wide
    if (ecuA < 1) for (const sd of [-1, 1]) spr('sparkW', CL.x + (sd * 2.5 - 0.35 + 0.45) * CU * CL.s, CL.y - co.hop - 6.95 * CU * CL.s, { s: 0.14 + 0.06 * Math.sin(T * 6 + sd), r: T * 3, a: 1 - ecuA });
    if (!covered) {
      const eyesHit = T >= W_EYES ? Math.exp(-(T - W_EYES) * 5) : 0;
      pip(PP.x, PP.y, PP.s, { face: 'pf_love', armL: 0.3, armR: 0.35, headR: Math.sin(T * 2.2) * 0.07, hop: hopB(T) * 5 + eyesHit * 22, sq: 1 + 0.03 * kick(T, 5) });
      floaters(T, 6, 11, ['heart', 'heartR'], [PP.x - 170, 260, 300, 300], 70, 0.3, 18);
      burst(T, W_EYES, PP.x, PP.y - 270, { n: 12, names: ['heartR', 'heart', 'sparkW'], spd: 700, g: 200, life: 1.1, s: 0.36, seed: 55 });
      dateFront(T);
    }
    pop();
    // screen-space magic in the close-up
    if (ecuA > 0) {
      for (let i = 0; i < 12; i++) { const ph = fract(R(i, 91) + T * (0.05 + 0.05 * R(i, 92))); soft(R(i, 93) * W + Math.sin(T + i) * 20, H * (1.05 - ph * 1.1), 26 + R(i, 94) * 60, [PAL.butterLt, '#FFE3D6', PAL.pinkLt, PAL.mintLt][i % 4], 0.45 * ecuA * Math.sin(ph * Math.PI)); }
      for (let i = 0; i < 14; i++) { const tw = 0.5 + 0.5 * Math.sin(T * 5 + i * 2.3); spr(i % 3 ? 'sparkW' : 'spark', R(i, 95) * W, R(i, 96) * H * 0.85, { s: 0.08 + 0.1 * tw, r: T + i, a: ecuA * tw }); }
      gradRect(0, H * 0.62, W, H * 0.38, withAlphaCol('#FFB27A', 0), withAlphaCol('#FFB27A', 0.22 * ecuA));
      soft(560, 170, 380, '#FFC2B0', 0.35 * ecuA); soft(1380, 160, 300, '#FFC2B0', 0.25 * ecuA);
      if (T < 3.5) for (let i = 0; i < 7; i++) { const ph = fract(R(i, 71) + T * 0.32), hx = 960 + (R(i, 72) - 0.5) * 380 + Math.sin(T * 2 + i) * 30, hy = 700 - ph * 560; spr(i % 3 ? 'heart' : 'heartR', hx, hy, { s: 0.22 + 0.12 * R(i, 73), r: Math.sin(T * 3 + i) * 0.3, a: ecuA * Math.sin(ph * Math.PI) * (1 - inv(3.2, 3.5, T)) }); }
      const eyeS = [-1, 1].map((sd) => w2s([CL.x + (sd * 2.5) * CU * CL.s, FACE[1]], cs));
      // "sparks": a flash and a spray of sparkles thrown from both eyes toward the camera
      if (T > W_SPARKS && T < W_SPARKS + 0.16) { fill(withAlphaCol('#FFE9A8', 0.16 * (1 - inv(W_SPARKS, W_SPARKS + 0.16, T)))); rect(0, 0, W, H); }
      for (const [n, p] of eyeS.entries()) burst(T, W_SPARKS, p[0], p[1], { n: 18, names: ['spark', 'star5', 'sparkW', 'heart'], spd: 1500, g: 250, life: 1.3, s: 0.5, spin: 3, seed: 200 + n * 40 });
      // "of": sparkles spiral in toward the middle, "AGI" bursts there
      for (let i = 0; i < 16; i++) {
        const t0 = W_OF - 0.14 + (i % 8) * 0.03, u = inv(t0, W_AGI - 0.02, T);
        if (u <= 0 || u >= 1) continue;
        const src = eyeS[i % 2], ang = u * 3.2 + i, rr = (1 - Ez.in(u)) * 120;
        const px = lerp(src[0], AGI_C[0], Ez.in(u)) + Math.cos(ang) * rr, py = lerp(src[1], AGI_C[1], Ez.in(u)) + Math.sin(ang) * rr;
        spr(i % 3 ? 'spark' : 'sparkW', px, py, { s: 0.3 * (1 - u * 0.5), r: T * 6 + i, a: ecuA });
      }
      if (T > W_AGI - 0.04 && T < W_AGI + 0.96) { const ra = T - W_AGI; spr('ring', AGI_C[0], AGI_C[1], { s: 0.4 + ra * 3.2, a: clamp(1 - ra * 1.6) * ecuA }); }
      burst(T, W_AGI, AGI_C[0], AGI_C[1], { n: 16, names: ['spark', 'sparkW', 'star5'], spd: 1200, g: 300, life: 1.2, s: 0.42, seed: 300 });
      if (!G.lyricsOn && T > W_AGI - 0.06 && T < W_AGI + 0.96) drawAGI(AGI_C[0], AGI_C[1] - (T - W_AGI - 0.26) * 60, agiPop(T), T, 1 - inv(W_AGI + 0.46, W_AGI + 0.96, T));
    }
    // sparkles thrown past the camera as it pulls back
    burst(T, 3.95, W / 2, H * 0.42, { n: 24, names: ['spark', 'sparkW', 'heart', 'star5'], spd: 1600, g: 250, life: 1.4, s: 0.5, seed: 400 });
  }
  lyr(0, {
    x: 1000, y: 962, size: 64, maxW: 1560, cols: ['#FFFFFF', '#FFFFFF', PAL.butter, '#FFFFFF', PAL.butter, '#FFFFFF', '#FFFFFF', '#FF8FB8'],
    words: { 2: { size: 78, anim: 'zoom' }, 4: { size: 88, anim: 'type', draw: agiWord }, 7: { anim: 'pop', grow: 0.18 } },
  });

  // ================= L1: Your circuits make me nervous, that's no surprise =================
  const W_YOUR = wordT(1, 0), W_CIRC = wordT(1, 1), W_MAKE = wordT(1, 2), W_NERV = wordT(1, 4), W_NO = wordT(1, 6), W_SURP = wordT(1, 7);
  function camL1(T) {
    const a = Ez.inOut(inv(5.64, 6.35, T)), b = Ez.inOut(inv(6.42, 6.9, T)), c = Ez.inOut(inv(7.55, 8.05, T)), d = Ez.inOut(inv(8.5, 9.3, T));
    let z = 1, x = 960, y = 540;
    z = lerp(z, 1.14, a); x = lerp(x, 1090, a); y = lerp(y, 560, a);
    z = lerp(z, 1.34, b); x = lerp(x, 740, b); y = lerp(y, 585, b);
    z = lerp(z, 1.05, c); x = lerp(x, 960, c); y = lerp(y, 545, c);
    z = lerp(z, 1.12, d); x = lerp(x, 1060, d); y = lerp(y, 540, d);
    z += (T >= W_SURP ? 0.03 * Math.exp(-(T - W_SURP) * 6) : 0);
    return { c: [x, y], z, r: 0 };
  }
  function clawdL1(T) {
    const shrug = sstep(W_SURP - 0.08, W_SURP + 0.08, T) * (1 - sstep(8.95, 9.25, T));
    const tilt = sstep(W_NERV - 0.02, W_NERV + 0.18, T) * (1 - sstep(7.45, 7.7, T));
    return {
      eyes: shrug > 0.5 ? 'ce_happy' : 'ce_sq', blink: false, blush: true,
      look: [lerp(-0.35, -0.5, tilt), 0.05 + 0.1 * tilt],
      armL: 0.06 - shrug * (0.85 + 0.1 * Math.sin(T * 14)), armR: 0.06 - shrug * (0.85 + 0.1 * Math.sin(T * 14 + 1)),
      hop: hopB(T) * 5 + shrug * 14 * Math.abs(Math.sin((T - W_SURP + 0.08) * 7)), sq: 1 + 0.035 * kick(T, 5) - shrug * 0.04,
      r: tilt * -0.07 + shrug * 0.05 * Math.sin((T - W_SURP) * 8),
    };
  }
  function xrayOverlay(T, o, reveal, a) {
    if (a <= 0 || reveal <= 0) return;
    push(); clawdTf(CL.x, CL.y, CL.s, o);
    const bx = -4 * CU, by = -8 * CU;
    push();
    clip(() => { noStroke(); fill(0, 0); rect(bx - 8, by - 8, (8 * CU + 16) * reveal, 6 * CU + 16); });
    spr('s01_xray', 0, -5 * CU, { s: CU / XU, a, jit: 0.3 });
    blendMode(ADD);
    for (let i = 0; i < XTR.length; i++) {
      const path = XTR[i].map(([u, v]) => [bx + u * CU, by + v * CU]);
      for (let k = 0; k < 2; k++) { const [px, py] = pathPoint(path, fract(T * 0.95 + i * 0.37 + k * 0.5)); dc(px, py, 7, PAL.mintLt, 0.55 * a); dc(px, py, 3.2, '#FFFFFF', 0.9 * a); }
    }
    const hk = kick(T, 5);
    dc(bx + XHEART[0] * CU, by + XHEART[1] * CU, 30 + 14 * hk, PAL.pink, 0.3 * a * (0.5 + 0.5 * hk));
    blendMode(BLEND);
    const lk = o.look || [0, 0];
    for (const sd of [-1, 1]) {
      const ex = (sd * 2.5 + lk[0]) * CU, ey = (-6.5 + lk[1]) * CU;
      if (o.eyes === 'ce_happy') { noFill(); stroke(withAlphaCol(PAL.mintLt, a)); strokeWeight(5); arc(ex, ey + 8, 34, 30, Math.PI + 0.2, TAU - 0.2); noStroke(); }
      else { fill(withAlphaCol('#08101E', a)); rect(ex - 20, ey - 20, 40, 40, 3); noFill(); stroke(withAlphaCol(PAL.mint, a)); strokeWeight(3); rect(ex - 20, ey - 20, 40, 40, 3); noStroke(); fill(withAlphaCol(PAL.mintLt, a)); rect(ex - 13, ey - 14, 10, 10, 2); }
    }
    pop();
    if (reveal < 1) { const sx = bx - 8 + (8 * CU + 16) * reveal; glw(sx, by + 3 * CU, 90, PAL.mint, 0.5); ln(sx, by - 26, sx, by + 6 * CU + 26, PAL.mintLt, 6, 0.95); }
    pop();
  }
  // lead-out: mint circuit traces race in from the right edge ahead of s02's painted wipe
  const LEAD = (() => {
    const out = [];
    for (let i = 0; i < 9; i++) {
      let x = W + 40, y = 95 + i * 112 + RS(i, 5) * 22; const pts = [[x, y]];
      let s = 0;
      while (x > -500) { x -= 150 + R(i * 9 + s, 6) * 260; pts.push([x, y]); const dy = (R(i * 9 + s, 7) < 0.5 ? -1 : 1) * (36 + R(i * 9 + s, 8) * 44); x -= Math.abs(dy); y += dy; pts.push([x, y]); s++; }
      out.push({ pts, dt: RS(i, 9) * 0.04 });
    }
    return out;
  })();
  function leadOut(T) {
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
      for (const [c, w0, al] of [[PAL.ink, 16, 0.85], [PAL.mint, 9, 1], ['#FFFFFF', 3, 0.7]]) { noFill(); stroke(withAlphaCol(c, al)); strokeWeight(w0); beginShape(); for (const p of seg) vertex(p[0], p[1]); endShape(); }
      noStroke();
      for (let i = 1; i < seg.length - 1; i++) { dc(seg[i][0], seg[i][1], 11, PAL.ink); dc(seg[i][0], seg[i][1], 7, PAL.butter); }
      glw(head[0], head[1], 70, PAL.mint, 0.5);
      dc(head[0], head[1], 13, PAL.mintLt); dc(head[0], head[1], 7, '#FFFFFF');
    }
  }
  shot({
    id: 'L1-circuits', t0: 5.64, tin: { type: 'cut', d: 0 },
    draw: drawL1,
  });
  function drawL1(s) {
    const T = s.T;
    const cs = camL1(T);
    push();
    camOn(cs);
    dateBack(T, { stars: [7.12] });
    const co = clawdL1(T);
    clawd(CL.x, CL.y, CL.s, co);
    // x-ray on for "circuits", flickers off after "nervous", flickers back as the lead-out traces arrive
    let xrA = 0;
    if (T < 7.45) xrA = 1;
    else if (T < 7.62) xrA = (Math.sin(T * 90) > 0 ? 0.8 : 0.1) * (1 - inv(7.45, 7.62, T));
    if (T > 8.62) xrA = T < 8.75 ? (Math.sin(T * 80) > 0 ? 0.9 : 0.2) : 1;
    xrayOverlay(T, co, T < 7.0 ? Ez.inOut(inv(W_YOUR, W_CIRC + 0.02, T)) : 1, xrA); // the scan finishes on "circuits"
    // Pip: smitten, then nervous, picks up the teacup and rattles it on "nervous"
    const lift = Ez.outBack(inv(W_MAKE - 0.02, W_MAKE + 0.28, T), 1.4);
    const trem = sstep(W_NERV - 0.37, W_NERV, T) * (1 - 0.55 * sstep(7.7, 8.0, T));
    const jolt = T >= W_NO - 0.02 ? Math.exp(-(T - W_NO + 0.02) * 5) : 0;
    const face = T < W_MAKE - 0.08 ? 'pf_love' : T >= W_NO - 0.02 && T < W_SURP + 0.12 ? 'pf_shock' : 'pf_nervous';
    const shiver = trem * (Math.sin(T * 61) * 3 + RS(G.boil, 1) * 2);
    const pArm = lerp(0.35, 1.02, clamp(lift, 0, 1.2)) + trem * Math.sin(T * 47) * 0.05;
    const pHop = hopB(T) * 4 * (1 - trem) + jolt * 46;
    pip(PP.x + shiver, PP.y, PP.s, { face, armR: pArm, armL: 0.3 + trem * 0.15 + jolt * 0.9, headR: Math.sin(T * 2.2) * 0.05 * (1 - trem) + trem * Math.sin(T * 38) * 0.03, hop: pHop, sq: 1 + 0.03 * kick(T, 5) });
    dateFront(T, { cupAt: lift > 0.02 });
    if (lift > 0.02) { // the cup travels from the saucer to Pip's hand and rattles there
      const hd = pipHand(PP.x + shiver, PP.y, PP.s, pArm, pHop);
      const rat = trem * (1 + 1.5 * Math.exp(-Math.max(0, T - W_NERV) * 3) * (T > W_NERV ? 1 : 0)) + jolt;
      const cx = lerp(700, hd[0] - 34, clamp(lift)), cy = lerp(908, hd[1] + 40, clamp(lift));
      spr('s01_cup', cx + Math.sin(T * 57) * 5 * rat, cy + Math.sin(T * 43) * 3 * rat, { s: 0.8, r: Math.sin(T * 51) * 0.09 * rat, jit: 0.3 });
      // tea sloshing out
      for (const [bt, n] of [[W_NERV, 7], [7.105, 3], [7.546, 3], [W_NO - 0.02, 5]]) {
        const age = T - bt; if (age < 0 || age > 0.8) continue;
        for (let i = 0; i < n; i++) { const vx = RS(i, bt * 10) * 260, vy = -300 - R(i, bt * 10 + 1) * 260; dc(cx - 4 + vx * age, cy - 60 + vy * age + 900 * age * age, 7 - age * 5, '#A06A4E', 1 - age / 0.8); }
      }
    }
    // sweat on the beats, shiver lines, "!" on "no surprise"
    const headW = [PP.x, PP.y - 250 * PP.s - pHop];
    for (const [n, bt] of [6.641, 7.105, 7.546, 8.011, 8.452].entries()) { const sd = n % 2 ? 1 : -1; burst(T, bt, headW[0] + sd * 105, headW[1] - 55, { n: 3, names: ['drop'], spd: 560, g: 1500, life: 0.7, s: 0.5, spread: 0.9, ang0: -Math.PI / 2 + sd * 0.85, seed: n * 5 }); }
    if (trem > 0.05) { // wobble marks either side of Pip's head: ( ( (   ) ) )
      noFill(); const c = rgbOf(PAL.ink); stroke(c[0], c[1], c[2], 200 * trem); strokeWeight(4);
      for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) { const x = headW[0] + sd * (130 + i * 22) + RS(G.boil + i, 4) * 3; arc(x, headW[1] - 20, 30, 64, sd > 0 ? -0.9 : Math.PI - 0.9, sd > 0 ? 0.9 : Math.PI + 0.9); }
      noStroke();
    }
    const bang = T - W_NO;
    if (bang > -0.02) { const sc = Ez.outBack(clamp((bang + 0.02) / 0.22), 3) * (1 - sstep(0.75, 0.95, bang) * 0.15); spr('s01_bang', headW[0] + 150, headW[1] - 110, { s: 0.62 * sc, r: -0.16 + Math.sin(T * 18) * 0.05 * Math.exp(-bang * 3), jit: 0.3 }); for (let i = 0; i < 3; i++) { const a = -2.3 + i * 0.5, r0 = 120, r1 = 120 + 50 * Ez.out(clamp(bang / 0.25)); ln(headW[0] + 150 + Math.cos(a) * r0 * 0.7, headW[1] - 130 + Math.sin(a) * r0, headW[0] + 150 + Math.cos(a) * r1 * 0.7, headW[1] - 130 + Math.sin(a) * r1, PAL.red, 6, clamp(1 - bang * 1.5)); } }
    // Clawd's shrug gets two little motion ticks
    if (T > 8.3 && T < 9.2) { const sa = sstep(8.3, 8.4, T) * (1 - sstep(8.9, 9.1, T)); for (const sd of [-1, 1]) ln(CL.x + sd * 250, 520 + Math.sin(T * 14) * 6, CL.x + sd * 280, 490 + Math.sin(T * 14) * 6, PAL.ink, 5, 0.8 * sa); }
    pop();
    leadOut(T);
  }
  lyr(1, { y: 950, size: 66, maxW: 1080, words: { 1: { fill: PAL.mint }, 4: { anim: 'shake', jitter: 6, fill: PAL.skyLt }, 6: { fill: PAL.butter }, 7: { anim: 'pop', fill: PAL.butter, tilt: -0.07 } } });
})();

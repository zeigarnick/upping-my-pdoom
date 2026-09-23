// s06.js - L13-L15 (44.74-58.28): go-kart down the loss landscape, the atom teleporter, Sydney's heart cage.
// Everything here is private to this IIFE and a pure function of song time T.
(() => {
  // ================= shared helpers =================
  const T13 = 44.74, T14 = 48.42, T15 = 52.72;
  const w13 = (j) => wordT(13, j), w14 = (j) => wordT(14, j), w15 = (j) => wordT(15, j);
  // one-shot exponential decay that starts at t0
  const after = (T, t0, k = 6) => (T >= t0 ? Math.exp(-(T - t0) * k) : 0);
  // p5.brush's watercolor fill grows a white sawtooth fringe past its polygon (and big wedges at concave
  // corners), so P() lays an opaque flat base and insets the watercolor layer inside it; the pencil
  // outline goes on the true edge
  const cen = (pts) => { let x = 0, y = 0; for (const p of pts) { x += p[0]; y += p[1]; } return [x / pts.length, y / pts.length]; };
  function P(pts, c, o = {}) {
    const [cx, cy] = o.c || cen(pts);
    if (o.base !== false) flat(pts, o.baseC || lite(c, 0.18), o.baseA ?? 1);
    wc(c, o.a ?? 150, o.bleed ?? 0.03, o.tex ?? 0.55, o.border ?? 0.6); brush.polygon(scalePts(pts, cx, cy, o.inset ?? 0.87)); brush.noFill();
    if (o.line !== false) { pen(o.lc || PAL.ink, o.lw ?? 2, o.lt || '2B'); brush.polygon(pts); }
    brush.noStroke();
  }
  // concave shapes make the brush fill throw big white wedges, so PF() paints without it:
  // flat base, soft mottling kept inside the shape, an inset pigment-pooling line and the pencil outline
  function signedArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; a += x1 * y2 - x2 * y1; } return a / 2; }
  function insetPoly(pts, d) {
    const sg = Math.sign(signedArea(pts)) || 1, n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      const ax = p1[0] - p0[0], ay = p1[1] - p0[1], bx = p2[0] - p1[0], by = p2[1] - p1[1];
      const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
      const nx = -ay / la - by / lb, ny = ax / la + bx / lb, ln = Math.hypot(nx, ny) || 1;
      out.push([p1[0] + ((sg * nx) / ln) * d, p1[1] + ((sg * ny) / ln) * d]);
    }
    return out;
  }
  function inPoly(x, y, pts) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; }
    return c;
  }
  function PF(pts, c, o = {}) {
    flat(pts, o.baseC || lite(c, 0.15));
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const inner = insetPoly(pts, o.mIn ?? 14), span = Math.min(x1 - x0, y1 - y0);
    for (let i = 0, tries = 0; i < (o.mottle ?? 9) && tries < 60; tries++) {
      const x = lerp(x0, x1, random()), y = lerp(y0, y1, random()), r = span * (0.08 + random() * 0.16);
      if (!inPoly(x, y, inner) || !inPoly(x - r, y, inner) || !inPoly(x + r, y, inner) || !inPoly(x, y - r * 0.7, inner) || !inPoly(x, y + r * 0.7, inner)) continue;
      flat(ellPts(x, y, r, r * (0.55 + random() * 0.4), 22, 0.2), random() < 0.55 ? dark(c, 0.12) : lite(c, 0.3), 0.1 + random() * 0.08);
      i++;
    }
    if (o.pool !== false) { pen(mixc(c, dark(c, 0.35), 0.45), o.poolW ?? 1.8, 'marker'); brush.polygon(insetPoly(pts, o.poolD ?? 5)); }
    if (o.line !== false) { pen(o.lc || PAL.ink, o.lw ?? 2, o.lt || '2B'); brush.polygon(pts); }
    brush.noStroke();
  }
  // heart with a shallow top notch; shared by the atom heart, the heart iris and the cage so they line up
  function heartS(cx, cy, s, n = 64) {
    return heartPts(cx, cy, s, n).map(([x, y]) => (y < cy ? [x, y - 0.25 * s * Math.exp(-(((x - cx) / (0.35 * s)) ** 2))] : [x, y]));
  }
  const HVC = 0.165; // visual centre of heartS sits at cy + HVC * s
  function shapeFill(pts) { beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(CLOSE); }
  function rotEll(cx, cy, rx, ry, rot, n = 36) {
    const pts = [], c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; pts.push([cx + x * c - y * s, cy + x * s + y * c]); }
    return pts;
  }
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  // where a vertical (or horizontal) line crosses a closed polygon: [min, max]
  function crossV(pts, x) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      if (x1 !== x2 && (x1 - x) * (x2 - x) <= 0) { const y = y1 + ((y2 - y1) * (x - x1)) / (x2 - x1); lo = Math.min(lo, y); hi = Math.max(hi, y); }
    }
    return [lo, hi];
  }
  function crossH(pts, y) { return crossV(pts.map(([a, b]) => [b, a]), y); }
  // per-letter images for the custom lyric words
  const LETC = {};
  function letters(str, st, cols) {
    const key = str + '|' + st.size + '|' + (cols || []).join(',');
    if (LETC[key]) return LETC[key];
    const out = []; let tot = 0;
    for (let i = 0; i < str.length; i++) { const im = textImg(str[i], { ...st, fill: cols ? cols[i % cols.length] : st.fill }); out.push({ im }); tot += im.tw; }
    let x = -tot / 2;
    for (const L of out) { L.x = x + L.im.tw / 2; x += L.im.tw; }
    return (LETC[key] = out);
  }
  function drawImg(t, x, y, a = 1, sx = 1, sy = 1, r = 0) {
    push(); translate(x, y); if (r) rotate(r); scale(sx, sy);
    if (a < 1) tint(255, 255 * clamp(a));
    image(t.img, -t.w / 2, -t.h / 2);
    pop();
  }
  // speed streaks batched into two draw calls (kit speedLines issues one call per line)
  function streaks(T, n, seed, c, a, len, wgt, spd, box) {
    const thin = [], thick = [];
    for (let i = 0; i < n; i++) {
      const y = box[1] + R(i, seed) * box[3];
      const x = box[0] + fract(R(i, seed + 1) - (T * spd * (0.6 + 0.4 * R(i, seed + 2))) / box[2]) * (box[2] + len) - len;
      (i % 2 ? thin : thick).push([x, y, x + len * (0.5 + R(i, seed + 3)), y]);
    }
    segLines(thick, c, wgt, a); segLines(thin, c, wgt * 0.5, a);
  }
  function polyline(pts, c, w, a = 1) { noFill(); stroke(withAlphaCol(c, a)); strokeWeight(w); beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(); noStroke(); }

  // ================= L13: And you're optimizing, accelerating =================
  const ROAD_Y = 905; // where the kart wheels touch the road
  defSprite('s06_sky', 1000, 580, () => {
    flat(box(-10, -10, 1010, 590), mixc(PAL.skyLt, PAL.sky, 0.25));
    flat(box(-10, 260, 1010, 590), mixc(PAL.butterLt, PAL.skyLt, 0.35), 0.8);
    wash(-40, -40, 1080, 660, PAL.skyLt, 150, 0.1);
    blob(640, 80, 220, '#FFFFFF', 80, 0.4);
    blob(900, 300, 220, PAL.pinkLt, 90, 0.4);
    blob(320, 330, 220, PAL.lilacLt, 80, 0.4);
    blob(130, 86, 78, PAL.butter, 170, 0.2);
    blob(130, 86, 54, '#FFF4C0', 220, 0.1);
  });
  const hf = (x) => 150 + 40 * Math.sin((x / 1000) * TAU * 2 + 0.4) + 24 * Math.sin((x / 1000) * TAU * 3 + 1.7);
  const hm = (x) => 110 + 44 * Math.sin((x / 1000) * TAU * 3 + 0.3) + 20 * Math.sin((x / 1000) * TAU * 5 + 2.1);
  function ridge(f, bottom, step = 20) { const pts = []; for (let x = -60; x <= 1060; x += step) pts.push([x, f(x)]); pts.push([1060, bottom], [-60, bottom]); return pts; }
  defSprite('s06_hills_far', 1000, 320, () => {
    PF(ridge(hf, 360), PAL.lilac, { baseC: mixc(PAL.lilacLt, PAL.lilac, 0.35), lw: 1.6, lc: PAL.inkSoft, mottle: 14, pool: false });
    for (let k = 1; k <= 3; k++) { const c = []; for (let x = -60; x <= 1060; x += 30) c.push([x, 150 + k * 42 + (hf(x) - 150) * (1 - k * 0.25)]); strokePath(c, PAL.lilac, 1.3, 'pen', 0.5); }
  });
  defSprite('s06_hills_mid', 1000, 300, () => {
    PF(ridge(hm, 340), PAL.grass, { baseC: mixc(PAL.grass, PAL.mintLt, 0.45), lw: 2, mottle: 14, pool: false });
    // loss-landscape contour bands
    const cols = [PAL.butter, PAL.mint, PAL.sky, PAL.teal];
    for (let k = 0; k < 4; k++) {
      const top = [], bot = [];
      for (let x = -60; x <= 1060; x += 30) {
        const base = hm(x) - 110;
        top.push([x, 136 + k * 42 + base * (1 - k * 0.22)]);
        bot.push([x, 158 + k * 42 + base * (1 - (k + 0.4) * 0.22)]);
      }
      flat([...top, ...bot.reverse()], cols[k], 0.35);
      strokePath(top, PAL.grassDk, 1.1, 'pen', 0.5);
    }
  });
  // the loss valley in perspective: rim (high loss, warm) down to the global minimum (deep blue)
  const VCOL = [PAL.mint, PAL.butter, PAL.orange, PAL.pink, PAL.lilac, PAL.sky, PAL.teal, PAL.blue, PAL.navy];
  const VRX = 470, VRY = 140, VDEP = 112;
  const vring = (f) => ({ cy: VDEP * (1 - f), rx: VRX * f, ry: VRY * f });
  defSprite('s06_valley', 1000, 420, () => {
    const cx = 500, cy = 160;
    for (let i = 0; i < VCOL.length; i++) {
      const f = 1 - i / (VCOL.length + 0.3), g = vring(f);
      const pts = ellPts(cx, cy + g.cy, g.rx, g.ry, 72, 0.02);
      P(pts, VCOL[i], { baseC: lite(VCOL[i], 0.12), a: 110, lw: 1.3, c: [cx, cy + g.cy], inset: 0.9 });
      // shade the far inner wall a touch
      flat(ellPts(cx, cy + g.cy - g.ry * 0.55, g.rx * 0.8, g.ry * 0.35, 40), dark(VCOL[i], 0.25), 0.12);
    }
  }, { ax: 0.5, ay: 160 / 420 });
  defSprite('s06_tree0', 220, 360, () => {
    P(rrPts(98, 180, 24, 170, 10), PAL.brown, { baseC: PAL.brownLt, lw: 1.6 });
    P(ellPts(110, 118, 88, 94, 36, 0.06), PAL.grass, { baseC: mixc(PAL.grass, PAL.mintLt, 0.4), a: 150, lw: 2 });
    flat(ellPts(80, 86, 22, 16, 16), '#FFFFFF', 0.4);
    flat(ellPts(142, 150, 30, 22, 16), PAL.grassDk, 0.35);
  }, { ay: 0.97 });
  defSprite('s06_tree1', 200, 380, () => {
    P(rrPts(90, 300, 20, 70, 8), PAL.brown, { baseC: PAL.brownLt, lw: 1.4 });
    for (let k = 0; k < 3; k++) { const y = 40 + k * 78; P([[100, y], [168 + k * 6, y + 120], [32 - k * 6, y + 120]], PAL.teal, { baseC: lite(PAL.teal, 0.3), lw: 1.8 }); }
  }, { ay: 0.97 });
  defSprite('s06_tree2', 240, 340, () => {
    P(rrPts(108, 190, 24, 140, 10), PAL.brown, { baseC: PAL.brownLt, lw: 1.6 });
    for (const [x, y, r] of [[78, 150, 56], [162, 150, 56], [120, 96, 68], [120, 176, 50]]) P(ellPts(x, y, r, r * 0.9, 28, 0.05), PAL.pink, { baseC: mixc(PAL.pink, PAL.pinkLt, 0.5), lw: 1.6 });
    for (let i = 0; i < 7; i++) flat(ellPts(70 + random() * 100, 80 + random() * 110, 5, 5, 10), '#FFFFFF', 0.85);
  }, { ay: 0.97 });
  defSprite('s06_road', 1000, 120, () => {
    flat(box(-10, 8, 1010, 116), mixc(PAL.grayLt, PAL.gray, 0.35));
    wash(-40, 24, 1080, 90, PAL.lilac, 60, 0.05);
    for (let i = 0; i < 40; i++) { const r = 1.5 + random() * 2.5; flat(ellPts(random() * 1000, 24 + random() * 84, r, r * 0.7, 8), PAL.inkSoft, 0.3); }
    for (let x = 0; x < 1000; x += 25) flat(box(x, 0, x + 25, 11), (x / 25) % 2 ? '#FFFFFF' : PAL.red, 0.95);
    flat(box(-10, 108, 1010, 114), '#FFFFFF', 0.8);
    pen(PAL.ink, 1.6, '2B'); brush.line(-10, 11, 1010, 11); brush.line(-10, 116, 1010, 116); brush.noStroke();
  });
  defSprite('s06_verge', 1000, 80, () => {
    flat(box(-10, 10, 1010, 90), mixc(PAL.grass, PAL.grassDk, 0.3));
    wash(-40, 8, 1080, 100, PAL.grass, 110, 0.05);
    pen(PAL.grassDk, 2.2, 'pen'); for (let i = 0; i < 14; i++) { const x = i * 72 + random() * 30; brush.line(x, 70, x + 4, 14 + random() * 20); brush.line(x + 10, 70, x + 22, 26 + random() * 20); } brush.noStroke();
    for (let i = 0; i < 10; i++) flat(ellPts(40 + i * 100 + random() * 40, 30 + random() * 30, 7, 7, 10), [PAL.butter, PAL.pink, '#FFFFFF'][i % 3], 0.95);
  });
  // the coral kart (side view, facing right). Local origin = chassis bottom centre = sprite (380, 296)
  defSprite('s06_kart', 760, 340, () => {
    P([[30, 70], [200, 78], [196, 100], [26, 94]], PAL.coralDk, { baseC: PAL.coral, lw: 2 });
    pen(PAL.ink, 4, 'marker'); brush.line(92, 98, 102, 156); brush.line(158, 100, 166, 152); brush.noStroke();
    P(rrPts(8, 214, 90, 28, 13), PAL.gray, { baseC: PAL.grayLt, lw: 1.8 });
    P(rrPts(18, 180, 78, 24, 11), PAL.gray, { baseC: PAL.grayLt, lw: 1.8 });
    const body = rrPtsPoly([[64, 196], [96, 148], [300, 144], [334, 204], [560, 206], [676, 218], [742, 254], [724, 292], [84, 296], [50, 250]], 20);
    PF(body, PAL.coral, { baseC: '#F4694F', lw: 2.6, mottle: 12 });
    flat([[70, 272], [720, 278], [716, 292], [84, 294]], PAL.coralDk, 0.45);
    flat([[70, 234], [716, 246], [726, 262], [66, 254]], PAL.butter, 0.95);
    P([[430, 214], [396, 250], [422, 250], [400, 290], [456, 238], [428, 238], [450, 214]], PAL.butter, { baseC: PAL.butterLt, lw: 1.6 });
    flat(rrPts(104, 158, 170, 12, 6), '#FFFFFF', 0.45); flat(rrPts(360, 214, 150, 8, 4), '#FFFFFF', 0.4);
    P(ellPts(722, 244, 15, 13, 16), PAL.butter, { baseC: '#FFF3B0', lw: 1.6 });
    P(rrPts(640, 280, 116, 22, 11), PAL.ink, { baseC: PAL.inkSoft, lw: 1.4 });
  }, { v: 2, ax: 0.5, ay: 296 / 340 });
  defSprite('s06_wheel', 150, 150, () => {
    P(ellPts(75, 75, 62, 62, 36), PAL.ink, { baseC: '#3A2E52', lw: 2 });
    P(ellPts(75, 75, 30, 30, 24), PAL.grayLt, { baseC: '#FFFFFF', lw: 1.6 });
    pen(PAL.butter, 3.2, 'marker'); for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; brush.line(75, 75, 75 + Math.cos(a) * 27, 75 + Math.sin(a) * 27); } brush.noStroke();
    flat(ellPts(75, 75, 8, 8, 12), PAL.coral);
    pen('#FFFFFF', 1.6, 'pen'); brush.spline([[34, 50], [46, 30], [70, 20]], 0.5); brush.noStroke();
  }, { v: 1 });
  defSprite('s06_steer', 120, 150, () => {
    pen(PAL.ink, 5, 'marker'); brush.line(92, 142, 60, 70); brush.noStroke();
    const outer = rotEll(56, 56, 20, 46, -0.35, 28), inner = rotEll(56, 56, 11, 35, -0.35, 28);
    flat([...outer, outer[0], inner[0], ...inner.slice(1).reverse(), inner[0]], PAL.navy); // ring: outer loop, then the inner loop reversed
    pen(PAL.ink, 1.6, 'pen'); brush.polygon(outer); brush.polygon(inner); brush.noStroke();
    flat(ellPts(56, 56, 6, 6, 10), PAL.red);
  }, { v: 1, ax: 92 / 120, ay: 142 / 150 });
  defSprite('s06_hair_wind', 260, 150, () => {
    PF([[252, 34], [196, 14], [120, 30], [22, 34], [96, 58], [14, 86], [110, 84], [44, 124], [150, 108], [210, 120], [252, 100]], PAL.navy, { baseC: '#34407A', lw: 1.8, mottle: 4, pool: false });
    strokePath([[240, 60], [170, 54], [100, 66]], '#5A6AA8', 1.6, 'pen', 0.5);
  }, { v: 2, ax: 0.95, ay: 0.42 });
  defSprite('s06_hood_flap', 200, 120, () => {
    PF([[190, 30], [120, 18], [40, 40], [4, 70], [70, 66], [30, 104], [130, 84], [190, 90]], PAL.lilac, { baseC: mixc(PAL.lilac, PAL.lilacLt, 0.4), lw: 1.8, mottle: 3, pool: false });
    strokePath([[180, 50], [120, 50], [60, 62]], PAL.inkSoft, 1.4, 'pen', 0.5);
  }, { v: 2, ax: 0.95, ay: 0.45 });
  defSprite('s06_sign', 220, 300, () => {
    P(rrPts(100, 120, 20, 176, 8), PAL.gray, { baseC: PAL.grayLt, lw: 1.6 });
    P(rrPts(14, 20, 192, 110, 22), PAL.butter, { baseC: mixc(PAL.butter, PAL.butterLt, 0.5), lw: 2.2 });
    pen(PAL.ink, 1.4, 'pen'); brush.polygon(rrPts(24, 30, 172, 90, 16)); brush.noStroke();
  }, { v: 1, ay: 0.98 });
  const SPA0 = 0.75 * Math.PI, SPA1 = 2.25 * Math.PI;
  defSprite('s06_speedo', 440, 440, () => {
    const c = 220;
    P(ellPts(c, c, 204, 204, 48), PAL.navy, { baseC: PAL.nightLt, lw: 2.4 });
    P(ellPts(c, c, 178, 178, 48), PAL.cream, { baseC: '#FFFBF0', lw: 1.8 });
    const zones = [[PAL.mint, 0, 0.5], [PAL.butter, 0.5, 0.7], [PAL.orange, 0.7, 0.86], [PAL.red, 0.86, 1]];
    for (const [col, f0, f1] of zones) {
      const pts = [];
      for (let i = 0; i <= 12; i++) { const a = SPA0 + (SPA1 - SPA0) * lerp(f0, f1, i / 12); pts.push([c + Math.cos(a) * 168, c + Math.sin(a) * 168]); }
      for (let i = 12; i >= 0; i--) { const a = SPA0 + (SPA1 - SPA0) * lerp(f0, f1, i / 12); pts.push([c + Math.cos(a) * 138, c + Math.sin(a) * 138]); }
      PF(pts, col, { baseC: lite(col, 0.05), lw: 1.2, mottle: 3, pool: false });
    }
    pen(PAL.ink, 2.2, '2B');
    for (let i = 0; i <= 8; i++) { const a = SPA0 + ((SPA1 - SPA0) * i) / 8; brush.line(c + Math.cos(a) * 134, c + Math.sin(a) * 134, c + Math.cos(a) * 114, c + Math.sin(a) * 114); }
    brush.noStroke();
    for (let i = 0; i <= 8; i += 2) { const a = SPA0 + ((SPA1 - SPA0) * i) / 8; const t = textImg(String(i), { font: 'pixel', size: 32, fill: PAL.ink, weight: 700 }); image(t.img, c + Math.cos(a) * 90 - t.w / 2, c + Math.sin(a) * 90 - t.h / 2); }
    const lab = textImg('LR', { font: 'pixel', size: 38, fill: PAL.coralDk, weight: 700 }); image(lab.img, c - lab.w / 2, c + 66 - lab.h / 2);
  });

  // distance travelled (px at road parallax) and speed, closed form so frames stay pure
  const TN = 47.40 - T13; // nitro, local time
  const VN = 600 + 200 * TN + 120 * TN * TN;
  function dist13(T) {
    const t = T - T13;
    if (t < 0) return 600 * t;
    const pre = (x) => 600 * x + 100 * x * x + 40 * x * x * x;
    if (t < TN) return pre(t);
    const u = t - TN;
    return pre(TN) + VN * u + 3200 * (u - (1 - Math.exp(-4 * u)) / 4);
  }
  function speed13(T) {
    const t = T - T13;
    if (t < 0) return 600;
    if (t < TN) return 600 + 200 * t + 120 * t * t;
    return VN + 3200 * (1 - Math.exp(-4 * (t - TN)));
  }
  function tile(name, off, y, sc) {
    const w = sprW(name) * sc;
    for (let x = -400 - (((off % w) + w) % w) + w / 2; x - w / 2 < W + 400; x += w) spr(name, x, y, { s: sc, jit: 0 });
  }
  const SIGNS = [['SGD', 45.2, 1500], ['ADAM', 45.88, 1400], ['MIN →', 46.8, 1300], ['LR ↑', 47.55, 1250]];
  // valley placement (world at camera zoom 1); the spiral road is drawn live so it can spin
  const VX = 1270, VY = 488;
  function valley13(T, sc, spin) {
    spr('s06_valley', VX, VY, { s: sc, jit: 0 });
    const pts = [];
    for (let i = 0; i <= 72; i++) {
      const u = i / 72, f = 1 - u * 0.9, g = vring(f), th = u * 4.2 * Math.PI + spin;
      pts.push([VX + g.rx * Math.cos(th) * sc, VY + (g.cy + g.ry * Math.sin(th)) * sc]);
    }
    polyline(pts, PAL.ink, 10 * sc);
    polyline(pts, mixc(PAL.grayLt, PAL.cream, 0.5), 5.5 * sc);
    // global-minimum flag at the bottom of the bowl
    const fx = VX, fy = VY + VDEP * 0.93 * sc;
    segLine(fx, fy, fx, fy - 70 * sc, PAL.ink, 4 * sc);
    const fw = Math.sin(T * 9) * 6;
    noStroke(); fill(PAL.red); triangle(fx, fy - 70 * sc, fx + (44 + fw) * sc, fy - 58 * sc, fx, fy - 44 * sc);
    spr('sparkW', fx, fy - 76 * sc, { s: (0.25 + 0.12 * kick(T)) * sc, r: T * 2 });
  }

  function kart13(T, o) {
    // flames out of the exhausts (behind everything)
    if (o.fl > 0.01) {
      for (const [fx, fy, k] of [[-374, -68, 1], [-364, -104, 0.8]]) {
        const f = o.fl * k * (1 + 0.22 * Math.sin(T * 53 + fx));
        spr('flame', fx + 8, fy, { r: -Math.PI / 2, s: 2.1 * f, sy: 1 + 0.18 * Math.sin(T * 41 + fy), seed: fx | 0 });
        spr('flame', fx + 8, fy, { r: -Math.PI / 2, s: 1.1 * f, a: 0.95, seed: 7 });
      }
    }
    // Pip in the raised rear seat, hair streaming back
    const wind = o.wind;
    push(); translate(-150, -100);
    spr('s06_hood_flap', -40, -118, { s: 0.72 * (0.6 + 0.5 * wind), sx: 1 + 0.15 * Math.sin(T * 27 + 1), r: Math.sin(T * 21) * 0.08 * wind, seed: 3 });
    spr('s06_hair_wind', -46, -210, { s: 0.72 * (0.7 + 0.5 * wind), sx: 1 + 0.12 * Math.sin(T * 31), r: Math.sin(T * 23) * 0.06 * wind, seed: 2 });
    pip(0, 0, 0.72, { face: o.pipFace, armL: o.pipArm + Math.sin(T * 19) * 0.12, armR: o.pipArm + Math.sin(T * 17 + 1) * 0.12, r: o.pipR, lean: o.pipLean, headR: Math.sin(T * 9) * 0.05, hop: o.pipBob, seed: 3 });
    pop();
    // Clawd driving
    const cs = 0.62, cx = 150, cy = -6;
    clawd(cx, cy, cs, { eyes: o.clEyes, look: o.clLook, armL: o.clArmL, armR: o.clArmR, acc: o.shades >= 1 ? ['shades'] : [], mouth: o.clMouth, hop: o.clBob, r: o.clR, blush: o.clBlush });
    if (o.shades > 0 && o.shades < 1) {
      const drop = (1 - Ez.outBack(o.shades, 2.4)) * 110;
      spr('acc_shades', cx, cy - o.clBob - 6.5 * CU * cs - drop, { s: 0.95 * cs, r: (1 - o.shades) * 0.6 });
    }
    spr('s06_kart', 0, 0, { seed: 1 });
    spr('s06_steer', 318, -84, { r: Math.sin(T * 2.1) * 0.1 });
    // wheels (plus a blur disc at speed)
    for (const [wx, wy, r] of [[-205, 0, 58], [235, 12, 46]]) {
      spr('s06_wheel', wx, wy, { s: r / 62, r: o.wheel * (58 / r), jit: 0.3 });
      if (o.blur > 0) disc(wx, wy, r * 0.62, PAL.grayLt, 0.55 * o.blur);
    }
  }

  shot({
    id: 'L13-kart', t0: T13, tin: { type: 'swirl', d: 1.0, at: 0.5, c: [960, 540] },
    draw(s) {
      const T = s.T;
      const d = dist13(T), v = speed13(T);
      const tYou = w13(1), tOpt = w13(2), tAcc = w13(3);
      const nitro = T >= tAcc;
      const ant = sstep(47.1, 47.36, T) * (nitro ? 0 : 1);
      const boost = after(T, tAcc, 2.2);
      const launch = Ez.in(inv(48.02, 48.42, T));
      // valley size: slowly approaching, then rushing closer on nitro
      const vsc = 1.0 + 0.1 * inv(T13, 48.4, T) + 0.3 * Ez.in(inv(47.4, 48.5, T));
      const spin = 7 * Math.exp(-(T - 44.4) * 2.6);
      // camera: open tight on the spinning valley floor (the s05 vortex keeps turning), pull back to the kart
      const pull = Ez.inOut(inv(T13, 45.4, T));
      const punch = nitro ? 0.12 * sstep(tAcc, tAcc + 0.05, T) * Math.exp(-Math.max(0, T - tAcc - 0.05) * 2.4) : 0;
      const Z = lerp(2.3, 1.0, pull) + punch - 0.02 * ant;
      const cx = lerp(VX, 960, pull), cy = lerp(VY + VDEP * 0.8, 548, pull);
      const rot = 0.02 + 0.008 * Math.sin(T * 1.7) - boost * 0.035;
      push();
      cam(cx, cy, Z, rot);
      shake(boost * 9 + (nitro ? 2.2 : 0) + kick(T, 8) * 1.2, 4);
      spr('s06_sky', 960, 540, { s: 2.2, jit: 0 });
      for (let i = 0; i < 6; i++) {
        const span = 2800, x = (((R(i, 3) * span - d * 0.035 - T * 26) % span) + span) % span - 440;
        spr('cloud', x, 70 + R(i, 4) * 170, { s: 0.55 + R(i, 5) * 0.5, a: 0.95, seed: i });
      }
      tile('s06_hills_far', d * 0.03, 470, 2);
      valley13(T, vsc, spin);
      tile('s06_hills_mid', d * 0.26, 812, 2);
      // trees behind the road
      const toff = d * 0.62, sp = 320;
      for (let i = Math.floor((toff - 500) / sp); i <= Math.floor((toff + W + 500) / sp); i++) {
        const x = i * sp - toff + RS(i, 21) * 90;
        spr('s06_tree' + Math.floor(R(i, 22) * 3), x, 806 + R(i, 23) * 8, { s: 0.62 + R(i, 24) * 0.32, sy: 1 + 0.04 * kick(T, 7), r: Math.sin(T * 3 + i) * 0.03 + (nitro ? -0.05 : 0), seed: i });
      }
      // roadside signs (move with the road)
      for (const [lab, tk, xk] of SIGNS) {
        const x = xk + dist13(tk) - d;
        if (x < -300 || x > W + 300) continue;
        spr('s06_sign', x, 812, { s: 0.75, seed: Math.round(tk * 10) });
        txt(lab, x, 812 - 0.75 * 228, { font: 'pixel', size: 44, fill: PAL.ink, weight: 700 }, { s: 0.75 });
      }
      tile('s06_road', d, 910, 2);
      // lane dashes stretch with speed (motion blur)
      const dl = 110 + v * 0.07, per = 330;
      noStroke(); fill(withAlphaCol('#FFFFFF', 0.9));
      for (let x = -400 - (((d % per) + per) % per); x < W + 400; x += per) rect(x, 950, dl, 12, 6);
      tile('s06_verge', d * 1.35, 1052, 2);
      // kart position: zooms in from the left on "you're", surges on nitro, launches off at the end
      const enter = Ez.outBack(clamp(inv(44.95, tYou + 0.14, T)), 1.4);
      let kx = lerp(-800, 760, enter) + Math.sin(T * 2.1) * 16;
      kx += -46 * ant + (nitro ? 110 * Ez.outBack(clamp((T - tAcc) / 0.35)) : 0) + 3400 * launch;
      // skid burst on arrival, dust puffs from the rear wheel
      burst(T, tYou + 0.1, kx - 200, ROAD_Y - 20, { n: 10, names: ['puff'], spd: 500, g: -60, life: 0.8, s: 0.3, spread: 1.6, ang0: Math.PI * 1.05, seed: 11 });
      const per2 = 0.085;
      if (kx - 460 < W + 200) for (let k = 0; k < 9; k++) {
        const n = Math.floor(T / per2) - k, age = T - n * per2;
        spr('puff', kx - 240 - age * (260 + v * 0.3), ROAD_Y - 18 - age * 70, { s: 0.16 + age * 0.9, a: 0.55 * (1 - age / (9 * per2)), seed: n });
      }
      // rainbow trail once the kart hits nitro
      if (nitro) {
        const tr = [PAL.red, PAL.orange, PAL.butter, PAL.mint, PAL.sky, PAL.lilac];
        const ta = sstep(tAcc, tAcc + 0.15, T);
        for (let i = 0; i < tr.length; i++) {
          const y = ROAD_Y - 150 + i * 20, x1 = kx - 380;
          const x0 = Math.min(x1 - 60, x1 - (500 + 900 * inv(tAcc, 48.2, T)) - 3600 * launch);
          segLine(x0, y, x1, y, tr[i], 20, 0.85 * ta);
        }
      }
      // speed lines
      const sl = sstep(46.3, 47.3, T) * 0.35 + (nitro ? 0.5 : 0);
      if (sl > 0) streaks(T, 12 + (nitro ? 16 : 0), 61, '#FFFFFF', sl, 260 + v * 0.08, 6, v * 1.3, [-300, 250, W + 600, 820]);
      // the kart itself
      const hop = hopB(T) * 10 + boost * 26 * Math.abs(Math.sin((T - tAcc) * 9));
      let sx = lerp(1, 0.9, ant), sy = lerp(1, 1.1, ant);
      if (nitro) { const e = Ez.outElastic(clamp((T - tAcc) / 0.7)); sx *= lerp(1.38, 1.06, e); sy *= lerp(0.8, 0.96, e); }
      const land = kick(T, 12) + after(T, tYou + 0.14, 8) * 2;
      sx *= 1 + land * 0.035; sy *= 1 - land * 0.035;
      sx *= 1 + launch * 0.5; sy *= 1 - launch * 0.2;
      const wheelie = nitro ? -0.13 * Math.sin(Math.PI * clamp((T - tAcc) / 0.55)) : 0;
      if (kx - 460 < W + 200) {
      push();
      translate(kx, ROAD_Y);
      translate(-205, 0); rotate(wheelie); translate(205, 0);
      scale(sx, sy);
      translate(0, -58 - hop);
      const shadesK = clamp((T - tOpt + 0.12) / 0.3);
      const wave = sstep(tYou - 0.05, tYou + 0.1, T) * (1 - sstep(tOpt - 0.3, tOpt - 0.1, T));
      kart13(T, {
        fl: nitro ? 0.7 + 0.6 * boost : ant * 0.35 + after(T, tOpt, 5) * 0.5,
        wind: clamp(v / 3000),
        pipFace: nitro ? (T < tAcc + 0.5 ? 'pf_shock' : 'pf_scared') : T > tOpt + 0.1 ? 'pf_nervous' : 'pf_happy',
        pipArm: nitro ? 2.5 : 0.95, pipR: nitro ? -0.1 - boost * 0.08 : -0.03 * clamp(v / 2000), pipLean: nitro ? -0.28 : -0.08, pipBob: hopB(T + 0.15) * 5,
        clEyes: wave > 0.5 ? 'ce_happy' : 'ce_sq', clLook: [0.35, 0],
        clArmL: nitro ? -2.2 + Math.sin(T * 14) * 0.3 : -2.1 * wave + Math.sin(T * 16) * 0.3 * wave + 0.1,
        clArmR: lerp(0.3, 0.9, ant) + (nitro ? 0.15 : 0), shades: shadesK, clMouth: nitro ? 'smile' : undefined,
        clBob: hopB(T + 0.1) * 6, clR: nitro ? -0.07 : 0, clBlush: nitro || wave > 0.5,
        wheel: d / 58, blur: clamp((v - 1500) / 2500),
      });
      pop();
      }
      // gear-shift puff + stars on "optimizing", nitro blast on "accelerating"
      burst(T, tOpt, kx - 370, ROAD_Y - 120, { n: 8, names: ['puff', 'star5'], spd: 500, g: -100, life: 0.8, s: 0.35, spread: 1.4, ang0: Math.PI, seed: 21 });
      burst(T, tAcc, kx - 380, ROAD_Y - 110, { n: 16, names: ['star5', 'spark', 'blob_orange', 'blob_butter'], spd: 1300, g: 200, life: 0.9, s: 0.5, spread: 1.8, ang0: Math.PI, seed: 31 });
      // nitro shockwave: a ring of puffs blasting out of the exhaust + one fat smoke ball
      burst(T, tAcc, kx - 390, ROAD_Y - 95, { n: 10, names: ['puff'], spd: 900, g: -80, life: 0.7, s: 0.45, even: true, seed: 33 });
      if (nitro && T < tAcc + 0.6) spr('puff', kx - 470 - (T - tAcc) * 900, ROAD_Y - 90, { s: 0.5 + (T - tAcc) * 2.2, a: 1 - inv(tAcc + 0.2, tAcc + 0.6, T), seed: 9 });
      // exit whoosh when the kart launches out of frame
      burst(T, 48.2, 1500, ROAD_Y - 150, { n: 14, names: ['sparkW', 'spark', 'star5'], spd: 1100, g: 0, life: 0.6, s: 0.5, spread: 1.6, ang0: Math.PI, seed: 35 });
      // gleam on the shades
      if (T > tOpt + 0.2) spr('sparkW', kx + 230, ROAD_Y - 64 - 6.5 * CU * 0.62 - 26, { s: 0.45 * after(T, tOpt + 0.2, 4) + 0.001, r: T * 4 });
      pop();
      // speedometer (dashboard overlay)
      const frac = Math.min(1.03, (1.25 * v) / (v + 2200) + (nitro ? 0.18 * sstep(tAcc, tAcc + 0.25, T) : 0)) + kick(T) * 0.02 + (nitro ? Math.sin(T * 70) * 0.01 : 0) + after(T, tOpt, 7) * 0.08;
      push(); translate(1712, 868); shake(boost * 6, 9); scale(0.7 * (1 + after(T, tAcc, 5) * 0.12 + after(T, tOpt, 7) * 0.05));
      spr('s06_speedo', 0, 0, { jit: 0.4 });
      const na = SPA0 + (SPA1 - SPA0) * clamp(frac, 0, 1.03);
      segLine(0, 0, Math.cos(na) * 150, Math.sin(na) * 150, PAL.ink, 14);
      segLine(0, 0, Math.cos(na) * 140, Math.sin(na) * 140, PAL.coral, 6);
      disc(0, 0, 22, PAL.ink); disc(0, 0, 9, PAL.coral);
      if (nitro) glow(0, 0, 200, PAL.orange, 0.25 + 0.2 * Math.sin(T * 20));
      pop();
    },
  });
  // "accelerating," slides in stretched with trailing speed lines
  function accelWord(T, age, wd, a) {
    if (a <= 0) return;
    const k = clamp((age + 0.06) / 0.3), e = Ez.out(k);
    const dx = (1 - e) * -460, st = Ez.outBack(k, 2.2);
    const sx = lerp(2.0, 1, st) * (1 + 0.04 * Math.sin(T * 30)), sy = lerp(0.55, 1, st);
    const hw = (wd.img.tw / 2) * sx;
    for (let i = 0; i < 4; i++) {
      const y = (i - 1.5) * 20, len = (150 + R(i, 5) * 170) * (0.5 + 0.5 * (1 - e * 0.5));
      segLine(dx - hw - 24 - len, y, dx - hw - 24, y, i % 2 ? PAL.butter : '#FFFFFF', 9, a * 0.9);
    }
    drawImg(wd.img, dx + RS(G.boil, 7) * 3, RS(G.boil, 8) * 3, a, sx, sy);
  }
  lyr(13, { y: 150, size: 70, lead: 1.3, maxW: 1100, words: { 2: { fill: PAL.mint, anim: 'slide' }, 3: { size: 104, fill: PAL.orange, anim: 'type', draw: accelWord } } });

  // ================= L14: I feel my atoms rearranging =================
  const TX = 960, TB = 868, TTOP = 262, TR = 190; // tube axis, platform top (Pip's ground), tube top, tube radius
  // the atom heart must match the cage heart of L15 on screen (heart iris handoff)
  const Z14E = 1.12, CY14E = 530, HSCR = 516;
  const HS = 336, HY = CY14E + (HSCR - 540) / Z14E;
  const CAGE_X = 960, CAGE_Y = 618, CS = 290;
  const Z15S = (HS * Z14E) / CS, CY15S = CAGE_Y - (HSCR - 540) / Z15S;

  const ATOM_COLS = { lilac: PAL.lilac, navy: PAL.blue, skin: PAL.orange, red: PAL.red, pink: PAL.pink, coral: PAL.coral, butter: PAL.butter };
  for (const [nm, c] of Object.entries(ATOM_COLS)) {
    defSprite('s06_atom_' + nm, 110, 110, () => {
      const rings = [0, Math.PI / 3, -Math.PI / 3];
      for (const rot of rings) { pen(lite(c, 0.45), 1.8, 'pen'); brush.polygon(rotEll(55, 55, 48, 15, rot, 32)); }
      brush.noStroke();
      P(ellPts(55, 55, 21, 21, 24), c, { baseC: lite(c, 0.15), lw: 1.6 });
      flat(ellPts(48, 48, 6, 5, 10), '#FFFFFF', 0.9);
      rings.forEach((rot, k) => { const a = 0.6 + k * 2.1; const x = Math.cos(a) * 48, y = Math.sin(a) * 15; flat(ellPts(55 + x * Math.cos(rot) - y * Math.sin(rot), 55 + x * Math.sin(rot) + y * Math.cos(rot), 5.5, 5.5, 10), '#FFFFFF'); });
    }, { v: 1 });
  }
  // atom data (constant): home spot on Pip (pose armL = armR = 1.3, s = 1), helix path, heart target
  const ATOMS = (() => {
    const list = [];
    const add = (n, fn, col, sd) => { for (let i = 0; i < n; i++) { const [x, y] = fn(R(i, sd), R(i, sd + 1), i); list.push({ hx: x, hy: y, col }); } };
    add(16, (a, b) => { const r = 62 * Math.sqrt(a), th = b * TAU; return [Math.cos(th) * r, -236 + Math.sin(th) * r]; }, 'skin', 401);
    add(12, (a, b) => [(a - 0.5) * 150, -312 + b * 26 + Math.abs(a - 0.5) * 60], 'navy', 403);
    add(26, (a, b) => [(a - 0.5) * (126 + b * 34), -172 + b * 150], 'lilac', 405);
    add(10, (a, b, i) => [(i % 2 ? 1 : -1) * lerp(62, 126, a), lerp(-138, -120, a) + (b - 0.5) * 16], 'lilac', 407);
    add(4, (a, b, i) => [(i % 2 ? 1 : -1) * (138 + (a - 0.5) * 12), -114 + (b - 0.5) * 12], 'skin', 409);
    add(10, (a, b, i) => [(i % 2 ? 1 : -1) * 24 + (a - 0.5) * 20, -12 - b * 48], 'navy', 411);
    // heart targets: outline + three inner rings
    const vc = HY + HVC * HS, tg = [];
    for (const [k, n, col] of [[1, 32, 'red'], [0.72, 22, 'pink'], [0.45, 15, 'coral'], [0.19, 7, 'butter']]) {
      const pts = heartS(TX, vc - HVC * HS * k * 0.93, HS * k * 0.93, n);
      for (const p of pts) tg.push({ x: p[0], y: p[1], col });
    }
    list.forEach((a, i) => {
      const t = tg[(i * 29) % tg.length];
      a.tx = t.x; a.ty = t.y; a.tcol = t.col;
      a.rel = 50.16 + 0.62 * clamp(-a.hy / 340) + R(i, 431) * 0.05;
      a.rad = 60 + R(i, 433) * 110;
      a.ph = (a.hx >= 0 ? 0 : Math.PI) + RS(i, 434) * 0.3;
      a.w = 6 + R(i, 435) * 4;
      a.ytop = TTOP + 60 + R(i, 436) * 200;
      a.rise = 0.45 + R(i, 437) * 0.35;
      a.go = 50.94 + R(i, 438) * 0.24;
      a.arc = (R(i, 439) - 0.5) * 260;
      a.i = i;
    });
    return list;
  })();
  // position of atom a at time T (world), plus depth z (-1 back .. 1 front) and flight progress k
  function atomAt(a, T) {
    const t = T - a.rel;
    const ang = a.ph + t * a.w + t * t * 2;
    const sp = Ez.out(clamp(t / 0.35));
    const r = lerp(Math.abs(a.hx), a.rad, sp);
    let x = TX + Math.cos(ang) * r;
    let y = lerp(TB + a.hy, a.ytop + Math.sin(T * 3 + a.i) * 14, Ez.inOut(clamp(t / a.rise)));
    let z = Math.sin(ang);
    const k = clamp((T - a.go) / 0.5);
    if (k > 0) {
      const e = Ez.out(k), dx = a.tx - x, dy = a.ty - y, L = Math.hypot(dx, dy) || 1;
      const arc = Math.sin(Math.PI * k) * a.arc;
      x = lerp(x, a.tx, e) - (dy / L) * arc; y = lerp(y, a.ty, e) + (dx / L) * arc;
      z = lerp(z, 1, e);
    }
    return { x, y, z, k };
  }
  defSprite('s06_lab', 1000, 580, () => {
    flat(box(-10, -10, 1010, 432), '#27215A');
    flat(box(-10, 428, 1010, 590), '#161233');
    wash(-40, -40, 1080, 470, PAL.nightLt, 70, 0.05);
    blob(500, 230, 300, '#4A3F9A', 90, 0.4);
    blob(140, 110, 150, '#3A2F7E', 80, 0.4);
    blob(860, 140, 170, '#2E5A86', 70, 0.4);
    // big round window with stars behind the tube
    flat(ellPts(500, 215, 176, 176, 64), '#0E0C2A');
    for (let i = 0; i < 34; i++) { const a = random() * TAU, r = random() * 160, rr = 1.2 + random() * 2.2; flat(ellPts(500 + Math.cos(a) * r, 215 + Math.sin(a) * r, rr, rr, 8), '#FFFFFF', 0.5 + random() * 0.5); }
    flat(ellPts(590, 140, 24, 24, 24), PAL.pink); flat(ellPts(584, 134, 8, 6, 10), '#FFFFFF', 0.7);
    pen(PAL.pinkLt, 1.4, 'pen'); brush.polygon(rotEll(590, 140, 44, 10, -0.3, 30)); brush.noStroke();
    pen(PAL.lilac, 7, 'marker'); brush.circle(500, 215, 178); brush.noStroke();
    pen(PAL.ink, 1.6, '2B'); brush.circle(500, 215, 186); brush.noStroke();
    // wall panel seams + rivets
    pen('#3E3680', 1.6, 'pen'); for (let x = 60; x < 1000; x += 110) { if (Math.abs(x - 500) > 195) brush.line(x, 0, x, 425); } brush.noStroke();
    for (let x = 60; x < 1000; x += 110) if (Math.abs(x - 500) > 195) for (let y = 30; y < 420; y += 90) flat(ellPts(x - 8, y, 2.5, 2.5, 8), '#6A5FB0');
    pen(PAL.lilac, 1.6, '2B'); brush.line(-10, 430, 1010, 430); brush.noStroke();
  });
  defSprite('s06_tube_glass', 420, 660, () => {
    const g = rrPts(20, 20, 380, 620, 60);
    flat(g, PAL.skyLt, 0.1);
    flat(rrPts(34, 40, 90, 580, 40), '#FFFFFF', 0.05);
    pen(PAL.skyLt, 1.6, '2B'); brush.polygon(g); brush.noStroke();
  });
  defSprite('s06_tube_shine', 420, 660, () => {
    flat(rrPts(62, 70, 22, 520, 11), '#FFFFFF', 0.4);
    flat(rrPts(96, 90, 8, 480, 4), '#FFFFFF', 0.3);
    flat(rrPts(330, 110, 12, 420, 6), '#FFFFFF', 0.25);
    pen('#FFFFFF', 1.4, '2B'); brush.polygon(rrPts(20, 20, 380, 620, 60)); brush.noStroke();
  });
  defSprite('s06_tube_base', 560, 220, () => {
    PF(rrPts(30, 70, 500, 110, 40), PAL.gray, { baseC: '#6E6890', lw: 2.4 });
    PF(ellPts(280, 80, 230, 44, 48), PAL.grayLt, { baseC: '#A9A3C4', lw: 2 });
    PF(ellPts(280, 80, 190, 32, 48), PAL.mint, { baseC: mixc(PAL.mint, PAL.mintLt, 0.5), lw: 1.6 });
    for (let i = 0; i < 7; i++) flat(ellPts(90 + i * 63, 140, 12, 10, 14), [PAL.pink, PAL.butter, PAL.mint][i % 3]);
  }, { ay: 80 / 220 });
  defSprite('s06_tube_cap', 520, 200, () => {
    PF([[40, 150], [480, 150], [440, 70], [360, 30], [160, 30], [80, 70]], PAL.gray, { baseC: '#6E6890', lw: 2.4 });
    PF(rrPts(20, 140, 480, 44, 20), PAL.grayLt, { baseC: '#A9A3C4', lw: 2 });
    pen(PAL.ink, 4, 'marker'); brush.line(260, 30, 260, 2); brush.noStroke();
    for (let i = 0; i < 5; i++) flat(ellPts(140 + i * 60, 96, 11, 9, 14), [PAL.sky, PAL.pink, PAL.butter][i % 3]);
  }, { ay: 162 / 200 });
  defSprite('s06_coil', 300, 660, () => {
    PF(rrPts(40, 560, 220, 90, 18), PAL.gray, { baseC: '#6E6890', lw: 2.2 });
    PF(rrPts(110, 150, 80, 420, 30), PAL.lilac, { baseC: mixc(PAL.lilac, PAL.nightLt, 0.3), lw: 2 });
    pen(PAL.orange, 5, 'marker'); for (let y = 180; y < 550; y += 26) brush.line(112, y, 188, y + 8); brush.noStroke();
    PF(ellPts(150, 100, 84, 70, 40), PAL.grayLt, { baseC: '#C9C4DA', lw: 2.2 });
    flat(ellPts(126, 80, 20, 14, 16), '#FFFFFF', 0.8);
    for (let i = 0; i < 3; i++) flat(ellPts(90 + i * 60, 600, 12, 10, 14), [PAL.red, PAL.butter, PAL.mint][i]);
  }, { ay: 0.98 });
  defSprite('s06_console', 640, 340, () => {
    PF([[40, 110], [600, 110], [620, 320], [20, 320]], PAL.lilac, { baseC: mixc(PAL.lilac, PAL.nightLt, 0.25), lw: 2.4 });
    PF([[60, 40], [580, 40], [604, 116], [36, 116]], PAL.gray, { baseC: '#8E89A6', lw: 2.2 });
    PF(rrPts(380, 150, 180, 110, 16), '#141238', { baseC: '#1E1B4A', lw: 2 });
    for (let i = 0; i < 6; i++) flat(ellPts(110 + i * 42, 78, 13, 10, 14), [PAL.red, PAL.butter, PAL.mint, PAL.sky, PAL.pink, PAL.orange][i]);
    PF(rrPts(70, 150, 200, 130, 10), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6 }); // clipboard
    pen(PAL.gray, 2, 'pen'); for (let i = 0; i < 4; i++) brush.line(92, 186 + i * 22, 240 - (i % 2) * 40, 186 + i * 22); brush.noStroke();
  }, { v: 1, ay: 0.95 });
  defSprite('s06_lever', 80, 200, () => {
    PF(rrPts(34, 30, 12, 160, 6), PAL.grayLt, { baseC: '#FFFFFF', lw: 1.6 });
    PF(ellPts(40, 30, 24, 24, 20), PAL.red, { baseC: '#FF7A88', lw: 1.8 });
  }, { ay: 0.92 });
  defSprite('s06_bigbtn', 160, 110, () => {
    PF(rrPts(14, 60, 132, 40, 14), PAL.gray, { baseC: '#8E89A6', lw: 1.8 });
    PF(ellPts(80, 58, 52, 32, 28), PAL.red, { baseC: '#FF6F80', lw: 2 });
    flat(ellPts(64, 48, 12, 7, 12), '#FFFFFF', 0.8);
  }, { ay: 0.82 });
  defSprite('s06_big_heart', 760, 700, () => {
    const pts = heartS(380, 300, 330, 72);
    P(pts, PAL.pink, { baseC: mixc(PAL.pink, PAL.pinkLt, 0.35), a: 150, lw: 2.6 });
    flat(ellPts(380, 380, 190, 150, 40), PAL.red, 0.12);
    flat(ellPts(250, 200, 50, 34, 24), '#FFFFFF', 0.5);
  }, { v: 2, ax: 0.5, ay: 300 / 700 });
  function zapArc(x0, y0, x1, y1, seed, a) {
    const n = 9, pts = [], L = Math.hypot(x1 - x0, y1 - y0);
    for (let i = 0; i <= n; i++) { const t = i / n, j = i === 0 || i === n ? 0 : RS(G.boil * 3 + i, seed) * 34; pts.push([lerp(x0, x1, t) - ((y1 - y0) / L) * j, lerp(y0, y1, t) + ((x1 - x0) / L) * j]); }
    blendMode(ADD); polyline(pts, PAL.sky, 14, 0.35 * a); blendMode(BLEND);
    polyline(pts, '#FFFFFF', 4, a);
  }
  function streakMask(p) {
    let y = -10, i = 0;
    while (y < H + 10) {
      const h = 18 + R(i, 92) * 46, e = clamp(p * 1.55 - R(i, 91) * 0.55);
      if (e > 0) { const th = h * lerp(0.35, 1.25, Ez.inOut(e)); rect(-160, y + (h - th) / 2, (W + 320) * Ez.inOut(e), th, th / 2); }
      y += h; i++;
    }
  }
  shot({
    id: 'L14-atoms', t0: T14, tin: { type: 'mask', d: 0.5, at: 0.5, mask: streakMask },
    draw(s) {
      const T = s.T;
      const tFeel = w14(1), tMy = w14(2), tAtoms = w14(3), tRe = w14(4);
      const zp = Ez.inOut(inv(48.3, 52.72, T));
      const Z = 1 + (Z14E - 1) * zp + 0.03 * after(T, tRe, 4) + 0.02 * after(T, tAtoms, 5);
      const cy = lerp(540, CY14E, zp);
      push();
      cam(960, cy, Z);
      shake(after(T, tAtoms, 6) * 7 + after(T, tRe, 6) * 6, 5);
      spr('s06_lab', 960, 540, { s: 2.2, jit: 0 });
      // floor grid
      const grid = [];
      for (let i = -9; i <= 9; i++) grid.push([960 + i * 40, 862, 960 + i * 190, 1140]);
      for (let k = 0; k < 5; k++) { const y = 870 + k * k * 16 + k * 20; grid.push([-100, y, W + 100, y]); }
      segLines(grid, PAL.teal, 2, 0.28);
      // blinking wall lights
      const b = beatAt(T);
      const lights = {};
      const addL = (c, on, x, y) => { const k = c + (on ? 1 : 0); (lights[k] = lights[k] || { c, on, pts: [] }).pts.push([x, y, x + 0.01, y]); };
      for (let i = 0; i < 12; i++) {
        addL([PAL.mint, PAL.pink, PAL.butter][i % 3], R(i + b.i * 13, 5) > 0.45, 110 + i * 28, 250);
        addL([PAL.sky, PAL.butter, PAL.pink][i % 3], R(i + b.i * 7, 6) > 0.5, 1520 + i * 26, 230);
      }
      for (const k in lights) segLines(lights[k].pts, lights[k].c, 12, lights[k].on ? 0.95 : 0.25);
      // cables
      noFill(); stroke(PAL.ink); strokeWeight(16); bezier(520, 950, 640, 1000, 700, 960, 760, 930); bezier(1160, 930, 1240, 990, 1300, 980, 1360, 960);
      stroke(PAL.lilac); strokeWeight(9); bezier(520, 950, 640, 1000, 700, 960, 760, 930); bezier(1160, 930, 1240, 990, 1300, 980, 1360, 960); noStroke();
      // coil tower + zaps on the beats
      spr('s06_coil', 430, 950, { s: 1, seed: 2 });
      const energy = sstep(tMy - 0.2, tAtoms, T) * (1 - 0.6 * sstep(51.6, 52.2, T));
      const zk = Math.exp(-b.ph * 5);
      const big = after(T, tAtoms, 5) + after(T, tRe, 5);
      const za = clamp(energy * zk + big + (T < tMy ? 0.5 * zk * sstep(48.6, 48.9, T) : 0));
      if (za > 0.05) { zapArc(430, 350, TX - TR + 10, 420 + R(b.i, 3) * 360, 11, za); if (big > 0.2) zapArc(430, 350, TX - TR + 10, 360 + R(b.i, 4) * 200, 12, big); }
      glow(430, 350, 120, PAL.sky, 0.25 + 0.35 * za);
      // tube: base glow, platform, back glass
      glow(TX, TB, 260, PAL.mint, 0.3 + 0.3 * energy + 0.3 * after(T, tAtoms, 3));
      spr('s06_tube_base', TX, TB, { s: 1, jit: 0.3 });
      spr('s06_tube_glass', TX, (TTOP + TB) / 2 - 20, { sx: (TR * 2 + 40) / 400, sy: (TB - TTOP + 60) / 640, jit: 0 });
      // rising energy rings
      if (T > tMy - 0.3) {
        noFill();
        for (let k = 0; k < 4; k++) {
          const age = fract((T - tMy) * 1.6 + k / 4), y = lerp(TB - 10, TTOP + 40, age);
          stroke(withAlphaCol(k % 2 ? PAL.mint : PAL.sky, (1 - age) * 0.8 * energy)); strokeWeight(5); ellipse(TX, y, TR * 1.9, 46);
        }
        noStroke();
      }
      // --- Pip ---
      const arrive = inv(48.34, 48.72, T);
      const dizzy = T < tFeel;
      const front = TB - 350 * Ez.inOut(inv(tAtoms, tAtoms + 0.66, T)); // dissolve line rising from the feet
      const pose = sstep(tFeel - 0.05, tFeel + 0.2, T);
      const vib = sstep(tFeel, tAtoms, T) * 4;
      const pipO = {
        face: dizzy ? 'pf_dizzy' : 'pf_shock',
        armL: lerp(0.25 + Math.sin(T * 5) * 0.15, 1.3, pose), armR: lerp(0.25 - Math.sin(T * 5) * 0.15, 1.3, pose),
        r: dizzy ? Math.sin(T * 6.5) * 0.07 : 0, headR: dizzy ? Math.sin(T * 6.5 + 1) * 0.12 : 0,
        hop: dizzy ? hopB(T) * 6 : 0,
        sq: lerp(0.25, 1, Ez.outElastic(arrive)), seed: 4,
      };
      const px = TX + RS(G.boil, 31) * vib;
      const L = ATOMS, pos = new Array(L.length);
      for (let i = 0; i < L.length; i++) pos[i] = T >= L[i].rel ? atomAt(L[i], T) : null;
      const hb = sstep(51.25, 51.7, T);
      const beat = kick(T, 5) * hb;
      const vc = HY + HVC * HS;
      const drawAtom = (a, p) => {
        const flip = clamp((p.k - 0.3) / 0.3);
        const col = flip >= 0.5 ? a.tcol : a.col;
        let x = p.x, y = p.y;
        if (hb > 0) { x = TX + (x - TX) * (1 + 0.05 * beat); y = vc + (y - vc) * (1 + 0.05 * beat); }
        const sc = lerp(0.46, 0.6, p.k) * (0.8 + 0.25 * p.z);
        spr('s06_atom_' + col, x, y, { s: sc, sx: flip > 0 && flip < 1 ? Math.abs(Math.cos(Math.PI * flip)) + 0.05 : 1, r: T * (2 + (a.i % 3)) + a.i, seed: a.i, jit: 0.4 });
      };
      // atoms behind the helix axis
      for (let i = 0; i < L.length; i++) if (pos[i] && pos[i].z < 0 && pos[i].k <= 0) drawAtom(L[i], pos[i]);
      if (T > 48.36 && T < tAtoms + 0.75) {
        if (T < tAtoms) pip(px, TB, 1, pipO);
        else { push(); clip(() => { noStroke(); fill(0, 0); rect(-200, -200, W + 400, front + 200); }); pip(px, TB, 1, pipO); pop(); } // Pip above the rising dissolve line
      }
      // teleport beam arriving from the left (the kart's rainbow trail becomes the beam)
      if (T < 48.6) {
        const bx = lerp(-200, TX, Ez.out(inv(48.16, 48.36, T)));
        const ba = 1 - inv(48.4, 48.6, T);
        const tr = [PAL.red, PAL.orange, PAL.butter, PAL.mint, PAL.sky, PAL.lilac];
        for (let i = 0; i < tr.length; i++) segLine(-200, 640 + i * 18, bx, 640 + i * 18, tr[i], 18, 0.9 * ba);
        glow(bx, 690, 160, '#FFFFFF', 0.5 * ba);
      }
      burst(T, 48.38, TX, 690, { n: 14, names: ['spark', 'sparkW', 'star5'], spd: 900, g: 0, life: 0.7, s: 0.45, even: true, seed: 41 });
      // dizzy stars orbiting Pip's head
      if (dizzy && T > 48.4) {
        for (let i = 0; i < 3; i++) { const a = T * 6 + (i * TAU) / 3; spr('star5', TX + Math.cos(a) * 80, TB - 395 + Math.sin(a) * 20, { s: 0.3, r: T * 5 + i, a: 1 - inv(tFeel - 0.2, tFeel, T), seed: i }); }
      }
      // shimmer on Pip before the dissolve
      if (T > tFeel && T < tAtoms + 0.7) twinkles(T * 2, 10, 51, [TX - 130, Math.max(front - 360, TB - 380), 260, 360], ['sparkW', 'spark'], 0.1, 0.22, 9);
      // scan ring at the dissolve line
      if (T > tAtoms && T < tAtoms + 0.8) {
        const ra = 1 - inv(tAtoms + 0.6, tAtoms + 0.8, T);
        glow(TX, front, 150, PAL.mint, 0.5 * ra);
        noFill(); stroke(withAlphaCol('#FFFFFF', ra)); strokeWeight(5); ellipse(TX, front, 300, 50); stroke(withAlphaCol(PAL.mint, ra)); strokeWeight(12); ellipse(TX, front, 320, 58); noStroke();
      }
      // front glass + cap (the heart forms in front of the tube)
      spr('s06_tube_shine', TX, (TTOP + TB) / 2 - 20, { sx: (TR * 2 + 40) / 400, sy: (TB - TTOP + 60) / 640, a: 0.9 - 0.5 * hb, jit: 0 });
      spr('s06_tube_cap', TX, TTOP, { s: 1, jit: 0.3 });
      disc(TX, TTOP - 160, 12, PAL.butter); glow(TX, TTOP - 160, 50, PAL.butter, 0.4 + 0.4 * kick(T));
      // painted heart fades in under the atoms, beating on the beats
      if (T > 51.2) {
        glow(TX, vc, 420, PAL.pink, 0.35 * hb + 0.3 * beat);
        spr('s06_big_heart', TX, HY, { s: (HS / 330) * (1 + 0.05 * beat), a: hb * 0.95 });
        // the heart becomes the nucleus of one giant atom
        noFill();
        for (let k = 0; k < 3; k++) {
          const rot = (k * Math.PI) / 3 + T * 0.4;
          push(); translate(TX, vc); rotate(rot);
          stroke(withAlphaCol(k === 1 ? PAL.butter : PAL.mint, 0.85 * hb)); strokeWeight(6); ellipse(0, 0, HS * 2.7 * (0.6 + 0.4 * hb), HS * 0.75);
          const ea = T * 3.2 + k * 2.1; spr('spark', Math.cos(ea) * HS * 1.35 * (0.6 + 0.4 * hb), Math.sin(ea) * HS * 0.375, { s: 0.4 * hb, r: T * 4, seed: k });
          pop();
        }
        noStroke();
      }
      // atoms in front (and all flying/assembled ones), with a soft additive glow
      blendMode(ADD);
      for (let i = 0; i < L.length; i++) { const p = pos[i]; if (p && (p.z >= 0 || p.k > 0)) disc(p.x, p.y, 28, ATOM_COLS[p.k > 0.45 ? L[i].tcol : L[i].col], 0.16 * (1 - hb * 0.7)); }
      blendMode(BLEND);
      for (let i = 0; i < L.length; i++) if (pos[i] && (pos[i].z >= 0 || pos[i].k > 0)) drawAtom(L[i], pos[i]);
      // flash when the heart completes
      if (T > 51.6 && T < 52.1) { blendMode(ADD); disc(TX, vc, 900, PAL.pink, 0.22 * after(T, 51.64, 7)); blendMode(BLEND); }
      burst(T, 51.64, TX, vc, { n: 20, names: ['heart', 'heartR', 'spark', 'sparkW'], spd: 1300, g: 200, life: 1.0, s: 0.5, even: true, seed: 55 });
      // --- Clawd at the console ---
      const clx = 1580, cly = 872, cs = 0.85;
      const reach = sstep(tMy - 0.05, tAtoms - 0.04, T), yank = sstep(tAtoms - 0.04, tAtoms + 0.03, T);
      const press = sstep(tRe - 0.22, tRe - 0.05, T), slam = sstep(tRe - 0.05, tRe + 0.02, T);
      const love = T > tRe;
      const typ = T < tMy ? (b.i % 2 ? 1 : -1) * kick(T, 8) : 0;
      let armL = 0.45 + typ * 0.4, armR = 0.45 - typ * 0.4;
      armL = lerp(armL, -1.0, reach); armL = lerp(armL, 0.75, yank);
      armR = lerp(armR, -1.4, press * (1 - slam)); armR = lerp(armR, 0.6, slam);
      if (love) { armL = lerp(armL, -2.2 + Math.sin(T * 12) * 0.3, sstep(tRe + 0.3, tRe + 0.5, T)); armR = lerp(armR, -2.2 - Math.sin(T * 12) * 0.3, sstep(tRe + 0.35, tRe + 0.55, T)); }
      clawd(clx, cly, cs, { eyes: love ? 'ce_heart' : 'ce_sq', look: love ? [0, 0] : [-0.6, 0.1], armL, armR, blush: love, hop: love ? hopB(T) * 16 : hopB(T) * 5, eyeS: love ? 1.1 + 0.25 * kick(T) : 1 });
      const csx = 1580, csy = 1050, ck = 0.92; // console anchor and scale
      const cxp = (u) => csx + (u - 320) * ck, cyp = (v) => csy + (v - 323) * ck;
      spr('s06_console', csx, csy, { s: ck });
      // monitor wave
      const mx = cxp(470), my = cyp(205);
      const wv = [], amp = 12 + 22 * energy;
      for (let i = 0; i < 16; i++) { const x0 = mx - 72 + i * 9; wv.push([x0, my + Math.sin(T * 14 + i * 0.8) * amp * 0.5, x0 + 9, my + Math.sin(T * 14 + (i + 1) * 0.8) * amp * 0.5]); }
      segLines(wv, love ? PAL.pink : PAL.mint, 3);
      spr('paperclip', cxp(236), cyp(150), { s: 0.3, r: 0.4 });
      // lever (yanked on "atoms") and big button (slammed on "rearranging")
      spr('s06_lever', cxp(40), cyp(60), { r: lerp(-0.55, 0.65, Ez.outBack(yank, 2)) });
      spr('s06_bigbtn', cxp(560), cyp(60), { sy: 1 - 0.3 * slam * (1 - inv(tRe + 0.1, tRe + 0.3, T)) });
      if (love) burst(T, tRe + 0.02, cxp(560), cyp(30), { n: 10, names: ['heart', 'spark'], spd: 600, g: 300, life: 0.8, s: 0.35, spread: 2, ang0: -Math.PI / 2, seed: 57 });
      for (let i = 0; i < 6; i++) disc(cxp(110 + i * 42), cyp(78), 7, '#FFFFFF', R(i + b.i * 5, 9) > 0.5 ? 0.8 : 0);
      pop();
    },
  });
  function atomsWord(T, age, wd, a) {
    if (a <= 0) return;
    const Ls = letters(wd.w, wd.ws, [PAL.pink, PAL.mint, PAL.butter, PAL.sky, PAL.lilac]);
    noFill(); stroke(withAlphaCol(PAL.butter, a * 0.9)); strokeWeight(4);
    push(); rotate(-0.12); ellipse(0, 4, wd.img.tw + 70, 64); pop(); noStroke();
    const ea = T * 5, rx = wd.img.tw / 2 + 35, c = Math.cos(-0.12), sn = Math.sin(-0.12);
    disc(Math.cos(ea) * rx * c - Math.sin(ea) * 32 * sn, 4 + Math.cos(ea) * rx * sn + Math.sin(ea) * 32 * c, 9, PAL.butter, a);
    Ls.forEach((L, i) => drawImg(L.im, L.x, Math.sin(T * 9 + i * 1.3) * 7, a, 1, 1, Math.sin(T * 6 + i) * 0.12));
  }
  const REPERM = [7, 2, 9, 0, 5, 10, 3, 1, 8, 4, 6];
  function rearrWord(T, age, wd, a) {
    if (a <= 0) return;
    const Ls = letters(wd.w, wd.ws, null);
    const n = Ls.length;
    Ls.forEach((L, i) => {
      const from = Ls[REPERM[i % REPERM.length] % n].x;
      const k = Ez.outBack(clamp((age - 0.12 - i * 0.035) / 0.34), 1.8);
      const x = lerp(from, L.x, k), y = -Math.sin(Math.PI * clamp(k)) * 70 * (i % 2 ? 1 : -1) + (k < 0.01 ? RS(G.boil + i, 3) * 6 : 0);
      drawImg(L.im, x, y, a, 1, 1, (1 - clamp(k)) * (i % 2 ? 0.5 : -0.5));
    });
  }
  lyr(14, { y: 132, words: { 3: { draw: atomsWord }, 4: { anim: 'type', fill: PAL.pinkLt, draw: rearrWord } } });

  // ================= L15: Sydney, please let me free =================
  // Sydney: an original pink chat-bubble creature (rounded speech bubble + wagging tail), heart eyes, lashes, bow, blush.
  const SA = 372, SB = 236; // bubble half-size
  defSprite('s06_syd_body', 860, 600, () => {
    const cx = 430, cy = 290, e = 2 / 4.2, pts = [];
    for (let i = 0; i < 96; i++) { const th = (i / 96) * TAU, c = Math.cos(th), s = Math.sin(th); pts.push([cx + SA * Math.sign(c) * Math.pow(Math.abs(c), e), cy + SB * Math.sign(s) * Math.pow(Math.abs(s), e)]); }
    P(pts, PAL.pink, { baseC: '#FF9CC4', a: 120, lw: 2.8, inset: 0.92 });
    flat(ellPts(cx, cy + 170, 320, 60, 40), '#F06A9C', 0.25);
    flat(ellPts(cx - 262, cy - 150, 34, 20, 20), '#FFFFFF', 0.85);
    flat(ellPts(cx - 220, cy - 176, 9, 7, 12), '#FFFFFF', 0.85);
    for (const sd of [-1, 1]) { flat(ellPts(cx + sd * 245, cy + 44, 50, 36, 24), PAL.red, 0.2); flat(ellPts(cx + sd * 245, cy + 44, 34, 24, 20), PAL.red, 0.18); }
    pen('#FFFFFF', 1.8, 'pen'); for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) brush.line(cx + sd * (226 + k * 18), cy + 28, cx + sd * (218 + k * 18), cy + 54); brush.noStroke();
  }, { v: 2, ax: 0.5, ay: 290 / 600 });
  defSprite('s06_syd_tail', 260, 220, () => {
    PF(rrPtsPoly([[30, 20], [150, 30], [240, 196], [120, 110], [20, 90]], 16), PAL.pink, { baseC: '#FF9CC4', lw: 2.6, mottle: 4 });
  }, { v: 2, ax: 60 / 260, ay: 60 / 220 });
  // heart eye with long lashes on the upper-left lobe (flip for the right eye)
  defSprite('s06_syd_eye', 280, 250, () => {
    P(heartS(150, 138, 80, 48), PAL.red, { baseC: '#FF5E80', a: 170, lw: 2.6 });
    flat(ellPts(156, 164, 34, 22, 20), '#FF9FB8', 0.5);
    flat(ellPts(122, 110, 17, 13, 16), '#FFFFFF', 0.95);
    flat(ellPts(172, 172, 8, 6, 12), '#FFFFFF', 0.85);
    for (const [x, y, dx, dy] of [[114, 80, -8, -44], [92, 88, -32, -34], [74, 104, -44, -14]]) strokePath([[x, y], [x + dx * 0.55, y + dy * 0.75], [x + dx, y + dy]], PAL.ink, 4.4, 'pen', 0.5);
  }, { v: 2 });
  defSprite('s06_syd_eye_shut', 280, 250, () => {
    const arc = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.1 + 0.8 * (i / 12)); arc.push([150 - Math.cos(a) * 70, 128 + Math.sin(a) * 30]); }
    const low = arc.map(([x, y]) => [x, y + 12]).reverse();
    P([...arc, ...low], PAL.ink, { baseC: PAL.ink, lw: 1.4 });
    for (const [x, y, dx, dy] of [[90, 140, -24, 22], [112, 152, -14, 30], [138, 158, -2, 32]]) strokePath([[x, y], [x + dx * 0.6, y + dy * 0.7], [x + dx, y + dy]], PAL.ink, 4, 'pen', 0.5);
  }, { v: 1 });
  defSprite('s06_syd_smile', 220, 160, () => {
    const lip = [], mouth = [];
    for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI; lip.push([110 + Math.cos(a) * 84, 42 + Math.sin(a) * 80]); mouth.push([110 + Math.cos(a) * 70, 48 + Math.sin(a) * 64]); }
    lip.push([28, 36], [110, 46], [192, 36]);
    P(lip, PAL.red, { baseC: '#FF4F6E', lw: 2.2 });
    P(mouth, '#7A1A3E', { baseC: '#8E2450', lw: 1.2 });
    P(ellPts(110, 92, 36, 18, 20), PAL.pink, { baseC: PAL.pinkLt, lw: 1.2 });
  }, { v: 1 });
  defSprite('s06_syd_pucker', 170, 150, () => {
    P([[30, 72], [58, 40], [80, 38], [85, 50], [90, 38], [112, 40], [140, 72], [85, 80]], PAL.red, { baseC: '#FF4F6E', lw: 2 });
    P([[32, 76], [85, 84], [138, 76], [116, 110], [85, 120], [54, 110]], PAL.red, { baseC: '#FF4F6E', lw: 2 });
    flat(ellPts(104, 96, 10, 6, 10), '#FFFFFF', 0.7);
  }, { v: 1 });
  defSprite('s06_syd_oh', 150, 150, () => {
    P(ellPts(75, 75, 48, 56, 32), PAL.red, { baseC: '#FF4F6E', lw: 2 });
    P(ellPts(75, 78, 32, 40, 28), '#7A1A3E', { baseC: '#8E2450', lw: 1.2 });
  }, { v: 1 });
  defSprite('s06_syd_bow', 340, 220, () => {
    P([[170, 110], [40, 30], [18, 110], [44, 188]], PAL.red, { baseC: '#FF5E7A', lw: 2.4 });
    P([[170, 110], [300, 30], [322, 110], [296, 188]], PAL.red, { baseC: '#FF5E7A', lw: 2.4 });
    for (const [x, y] of [[70, 80], [60, 140], [100, 110], [270, 80], [280, 140], [240, 110]]) flat(ellPts(x, y, 9, 9, 12), '#FFFFFF', 0.9);
    P(ellPts(170, 110, 34, 38, 20), '#D42A48', { baseC: PAL.red, lw: 2.2 });
  }, { v: 2 });
  defSprite('s06_syd_arm', 130, 250, () => {
    P(rrPts(38, 12, 54, 170, 27), PAL.pink, { baseC: '#FF9CC4', lw: 2.2 });
    P(ellPts(65, 190, 40, 38, 24), PAL.pink, { baseC: '#FFB3CF', lw: 2.2 });
  }, { v: 2, ax: 0.5, ay: 0.12 });
  // heart birdcage: back (fill, faint back bars, perch), front (frame, bars, belts, hook), door, lock
  const CGW = 700, CGH = 660, CGX = 350, CGY = 270;
  const DX0 = CGX - 100, DX1 = CGX + 100, DY0 = CGY - 12, DY1 = CGY + 206;
  defSprite('s06_cage_back', CGW, CGH, () => {
    const hp = heartS(CGX, CGY, CS, 72);
    P(hp, PAL.pinkLt, { baseC: '#FFF0F6', baseA: 0.9, a: 90, line: false, c: [CGX, CGY + HVC * CS], inset: 0.9 });
    for (let x = CGX - CS + 52; x <= CGX + CS - 30; x += 44) { const [y0, y1] = crossV(hp, x); if (y1 - y0 > 20) { pen(mixc(PAL.gold, '#FFFFFF', 0.45), 2, 'pen'); brush.line(x, y0 + 12, x, y1 - 12); } }
    brush.noStroke();
    const py = CGY + 0.4 * CS, [xl, xr] = crossH(hp, py);
    P(rrPts(xl + 8, py - 2, xr - xl - 16, 16, 8), PAL.brown, { baseC: PAL.brownLt, lw: 1.6 });
  }, { ax: CGX / CGW, ay: CGY / CGH });
  defSprite('s06_cage_front', CGW, CGH, () => {
    const hp = heartS(CGX, CGY, CS, 72);
    for (let x = CGX - CS + 30; x <= CGX + CS - 30; x += 44) {
      const [y0, y1] = crossV(hp, x);
      const segs = x > DX0 - 4 && x < DX1 + 4 ? [[y0, DY0], [DY1, y1]] : [[y0, y1]];
      for (const [a, b] of segs) if (b - a > 8) { pen(PAL.gold, 4.2, 'marker'); brush.line(x, a, x, b); pen(PAL.ink, 1.1, 'pen'); brush.line(x + 3.5, a, x + 3.5, b); }
    }
    for (const yb of [DY0, DY1]) { const [xl, xr] = crossH(hp, yb); pen(PAL.gold, 5, 'marker'); brush.line(xl, yb, xr, yb); pen(PAL.ink, 1.1, 'pen'); brush.line(xl, yb + 5, xr, yb + 5); }
    brush.noStroke();
    const vc = CGY + HVC * CS;
    pen(PAL.gold, 9, 'marker'); brush.polygon(hp);
    pen(PAL.ink, 1.8, '2B'); brush.polygon(scalePts(hp, CGX, vc, 1.03)); brush.polygon(scalePts(hp, CGX, vc, 0.97));
    brush.noStroke();
    const ny = CGY - 0.56 * CS;
    pen(PAL.gold, 7, 'marker'); brush.circle(CGX, ny - 34, 22); pen(PAL.ink, 1.4, 'pen'); brush.circle(CGX, ny - 34, 27); brush.noStroke();
    P([[CGX, ny - 4], [CGX - 60, ny - 30], [CGX - 56, ny + 14]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.6 });
    P([[CGX, ny - 4], [CGX + 60, ny - 30], [CGX + 56, ny + 14]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.6 });
    P(ellPts(CGX, ny - 6, 13, 12, 14), PAL.red, { baseC: '#FF6F86', lw: 1.4 });
  }, { v: 2, ax: CGX / CGW, ay: CGY / CGH });
  defSprite('s06_cage_door', 240, 260, () => {
    for (const x of [36, 80, 124, 168, 212]) { pen(PAL.gold, 4.2, 'marker'); brush.line(x, 26, x, 234); pen(PAL.ink, 1.1, 'pen'); brush.line(x + 3.5, 26, x + 3.5, 234); }
    pen(PAL.gold, 6, 'marker'); brush.polygon(rrPts(20, 20, 200, 218, 18));
    pen(PAL.ink, 1.6, '2B'); brush.polygon(rrPts(15, 15, 210, 228, 20)); brush.noStroke();
    P(heartS(120, 62, 26, 32), PAL.red, { baseC: '#FF6F86', lw: 1.4 });
  }, { v: 2, ax: 20 / 240, ay: 129 / 260 });
  defSprite('s06_lock', 120, 150, () => {
    pen(PAL.gray, 7, 'marker'); brush.spline([[36, 70], [36, 30], [60, 16], [84, 30], [84, 70]], 0.5); pen(PAL.ink, 1.4, 'pen'); brush.spline([[30, 70], [30, 28], [60, 10], [90, 28], [90, 70]], 0.5); brush.noStroke();
    P(heartS(60, 88, 44, 40), PAL.gold, { baseC: PAL.butter, lw: 2 });
    flat(ellPts(60, 90, 7, 7, 12), PAL.ink); flat([[56, 92], [64, 92], [62, 112], [58, 112]], PAL.ink);
  }, { v: 2 });
  defSprite('s06_kiss', 150, 120, () => {
    P([[18, 56], [46, 30], [66, 28], [75, 40], [84, 28], [104, 30], [132, 56], [75, 62]], PAL.red, { baseC: '#FF4F6E', a: 190, lw: 1.2, lc: '#A81E3A' });
    P([[20, 60], [75, 66], [130, 60], [110, 88], [75, 98], [40, 88]], PAL.red, { baseC: '#FF4F6E', a: 190, lw: 1.2, lc: '#A81E3A' });
    pen('#FFB0C0', 1.2, 'pen'); for (let i = 0; i < 5; i++) brush.line(50 + i * 12, 70, 52 + i * 12, 88); brush.noStroke();
  }, { v: 1 });
  defSprite('s06_letter', 180, 140, () => {
    P(rrPts(14, 24, 152, 100, 10), PAL.cream, { baseC: '#FFFBF0', lw: 2 });
    pen(PAL.ink, 1.6, '2B'); brush.line(16, 28, 90, 82); brush.line(164, 28, 90, 82); brush.noStroke();
    P(heartS(90, 78, 18, 28), PAL.red, { baseC: '#FF6F86', lw: 1.4 });
  }, { v: 1 });
  defSprite('s06_mini_bubble', 240, 170, () => {
    P(rrPts(20, 20, 200, 110, 50), '#FFFFFF', { baseC: '#FFFFFF', lw: 2.2, lc: PAL.inkSoft });
    P([[70, 120], [40, 160], [110, 124]], '#FFFFFF', { baseC: '#FFFFFF', lw: 2, lc: PAL.inkSoft });
  }, { v: 1 });
  defSprite('s06_love_bg', 1000, 580, () => {
    flat(box(-10, -10, 1010, 590), '#FFC2DC');
    flat(box(-10, 330, 1010, 590), mixc(PAL.lilacLt, '#FFC2DC', 0.4), 0.7);
    wash(-40, -40, 1080, 660, PAL.pinkLt, 110, 0.05);
    blob(500, 250, 300, '#FFE6F0', 140, 0.4);
    blob(110, 470, 220, PAL.lilacLt, 130, 0.4);
    blob(900, 90, 200, PAL.lilac, 70, 0.4);
    blob(880, 500, 180, PAL.butterLt, 110, 0.4);
    blob(90, 70, 160, PAL.butterLt, 110, 0.4);
    flat(heartS(500, 200, 230, 48), '#FFFFFF', 0.28);
  });

  // Sydney's sway (one full sway every two beats)
  const sway = (T) => { const b = beatAt(T); return Math.sin((b.i + b.ph) * Math.PI); };
  function heartIris(p, T) {
    const s = 2300 * Math.pow(p, 1.8) * (1 + 0.03 * Math.sin(T * 30));
    if (s < 3) return;
    fill(110); shapeFill(heartS(960, HSCR, s * 1.05 + 12, 48));
    fill(255); shapeFill(heartS(960, HSCR, s, 48));
  }
  const SYD_Y = 268; // Sydney's bubble centre (world)
  shot({
    id: 'L15-sydney', t0: T15, tin: { type: 'mask', d: 0.6, at: 0.5, mask: heartIris },
    draw(s) {
      const T = s.T;
      const tSyd = w15(0), tPlease = w15(1), tLet = w15(2), tMe = w15(3), tFree = w15(4);
      const freeK = T >= tFree;
      const pull = Ez.inOut(inv(52.6, 53.6, T));
      const rush = Ez.in(inv(tFree, 58.5, T));
      // push in on Pip's pleading face on "please", ease back out before the kiss
      const plea = Ez.outBack(inv(tPlease - 0.04, tPlease + 0.3, T), 1.3) * (1 - Ez.inOut(inv(55.2, 55.75, T)));
      const Z = lerp(Z15S, 1.0, pull) + 0.2 * rush + 1.0 * plea - 0.04 * sstep(tPlease - 0.25, tPlease - 0.05, T) * (1 - plea);
      const cy = lerp(CY15S, 540, pull) + (600 - 540) * rush + (CAGE_Y + 0.4 * CS - 0.75 * 250 - 540) * plea;
      push();
      cam(960, cy, Z, 0.02 * plea * Math.sin(T * 2.2));
      shake(after(T, tFree, 5) * 10 + after(T, tLet, 6) * 5 + after(T, tMe, 7) * 4, 6);
      spr('s06_love_bg', 960, 540, { s: 2.3, jit: 0 });
      // rotating shoujo rays
      noStroke();
      for (let i = 0; i < 14; i++) { const a = T * 0.18 + (i * TAU) / 14; fill(withAlphaCol(i % 2 ? '#FFFFFF' : PAL.pinkLt, 0.4)); triangle(960, 330, 960 + Math.cos(a - 0.1) * 1900, 330 + Math.sin(a - 0.1) * 1900, 960 + Math.cos(a + 0.1) * 1900, 330 + Math.sin(a + 0.1) * 1900); }
      twinkles(T, 16, 63, [60, 30, 1800, 960], ['sparkW', 'spark', 'star5'], 0.14, 0.34, 3);
      floaters(T, 14, 71, ['heart', 's06_letter', 'heartR', 's06_kiss'], [40, -80, 1840, 1240], 95, 0.55, 40, -1);
      // --- Sydney + cage group, swaying about a pivot under the frame ---
      const sw = sway(T), bob = hopB(T) * 10;
      // kiss choreography
      const antic = sstep(55.75, 56.12, T) * (1 - sstep(56.12, 56.3, T));
      const lunge = Ez.in(inv(56.12, tLet, T)) * (1 - Ez.inOut(inv(tLet + 0.18, tLet + 0.62, T)));
      const smack = after(T, tLet, 9);
      const pucker = T > 55.8 && T < tLet + 0.22;
      const shut = (T > 55.95 && T < tLet + 0.25) || fract(T * 0.37 + 0.2) < 0.035;
      const bx = -52 * lunge + 8 * antic, by = SYD_Y - 1000 - bob + 96 * lunge - 26 * antic, br = -0.1 * lunge + 0.05 * antic;
      push();
      translate(960, 1000); rotate(0.04 * sw * (freeK ? 0.3 : 1));
      // tail (wags on the beats), body and face
      push(); translate(bx, by); rotate(br); scale(1 + 0.04 * lunge + 0.02 * kick(T, 5), 1 - 0.03 * smack);
      spr('s06_syd_tail', 300, 150, { r: -0.1 + 0.22 * sw, seed: 2 });
      spr('s06_syd_bow', 262, -222, { r: 0.35 + Math.sin(T * 4) * 0.06, s: 0.9, seed: 3 });
      spr('s06_syd_body', 0, 0, { seed: 1 });
      const ep = kick(T, 5) * 0.14 + after(T, tSyd, 4) * 0.25 + (T > tLet ? after(T, tLet + 0.3, 3) * 0.35 : 0);
      const esc = freeK ? lerp(1, 0.62, sstep(tFree, tFree + 0.12, T)) : 1;
      for (const sd of [-1, 1]) {
        if (shut) spr('s06_syd_eye_shut', sd * 140, -44, { s: 0.8, flip: sd > 0, seed: sd });
        else spr('s06_syd_eye', sd * 140, -44, { s: 0.8 * (1 + ep) * esc, flip: sd > 0, seed: sd + 2, r: sd * Math.sin(T * 3) * 0.05 });
      }
      spr(freeK ? 's06_syd_oh' : pucker ? 's06_syd_pucker' : 's06_syd_smile', 0, 50, { s: pucker ? 0.8 + 0.25 * lunge : 0.72 * (1 + 0.06 * kick(T, 6)), seed: 4 });
      // extra blush after the kiss
      if (T > tLet) { const bl = sstep(tLet, tLet + 0.3, T); disc(-245, 44, 54, PAL.red, 0.25 * bl); disc(245, 44, 54, PAL.red, 0.25 * bl); }
      pop();
      // cage (held in front of Sydney), with a little rattle
      const rat = after(T, tPlease, 5) * 0.035 + (T > tMe && T < tFree ? 0.05 * (0.5 + 0.5 * Math.sin((T - tMe) * 40)) : 0) + after(T, tFree, 6) * 0.06;
      const cgx = CAGE_X - 960 + RS(G.boil, 41) * rat * 120, cgy = CAGE_Y - 1000 - hopB(T - 0.12) * 8;
      push(); translate(cgx, cgy); rotate(RS(G.boil, 42) * rat);
      spr('s06_cage_back', 0, 0, { jit: 0.3 });
      // Pip inside, gripping the bars and pleading
      const inside = T < tFree + 0.1;
      const beg = after(T, tPlease, 4);
      const crouch = sstep(57.3, tFree - 0.02, T) * (freeK ? 0 : 1);
      const pipY = 0.4 * CS;
      if (inside) {
        const pface = T > tLet && T < tLet + 0.45 ? 'pf_shock' : T > tMe - 0.1 ? 'pf_scared' : 'pf_cry';
        pip(RS(G.boil, 44) * (beg * 8 + (T > tMe ? 5 : 0)), pipY + crouch * 10, 0.75 * (1 + beg * 0.06), { face: pface, armL: 2.2 + Math.sin(T * 7) * 0.08, armR: 2.2 + Math.sin(T * 7 + 1) * 0.08, headR: Math.sin(T * 2.6) * 0.1, sq: 1 + crouch * 0.12 + beg * 0.05, seed: 6 });
        // tears
        if (T < tMe - 0.1) for (let k = 0; k < 6; k++) {
          const per = 0.23, n = Math.floor(T / per) - k, age = T - n * per;
          const sd = n % 2 ? 1 : -1;
          spr('drop', sd * (34 + age * 60), pipY - 0.75 * 190 + age * 120 + age * age * 900, { s: 0.28, a: 1 - age / (6 * per), seed: n });
        }
        burst(T, tPlease, 0, pipY - 150, { n: 10, names: ['drop'], spd: 700, g: 1600, life: 0.8, s: 0.35, spread: 2.4, ang0: -Math.PI / 2, seed: 61 });
      }
      spr('s06_cage_front', 0, 0, { jit: 0.3 });
      // grip fingers over the bars
      if (inside) for (const bxx of [-84, 92]) { const gy = pipY - 0.75 * 186 + Math.sin(T * 7) * 3; disc(bxx - 4, gy, 12, PAL.skin); disc(bxx + 7, gy + 2, 11, PAL.skin); ringLine(bxx + 1, gy + 1, 15, PAL.ink, 2, 0.6); }
      // door + heart lock
      const dopen = freeK ? 2.3 * Ez.outElastic(clamp((T - tFree) / 0.7)) : 0;
      const dsx = Math.cos(dopen);
      spr('s06_cage_door', DX0 - CGX, (DY0 + DY1) / 2 - CGY, { sx: Math.abs(dsx) < 0.04 ? 0.04 : dsx, jit: 0.3, r: T > tMe && !freeK ? RS(G.boil, 47) * 0.03 : 0 });
      if (!freeK) {
        const jig = T > tMe ? RS(G.boil, 48) * 0.3 : Math.sin(T * 3) * 0.05;
        spr('s06_lock', DX1 - CGX + 6, 90, { s: 0.62, r: jig });
      } else {
        const t = T - tFree;
        spr('s06_lock', DX1 - CGX + 6 + 700 * t, 90 - 900 * t + 1500 * t * t, { s: 0.62, r: t * 14 });
      }
      // lipstick kisses stamped on the cage
      if (T > tLet) spr('s06_kiss', -80, -0.6 * CS + 6, { s: 0.75 * Ez.outBack(clamp((T - tLet) / 0.18), 3), r: -0.25 });
      if (T > tLet + 0.9) spr('s06_kiss', 150, -0.2 * CS, { s: 0.6 * Ez.outBack(clamp((T - tLet - 0.9) / 0.18), 3), r: 0.3 });
      pop();
      // Sydney's arms hugging the cage (drawn over it)
      for (const sd of [-1, 1]) {
        const sx0 = bx + sd * 300, sy0 = by + 150;
        const hx = cgx + sd * (CS * 0.97), hy = cgy - 0.1 * CS + (sd > 0 ? Math.sin(T * 5) * 6 : 0);
        const dx = hx - sx0, dy = hy - sy0;
        spr('s06_syd_arm', sx0, sy0, { r: Math.atan2(-dx, dy), sy: Math.hypot(dx, dy) / 160, seed: sd + 5 });
      }
      pop();
      // cartoon rattle marks beside the cage while Pip shakes the bars ("me")
      if (T > tMe - 0.05 && T < tFree) {
        const ra = sstep(tMe - 0.05, tMe + 0.05, T), marks = [];
        for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
          const x = 960 + sd * (CS + 40 + k * 26 + RS(G.boil + k, 51) * 6), y = CAGE_Y - 60 + k * 70;
          marks.push([x, y - 26, x + sd * 18, y + 26]);
        }
        segLines(marks, PAL.ink, 6, 0.85 * ra);
      }
      // hearts popping on "Sydney" and the kiss, sparkles on "free"
      burst(T, tSyd, 960, 300, { n: 14, names: ['heart', 'heartR', 'spark'], spd: 1000, g: 300, life: 1.1, s: 0.5, even: true, seed: 71 });
      burst(T, tLet, 890, 430, { n: 16, names: ['heart', 'heartR', 's06_kiss'], spd: 900, g: 200, life: 1.1, s: 0.5, seed: 73 });
      burst(T, tFree, 1060, 700, { n: 22, names: ['spark', 'star5', 'sparkW', 'heart'], spd: 1500, g: 300, life: 1.0, s: 0.55, even: true, seed: 75 });
      if (freeK) spr('puff', 960, 700, { s: 0.6 + (T - tFree) * 3, a: 1 - inv(tFree + 0.1, tFree + 0.5, T), seed: 5 });
      // typing indicator bubble
      spr('s06_mini_bubble', 470, 150 - hopB(T) * 6, { s: 0.9, r: -0.08 });
      for (let i = 0; i < 3; i++) spr('heartR', 470 - 60 + i * 60, 128 - Math.max(0, Math.sin(T * 9 - i * 0.9)) * 18, { s: 0.28, seed: i });
      // Pip bursts out and runs at the camera
      if (!inside || T > tFree) {
        const t = Math.max(0, T - tFree - 0.04);
        const sc = Math.min(4.4, 0.75 * Math.exp(3.9 * t));
        const walk = T * 3.6;
        const ax = 960, ay = lerp(CAGE_Y + 0.4 * CS - 0.75 * 190, 600, Ez.out(clamp(t / 0.35)));
        const oy = ay + 190 * sc;
        if (t > 0.04) {
          const rl = [];
          for (let i = 0; i < 26; i++) { const a = R(i, 81) * TAU, r0 = fract(R(i, 82) + T * 1.8) * 1500 + 200, r1 = r0 + 160 + R(i, 83) * 200; rl.push([ax + Math.cos(a) * r0, ay + Math.sin(a) * r0, ax + Math.cos(a) * r1, ay + Math.sin(a) * r1]); }
          segLines(rl, '#FFFFFF', 7, 0.7 * sstep(tFree, tFree + 0.2, T));
        }
        pip(ax, oy - Math.abs(Math.sin(walk * Math.PI)) * 18 * sc, sc, { face: t < 0.14 ? 'pf_shock' : 'pf_happy', walk, armL: 1.1, armR: 1.1, r: Math.sin(walk * TAU) * 0.05, seed: 6 });
      }
      pop();
    },
  });
  lyr(15, { y: 988, words: { 0: { fill: PAL.pink, wave: 4 }, 1: { anim: 'shake', jitter: 3, fill: PAL.skyLt }, 4: { size: 112, fill: PAL.butter, anim: 'zoom', grow: 0.15 } } });
})();

// s13.js - L37-L40 (118.70-127.88): surfing a sea of GPUs, the RLHF buttons going askew,
// the last P(doom) gauge cracking, and its snapped needle weaving the Loom of futures into a picture frame.
// Shot chain: whip in from s12 > L37 GPU sea > thumbs-up iris > L38 RLHF > siren-sweep > L39 gauge
// > needle whip > L40 loom > (s14 zooms into the woven frame).
(() => {
  // ================================================================== timing
  const tHundred = wordT(37, 0), tThousand = wordT(37, 1), tGPU = wordT(37, 2);
  const tRLHF = wordT(38, 0), tGoes = wordT(38, 1), tAskew = wordT(38, 2);
  const tIm = wordT(39, 0), tUpping = wordT(39, 1), tMy = wordT(39, 2), tPdoom = wordT(39, 3);
  const tJust = wordT(40, 0), tAs = wordT(40, 1), tForetold = wordT(40, 2), tBy = wordT(40, 3), tLoom = wordT(40, 4);
  const S1 = tHundred, S2 = tRLHF, S3 = tIm, S4 = tJust;
  // in-scene custom transitions (the mask callbacks and the shots that paint their edges share these)
  const TR12 = { d: 0.36, at: 0.6 }, TR23 = { d: 0.44, at: 0.5 };
  const trP = (T, t0, tr) => (T - (t0 - tr.d * tr.at)) / tr.d;

  // ================================================================== small helpers
  // sequential eased moves: start at v0, then each [t0, t1, target, ease?] segment eases toward its target
  function moves(T, v0, segs) {
    let v = v0;
    for (const sg of segs) { if (T <= sg[0]) break; v = lerp(v, sg[2], (sg[3] || Ez.inOut)(inv(sg[0], sg[1], T))); }
    return v;
  }
  // smooth keyframe track [[t, v], ...] (cubic Hermite with Catmull-Rom tangents, eased ends)
  function track(T, K) {
    const n = K.length;
    if (T <= K[0][0]) return K[0][1];
    if (T >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (i < n - 2 && T > K[i + 1][0]) i++;
    const [t1, p1] = K[i], [t2, p2] = K[i + 1], h = t2 - t1, u = (T - t1) / h;
    const m1 = i > 0 ? (p2 - K[i - 1][1]) / (t2 - K[i - 1][0]) : 0;
    const m2 = i < n - 2 ? (K[i + 2][1] - p1) / (K[i + 2][0] - t1) : 0;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p1 + (u3 - 2 * u2 + u) * h * m1 + (-2 * u3 + 3 * u2) * p2 + (u3 - u2) * h * m2;
  }
  const RGBC = {};
  const rgbOf = (c) => RGBC[c] || (RGBC[c] = hexToRgb(c));
  function fillC(c, a = 1) { const k = rgbOf(c); fill(k[0], k[1], k[2], 255 * clamp(a)); }
  function strokeC(c, a = 1, w = 2) { const k = rgbOf(c); stroke(k[0], k[1], k[2], 255 * clamp(a)); strokeWeight(w); }
  function poly(pts) { beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(CLOSE); }
  // batched discs [x, y, r, rgb, a] in one draw call
  const DN = 10, DC = [], DS = [];
  for (let i = 0; i <= DN; i++) { DC.push(Math.cos((i / DN) * TAU)); DS.push(Math.sin((i / DN) * TAU)); }
  function discs(list) {
    if (!list.length) return;
    noStroke(); beginShape(TRIANGLES);
    for (const [x, y, r, c, a] of list) {
      fill(c[0], c[1], c[2], 255 * clamp(a));
      for (let i = 0; i < DN; i++) { vertex(x, y); vertex(x + DC[i] * r, y + DS[i] * r); vertex(x + DC[i + 1] * r, y + DS[i + 1] * r); }
    }
    endShape();
  }
  // stroke many polylines of one colour/weight as a single LINES shape (fraction g of each)
  function linesBatch(items) {
    beginShape(LINES);
    for (const [pts, g] of items) {
      if (g <= 0) continue;
      const n = pts.length - 1, f = clamp(g) * n, k = Math.floor(f);
      for (let i = 0; i < Math.min(k, n); i++) { vertex(pts[i][0], pts[i][1]); vertex(pts[i + 1][0], pts[i + 1][1]); }
      if (k < n && f > k) { const u = f - k; vertex(pts[k][0], pts[k][1]); vertex(lerp(pts[k][0], pts[k + 1][0], u), lerp(pts[k][1], pts[k + 1][1], u)); }
    }
    endShape();
  }
  // stroke the first fraction g (0..1) of a polyline
  function polyPart(pts, g) {
    if (g <= 0) return;
    const n = pts.length - 1, f = clamp(g) * n, k = Math.floor(f);
    beginShape();
    for (let i = 0; i <= Math.min(k, n); i++) vertex(pts[i][0], pts[i][1]);
    if (k < n) { const u = f - k; vertex(lerp(pts[k][0], pts[k + 1][0], u), lerp(pts[k][1], pts[k + 1][1], u)); }
    endShape();
  }
  // paintSprite commits the last brush op when a painter ends, but a native erase() inside a painter runs
  // before any still-pending brush op, so commit with flush() first. Dark backgrounds get an opaque flat
  // base (p5.brush washes are translucent and composite against paper white).
  function flush() { brush.set('pen', '#010203', 0.5); brush.line(-400, -400, -399, -400); brush.noStroke(); brush.noFill(); }
  const base = (c) => flat([[-30, -30], [1030, -30], [1030, 610], [-30, 610]], c);
  const eraseRect = (x, y, w, h) => { erase(); noStroke(); fill(255); rect(x, y, w, h); noErase(); };
  // Clawd eye variants drawn with flat shapes (same 96 px cell as the shared ce_* eyes)
  defSprite('s13_eye_x', 96, 96, () => {
    const bar = (a) => { const c = Math.cos(a), si = Math.sin(a); return [[-34, -8], [34, -8], [34, 8], [-34, 8]].map(([x, y]) => [48 + x * c - y * si, 48 + x * si + y * c]); };
    flat(bar(Math.PI / 4), PAL.black); flat(bar(-Math.PI / 4), PAL.black);
  });
  defSprite('s13_eye_spiral', 96, 96, () => { for (let i = 0; i < 90; i++) { const a = i * 0.21, r = 2 + i * 0.36; flat(ellPts(48 + Math.cos(a) * r, 48 + Math.sin(a) * r, 4, 4, 8), PAL.black); } });
  // gauge needle look (ink + coral), centred at (x, y), pointing along r; eye > 0 adds a sewing-needle eye
  function needle(x, y, r, len, sc = 1, eye = 0) {
    push(); translate(x, y); rotate(r); scale(sc);
    segLine(-len / 2, 0, len / 2, 0, PAL.ink, 20);
    segLine(-len / 2 + 8, 0, len / 2 - 14, 0, PAL.coral, 7);
    if (eye > 0) { disc(-len / 2 + 22, 0, 9, PAL.ink, eye); disc(-len / 2 + 22, 0, 4, PAL.butterLt, eye); }
    disc(len / 2 - 4, 0, 7, PAL.ink);
    pop();
  }

  // our own chunky cartoon thumbs-up hand (thumb up, knuckles right, cuff left), ~185 x 206 units
  const THUMB = [[-30, -95], [-22, -110], [-2, -112], [10, -100], [12, -32], [70, -32], [88, -24], [94, -8], [86, 4], [96, 14], [98, 28], [88, 36], [96, 46], [96, 60], [86, 66], [92, 76], [88, 90], [72, 94], [-50, 94], [-86, 88], [-86, -18], [-50, -24], [-30, -30]];
  const THUMB_C = [540, 530];
  const thumbScale = (p) => 0.42 * Math.pow(75, clamp(p));
  const thumbRot = (p) => -0.18 * (1 - clamp(p));
  function thumbPts(cx, cy, sc, r) {
    const c = Math.cos(r), s = Math.sin(r);
    return THUMB.map(([x, y]) => [cx + (x * c - y * s) * sc, cy + (x * s + y * c) * sc]);
  }
  defSprite('s13_thumb', 300, 300, () => {
    const pts = offsetPts(THUMB, 150, 150);
    paint(pts, PAL.butter, { baseC: '#FFE27E', lw: 2.6, a: 170 });
    paint(offsetPts([[-86, -18], [-50, -24], [-50, 94], [-86, 88]], 150, 150), '#FFFFFF', { baseC: '#FFFFFF', lw: 2.2 });
    pen(PAL.ink, 2.2, '2B');
    for (const y of [4, 36, 66]) brush.line(150 + 50, 150 + y, 150 + 88, 150 + y - 2);
    brush.line(150 + 12, 150 - 32, 150 - 8, 150 - 16);
    brush.noStroke();
    wc('#FFFFFF', 150, 0.08); brush.rect(150 - 22, 150 - 100, 12, 50); brush.noFill();
    blob(150 + 70, 150 + 40, 16, PAL.orange, 70, 0.3);
  }, { v: 2 });

  // ================================================================== L37 - Hundred thousand GPU
  // A perspective sea of kit GPU cards bobbing like waves; the camera dollies forward over it.
  const HOR = 440, FOC = 710, CS = 1.35, XS = (300 * CS * 1.12) / FOC, DZ = 0.58, ZN = 1.0, ZF = 4.4;
  const STRIP = [PAL.pink, PAL.sky, PAL.mint, PAL.butter, PAL.lilac, PAL.orange];
  defSprite('s13_dusk', 1000, 580, () => {
    base('#5B4A9E'); flat([[-30, 300], [1030, 300], [1030, 610], [-30, 610]], '#E7A9C4'); flat([[-30, 460], [1030, 460], [1030, 610], [-30, 610]], '#FFC9AA');
    wash(-40, -40, 1080, 380, '#4B3D8E', 225, 0.12);
    wash(-40, 230, 1080, 220, '#8B6BC6', 175, 0.2);
    wash(-40, 380, 1080, 140, PAL.pink, 150, 0.22);
    wash(-40, 470, 1080, 150, '#FFC7A6', 215, 0.18);
    blob(760, 540, 150, PAL.butterLt, 190, 0.35);
    blob(760, 548, 80, '#FFF6D0', 235, 0.12);
    blob(170, 300, 170, '#6E5BB8', 90, 0.4);
    blob(520, 420, 140, PAL.pinkLt, 70, 0.4);
    for (let i = 0; i < 46; i++) flat(ellPts(random() * 1000, random() * 330, 1.2 + random() * 1.8, 1.2 + random() * 1.8, 8), '#FFFFFF', 0.5 + random() * 0.5);
   
  });
  // far rows of tiny cards receding to the horizon (sprite y 0 = world HOR - 10)
  defSprite('s13_far', 1000, 116, () => {
    const Zs = [4.9, 5.5, 6.2, 7.0, 8.0, 9.2, 10.7, 12.5, 15, 18, 22];
    for (let r = Zs.length - 1; r >= 0; r--) {
      const Z = Zs[r], w = (150 * CS) / Z, h = (65 * CS) / Z, by = (FOC / Z + 10) / 2;
      const haze = clamp((Z - 4.9) / 14);
      const body = mixc('#4A5170', '#D9A3C4', haze), top = mixc('#6FD6B0', '#F4C9DC', haze);
      for (let x = -w + (r % 2) * w * 0.55; x < 1000 + w; x += w * 1.12) {
        flat([[x - w / 2, by - h], [x + w / 2, by - h], [x + w / 2, by], [x - w / 2, by]], body);
        flat([[x - w / 2, by - h - 1.5], [x + w / 2, by - h - 1.5], [x + w / 2, by - h + 0.5], [x - w / 2, by - h + 0.5]], STRIP[Math.floor(random() * 6)], 0.8);
        if (Z < 12) flat(ellPts(x + w * 0.38, by - h * 0.72, 1.6, 1.6, 6), top);
      }
    }
    wc('#EDB4CB', 150, 0.12, 0.5, 0.5); brush.rect(-20, 0, 1040, 18); brush.noFill();
    wc('#E3A8C6', 70, 0.15, 0.5, 0.5); brush.rect(-20, 14, 1040, 26); brush.noFill();
  });
  defSprite('s13_fan', 96, 96, () => {
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU;
      const P = (r, da) => [48 + Math.cos(a + da) * r, 48 + Math.sin(a + da) * r];
      flat([P(10, -0.5), P(38, -0.05), P(40, 0.28), P(12, 0.5)], '#8E95AE');
      flat([P(14, 0.1), P(38, 0.12), P(38, 0.24), P(14, 0.36)], '#C5CBDB', 0.8);
    }
    paint(ellPts(48, 48, 12, 12, 16), '#2A2F3E', { baseC: '#50586E', lw: 1.2 });
  });
  // odometer windows: centres relative to the counter panel centre
  const CW = [-261, -163, -65, 65, 163, 261], CWY = -12, CWW = 86, CWH = 124;
  defSprite('s13_counter', 820, 290, () => {
    const cx = 410, cy = 145;
    paint(rrPts(18, 26, 784, 238, 36), PAL.navy, { baseC: '#3A4686', lw: 2.8 });
    paint(rrPts(40, 48, 740, 194, 24), '#1C2150', { baseC: '#262D66', lw: 1.6, lc: PAL.gold });
    for (const x of CW) paint(rrPts(cx + x - CWW / 2 - 5, cy + CWY - CWH / 2 - 5, CWW + 10, CWH + 10, 12), PAL.cream, { baseC: '#FFF8E6', lw: 1.8 });
    paint([[cx - 8, cy + CWY + 36], [cx + 10, cy + CWY + 36], [cx + 2, cy + CWY + 66], [cx - 12, cy + CWY + 64]], PAL.butter, { baseC: PAL.butterLt, lw: 1.4 });
    for (const [x, y] of [[44, 52], [776, 52], [44, 238], [776, 238]]) paint(ellPts(x, y, 9, 9, 12), PAL.gold, { baseC: '#FFD75A', lw: 1.2 });
    const lab = textImg('GPUs ONLINE', { font: 'pixel', size: 30, fill: PAL.butter, weight: 700 });
    image(lab.img, cx - lab.w / 2, cy + 94 - lab.h / 2);
    wc('#FFFFFF', 70, 0.1); brush.rect(60, 60, 700, 16); brush.noFill();
  });
  // marquee bulbs overlay (flat shapes only, cheap to paint), alternating between the two variants
  defSprite('s13_bulbs', 820, 290, (v) => {
    const cx = 410, cy = 145;
    for (let i = 0; i < 22; i++) {
      const on = (i + v) % 2 === 0, bx = cx - 360 + (i % 11) * 72, by = cy + (i < 11 ? -126 : 126);
      if (on) { flat(ellPts(bx, by, 16, 16, 16), PAL.butter, 0.35); flat(ellPts(bx, by, 10, 10, 14), PAL.butter); flat(ellPts(bx - 3, by - 3, 3.5, 3.5, 8), '#FFFFFF'); }
      else flat(ellPts(bx, by, 9, 9, 14), '#8A7FB0', 0.8);
    }
  }, { v: 2 });
  // kit GPU card composited with an RGB strip and a status LED: variant = strip colour * 2 + LED on
  defSprite('s13_card', 300, 150, (v) => {
    const g = SPR.gpu;
    if (g) image(g.fbs[Math.floor(v / 2) % g.fbs.length], 0, 16, 300, 130);
    flat(rrPts(22, 6, 256, 13, 5), STRIP[Math.floor(v / 2)], 0.95);
    flat(rrPts(30, 8, 120, 4, 2), '#FFFFFF', 0.45);
    if (v % 2) { flat(ellPts(262, 48, 24, 24, 20), PAL.mint, 0.3); flat(ellPts(262, 48, 14, 14, 16), PAL.mint, 0.75); flat(ellPts(262, 48, 7.5, 7.5, 12), '#E1FFEE'); }
    else flat(ellPts(262, 48, 7.5, 7.5, 12), '#2F5A4C');
  }, { v: 12 });
  const seaCamZ = (T) => (T - S1) * 1.25;
  const seaCamX = (T) => (T - S1) * 0.3;
  function seaBob(X, Zw, T) { return 0.1 * Math.sin(X * 1.7 + Zw * 1.25 - T * 4.6) + 0.045 * Math.sin(X * 0.6 - Zw * 0.9 + T * 2.3); }
  function seaSlope(X, Zw, T) { return 0.17 * Math.cos(X * 1.7 + Zw * 1.25 - T * 4.6) + 0.027 * Math.cos(X * 0.6 - Zw * 0.9 + T * 2.3); }
  // LED brightness: beat pulses ripple outward from the middle; big rings on "thousand" and "GPU"
  function ledPulse(T, sx, sy) {
    const d = Math.hypot(sx - 960, sy - 560);
    let b = 0.2 + 0.8 * kick(T - d / 2600, 5);
    const ga = T - tGPU; if (ga > 0 && ga < 1.2) b = Math.max(b, 1.25 * Math.exp(-Math.pow((d - ga * 2300) / 170, 2)));
    const ta = T - tThousand; if (ta > 0 && ta < 1) b = Math.max(b, Math.exp(-Math.pow((d - ta * 2600) / 120, 2)));
    return b;
  }
  const SUNGLINT = [255, 236, 170];
  function drawSeaRow(T, n, Zc, camX, beatI, glint) {
    const Zw = n * DZ, Z = Zw - Zc;
    if (Z < ZN || Z > ZF) return;
    const k = FOC / Z, sc = CS / Z, a = sstep(ZF, ZF - 0.55, Z);
    const half = (1150 * Z) / FOC;
    const off = (n % 2) * 0.5;
    const m0 = Math.floor((camX - half) / XS - off) - 1, m1 = Math.ceil((camX + half) / XS - off) + 1;
    const near = Z < 1.95;
    for (let m = m0; m <= m1; m++) {
      const X = (m + off) * XS;
      const sx = 960 + (X - camX) * k, sy = HOR + (1 - seaBob(X, Zw, T)) * k;
      if (sx < -220 || sx > 2140) continue;
      const b = ledPulse(T, sx, sy), r = -Math.atan(seaSlope(X, Zw, T)) * 0.55;
      const c = Math.cos(r) * sc, si = Math.sin(r) * sc;
      const P = (lx, ly) => [sx + lx * c - ly * si, sy + lx * si + ly * c];
      const g = P(0, -64), ci = (((m + n + beatI) % 6) + 6) % 6;
      spr('s13_card', g[0], g[1], { s: sc, r, a, v: ci * 2 + (b > 0.5 ? 1 : 0), seed: n * 7 + m, jit: near ? 1 : 0 });
      if (near) { const f1 = P(-65, -59), f2 = P(65, -59); spr('s13_fan', f1[0], f1[1], { s: sc, r: T * 26 + m, jit: 0 }); spr('s13_fan', f2[0], f2[1], { s: sc, r: T * 29 + n, jit: 0 }); }
      // sunset glitter on the crests under the sun
      const dx = Math.abs(sx - 1480);
      if (dx < 190) { const tw = 0.5 + 0.5 * Math.sin(T * 9 + m * 1.7 + n * 2.3); glint.push([sx + RS(m, n) * 40 * sc, sy - 124 * sc, 9 * sc * tw + 2, SUNGLINT, a * 0.85 * tw * (1 - dx / 190)]); }
    }
  }
  function drawSea(T) {
    const Zc = seaCamZ(T), camX = seaCamX(T), bi = beatAt(T).i;
    gradRect(-700, HOR - 4, 3320, 230, '#E6AFC6', '#6C5CA0');
    gradRect(-700, HOR + 224, 3320, 900, '#6C5CA0', '#262852');
    spr('s13_far', 960, HOR - 10 + 116, { s: 2, jit: 0 });
    noStroke();
    const n0 = Math.ceil((Zc + ZN) / DZ), n1 = Math.floor((Zc + ZF) / DZ);
    const glint = [];
    for (let n = n1; n >= n0; n--) drawSeaRow(T, n, Zc, camX, bi, glint);
    blendMode(ADD); discs(glint); blendMode(BLEND);
  }
  // Clawd surfs a GPU board across the crests; screen-x path keyed to the words
  const SURF_X = [[118.45, -340], [118.95, 300], [119.38, 770], [119.64, 960], [119.92, 1170], [120.42, 2350]];
  const SURF_Z = 1.95, JUMP0 = 119.38, JUMP1 = 119.92, JUMP_H = 185;
  function surfPos(T) {
    const sx = track(T, SURF_X), k = FOC / SURF_Z, Zw = seaCamZ(T) + SURF_Z;
    const X = seaCamX(T) + (sx - 960) / k;
    return [sx, HOR + (1 - seaBob(X, Zw, T)) * k - 74, -Math.atan(seaSlope(X, Zw, T)) * 0.55];
  }
  const inAir = (t) => t > JUMP0 && t < JUMP1;
  function surfer(T) {
    const [x, y, slope] = surfPos(T);
    const ju = inv(JUMP0, JUMP1, T), air = inAir(T);
    const h = air ? Math.sin(Math.PI * ju) * JUMP_H : 0;
    const flip = -TAU * Ez.inOut(inv(JUMP0 + 0.05, JUMP1 - 0.05, T));
    const land = T > JUMP1 ? Math.exp(-(T - JUMP1) * 9) : 0;
    const crouch = T < JUMP0 ? sstep(JUMP0 - 0.14, JUMP0, T) : 0;
    const s = 0.6, cyOff = 4 * CU * s;
    // spray kicked up behind the board while riding
    for (let j = 0; j < 20; j++) {
      const idx = Math.floor(T / 0.03) - j, tb = idx * 0.03, age = T - tb, life = 0.55;
      if (tb < SURF_X[0][0] || inAir(tb) || age > life) continue;
      const [bx, by] = surfPos(tb);
      const px = bx - 70 + (-260 - R(idx, 31) * 420) * age, py = by + 16 + (-360 - R(idx, 32) * 420) * age + 950 * age * age;
      spr(['blob_mint', 'spark', 'blob_green', 'blob_white', 'sparkW'][((idx % 5) + 5) % 5], px, py, { s: 0.3 * (1 - age / life) + 0.05, a: 1 - age / life, r: idx, seed: idx });
    }
    speedLines(T, 6, 21, PAL.white, 0.35, 160, 4, 2600, -1, [x - 700, y - 150, 560, 140]);
    const wig = Math.sin(T * 7.5);
    push();
    translate(x, y - h - cyOff);
    rotate((air ? 0 : slope) + flip + 0.1 - 0.06 * wig * (air ? 0 : 1));
    spr('gpu', 0, cyOff + 12, { s: 0.7, sy: 0.5, seed: 5 });
    const eyes = air ? 'ce_star' : T > JUMP1 ? 'ce_happy' : 'ce_sq';
    clawd(0, cyOff, s, {
      eyes, look: [0.55, 0], blush: T > JUMP1,
      armL: air ? -1.9 : -0.55 + 0.25 * wig, armR: air ? -1.9 : -0.2 - 0.25 * wig,
      legs: [[0, -0.18], [0, -0.06], [0, 0.06], [0, 0.18]],
      sq: 1 + 0.22 * land + 0.14 * crouch - (air ? 0.1 * Math.sin(Math.PI * ju) : 0),
    });
    pop();
    burst(T, JUMP1, x, y + 10, { n: 14, names: ['blob_mint', 'blob_green', 'spark', 'blob_white'], spd: 900, g: 1600, life: 0.7, s: 0.34, spread: Math.PI * 0.9, ang0: -Math.PI / 2, seed: 61 });
  }
  function counterV(T) { const u = inv(118.72, tGPU, T); return u >= 1 ? 100000 : 100000 * (1 - Math.pow(1 - u, 2.3)); }
  function drawCounter(T) {
    const drop = Ez.outBack(inv(118.5, 118.95, T), 1.6);
    const hitA = T - tGPU, hit = hitA > 0;
    const popS = hit ? 1 + 0.22 * Math.exp(-hitA * 6) * Math.cos(hitA * 28) : 1;
    const tj = T - tThousand, jolt = tj > 0 ? Math.exp(-tj * 7) * Math.sin(tj * 40) * 0.05 : 0;
    const x = 960, y = lerp(-460, 222, drop);
    const sw = Math.sin(T * 3.1) * 0.03 * (1 - drop * 0.5) + jolt + (hit ? Math.exp(-hitA * 4) * Math.sin(hitA * 22) * 0.05 : 0);
    segLine(x - 330, y - 100, x - 400, y - 1100, PAL.ink, 5); segLine(x + 330, y - 100, x + 400, y - 1100, PAL.ink, 5);
    if (hit) glow(x, y, 520, PAL.green, 0.45 * Math.exp(-hitA * 2.5));
    push(); translate(x, y); rotate(sw); scale(0.9 * popS * (1 + 0.035 * kick(T)));
    spr('s13_counter', 0, 0, { jit: 0.4 });
    spr('s13_bulbs', 0, 0, { jit: 0.4, v: hit ? Math.floor(T * 14) % 2 : beatAt(T).i % 2 });   // marquee bulbs chase on the beat
    const V = counterV(T);
    const st = { font: 'pixel', size: 108, fill: hit ? (Math.floor(hitA * 8) % 2 ? PAL.coral : PAL.green) : PAL.ink, weight: 700 };
    const bounce = hit ? Math.exp(-hitA * 9) * Math.sin(hitA * 40) * 14 : 0;
    push();
    clip(() => { noStroke(); fill(0, 0); for (const cx of CW) rect(cx - CWW / 2, CWY - CWH / 2, CWW, CWH); });
    for (let k = 0; k < 6; k++) {
      // odometer carry: a digit only rolls while every digit to its right is passing 9 -> 0
      const m = Math.pow(10, 5 - k), d0 = Math.floor(V / m) % 10, f = k === 5 ? V - Math.floor(V) : clamp((V % m) - (m - 1));
      txt(String(d0), CW[k], CWY - f * CWH + bounce, st);
      if (f > 0.002) txt(String((d0 + 1) % 10), CW[k], CWY + (1 - f) * CWH + bounce, st);
    }
    pop();
    pop();
    if (tj > 0) burst(T, tThousand, x, y, { n: 12, names: ['spark', 'sparkW'], spd: 900, g: 300, life: 0.7, s: 0.35, even: true, seed: 17 });
    if (hit) {
      for (let i = 0; i < 3; i++) { const a = hitA - i * 0.1; if (a > 0) spr('ring', x, y, { s: a * 6, a: clamp(1 - a * 1.3), seed: i }); }
      burst(T, tGPU, x, y, { n: 28, names: ['spark', 'star5', 'blob_green', 'blob_mint', 'sparkW', 'blob_butter'], spd: 1600, g: 900, life: 1.3, s: 0.55, seed: 13 });
    }
  }
  function drawThumbBadge(T, x, y, sc, r, a = 1) {
    spr('s13_badge_up', x, y, { s: sc * 1.18, a, jit: 0 });
    spr('s13_thumb', x, y, { s: sc, r, a, jit: 0 });
  }
  shot({
    id: 'L37-gpu-sea', t0: S1, tin: { type: 'whip', d: 0.45, at: 0.5, ang: Math.PI / 2 },
    draw(s) {
      const T = s.T;
      const hitA = T - tGPU, hitK = hitA > 0 ? Math.exp(-hitA * 5) : 0;
      const out = inv(119.9, 120.4, T);
      const cy = lerp(-40, 540, Ez.out(inv(S1 - 0.25, S1 + 0.6, T))) - Ez.in(out) * 70;
      const cx = 960 + (T - S1) * 26 - Ez.in(out) * 220;
      const Z = 1 + 0.05 * hitK + 0.1 * Ez.in(out);
      bg('#2E2A62');
      push();
      const tj = T - tThousand;
      cam(cx, cy, Z); shake(hitK * 12 + (tj > 0 ? Math.exp(-tj * 8) * 6 : 0), 3);
      gradRect(-700, -1100, 3320, 1110, '#352A70', '#4B3D8E');
      spr('s13_dusk', 960, -120, { s: 2, jit: 0 });
      for (let i = 0; i < 4; i++) spr('cloud', ((R(i, 3) * 2600 - T * (40 + i * 25)) % 2600 + 2600) % 2600 - 350, -380 + i * 170 + R(i, 4) * 60, { s: 0.7 + R(i, 5) * 0.5, a: 0.55, seed: i });
      twinkles(T, 16, 5, [0, -640, 1920, 980], ['sparkW', 'spark'], 0.07, 0.2, 3);
      drawCounter(T);
      drawSea(T);
      surfer(T);
      pop();
      // a green "like" pops out of the sea and becomes the thumbs-up iris into L38
      const p12 = trP(T, S2, TR12);
      const popK = Ez.outBack(inv(119.9, 120.02, T), 2.2);
      if (popK > 0) {
        const sc = p12 > 0 ? thumbScale(p12) : thumbScale(0) * popK;
        const r = p12 > 0 ? thumbRot(p12) : thumbRot(0) + 0.12 * Math.sin(T * 30) * (1 - popK);
        glow(THUMB_C[0], THUMB_C[1], 160 * popK, PAL.green, 0.5);
        drawThumbBadge(T, THUMB_C[0], THUMB_C[1], sc, r);
      }
    },
  });
  lyr(37, { y: 985, words: { 0: { anim: 'drop' }, 1: { anim: 'drop', fill: PAL.butter }, 2: { font: 'pixel', fill: PAL.mint, size: 108, anim: 'zoom', jitter: 3 } } });

  // ================================================================== L38 - RLHF goes askew
  const BX = [600, 1320], RIM_Y = 745, DOME_TOP = 588, BADGE_Y = 380;
  const PRESS = [[120.279, 0], [120.5, 0], [120.721, 1], [120.95, 1], [121.185, 0], [121.4, 0], [121.626, 1]];
  const STAMP_AT = [[960, 300], [1700, 300], [230, 330], [1765, 640], [160, 650], [1085, 520], [835, 520]];
  const HOPS = [[119.98, 330, 905], ...PRESS.map(([t, sd]) => [t, BX[sd], DOME_TOP]), [122.091, BX[0], DOME_TOP]];
  defSprite('s13_sunny', 1000, 580, () => {
    base('#FFF1C4'); flat([[-30, 420], [1030, 420], [1030, 610], [-30, 610]], '#A6E6CC');
    wash(-40, -40, 1080, 660, PAL.butterLt, 220, 0.1);
    blob(500, 230, 300, '#FFE2B0', 150, 0.4);
    blob(150, 110, 180, PAL.pinkLt, 120, 0.4);
    blob(860, 130, 170, PAL.mintLt, 120, 0.4);
    wash(-40, 410, 1080, 240, PAL.mint, 170, 0.12);
    wash(-40, 470, 1080, 180, PAL.teal, 80, 0.2);
    blob(500, 440, 260, PAL.mintLt, 90, 0.3);
  });
  defSprite('s13_ped', 480, 330, () => {
    paint(rrPts(62, 72, 356, 230, 28), PAL.lilac, { baseC: '#CDB8FF', lw: 2.4 });
    paint(rrPts(122, 150, 236, 104, 18), '#8C74D8', { baseC: '#A994F0', lw: 1.6 });
    paint(ellPts(240, 72, 188, 42, 36), '#9D86E8', { baseC: '#BBA6FF', lw: 2.2 });
    for (const [x, y] of [[92, 112], [388, 112], [92, 276], [388, 276]]) paint(ellPts(x, y, 9, 9, 12), PAL.gold, { baseC: '#FFD75A', lw: 1 });
    wc('#FFFFFF', 90, 0.1); brush.rect(82, 96, 34, 180); brush.noFill();
  }, { ay: 72 / 330 });
  function domeSprite(name, c) {
    defSprite(name, 380, 220, () => {
      const pts = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + (i / 24) * Math.PI; pts.push([190 + Math.cos(a) * 158, 178 + Math.sin(a) * 150]); }
      paint(pts, c, { baseC: lite(c, 0.3), lw: 2.4 });
      wc('#FFFFFF', 170, 0.1); brush.circle(128, 88, 26); brush.noFill();
      blob(150, 62, 9, '#FFFFFF', 230, 0.05);
      paint(ellPts(190, 180, 174, 22, 32), dark(c, 0.18), { baseC: c, lw: 2 });
    }, { ay: 180 / 220 });
  }
  domeSprite('s13_dome_up', PAL.green);
  domeSprite('s13_dome_dn', PAL.red);
  function badgeSprite(name, c) {
    defSprite(name, 420, 420, () => {
      paint(ellPts(210, 210, 190, 190, 48), '#FFFFFF', { baseC: '#FFFFFF', lw: 2.8 });
      paint(ellPts(210, 210, 158, 158, 48), c, { baseC: lite(c, 0.25), lw: 2 });
      blob(150, 140, 46, '#FFFFFF', 90, 0.3);
    });
  }
  badgeSprite('s13_badge_up', PAL.mint);
  badgeSprite('s13_badge_dn', PAL.pink);
  // crescent mouth: dir 1 smiles, -1 frowns
  function mouthPts(cx, cy, dir) { const q = []; for (let i = 0; i <= 12; i++) { const a = 0.18 * Math.PI + (i / 12) * 0.64 * Math.PI; q.push([cx + Math.cos(a) * 36, cy + dir * (Math.sin(a) * 30 - 18)]); } for (let i = 12; i >= 0; i--) { const a = 0.18 * Math.PI + (i / 12) * 0.64 * Math.PI; q.push([cx + Math.cos(a) * 32, cy + dir * (Math.sin(a) * 18 - 12)]); } return q; }
  function faceSprite(name, c, kind) {
    defSprite(name, 170, 170, () => {
      paint(ellPts(85, 85, 70, 70, 36, 0.03), c, { baseC: lite(c, 0.3), lw: 2.6 });
      blob(40, 98, 10, PAL.pink, 120, 0.3); blob(130, 98, 10, PAL.pink, 120, 0.3);
      if (kind === 'dizzy') {
        for (const ex of [60, 110]) for (let i = 0; i < 40; i++) { const a = i * 0.42, r = 1 + i * 0.36; flat(ellPts(ex + Math.cos(a) * r, 64 + Math.sin(a) * r, 2.6, 2.6, 6), PAL.ink); }
        for (let i = 0; i <= 30; i++) { const x = 52 + i * 2.2; flat(ellPts(x, 116 + Math.sin(i * 0.6) * 6, 3.4, 3.4, 6), PAL.ink); }
      } else {
        flat(ellPts(60, 66, 8, 11, 14), PAL.ink); flat(ellPts(110, 66, 8, 11, 14), PAL.ink);
        flat(mouthPts(85, kind === 'frown' ? 128 : 104, kind === 'frown' ? -1 : 1), PAL.ink);
      }
     
    });
  }
  faceSprite('s13_smile', PAL.butter, 'smile');
  faceSprite('s13_frown', PAL.pink, 'frown');
  faceSprite('s13_dizzy', PAL.butter, 'dizzy');
  function tilt2(T) {
    const pre = -0.06 * Ez.out(inv(tGoes, tGoes + 0.2, T)) * (1 - sstep(tAskew - 0.05, tAskew + 0.03, T));
    return pre + 0.4 * Ez.outBack(inv(tAskew, tAskew + 0.32, T), 2.4);
  }
  const slide2 = (T, k = 1) => { const t = Math.max(0, T - tAskew - 0.04); return k * 0.5 * 5200 * 0.39 * t * t; };
  function pressAmt(T, side) { let p = 0; for (const [t, sd] of PRESS) if (sd === side && T >= t) p = Math.max(p, Math.exp(-(T - t) * 12)); return p; }
  function lastPress(T) { let r = null; for (const pr of PRESS) if (T >= pr[0]) r = pr; return r; }
  function raterPos(T) {
    if (T <= HOPS[0][0]) return [HOPS[0][1], HOPS[0][2], 0, false];
    for (let i = 0; i < HOPS.length - 1; i++) {
      const [t0, x0, y0] = HOPS[i], [t1, x1, y1] = HOPS[i + 1];
      if (T < t1) { const u = (T - t0) / (t1 - t0), h = Math.abs(x1 - x0) > 10 ? 255 : 75; return [lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(Math.PI * u) * h, T - t0, x1 < x0]; }
    }
    const L = HOPS[HOPS.length - 1]; return [L[1], L[2], T - L[0], false];
  }
  function drawButton(T, side) {
    const x = BX[side] + slide2(T, 0.35), pr = pressAmt(T, side);
    const nerv = inv(tGoes - 0.1, tAskew, T) * (1 - inv(tAskew, tAskew + 0.1, T));
    spr('s13_ped', x, RIM_Y, { r: nerv * 0.04 * Math.sin(T * 40) });
    spr(side ? 's13_dome_dn' : 's13_dome_up', x, RIM_Y + 3 + pr * 18, { sy: 1 - 0.14 * pr, sx: 1 + 0.06 * pr });
    if (pr > 0.05) glow(x, RIM_Y - 70, 180, side ? PAL.red : PAL.green, 0.5 * pr);
    // floating icon badge; thumbs wobble on "goes", then spin sideways on "askew"
    const spin = (Math.PI / 2 + TAU) * Ez.outBack(inv(tAskew, tAskew + 0.5, T), 1.3);
    const bob = Math.sin(T * 5 + side * 2) * 10 - 14 * kick(T, 5);
    const bx = BX[side] + slide2(T, 0.55), by = BADGE_Y + bob;
    const bs = 0.72 * (1 + 0.1 * pr + 0.05 * kick(T));
    spr(side ? 's13_badge_dn' : 's13_badge_up', bx, by, { s: bs, r: spin * 0.15 });
    spr('s13_thumb', bx + 4, by + 6, { s: bs * 0.95, r: (side ? Math.PI : 0) + spin + nerv * 0.25 * Math.sin(T * 34) });
  }
  function drawStamps(T) {
    for (let i = 0; i < PRESS.length; i++) {
      const [tp, sd] = PRESS[i], age = T - tp;
      if (age < 0) continue;
      const [tx, ty] = STAMP_AT[i];
      const fl = clamp(age / 0.2), land = age > 0.2 ? Math.exp(-(age - 0.2) * 16) : 0;
      const sl = slide2(T, 0.9 + R(i, 4) * 0.7);
      const x = lerp(BX[sd], tx, Ez.out(fl)) + sl, y = lerp(560, ty, Ez.out(fl)) - Math.sin(Math.PI * fl) * 140 + sl * 0.15;
      const name = T > tAskew + 0.06 ? 's13_dizzy' : sd ? 's13_frown' : 's13_smile';
      if (age > 0.2 && land > 0.04) ringLine(x, y, 70 + (1 - land) * 60, PAL.ink, 6 * land, land);
      const sc = (fl < 1 ? lerp(0.35, 1.2, fl) : 1) * 0.9;
      spr(name, x, y, { s: sc, sx: 1 + 0.3 * land, sy: 1 - 0.3 * land, r: RS(i, 9) * 0.3 + sl * 0.006, seed: i });
    }
  }
  function drawPops(T) {
    for (const [tp, sd] of PRESS) {
      const age = T - tp; if (age < 0 || age > 0.6) continue;
      burst(T, tp, BX[sd] + slide2(T, 0.35), DOME_TOP + 8, { n: 7, names: ['spark', 'sparkW'], spd: 620, g: 500, life: 0.45, s: 0.28, spread: Math.PI, ang0: -Math.PI / 2, even: true, seed: Math.round(tp * 100) });
      txt(sd ? '-1' : '+1', BX[sd] + slide2(T, 0.55) + (sd ? 150 : -150), 560 - age * 240, { font: 'pixel', size: 70, fill: sd ? PAL.red : PAL.green, stroke: '#FFFFFF', sw: 7, weight: 700 }, { a: 1 - inv(0.3, 0.6, age), s: Ez.outBack(clamp(age / 0.12)), r: sd ? 0.15 : -0.15 });
    }
  }
  function drawTransEdge12(T) {
    const p = trP(T, S2, TR12);
    if (p <= 0 || p >= 1) return;
    noFill(); strokeC(PAL.ink, 1, 6 + thumbScale(p) * 3); strokeJoin(ROUND);
    poly(thumbPts(THUMB_C[0], THUMB_C[1], thumbScale(p), thumbRot(p)));
    noStroke();
  }
  shot({
    id: 'L38-rlhf', t0: S2, tin: { type: 'mask', d: TR12.d, at: TR12.at, mask: (p) => { poly(thumbPts(THUMB_C[0], THUMB_C[1], thumbScale(p), thumbRot(p))); } },
    draw(s) {
      const T = s.T, th = tilt2(T);
      const askA = T - tAskew, askK = askA > 0 ? Math.exp(-askA * 6) : 0;
      const Z = 1.03 + 0.07 * inv(tAskew, tAskew + 0.3, T) + 0.015 * kick(T);
      bg(PAL.butterLt);
      push();
      cam(960, 540, Z, th); shake(askK * 16 + 2 * kick(T, 8), 9);
      spr('s13_sunny', 960, 540, { s: 2.8, jit: 0 });
      // sunburst rays
      push(); translate(960, 380); rotate(T * 0.35 + (askA > 0 ? askA * 3 : 0)); noStroke();
      for (let i = 0; i < 18; i++) {
        const a0 = (i / 18) * TAU, a1 = a0 + TAU / 36;
        fillC(i % 2 ? '#FFFFFF' : PAL.butter, 0.22 + 0.12 * kick(T, 4));
        triangle(0, 0, Math.cos(a0) * 2600, Math.sin(a0) * 2600, Math.cos(a1) * 2600, Math.sin(a1) * 2600);
      }
      pop();
      floaters(T, 8, 44, ['heart', 'spark', 'star5'], [80, 120, 1760, 820], 90, 0.22, 30);
      drawStamps(T);
      drawButton(T, 0); drawButton(T, 1);
      // Clawd (being rated) reacts to every click; goes dizzy on "askew"
      const lp = lastPress(T), lpa = lp ? T - lp[0] : 9;
      const dz = askA > 0.02;
      const cx = 960 + slide2(T, 0.8);
      clawd(cx, 1030, 0.5, {
        eyes: dz ? 's13_eye_spiral' : !lp ? 'ce_sq' : lp[1] ? 's13_eye_x' : 'ce_heart',
        armL: dz ? -2.2 : lp && !lp[1] ? -1.8 : 0.3, armR: dz ? -1.4 : lp && !lp[1] ? -1.8 : 0.3,
        hop: dz ? 0 : lp && !lp[1] ? Math.max(0, Math.sin(Math.PI * clamp(lpa / 0.22))) * 40 : 0,
        sq: 1 + 0.15 * Math.exp(-lpa * 14), r: dz ? Math.min(1.2, askA * 3.2) : 0, blush: lp && !lp[1] && !dz,
      });
      if (lp && !lp[1] && !dz) burst(T, lp[0], 960, 880, { n: 5, names: ['heart'], spd: 420, g: -200, life: 0.6, s: 0.3, spread: 1.6, ang0: -Math.PI / 2, seed: Math.round(lp[0] * 10) });
      // the tiny rater hops button to button, flailing
      const [rx, ry, ra, left] = raterPos(T);
      const tumble = askA > 0 ? askA * 9 : 0;
      const land = ra < 0.12 ? Math.exp(-ra * 20) : 0;
      push(); translate(rx + slide2(T, 1.25), ry + slide2(T, 0.3)); rotate(tumble);
      pip(0, 0, 0.5, {
        body: 'npc_body_mint', arm: 'npc_arm_mint', head: 'npc_head2', flip: left,
        face: askA > 0 ? 'pf_dizzy' : 'pf_nervous', armL: 2.0 + Math.sin(T * 26) * 0.6, armR: 2.1 + Math.cos(T * 23) * 0.6,
        legs: [Math.sin(T * 30) * 0.4, -Math.sin(T * 30) * 0.4], sq: 1 + 0.25 * land,
      });
      pop();
      drawPops(T);
      if (askA > 0 && askA < 0.8) burst(T, tAskew, 960, 540, { n: 16, names: ['spark', 'star5', 'blob_butter'], spd: 1300, g: 1400, life: 0.8, s: 0.45, seed: 23 });
      pop();
      drawTransEdge12(T);
    },
  });
  lyr(38, {
    y: 132, get r() { return tilt2(G.T) * 0.45; },
    words: { 0: { font: 'pixel', fill: PAL.butter, size: 92, anim: 'shake', jitter: 3 }, 1: { anim: 'drop' }, 2: { fill: PAL.pink, size: 96, anim: 'spin', tilt: 0.35 } },
  });

  // ================================================================== L39 - I'm upping my P(doom)
  const G3 = { x: 960, y: 610, s: 0.9 };
  const HUB = [G3.x, G3.y + 255 * G3.s];
  const BEACON = [960, 300];
  const CRACK_O = [1012, 562];
  const IMPACT = [G3.x + (CRACK_O[0] - 550) * G3.s, G3.y + (CRACK_O[1] - 320) * G3.s];
  const tSnap = tPdoom + 0.08, SNAP_ANG = TAU + 0.24;
  defSprite('s13_alarm', 1000, 580, () => {
    base('#2A1838'); flat([[-30, 440], [1030, 440], [1030, 610], [-30, 610]], '#1B1026');
    wash(-40, -40, 1080, 660, '#2A1A3E', 235, 0.08);
    blob(500, 190, 330, '#4A2150', 130, 0.4);
    blob(130, 110, 170, '#6A1E3A', 110, 0.4);
    blob(870, 110, 170, '#6A1E3A', 110, 0.4);
    pen('#4A3868', 2.2, '2B');
    for (let x = 40; x < 1000; x += 120) brush.line(x, -10, x + 4, 440);
    brush.line(-10, 140, 1010, 142); brush.noStroke();
    wash(-40, 440, 1080, 200, '#190F2C', 210, 0.12);
    blob(500, 480, 300, '#3A1A40', 120, 0.3);
  });
  defSprite('s13_glass', 1100, 640, () => {
    const cx = 550, cy = 590, Rg = 520;
    const pts = []; for (let i = 0; i <= 44; i++) { const a = Math.PI + (i / 44) * Math.PI; pts.push([cx + Math.cos(a) * Rg, cy + Math.sin(a) * Rg]); }
    flat(pts, PAL.skyLt, 0.06);
    const arcP = (r, a0, a1) => { const q = []; for (let i = 0; i <= 12; i++) { const a = a0 + (a1 - a0) * (i / 12); q.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return q; };
    strokePath(arcP(470, Math.PI * 1.12, Math.PI * 1.36), '#FFFFFF', 9, 'marker', 0.5);
    strokePath(arcP(432, Math.PI * 1.42, Math.PI * 1.5), '#FFFFFF', 6, 'marker', 0.5);
    strokePath(arcP(488, Math.PI * 1.7, Math.PI * 1.8), '#FFFFFF', 5, 'marker', 0.5);
   
  });
  defSprite('s13_crack', 1100, 640, () => {
    const [ox, oy] = CRACK_O, cx = 550, cy = 590;
    const inside = (x, y) => Math.hypot(x - cx, y - cy) < 515 && y < 600;
    for (let i = 0; i < 12; i++) {
      let a = Math.PI * 0.72 + (i / 11) * Math.PI * 0.86 + (random() - 0.5) * 0.15, x = ox, y = oy;
      const q = [[x, y]];
      const n = 5 + Math.floor(random() * 6);
      for (let k = 0; k < n; k++) {
        a += (random() - 0.5) * 0.7; const L = 40 + random() * 70;
        const nx = x + Math.cos(a) * L, ny = y + Math.sin(a) * L;
        if (!inside(nx, ny)) break;
        x = nx; y = ny; q.push([x, y]);
        if (k === 2 && random() < 0.6) { const b = a + (random() < 0.5 ? -0.8 : 0.8); strokePath([[x, y], [x + Math.cos(b) * 60, y + Math.sin(b) * 60], [x + Math.cos(b + 0.3) * 110, y + Math.sin(b + 0.3) * 110]].filter((p) => inside(p[0], p[1])), PAL.ink, 1.6, 'pen', 0.1); }
      }
      if (q.length > 1) { strokePath(offsetPts(q, 2, 2), '#FFFFFF', 2, 'pen', 0.05); strokePath(q, PAL.ink, 2.2, '2B', 0.05); }
    }
    for (const rr of [46, 96]) {
      const q = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.75 + (i / 10) * Math.PI * 0.8; const r = rr * (0.85 + random() * 0.3); q.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r]); }
      strokePath(q.filter((p) => inside(p[0], p[1])), PAL.ink, 1.8, '2B', 0.05);
    }
    flat(starPts(ox, oy, 30, 12, 7), '#3A2E5C', 0.9);
    pen('#FFFFFF', 1.6, 'pen'); brush.polygon(starPts(ox, oy, 30, 12, 7)); brush.noStroke();
  });
  defSprite('s13_shard', 90, 90, () => {
    const pts = [[45 + (random() - 0.5) * 20, 8], [80, 60 + random() * 20], [10 + random() * 20, 76]];
    paint(pts, PAL.skyLt, { baseC: '#EAF6FF', lw: 1.4, a: 150 });
    pen('#FFFFFF', 2.4, 'pen'); brush.line(pts[0][0], pts[0][1] + 10, pts[0][0] + 8, 50); brush.noStroke();
  }, { v: 3 });
  defSprite('s13_siren', 240, 230, () => {
    paint(rrPts(40, 164, 160, 50, 12), PAL.gray, { baseC: '#C6C0D4', lw: 2 });
    const dome = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; dome.push([120 + Math.cos(a) * 72, 168 + Math.sin(a) * 124]); }
    paint(dome, PAL.red, { baseC: '#FF6A7A', lw: 2.4 });
    wc('#FFFFFF', 160, 0.08); brush.rect(86, 72, 16, 72); brush.noFill();
    pen(dark(PAL.red, 0.35), 2, 'pen'); brush.line(120, 52, 120, 160); brush.line(150, 70, 158, 160); brush.noStroke();
  }, { v: 2, ay: 0.92 });
  defSprite('s13_bell', 200, 210, () => {
    paint(rrPts(92, 150, 16, 50, 6), PAL.gray, { baseC: '#C6C0D4', lw: 1.6 });
    paint(ellPts(100, 94, 78, 78, 36), PAL.gold, { baseC: '#FFD75A', lw: 2.4 });
    paint(ellPts(100, 94, 46, 46, 28), '#E3A21E', { baseC: PAL.gold, lw: 1.6 });
    paint(ellPts(100, 94, 12, 12, 16), PAL.ink, { baseC: PAL.inkSoft, lw: 1 });
    wc('#FFFFFF', 160, 0.1); brush.circle(70, 64, 14); brush.noFill();
  });
  defSprite('s13_cup', 170, 140, () => {
    paint(ellPts(85, 118, 72, 14, 28), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6 });
    pen(PAL.ink, 2.4, '2B'); brush.circle(142, 72, 18); brush.noStroke();
    paint([[28, 40], [140, 40], [124, 112], [44, 112]], PAL.mint, { baseC: '#A8E8D0', lw: 2 });
    paint(ellPts(84, 40, 56, 9, 24), '#B07A5A', { baseC: '#C99A73', lw: 1.4 });
    paint(heartPts(84, 80, 22), PAL.pink, { baseC: PAL.pinkLt, lw: 1 });
  });
  defSprite('s13_warn', 200, 184, () => {
    paint(rrPtsPoly([[100, 14], [188, 170], [12, 170]], 16), PAL.butter, { baseC: '#FFE680', lw: 2.8 });
    paint(rrPts(89, 62, 22, 64, 9), PAL.ink, { baseC: PAL.inkSoft, lw: 1 });
    paint(ellPts(100, 146, 12, 12, 16), PAL.ink, { baseC: PAL.inkSoft, lw: 1 });
  });
  // the world arrives still tilted from L38 and springs upright
  const rot3 = (T) => (T < 122.3 ? 0.36 : 0.36 * Math.exp(-(T - 122.3) * 5) * Math.cos((T - 122.3) * 11));
  function beaconScreen(T) { const r = rot3(T), dy = BEACON[1] - 540; return [960 - dy * Math.sin(r), 540 + dy * Math.cos(r)]; }
  // siren-sweep wedge (radar style) from the beacon; ragged leading edge
  function sweepPts(p, T) {
    const [cx, cy] = beaconScreen(T), a0 = -Math.PI / 2 + rot3(T), a1 = a0 + TAU * Ez.inOut(clamp(p));
    const pts = [[cx, cy]], n = Math.max(2, Math.ceil((a1 - a0) / 0.08));
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); pts.push([cx + Math.cos(a) * 2700, cy + Math.sin(a) * 2700]); }
    for (let i = 1; i < 16; i++) { const d = 2700 * (1 - i / 16), w = RS(i, 7) * 16 + 6; pts.push([cx + Math.cos(a1) * d - Math.sin(a1) * w, cy + Math.sin(a1) * d + Math.cos(a1) * w]); }
    return pts;
  }
  function beams(T, x, y, speed, len, a, w, ph0 = 0) {
    blendMode(ADD); noStroke();
    for (let k = 0; k < 2; k++) {
      const ang = T * speed + ph0 + k * Math.PI;
      for (const [ww, aa] of [[w, a * 0.55], [w * 0.45, a]]) {
        fill(232, 58, 79, 255 * aa);
        triangle(x, y, x + Math.cos(ang - ww) * len, y + Math.sin(ang - ww) * len, x + Math.cos(ang + ww) * len, y + Math.sin(ang + ww) * len);
      }
    }
    blendMode(BLEND);
  }
  function needleVal(T) {
    let v = pdoomAt(T);
    const build = inv(tIm, tUpping, T);
    v += Math.sin(T * 47) * (0.8 + 2.4 * build) + Math.sin(T * 29 + 1) * 0.9 * build + 2.2 * kick(T, 7);
    if (T > tUpping - 0.02) {
      const dip = Math.sin(Math.PI * inv(tUpping - 0.02, tUpping + 0.16, T)) * 10;
      v = lerp(v - dip, 100 + Math.sin(T * 90) * 0.7, Ez.inOut(inv(tUpping + 0.08, tMy + 0.06, T)));
    }
    return v;
  }
  function flyNeedle(T) {
    const t = T - tSnap;
    const c0 = [HUB[0] + Math.cos(SNAP_ANG) * 190 * G3.s, HUB[1] + Math.sin(SNAP_ANG) * 190 * G3.s];
    return [c0[0] + 1500 * t, c0[1] - 1750 * t + 1300 * t * t, SNAP_ANG - 15 * t, 1 + t * 1.2];
  }
  function drawGauge3(T) {
    if (T < tPdoom - 0.015) {
      drawGauge(G3.x, G3.y, G3.s, clamp(needleVal(T), 0, 100));
    } else {
      push(); translate(G3.x, G3.y); scale(G3.s);
      spr('gauge', 0, 0, { jit: 0.4 });
      const hy = 255;
      if (T < tSnap) {
        const ang = Math.PI + Math.PI * (1 + 0.076 * Ez.outBack(inv(tPdoom - 0.015, tPdoom + 0.05, T), 3));
        segLine(0, hy, Math.cos(ang) * 400, hy + Math.sin(ang) * 400, PAL.ink, 22);
        segLine(0, hy, Math.cos(ang) * 380, hy + Math.sin(ang) * 380, PAL.coral, 8);
      } else {
        const a = SNAP_ANG + Math.sin((T - tSnap) * 50) * 0.2 * Math.exp(-(T - tSnap) * 6);
        segLine(0, hy, Math.cos(a) * 70, hy + Math.sin(a) * 70, PAL.ink, 22);
        segLine(Math.cos(a) * 60, hy + Math.sin(a) * 60, Math.cos(a + 0.5) * 84, hy + Math.sin(a + 0.5) * 84, PAL.ink, 12);
      }
      disc(0, hy, 46, PAL.ink); disc(0, hy, 18, PAL.coral);
      pop();
    }
    spr('s13_glass', G3.x, G3.y, { s: G3.s, jit: 0.4 });
    if (T > tPdoom) {
      const k = Ez.out(inv(tPdoom, tPdoom + 0.14, T));
      spr('s13_crack', G3.x, G3.y, { s: G3.s, jit: 0.3, crop: [Math.max(0, 0.93 - k * 0.93), 0, 1, 1] });
    }
  }
  shot({
    id: 'L39-pdoom-gauge', t0: S3, tin: { type: 'mask', d: TR23.d, at: TR23.at, mask: (p, T) => { poly(sweepPts(p, T)); } },
    draw(s) {
      const T = s.T;
      const hit = T - tPdoom, hitK = hit > 0 ? Math.exp(-hit * 4) : 0;
      const build = inv(tIm, tPdoom, T);
      const cx = moves(T, 960, [[122.92, 123.28, 680], [123.84, 124.2, 1320], [124.62, 124.84, 960, Ez.out], [124.86, 125.44, 1020, Ez.in], [125.5, 126.25, 1240]]);
      const cy = moves(T, 540, [[122.92, 123.28, 720], [124.62, 124.84, 560, Ez.out], [124.86, 125.44, 600, Ez.in], [125.5, 126.25, 520]]);
      const Z = moves(T, 1, [[122.92, 123.28, 1.42], [124.62, 124.84, 1.04, Ez.out], [124.86, 125.44, 1.16, Ez.in], [125.44, 125.62, 1.07, Ez.out]]);
      bg('#1A1030');
      push();
      cam(cx, cy, Z, rot3(T)); shake(hitK * 26 + 1.5 + 4 * build, 5);
      spr('s13_alarm', 960, 540, { s: 3, jit: 0 });
      // hazard stripes along the floor edge
      noStroke();
      for (let i = -8; i < 40; i++) { fillC(i % 2 ? PAL.ink : PAL.butter, 0.85); const x = i * 60; quad(x, 902, x + 60, 902, x + 40, 930, x - 20, 930); }
      const sp = 7 + hitK * 10 + build * 3;
      beams(T, BEACON[0], BEACON[1] - 60, sp, 2400, 0.16 + 0.1 * build, 0.2);
      beams(T, 160, 120, sp * 1.2, 1800, 0.12, 0.16, 1);
      beams(T, 1760, 120, -sp * 1.1, 1800, 0.12, 0.16, 2);
      // wall alarms
      for (const [x, y, sd] of [[190, 470, 0], [1730, 470, 1]]) {
        const r = Math.sin(T * 58 + sd) * 0.22 * (0.6 + 0.4 * build);
        spr('s13_bell', x, y, { s: 0.8, r });
        for (let k = 0; k < 3; k++) { const ph = fract(T * 3 + k / 3); const rr = 90 + ph * 80; noFill(); strokeC(PAL.butter, (1 - ph) * 0.8, 5); arc(x, y, rr * 2, rr * 2, sd ? -0.7 : Math.PI - 0.7 + 0.0, sd ? 0.7 : Math.PI + 0.7); noStroke(); }
      }
      for (const [x, y] of [[160, 120], [1760, 120]]) { spr('s13_siren', x, y + 50, { s: 0.55 }); glow(x, y, 90, PAL.red, 0.35 + 0.25 * Math.abs(Math.sin(T * sp))); }
      // warning signs pop on the beats
      const b = beatAt(T);
      for (let i = 0; i < 4; i++) {
        const [wx, wy] = [[330, 320], [1590, 320], [270, 700], [1650, 700]][i];
        const on = (b.i + i) % 2 === 0 ? kick(T, 3) : 0.35;
        spr('s13_warn', wx, wy, { s: 0.5 * (0.85 + 0.3 * on), r: RS(i, 3) * 0.15, a: 0.5 + 0.5 * on });
      }
      // the dial strains and swells before the hit
      const strain = inv(tMy - 0.1, tPdoom, T) * (T < tPdoom ? 1 : 0);
      const swell = 1 + 0.02 * kick(T, 6) * build + 0.035 * strain * (0.6 + 0.4 * Math.sin(T * 70));
      push(); translate(G3.x, HUB[1]); scale(swell); rotate(Math.sin(T * 53) * 0.012 * strain); translate(-G3.x, -HUB[1]);
      drawGauge3(T);
      pop();
      // main beacon on top of the gauge
      spr('s13_siren', BEACON[0], BEACON[1] + 70, { s: 0.85 });
      glow(BEACON[0], BEACON[1] - 10, 150, PAL.red, 0.35 + 0.3 * Math.abs(Math.sin(T * sp)) + hitK * 0.3);
      // Pip panics: runs back and forth, flails, grabs head on "upping", leaps on "P(doom)"
      const run = 1 - sstep(tUpping - 0.08, tUpping + 0.06, T);
      const ph = T * 5.4, px = 500 + Math.sin(ph) * 80 * run;
      const leap = Math.sin(Math.PI * inv(tPdoom, tPdoom + 0.5, T)) * 150;
      const grab = sstep(tUpping - 0.08, tUpping + 0.06, T);
      pip(px + RS(G.boil, 4) * 4 * grab, 1015, 0.95, {
        face: T > tUpping ? 'pf_shock' : 'pf_scared', flip: Math.cos(ph) < 0 && run > 0.5,
        walk: run > 0.2 ? T * 3.6 : null, hop: Math.abs(Math.sin(T * 11)) * 24 * run + leap,
        armL: lerp(2.2 + Math.sin(T * 21) * 0.55, 2.85, grab), armR: lerp(2.3 + Math.sin(T * 19 + 1) * 0.55, 2.85, grab),
        r: leap > 0 ? Math.sin(T * 20) * 0.1 : 0, lean: Math.sin(T * 13) * 0.08,
      });
      for (let k = 0; k < 8; k++) { const bt = beatT(b.i - k); burst(T, bt, px + 30, 740 - leap, { n: 3, names: ['drop'], spd: 520, g: 1500, life: 0.7, s: 0.5, spread: 1.7, ang0: -Math.PI / 2 + (k % 2 ? 0.7 : -0.7), seed: (b.i - k) * 5 }); }
      if (grab > 0.5 && T < tPdoom + 0.6) txt('!!', px + 110, 690 - leap, { size: 120, fill: PAL.red, stroke: '#FFFFFF', sw: 9 }, { s: Ez.outBack(clamp((T - tUpping) / 0.18), 3) * (1 + 0.08 * kick(T)), r: -0.15 });
      // Clawd stays perfectly calm with a cup of tea
      const calmX = 1610, calmY = 1012, cs = 0.62;
      const sip = sstep(0.55, 0.8, fract((T - S3) / (BEAT_LEN * 4))) * (1 - sstep(0.85, 1, fract((T - S3) / (BEAT_LEN * 4))));
      const whoosh = hit > 0.05 && hit < 0.55;
      clawd(calmX, calmY, cs, { eyes: whoosh ? 'ce_sq' : 'ce_happy', look: whoosh ? [0.4, -0.5] : [0, 0], armL: 0.3, armR: -0.7 - 0.5 * sip, r: Math.sin(T * 2.2) * 0.025, sq: 1 + 0.02 * Math.sin(T * 3), blush: true });
      const ar = -0.7 - 0.5 * sip, ax = calmX + 4 * CU * cs + Math.cos(ar) * 2.3 * CU * cs, ay = calmY - 5 * CU * cs + Math.sin(ar) * 2.3 * CU * cs;
      spr('s13_cup', ax + 10, ay - 30, { s: 0.62, r: -0.35 * sip });
      for (let k = 0; k < 3; k++) { const f = fract(T * 0.9 + k / 3); spr('puff', ax + 10 + Math.sin(T * 3 + k * 2) * 12, ay - 70 - f * 90, { s: 0.12 + f * 0.16, a: (1 - f) * 0.6, seed: k }); }
      floaters(T, 3, 81, ['note'], [calmX - 160, calmY - 420, 320, 200], 70, 0.32, 18);
      // the hit: glass shatters, the needle snaps off and flies at the camera
      if (hit > 0) {
        burst(T, tPdoom + 0.01, IMPACT[0], IMPACT[1], { n: 20, names: ['s13_shard'], spd: 1500, g: 1800, life: 1.0, s: 0.7, spin: 9, seed: 71 });
        burst(T, tPdoom + 0.01, IMPACT[0], IMPACT[1], { n: 18, names: ['blob_red', 'blob_orange', 'spark', 'star5'], spd: 1200, g: 700, life: 0.9, s: 0.5, seed: 72 });
        for (let i = 0; i < 3; i++) { const a = hit - i * 0.08; if (a > 0) ringLine(IMPACT[0], IMPACT[1], 40 + a * 900, PAL.white, 10 * (1 - clamp(a * 2)), clamp(1 - a * 2)); }
        if (T > tSnap) {
          for (let k = 0; k < 4; k++) { const f = fract(T * 1.4 + k / 4); spr('puff', HUB[0] + Math.sin(k * 3 + T * 2) * 30, HUB[1] - f * 160, { s: 0.2 + f * 0.35, a: (1 - f) * 0.5, seed: k }); }
          burst(T, tSnap, HUB[0], HUB[1], { n: 10, names: ['spark', 'sparkW'], spd: 900, g: 200, life: 0.6, s: 0.4, even: true, seed: 73 });
          const [nx, ny, nr, ns] = flyNeedle(T);
          for (let k = 1; k <= 6; k++) { const [qx, qy] = flyNeedle(T - k * 0.025); segLine(qx, qy, nx, ny, PAL.butter, 14 * (1 - k / 7), 0.35 * (1 - k / 7)); }
          glow(nx, ny, 110 * ns, PAL.butter, 0.5);
          needle(nx, ny, nr, 400 * G3.s, ns);
        }
      }
      pop();
      // red alarm wash pulsing with the beacon, a flash on the hit
      noStroke(); fill(232, 58, 79, 255 * (0.06 + 0.08 * Math.abs(Math.sin(T * sp)) + 0.35 * hitK * hitK)); rect(-20, -20, W + 40, H + 40);
      if (hit > 0 && hit < 0.25) { fill(255, 250, 240, 255 * 0.55 * Math.exp(-hit * 14)); rect(-20, -20, W + 40, H + 40); }
      // the sweep's leading beam while the transition runs
      const p23 = trP(T, S3, TR23);
      if (p23 > 0 && p23 < 1) {
        const [bx, by] = beaconScreen(T), a1 = -Math.PI / 2 + rot3(T) + TAU * Ez.inOut(p23);
        blendMode(ADD); fill(255, 120, 120, 150); triangle(bx, by, bx + Math.cos(a1 - 0.1) * 2700, by + Math.sin(a1 - 0.1) * 2700, bx + Math.cos(a1) * 2700, by + Math.sin(a1) * 2700); blendMode(BLEND);
      }
    },
  });
  lyr(39, { y: 160, words: { 0: { wave: 6 }, 1: { anim: 'rise', fill: PAL.butter }, 3: { font: 'pixel', fill: PAL.red, size: 116, anim: 'zoom', jitter: 6 } } });

  // ================================================================== L40 - Just as foretold by Loom
  const FR = { x0: 560, y0: 240, x1: 1360, y1: 840 };
  const WARP = []; for (let x = 592; x <= 1330; x += 24) WARP.push(x);
  const WEFT_Y = 958;
  defSprite('s13_night', 1000, 580, () => {
    base('#1E1942');
    wash(-40, -40, 1080, 660, '#221C4A', 235, 0.08);
    blob(500, 290, 330, '#3B2E78', 140, 0.4);
    blob(170, 130, 180, '#5A3C8C', 90, 0.4);
    blob(850, 150, 170, '#2E4A8C', 90, 0.4);
    blob(500, 540, 280, '#6A4AA0', 120, 0.3);
    for (let i = 0; i < 70; i++) flat(ellPts(random() * 1000, random() * 420, 1 + random() * 1.6, 1 + random() * 1.6, 8), '#FFFFFF', 0.45 + random() * 0.55);
   
  });
  // wooden loom; sprite covers world x 460..1460, y 825..1125
  defSprite('s13_loom', 1000, 300, () => {
    const X = (x) => x - 460, Y = (y) => y - 825;
    const cloth = [PAL.pink, PAL.mint, PAL.butter, PAL.sky, PAL.lilac, PAL.coralLt, PAL.mint];
    for (let j = 0; j < cloth.length; j++) { flat(rrPts(X(586), Y(982 + j * 9), 750, 10, 3), cloth[j]); flat(rrPts(X(586), Y(982 + j * 9), 750, 3, 1), lite(cloth[j], 0.35)); }
    pen(PAL.ink, 1.4, 'pen');
    for (let x = 600; x < 1330; x += 24) brush.line(X(x), Y(982), X(x), Y(1044));
    brush.noStroke();
    paint(rrPts(X(510), Y(880), 900, 30, 12), PAL.brown, { baseC: PAL.brownLt, lw: 2.2 });
    paint(rrPts(X(510), Y(1040), 900, 38, 12), PAL.brown, { baseC: PAL.brownLt, lw: 2.2 });
    paint(rrPts(X(522), Y(852), 42, 290, 14), PAL.brown, { baseC: PAL.brownLt, lw: 2.2 });
    paint(rrPts(X(1356), Y(852), 42, 290, 14), PAL.brown, { baseC: PAL.brownLt, lw: 2.2 });
    for (const x of [543, 1377]) paint(ellPts(X(x), Y(852), 28, 26, 20), PAL.brownLt, { baseC: '#D9B08E', lw: 2 });
    pen(dark(PAL.brown, 0.3), 1.4, 'pen');
    brush.line(X(540), Y(893), X(1380), Y(895)); brush.line(X(540), Y(1058), X(1380), Y(1056));
    brush.noStroke(); flush();
    // trim the paper-white bleed around the wood so it sits cleanly on the night sky
    eraseRect(108, -10, 784, 60); eraseRect(-10, -10, 66, 320); eraseRect(944, -10, 66, 320); eraseRect(108, 258, 784, 60);
    eraseRect(106, 87, 788, 69);   // open weaving window between the top beam and the cloth (warp is drawn live)
  });
  defSprite('s13_heddle', 900, 50, () => {
    flat(rrPts(20, 14, 860, 22, 10), '#C99A73'); flat(rrPts(24, 16, 852, 7, 3), '#E3C09C');
    pen(PAL.ink, 1.8, '2B'); brush.polygon(rrPts(20, 14, 860, 22, 10)); brush.noStroke();
    for (let i = 0; i < 20; i++) flat(ellPts(60 + i * 40, 25, 4, 4, 8), PAL.gold);
   
  });
  defSprite('s13_frame', 900, 700, () => {
    const o = 50, w = 800, h = 600, b = 66;
    const bars = [
      [[o, o], [o + w, o], [o + w - b, o + b], [o + b, o + b]],
      [[o + w, o], [o + w, o + h], [o + w - b, o + h - b], [o + w - b, o + b]],
      [[o + w, o + h], [o, o + h], [o + b, o + h - b], [o + w - b, o + h - b]],
      [[o, o + h], [o, o], [o + b, o + b], [o + b, o + h - b]],
    ];
    for (const q of bars) paint(q, PAL.gold, { baseC: '#FFD36A', lw: 2.2, a: 190 });
    // woven braid along each bar (a zigzag per colour)
    const cols = [PAL.pink, PAL.sky, PAL.mint];
    const runs = [[[o + b, o + b / 2], [o + w - b, o + b / 2]], [[o + w - b / 2, o + b], [o + w - b / 2, o + h - b]], [[o + w - b, o + h - b / 2], [o + b, o + h - b / 2]], [[o + b / 2, o + h - b], [o + b / 2, o + b]]];
    runs.forEach(([p0, p1], ri) => {
      const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ux = (p1[0] - p0[0]) / L, uy = (p1[1] - p0[1]) / L;
      cols.forEach((c, ci) => {
        const q = []; const n = Math.floor(L / 30);
        for (let i = 0; i <= n; i++) { const t = i / n, side = ((i + ci) % 2 ? 1 : -1) * 20; q.push([p0[0] + (p1[0] - p0[0]) * t - uy * side, p0[1] + (p1[1] - p0[1]) * t + ux * side]); }
        strokePath(q, c, 5, 'marker', 0.35);
      });
    });
    pen(PAL.brown, 2.4, '2B'); brush.rect(o + b - 4, o + b - 4, w - 2 * b + 8, h - 2 * b + 8); brush.rect(o + 8, o + 8, w - 16, h - 16); brush.noStroke();
    for (const [cx, cy] of [[o + b / 2, o + b / 2], [o + w - b / 2, o + b / 2], [o + w - b / 2, o + h - b / 2], [o + b / 2, o + h - b / 2]]) {
      paint(ellPts(cx, cy, 44, 44, 28), PAL.coral, { baseC: PAL.coralLt, lw: 2.2 });
      const q = []; for (let i = 0; i < 30; i++) { const a = i * 0.42, r = 4 + i * 1.1; q.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      strokePath(q, PAL.butterLt, 3, 'marker', 0.6);
    }
    // crest knot at the top centre
    paint(ellPts(450, o + 4, 40, 30, 24), PAL.lilac, { baseC: PAL.lilacLt, lw: 2 });
    paint([[450, o + 4], [400, o - 30], [396, o + 30]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.8 });
    paint([[450, o + 4], [500, o - 30], [504, o + 30]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.8 });
    flush();
    eraseRect(o + b + 3, o + b + 3, w - 2 * b - 6, h - 2 * b - 6);   // clean opening (no paper-white bleed)
    eraseRect(-10, -10, 400, 44); eraseRect(510, -10, 400, 44); eraseRect(-10, 666, 920, 44); eraseRect(-10, -10, 44, 720); eraseRect(866, -10, 44, 720);
  });
  // the prophecy: a woven pixel Clawd under a watching eye (paper 600 x 440)
  defSprite('s13_scroll', 620, 460, () => {
    paint(rrPts(10, 10, 600, 440, 14), PAL.cream, { baseC: '#FFF6E2', lw: 2 });
    blob(90, 380, 90, PAL.brownLt, 40, 0.4); blob(540, 90, 80, PAL.brownLt, 35, 0.4);
    const u = 26, ox = 310 - 6 * u, oy = 250 - 4 * u;
    const cell = (gx, gy, c) => flat([[ox + gx * u, oy + gy * u], [ox + gx * u + u, oy + gy * u], [ox + gx * u + u, oy + gy * u + u], [ox + gx * u, oy + gy * u + u]], c);
    for (let gx = 2; gx < 10; gx++) for (let gy = 0; gy < 6; gy++) cell(gx, gy, (gx + gy) % 2 ? PAL.coral : '#F46A52');
    for (const gx of [0, 1, 10, 11]) for (const gy of [2, 3]) cell(gx, gy, (gx + gy) % 2 ? PAL.coral : '#F46A52');
    for (const gx of [2, 4, 7, 9]) for (const gy of [6, 7]) cell(gx, gy, (gx + gy) % 2 ? PAL.coral : '#F46A52');
    cell(3, 1, PAL.black); cell(8, 1, PAL.black);
    wc(PAL.coralDk, 60, 0.04, 0.6, 0.5); brush.rect(ox + 2 * u, oy + 4.5 * u, 8 * u, 1.5 * u); brush.noFill();
    for (let i = 0; i <= 12; i++) flat([[ox + i * u - 0.7, oy + 2 * u], [ox + i * u + 0.7, oy + 2 * u], [ox + i * u + 0.7, oy + 4 * u], [ox + i * u - 0.7, oy + 4 * u]], PAL.coralDk, 0.6);
    for (let i = 0; i <= 8; i++) flat([[ox + 2 * u, oy + i * u - 0.7], [ox + 10 * u, oy + i * u - 0.7], [ox + 10 * u, oy + i * u + 0.7], [ox + 2 * u, oy + i * u + 0.7]], PAL.coralDk, 0.6);
    const sil = [[2, 0], [10, 0], [10, 2], [12, 2], [12, 4], [10, 4], [10, 8], [9, 8], [9, 6], [8, 6], [8, 8], [7, 8], [7, 6], [5, 6], [5, 8], [4, 8], [4, 6], [3, 6], [3, 8], [2, 8], [2, 4], [0, 4], [0, 2], [2, 2]].map(([x, y]) => [ox + x * u, oy + y * u]);
    pen(PAL.ink, 2.2, '2B'); brush.polygon(sil); brush.noStroke();
    // the watching eye, stars, moon and rune borders
    paint([[250, 72], [310, 44], [370, 72], [310, 100]], '#FFFFFF', { baseC: '#FFFFFF', lw: 2 });
    paint(ellPts(310, 72, 18, 18, 20), PAL.lilac, { baseC: PAL.lilacLt, lw: 1.4 });
    flat(ellPts(310, 72, 7, 7, 12), PAL.ink);
    for (const [x, y, r] of [[120, 120, 18], [500, 140, 14], [140, 300, 12], [480, 320, 16], [300, 390, 10]]) paint(starPts(x, y, r, r * 0.4, 4), PAL.butter, { baseC: PAL.butterLt, lw: 1.2 });
    paint([[470, 50], [520, 60], [540, 100], [520, 140], [490, 146], [512, 116], [512, 80]], PAL.butter, { baseC: PAL.butterLt, lw: 1.4 });
    for (let i = 0; i < 16; i++) { const x = 50 + i * 33; for (const y of [26, 424]) flat([[x, y], [x + 20, y], [x + 10, y + 10]], PAL.inkSoft, 0.8); }
   
  });
  defSprite('s13_roller', 700, 70, () => {
    paint(rrPts(40, 20, 620, 30, 14), '#B98A62', { baseC: '#D9B08E', lw: 2 });
    paint(ellPts(30, 35, 22, 26, 20), PAL.gold, { baseC: '#FFD75A', lw: 1.8 });
    paint(ellPts(670, 35, 22, 26, 20), PAL.gold, { baseC: '#FFD75A', lw: 1.8 });
  });
  // the tree of possible futures, grown from the loom's warp (deterministic, built once)
  const TREE = [], TIPS = [];
  const TREE_COL = [PAL.butter, PAL.pink, PAL.mint, PAL.sky, PAL.lilac, PAL.butterLt];
  const TIP_ICON = ['heart', 'star5', 'spark', 'paperclip', 'note', 'heartR', 'sparkW', 'drop'];
  const TREE_T0 = 126.4;
  (function grow(x, y, ang, len, d, t0, seed) {
    const pts = [[x, y]]; let px = x, py = y, a = ang;
    const bend = RS(seed, 3) * 0.4;
    for (let i = 1; i <= 4; i++) { a += bend * 0.3; px += (Math.cos(a) * len) / 4; py += (Math.sin(a) * len) / 4; pts.push([px, py]); }
    const dur = 0.09 + 0.02 * d;
    TREE.push({ pts, d, t0, dur, w: [10, 7.5, 5.5, 4, 3, 2.2][d], seed });
    if (d >= 5 || py < 262) { TIPS.push({ x: px, y: py, t: t0 + dur, seed }); return; }
    const kids = d === 0 ? 4 : 2;
    for (let k = 0; k < kids; k++) {
      let ca = d === 0 ? -Math.PI / 2 + [-1.2, -0.42, 0.42, 1.2][k] + RS(seed + k, 5) * 0.08 : a + (k ? 1 : -1) * (0.46 - d * 0.03) + RS(seed * 3 + k, 5) * 0.16;
      ca = clamp(ca, -Math.PI + 0.12, -0.12);
      const L = d === 0 ? (k === 0 || k === 3 ? 250 : 175) : len * (0.8 + R(seed + k, 6) * 0.12);
      grow(px, py, ca, L, d + 1, t0 + dur * 0.8, seed * 5 + k + 1);
    }
  })(960, 800, -Math.PI / 2, 150, 0, TREE_T0, 1);
  // needle path: through the loom, loop, up the trunk, circle the canopy, then down to unroll the scroll
  const NP = [[125.8, -380, 960], [126.02, 330, WEFT_Y], [126.24, 1360, WEFT_Y - 4], [126.31, 1410, 850], [126.37, 1250, 782], [126.43, 990, 812], [126.55, 960, 540], [126.72, 1190, 360], [126.92, 750, 330], [127.14, 880, 272], [127.34, 960, 258], [127.6, 960, 790]];
  const needlePos = (T) => [track(T, NP.map((k) => [k[0], k[1]])), track(T, NP.map((k) => [k[0], k[2]]))];
  const tScroll0 = 127.36, tScroll1 = 127.6;
  const scrollK = (T) => Ez.out(inv(tScroll0, tScroll1, T));
  const TREE_LITE = TREE_COL.map((c) => lite(c, 0.35));
  // every branch of one depth grows in the same window, so fully grown depths are pre-rendered sprites
  const DEPTH_T = []; for (const b of TREE) DEPTH_T[b.d] = [b.t0, b.t0 + b.dur];
  const TB = (() => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const b of TREE) for (const [x, y] of b.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0: Math.floor(x0 - 40), y0: Math.floor(y0 - 40), w: Math.ceil(x1 - x0 + 80), h: Math.ceil(y1 - y0 + 80) }; })();
  const TREE_GROUPS = [[0, 1, 2, 3], [4], [5]];
  function branchLines(depths, T) {   // glow pass then core pass, one LINES shape per depth
    noFill(); strokeCap(ROUND);
    for (const pass of [0, 1]) for (const d of depths) {
      const items = []; for (const b of TREE) if (b.d === d) items.push([b.pts, T == null ? 1 : inv(b.t0, b.t0 + b.dur, T)]);
      if (!items.length) continue;
      const w = TREE[TREE.findIndex((b) => b.d === d)].w;
      if (pass === 0) strokeC(TREE_COL[d], 0.24, w * 3.4); else strokeC(TREE_LITE[d], 0.95, w);
      linesBatch(items);
    }
    noStroke();
  }
  TREE_GROUPS.forEach((grp, gi) => defSprite('s13_tree' + gi, TB.w, TB.h, () => { push(); translate(-TB.x0, -TB.y0); branchLines(grp, null); pop(); }));
  // a future at a branch tip: soft coloured glow with a tiny icon (variant = icon index)
  defSprite('s13_tip', 100, 100, (v) => {
    const c = TREE_COL[v % 5];
    for (const [r, a] of [[46, 0.12], [34, 0.18], [22, 0.3]]) flat(ellPts(50, 50, r, r, 24), c, a);
    const ic = SPR[TIP_ICON[v]];
    if (ic) { const k = (TIP_ICON[v] === 'paperclip' ? 40 : 34) / Math.max(ic.w, ic.h); image(ic.fbs[0], 50 - (ic.w * k) / 2, 50 - (ic.h * k) / 2, ic.w * k, ic.h * k); }
  }, { v: 8 });
  defSprite('s13_dot', 32, 32, () => { flat(ellPts(16, 16, 12, 12, 16), '#FFFFFF', 0.35); flat(ellPts(16, 16, 6, 6, 12), '#FFFFFF'); });
  function drawTree(T, fade) {
    if (T < TREE_T0 || fade <= 0) return;
    const breathe = 0.88 + 0.12 * kick(T, 4);
    TREE_GROUPS.forEach((grp, gi) => {
      const done = DEPTH_T[grp[grp.length - 1]][1];
      if (T >= done) spr('s13_tree' + gi, TB.x0 + TB.w / 2, TB.y0 + TB.h / 2, { jit: 0, a: fade * breathe });
      else if (T >= DEPTH_T[grp[0]][0]) branchLines(grp.filter((d) => T >= DEPTH_T[d][0]), T);
    });
    // signals running along the grown lower branches
    for (const b of TREE) { if (b.d > 2 || T < b.t0 + b.dur) continue; const q = pathPoint(b.pts, fract(T * 1.6 + R(b.seed, 2))); spr('s13_dot', q[0], q[1], { s: 1.1 - b.d * 0.2, a: fade, jit: 0 }); }
    const k = kick(T, 5);
    for (const tp of TIPS) {
      const a = T - tp.t; if (a < 0) continue;
      const pk = Ez.outBack(clamp(a / 0.2), 2.4);
      spr('s13_tip', tp.x + Math.sin(T * 2.3 + 5 + tp.seed) * 6, tp.y, { v: tp.seed % 8, s: pk * (0.9 + 0.25 * k), r: Math.sin(T * 3 + tp.seed) * 0.25, a: fade, jit: 0 });
    }
  }
  function frameThreads(T) {
    const g = Ez.inOut(inv(126.98, 127.36, T)), fa = 1 - sstep(127.4, 127.56, T);
    if (g <= 0 || fa <= 0) return;
    const paths = [[[543, 852], [FR.x0, FR.y1], [FR.x0, FR.y0], [960, FR.y0]], [[1377, 852], [FR.x1, FR.y1], [FR.x1, FR.y0], [960, FR.y0]]];
    noFill();
    for (const P of paths) {
      blendMode(ADD); strokeC(PAL.gold, 0.35 * fa, 16); polyPart(P, g); blendMode(BLEND);
      strokeC(PAL.butterLt, fa, 5); polyPart(P, g);
      noStroke();
      const tip = pathPoint(P, g); spr('spark', tip[0], tip[1], { s: 0.35, r: T * 9, a: fa });
      noFill();
    }
    noStroke();
  }
  shot({
    id: 'L40-loom', t0: S4, tin: { type: 'whip', d: 0.4, at: 0.5, ang: 0 },
    draw(s) {
      const T = s.T;
      // start close on the loom, pull out and tilt up as the tree grows (identity by the frame weave)
      const pull = Ez.inOut(inv(126.24, 126.98, T));
      const cy = lerp(860, 540, pull), Zc = lerp(1.32, 1, pull);
      bg('#1D1A3C');
      push();
      cam(960, cy, Zc);
      spr('s13_night', 960, 540, { s: 2.2, jit: 0 });
      twinkles(T, 20, 91, [0, 0, 1920, 820], ['sparkW', 'spark', 'star5'], 0.06, 0.2, 3);
      // warp threads converge above the loom into the trunk, lighting up as the needle climbs
      const lit = sstep(126.3, 126.45, T);
      const warpUp = [];
      for (const x of WARP) { const tx = 960 + (x - 960) * 0.04; warpUp.push([x, 895, lerp(x, tx, 0.5), 862], [lerp(x, tx, 0.5), 862, lerp(x, tx, 0.85), 820], [lerp(x, tx, 0.85), 820, tx, 800]); }
      if (lit > 0) segLines(warpUp, PAL.butter, 8, 0.28 * lit);
      segLines(warpUp, lit > 0.5 ? PAL.butterLt : PAL.cream, 2.2, 0.55 + 0.45 * lit);
      // the tree of futures (dims inside the frame once the scroll covers it)
      drawTree(T, 1);
      frameThreads(T);
      // loom
      spr('s13_loom', 960, 975, { jit: 0.3 });
      const hb = beatAt(T);
      spr('s13_heddle', 960, 935 - 16 * Math.sin(Math.PI * hb.ph) * (hb.i % 2 ? 1 : -1), { jit: 0.3 });
      const [nx0] = needlePos(T);
      const warp = WARP.map((x) => { const ag = T - (126.02 + ((x - 330) / 1070) * 0.22); const vib = ag > 0 ? Math.sin(ag * 70) * Math.exp(-ag * 8) * 5 : 0; return [x, 895, x + vib, 982]; });
      segLines(warp, PAL.cream, 2.4, 0.9);
      // fresh weft thread left by the needle
      const wx = T > 126.24 ? 1336 : clamp(nx0, 586, 1336);
      if (T > 125.95) {
        const wa = T > 126.3 ? 1 - sstep(126.4, 126.8, T) * 0.4 : 1;
        blendMode(ADD); segLine(586, WEFT_Y, wx, WEFT_Y, PAL.butter, 12, 0.35 * wa); blendMode(BLEND);
        segLine(586, WEFT_Y, wx, WEFT_Y, PAL.butter, 4, 0.95);
      }
      // the frame weaves solid, then the prophecy scroll unrolls behind the diving needle
      const fk = sstep(127.28, 127.46, T);
      if (fk > 0) {
        const sk = scrollK(T);
        if (sk > 0) {
          spr('s13_scroll', 960, 305 + 230, { crop: [0, 0, 1, Math.max(0.03, sk)], jit: 0.3 });
          spr('s13_roller', 960, 305 + 460 * sk, { s: 0.95 });
          if (sk >= 1) glow(960, 560, 200, PAL.butter, 0.25 + 0.15 * kick(T, 4));
        }
        spr('s13_roller', 960, 300, { s: 0.95, a: sk > 0 ? 1 : 0 });
        const fs = 1 + 0.06 * (1 - Ez.outBack(inv(127.28, 127.5, T), 2));
        spr('s13_frame', 960, 540, { s: fs, a: fk, jit: 0.3 });
        if (T > tLoom) for (const [bx, by] of [[FR.x0, FR.y0], [FR.x1, FR.y0], [FR.x1, FR.y1], [FR.x0, FR.y1], [960, FR.y0]]) burst(T, tLoom, bx, by, { n: 8, names: ['spark', 'sparkW', 'star5'], spd: 600, g: 100, life: 0.8, s: 0.4, even: true, seed: bx + by });
      }
      // witnesses at the loom: Pip in awe, Clawd pumping the treadle
      const bl = hopB(T);
      pip(430, 1080, 0.55, { face: T > tForetold ? 'pf_love' : 'pf_shock', armL: T > tLoom ? 2.5 : 1.2 + bl * 0.3, armR: T > tLoom ? 2.5 : 0.4, hop: bl * 14, headR: -0.15 });
      clawd(1600, 1080, 0.5, { eyes: T > tLoom ? 'ce_star' : 'ce_sq', look: [-0.5, -0.4], armL: -0.4 - 0.5 * bl, armR: T > tBy ? -2.0 : 0.2, hop: bl * 16, blush: true });
      // the needle (snapped off the gauge) now sews: loom, trunk, canopy, then pulls the scroll down
      if (T < 127.64) {
        const [nx, ny] = needlePos(T), [px2, py2] = needlePos(T - 0.012);
        const r = Math.atan2(ny - py2, nx - px2);
        noFill(); strokeC(PAL.butterLt, 0.9, 3.5); beginShape(); for (let k = 0; k <= 28; k++) { const [qx, qy] = needlePos(T - k * 0.014); vertex(qx, qy); } endShape(); noStroke();
        needle(nx, ny, r, 300, 1, 1);
        glow(nx, ny, 60, PAL.butter, 0.4);
      }
      if (T > 127.6) burst(T, 127.62, 960, 790, { n: 14, names: ['spark', 'sparkW', 'heart'], spd: 700, g: 200, life: 0.8, s: 0.4, seed: 97 });
      pop();
    },
  });
  lyr(40, { y: 178, cols: ['#FFFFFF', '#FFFFFF', PAL.butter, '#FFFFFF', PAL.butter], words: { 2: { anim: 'rise', wave: 3 }, 4: { size: 106, anim: 'zoom', grow: 0.12 } } });
})();

// s07.js - Chorus 2: P(doom) party, basilisk, NVDA, Omega Point (58.28-65.98). Private to this IIFE.
(() => {
  // ================= timing =================
  const wUp = wordT(16, 1), wMy = wordT(16, 2), wPD = wordT(16, 3);
  const wHear = wordT(17, 1), wBas = wordT(17, 3), wBoom = wordT(17, 4);
  const wNVDA = wordT(18, 0), wMoon = wordT(18, 3);
  const wOmega = wordT(19, 1), wPoint = wordT(19, 2), wComing = wordT(19, 3), wSoon = wordT(19, 4);
  const COLS = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lilac, PAL.orange];
  const since = (T, t) => T - t;
  const hit = (T, t, k = 6) => (T >= t ? Math.exp(-(T - t) * k) : 0);

  // Catmull-Rom through control points, n samples per span
  function catmull(P, n) {
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(P[P.length - 1].slice());
    return out;
  }
  // evenly spaced samples along a dense polyline; also returns the sample index where source index `mark` is passed
  function resample(pts, step, mark = -1) {
    const out = [pts[0]]; let acc = 0, mk = -1;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      let d = Math.hypot(x1 - x0, y1 - y0), t0 = 0;
      while (acc + d * (1 - t0) >= step) {
        const need = step - acc; const t = t0 + need / d;
        out.push([lerp(x0, x1, t), lerp(y0, y1, t)]); t0 = t; acc = 0;
      }
      acc += d * (1 - t0);
      if (i === mark) mk = out.length;
    }
    return { pts: out, mark: mk };
  }
  // many thin additive layers: no visible banding on dark grounds
  function softGlow(x, y, r, c, a = 0.5, n = 22) {
    blendMode(ADD);
    for (let i = n; i >= 1; i--) { const t = i / n; disc(x, y, r * t, c, (a * 1.8 / n) * (1 - 0.55 * t)); }
    blendMode(BLEND);
  }
  // first-use warm-up: touch the next shots' sprites and draw paths off-screen (near-zero alpha) early in the
  // previous shot, so the first frame of a later shot doesn't pay texture/shader set-up cost mid-scene.
  function prewarm(names) {
    for (const nm of names) spr(nm, -3000, -3000, { a: 0.002, jit: 0 });
    noFill(); stroke(withAlphaCol('#000000', 0.002)); strokeWeight(40); strokeJoin(ROUND); strokeCap(ROUND);
    beginShape(); vertex(-3000, -3000); vertex(-2900, -2950); vertex(-2800, -3000); endShape(); noStroke();
    beginShape(TRIANGLE_STRIP); fill(withAlphaCol('#000000', 0.002)); vertex(-3000, -3000); vertex(-2990, -3000); vertex(-3000, -2990); vertex(-2990, -2990); endShape();
  }
  function polyline(pts, c, w, a = 1) {
    noFill(); stroke(withAlphaCol(c, a)); strokeWeight(w);
    beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(); noStroke();
  }

  // ================= shared small sprites =================
  defSprite('s07_conf', 56, 40, (v) => {
    const c = COLS[v % COLS.length];
    paint([[8, 10], [46, 5], [49, 30], [10, 35]], c, { baseC: lite(c, 0.2), lw: 1.1 });
  }, { v: 6 });
  defSprite('s07_flag', 90, 110, (v) => {
    const c = COLS[v % COLS.length];
    paint([[8, 8], [82, 8], [45, 100]], c, { baseC: lite(c, 0.25), lw: 1.5 });
  }, { v: 6, ay: 0.08 });
  const BAL = [PAL.pink, PAL.butter, PAL.mint, PAL.sky];
  defSprite('s07_balloon', 170, 300, (v) => {
    const c = BAL[v % 4];
    paint(ellPts(85, 100, 64, 78, 36), c, { baseC: lite(c, 0.28), lw: 1.8 });
    paint([[85, 174], [98, 192], [72, 192]], c, { baseC: lite(c, 0.2), lw: 1.3 });
    flat(ellPts(60, 72, 12, 22, 16, 0, -0.4), '#FFFFFF', 0.75);
  }, { v: 4, ay: 0.33 });

  // flutter-falling confetti in a box
  function confettiRain(T, n, seed, box, spd, s0 = 0.6, a = 1) {
    for (let i = 0; i < n; i++) {
      const ph = fract(R(i, seed) + (T * spd * (0.6 + 0.4 * R(i, seed + 1))) / box[3]);
      const y = box[1] + ph * box[3];
      const x = box[0] + R(i, seed + 2) * box[2] + Math.sin(T * 2.3 + i * 1.7) * 40;
      const fl = Math.cos(T * (5 + R(i, seed + 3) * 6) + i);
      spr('s07_conf', x, y, { v: i % 6, s: s0 * (0.7 + 0.6 * R(i, seed + 4)), sx: 0.2 + 0.8 * Math.abs(fl), r: T * (1 + R(i, seed + 5) * 3) * (i % 2 ? 1 : -1) + i, a: a * sstep(0, 0.05, ph) });
    }
  }
  // confetti cannon blast
  function confBurst(T, t0, x, y, o = {}) {
    const age = T - t0, life = o.life ?? 1.6;
    if (age < 0 || age > life) return;
    const n = o.n ?? 30, drag = o.drag ?? 2.6;
    for (let i = 0; i < n; i++) {
      const sd = (o.seed || 0) + i;
      const ang = (o.ang0 ?? -Math.PI / 2) + (R(sd, 1) - 0.5) * (o.spread ?? 1.2);
      const sp = (o.spd ?? 1400) * (0.35 + 0.65 * R(sd, 2));
      const e = (1 - Math.exp(-age * drag)) / drag;
      const px = x + Math.cos(ang) * sp * e + Math.sin(age * 5 + i) * 18 * age;
      const py = y + Math.sin(ang) * sp * e + 0.5 * (o.g ?? 520) * age * age;
      const fl = Math.cos(age * (6 + R(sd, 3) * 8) + i);
      spr('s07_conf', px, py, { v: i % 6, s: (o.s ?? 0.7) * (0.6 + 0.6 * R(sd, 4)) * Ez.outBack(clamp(age * 8)), sx: 0.2 + 0.8 * Math.abs(fl), r: age * 7 * RS(sd, 5) + i, a: 1 - inv(life * 0.7, life, age) });
    }
  }

  // ================= L16: I'm upping my P(doom) - dance party round the gauge =================
  defSprite('s07_party_bg', 1000, 580, () => {
    wash(-40, -40, 1080, 660, '#5A3A9E', 170, 0.12);
    blob(170, 130, 250, '#A057C8', 120, 0.45);
    blob(840, 120, 240, '#D0609E', 110, 0.45);
    blob(510, 250, 280, '#6A58D0', 90, 0.45);
    blob(80, 430, 200, '#34256E', 120, 0.3);
    blob(930, 430, 200, '#34256E', 120, 0.3);
  });
  defSprite('s07_disco', 240, 240, () => {
    paint(ellPts(120, 120, 96, 96, 40), PAL.grayLt, { baseC: '#E8E4F2', lw: 2.2 });
    for (let y = 26; y < 218; y += 19) for (let x = 26; x < 218; x += 19) {
      if (Math.hypot(x + 9 - 120, y + 9 - 120) > 86) continue;
      const q = random();
      flat(rrPts(x + 1, y + 1, 16, 16, 2), q < 0.22 ? '#FFFFFF' : q < 0.5 ? PAL.lilacLt : q < 0.75 ? PAL.skyLt : '#B6AECB', 0.95);
    }
    pen(PAL.ink, 2.2, '2B'); brush.circle(120, 120, 96); brush.noStroke();
    blob(86, 82, 20, '#FFFFFF', 210, 0.1);
  }, { v: 2 });
  defSprite('s07_riser', 1000, 220, () => {
    paint(rrPts(40, 30, 920, 170, 26), '#3B2C6E', { baseC: '#4A3A86', lw: 2.4 });
    for (const x of [150, 850]) { paint(ellPts(x, 115, 62, 62, 32), '#2A2050', { baseC: '#352A62', lw: 1.8 }); paint(ellPts(x, 115, 26, 26, 20), PAL.lilac, { baseC: PAL.lilacLt, lw: 1.4 }); }
    wc(PAL.pink, 80, 0.1); brush.rect(260, 70, 480, 18); brush.noFill();
    wc(PAL.sky, 70, 0.1); brush.rect(260, 130, 480, 18); brush.noFill();
  });

  const G16 = { x: 960, y: 305, s: 0.8 };
  const HUB16 = [960, 305 + 255 * 0.8];
  const RC = [960, 600]; // L16 > L17 shockwave centre (gauge hub -> boombox)
  const ringR = (p) => 1320 * Math.pow(clamp(p), 1.3);
  const FLOOR_Y = 700;

  function cam16(T) {
    const pd = T - wPD;
    let z = 1.0 + 0.035 * Ez.inOut(inv(57.98, 59.9, T)) + 0.012 * kick(T, 5);
    if (pd > 0) z += 0.075 * Ez.out(clamp(pd / 0.1)) * (1 - 0.7 * sstep(0.12, 0.5, pd));
    const endK = Ez.inOut(inv(59.95, 60.3, T));
    const cy = lerp(540, HUB16[1] - (RC[1] - 540) / z, endK);
    return [960, cy, z];
  }
  function needle16(T) {
    let v = pdoomAt(T);
    const pd = T - wPD;
    v -= 7 * sstep(wMy, wPD - 0.03, T) * (pd < 0 ? 1 : Math.exp(-pd * 40));
    if (pd > 0) v += 54 * Math.exp(-pd * 4) * Math.sin(pd * 14);
    if (pd < 0) v += Math.sin(T * 47) * 1.2 * sstep(wUp, wUp + 0.1, T);
    return clamp(v, 0, 100);
  }
  function danceFloor(T) {
    gradRect(-200, FLOOR_Y, W + 400, H - FLOOR_Y + 200, '#40286E', '#1E1440');
    const bi = beatAt(T).i, k = kick(T, 4);
    const rows = 6, cols = 14, vx = 960, vy = 250;
    const rowY = (t) => FLOOR_Y + (H + 120 - FLOOR_Y) * Math.pow(t, 1.5);
    const colX = (j, y) => vx + (-900 + j * (3720 / cols) - 960 + 960 - vx) * ((y - vy) / (H - vy)) + 0;
    noStroke();
    beginShape(TRIANGLES);
    for (let r = 0; r < rows; r++) {
      const y0 = rowY(r / rows), y1 = rowY((r + 1) / rows);
      for (let j = 0; j < cols; j++) {
        const lit = (r + j + bi) % 3 === 0 || ((r * 5 + j * 3 + bi) % 7 === 0);
        const c = COLS[(r * 2 + j + bi) % 6];
        const col = lit ? withAlphaCol(c, 0.5 + 0.35 * k) : withAlphaCol('#1A1036', 0.45);
        const g = 0.06;
        const a = [lerp(colX(j, y0), colX(j + 1, y0), g), lerp(y0, y1, g)], b = [lerp(colX(j + 1, y0), colX(j, y0), g), lerp(y0, y1, g)];
        const cc = [lerp(colX(j + 1, y1), colX(j, y1), g), lerp(y1, y0, g)], d = [lerp(colX(j, y1), colX(j + 1, y1), g), lerp(y1, y0, g)];
        fill(col); vertex(a[0], a[1]); vertex(b[0], b[1]); vertex(cc[0], cc[1]);
        vertex(a[0], a[1]); vertex(cc[0], cc[1]); vertex(d[0], d[1]);
      }
    }
    endShape();
  }
  function beams(T, a = 1) {
    blendMode(ADD); noStroke();
    const src = [[240, -60], [700, -90], [1220, -90], [1680, -60]];
    const bi = beatAt(T).i, k = kick(T, 4);
    for (let i = 0; i < 4; i++) {
      const ang = Math.PI / 2 + Math.sin(T * 1.9 + i * 1.4) * 0.6;
      const len = 1500, half = 0.12;
      const c = COLS[(i + bi) % 6];
      const [sx, sy] = src[i];
      fill(withAlphaCol(c, (0.09 + 0.09 * k) * a));
      triangle(sx, sy, sx + Math.cos(ang - half) * len, sy + Math.sin(ang - half) * len, sx + Math.cos(ang + half) * len, sy + Math.sin(ang + half) * len);
    }
    blendMode(BLEND);
  }
  function discoSpots(T) {
    blendMode(ADD);
    for (let i = 0; i < 16; i++) {
      const x = fract(R(i, 81) + T * 0.07 * (0.7 + 0.3 * R(i, 82))) * 2100 - 90;
      const y = 60 + R(i, 83) * 600;
      const tw = 0.5 + 0.5 * Math.sin(T * 6 + i * 2.1);
      disc(x, y, 9 + 6 * tw, '#FFFFFF', 0.18 + 0.2 * tw);
    }
    blendMode(BLEND);
  }
  function marquee(T, hx, hy, rad, n, all) {
    const bi = beatAt(T).i;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / (n - 1)) * Math.PI;
      const x = hx + Math.cos(a) * rad, y = hy + Math.sin(a) * rad;
      const on = all > 0.5 || (i + bi) % 3 === 0;
      const c = all > 0.5 ? PAL.red : COLS[i % 6];
      if (on) { blendMode(ADD); disc(x, y, 26, c, 0.35); blendMode(BLEND); }
      disc(x, y, 10, on ? '#FFFFFF' : dark(c, 0.35)); disc(x, y, 6.5, on ? lite(c, 0.55) : c, 0.9);
    }
  }
  function bunting(T, y0, sag, n, x0, x1, seed) {
    const yAt = (t) => y0 + Math.sin(t * Math.PI) * sag + Math.sin(T * 2 + t * 5 + seed) * 5;
    const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([lerp(x0, x1, t), yAt(t)]); }
    polyline(pts, PAL.ink, 3, 0.8);
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; spr('s07_flag', lerp(x0, x1, t), yAt(t), { v: (i + seed) % 6, s: 0.72, r: Math.sin(T * 3 + i) * 0.12 + kick(T, 8) * 0.1 * (i % 2 ? 1 : -1), seed: i }); }
  }

  // synced dance moves (pip rig units: arms 0 down .. 2.7 up)
  const POSE_R = { aL: 0.35, aR: 2.75, r: 0.07, lg: [0, -0.28] };
  const POSE_L = { aL: 2.75, aR: 0.35, r: -0.07, lg: [0.28, 0] };
  function dance(T, mir = 1) {
    const b = beatAt(T);
    const side = (b.i % 2 ? 1 : -1) * mir;
    const k = Ez.outBack(clamp(b.ph / 0.28), 2);
    const A = side > 0 ? POSE_L : POSE_R, B = side > 0 ? POSE_R : POSE_L;
    const o = { aL: lerp(A.aL, B.aL, k), aR: lerp(A.aR, B.aR, k), r: lerp(A.r, B.r, k), lg: [lerp(A.lg[0], B.lg[0], k), lerp(A.lg[1], B.lg[1], k)], hop: hopB(T) * 26, sq: 1 + 0.07 * kick(T, 10), lean: 0 };
    o.lean = o.r * 1.6;
    // "upping": raise the roof
    const roof = sstep(wUp - 0.1, wUp + 0.02, T) * (1 - sstep(wMy - 0.06, wMy + 0.04, T));
    if (roof > 0) {
      const pump = Math.abs(Math.sin(((T - wUp) * Math.PI) / (BEAT_LEN / 2)));
      o.aL = lerp(o.aL, 2.35 + 0.45 * pump, roof); o.aR = lerp(o.aR, 2.35 + 0.45 * pump, roof);
      o.r = lerp(o.r, 0, roof); o.lean = lerp(o.lean, 0, roof); o.hop = lerp(o.hop, 20 + pump * 20, roof);
    }
    // "my": crouch wind-up
    const cr = sstep(wMy - 0.04, wMy + 0.14, T) * (T < wPD ? 1 : 0);
    if (cr > 0) { o.aL = lerp(o.aL, 0.9, cr); o.aR = lerp(o.aR, 0.9, cr); o.hop = lerp(o.hop, 0, cr); o.sq = lerp(o.sq, 1.16, cr); o.r = lerp(o.r, 0, cr); o.lean = lerp(o.lean, 0.1, cr); o.lg = [lerp(o.lg[0], 0.15, cr), lerp(o.lg[1], -0.15, cr)]; }
    // "P(doom)": jump into a star
    const pd = T - wPD;
    if (pd >= 0) {
      const air = clamp(pd / 0.4);
      const inAir = pd < 0.4 ? 1 : 0;
      const star = inAir ? 1 : 1 - sstep(0.4, 0.62, pd);
      o.hop = inAir ? Math.sin(Math.PI * air) * 150 : hopB(T) * 18 * sstep(0.55, 0.8, pd);
      o.sq = inAir ? lerp(0.86, 1, air) : 1 + 0.18 * Math.exp(-(pd - 0.4) * 9);
      o.aL = lerp(o.aL, 2.2, star); o.aR = lerp(o.aR, 2.2, star); o.r = lerp(o.r, 0, star); o.lean = lerp(o.lean, -0.12, star);
      o.lg = [lerp(o.lg[0], 0.42, star * inAir), lerp(o.lg[1], -0.42, star * inAir)];
    }
    return o;
  }
  const clArm = (pa) => -(pa - 1.2) * 0.75;
  function dancerPip(x, y, s, d, T, o = {}) {
    pip(x, y, s, { face: o.face, armL: d.aL, armR: d.aR, hop: d.hop, r: d.r, lean: d.lean, legs: d.lg, sq: d.sq, hat: o.hat, body: o.body, arm: o.arm, head: o.head, seed: o.seed || 0, flip: o.flip });
  }
  function dancerClawd(x, y, s, d, T, o = {}) {
    const side = d.aR > d.aL ? 1 : -1;
    clawd(x, y, s, { eyes: o.eyes || 'ce_sq', look: o.look, armL: clArm(d.aL), armR: clArm(d.aR), hop: d.hop * 0.45, sq: d.sq, r: d.r * 0.8, blush: true, acc: o.acc || [],
      legs: [[side < 0 ? -10 : 0, 0], [0, 0], [0, 0], [side > 0 ? -10 : 0, 0]], seed: 5, mouth: o.mouth });
  }
  const FRIENDS = [
    { x: 335, s: 0.76, body: 'npc_body_butter', arm: 'npc_arm_butter', head: 'npc_head3', hat: 'party', seed: 11, face: 'pf_happy' },
    { x: 1290, s: 0.82, body: 'npc_body_mint', arm: 'npc_arm_mint', head: 'npc_head2', seed: 21, face: 'pf_cool', flip: true },
    { x: 1605, s: 0.76, body: 'npc_body_sky', arm: 'npc_arm_sky', head: 'npc_head2', hat: 'bow', seed: 31, face: 'pf_love' },
  ];

  shot({
    id: 'L16-party', t0: 58.28, tin: { type: 'zoom', d: 0.6, at: 0.5, c: [960, 600] },
    draw(s) {
      const T = s.T, pd = T - wPD;
      bg('#34206E');
      const [cx, cy, z] = cam16(T);
      push();
      cam(cx, cy, z);
      shake(hit(T, wPD, 7) * 14 + (T > 60.15 ? 4 * sstep(60.15, 60.3, T) : 0), 16);
      washBG('s07_party_bg', 0.5);
      softGlow(960, 330, 700, '#C04FA0', 0.22, 10);
      discoSpots(T);
      beams(T, 1 + hit(T, wPD, 4));
      bunting(T, 38, 60, 11, -40, 700, 0);
      bunting(T, 38, 60, 11, 1220, 1960, 3);
      // balloons bob on the beat
      for (let i = 0; i < 4; i++) {
        const bx = [110, 250, 1690, 1830][i], by = [420, 300, 290, 430][i];
        const byy = by - hopB(T + i * 0.1) * 14, sw = Math.sin(T * 2 + i) * 0.08;
        polyline([[bx - Math.sin(sw) * 80, byy + 80], [bx + 6 + Math.sin(T * 3 + i) * 8, byy + 150], [bx - 4, byy + 220]], PAL.ink, 2.2, 0.8);
        spr('s07_balloon', bx, byy, { v: i, s: 0.85, r: sw, seed: i });
      }
      // disco ball
      segLine(960, -20, 960, 12, PAL.ink, 3);
      spr('s07_disco', 960, 44, { s: 0.42, r: Math.sin(T * 1.5) * 0.08 });
      // floor, riser, gauge
      danceFloor(T);
      spr('s07_riser', 960, 650, { s: 1.0, sx: 0.95, jit: 0.3 });
      const needle = needle16(T);
      marquee(T, HUB16[0], HUB16[1], 448, 19, hit(T, wPD, 3) > 0.25 ? 1 : 0);
      drawGauge(G16.x, G16.y, G16.s, needle, { wobble: pd > 0 && pd < 0.6 ? 0 : 0.004 });
      if (pd > -0.02 && pd < 0.5) { // needle whip glow, smear & burst on "P(doom)"
        const ang = Math.PI + clamp(needle / 100) * Math.PI;
        const ang0 = Math.PI + clamp(needle16(T - 0.06) / 100) * Math.PI;
        if (Math.abs(ang - ang0) > 0.02) { blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.coral, 0.35 * hit(T, wPD, 3))); triangle(HUB16[0], HUB16[1], HUB16[0] + Math.cos(ang0) * 300, HUB16[1] + Math.sin(ang0) * 300, HUB16[0] + Math.cos(ang) * 300, HUB16[1] + Math.sin(ang) * 300); blendMode(BLEND); }
        glow(HUB16[0] + Math.cos(ang) * 300, HUB16[1] + Math.sin(ang) * 300, 90, PAL.red, 0.55 * hit(T, wPD, 5));
        burst(T, wPD, HUB16[0] + Math.cos(ang) * 320, HUB16[1] + Math.sin(ang) * 320, { n: 12, names: ['spark', 'star5'], spd: 900, g: 300, life: 0.7, s: 0.4, seed: 160 });
      }
      // dancers: friends, Clawd, Pip
      for (const f of FRIENDS) {
        const d = dance(T + (f.seed % 3) * 0.004, f.flip ? -1 : 1);
        dancerPip(f.x, 872, f.s, d, T, { face: pd > 0.05 && pd < 0.7 ? 'pf_happy' : f.face, body: f.body, arm: f.arm, head: f.head, hat: f.hat, seed: f.seed, flip: f.flip });
      }
      const dc = dance(T, 1);
      dancerClawd(960, 884, 0.76, dc, T, { eyes: pd > 0 && pd < 0.42 ? 'ce_star' : pd >= 0.42 && pd < 0.9 ? 'ce_happy' : 'ce_sq', look: [(dc.aR - dc.aL) / 2.4 * 0.4, T > wMy && pd < 0 ? 0.25 : -0.12], mouth: pd > 0 && pd < 0.5 ? 'o' : null });
      // Pip bursts in from camera side and joins the line on the beat
      const ent = inv(58.16, 58.47, T);
      const dp = dance(T, -1);
      if (ent < 1) {
        const e = Ez.inOut(ent);
        pip(lerp(1000, 640, e), lerp(1640, 880, e) - Math.sin(Math.PI * ent) * 200, lerp(2.6, 0.85, e), { face: 'pf_happy', armL: 2.6, armR: 2.6, r: (1 - e) * -0.6, legs: [0.4, -0.4], hat: 'party', seed: 3 });
      } else {
        const land = hit(T, 58.47, 9);
        dancerPip(640, 880, 0.85, { ...dp, sq: dp.sq + land * 0.2 }, T, { face: pd > 0 && pd < 0.9 ? 'pf_shock' : 'pf_happy', hat: 'party', seed: 3 });
      }
      // confetti: rain, the party-opening pop, the P(doom) cannons
      confettiRain(T, 24, 7, [-60, -120, 2040, 1250], 260, 0.65);
      spr('paperclip', 360 + Math.sin(T * 2.1) * 30, -60 + fract(0.35 + T * 0.18) * 1200, { s: 0.28, r: T * 2.4, sx: Math.abs(Math.cos(T * 5)) * 0.8 + 0.2 });
      confBurst(T, 58.28, -40, 760, { n: 26, ang0: -0.9, spread: 0.7, spd: 1900, seed: 3 });
      confBurst(T, 58.28, 1960, 760, { n: 26, ang0: -Math.PI + 0.9, spread: 0.7, spd: 1900, seed: 40 });
      confBurst(T, wPD, -40, 700, { n: 24, ang0: -0.75, spread: 0.8, spd: 2200, seed: 90, life: 1.3, s: 0.85 });
      confBurst(T, wPD, 1960, 700, { n: 24, ang0: -Math.PI + 0.75, spread: 0.8, spd: 2200, seed: 130, life: 1.3, s: 0.85 });
      if (T < 58.6) prewarm(['s07_pop_bg', 's07_boombox', 's07_woofer', 's07_reel', 's07_seg', 's07_seg_hi', 's07_spot', 's07_bas_head', 's07_bas_open', 's07_bas_shades', 's07_bas_crown', 's07_tongue', 'note', 'ring']);
      pop();
      // bass shockwave front leading into L17 (matches the mask edge)
      const tr = inv(60.26, 60.66, T);
      if (tr > 0 && tr < 1) { const r = ringR(tr); ringLine(RC[0], RC[1], r, '#FFFFFF', 30, 0.9); ringLine(RC[0], RC[1], r - 22, PAL.pink, 10, 0.8); }
      if (T > 60.1 && T < 60.3) glow(RC[0], RC[1], 160 * sstep(60.1, 60.26, T), PAL.pink, 0.5);
    },
  });
  lyr(16, { y: 958, words: { 1: { anim: 'rise', fill: PAL.butter }, 3: { font: 'pixel', fill: PAL.red, size: 104, anim: 'zoom', jitter: 4 } } });

  // ================= L17: I hear the basilisk boom =================
  defSprite('s07_pop_bg', 1000, 580, () => {
    wash(-40, -40, 1080, 660, '#FFD27A', 190, 0.12);
    blob(500, 300, 330, '#FFB35C', 110, 0.4);
    blob(120, 90, 220, PAL.pinkLt, 120, 0.4);
    blob(900, 110, 200, PAL.pinkLt, 110, 0.4);
    blob(160, 520, 200, '#FF9A6A', 90, 0.4);
    blob(860, 520, 220, '#FF9A6A', 90, 0.4);
  });
  // boombox: sprite centre (490,280); body x 40..940, y 160..520 (bottom at local +240)
  defSprite('s07_boombox', 980, 560, () => {
    const handle = [[235, 165], [245, 70], [285, 36], [695, 36], [735, 70], [745, 165], [700, 165], [692, 96], [670, 80], [310, 80], [288, 96], [280, 165]];
    paint(handle, '#8E86A8', { baseC: '#B7B0CC', lw: 2.2 });
    paint(rrPts(40, 150, 900, 370, 70), PAL.lilac, { baseC: '#C8B6FF', a: 170, lw: 2.8 });
    wc('#8A6FE0', 90, 0.06); brush.rect(60, 460, 860, 44); brush.noFill();
    wc('#FFFFFF', 60, 0.1); brush.rect(90, 172, 300, 24); brush.noFill();
    for (const x of [230, 750]) paint(ellPts(x, 350, 152, 152, 48), '#3C3458', { baseC: '#4A4168', lw: 2.2 });
    paint(rrPts(398, 176, 184, 318, 20), '#5A4B7A', { baseC: '#6C5C92', lw: 2 });
    paint(rrPts(410, 196, 160, 78, 10), '#182436', { baseC: '#1C2A40', lw: 1.8 });
    paint(rrPts(412, 292, 156, 112, 14), '#2C3A5E', { baseC: '#34466E', lw: 1.8 });
    for (let i = 0; i < 4; i++) paint(rrPts(414 + i * 40, 422, 32, 44, 6), [PAL.coral, PAL.butter, PAL.mint, PAL.sky][i], { baseC: lite([PAL.coralLt, PAL.butter, PAL.mint, PAL.sky][i], 0.3), lw: 1.3 });
    for (const x of [100, 880]) paint(ellPts(x, 186, 16, 16, 16), PAL.gold, { baseC: '#FFD75A', lw: 1.4 });
    paint(rrPts(130, 120, 90, 34, 10), '#C0C6D8', { baseC: '#DDE2EE', lw: 1.4 });
  }, { v: 1 });
  defSprite('s07_woofer', 320, 320, () => {
    paint(ellPts(160, 160, 132, 132, 48), '#2A2340', { baseC: '#3A3254', lw: 2 });
    paint(ellPts(160, 160, 104, 104, 40), '#5B5184', { baseC: '#6E649A', lw: 1.6 });
    pen('#8E86B4', 1.6, 'pen'); brush.circle(160, 160, 80); brush.circle(160, 160, 60); brush.noStroke();
    paint(ellPts(160, 160, 40, 40, 28), PAL.pink, { baseC: PAL.pinkLt, lw: 1.6 });
    flat(ellPts(146, 146, 12, 9, 12), '#FFFFFF', 0.7);
  }, { v: 1 });
  defSprite('s07_reel', 90, 90, () => {
    paint(ellPts(45, 45, 32, 32, 24), PAL.butter, { baseC: PAL.butterLt, lw: 1.4 });
    for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU; flat(ellPts(45 + Math.cos(a) * 16, 45 + Math.sin(a) * 16, 7, 7, 10), '#2C3A5E'); }
  });
  // serpent parts
  defSprite('s07_seg', 140, 140, () => { paint(ellPts(70, 70, 56, 56, 32), PAL.teal, { baseC: '#46C2B1', a: 110, line: false, tex: 0.3, border: 0.2 }); }, { v: 2 });
  defSprite('s07_seg_hi', 100, 100, () => { blob(50, 50, 30, PAL.mintLt, 150, 0.25); }, { v: 1 });
  defSprite('s07_spot', 60, 60, () => { paint(ellPts(30, 30, 16, 13, 16), '#177A70', { baseC: '#1F8E82', lw: 1 }); });
  function basHeadPainter(open) {
    return () => {
      const hd = [];
      for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU; const rx = 146, ry = 108 * (Math.sin(a) > 0 ? 1.0 : 0.92); hd.push([180 + Math.cos(a) * rx * (1 + 0.05 * Math.sin(a) * Math.sin(a)), 150 + Math.sin(a) * ry]); }
      paint(hd, PAL.teal, { baseC: '#4CC7B6', a: 150, lw: 2.6 });
      paint(ellPts(180, 200, 112, 52, 32), PAL.mintLt, { baseC: '#DDF8EC', lw: 1.4 });
      for (const [x, y, r] of [[120, 72, 14], [180, 58, 16], [240, 72, 14], [150, 92, 9], [210, 92, 9]]) paint(ellPts(x, y, r, r * 0.8, 14), '#177A70', { baseC: '#1F8E82', lw: 1 });
      blob(66, 186, 20, PAL.pink, 150, 0.3); blob(294, 186, 20, PAL.pink, 150, 0.3);
      flat(ellPts(164, 172, 6, 4, 10), PAL.ink); flat(ellPts(196, 172, 6, 4, 10), PAL.ink);
      if (open) { // the closed smile is drawn live in basHead() so it can widen on the beat
        paint([[112, 200], [248, 200], [236, 240], [206, 268], [180, 274], [154, 268], [124, 240]], '#4A1A3E', { baseC: '#5A2350', lw: 2.2 });
        paint(ellPts(180, 248, 40, 18, 20), PAL.pink, { baseC: PAL.pinkLt, lw: 1.2 });
        paint([[130, 202], [146, 202], [138, 222]], '#FFFFFF', { baseC: '#FFFFFF', lw: 1.2 }); paint([[214, 202], [230, 202], [222, 222]], '#FFFFFF', { baseC: '#FFFFFF', lw: 1.2 });
      }
    };
  }
  defSprite('s07_bas_head', 360, 300, basHeadPainter(false), { v: 2, ay: 250 / 300 });
  defSprite('s07_bas_open', 360, 300, basHeadPainter(true), { v: 1, ay: 250 / 300 });
  defSprite('s07_bas_shades', 330, 120, () => {
    for (const x of [22, 180]) {
      paint(rrPts(x, 22, 128, 72, 32), PAL.black, { baseC: '#1C1628', lw: 1.8 });
      flat([[x + 22, 30], [x + 52, 30], [x + 30, 84], [x + 14, 84]], PAL.lilac, 0.55);
      flat([[x + 62, 30], [x + 74, 30], [x + 52, 84], [x + 42, 84]], PAL.pink, 0.4);
    }
    pen(PAL.black, 6, 'marker'); brush.line(150, 44, 180, 44); brush.noStroke();
  });
  defSprite('s07_bas_crown', 140, 120, () => {
    paint([[14, 106], [126, 106], [126, 44], [100, 70], [70, 14], [40, 70], [14, 44]], PAL.gold, { baseC: '#FFD75A', lw: 1.8 });
    for (const [x, c] of [[40, PAL.red], [70, PAL.sky], [100, PAL.mint]]) flat(ellPts(x, 90, 8, 8, 12), c);
    blob(70, 14, 7, '#FFFFFF', 220, 0.1);
  }, { v: 2, ay: 0.9 });
  defSprite('s07_tongue', 80, 150, () => {
    paint([[34, 4], [46, 4], [47, 96], [66, 138], [48, 126], [40, 108], [32, 126], [14, 138], [33, 96]], PAL.pink, { baseC: '#FF9FC2', lw: 1.4, lc: '#8A2050' });
  }, { ay: 0.03 });

  const BB = [960, 628], BBS = 0.8, BB_BOT = BB[1] + 240 * BBS;
  function bbState(T) {
    const k = kick(T, 7);
    const wind = T < wBoom ? sstep(wBoom - 0.24, wBoom - 0.02, T) : 0;
    const ba = T - wBoom;
    const boom = ba > 0 ? Math.exp(-ba * 5) * Math.cos(ba * 20) : 0;
    const sy = 1 + 0.04 * k - 0.09 * wind + 0.14 * boom;
    const sx = 1 - 0.02 * k + 0.05 * wind - 0.07 * boom;
    return { x: BB[0] + RS(G.boil, 41) * 7 * wind, sx: BBS * sx, sy: BBS * sy, k, wind, boom };
  }
  const bbW = (bs, lx, ly) => [bs.x + lx * bs.sx, BB_BOT + (ly - 240) * bs.sy];
  function cam17(T) {
    const tr = Ez.in(inv(61.98, 62.54, T));
    let z = 1.02 + 0.03 * inv(60.3, 61.8, T) + 0.012 * kick(T, 5) - 0.05 * hit(T, wBoom, 6);
    const bs = bbState(T); const lcd = bbW(bs, 0, -45);
    z = lerp(z, 2.6, tr);
    const cy0 = BB[1] - (RC[1] - 540) / z;
    return [lerp(960, lcd[0], tr), lerp(cy0, lcd[1], Ez.inOut(inv(61.95, 62.4, T))), z];
  }
  function lcdRect17(T) {
    const bs = bbState(T); const [cx, cy, z] = cam17(T);
    const [wx, wy] = bbW(bs, 0, -45);
    return [960 + (wx - cx) * z, 540 + (wy - cy) * z, 80 * bs.sx * z, 39 * bs.sy * z];
  }
  function lcdChart(T, x, y, hw, hh, a = 1) {
    // mini rising green line (same language as the L18 chart)
    noStroke(); fill(withAlphaCol('#0E1A2A', a)); rect(x - hw, y - hh, hw * 2, hh * 2, 6);
    const pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([x - hw * 0.85 + t * hw * 1.7, y + hh * 0.6 - t * hh * 1.1 + Math.sin(T * 9 + i * 1.9) * hh * 0.18 * (i % 2 ? 1 : -1)]); }
    blendMode(ADD); polyline(pts, PAL.green, 7, 0.5 * a); blendMode(BLEND);
    polyline(pts, '#7CFFB2', 3, a);
  }
  function snakeCtrl(T) {
    const bob = hopB(T) * 16, sway = Math.sin(T * 2.6) * 20;
    const rear = Ez.outBack(clamp((T - wBas) / 0.22), 2.2) * (1 - sstep(wBoom - 0.26, wBoom - 0.06, T));
    const wind = T < wBoom ? sstep(wBoom - 0.26, wBoom - 0.04, T) : 0;
    const ba = T - wBoom;
    const thrust = ba > 0 ? Math.exp(-ba * 4) * (1 - 0.5 * Math.cos(ba * 16)) : 0;
    const lift = bob + rear * 70 - wind * 55 + thrust * 70;
    const tilt = Math.sin(T * 3.1) * 0.06 + 0.24 * sstep(wHear - 0.05, wHear + 0.1, T) * (1 - sstep(wBas - 0.1, wBas + 0.05, T)) - wind * 0.1;
    const tw = Math.sin(T * 15) * 10 + kick(T, 9) * 14;
    const pts = [
      [-372 + tw, -208 - kick(T, 9) * 18], [-452, -178], [-500, -70], [-508, 70], [-482, 212],
      [-400, 300], [0, 332], [400, 300], [505, 168], [522, -22], [462, -160], [340, -225 - lift * 0.15],
      [200 + sway * 0.4, -262 - lift * 0.5], [60 + sway, -318 - lift],
    ];
    return { pts, split: 4, lift, tilt, wind, thrust, sway };
  }
  // thick round-jointed native polyline (one draw call for a whole body run)
  function tube(P, from, to, w, c) {
    if (to - from < 2) return;
    noFill(); stroke(c); strokeWeight(w); strokeJoin(ROUND); strokeCap(ROUND);
    beginShape(); for (let i = from; i < to; i++) vertex(P[i][0], P[i][1]); endShape();
    noStroke();
  }
  // P: world points, rW: world radius; tail taper (i < iT) uses discs, the full-thickness body uses two tubes.
  // Painted segment sprites on every other sample give the watercolour skin.
  function drawSnakeRun(P, from, to, rW, outlineFrom, iT) {
    const a = Math.max(from, outlineFrom), rb = rW(Math.min(to - 1, Math.max(iT, from)));
    for (let i = a; i < Math.min(to, iT); i++) disc(P[i][0], P[i][1], rW(i) + 5, PAL.ink);
    tube(P, Math.max(a, iT - 1), to, 2 * (rb + 5), PAL.ink);
    for (let i = from; i < Math.min(to, iT); i++) disc(P[i][0], P[i][1], rW(i), '#3DB8A8');
    tube(P, Math.max(from, iT - 1), to, 2 * rb, '#3DB8A8');
    for (let i = from; i < to; i += 2) spr('s07_seg', P[i][0], P[i][1], { s: rW(i) / 56, seed: i, jit: 0.25 });
    for (let i = from; i < to; i += 4) { const r = rW(i); spr('s07_seg_hi', P[i][0] - r * 0.28, P[i][1] - r * 0.34, { s: r / 70, a: 0.7, seed: i, jit: 0 }); }
    for (let i = from + 3; i < to - 2; i += 5) { const r = rW(i); spr('s07_spot', P[i][0] + r * 0.2 * (i % 2 ? 1 : -1), P[i][1] + r * 0.15, { s: r / 44, seed: i }); }
  }
  function basilisk(T, layer, bs) {
    const C = snakeCtrl(T);
    const dense = catmull(C.pts, 10);
    const rs = resample(dense, 27, C.split * 10);
    const S = rs.pts, N = S.length, split = rs.mark;
    const sc = (bs.sx + bs.sy) / 2, iT = Math.ceil(0.2 * (N - 1));
    const rW = (i) => { const u = i / (N - 1); return (u < 0.2 ? lerp(7, 46, Ez.out(u / 0.2)) : 46) * sc; };
    const P = S.map(([x, y]) => bbW(bs, x, y));
    if (layer === 'back') drawSnakeRun(P, 0, split + 1, rW, 0, iT);
    else drawSnakeRun(P, split, N, rW, split + 3, iT);
    return { head: P[N - 1], C };
  }
  function basHead(T, hx, hy, C) {
    const hs = 0.76;
    const open = T >= wBoom - 0.02 && T < wBoom + 0.42;
    const ba = T - wBoom;
    const hsq = 1 + 0.12 * C.wind - (ba > 0 ? 0.14 * Math.exp(-ba * 6) : 0);
    push(); translate(hx, hy); rotate(C.tilt); scale(hs / hsq, hs * hsq);
    // tongue flicks on beats
    const fl = Math.max(kick(T, 7) > 0.55 ? Math.sin(Math.PI * clamp((1 - kick(T, 7)) / 0.45)) : 0, open ? 1 : 0);
    if (fl > 0.02) spr('s07_tongue', 0, open ? -10 : -26, { sy: fl * (open ? 1.2 : 0.9), r: Math.sin(T * 30) * 0.12 });
    spr(open ? 's07_bas_open' : 's07_bas_head', 0, 0, { seed: 3 });
    if (!open) { noFill(); stroke(PAL.ink); strokeWeight(5); arc(0, -54, 128, 46 + 18 * kick(T, 7), 0.28, Math.PI - 0.28); noStroke(); }
    // shades (glint sweeps across on "basilisk")
    spr('s07_bas_shades', 0, -128, { s: 0.86 });
    const gl = since(T, wBas);
    if (gl > 0 && gl < 0.35) { blendMode(ADD); for (const ex of [-66, 66]) { const gx = ex - 50 + gl / 0.35 * 100; segLine(gx - 16, -150, gx + 6, -100, '#FFFFFF', 12, 0.8 * (1 - gl / 0.35)); } blendMode(BLEND); }
    spr('s07_bas_crown', 58, -222, { s: 0.7, r: 0.28 + Math.sin(T * 5) * 0.05 });
    pop();
    if (T > wBas - 0.05) burst(T, wBas, hx + 55, hy - 190, { n: 10, names: ['spark', 'sparkW'], spd: 600, g: 0, life: 0.6, s: 0.32, even: true, seed: 211 });
    if (gl > 0 && gl < 0.4) spr('sparkW', hx + 90, hy - 125, { s: 0.6 * Math.sin(Math.PI * gl / 0.4), r: gl * 4 });
  }
  function beatRings(T, bs) {
    const b = beatAt(T);
    for (let k = 0; k < 3; k++) {
      const bt = BEATS[b.i - k]; if (bt == null || bt < 60.5) continue;
      const age = T - bt; if (age < 0 || age > 0.8) continue;
      const a = 1 - age / 0.8;
      for (const sx of [-260, 260]) {
        const [x, y] = bbW(bs, sx, 70);
        const r = 110 + age * 1300;
        ringLine(x, y, r, '#FFFFFF', 4 + 12 * a, 0.75 * a);
        ringLine(x, y, r - 14, PAL.pink, 3 + 5 * a, 0.5 * a);
      }
    }
  }
  function sunburst(T, x, y, a) {
    noStroke(); beginShape(TRIANGLES);
    const n = 20, rot = T * 0.12;
    for (let i = 0; i < n; i += 2) {
      const a0 = rot + (i / n) * TAU, a1 = rot + ((i + 1) / n) * TAU;
      fill(withAlphaCol('#FFE4A6', a)); vertex(x, y); vertex(x + Math.cos(a0) * 2400, y + Math.sin(a0) * 2400); vertex(x + Math.cos(a1) * 2400, y + Math.sin(a1) * 2400);
    }
    endShape();
  }
  function blownHat(T, x, y, dir, seed) {
    const a = T - wBoom; if (a < 0 || a > 1.2) return;
    spr('acc_party', x + dir * a * 900, y - 420 * a + 700 * a * a, { s: 0.6, r: dir * a * 9, seed });
  }
  function hairStream(x, y, dir, T, c, amt) {
    if (amt <= 0.01) return;
    for (let i = 0; i < 4; i++) {
      const pts = []; for (let k = 0; k < 6; k++) pts.push([x + dir * k * 26 * amt, y + (i - 1.5) * 16 + Math.sin(T * 30 + k + i) * 7 * amt]);
      polyline(pts, c, 7 - i, 0.9 * amt);
    }
  }

  shot({
    id: 'L17-basilisk', t0: 60.46,
    tin: { type: 'mask', d: 0.4, at: 0.5, mask: (p) => { beginShape(); const r = ringR(p); for (let i = 0; i < 64; i++) { const a = (i / 64) * TAU; const rr = r + vnoise(i * 0.6, 5) * 26; vertex(RC[0] + Math.cos(a) * rr, RC[1] + Math.sin(a) * rr); } endShape(CLOSE); } },
    draw(s) {
      const T = s.T, ba = T - wBoom;
      bg('#FFC870');
      const bs = bbState(T);
      const [cx, cy, z] = cam17(T);
      push();
      cam(cx, cy, z);
      shake(hit(T, wBoom, 5) * 22 + bs.wind * 5, 17);
      washBG('s07_pop_bg');
      const bbC = bbW(bs, 0, 0);
      sunburst(T, bbC[0], bbC[1], 0.42 + 0.3 * hit(T, wBoom, 4) + 0.08 * kick(T, 5));
      // background pulse rings riding outward
      const bgA = 1 - sstep(61.98, 62.2, T);
      if (bgA > 0) for (let k = 0; k < 5; k++) { const r = ((k + fract((T - 60.26) / BEAT_LEN)) * 250); ringLine(bbC[0], bbC[1], r + 80, '#FFFFFF', 12, 0.2 * (1 - k / 5) * bgA); }
      // floor
      noStroke(); fill('#F29A64'); rect(-300, BB_BOT - 10, W + 600, 700);
      fill(withAlphaCol('#E07A56', 0.7)); rect(-300, BB_BOT + 70, W + 600, 700);
      push(); translate(BB[0], BB_BOT + 20); scale(1, 0.16); disc(0, 0, 560, '#B8563E', 0.35); pop();
      // serpent behind, boombox, serpent in front
      basilisk(T, 'back', bs);
      push(); translate(bs.x, BB_BOT); scale(bs.sx, bs.sy); translate(0, -240);
      spr('s07_boombox', 0, 0, { seed: 1 });
      for (const sx of [-260, 260]) spr('s07_woofer', sx, 70, { s: 0.94 * (1 + 0.09 * bs.k + 0.2 * Math.max(0, bs.boom)), seed: sx > 0 ? 1 : 0 });
      for (const rx of [-40, 40]) spr('s07_reel', rx, 68, { s: 0.82, r: T * 9, jit: 0 });
      lcdChart(T, 0, -45, 72, 32);
      pop();
      const sn = basilisk(T, 'front', bs);
      basHead(T, sn.head[0], sn.head[1] - 6, sn.C);
      beatRings(T, bs);
      // notes floating out of the speakers
      if (T < 62.2) floaters(T, 8, 51, ['note'], [560, 180, 800, 420], 160, 0.42 * (1 - sstep(61.98, 62.2, T)), 50, -1);
      for (const sx of [-260, 260]) { const [nx, ny] = bbW(bs, sx, 70); burst(T, wHear, nx, ny, { n: 7, names: ['note', 'spark'], spd: 900, g: -200, life: 1.0, s: 0.5, spread: 1.6, ang0: -Math.PI / 2 + sx / 900, seed: sx > 0 ? 400 : 420 }); }
      // dancers at the sides, blown back on "boom"
      const blow = ba > 0 ? Math.exp(-ba * 2.4) * Ez.out(clamp(ba / 0.08)) : 0;
      const dP = dance(T, 1), dC = dance(T, -1), dF = dance(T, 1);
      // while the incoming shockwave ring is still small the side dancers are hidden outside it: skip them
      const revealR = T < 60.66 ? ringR(inv(60.26, 60.66, T)) + 60 : 1e9;
      const seen = (x, y, r) => Math.hypot(x - RC[0], y - RC[1]) - r < revealR;
      if (seen(330, 760, 220)) pip(330 - blow * 70, 905, 0.84, { face: blow > 0.15 ? 'pf_shock' : T < wHear + 0.4 ? 'pf_happy' : 'pf_cool', armL: lerp(dP.aL, 1.6, blow), armR: lerp(dP.aR, 1.1, blow), hop: dP.hop * (1 - blow), r: lerp(dP.r, -0.34, blow), lean: lerp(dP.lean, -0.35, blow), legs: dP.lg, sq: dP.sq, hat: ba > 0 ? null : 'party', seed: 3 });
      hairStream(330 - blow * 70 - 90, 905 - 330 * 0.84, -1, T, PAL.navy, blow);
      if (seen(1850, 770, 200)) pip(1850 + blow * 60, 900, 0.7, { face: blow > 0.15 ? 'pf_shock' : 'pf_happy', armL: lerp(dF.aL, 1.1, blow), armR: lerp(dF.aR, 1.6, blow), hop: dF.hop * (1 - blow), r: lerp(dF.r, 0.34, blow), lean: lerp(dF.lean, 0.35, blow), legs: dF.lg, sq: dF.sq, body: 'npc_body_butter', arm: 'npc_arm_butter', head: 'npc_head3', hat: ba > 0 ? null : 'party', seed: 11 });
      hairStream(1850 + blow * 60 + 80, 900 - 330 * 0.7, 1, T, PAL.orange, blow);
      if (seen(1590, 800, 200)) clawd(1590 + blow * 60, 905, 0.66, { eyes: blow > 0.2 ? 'ce_happy' : 'ce_sq', look: blow > 0.2 ? [0, -0.2] : [0.45, -0.15 - 0.2 * kick(T, 8)], armL: lerp(clArm(dC.aL), -1.2, blow), armR: lerp(clArm(dC.aR), -1.2, blow), hop: dC.hop * (1 - blow), sq: dC.sq, r: lerp(dC.r, 0.3, blow), blush: true, seed: 5, flip: true });
      blownHat(T, 330, 905 - 400 * 0.84, -1, 1); blownHat(T, 1850, 900 - 400 * 0.7, 1, 2);
      // BOOM: the huge one
      if (ba > -0.02 && ba < 1.0) {
        const [x, y] = bbC;
        for (let i = 0; i < 3; i++) { const a2 = ba - i * 0.09; if (a2 < 0) continue; spr('ring', x, y, { s: 0.3 + a2 * 9, a: clamp(1 - a2 * 1.4), seed: i }); }
        ringLine(x, y, 120 + ba * 3000, '#FFFFFF', 46 * (1 - clamp(ba)), 0.9 * (1 - clamp(ba)));
        confBurst(T, wBoom, x, y - 60, { n: 32, ang0: -Math.PI / 2, spread: TAU, spd: 2600, g: 300, seed: 300, life: 1.2, s: 0.8 });
        const wl = [];
        for (let i = 0; i < 24; i++) { const dir = i % 2 ? 1 : -1, y = 150 + R(i, 61) * 700, x0 = dir > 0 ? 1100 : -200, span = dir > 0 ? 1000 : 900; const x = x0 + fract(R(i, 62) + dir * T * 3200 * (0.6 + 0.4 * R(i, 63)) / span) * (span + 360) - 360; wl.push([x, y, x + 360 * (0.5 + R(i, 64)), y]); }
        segLines(wl, '#FFFFFF', 6, 0.55 * blow);
      }
      if (T < 60.95) prewarm(['s07_space_bg', 's07_moon', 's07_moon_eye', 's07_moon_grin', 'rocket', 'gpu', 'flame', 'puff', 'cloud', 's07_omega', 'sparkW', 'paperclip', 'acc_crown', 'star5']);
      pop();
      if (ba > -0.02 && ba < 0.3) { noStroke(); fill(withAlphaCol('#FFFFFF', 0.45 * Math.exp(-Math.max(0, ba) * 12))); rect(0, 0, W, H); }
      // the incoming shockwave front (matches the L16 edge)
      const tr = inv(60.26, 60.66, T);
      if (tr > 0 && tr < 1) { const r = ringR(tr); ringLine(RC[0], RC[1], r, '#FFFFFF', 30, 0.9); ringLine(RC[0], RC[1], r - 22, PAL.pink, 10, 0.8); }
    },
  });
  lyr(17, { y: 1008, words: { 3: { fill: PAL.mint, anim: 'slide' }, 4: { fill: PAL.butter, size: 118, anim: 'zoom', jitter: 7 } } });

  // ================= L18: NVDA to the moon =================
  defSprite('s07_space_bg', 1000, 580, () => {
    wash(-40, -40, 1080, 660, '#2A2160', 190, 0.12);
    blob(200, 160, 230, '#5B3F9A', 110, 0.45);
    blob(800, 140, 220, '#8C4A9E', 90, 0.45);
    blob(560, 420, 260, '#27407A', 110, 0.45);
    blob(900, 480, 160, '#6A3F8E', 80, 0.4);
  });
  defSprite('s07_moon', 640, 640, () => {
    paint(ellPts(320, 320, 282, 282, 64), '#FFEFB8', { baseC: '#FFF6D6', a: 150, lw: 2.8 });
    blob(240, 220, 170, PAL.butterLt, 90, 0.4);
    blob(430, 440, 140, '#F4D89A', 80, 0.4);
    for (const [x, y, r] of [[150, 190, 42], [480, 170, 30], [540, 330, 40], [150, 420, 30], [330, 90, 24], [420, 540, 26], [220, 530, 20]]) paint(ellPts(x, y, r, r * 0.85, 24), '#EDD294', { baseC: '#F6E3B4', lw: 1.3 });
  }, { v: 1 });
  defSprite('s07_moon_eye', 80, 100, () => { flat(ellPts(40, 50, 24, 32, 24), PAL.ink); flat(ellPts(32, 38, 8, 9, 12), '#FFFFFF'); flat(ellPts(48, 62, 4, 4, 8), '#FFFFFF', 0.8); });
  defSprite('s07_moon_grin', 260, 170, () => {
    paint([[30, 26], [230, 26], [210, 90], [170, 132], [130, 144], [90, 132], [50, 90]], '#4A1A3E', { baseC: '#5A2350', lw: 2.4 });
    paint(ellPts(130, 118, 50, 22, 20), PAL.pink, { baseC: PAL.pinkLt, lw: 1.3 });
    flat(rrPts(50, 28, 160, 18, 6), '#FFFFFF', 0.95);
  });

  const MOON = [960, -640], MOON_R = 250;
  const LAND_A = -0.72;
  const LAND = [MOON[0] + Math.cos(LAND_A) * MOON_R, MOON[1] + Math.sin(LAND_A) * MOON_R];
  const LAND_ROT = LAND_A + Math.PI / 2;
  const CHART = [];
  for (let i = 0; i <= 25; i++) {
    const t = i / 25;
    CHART.push([lerp(210, 1350, t), lerp(860, 560, t) - (i % 2 ? 34 : 0) + Math.sin(i * 1.7) * 16 * (1 - t) - (i === 25 ? 0 : 0)]);
  }
  CHART[25] = [1350, 560];
  const RPATH = catmull([CHART[25], [1372, 150], [1398, -300], [1392, -640], [1340, -850], [1236, -900], LAND], 12);
  // whoosh up (fast start), hang at the apex, then drop onto the moon on "moon"
  const rocketU = (T) => (T < 63.55 ? 0.82 * Ez.out(inv(62.99, 63.55, T)) : 0.82 + 0.18 * Ez.in(inv(63.55, wMoon, T)));
  const tr18 = { d: 0.5, at: 0.4 };
  const tr18s = 62.34 - tr18.d * tr18.at;
  function maskRect18(p, T) {
    const [x, y, hw, hh] = lcdRect17(T);
    const e = Ez.inOut(clamp(p));
    return [lerp(x, 960, e), lerp(y, 540, e), lerp(hw, 1000, e), lerp(hh, 580, e), lerp(8, 40, e)];
  }
  const softplus = (x, k = 60) => (x > 12 * k ? x : k * Math.log(1 + Math.exp(x / k)));
  function rocketPos(T) { const u = rocketU(T); return u > 0 ? pathPoint(RPATH, u) : CHART[25]; }
  function cam18(T) {
    // follow the rocket up, softly clamped between the chart and the moon
    const raw = rocketPos(T)[1] + 150;
    let cy = 540 - softplus(540 - raw);
    cy = MOON[1] + softplus(cy - MOON[1]);
    const climb = Math.sin(Math.PI * inv(62.97, 63.75, T));
    let z = lerp(0.82, 1, Ez.out(inv(62.14, 62.8, T))) * (1 - 0.12 * climb);
    const la = T - wMoon;
    if (la > 0) z *= 1 + 0.03 * Math.exp(-la * 7) + 0.03 * Ez.inOut(clamp(la / 0.45));
    return [960, cy, z];
  }
  function chartHead(T) { return Ez.out(inv(62.0, 62.99, T)) * 0.62 + 0.38; }

  shot({
    id: 'L18-moon', t0: 62.34,
    tin: { type: 'mask', d: tr18.d, at: tr18.at, mask: (p, T) => { const [x, y, hw, hh, r] = maskRect18(p, T); rect(x - hw, y - hh, hw * 2, hh * 2, r); } },
    draw(s) {
      const T = s.T, la = T - wMoon;
      bg('#171236');
      const [cx, cy, z] = cam18(T);
      push();
      cam(cx, cy, z);
      shake(hit(T, wMoon, 7) * 12 + (T > 63.0 && T < 63.7 ? 3 : 0), 18);
      gradRect(-600, -1900, W + 1200, 1300, '#0C0826', '#1B1545');
      gradRect(-600, -600, W + 1200, 1900, '#1B1545', '#0E2A3A');
      pop();
      washBG('s07_space_bg', 0.22);
      push();
      cam(cx, cy, z);
      shake(hit(T, wMoon, 7) * 12 + (T > 63.0 && T < 63.7 ? 3 : 0), 18);
      softGlow(420, -980, 700, '#6A3FB0', 0.35); softGlow(1560, -560, 640, '#B04F9A', 0.28); softGlow(700, -260, 600, '#2F58A8', 0.3);
      // stars
      const vy0 = cy - 560 / z, vy1 = cy + 560 / z; // cull stars outside the current view
      for (let i = 0; i < 150; i++) {
        const x = R(i, 91) * 2600 - 340, y = lerp(-1700, 820, Math.pow(R(i, 92), 0.8));
        if (y < vy0 || y > vy1) continue;
        const tw = 0.5 + 0.5 * Math.sin(T * 5 + i * 2.3);
        disc(x, y, 1.5 + 2.5 * R(i, 93) + tw, '#FFFFFF', (0.3 + 0.6 * tw) * (1 - sstep(300, 800, y) * 0.7));
      }
      twinkles(T, 10, 94, [-100, -1500, 2120, 1300], ['sparkW', 'spark'], 0.12, 0.32, 3);
      // chart grid (fades up into sky)
      const grid = [];
      for (let gx = 180; gx <= 1740; gx += 104) grid.push([gx, 150, gx, 900]);
      for (let gy = 150; gy <= 900; gy += 94) grid.push([180, gy, 1740, gy]);
      segLines(grid, PAL.mint, 2, 0.14);
      segLine(180, 140, 180, 905, PAL.mintLt, 5, 0.6); segLine(170, 900, 1760, 900, PAL.mintLt, 5, 0.6);
      // candles
      const wick = [[], []];
      noStroke(); beginShape(TRIANGLES);
      for (let i = 0; i < 16; i++) {
        const x = 250 + i * 72, up = R(i, 95) > 0.3;
        const y = lerp(820, 560, i / 16) - R(i, 96) * 60, h = 30 + R(i, 97) * 80;
        wick[up ? 0 : 1].push([x, y - h * 0.8, x, y + h * 0.8]);
        fill(withAlphaCol(up ? PAL.green : PAL.red, 0.35));
        vertex(x - 12, y - h / 2); vertex(x + 12, y - h / 2); vertex(x + 12, y + h / 2); vertex(x - 12, y - h / 2); vertex(x + 12, y + h / 2); vertex(x - 12, y + h / 2);
      }
      endShape();
      segLines(wick[0], PAL.green, 3, 0.4); segLines(wick[1], PAL.red, 3, 0.4);
      // ticker
      const ta = Ez.outBack(clamp((T - wNVDA + 0.05) / 0.25), 2.5);
      if (ta > 0) {
        txt('NVDA', 1590, 700, { font: 'pixel', size: 72, fill: '#7CFFB2', weight: 700, stroke: '#0E1A2A', sw: 6 }, { s: ta });
        const pct = Math.floor(lerp(12, 999, Ez.in(inv(62.3, 63.4, T))));
        txt('+' + pct + '%', 1620, 780, { font: 'pixel', size: 56, fill: PAL.green, weight: 700 }, { s: ta * (1 + 0.15 * kick(T, 8)) });
        noStroke(); fill(PAL.green); const ax = 1500, ay = 780; triangle(ax - 20, ay + 17, ax + 20, ay + 17, ax, ay - 20);
      }
      // clouds drifting past during the climb
      for (let i = 0; i < 5; i++) spr('cloud', [170, 1780, 430, 1620, 250][i] + Math.sin(T * 0.8 + i) * 30, [-130, -250, -420, -560, -700][i], { s: 0.8 + 0.3 * R(i, 98), a: 0.2, seed: i });
      // the moon (face watches the rocket, grins on landing)
      const mq = la > 0 ? Math.exp(-la * 6) * Math.sin(la * 26) : 0;
      softGlow(MOON[0], MOON[1], 470, PAL.butterLt, 0.4);
      const mb = 0.018 * kick(T, 6);
      push(); translate(MOON[0], MOON[1]); scale((MOON_R / 282) * (1 + 0.06 * mq + mb), (MOON_R / 282) * (1 - 0.06 * mq + mb));
      spr('s07_moon', 0, 0, { seed: 2 });
      const u = rocketU(T);
      const rp = rocketPos(T);
      const lk = [clamp((rp[0] - MOON[0]) / 900, -1, 1) * 16, clamp((rp[1] - MOON[1]) / 900, -1, 1) * 16];
      const happy = la > 0;
      for (const ex of [-92, 92]) {
        if (happy) { noFill(); stroke(PAL.ink); strokeWeight(13); arc(ex, -26, 76, 62, Math.PI + 0.25, TAU - 0.25); noStroke(); }
        else spr('s07_moon_eye', ex + lk[0], -40 + lk[1], { s: 1.1, sy: fract(T * 0.5) < 0.04 ? 0.15 : 1 });
      }
      disc(-150, 40, 34, PAL.pink, happy ? 0.7 : 0.4); disc(150, 40, 34, PAL.pink, happy ? 0.7 : 0.4);
      if (happy) spr('s07_moon_grin', 0, 76, { s: 1 + 0.2 * Math.exp(-la * 5) });
      else { noFill(); stroke(PAL.ink); strokeWeight(11); arc(0, 40, 170, 110, 0.35, Math.PI - 0.35); noStroke(); }
      pop();
      // the green line: chart, then the rocket's trail all the way to the moon
      const hu = chartHead(T);
      const nC = hu * 25;
      const line = CHART.slice(0, Math.floor(nC) + 1);
      if (nC < 25) { const i = Math.floor(nC), f = nC - i; line.push([lerp(CHART[i][0], CHART[i + 1][0], f), lerp(CHART[i][1], CHART[i + 1][1], f)]); }
      if (u > 0) { const n = Math.floor(u * (RPATH.length - 1)); for (let i = 1; i <= n; i++) line.push(RPATH[i]); line.push(rp); }
      blendMode(ADD); polyline(line, PAL.green, 26, 0.3); blendMode(BLEND);
      polyline(line, '#1E7A4E', 14, 1);
      polyline(line, '#7CFFB2', 7, 1);
      const head = line[line.length - 1];
      if (u <= 0) {
        glow(head[0], head[1], 70, PAL.green, 0.6 + 0.3 * kick(T, 6));
        disc(head[0], head[1], 13 + 6 * kick(T, 8), '#DFFFEA');
        for (const bt of [62.531, 62.996]) if (T > bt) spr('ring', head[0], head[1], { s: 0.1 + (T - bt) * 1.6, a: clamp(1 - (T - bt) * 3) });
      }
      // the rocket (with a GPU tower balanced on the nose)
      if (u > 0 || T > 62.97) {
        const pop0 = Ez.outBack(clamp((T - 62.97) / 0.16), 2.4);
        const rrot = lerp(0, LAND_ROT, sstep(0.72, 0.98, u)) + (la < 0 ? Math.sin(T * 13) * 0.03 : 0);
        const lsq = la > 0 ? 1 - 0.22 * Math.exp(-la * 9) * Math.cos(la * 30) : 1;
        push(); translate(rp[0], rp[1]); rotate(rrot); scale(pop0);
        const burn = la < 0 ? (u < 0.8 ? 1 : 0.55) : Math.max(0, 1 - la * 6);
        if (burn > 0) { softGlow(0, 50, 150 * burn, PAL.orange, 0.7 * burn); spr('flame', 0, 22, { s: (1.4 + Math.sin(T * 40) * 0.14) * burn, sy: u < 0.8 ? 1.7 : 1.0, r: Math.PI }); }
        push(); scale(1 / lsq * 0.98 + 0.02, lsq);
        spr('rocket', 0, 0, { s: 0.5 });
        for (let i = 0; i < 3; i++) {
          const wob = Math.sin(T * 8 + i * 0.9) * (2 + i * 3) + (la > 0 ? Math.sin(la * 18 - i * 0.7) * Math.exp(-la * 4) * (8 + i * 11) : 0) - (u > 0 && u < 0.7 ? i * 5 : 0);
          spr('gpu', wob, -206 - i * 45, { s: 0.34, r: wob * 0.012, seed: i });
        }
        pop();
        pop();
        burst(T, 62.97, CHART[25][0], CHART[25][1], { n: 14, names: ['puff', 'spark', 'blob_green'], spd: 700, g: 200, life: 0.7, s: 0.35, seed: 70 });
      }
      // landing: dust puffs along the rim + stars
      if (la > 0 && la < 1.2) {
        for (let i = 0; i < 6; i++) {
          const side = i % 2 ? 1 : -1, k = Ez.out(clamp(la / 0.5));
          const a = LAND_A + side * (0.1 + k * 0.28 * (0.6 + 0.4 * R(i, 99)));
          spr('puff', MOON[0] + Math.cos(a) * (MOON_R + 20), MOON[1] + Math.sin(a) * (MOON_R + 20), { s: (0.25 + 0.2 * R(i, 100)) * (0.5 + k), a: 1 - inv(0.5, 1.2, la), seed: i });
        }
        burst(T, wMoon, LAND[0], LAND[1], { n: 16, names: ['star5', 'spark', 'sparkW'], spd: 1000, g: 0, life: 0.9, s: 0.45, even: true, seed: 222 });
      }
      pop();
      // vertical speed streaks during the climb (screen space)
      const climb = Math.sin(Math.PI * inv(62.97, 63.55, T));
      if (climb > 0.02) {
        const st = [];
        for (let i = 0; i < 18; i++) { const x = R(i, 101) * W, y = fract(R(i, 102) + T * 2.6) * (H + 400) - 200; st.push([x, y, x, y + 160 + 160 * R(i, 103)]); }
        segLines(st, '#FFFFFF', 4, 0.35 * climb);
      }
      // screen bezel following the growing LCD window (transition from L17)
      const tp = inv(tr18s, tr18s + tr18.d, T);
      if (tp > 0 && tp < 1) { const [x, y, hw, hh, r] = maskRect18(tp, T); noFill(); stroke(withAlphaCol('#3C3458', 1 - tp)); strokeWeight(22); rect(x - hw, y - hh, hw * 2, hh * 2, r); stroke(withAlphaCol(PAL.mint, 0.8 * (1 - tp))); strokeWeight(6); rect(x - hw + 10, y - hh + 10, hw * 2 - 20, hh * 2 - 20, r); noStroke(); }
    },
  });
  lyr(18, { x: 700, y: 150, words: { 0: { font: 'pixel', fill: '#7CFFB2', size: 90 }, 3: { fill: PAL.butterLt, anim: 'drop', grow: 0.3 } } });

  // ================= L19: The Omega Point's coming soon =================
  // Omega glyph; circle centre at sprite (380, 360)
  defSprite('s07_omega', 760, 760, () => {
    const cx = 380, cy = 360, Ro = 300, Ri = 212;
    const P = (x, y) => [cx + x * Ro, cy + y * Ro];
    const pts = [];
    for (let i = 0; i <= 40; i++) { const a = ((128 + (i / 40) * (412 - 128)) * Math.PI) / 180; pts.push([cx + Math.cos(a) * Ro, cy + Math.sin(a) * Ro]); }
    pts.push(P(0.72, 1.0), P(1.04, 1.0), P(1.04, 1.14), P(0.36, 1.14), P(0.35, 0.98));
    for (let i = 0; i <= 40; i++) { const a = ((62 - (i / 40) * (62 + 242)) * Math.PI) / 180; pts.push([cx + Math.cos(a) * Ri, cy + Math.sin(a) * Ri]); }
    pts.push(P(-0.35, 0.98), P(-0.36, 1.14), P(-1.04, 1.14), P(-1.04, 1.0), P(-0.72, 1.0));
    // brush fills mishandle this concave outline, so: native flat base + small blooms along the band + brush outline
    flat(pts, '#FFD24E');
    const mid = (Ro + Ri) / 2;
    for (let i = 0; i < 8; i++) { const a = ((140 + i * 36) * Math.PI) / 180; blob(cx + Math.cos(a) * mid, cy + Math.sin(a) * mid, 30 + random() * 8, [PAL.gold, PAL.orange, PAL.butter, '#FFB84A'][i % 4], 120, 0.12); }
    for (const sx of [-1, 1]) blob(cx + sx * 0.62 * Ro, cy + 1.0 * Ro, 26, PAL.orange, 110, 0.12);
    pen(PAL.ink, 3, '2B'); brush.polygon(pts); brush.noStroke();
    const hl = []; // glossy highlight crescent on the upper-left of the band
    for (let i = 0; i <= 16; i++) { const a = ((188 + i * 4.5) * Math.PI) / 180; hl.push([cx + Math.cos(a) * (Ro - 16), cy + Math.sin(a) * (Ro - 16)]); }
    for (let i = 16; i >= 0; i--) { const a = ((188 + i * 4.5) * Math.PI) / 180; hl.push([cx + Math.cos(a) * (Ro - 16 - 14 * Math.sin((i / 16) * Math.PI)), cy + Math.sin(a) * (Ro - 16 - 14 * Math.sin((i / 16) * Math.PI))]); }
    flat(hl, '#FFFFFF', 0.75);
  }, { v: 1, ay: 360 / 760 });
  // glowing spiral arms of the portal (native, additive)
  function vortexArms(x, y, s, rot, a) {
    blendMode(ADD); noStroke();
    const cs = [PAL.lilac, PAL.pink, PAL.sky, PAL.butter, PAL.lilacLt, PAL.mint];
    for (let k = 0; k < 6; k++) {
      beginShape(TRIANGLE_STRIP);
      for (let i = 0; i <= 26; i++) {
        const t = i / 26, ang = rot + (k / 6) * TAU + t * 3.3, r = (24 + t * 440) * s, w = (5 + t * 58) * s;
        const col = withAlphaCol(cs[k], a * (0.5 * Math.sin(Math.PI * Math.min(1, t * 1.25)) + 0.04));
        fill(col); vertex(x + Math.cos(ang) * (r + w), y + Math.sin(ang) * (r + w));
        fill(col); vertex(x + Math.cos(ang + 0.14) * (r - w * 0.6), y + Math.sin(ang + 0.14) * (r - w * 0.6));
      }
      endShape();
    }
    blendMode(BLEND);
  }
  const PC = [960, 540];
  const ORB = ['gpu', 'paperclip', 'acc_party', 'heart', 'star5', 'note', 's07_conf', 'rocket', 'gauge', 's07_balloon', 'acc_crown', 'spark', 'drop', 's07_disco'];
  const ORB_S = [0.42, 0.55, 0.6, 0.55, 0.55, 0.6, 1.5, 0.22, 0.13, 0.45, 0.55, 0.6, 0.7, 0.42];
  // integrated pull (speeds up hard on "coming")
  const pull = (T) => (T - 64.0) * 0.55 + Math.pow(Math.max(0, T - wComing), 2) * 2.4;
  // swell a touch just before "soon", then implode through the word (half gone at 65.48, gone by 65.53)
  const collapse = (T) => { const a = sstep(wSoon - 0.15, wSoon - 0.03, T), b = Ez.inOut(inv(wSoon - 0.05, wSoon + 0.05, T)); return b - 0.08 * a * (1 - b); };

  shot({
    id: 'L19-omega', t0: 64.04, tin: { type: 'swirl', d: 0.5, at: 0.2, c: [960, 540] },
    draw(s) {
      const T = s.T, pl = pull(T), co = collapse(T), gone = T >= wSoon + 0.05;
      const cm = T - wComing;
      bg('#0D0922');
      const z = 1 + 0.05 * inv(64.0, 65.1, T) + 0.1 * Ez.in(inv(wComing, wSoon, T));
      push();
      cam(960, 540, z, cm > 0 ? Math.sin(T * 9) * 0.008 * (1 - co) : 0);
      shake((cm > 0 ? 5 : 0) * (1 - co) + hit(T, wSoon, 8) * 10, 19);
      const neb = 1 - 0.85 * sstep(wSoon, wSoon + 0.2, T);
      washBG('s07_space_bg', 0.3 * neb);
      softGlow(380, 300, 620, '#6A3FB0', 0.4 * neb); softGlow(1580, 760, 640, '#B04F9A', 0.32 * neb); softGlow(1500, 220, 420, '#2F58A8', 0.35 * neb); softGlow(420, 860, 420, '#27407A', 0.35 * neb);
      for (let i = 0; i < 120; i++) {
        const x = R(i, 111) * 2100 - 90, y = R(i, 112) * 1260 - 90;
        const tw = 0.5 + 0.5 * Math.sin(T * 4 + i * 1.9);
        disc(x, y, 1.2 + 2 * R(i, 113) + tw, '#FFFFFF', (0.25 + 0.55 * tw) * (1 - 0.8 * sstep(wSoon, wSoon + 0.2, T)));
      }
      const alive = 1 - co;
      if (!gone) {
        // starlight streaks converging
        blendMode(ADD);
        const sk = [[], [], [], []];
        for (let i = 0; i < 46; i++) {
          const ph = fract(R(i, 121) + pl * (0.8 + 0.6 * R(i, 122)));
          if (ph < 0.06) continue;
          const ang = R(i, 123) * TAU + ph * 0.8;
          const d0 = 1250 * (1 - ph), len = 60 + 260 * ph * (1 + 2 * clamp(cm * 3));
          const d1 = Math.max(0, d0 + len);
          sk[i % 4].push([PC[0] + Math.cos(ang) * d0, PC[1] + Math.sin(ang) * d0, PC[0] + Math.cos(ang) * d1, PC[1] + Math.sin(ang) * d1]);
        }
        [PAL.butterLt, PAL.lilacLt, '#FFFFFF', PAL.skyLt].forEach((c, k) => segLines(sk[k], c, 2 + k, 0.55 * alive));
        blendMode(BLEND);
        // vortex + accretion rings
        const vs = (0.95 + 0.06 * kick(T, 5)) * (1 - co);
        softGlow(PC[0], PC[1], 560 * vs, PAL.lilac, 0.55);
        vortexArms(PC[0], PC[1], vs, -(T - 64) * 2.2 - Math.pow(Math.max(0, cm), 2) * 9, 0.9 * alive);
        vortexArms(PC[0], PC[1], vs * 0.62, -(T - 64) * 3.1 - Math.pow(Math.max(0, cm), 2) * 12 + 0.5, 0.6 * alive);
        for (let k = 0; k < 3; k++) {
          push(); translate(PC[0], PC[1]); rotate(0.3 + k * 0.9 + T * 0.4 * (k % 2 ? -1 : 1)); scale(1, 0.32);
          ringLine(0, 0, (420 + k * 70) * vs, [PAL.pinkLt, PAL.skyLt, PAL.butterLt][k], 4, 0.45 * alive);
          pop();
        }
        softGlow(PC[0], PC[1], 170 * vs, '#FFFFFF', 0.42 + 0.3 * kick(T, 5));
        // tiny things spiralling in
        for (let i = 0; i < 18; i++) {
          const t = fract(R(i, 131) + pl * (0.3 + 0.25 * R(i, 132)));
          const rad = 1150 * Math.pow(1 - t, 1.25);
          const ang = R(i, 133) * TAU + t * 4.2;
          const nm = ORB[i % ORB.length];
          const sc = ORB_S[i % ORB.length] * lerp(0.15, 1, Math.pow(1 - t, 0.7));
          spr(nm, PC[0] + Math.cos(ang) * rad, PC[1] + Math.sin(ang) * rad * 0.8, { s: sc, r: t * 9 * (i % 2 ? 1 : -1) + i, a: sstep(0, 0.08, t) * (1 - sstep(0.86, 1, t)) * alive, v: nm === 's07_conf' ? i % 6 : undefined, seed: i });
        }
        // the Omega
        const ig = hit(T, wOmega, 4);
        const os = 0.9 * (1 + 0.04 * kick(T, 5) + 0.06 * ig) * (1 - co) * Ez.outBack(clamp((T - 64.12) / 0.3), 1.8);
        if (os > 0.005) {
          softGlow(PC[0], PC[1], 460 * os, PAL.butter, 0.35 + 0.35 * ig);
          const tremble = cm > 0 ? RS(G.boil, 131) * 6 : 0;
          spr('s07_omega', PC[0] + tremble, PC[1], { s: os, r: cm > 0 ? RS(G.boil, 132) * 0.02 : 0 });
          for (let i = 0; i < 3; i++) { const a2 = T - wOmega - i * 0.08; if (a2 > 0 && a2 < 0.6) ringLine(PC[0], PC[1], 300 + a2 * 1500, i === 1 ? PAL.butter : '#FFFFFF', 14 * (1 - a2 / 0.6) + 2, 0.8 * (1 - a2 / 0.6)); }
        }
        // "Point's": a sharp point of light blooms in the centre
        const pa = T - wPoint;
        if (pa > 0) {
          const k2 = Ez.outBack(clamp(pa / 0.2), 3) * (1 - co);
          const fl = hit(T, wPoint, 5);
          blendMode(ADD);
          for (let i = 0; i < 4; i++) { const a = T * 0.5 + (i * Math.PI) / 2; const L = (260 + 520 * fl) * k2; segLine(PC[0] - Math.cos(a) * L, PC[1] - Math.sin(a) * L, PC[0] + Math.cos(a) * L, PC[1] + Math.sin(a) * L, '#FFF6D8', 3 + 5 * fl, 0.55 + 0.4 * fl); }
          blendMode(BLEND);
          spr('sparkW', PC[0], PC[1], { s: (1.1 + 0.8 * fl + 0.2 * kick(T, 6)) * k2, r: T * 0.9, jit: 0 });
          spr('sparkW', PC[0], PC[1], { s: 0.6 * k2, r: -T * 1.3 + 0.78, jit: 0 });
        }
        // Clawd and Pip adrift, then yanked in on "coming"
        const yk = Ez.in(inv(wComing, wComing + 0.34, T));
        if (yk < 1) {
          const fp = [lerp(420 + Math.sin(T * 1.3) * 20, PC[0], yk), lerp(700 + Math.cos(T * 1.1) * 16, PC[1], yk)];
          const fc = [lerp(1500 + Math.sin(T * 1.2 + 1) * 20, PC[0], yk), lerp(720 + Math.cos(T * 1.4) * 16, PC[1], yk)];
          pip(fp[0], fp[1], 0.5 * (1 - yk), { face: cm > 0 ? 'pf_scared' : 'pf_shock', armL: 2.5 + Math.sin(T * 6) * 0.2, armR: 2.2 + Math.cos(T * 6) * 0.2, r: -0.4 + (T - 64) * 0.6 + yk * 6, legs: [0.3, -0.2], seed: 3 });
          clawd(fc[0], fc[1], 0.42 * (1 - yk), { eyes: 'ce_star', armL: -1.1, armR: -0.9, r: 0.3 - (T - 64) * 0.5 - yk * 7, blush: true, legs: [[-6, 0.2], [0, 0], [0, 0], [-6, -0.2]], seed: 5 });
        }
        // collapse: inward ring
        if (co > 0) ringLine(PC[0], PC[1], 900 * (1 - co), '#FFFFFF', 18, 0.7 * co);
      }
      pop();
      // the blinding white dot (lead-out for S08's flash)
      const da = T - wSoon;
      if (da > -0.02) {
        noStroke(); fill(withAlphaCol('#05030F', 0.72 * sstep(0, 0.2, da) * (1 - sstep(65.8, 65.98, T)))); rect(0, 0, W, H);
        const grow = 1 + 9 * Ez.in(inv(65.7, 65.99, T));
        const pu = 1 + 0.2 * kick(T, 6);
        softGlow(PC[0], PC[1], Math.min(1400, 300 * pu * grow), '#FFFFFF', 0.7 + 0.25 * sstep(2, 8, grow), grow > 3 ? 20 : 34);
        softGlow(PC[0], PC[1], 90 * pu * grow, '#FFF6D8', 0.9, 10);
        blendMode(ADD); segLine(PC[0] - 520 * grow, PC[1], PC[0] + 520 * grow, PC[1], '#D8CCFF', 3, 0.5); segLine(PC[0], PC[1] - 160 * grow, PC[0], PC[1] + 160 * grow, '#D8CCFF', 2, 0.35); blendMode(BLEND);
        disc(PC[0], PC[1], 22 * pu * grow * Ez.outBack(clamp((da + 0.02) / 0.12), 3), '#FFFFFF');
      }
    },
  });
  lyr(19, { y: 985, size: 72, maxW: 1500, words: { 1: { fill: PAL.butter, anim: 'spin' }, 2: { fill: PAL.lilacLt }, 4: { anim: 'zoom', fill: '#FFFFFF', grow: 0.2 } } });
})();

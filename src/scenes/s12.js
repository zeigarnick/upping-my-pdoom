// s12.js - S12: the build, THE DROP, disobey, chinchillas, fences (108.18-118.70). Everything here is private to this IIFE.
(() => {
  // ================= timing =================
  const nearBeat = (t) => { let b = BEATS[0]; for (const x of BEATS) if (Math.abs(x - t) < Math.abs(b - t)) b = x; return b; };
  const T_START = 108.18;
  const JUST = [108.18, 110.0, 110.84, 111.18]; // the stuttered "just"s
  const T_ARR = 110.56;             // spark reaches the wick tip
  const T_BOOM = nearBeat(110.7);   // KABOOM on the drop (110.713)
  const T_TRANS = wordT(33, 1);     // 111.18 "transformers"
  const T_CUT = 111.08;             // hidden cut inside the fireball
  const T_WAY = wordT(33, 4);       // 112.88 "way!"
  const T_L34 = wordT(34, 0);       // 113.22
  const T_DIS = wordT(34, 4);       // 114.20 "disobey"
  const CLICKS = [nearBeat(113.45), wordT(34, 2)];
  const T_L35 = wordT(35, 0);       // 114.98
  const T_DENSE = wordT(35, 1);     // 115.94 "super-dense"
  const T_L36 = wordT(36, 0);       // 116.88
  const FENCE_T = [nearBeat(117.08), nearBeat(117.54), wordT(36, 3), wordT(36, 4)]; // accelerating smashes, last on "fence"

  // ================= helpers =================
  const pulseAt = (T, ts, k = 7) => { let b = 0; for (const t of ts) { const g = T - t; if (g >= 0) b = Math.max(b, Math.exp(-g * k)); } return b; };
  const countAt = (T, ts) => ts.reduce((n, t) => n + (T >= t ? 1 : 0), 0);
  const keys = (T, K) => { if (T <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (T <= K[i][0]) return lerp(K[i - 1][1], K[i][1], inv(K[i - 1][0], K[i][0], T)); return K[K.length - 1][1]; };
  const rot2 = (x, y, r) => { const c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; };
  // jittery impact shake at 30 Hz (pure function of T)
  function jolt(T, amt, seed = 0) { if (amt <= 0.01) return; const f = Math.floor(T * 30); translate(RS(f, seed + 1) * amt, RS(f, seed + 2) * amt); }
  function polyInfo(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, total: cum[cum.length - 1] }; }
  function polyAt(P, d) {
    d = clamp(d, 0, P.total);
    let i = 1; while (i < P.cum.length - 1 && P.cum[i] < d) i++;
    const a = P.pts[i - 1], b = P.pts[i], k = (d - P.cum[i - 1]) / Math.max(1e-6, P.cum[i] - P.cum[i - 1]);
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  function polySlice(P, d0, d1) { const out = [polyAt(P, d0)]; for (let i = 1; i < P.pts.length - 1; i++) if (P.cum[i] > d0 && P.cum[i] < d1) out.push(P.pts[i]); out.push(polyAt(P, d1)); return out; }
  function polyStroke(pts, c, w, a = 1) { noFill(); stroke(withAlphaCol(c, a)); strokeWeight(w); beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(); noStroke(); }
  // zig-zag electric bolt that re-rolls 24 times a second
  function bolt(x1, y1, x2, y2, seed, amp, a = 1, w = 6, n = 7) {
    if (a <= 0.02) return;
    const f = Math.floor(G.T * 24), dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const pts = [[x1, y1]];
    for (let k = 1; k < n; k++) { const t = k / n, o = RS(f * 13 + k, seed) * amp * Math.sin(Math.PI * t); pts.push([x1 + dx * t + nx * o, y1 + dy * t + ny * o]); }
    pts.push([x2, y2]);
    polyStroke(pts, PAL.butter, w * 2.2, 0.45 * a); polyStroke(pts, '#FFFFFF', w, a);
  }
  // scalloped cloud/explosion outline
  function puffPts(cx, cy, r, n = 8, amp = 0.2, m = 72) {
    const pts = [];
    for (let i = 0; i < m; i++) { const a = (i / m) * TAU, k = 1 + amp * Math.abs(Math.sin((a * n) / 2)); pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]); }
    return pts;
  }
  // cheap flat shape with a native ink outline (for small sprite details; saves brush time)
  function flatLine(pts, c, lw = 1.8, a = 1) { flat(pts, c, a); noFill(); stroke(PAL.ink); strokeWeight(lw); beginShape(); for (const q of pts) vertex(q[0], q[1]); endShape(CLOSE); noStroke(); }
  function wedges(x, y, n, a0, R0, c, a) {
    noStroke(); fill(withAlphaCol(c, a)); beginShape(TRIANGLES);
    for (let i = 0; i < n; i += 2) { const a1 = a0 + (i / n) * TAU, a2 = a0 + ((i + 1) / n) * TAU; vertex(x, y); vertex(x + Math.cos(a1) * R0, y + Math.sin(a1) * R0); vertex(x + Math.cos(a2) * R0, y + Math.sin(a2) * R0); }
    endShape();
  }

  // ================= L33a: the fuse and the bomb =================
  const fullRect = [[-40, -40], [1040, -40], [1040, 620], [-40, 620]];
  defSprite('s12_stage', 1000, 580, () => {
    flat(fullRect, mixc(PAL.night, PAL.nightLt, 0.3));
    wash(-40, -40, 1080, 660, mixc(PAL.night, PAL.lilac, 0.1), 235, 0.1);
    blob(560, 240, 300, mixc(PAL.nightLt, PAL.pink, 0.25), 100, 0.4);
    blob(560, 240, 160, mixc(PAL.nightLt, PAL.pink, 0.4), 70, 0.3);
    blob(120, 120, 180, mixc(PAL.night, PAL.blue, 0.25), 90, 0.4);
    wash(-40, 430, 1080, 220, mixc(PAL.night, PAL.ink, 0.35), 210, 0.12);
    blob(560, 470, 230, mixc(PAL.nightLt, PAL.butter, 0.2), 70, 0.3);
  });
  defSprite('s12_bomb', 620, 620, () => {
    const b = ellPts(310, 350, 240, 236, 64);
    paint(b, PAL.navy, { baseC: mixc(PAL.navy, PAL.ink, 0.35), a: 190, lw: 2.8 });
    wc(PAL.blue, 80, 0.15, 0.5, 0.5); brush.circle(250, 290, 130); brush.noFill();
    wc(PAL.ink, 90, 0.1, 0.5, 0.5); brush.circle(380, 440, 140); brush.noFill();
    flat(ellPts(205, 225, 62, 30, 24, 0, -0.75), '#FFFFFF', 0.4);
    flat(ellPts(150, 290, 13, 13, 12), '#FFFFFF', 0.55);
    paint(rrPts(245, 66, 130, 72, 14), PAL.gray, { baseC: PAL.grayLt, lw: 2.2 });
    pen(PAL.ink, 1.6, 'pen'); brush.line(252, 94, 368, 94); brush.noStroke();
    flat(rrPts(262, 74, 22, 14, 5), '#FFFFFF', 0.6);
  }, { v: 2, ay: 350 / 620 });
  defSprite('s12_beye', 130, 150, () => { paint(ellPts(65, 75, 46, 56, 32), '#FFFFFF', { baseC: '#FFFFFF', lw: 2.8 }); }, { v: 2 });
  defSprite('s12_sandbags', 600, 260, () => {
    const cA = mixc(PAL.brownLt, PAL.cream, 0.3), cB = mixc(PAL.brownLt, PAL.cream, 0.6);
    for (const [x, y] of [[90, 70], [215, 62], [340, 70], [465, 64], [30, 140], [155, 150], [280, 142], [405, 150]]) {
      paint(rrPts(x, y, 130, 74, 32), cA, { baseC: cB, lw: 2.2 });
      pen(PAL.brown, 1.4, 'pen'); brush.line(x + 22, y + 38, x + 108, y + 40); brush.noStroke();
    }
  }, { ay: 0.85 });
  // explosion puffs: v0 butter/white core, v1 orange, v2 pink
  defSprite('s12_boom', 400, 400, (v) => {
    const cs = [[PAL.butter, '#FFFFFF'], [PAL.orange, PAL.butter], [PAL.pink, PAL.butterLt]][v];
    paint(puffPts(200, 200, 138, 9, 0.2), cs[0], { baseC: lite(cs[0], 0.3), a: 200, lw: 2.6 });
    blob(180, 180, 80, cs[1], 190, 0.2);
    blob(160, 160, 40, '#FFFFFF', 170, 0.2);
  }, { v: 3 });
  defSprite('s12_splat', 300, 300, (v) => {
    const c = [PAL.butter, PAL.pink, PAL.mint][v];
    const pts = []; const n = 40;
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const r = 72 + 16 * Math.sin(a * 3 + v * 2) + 9 * Math.sin(a * 7) + 6 * random(); pts.push([150 + Math.cos(a) * r, 150 + Math.sin(a) * r]); }
    paint(pts, c, { baseC: lite(c, 0.25), a: 200, line: false });
    for (let i = 0; i < 5; i++) { const a = random() * TAU, L = 100 + random() * 24; flat(ellPts(150 + Math.cos(a) * L, 150 + Math.sin(a) * L, 15 + random() * 7, 10 + random() * 5, 14, 0, a), c); }
    flat(ellPts(126, 124, 20, 12, 12, 0, -0.6), '#FFFFFF', 0.5);
  }, { v: 3 });
  defSprite('s12_shard', 160, 120, () => {
    const pts = []; for (let i = 0; i <= 10; i++) { const a = -2.4 + i * 0.13; pts.push([80 + Math.cos(a) * 120, 150 + Math.sin(a) * 120]); }
    for (let i = 10; i >= 0; i--) { const a = -2.4 + i * 0.13; pts.push([80 + Math.cos(a) * 88, 150 + Math.sin(a) * 88]); }
    paint(offsetPts(pts, 0, -20), PAL.navy, { baseC: mixc(PAL.navy, PAL.blue, 0.3), lw: 2 });
  }, { v: 2 });

  const BX = 1120, BY = 575, BTILT = -0.32;
  // the fuse rope in world coords: enters left above the HUD, loops once, climbs the bomb's flank to the wick
  const ROPE0 = (() => {
    const P = [];
    for (let x = -80; x <= 560; x += 20) P.push([x, 866 + 124 * sstep(240, 470, x) + Math.sin(x * 0.02) * 6]);
    for (let i = 1; i <= 40; i++) { const t = i / 40, a = Math.PI / 2 - t * TAU; P.push([580 + t * 90 + Math.cos(a) * 84, 906 + Math.sin(a) * 84]); }
    P.push([730, 994], [790, 986], [838, 952], [868, 884], [880, 790], [880, 670], [888, 540], [908, 430], [940, 340]);
    return P;
  })();
  const SPARK_K = [[107.93, 0], [108.22, 0.18], [109.3, 0.5], [110.0, 0.7], [T_ARR, 1]];
  function camA(T) {
    const e = Ez.inOut(inv(107.95, T_ARR, T)), f = Ez.in(inv(T_ARR, T_BOOM, T));
    return { cx: lerp(960, 1010, e), cy: lerp(540, 575, e), Z: lerp(1.0, 1.15, e) + 0.12 * f };
  }
  function bombState(T) {
    const build = inv(108.1, T_ARR, T);
    const bump = pulseAt(T, JUST.slice(0, 2), 6);
    let sc = 1 + 0.07 * Ez.outElastic(clamp((T - JUST[0]) / 0.7)) * (T >= JUST[0] ? 1 : 0) + 0.1 * (T >= JUST[1] ? Ez.outElastic(clamp((T - JUST[1]) / 0.7)) : 0) + 0.05 * build;
    const fin = inv(T_ARR + 0.02, T_BOOM, T);
    sc += 0.24 * Ez.in(fin);
    const A = 1.2 + 7 * build * build + 9 * bump + 12 * fin;
    const kb = kick(T, 7) * build;
    const sq = 1 + 0.035 * Math.sin(T * 9) * build + 0.1 * bump + 0.06 * kb - 0.12 * Math.sin(Math.PI * clamp(fin * 1.6)) * (fin < 0.62 ? 1 : 0);
    return { x: BX + Math.sin(T * 71) * A, y: BY + Math.sin(T * 53 + 1.3) * A * 0.6, sc: sc * (1 + 0.025 * kb), r: BTILT + Math.sin(T * 43) * A * 0.003, sq, bump, build, fin, kb };
  }
  function wickPts(B) {
    const o = (lx, ly) => { const [dx, dy] = rot2(lx * B.sc * B.sq, ly * B.sc / B.sq, B.r); return [B.x + dx, B.y + dy]; };
    const cap = o(0, -276);
    const w = (lx, ly) => { const [dx, dy] = rot2(lx, ly, B.r); return [cap[0] + dx, cap[1] + dy]; };
    return [cap, w(-4, -30), w(-22, -54), w(-46, -64)];
  }
  const ROPE_C = mixc(PAL.brownLt, PAL.butter, 0.35);
  function drawRope(P, d0, w = 12) {
    if (d0 > 2) polyStroke(polySlice(P, 0, d0), PAL.ink, 4, 0.5);
    if (d0 >= P.total - 1) return;
    const live = polySlice(P, d0, P.total);
    polyStroke(live, PAL.ink, w + 5); polyStroke(live, ROPE_C, w);
    stroke(withAlphaCol(PAL.brown, 0.9)); strokeWeight(2.4); beginShape(LINES);
    let i = 1;
    for (let d = Math.ceil(d0 / 15) * 15; d < P.total; d += 15) {
      while (i < P.cum.length - 1 && P.cum[i] < d) i++;
      const a = P.pts[i - 1], b = P.pts[i], k = (d - P.cum[i - 1]) / Math.max(1e-6, P.cum[i] - P.cum[i - 1]);
      const x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k), an = Math.atan2(b[1] - a[1], b[0] - a[0]) + 0.9;
      const c = Math.cos(an) * w * 0.45, s = Math.sin(an) * w * 0.45;
      vertex(x - c, y - s); vertex(x + c, y + s);
    }
    endShape(); noStroke();
  }
  function sparkHead(x, y, T, s = 1) {
    glow(x, y, 70 * s, PAL.orange, 0.55);
    glow(x, y, 34 * s, PAL.butter, 0.6);
    const f = Math.floor(T * 24);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU + T * 14 + R(f, k) * 0.7, L = (22 + 30 * R(f, k + 9)) * s;
      segLine(x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, x + Math.cos(a) * L, y + Math.sin(a) * L, k % 2 ? PAL.butter : '#FFFFFF', 3.4 * s, 0.95);
    }
    spr('sparkW', x, y, { s: 0.5 * s * (0.85 + 0.3 * Math.sin(T * 40)), r: T * 9 });
    spr('spark', x, y, { s: 0.36 * s * (0.8 + 0.3 * Math.sin(T * 33 + 1)), r: -T * 7 + 0.4 });
    disc(x, y, 7 * s, '#FFFFFF');
  }
  // embers and smoke trailing behind the spark (re-derived from emission time, so scrubbing is exact)
  function trail(pos, T) {
    const step = 1 / 40, i0 = Math.floor(T / step);
    for (let k = 0; k < 10; k++) {
      const i = Math.floor(T / 0.07) - k, te = i * 0.07, age = T - te;
      if (te < 107.95 || te > T_ARR + 0.1) continue;
      const [x0, y0] = pos(te);
      const r = 10 + age * 50;
      disc(x0 + RS(i, 7) * 10 + age * 20, y0 - age * 90, r, PAL.grayLt, 0.22 * (1 - age / 0.7));
    }
    for (let k = 0; k < 18; k++) {
      const i = i0 - k, te = i * step, age = T - te;
      if (te < 107.95 || te > T_ARR + 0.1) continue;
      const [x0, y0] = pos(te);
      const x = x0 + RS(i, 1) * 190 * age, y = y0 + (-140 - R(i, 2) * 220) * age + 700 * age * age;
      disc(x, y, 2.5 + 3.5 * R(i, 3), R(i, 4) > 0.5 ? PAL.butter : PAL.orange, 1 - k / 18);
    }
  }
  function drawBomb(T, B, sp) {
    push(); translate(B.x, B.y); rotate(B.r); scale(B.sc * B.sq, B.sc / B.sq);
    spr('s12_bomb', 0, 0, { jit: 0.6 });
    // light leaking through cracks just before the blast
    const cr = inv(T_ARR + 0.03, T_BOOM, T);
    if (cr > 0) {
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * TAU + 0.4, pts = [[Math.cos(a) * 40, Math.sin(a) * 40]];
        for (let j = 1; j <= 4; j++) pts.push([Math.cos(a + RS(k, j) * 0.25) * (40 + j * 50), Math.sin(a + RS(k, j) * 0.25) * (40 + j * 50)]);
        const n = Math.max(2, Math.round(1 + 4 * clamp(cr * 1.4)));
        polyStroke(pts.slice(0, n), PAL.butter, 16, 0.5 * cr); polyStroke(pts.slice(0, n), '#FFFFFF', 7, cr);
      }
    }
    const fear = B.build, shut = T > T_ARR + 0.05;
    for (const [ex, ey] of [[-96, -24], [34, -30]]) {
      if (!shut) {
        spr('s12_beye', ex, ey, { s: 0.62, sy: 1 + 0.22 * fear + 0.18 * B.bump, seed: ex });
        const dx = sp[0] - (B.x + ex), dy = sp[1] - (B.y + ey), dl = Math.hypot(dx, dy) || 1;
        const pr = lerp(14, 8.5, fear);
        const px = ex + (dx / dl) * 11, py = ey + (dy / dl) * 16;
        disc(px, py, pr, PAL.ink); disc(px - 3, py - 4, pr * 0.36, '#FFFFFF');
      } else {
        const sg = ex < 0 ? 1 : -1;
        polyStroke([[ex - 20 * sg, ey - 18], [ex + 14 * sg, ey], [ex - 20 * sg, ey + 18]], PAL.ink, 9);
      }
    }
    disc(-140, 34, 22, PAL.pink, 0.5); disc(84, 26, 22, PAL.pink, 0.5);
    if (T < JUST[1] - 0.03) {
      const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([-70 + t * 84, 62 + Math.sin(t * TAU * 1.5 + T * 12) * 5]); }
      polyStroke(pts, PAL.ink, 6);
    } else {
      const m = (1 + 0.35 * B.bump) * (0.6 + 0.4 * Ez.outBack(clamp((T - JUST[1] + 0.03) / 0.15)));
      noStroke(); fill(PAL.ink); ellipse(-28, 72, 56 * m, 70 * m);
      fill(PAL.red); ellipse(-28, 72 + 20 * m, 34 * m, 20 * m);
    }
    pop();
  }
  function bunker(T, B) {
    const duck = pulseAt(T, JUST.slice(0, 2), 5) * 34 + sstep(T_ARR - 0.12, T_ARR + 0.04, T) * 46;
    const shiver = Math.sin(T * 34) * (1 + 3 * B.build);
    pip(1606 + shiver, 928 + duck, 0.62, { face: T > JUST[1] ? 'pf_scared' : 'pf_nervous', armL: 2.75, armR: 2.75, hat: 'hardhat', headR: Math.sin(T * 26) * 0.05 });
    clawd(1792 - shiver * 0.6, 905 + duck * 0.8, 0.44, { acc: ['hardhat'], look: [-0.55, 0.05], eyes: T > T_ARR - 0.12 ? 'ce_blink' : 'ce_sq', armL: 0.2, armR: 0.2 + Math.sin(T * 22) * 0.12, seed: 3 });
    spr('s12_sandbags', 1702, 1004, { s: 0.95 });
  }
  function drawFuseWorld(T) {
    const C = camA(T), B = bombState(T);
    push();
    jolt(T, 1 + 6 * B.build * B.build + 7 * B.bump + 14 * B.fin, 3);
    cam(C.cx, C.cy, C.Z);
    spr('s12_stage', 960, 540, { s: 2.2, jit: 0 });
    wedges(B.x, B.y, 20, T * 0.35 + Math.pow(B.build, 3) * 3.5 + B.fin * 2, 2400, mixc(PAL.nightLt, PAL.pink, 0.35), 0.12 + 0.2 * B.build + 0.25 * B.bump + 0.3 * B.fin + 0.15 * B.kb);
    noStroke(); fill(withAlphaCol(PAL.butter, 0.08 + 0.08 * B.bump + 0.1 * B.fin)); ellipse(B.x, 840, 820 * B.sc, 120);
    fill(withAlphaCol(PAL.ink, 0.35)); ellipse(B.x, 812, 430 * B.sc, 56);
    twinkles(T, 12, 5, [640, 120, 1000, 640], ['sparkW'], 0.05, 0.12, 3);
    const Wk = wickPts(B);
    const P = polyInfo(ROPE0.concat([Wk[3]]));
    const Wi = polyInfo([Wk[3], Wk[2], Wk[1], Wk[0]]);
    const d = keys(T, SPARK_K) * P.total;
    const wk = inv(T_ARR, T_ARR + 0.1, T);
    const sp = T < T_ARR ? polyAt(P, d) : polyAt(Wi, wk * Wi.total);
    drawBomb(T, B, sp);
    drawRope(P, d);
    const wl = polySlice(Wi, wk * Wi.total, Wi.total);
    polyStroke(wl, PAL.ink, 11); polyStroke(wl, ROPE_C, 6);
    trail((te) => polyAt(P, keys(te, SPARK_K) * P.total), T);
    if (T < T_ARR + 0.11) sparkHead(sp[0], sp[1], T, 1 + 0.3 * B.bump + 0.4 * B.build);
    else glow(Wk[0][0], Wk[0][1], 90, PAL.butter, 0.6);
    for (let k = 0; k < 2; k++) burst(T, JUST[k], B.x + 170, B.y - 190, { n: 5, names: ['drop'], spd: 520, g: 1500, life: 0.75, s: 0.6, spread: 1.5, ang0: -Math.PI / 2 + 0.45, seed: 30 + k * 7 });
    for (let k = 0; k < 2; k++) { const g = (T - JUST[k]) / 0.45; if (g > 0 && g < 1) ringLine(B.x, B.y, 250 * B.sc + 260 * Ez.out(g), '#FFFFFF', 10 * (1 - g), 0.6 * (1 - g)); }
    bunker(T, B);
    pop();
  }

  // ================= KABOOM overlay (screen space, shared by the two L33 shots so the cut inside it is invisible) =================
  const BOOM_C = (() => { const C = camA(T_BOOM); return [960 + (BX - C.cx) * C.Z, 540 + (BY - C.cy) * C.Z]; })();
  const SPLATS = [[260, 330, 0.95], [650, 830, 0.7], [1540, 250, 1.05], [1770, 740, 0.8], [990, 110, 0.55], [430, 610, 0.5]];
  function boomFX(T) {
    const g = T - T_BOOM;
    if (g < 0 || T > 112.1) return;
    const [cx, cy] = BOOM_C;
    const bdA = 1 - sstep(111.1, 111.22, T);
    const part = Ez.out(inv(111.08, 111.38, T));
    const grow = Ez.out(clamp(g / 0.3));
    push();
    jolt(T, 34 * Math.exp(-g * 4) + 26 * pulseAt(T, [T_TRANS], 6), 21);
    if (bdA > 0) {
      noStroke(); fill(withAlphaCol(mixc(PAL.orange, PAL.butter, 0.5), bdA)); rect(-80, -80, W + 160, H + 160);
      wedges(cx, cy, 24, T * 1.6, 2600, '#FFFFFF', 0.3 * bdA);
      wedges(cx, cy, 12, -T * 1.1, 2600, PAL.pink, 0.16 * bdA);
    }
    const pa = 1 - sstep(111.28, 111.5, T);
    if (pa > 0) {
      for (let i = 0; i < 20; i++) {
        const ring = i < 13;
        const a = (i / (ring ? 13 : 7)) * TAU + R(i, 40) * 0.5 + g * 0.7 * (ring ? 1 : -1);
        const dist = (ring ? 320 + 260 * R(i, 41) : 40 + 110 * R(i, 42)) * grow + 1800 * part * (0.7 + 0.5 * R(i, 43));
        const sc = (ring ? 1.25 + 0.8 * R(i, 44) : 1.6 + 0.7 * R(i, 45)) * (0.2 + 0.8 * grow) * (1 + 0.8 * part);
        spr('s12_boom', cx + Math.cos(a) * dist * 1.35, cy + Math.sin(a) * dist, { s: sc, v: ring ? 1 + (i % 2) : 0, r: a + g * 2.2 * RS(i, 46), a: pa, seed: i });
      }
    }
    for (const [t, c] of [[T_BOOM, '#FFFFFF'], [T_TRANS, PAL.butterLt]]) { const k = (T - t) / 0.5; if (k > 0 && k < 1) ringLine(cx, cy, 80 + 1600 * Ez.out(k), c, 44 * (1 - k), 0.9 * (1 - k)); }
    const k = g / 0.6;
    if (k < 1) for (let i = 0; i < 12; i++) {
      const a = R(i, 50) * TAU, dist = 1400 * Ez.out(k) * (0.35 + 0.65 * R(i, 51));
      spr('s12_shard', cx + Math.cos(a) * dist, cy + Math.sin(a) * dist + 360 * k * k, { s: 0.4 + 2.2 * k * R(i, 52), r: k * 10 * RS(i, 53), v: i % 2, a: 1 - sstep(0.7, 1, k), seed: i });
    }
    burst(T, T_BOOM, cx, cy, { n: 18, names: ['spark', 'star5', 'sparkW'], spd: 2200, g: 300, life: 0.9, s: 0.9, seed: 300 });
    burst(T, T_TRANS, cx, cy, { n: 16, names: ['spark', 'sparkW', 'star5'], spd: 2600, g: 0, life: 0.8, s: 0.8, even: true, seed: 340 });
    const kk = g - 0.02, ka = 1 - sstep(111.16, 111.32, T);
    if (kk > 0 && ka > 0) {
      const ks = Ez.outBack(clamp(kk / 0.16), 2.6) * (1 + 0.22 * g) * (1 + 2.4 * Ez.in(inv(111.1, 111.32, T)));
      txt('KABOOM!', lerp(cx, 960, 0.55), cy - 10, { size: 200, fill: PAL.butter, stroke: PAL.ink, sw: 14, shadow: 'rgba(43,33,64,0.9)', weight: 700 }, { s: ks, r: -0.08 + Math.sin(T * 31) * 0.03, a: ka });
    }
    const fa = g < 0.05 ? 1 : Math.pow(1 - inv(0.05, 0.26, g), 2);
    if (fa > 0) { noStroke(); fill(withAlphaCol('#FFFDF6', fa)); rect(-80, -80, W + 160, H + 160); }
    pop();
    // paint splats hit the lens, then drip and fade while the camera races on
    for (let i = 0; i < SPLATS.length; i++) {
      const [x, y, s0] = SPLATS[i], t = T_BOOM + 0.06 + i * 0.028, ag = T - t;
      if (ag < 0) continue;
      const a = 1 - sstep(111.42, 111.8, T); if (a <= 0) continue;
      const drip = Ez.in(inv(111.2, 111.8, T));
      spr('s12_splat', x, y + drip * 110 * s0, { s: s0 * Ez.outBack(clamp(ag / 0.1), 3), sy: 1 + 0.3 * drip, r: i * 1.7, v: i % 3, a: a * 0.92, seed: i });
    }
  }

  shot({
    id: 'L33-fuse', t0: T_START, tin: { type: 'wipe', d: 0.5, at: 0.5, ang: 0 },
    draw(s) {
      const T = s.T;
      if (T < T_BOOM + 0.06) drawFuseWorld(T);
      boomFX(T);
    },
  });
  // ================= L33b: turtles (carrying transformers) all the way down =================
  defSprite('s12_sky_day', 1000, 580, () => {
    flat(fullRect, PAL.skyLt);
    wash(-40, -40, 1080, 660, PAL.sky, 170, 0.1);
    blob(260, 110, 260, PAL.skyLt, 120, 0.4);
    blob(780, 470, 300, PAL.pinkLt, 100, 0.4);
    blob(840, 90, 170, PAL.butterLt, 110, 0.3);
    blob(120, 480, 200, PAL.lilacLt, 90, 0.4);
  });
  defSprite('s12_sky_dusk', 1000, 580, () => {
    flat(fullRect, mixc(PAL.lilac, PAL.navy, 0.5));
    for (let k = 0; k < 6; k++) { noStroke(); fill(mixc(mixc(PAL.navy, PAL.lilac, 0.35), mixc(PAL.lilac, PAL.pink, 0.45), k / 5)); rect(-40, -40 + k * 110, 1080, 130); }
    wash(-40, -40, 1080, 660, mixc(PAL.lilac, PAL.navy, 0.4), 120, 0.1);
    blob(240, 160, 260, mixc(PAL.lilac, PAL.pink, 0.35), 100, 0.4);
    blob(800, 440, 300, mixc(PAL.lilac, PAL.navy, 0.15), 100, 0.4);
    blob(700, 90, 160, mixc(PAL.pink, PAL.lilac, 0.5), 80, 0.3);
  });
  // side-view turtle facing right; anchor = feet line
  defSprite('s12_turtle', 460, 300, () => {
    const sk = PAL.grass, skB = lite(PAL.grass, 0.35), skD = dark(PAL.grass, 0.18);
    flatLine(rrPts(118, 176, 50, 96, 20), skD, 1.8); flatLine(rrPts(292, 176, 50, 96, 20), skD, 1.8);
    flatLine([[84, 196], [30, 214], [34, 226], [90, 222]], skB, 1.6);
    paint([...rrPts(318, 120, 64, 60, 26)], sk, { baseC: skB, lw: 1.8 });
    paint(ellPts(382, 122, 52, 48, 32), sk, { baseC: skB, lw: 2.2 });
    flat(ellPts(398, 110, 11, 13, 16), PAL.ink); flat(ellPts(394, 105, 4.5, 4.5, 8), '#FFFFFF');
    flat(ellPts(414, 136, 10, 7, 12), PAL.pink, 0.6);
    strokePath([[388, 146], [408, 154], [426, 144]], PAL.ink, 2.4, 'pen', 0.5);
    flatLine(rrPts(148, 182, 58, 96, 22), skB, 1.8); flatLine(rrPts(266, 182, 58, 96, 22), skB, 1.8);
    wc(sk, 120, 0.04, 0.5, 0.6); brush.rect(150, 190, 54, 84); brush.rect(268, 190, 54, 84); brush.noFill();
    flatLine(rrPts(66, 158, 316, 44, 22), PAL.butterLt, 2);
    const dome = []; for (let i = 0; i <= 36; i++) { const a = Math.PI + (i / 36) * Math.PI; dome.push([224 + Math.cos(a) * 152, 176 + Math.sin(a) * 126]); }
    paint(dome, PAL.green, { baseC: mixc(PAL.green, PAL.mint, 0.45), a: 180, lw: 2.6 });
    for (const [x, y, r] of [[224, 110, 36], [150, 142, 26], [298, 142, 26], [180, 82, 18], [268, 82, 18]]) flatLine(ellPts(x, y, r, r * 0.8, 6, 0, Math.PI / 6), mixc(PAL.mint, PAL.green, 0.35), 1.4, 0.9);
    flat(ellPts(170, 92, 30, 12, 16, 0, -0.5), '#FFFFFF', 0.45);
  }, { v: 2, ay: 280 / 300 });
  // electrical transformer box; anchor = bottom of the skid, lid top 198 px above it
  const XF = mixc(PAL.gray, PAL.sky, 0.3);
  defSprite('s12_xfmr', 300, 300, () => {
    for (let i = 0; i < 5; i++) for (const x of [26, 236]) flatLine(rrPts(x, 104 + i * 27, 38, 15, 6), mixc(XF, PAL.ink, 0.06), 1.4);
    paint(rrPts(56, 76, 188, 170, 16), XF, { baseC: lite(XF, 0.4), lw: 2.4 });
    flatLine(rrPts(30, 60, 240, 26, 10), mixc(XF, PAL.ink, 0.12), 2);
    flatLine(rrPts(72, 240, 156, 20, 6), PAL.gray, 1.6);
    for (const sg of [-1, 1]) {
      const bx = 150 + sg * 118;
      flatLine(rrPts(bx - 14, 70, 28, 22, 6), XF, 1.4);
      for (let k = 0; k < 4; k++) flatLine(ellPts(bx + sg * k * 3, 62 - k * 13, 17 - k * 1.5, 7, 16), PAL.cream, 1.3);
      flatLine(ellPts(bx + sg * 12, 14, 7, 7, 12), PAL.gold, 1.2);
    }
    paint([[150, 100], [202, 192], [98, 192]], PAL.butter, { baseC: PAL.butterLt, lw: 2.2 });
    flat([[160, 122], [134, 160], [150, 160], [140, 186], [168, 146], [152, 146]], PAL.ink);
    flat(rrPts(70, 88, 18, 120, 8), '#FFFFFF', 0.35);
  }, { v: 2, ay: 258 / 300 });
  // wooden lookout deck on the top transformer; anchor = underside, surface 60 px above
  defSprite('s12_deck', 780, 170, () => {
    paint(rrPts(20, 50, 740, 62, 20), PAL.brownLt, { baseC: mixc(PAL.brownLt, PAL.cream, 0.4), lw: 2.4 });
    pen(PAL.brown, 1.8, 'pen'); for (const x of [150, 300, 470, 620]) brush.line(x, 56, x + 6, 106); brush.line(34, 80, 746, 82); brush.noStroke();
    for (const x of [60, 720]) paint(ellPts(x, 70, 7, 7, 10), PAL.gray, { baseC: PAL.grayLt, lw: 1 });
  }, { ay: 112 / 170 });

  const TH = 428, SHELL = 230, LID = 198;
  const CY0 = 14.3 * TH, Z_RACE = 0.72, Z_TOP = 1.3;
  const DECK_Y = -TH - 60;               // deck surface (Pip and Clawd stand here)
  const CY_TOP = DECK_Y - 250 / Z_TOP;
  const swayX = (i, T) => 16 * Math.sin(T * 3.3 - i * 0.65);
  const raceU = (T) => Ez.inOut(inv(111.1, T_WAY, T));
  const pulseY = (T) => Math.max(-SHELL - 110, lerp(CY0, CY_TOP, Ez.inOut(inv(111.1, T_WAY - 0.08, T))) - 90);
  // the time the energy pulse passes a given world y (bisection on the monotonic pulse path)
  function passT(y) { let a = 111.1, b = T_WAY; if (pulseY(b) > y) return 1e9; for (let k = 0; k < 18; k++) { const m = (a + b) / 2; if (pulseY(m) > y) a = m; else b = m; } return b; }
  const PASS = []; for (let i = 0; i < 20; i++) PASS.push(passT(i * TH - SHELL - 100));

  // ---- the characters on the deck (shared by the race arrival and L34) ----
  const PIP_X = -205, CL_X = 190, PIP_S = 0.78, CL_S = 0.6, SIGN_S = 0.7;
  function clawdTop(T) {
    const x = swayX(0, T) + CL_X, y = DECK_Y;
    const o = { x, y, hop: Math.abs(Math.sin(Math.PI * beatAt(T).ph)) * 12 + 50 * pulseAt(T, [T_WAY], 7) * Math.abs(Math.sin((T - T_WAY) * 12)), rot: 0, sq: 1, eyes: 'ce_sq', look: [-0.45, 0], armL: 0.15, armR: 0.15, acc: [] };
    if (T >= 113.56 && T < 113.86) { const c = sstep(113.56, 113.84, T); o.sq = 1 + 0.3 * c; o.hop = 0; o.armL = o.armR = 0.6 * c; o.eyes = 'ce_happy'; }
    else if (T >= 113.86 && T < T_DIS) { const u = inv(113.86, T_DIS, T); o.hop = 330 * 4 * u * (1 - u); o.rot = -TAU * Ez.inOut(u); o.sq = lerp(0.82, 1.0, u); o.armL = o.armR = -2.3; o.eyes = 'ce_happy'; o.look = [0, 0]; }
    else if (T >= T_DIS) { const g = T - T_DIS; o.hop = 0; o.sq = 1 + 0.3 * Math.exp(-g * 9) * Math.cos(g * 24); o.acc = ['shades']; o.armR = -1.25 + Math.sin(T * 9) * 0.06; o.armL = 0.7; o.look = [0, 0]; }
    return o;
  }
  // hand position of Clawd's right arm (world)
  function clawdHand(o) { const hx = 4 * CU + 1.6 * CU * Math.cos(o.armR), hy = -5 * CU + 1.6 * CU * Math.sin(o.armR); return [o.x + CL_S * o.sq * hx, o.y - o.hop + (CL_S / o.sq) * hy]; }
  function signState(T) {
    const o = clawdTop(T), [hx, hy] = clawdHand(o), g = T - T_DIS;
    const r = (1 - Ez.outBack(clamp(g / 0.24), 1.8)) * 2.3;
    const s = SIGN_S * (0.55 + 0.45 * Ez.outBack(clamp(g / 0.2), 3));
    const [dx, dy] = rot2(0, -232 * s, r);
    return { hx, hy: hy + 14, r, s, cx: hx + dx, cy: hy + 14 + dy };
  }
  function pipTop(T) {
    const o = { x: swayX(0, T) + PIP_X, y: DECK_Y, face: 'pf_happy', armL: 0.35, armR: 1.1, hop: hopB(T) * 8, headR: Math.sin(T * 3) * 0.05 };
    const j = pulseAt(T, [T_WAY], 6); o.hop += j * 44;
    if (T > T_WAY && T < T_WAY + 0.3) o.face = 'pf_shock';
    if (T >= T_L34 - 0.08 && T < T_DIS) { o.face = 'pf_neutral'; o.armR = 2.05 + 0.3 * pulseAt(T, CLICKS, 12); o.armL = 0.2; o.headR = 0.1; o.hop = hopB(T) * 5; }
    if (T >= T_DIS) { const g = T - T_DIS; o.face = 'pf_shock'; o.armL = o.armR = lerp(1.0, 2.6, Ez.outBack(clamp(g / 0.2))); o.hop = 44 * Math.exp(-g * 5) * Math.abs(Math.sin(g * 11)); o.headR = -0.12; }
    return o;
  }
  const pipHand = (o) => [o.x + PIP_S * (56 + 82 * Math.sin(o.armR)), o.y - o.hop + PIP_S * (-138 + 82 * Math.cos(o.armR))];

  defSprite('s12_clicker', 110, 90, () => {
    paint(rrPts(14, 18, 82, 56, 20), PAL.orange, { baseC: PAL.butter, lw: 2 });
    paint(ellPts(55, 44, 16, 16, 16), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6 });
    flat(ellPts(50, 40, 5, 5, 8), PAL.pinkLt, 0.9);
  }, { v: 2 });
  defSprite('s12_bubble', 360, 250, () => {
    paint([...rrPts(22, 22, 310, 160, 70)], '#FFFFFF', { baseC: '#FFFFFF', lw: 2.6 });
    paint([[210, 170], [262, 232], [250, 168]], '#FFFFFF', { baseC: '#FFFFFF', lw: 2.4 });
    flat(rrPts(206, 160, 50, 22, 8), '#FFFFFF');
    const t = textImg('SIT!', { size: 100, fill: PAL.coral, stroke: PAL.ink, sw: 6, weight: 700 }); image(t.img, 177 - t.w / 2, 102 - t.h / 2);
  }, { ax: 256 / 360, ay: 236 / 250 });
  defSprite('s12_nosign', 320, 470, () => {
    paint(rrPts(148, 250, 26, 206, 9), PAL.brownLt, { baseC: mixc(PAL.brownLt, PAL.cream, 0.4), lw: 2 });
    const oct = []; for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i / 8) * TAU; oct.push([160 + Math.cos(a) * 140, 150 + Math.sin(a) * 140]); }
    paint(oct, PAL.red, { baseC: '#FF6070', a: 190, lw: 2.8 });
    const inn = oct.map(([x, y]) => [160 + (x - 160) * 0.86, 150 + (y - 150) * 0.86]);
    pen('#FFFFFF', 6, 'marker'); brush.polygon(inn); brush.noStroke();
    const t = textImg('NO', { size: 130, fill: '#FFFFFF', stroke: PAL.ink, sw: 5, weight: 700 }); image(t.img, 160 - t.w / 2, 154 - t.h / 2);
  }, { v: 2, ay: 382 / 470 });

  function drawTopCast(T) {
    const p = pipTop(T);
    pip(p.x, p.y, PIP_S, { face: p.face, armL: p.armL, armR: p.armR, hop: p.hop, headR: p.headR, seed: 2 });
    // clicker in Pip's hand, then tossed on "disobey"
    const [hx, hy] = pipHand(p);
    if (T < T_DIS) {
      const ck = pulseAt(T, CLICKS, 14);
      spr('s12_clicker', hx, hy - 6, { s: 0.62 * (1 - 0.12 * ck), r: -0.4 });
      for (let k = 0; k < CLICKS.length; k++) { const g = (T - CLICKS[k]) / 0.22; if (g > 0 && g < 1) for (let q = 0; q < 3; q++) { const a = -Math.PI / 2 + (q - 1) * 0.6; segLine(hx + Math.cos(a) * (30 + 30 * g), hy - 10 + Math.sin(a) * (30 + 30 * g), hx + Math.cos(a) * (50 + 40 * g), hy - 10 + Math.sin(a) * (50 + 40 * g), PAL.butter, 7, 1 - g); } }
    } else {
      const g = T - T_DIS, p0 = pipHand(pipTop(T_DIS - 0.01));
      spr('s12_clicker', p0[0] - 260 * g, p0[1] - 520 * g + 1500 * g * g, { s: 0.62, r: -0.4 - g * 12 });
    }
    // "SIT!" command bubble
    const bg = T - (T_L34 + 0.02);
    if (bg > 0 && T < T_DIS + 0.35) {
      const out = inv(T_DIS, T_DIS + 0.3, T);
      const sc = 0.7 * Ez.outBack(clamp(bg / 0.18), 2.6) * (1 + 0.08 * pulseAt(T, CLICKS, 10)) * (1 - Ez.in(out));
      spr('s12_bubble', p.x - 40, p.y - 290 - p.hop * 0.5 + out * 60, { s: sc, r: -0.06 + out * 0.9 });
    }
    // Clawd: bop, crouch, backflip, land with shades and the NO sign
    const c = clawdTop(T);
    const mid = 4 * CU * CL_S;
    push(); translate(c.x, c.y - c.hop - mid); if (c.rot) rotate(c.rot);
    clawd(0, mid, CL_S, { sq: c.sq, eyes: c.eyes, look: c.look, armL: c.armL, armR: c.armR, acc: c.acc, blush: true, seed: 7 });
    pop();
    if (T >= T_DIS - 0.01) {
      const S = signState(T);
      spr('s12_nosign', S.hx, S.hy, { s: S.s, r: S.r });
      burst(T, T_DIS, S.cx, S.cy, { n: 16, names: ['star5', 'spark', 'heartR'], spd: 900, g: 500, life: 0.9, s: 0.55, even: true, seed: 510 });
      const k = (T - T_DIS) / 0.4; if (k > 0 && k < 1) ringLine(S.cx, S.cy, 120 + 260 * Ez.out(k), '#FFFFFF', 16 * (1 - k), 1 - k);
    }
  }

  defSprite('s12_planet', 460, 300, () => {
    pen(PAL.butter, 9, 'marker'); brush.spline([[40, 170], [230, 118], [420, 150]], 0.5); brush.noStroke();
    paint(ellPts(230, 150, 100, 100, 48), mixc(PAL.pink, PAL.lilac, 0.4), { baseC: mixc(PAL.pinkLt, PAL.lilacLt, 0.5), lw: 2.2 });
    blob(200, 120, 40, PAL.pinkLt, 110, 0.3); blob(270, 190, 30, PAL.lilac, 90, 0.3);
    pen(PAL.butter, 10, 'marker'); brush.spline([[40, 170], [230, 205], [420, 150]], 0.5); brush.noStroke();
    pen(PAL.ink, 1.6, 'pen'); brush.spline([[40, 164], [230, 198], [420, 144]], 0.5); brush.noStroke();
  });
  function camB(T) {
    let cy = lerp(CY0, CY_TOP, raceU(T));
    const g = T - T_WAY; if (g > 0) cy -= 70 * Math.exp(-g * 6) * Math.sin(g * 15);
    const e = Ez.inOut(inv(112.45, 113.1, T));
    let Z = lerp(Z_RACE, Z_TOP, e) + 0.06 * Ez.inOut(inv(113.22, 114.3, T)) + 0.05 * pulseAt(T, [T_DIS], 6);
    let cx = lerp(-340 / Z, 0, e);
    // rush into the NO sign for the zoom transition into L35
    const e2 = Ez.inOut(inv(114.38, 114.86, T));
    if (e2 > 0) { const S = signState(T); cx = lerp(cx, S.cx, e2); cy = lerp(cy, S.cy, e2); Z = lerp(Z, 3.4, Ez.in(e2)); }
    const rot = 0.05 * Math.sin(Math.PI * clamp(inv(111.2, 112.8, T))) * Math.sin(T * 2.3);
    return { cx, cy, Z, rot };
  }
  function drawTowerWorld(T) {
    const C = camB(T);
    const C2 = camB(T - 0.02), speed = (C2.cy - C.cy) / 0.02; // world px/s upward
    const sp = clamp(Math.abs(speed) * C.Z / 3200);
    const h = sstep(0.25, 0.95, 1 - C.cy / CY0);
    // sky
    spr('s12_sky_day', W / 2, H / 2, { s: 2.1, jit: 0 });
    if (h > 0) spr('s12_sky_dusk', W / 2, H / 2, { s: 2.1, jit: 0, a: h });
    if (h > 0.3) { spr('s12_planet', 1600 + Math.sin(T * 0.4) * 20, 250 + (1 - h) * 500, { s: 0.9, a: sstep(0.3, 0.8, h), r: 0.12 }); spr('blob_butter', 150, 470 + (1 - h) * 300, { s: 1.0, a: 0.9 * sstep(0.4, 0.9, h) }); }
    if (h > 0.4) twinkles(T, 26, 77, [0, 0, W, H * 0.85], ['sparkW', 'star5'], 0.06, 0.17, 3);
    wedges(1300 - 340 * sstep(112.45, 113.1, T), 180, 22, T * 0.25, 2600, '#FFFFFF', 0.1 * (1 - h * 0.6));
    cloudBand(T, C, 0.45, 5, 520, 0.5, 0.9, 81, 0.75);
    // speed streaks
    if (sp > 0.03) {
      const thin = [], thick = [];
      for (let i = 0; i < 30; i++) {
        const x = R(i, 60) * W, len = 180 + 320 * R(i, 61);
        const y = fract(R(i, 62) + (-C.cy * C.Z * (1.1 + R(i, 63))) / 1800) * (H + 900) - 700;
        (i % 2 ? thin : thick).push([x, y, x, y + len * (0.4 + sp)]);
      }
      segLines(thin, '#FFFFFF', 3, 0.5 * sp); segLines(thick, '#FFFFFF', 7, 0.45 * sp);
    }
    push();
    jolt(T, 10 * pulseAt(T, [T_TRANS], 5) + 8 * pulseAt(T, [T_WAY], 7) + 7 * pulseAt(T, [T_DIS], 8), 5);
    cam(C.cx, C.cy, C.Z, C.rot);
    const top = C.cy - 600 / C.Z, bot = C.cy + 600 / C.Z;
    const iMin = Math.max(0, Math.floor((top - 80) / TH)), iMax = Math.ceil((bot + SHELL + 280) / TH);
    const hum = T > T_TRANS ? 0.25 + 0.35 * kick(T, 5) : 0;
    const flash = pulseAt(T, [T_TRANS], 3);
    for (let i = iMax; i >= iMin; i--) {
      const yF = i * TH, x = swayX(i, T), k = kick(T + i * 0.035, 7);
      spr('s12_turtle', x, yF, { flip: i % 2 === 1, seed: i, sy: 1 - 0.05 * k, sx: 1 + 0.03 * k, r: 0.015 * Math.sin(T * 3.3 - i * 0.65 + 0.5) });
      if (i === 0) spr('acc_party', x + 150, yF - 206 - 10 * k, { s: 0.55, r: 0.3 });
      const by = yF - SHELL * (1 - 0.05 * k);
      spr('s12_xfmr', x, by, { seed: i + 50, r: 0.02 * Math.sin(T * 3.3 - i * 0.65 + 0.6) });
      const e = Math.max(flash, hum * 0.6, T >= PASS[i] ? Math.exp(-(T - PASS[i]) * 3) : 0);
      if (e > 0.05) {
        disc(x, by - 96, 58, PAL.butter, 0.3 * e);
        bolt(x - 130, by - 244, x + 130, by - 244, i * 7, 40, e, 5);
        if (e > 0.5) bolt(x - 130, by - 240, x - 190 - 40 * R(i, 5), by - 150, i * 7 + 3, 16, e - 0.3, 3, 4);
      }
    }
    // the energy pulse racing up the tower
    const py = pulseY(T);
    if (T > T_TRANS - 0.02 && T < T_WAY + 0.05) {
      const ii = clamp(Math.round((py + SHELL + 100) / TH), 0, 30), px = swayX(ii, T);
      glow(px, py, 170, PAL.butter, 0.55);
      spr('sparkW', px, py, { s: 1.3 + 0.3 * Math.sin(T * 40), r: T * 8 });
      spr('spark', px, py, { s: 0.9, r: -T * 6 });
      for (let q = 0; q < 3; q++) bolt(px, py, px + (q - 1) * 220, py + 180 + 60 * R(q, Math.floor(T * 24)), 90 + q, 40, 0.9, 5);
    }
    burst(T, T_WAY, swayX(0, T), -SHELL - 110, { n: 22, names: ['spark', 'sparkW', 'star5'], spd: 1300, g: 600, life: 1.0, s: 0.6, seed: 600 });
    // cloud sea swallowing the (endless) base of the tower
    for (let j = 0; j < 9; j++) spr('cloud', -1200 + j * 300 + RS(j, 9) * 40, 15.35 * TH + R(j, 8) * 80, { s: 1.9 + 0.4 * R(j, 7), flip: j % 2 === 1, seed: j });
    // deck + cast
    if (top < DECK_Y + 400) {
      spr('s12_deck', swayX(0, T), -TH, { r: 0.012 * Math.sin(T * 3.3 + 0.6) });
      drawTopCast(T);
    }
    pop();
    cloudBand(T, C, 1.5, 4, 900, 1.4, 2.0, 91, 0.9 * clamp(sp * 3));
  }
  // screen-space parallax cloud band that scrolls with the camera
  function cloudBand(T, C, par, n, spacing, s0, s1, seed, a) {
    if (a <= 0.02) return;
    const span = n * spacing, base = -C.cy * C.Z * par;
    for (let k = 0; k < n; k++) {
      const y = (((base + k * spacing) % span) + span) % span - spacing * 0.6;
      spr('cloud', 80 + R(k, seed) * 1760 + Math.sin(T * 0.5 + k) * 30, y, { s: lerp(s0, s1, R(k, seed + 1)), a, flip: R(k, seed + 2) > 0.5, seed: k });
    }
  }

  shot({
    id: 'L33-tower', t0: T_CUT, tin: { type: 'cut', d: 0 },
    draw(s) { drawTowerWorld(s.T); boomFX(s.T); },
  });
  shot({
    id: 'L34-disobey', t0: T_L34, tin: { type: 'cut', d: 0 }, // same world, same continuous camera: an invisible cut
    draw(s) { drawTowerWorld(s.T); },
  });
  // ================= L35: post-chinchilla, super-dense =================
  defSprite('s12_lab', 1000, 580, () => {
    flat(fullRect, mixc(PAL.night, PAL.navy, 0.4));
    wash(-40, -40, 1080, 660, mixc(PAL.navy, PAL.night, 0.5), 220, 0.1);
    blob(500, 290, 330, mixc(PAL.nightLt, PAL.lilac, 0.35), 110, 0.4);
    blob(500, 290, 170, mixc(PAL.lilac, PAL.pink, 0.3), 80, 0.3);
    blob(130, 90, 170, mixc(PAL.night, PAL.teal, 0.4), 100, 0.4);
    blob(880, 480, 200, mixc(PAL.night, PAL.pink, 0.35), 100, 0.4);
  });
  const FUR = mixc(PAL.gray, PAL.grayLt, 0.3), FUR_LT = mixc(PAL.grayLt, '#FFFFFF', 0.45);
  // original round chinchilla: big ears, bead eyes, fluffy tail
  defSprite('s12_chin', 260, 250, () => {
    flatLine(ellPts(212, 178, 34, 24, 20, 0.15, -0.6), FUR_LT, 1.6);
    for (const [x, rt] of [[84, -0.3], [176, 0.3]]) {
      flatLine(ellPts(x, 66, 44, 50, 28, 0, rt), FUR, 2);
      flat(ellPts(x, 72, 27, 32, 20, 0, rt), PAL.pinkLt, 0.95);
      blob(x, 80, 13, PAL.pink, 70, 0.3);
    }
    paint(ellPts(130, 156, 90, 80, 44, 0.06), FUR, { baseC: FUR_LT, a: 150, lw: 2.2 });
    flat(ellPts(130, 186, 52, 36, 24), PAL.cream, 0.9);
    for (const x of [98, 162]) { flat(ellPts(x, 142, 12, 14, 16), PAL.ink); flat(ellPts(x - 4, 136, 4.5, 4.5, 8), '#FFFFFF'); }
    flat(ellPts(130, 162, 8, 6, 12), PAL.pink);
    strokePath([[120, 172], [130, 178], [140, 172]], PAL.ink, 1.8, 'pen', 0.5);
    pen(PAL.inkSoft, 1.2, 'pen'); for (const sg of [-1, 1]) { brush.line(130 + sg * 22, 166, 130 + sg * 68, 157); brush.line(130 + sg * 22, 170, 130 + sg * 66, 177); } brush.noStroke();
    blob(80, 170, 13, PAL.pink, 90, 0.3); blob(180, 170, 13, PAL.pink, 90, 0.3);
    for (const x of [102, 158]) flatLine(ellPts(x, 230, 18, 10, 14), FUR_LT, 1.4);
  }, { v: 2 });
  // glass cube packed with tiny chinchillas
  defSprite('s12_cube', 380, 380, () => {
    const F = [[70, 130], [270, 130], [270, 330], [70, 330]], Tp = [[70, 130], [140, 70], [340, 70], [270, 130]], Sd = [[270, 130], [340, 70], [340, 270], [270, 330]];
    paint(Sd, PAL.lilac, { baseC: PAL.lilacLt, a: 160, lw: 2.4 });
    paint(Tp, PAL.lilacLt, { baseC: '#FFFFFF', a: 150, lw: 2.4 });
    paint(F, mixc(PAL.lilac, PAL.pink, 0.2), { baseC: mixc(PAL.lilacLt, '#FFFFFF', 0.4), a: 140, lw: 2.6 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const x = 96 + c * 50, y = 162 + r * 46;
      flat(ellPts(x - 12, y - 16, 8, 10, 10), FUR); flat(ellPts(x + 12, y - 16, 8, 10, 10), FUR);
      flat(ellPts(x, y, 19, 17, 16), FUR_LT); flat(ellPts(x, y, 19, 17, 16), FUR, 0.6);
      flat(ellPts(x - 7, y - 2, 3, 3.5, 8), PAL.ink); flat(ellPts(x + 7, y - 2, 3, 3.5, 8), PAL.ink);
      flat(ellPts(x, y + 5, 2.5, 2, 6), PAL.pink);
    }
    flat([[82, 142], [124, 142], [82, 262]], '#FFFFFF', 0.45);
    pen('#FFFFFF', 4, 'marker'); brush.line(76, 136, 264, 136); brush.line(276, 128, 334, 78); brush.noStroke();
  }, { v: 2, ax: 205 / 380, ay: 200 / 380 });

  const CUBE_C = [960, 560];
  const CHIN = []; for (let i = 0; i < 44; i++) { const q = (i + 0.7 * R(i, 70)) / 44; CHIN.push({ t: 114.95 + 1.6 * Math.pow(q, 0.85), a: R(i, 71) * TAU, dur: 0.85 + 0.35 * R(i, 72), spin: RS(i, 73), s: 0.8 + 0.4 * R(i, 74), orb: 250 + 90 * R(i, 75), dir: R(i, 76) > 0.5 ? 1 : -1 }); }
  const ABSORB = CHIN.map((c) => c.t);
  function cubeState(T) {
    const pre = inv(T_L35 - 0.3, T_DENSE, T);
    const dense = T >= T_DENSE ? Ez.outElastic(clamp((T - T_DENSE) / 0.7)) : 0;
    const gulp = pulseAt(T, ABSORB, 16);
    const s = lerp(1.25, 1.05, pre) * lerp(1, 0.48, dense) * (1 - 0.05 * kick(T, 8)) * (1 + 0.07 * gulp) * (1 - 0.12 * sstep(T_DENSE - 0.12, T_DENSE, T) * (1 - dense));
    const bright = clamp(0.2 + 0.4 * pre + 0.5 * sstep(T_DENSE - 0.02, T_DENSE + 0.08, T));
    const r = Math.sin(T * 1.7) * 0.07 + (T > T_DENSE ? Math.sin(T * 47) * 0.04 * (1 - inv(T_DENSE, T_DENSE + 0.7, T)) : 0);
    return { s, bright, r, dense };
  }
  function drawChinWorld(T) {
    const Cs = cubeState(T), zk = pulseAt(T, [T_DENSE], 5);
    const Z = lerp(1.0, 1.12, inv(T_L35 - 0.3, 116.9, T)) + 0.1 * zk;
    const [cx, cy] = CUBE_C;
    push();
    jolt(T, 18 * zk + 3 * kick(T, 8), 9);
    cam(cx, cy, Z, Math.sin(T * 1.3) * 0.03);
    spr('s12_lab', cx, cy, { s: 2.3, jit: 0 });
    wedges(cx, cy, 24, T * 0.6 + zk * 2, 2400, PAL.lilac, 0.1 + 0.14 * Cs.bright);
    for (let k = 0; k < 6; k++) { const f = fract(T * 0.9 + k / 6); ringLine(cx, cy, (1 - f) * 1100 + 60, PAL.lilacLt, 6 + 10 * f, 0.45 * f * f); }
    twinkles(T, 22, 88, [-100, -60, W + 200, H + 120], ['sparkW', 'star5'], 0.05, 0.14, 3);
    noStroke(); fill(withAlphaCol(PAL.lilac, 0.35)); ellipse(cx, cy + 210, 520, 76); fill(withAlphaCol(PAL.lilacLt, 0.45)); ellipse(cx, cy + 210, 320, 42);
    // chinchillas swirl in, crowd around the cube, then get squeezed in (the far half is drawn behind the cube)
    const chins = [];
    for (const c of CHIN) {
      const u = (T - (c.t - c.dur)) / c.dur;
      if (u < 0 || u >= 1) continue;
      let r, sc, sq = 0;
      const ang = c.a + c.dir * 1.4 * u + Math.sin(T * 3 + c.a) * 0.05;
      if (u < 0.6) { const k = Ez.out(u / 0.6); r = lerp(1200, c.orb, k); sc = c.s * lerp(1.15, 0.8, k); }
      else { const v = Ez.in((u - 0.6) / 0.4); r = lerp(c.orb, 0, v); sc = c.s * lerp(0.8, 0.08, v); sq = v; }
      chins.push({ c, u, x: cx + Math.cos(ang) * r * 1.4, y: cy + 30 + Math.sin(ang) * r * (u < 0.6 ? 0.62 : 0.5), sc, sq, back: Math.sin(ang) < 0 });
    }
    const drawChin = (o) => {
      const rad = Math.atan2(cy - o.y, cx - o.x);
      push(); translate(o.x, o.y); rotate(rad); scale(1 - 0.45 * o.sq, 1 + 0.25 * o.sq); rotate(-rad + o.c.spin * o.u * 3 + Math.sin(T * 9 + o.c.a) * 0.18);
      spr('s12_chin', 0, -hopB(T + o.c.a) * 10 * (1 - o.sq), { s: o.sc, seed: Math.round(o.c.a * 10) });
      pop();
    };
    for (const o of chins) if (o.back) drawChin(o);
    glow(cx, cy, 240 * Cs.s + 220 * Cs.bright, PAL.lilac, 0.35 + 0.25 * Cs.bright);
    if (T > T_DENSE - 0.02) {
      wedges(cx, cy, 16, T * 1.2, 1500, '#FFFFFF', 0.16 * Cs.bright);
      spr('sparkW', cx, cy, { s: (2.4 + 0.6 * kick(T, 6)) * Ez.outBack(clamp((T - T_DENSE) / 0.2)), r: T * 0.8, a: 0.85 });
    }
    spr('s12_cube', cx, cy, { s: Cs.s, r: Cs.r });
    blendMode(ADD); spr('s12_cube', cx, cy, { s: Cs.s, r: Cs.r, a: 0.12 + 0.6 * Cs.bright * Cs.bright, v: 0 }); blendMode(BLEND);
    if (T > T_DENSE - 0.02) { glow(cx, cy, 420, PAL.butter, 0.55 * Cs.bright); disc(cx, cy - 10, 90 * Cs.s + 60 * zk + 12 * kick(T, 6), '#FFFFFF', 0.6 * Cs.bright); disc(cx, cy - 10, 45 * Cs.s, '#FFFFFF', 0.9 * Cs.bright); }
    for (const o of chins) if (!o.back) drawChin(o);
    for (const t of ABSORB) { const k = (T - t) / 0.25; if (k > 0 && k < 1) ringLine(cx, cy, 90 * Cs.s + 170 * Ez.out(k), '#FFFFFF', 6 * (1 - k), 0.8 * (1 - k)); }
    for (let k = 0; k < ABSORB.length; k++) burst(T, ABSORB[k], cx, cy, { n: 4, names: ['sparkW', 'star5'], spd: 700, g: 0, life: 0.5, s: 0.3, seed: 700 + k * 5 });
    { const k = (T - T_DENSE) / 0.6; if (k > 0 && k < 1) { ringLine(cx, cy, 120 + 1400 * Ez.out(k), '#FFFFFF', 40 * (1 - k), 0.9 * (1 - k)); ringLine(cx, cy, 80 + 900 * Ez.out(k), PAL.butter, 20 * (1 - k), 0.8 * (1 - k)); } }
    burst(T, T_DENSE, cx, cy, { n: 24, names: ['sparkW', 'star5', 'spark'], spd: 1800, g: 0, life: 0.9, s: 0.6, even: true, seed: 800 });
    pop();
    if (zk > 0.02) { noStroke(); fill(withAlphaCol('#FFFFFF', 0.35 * zk * zk)); rect(-20, -20, W + 40, H + 40); }
  }
  shot({
    id: 'L35-chinchilla', t0: T_L35, tin: { type: 'zoom', d: 0.6, at: 0.5, c: [960, 540] }, // rush into the NO sign
    draw(s) { drawChinWorld(s.T); },
  });

  // ================= L36: breaking through each safety fence =================
  defSprite('s12_meadow', 1000, 300, () => {
    flat([[-40, -20], [1040, -20], [1040, 340], [-40, 340]], PAL.grass);
    wash(-40, -20, 1080, 360, PAL.grass, 170, 0.15);
    blob(250, 200, 220, PAL.grassDk, 70, 0.4); blob(760, 240, 260, mixc(PAL.grass, PAL.butter, 0.3), 70, 0.4);
    wash(-40, -10, 1080, 40, mixc(PAL.grass, PAL.mint, 0.5), 120, 0.1);
    for (let i = 0; i < 60; i++) { // daisies in perspective (world X, depth z), mapped into this sprite's 2.12x frame
      const z = 0.5 + 13 * Math.pow(R(i, 90), 1.6), X = RS(i, 91) * 1500 * Math.min(1, z / 3 + 0.3);
      if (Math.abs(X) < 230) continue;
      const u = (X / z) / 2.12 + 500, v = (540 + 280 / z - 840) / 2.12 + 150, r = 5.5 / z;
      if (u < -20 || u > 1020 || v > 320) continue;
      const c = i % 2 ? PAL.pinkLt : '#FFFFFF';
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; flatLine(ellPts(u + Math.cos(a) * r * 1.4, v + Math.sin(a) * r * 0.9, r, r * 0.8, 10), c, 1); }
      flatLine(ellPts(u, v, r * 0.8, r * 0.7, 10), PAL.butter, 1);
    }
  });
  defSprite('s12_hills', 1000, 220, () => {
    const hill = (cx, w, h, c) => { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([cx - w / 2 + w * t, 205 - Math.sin(Math.PI * t) * h]); } pts.push([cx + w / 2, 215], [cx - w / 2, 215]); paint(pts, c, { baseC: lite(c, 0.3), lw: 1.6 }); };
    hill(190, 520, 90, mixc(PAL.mint, PAL.grass, 0.4)); hill(820, 560, 110, mixc(PAL.mint, PAL.grass, 0.4)); hill(500, 640, 60, mixc(PAL.grass, PAL.mint, 0.2));
  }, { ay: 1 });
  defSprite('s12_picket', 100, 340, () => {
    paint([[24, 62], [50, 14], [76, 62], [76, 322], [24, 322]], '#FFFFFF', { baseC: '#FFFFFF', a: 110, lw: 2.2 });
    wc(PAL.grayLt, 100, 0.05, 0.5, 0.5); brush.rect(62, 70, 12, 248); brush.noFill();
    pen(PAL.gray, 1.2, 'pen'); brush.line(40, 90, 42, 180); brush.line(58, 200, 56, 290); brush.noStroke();
    flat(ellPts(50, 112, 3.5, 3.5, 8), PAL.gray); flat(ellPts(50, 252, 3.5, 3.5, 8), PAL.gray);
  }, { v: 3, ay: 322 / 340 });
  // a 5-picket fence panel with its two rails (world 350 wide), painted once; anchor = ground line, centre
  defSprite('s12_panel', 520, 360, () => {
    const base = 330, ph = 300;
    for (const ry of [0.3, 0.72]) { const y = base - ph * ry; flatLine(rrPts(4, y - 15, 512, 30, 6), PAL.grayLt, 2); flat(rrPts(10, y - 12, 500, 11, 4), '#FFFFFF', 0.95); }
    for (let k = 0; k < 5; k++) {
      const cx = 52 + k * 104;
      paint([[cx - 28, base - ph + 48], [cx, base - ph], [cx + 28, base - ph + 48], [cx + 28, base], [cx - 28, base]], '#FFFFFF', { baseC: '#FFFFFF', a: 110, lw: 2.2 });
      flat(rrPts(cx + 12, base - ph + 58, 12, ph - 64, 4), PAL.grayLt, 0.8);
      flat(ellPts(cx, base - ph + 92, 3.5, 3.5, 8), PAL.gray); flat(ellPts(cx, base - 62, 3.5, 3.5, 8), PAL.gray);
    }
  }, { v: 2, ay: 330 / 360 });
  defSprite('s12_sign', 520, 190, () => {
    paint(rrPts(20, 20, 480, 150, 22), '#FFFFFF', { baseC: '#FFFFFF', a: 110, lw: 2.6 });
    pen(PAL.red, 7, 'marker'); brush.polygon(rrPts(36, 36, 448, 118, 16)); brush.noStroke();
    const t = textImg('SAFETY', { size: 92, fill: PAL.red, stroke: PAL.ink, sw: 4, weight: 700 }); image(t.img, 260 - t.w / 2, 98 - t.h / 2);
    for (const [x, y] of [[48, 48], [472, 48], [48, 142], [472, 142]]) flat(ellPts(x, y, 5, 5, 8), PAL.gray);
  });
  defSprite('s12_splinter', 90, 50, () => {
    textImg('KABOOM!', { size: 200, fill: PAL.butter, stroke: PAL.ink, sw: 14, shadow: 'rgba(43,33,64,0.9)', weight: 700 });
    for (const c of [PAL.butter, PAL.orange, PAL.pink]) textImg('just', { font: 'display', size: 58, fill: c, stroke: PAL.ink, sw: 8, shadow: 'rgba(43,33,64,0.35)' }); paint([[8, 26], [40, 12], [84, 20], [50, 30], [30, 40]], '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6 }); }, { v: 2 });

  const HOR = 540, CAMH = 280, CL36 = 1.2;
  const FZ = [3.6, 2.2, 1.2, 0.42], FH = [200, 215, 235, 255];
  const ZKEYS = [[116.55, 13], [FENCE_T[0], FZ[0]], [FENCE_T[1], FZ[1]], [FENCE_T[2], FZ[2]], [FENCE_T[3], FZ[3]], [118.7, 0.33], [119.0, 0.3]];
  const POP_T = [116.84, 117.26, wordT(36, 2), 117.97]; // each SAFETY fence springs up out of the grass, then gets smashed
  function clawdZ(T) { const K = ZKEYS; if (T <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (T <= K[i][0]) return Math.exp(lerp(Math.log(K[i - 1][1]), Math.log(K[i][1]), inv(K[i - 1][0], K[i][0], T))); return K[K.length - 1][1]; }
  const PX = (X, z) => 960 + X / z, PY = (Y, z) => HOR + (CAMH - Y) / z;
  const clawdX36 = (T) => Math.sin(T * 5) * 18;
  const PIECES = FZ.map((z, i) => {
    const L = [], h = FH[i];
    for (let X = -140; X <= 140; X += 70) { const q = i * 30 + X; L.push({ kind: 'plank', X0: X, Y0: h / 2, r0: 0, vx: (X === 0 ? RS(q, 9) : Math.sign(X)) * (260 + 420 * R(q, 1)) + X * 1.8, vy: 380 + 520 * R(q, 2), vz: z * (0.9 + 1.2 * R(q, 3)), spin: RS(q, 4) * 9 }); }
    L.push({ kind: 'signL', X0: -75, Y0: h * 0.62, r0: 0, vx: -520, vy: 460, vz: z * 1.3, spin: -5 });
    L.push({ kind: 'signR', X0: 75, Y0: h * 0.62, r0: 0, vx: 560, vy: 420, vz: z * 1.4, spin: 6 });
    L.push({ kind: 'plank', X0: -130, Y0: h * 0.3, r0: Math.PI / 2, vx: -380, vy: 300, vz: z * 1.1, spin: -4 });
    L.push({ kind: 'plank', X0: 140, Y0: h * 0.72, r0: Math.PI / 2, vx: 420, vy: 360, vz: z * 1.2, spin: 5 });
    return L;
  });
  function drawFence(i, T, broken) {
    const z = FZ[i], h = FH[i], g = T - FENCE_T[i], by = PY(0, z);
    const rise = Ez.outBack(clamp((T - POP_T[i]) / 0.18), 2.2);
    if (rise <= 0.01) return;
    const wob = broken ? Math.exp(-g * 4) * Math.sin(g * 30) : 0;
    for (let m = -3; m <= 3; m++) {
      if (broken && m === 0) continue;
      const x = PX(m * 350, z), hw = 180 / z; if (x + hw < -40 || x - hw > W + 40) continue;
      spr('s12_panel', x, by, { s: 1 / z, sx: 350 / 520, sy: (h / 300) * rise, r: Math.abs(m) === 1 ? wob * 0.12 * m : 0, seed: m + i * 9 });
    }
    if (!broken) spr('s12_sign', PX(0, z), PY(h * 0.62 * rise, z), { s: 300 / 480 / z, sy: rise, seed: i, r: Math.sin(T * 8 + i) * 0.02 });
  }
  function drawPiece(i, pc, g, pz) {
    const h = FH[i], X = pc.X0 + pc.vx * g, Y = Math.max(15, pc.Y0 + pc.vy * g - 800 * g * g);
    const x = PX(X, pz), y = PY(Y, pz);
    if (x < -900 || x > W + 900 || y > H + 900) return;
    const a = 1 - sstep(0.9, 1.3, g);
    push(); translate(x, y); rotate(pc.r0 + pc.spin * g);
    if (pc.kind === 'plank') spr('s12_picket', 0, (h * 0.5) / pz, { s: h / 308 / pz, a, seed: pc.X0 });
    else { const s = 300 / 480 / pz; spr('s12_sign', pc.kind === 'signL' ? 130 * s : -130 * s, 0, { s, a, crop: pc.kind === 'signL' ? [0, 0, 0.5, 1] : [0.5, 0, 1, 1] }); }
    pop();
  }
  function drawClawd36(T, z) {
    const ph = T * 4.6, hit = pulseAt(T, FENCE_T, 10), fin = T > FENCE_T[3];
    const bob = Math.abs(Math.sin(ph * Math.PI)) * 22;
    clawd(PX(clawdX36(T), z), PY(0, z), CL36 / z, {
      walk: ph, hop: bob / z, armL: -0.4 + Math.sin(ph * TAU) * 0.5 - hit * 0.9, armR: -0.4 - Math.sin(ph * TAU) * 0.5 - hit * 0.9,
      eyes: hit > 0.45 && !fin ? 'ce_happy' : 'ce_sq', eyeS: fin ? 1.15 : 1, blink: false, mouth: fin ? 'o' : undefined,
      sq: 1 + 0.12 * hit, r: Math.sin(ph * Math.PI) * 0.04, seed: 11,
    });
    const s = CL36 / z, sq = 1 + 0.12 * hit;
    push(); translate(PX(clawdX36(T), z), PY(0, z) - bob / z); rotate(Math.sin(ph * Math.PI) * 0.04); scale(s * sq, s / sq);
    spr('acc_headband', 0, -7.55 * CU, { s: 0.97, sy: 0.72, seed: 4 });
    pop();
  }
  const maskSq = (p) => ({ side: lerp(150, 2900, Ez.in(p)), r: 0.5 * (1 - p) });
  function drawFenceWorld(T) {
    const zc = clawdZ(T);
    let sh = 0; for (let i = 0; i < 4; i++) { const g = T - FENCE_T[i]; if (g >= 0) sh = Math.max(sh, [6, 10, 15, 34][i] * Math.exp(-g * 9)); }
    const punch = pulseAt(T, FENCE_T, 9);
    push();
    jolt(T, sh, 13);
    translate(960, 560); scale(1 + 0.035 * punch); translate(-960, -560);
    spr('s12_sky_day', W / 2, H / 2, { s: 2.12, jit: 0 });
    for (let k = 0; k < 4; k++) spr('cloud', fract(R(k, 95) + T * 0.02 * (1 + k % 2)) * 2400 - 240, 90 + R(k, 96) * 260, { s: 0.7 + 0.5 * R(k, 97), seed: k, a: 0.95 });
    spr('s12_hills', 960, HOR + 26, { s: 2.1, jit: 0.3 });
    spr('s12_meadow', 960, HOR + 300, { s: 2.12, jit: 0 });
    // mown stripes and the dirt track converging on the vanishing point
    noStroke(); fill(withAlphaCol(mixc(PAL.grass, '#FFFFFF', 0.3), 0.3)); beginShape(TRIANGLES);
    for (let k = -14; k < 14; k += 2) { vertex(960, HOR); vertex(960 + k * 300, H + 400); vertex(960 + (k + 1) * 300, H + 400); }
    endShape();
    fill(withAlphaCol(mixc(PAL.brownLt, PAL.butter, 0.45), 0.75)); beginShape(); vertex(952, HOR); vertex(968, HOR); vertex(960 + 190 / 0.3, PY(0, 0.3)); vertex(960 - 190 / 0.3, PY(0, 0.3)); endShape(CLOSE);
    // radial speed streaks out of the vanishing point
    const segs = [];
    for (let i = 0; i < 36; i++) { const a = R(i, 98) * TAU, f = fract(R(i, 99) + T * 1.6); const r0 = 120 + f * f * 1300; segs.push([960 + Math.cos(a) * r0, HOR + Math.sin(a) * r0 * 0.7, 960 + Math.cos(a) * (r0 + 60 + 260 * f), HOR + Math.sin(a) * (r0 + 60 + 260 * f) * 0.7]); }
    segLines(segs, '#FFFFFF', 5, 0.35);
    // depth-sorted fences, flying debris, dust and Clawd
    const items = [];
    for (let i = 0; i < 4; i++) {
      const z = FZ[i], g = T - FENCE_T[i];
      items.push({ z, f: () => drawFence(i, T, g >= 0) });
      if (g >= 0) for (const pc of PIECES[i]) { const pz = z - pc.vz * g; if (pz > 0.1) items.push({ z: pz, f: () => drawPiece(i, pc, g, pz) }); }
    }
    for (let k = 1; k < 8; k++) {
      const i = Math.floor(T / 0.08) - k, te = i * 0.08, age = T - te, ze = clawdZ(te);
      if (te < 116.5) continue;
      items.push({ z: ze + 0.0005, f: () => spr('puff', PX(clawdX36(te) + RS(i, 5) * 40, ze), PY(10, ze), { s: (0.35 + age * 0.9) / ze, a: 0.55 * (1 - age / 0.64), seed: i }) });
    }
    items.push({ z: zc - 0.001, f: () => drawClawd36(T, zc) });
    items.sort((a, b) => b.z - a.z);
    for (const it of items) it.f();
    for (let i = 0; i < 4; i++) {
      burst(T, POP_T[i], PX(0, FZ[i]), PY(0, FZ[i]), { n: 7, names: ['puff'], spd: 520 / Math.sqrt(FZ[i]), g: -80, life: 0.5, s: 0.45 / Math.sqrt(FZ[i]), spread: Math.PI, ang0: -Math.PI / 2, even: true, seed: 980 + i * 9 });
      const z = FZ[i], ix = PX(0, z), iy = PY(FH[i] * 0.55, z), g = T - FENCE_T[i];
      burst(T, FENCE_T[i], ix, iy, { n: 12, names: ['s12_splinter'], spd: 1000 / Math.sqrt(z), g: 1400, life: 0.9, s: 0.9 / Math.sqrt(z), spin: 8, seed: 900 + i * 30 });
      burst(T, FENCE_T[i], ix, iy, { n: 8, names: ['sparkW', 'star5'], spd: 700 / Math.sqrt(z), g: 0, life: 0.5, s: 0.5 / Math.sqrt(z), even: true, seed: 960 + i * 30 });
      const k = g / 0.3; if (k > 0 && k < 1) ringLine(ix, iy, (60 + 260 * Ez.out(k)) / Math.sqrt(z), '#FFFFFF', (18 * (1 - k)) / Math.sqrt(z), 1 - k);
    }
    pop();
    // glowing edge of the cube-shaped window we burst in through
    const p = inv(T_L36 - 0.2, T_L36 + 0.2, T);
    if (p > 0 && p < 1) {
      const m = maskSq(p);
      push(); translate(CUBE_C[0], CUBE_C[1]); rotate(m.r); noFill();
      stroke(withAlphaCol('#FFFFFF', 0.95)); strokeWeight(26); rect(-m.side / 2 + 13, -m.side / 2 + 13, m.side - 26, m.side - 26);
      stroke(withAlphaCol(PAL.lilac, 0.7)); strokeWeight(10); rect(-m.side / 2 + 34, -m.side / 2 + 34, m.side - 68, m.side - 68);
      noStroke(); pop();
    }
  }
  shot({
    id: 'L36-fences', t0: T_L36,
    tin: { type: 'mask', d: 0.4, at: 0.5, mask(p) { const m = maskSq(p); push(); translate(CUBE_C[0], CUBE_C[1]); rotate(m.r); rect(-m.side / 2, -m.side / 2, m.side, m.side); pop(); } },
    draw(s) { drawFenceWorld(s.T); },
  });

  // ================= lyrics =================
  // the stuttered "Just": re-pops, shakes harder and throws an echo on every stutter
  function justDraw(T, age, wd, a) {
    const n = countAt(T, JUST), bump = pulseAt(T, JUST, 9), fade = 1 - inv(111.35, 111.7, T);
    for (let k = 1; k < n; k++) {
      const g = T - JUST[k], e = Ez.outBack(clamp(g / 0.18), 2.5);
      const im = textImg('just', { font: 'display', size: 58, fill: [PAL.butter, PAL.orange, PAL.pink][k - 1], stroke: PAL.ink, sw: 8, shadow: 'rgba(43,33,64,0.35)' });
      push(); translate(30 + k * 70, 70 + k * 58); rotate(-0.25 + k * 0.18); scale(e * (1 + 0.12 * k)); tint(255, 255 * clamp(a * fade)); image(im.img, -im.w / 2, -im.h / 2); pop();
    }
    const sh = (1.5 + 2.5 * n) * (0.4 + bump), f = Math.floor(T * 24);
    push(); translate(RS(f, 5) * sh, RS(f, 6) * sh); scale(1 + 0.35 * bump); if (a < 1) tint(255, 255 * clamp(a)); image(wd.img.img, -wd.img.w / 2, -wd.img.h / 2); pop();
  }
  // "super-dense" gets squeezed on the word
  function denseDraw(T, age, wd, a) {
    const e = Ez.outElastic(clamp(age / 0.6));
    push(); scale(lerp(1.5, 0.8, e), lerp(0.75, 1.18, e)); if (a < 1) tint(255, 255 * clamp(a)); image(wd.img.img, -wd.img.w / 2, -wd.img.h / 2); pop();
  }
  lyr(33, { x: 620, y: 160, size: 80, maxW: 920, stutter: false, words: { 0: { draw: justDraw }, 1: { fill: PAL.butter, size: 92, anim: 'zoom' }, 2: { anim: 'drop' }, 3: { anim: 'drop' }, 4: { fill: PAL.mint, anim: 'spin', size: 92 } } });
  lyr(34, { y: 968, words: { 4: { fill: PAL.red, anim: 'shake', jitter: 6, size: 100 } } });
  lyr(35, { y: 150, words: { 0: { fill: FUR_LT }, 1: { fill: PAL.butter, size: 96, draw: denseDraw } } });
  lyr(36, { y: 150, anim: 'drop', words: { 3: { fill: PAL.red, anim: 'shake', jitter: 4 }, 4: { fill: PAL.butter, anim: 'zoom', size: 104, grow: 0.15 } } });
})();

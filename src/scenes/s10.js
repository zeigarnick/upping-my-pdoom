// s10.js - Breakdown: Gato, the quiet P(doom) lantern, paperclips fill the room, killswitch guys on PTO.
// See docs/STORYBOARD.md. Everything here is private to this IIFE.
(() => {
  // ================= timing =================
  const T_S = 88.76, T_27 = 94.64, T_28 = 96.84, T_29 = 98.7;
  const W_PLEASE = wordT(26, 1), W_DONT = wordT(26, 2), W_LET = wordT(26, 3), W_ME = wordT(26, 4), W_GO = wordT(26, 5);
  const W_UPPING = wordT(27, 1), W_PDOOM = wordT(27, 3);
  const W_FILL = wordT(28, 2);
  const W_KILL = wordT(29, 0), W_GUYS = wordT(29, 1), W_ON = wordT(29, 2), W_PTO = wordT(29, 3);
  const pulse = (T, t, k = 6) => (T >= t ? Math.exp(-(T - t) * k) : 0);
  const bcount = (T) => { const b = beatAt(T); return b.i + b.ph; };
  const rot2 = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };

  // ================= painting helpers =================
  // p5.brush commits batched strokes lazily; flushB() forces pending brush marks down before native
  // drawing that must sit on top of them (the engine already flushes at the end of every painter).
  function flushB() { wc(PAL.white, 1); brush.rect(-80, -80, 3, 3); brush.noFill(); }
  const defS = defSprite;
  // p5.brush fills misbehave (big pale wedges) when polygon vertices sit outside the sprite; keep them inside
  const inB = (pts, w, h, m = 3) => pts.map(([x, y]) => [clamp(x, m, w - m), clamp(y, m, h - m)]);
  function chaikin(pts, it = 2, closed = false) {
    let p = pts;
    for (let k = 0; k < it; k++) {
      const q = closed ? [] : [p[0]];
      const n = closed ? p.length : p.length - 1;
      for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % p.length]; q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
      if (!closed) q.push(p[p.length - 1]);
      p = q;
    }
    return p;
  }
  // the kit paperclip wire, drawn natively so it stays crisp and cheap
  const CLIP_PATH = chaikin([[60, 150], [60, 40], [45, 22], [28, 40], [28, 170], [45, 186], [70, 168], [70, 30], [52, 10], [26, 10], [14, 30], [14, 150]], 1);
  const CLIP_RAW = [[60, 150], [60, 40], [45, 22], [28, 40], [28, 170], [45, 186], [70, 168], [70, 30], [52, 10], [26, 10], [14, 30], [14, 150]];
  const clipPts = (x, y, sc, rt, path = CLIP_PATH) => path.map(([px, py]) => { const [dx, dy] = rot2((px - 42) * sc, (py - 98) * sc, rt); return [x + dx, y + dy]; });
  function segs(list, col, w) {
    stroke(col); strokeWeight(w); noFill();
    beginShape(LINES);
    for (const pts of list) for (let i = 0; i < pts.length - 1; i++) { vertex(pts[i][0], pts[i][1]); vertex(pts[i + 1][0], pts[i + 1][1]); }
    endShape(); noStroke();
  }

  // ======================================================================
  // L26: Gato, please don't let me go  (night sky, full moon, balloon cat)
  // ======================================================================
  defS('s10_sky', 1000, 580, () => {
    const c0 = PAL.night, c1 = mixc(PAL.night, PAL.nightLt, 0.65), c2 = mixc(PAL.nightLt, PAL.lilac, 0.3);
    gradRect(-20, -20, 1040, 330, c0, c1); gradRect(-20, 309, 1040, 291, c1, c2);
    blob(190, 150, 130, mixc(PAL.night, PAL.navy, 0.5), 70, 0.1);
    blob(820, 150, 130, mixc(PAL.nightLt, PAL.navy, 0.4), 55, 0.1);
    blob(500, 430, 130, mixc(PAL.lilac, PAL.nightLt, 0.5), 60, 0.1);
    blob(860, 450, 110, mixc(PAL.pink, PAL.nightLt, 0.55), 45, 0.1);
    blob(150, 450, 110, mixc(PAL.lilac, PAL.nightLt, 0.5), 45, 0.1);
    flushB();
    for (let i = 0; i < 110; i++) { const x = random(1000), y = random(470), r = 0.6 + random(1.3); flat(ellPts(x, y, r, r, 6), i % 7 ? PAL.white : PAL.butterLt, 0.3 + random(0.55)); }
  });
  defS('s10_moon', 560, 560, () => {
    const c = 280;
    paint(ellPts(c, c, 220, 220, 80), PAL.butterLt, { baseC: mixc(PAL.cream, PAL.white, 0.45), a: 110, lw: 2.4, lc: PAL.inkSoft, tex: 0.4, bleed: 0.02 });
    wc(mixc(PAL.lilacLt, PAL.butterLt, 0.35), 70, 0.02, 0.5, 0.4); brush.circle(c + 50, c + 60, 140); brush.noFill();
    flushB();
    for (const [x, y, r] of [[196, 198, 40], [356, 330, 50], [232, 378, 28], [372, 184, 24], [166, 316, 20], [300, 246, 14], [280, 280, 11]]) {
      flat(ellPts(x, y, r, r, 24), mixc(PAL.lilacLt, PAL.butterLt, 0.45), 0.8);
      flat(ellPts(x - r * 0.18, y - r * 0.22, r * 0.55, r * 0.42, 16), PAL.white, 0.4);
    }
    wc(mixc(PAL.lilacLt, PAL.butter, 0.2), 80, 0.02, 0.5, 0.7);
    for (const [x, y, r] of [[196, 198, 40], [356, 330, 50], [232, 378, 28], [372, 184, 24]]) brush.circle(x + r * 0.15, y + r * 0.15, r * 0.7);
    brush.noFill();
  });
  defS('s10_hills', 1000, 320, () => {
    const hy1 = (x) => 150 + Math.sin(x * 0.006 + 1) * 30 + Math.sin(x * 0.017) * 10;
    const hy2 = (x) => 236 + Math.sin(x * 0.008 + 3) * 22 + Math.sin(x * 0.021) * 7;
    const band = (fy) => { const p = [[-20, 322]]; for (let x = -20; x <= 1020; x += 20) p.push([x, fy(x)]); p.push([1020, 322]); return p; };
    const f1 = mixc(PAL.nightLt, PAL.lilac, 0.28), f2 = mixc(PAL.night, PAL.navy, 0.4);
    flat(band(hy1), f1);
    for (let i = 0; i < 16; i++) { const x = random(1000), y = hy1(x) + 42 + random(70); flat(ellPts(x, y, 40 + random(50), 14 + random(10), 20), mixc(f1, i % 2 ? PAL.lilac : PAL.night, 0.3), 0.4); }
    const houses = [];
    for (let i = 0; i < 12; i++) { const x = 40 + i * 82 + random(-16, 16), gy = hy1(x) + 10, w = 30 + random(16), h = 24 + random(18), rh = 18 + random(8); houses.push([x, gy, w, h, rh]); }
    for (const [x, gy, w, h, rh] of houses) {
      flat(rrPts(x - w / 2, gy - h, w, h + 8, 3), mixc(PAL.night, PAL.lilac, 0.28));
      flat([[x - w / 2 - 5, gy - h + 3], [x, gy - h - rh], [x + w / 2 + 5, gy - h + 3]], mixc(PAL.night, PAL.pink, 0.28));
      flat(rrPts(x - 5, gy - h + 8, 9, 9, 2), PAL.butter, 0.95);
    }
    pen(PAL.ink, 1.3, 'pen');
    for (const [x, gy, w, h, rh] of houses) { brush.polygon(rrPts(x - w / 2, gy - h, w, h + 8, 3)); brush.polygon([[x - w / 2 - 5, gy - h + 3], [x, gy - h - rh], [x + w / 2 + 5, gy - h + 3]]); }
    const tops1 = []; for (let x = 4; x <= 996; x += 20) tops1.push([x, hy1(x)]);
    brush.spline(tops1, 0.4);
    flushB();
    for (let i = 0; i < 9; i++) { const x = 60 + i * 115 + random(-20, 20); flat(ellPts(x, hy2(x) - 16, 22, 26, 20), mixc(PAL.night, PAL.teal, 0.3)); }
    flat(band(hy2), f2);
    for (let i = 0; i < 12; i++) { const x = random(1000), y = hy2(x) + 36 + random(40); flat(ellPts(x, y, 40 + random(50), 12 + random(8), 20), mixc(f2, PAL.lilac, 0.18), 0.4); }
    const tops2 = []; for (let x = 4; x <= 996; x += 20) tops2.push([x, hy2(x)]);
    pen(PAL.ink, 1.3, 'pen'); brush.spline(tops2, 0.4);
  });
  defS('s10_ncloud', 560, 230, () => {
    const c = mixc(PAL.lilac, PAL.nightLt, 0.58), cl = mixc(PAL.lilac, PAL.nightLt, 0.35);
    const parts = [[150, 140, 66], [250, 108, 88], [360, 126, 74], [440, 156, 50], [90, 166, 46]];
    for (const [x, y, r] of parts) flat(ellPts(x, y, r, r, 36), c);
    flat(rrPts(80, 150, 380, 56, 28), c);
    wc(cl, 90, 0.02, 0.5, 0.5); for (const [x, y, r] of parts) brush.circle(x - r * 0.1, y - r * 0.2, r * 0.72); brush.noFill();
    pen(PAL.lilacLt, 2.4, 'pen');
    for (const [x, y, r] of parts.slice(0, 3)) brush.spline([[x - r * 0.85, y - r * 0.4], [x - r * 0.3, y - r * 0.93], [x + r * 0.45, y - r * 0.85]], 0.5);
  });

  // ----- Gato: an original round, fluffy, multitasking cat -----
  const GI = PAL.orange, GID = mixc(PAL.orange, PAL.brown, 0.55), GCR = PAL.cream;
  defS('s10_gato_body', 400, 390, () => {
    const cx = 200, cy = 215;
    for (const s of [-1, 1]) {
      paint([[cx + s * 52, cy - 118], [cx + s * 116, cy - 190], [cx + s * 136, cy - 80]], GI, { baseC: lite(GI, 0.3), lw: 2, bleed: 0.02 });
      paint([[cx + s * 72, cy - 114], [cx + s * 112, cy - 162], [cx + s * 122, cy - 96]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.2, bleed: 0.02 });
    }
    const pts = []; const n = 44;
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const k = 1 + 0.03 * Math.cos(i * Math.PI) + 0.012 * Math.sin(a * 3); pts.push([cx + Math.cos(a) * 158 * k, cy + Math.sin(a) * 144 * k]); }
    paint(pts, GI, { baseC: lite(GI, 0.3), a: 150, lw: 2.2, bleed: 0.02 });
    paint(ellPts(cx, cy + 70, 96, 60, 36), GCR, { baseC: lite(GCR, 0.3), a: 120, lw: 1.2, lc: PAL.inkSoft, bleed: 0.02 });
    pen(GID, 4.5, 'pen');
    for (const [x0, y0, x1, y1] of [[-24, -140, -18, -108], [0, -144, 0, -102], [24, -140, 18, -108], [-152, -26, -118, -20], [-150, 8, -116, 8], [152, -26, 118, -20], [150, 8, 116, 8]]) brush.line(cx + x0, cy + y0, cx + x1, cy + y1);
    flushB();
    wc(GID, 45, 0.01, 0.5, 0.4); brush.circle(cx + 50, cy + 40, 80); brush.noFill();
    flushB();
    flat(ellPts(cx - 82, cy - 70, 28, 16, 16), PAL.white, 0.4);
  }, { v: 2, ay: 215 / 390 });
  defS('s10_gface', 300, 130, () => {
    flat(ellPts(78, 76, 16, 12, 20), PAL.pink, 0.5); flat(ellPts(222, 76, 16, 12, 20), PAL.pink, 0.5);
    paint([[137, 44], [163, 44], [150, 59]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.4, bleed: 0.01 });
    pen(PAL.ink, 1.8, 'pen');
    brush.line(96, 56, 20, 40); brush.line(96, 66, 16, 72); brush.line(204, 56, 280, 40); brush.line(204, 66, 284, 72);
  });
  defS('s10_gm_w', 90, 50, () => { strokePath([[14, 14], [28, 30], [45, 18], [62, 30], [76, 14]], PAL.ink, 2.6, 'pen', 0.5); });
  defS('s10_gm_o', 70, 70, () => { paint(ellPts(35, 35, 13, 16, 20), PAL.ink, { baseC: mixc(PAL.ink, PAL.red, 0.3), lw: 1.2, bleed: 0.01 }); flushB(); flat(ellPts(35, 42, 7, 5, 12), PAL.pink, 0.9); });
  defS('s10_ge_open', 80, 90, () => { flat(ellPts(40, 45, 22, 27, 28), PAL.ink); flat(ellPts(32, 34, 8, 9, 14), PAL.white); flat(ellPts(48, 56, 4, 4, 10), PAL.white, 0.8); });
  defS('s10_ge_happy', 80, 60, () => { strokePath([[12, 42], [40, 18], [68, 42]], PAL.ink, 4, 'pen', 0.3); });
  defS('s10_ge_blink', 80, 40, () => { strokePath([[12, 20], [40, 26], [68, 20]], PAL.ink, 3.6, 'pen', 0.4); });
  defS('s10_ge_wide', 90, 100, () => { paint(ellPts(45, 50, 28, 33, 28), PAL.white, { baseC: PAL.white, lw: 2.4, bleed: 0.01 }); flushB(); flat(ellPts(45, 54, 8, 9, 14), PAL.ink); flat(ellPts(42, 50, 3, 3, 8), PAL.white); });
  defS('s10_gato_paw', 100, 170, () => {
    paint(rrPts(31, 10, 38, 110, 18), GI, { baseC: lite(GI, 0.3), lw: 1.8, bleed: 0.02 });
    paint(ellPts(50, 124, 28, 24, 24), GCR, { baseC: lite(GCR, 0.3), lw: 1.8, bleed: 0.02 });
    pen(PAL.ink, 1.4, 'pen'); brush.line(41, 134, 41, 146); brush.line(59, 134, 59, 146);
    flushB(); flat(ellPts(50, 120, 7, 5, 10), PAL.pink, 0.8);
  }, { v: 2, ay: 20 / 170 });
  defS('s10_gato_foot', 100, 80, () => {
    paint(ellPts(50, 40, 34, 24, 24), GCR, { baseC: lite(GCR, 0.3), lw: 1.8, bleed: 0.02 });
    pen(PAL.ink, 1.3, 'pen'); brush.line(40, 50, 40, 62); brush.line(60, 50, 60, 62);
  });
  // tail: base at (30,210), curls up to the tip at (262,48)
  defS('s10_gato_tail', 320, 250, () => {
    const B = (t) => { const a = [30, 210], b = [190, 236], c = [276, 150], d = [262, 48]; const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
    const L = [], Rr = [], TIP = [], TIPR = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, p = B(t), q = B(Math.min(1, t + 0.01)), p0 = B(Math.max(0, t - 0.01));
      const dx = q[0] - p0[0], dy = q[1] - p0[1], m = Math.hypot(dx, dy) || 1;
      const w = Math.max(4, 25 * (1 - 0.22 * t) - (t > 0.9 ? 1500 * (t - 0.9) * (t - 0.9) : 0) + 2.5 * Math.sin(i * 1.9) * (1 - t));
      const l = [p[0] - (dy / m) * w, p[1] + (dx / m) * w], r = [p[0] + (dy / m) * w, p[1] - (dx / m) * w];
      L.push(l); Rr.push(r);
      if (t >= 0.78) { TIP.push(l); TIPR.push(r); }
    }
    paint([...L, ...Rr.reverse()], GI, { baseC: lite(GI, 0.3), lw: 2, bleed: 0.02 });
    paint([...TIP, ...TIPR.reverse()], GCR, { baseC: lite(GCR, 0.3), lw: 1.4, bleed: 0.02 });
    pen(GID, 4.5, 'pen');
    for (const t of [0.3, 0.46, 0.62]) { const p = B(t), q = B(t + 0.02); const dx = q[0] - p[0], dy = q[1] - p[1], m = Math.hypot(dx, dy); brush.line(p[0] - (dy / m) * 17, p[1] + (dx / m) * 17, p[0] + (dy / m) * 17, p[1] - (dx / m) * 17); }
  }, { v: 2, ax: 30 / 320, ay: 210 / 250 });
  // balloons (anchor at the knot)
  const BALC = { pink: PAL.pink, mint: PAL.mint, sky: PAL.sky, butter: PAL.butter, lilac: PAL.lilac, coral: PAL.coralLt };
  for (const [nm, c] of Object.entries(BALC)) {
    defS('s10_bal_' + nm, 180, 240, () => {
      paint(ellPts(90, 98, 70, 84, 40), c, { baseC: lite(c, 0.3), a: 160, lw: 2, bleed: 0.02 });
      flushB();
      flat([[79, 192], [101, 192], [90, 178]], dark(c, 0.15));
      flat(ellPts(62, 60, 11, 20, 16), PAL.white, 0.75);
      flat(ellPts(57, 94, 5, 7, 10), PAL.white, 0.5);
    }, { ay: 190 / 240 });
  }
  // Gato's many jobs
  defS('s10_controller', 220, 160, () => {
    const pts = chaikin([[70, 40], [150, 40], [182, 60], [198, 110], [182, 134], [150, 128], [128, 104], [92, 104], [70, 128], [38, 134], [22, 110], [38, 60]], 2, true);
    paint(pts, PAL.sky, { baseC: lite(PAL.sky, 0.3), lw: 2.2, bleed: 0.01 });
    flushB();
    flat(rrPts(60, 62, 20, 50, 5), PAL.ink); flat(rrPts(45, 77, 50, 20, 5), PAL.ink);
    for (const [x, y, c] of [[152, 60, PAL.coral], [168, 76, PAL.mint], [136, 76, PAL.butter], [152, 92, PAL.pink]]) { flat(ellPts(x, y, 10, 10, 16), PAL.ink); flat(ellPts(x, y, 8, 8, 16), c); }
    flat(ellPts(90, 52, 18, 5, 12), PAL.white, 0.6);
  });
  defS('s10_robotarm', 190, 220, () => {
    const parts = [[rrPts(38, 182, 104, 26, 8), PAL.gray], [rrPts(74, 108, 30, 82, 10), PAL.butter], [[[80, 96], [132, 44], [150, 62], [98, 114]], PAL.butter], [ellPts(89, 106, 18, 18, 20), PAL.gray], [ellPts(141, 53, 14, 14, 16), PAL.gray], [[[144, 40], [166, 18], [176, 26], [156, 50]], PAL.gray], [[[154, 60], [180, 58], [180, 70], [156, 72]], PAL.gray]];
    for (const [pts, c] of parts) flat(pts, lite(c, 0.2));
    wc(PAL.butter, 90, 0.01, 0.5, 0.5); brush.polygon(parts[1][0]); brush.polygon(parts[2][0]); brush.noFill();
    pen(PAL.ink, 1.6, '2B'); for (const [pts] of parts) brush.polygon(pts);
    flushB(); flat(ellPts(89, 106, 6, 6, 10), PAL.coral);
  });
  defS('s10_bubble', 210, 170, () => {
    paint([[62, 108], [36, 158], [100, 114]], PAL.white, { baseC: PAL.white, lw: 2.2, bleed: 0.01 });
    paint(rrPts(16, 16, 176, 106, 46, 6), PAL.white, { baseC: PAL.white, lw: 2.2, bleed: 0.01 });
    flushB();
    for (let i = 0; i < 3; i++) flat(ellPts(66 + i * 38, 70, 11, 11, 16), [PAL.pink, PAL.lilac, PAL.sky][i]);
  });
  // Pip's long reaching arm (the rig's arms are too short to dangle or to hold a lantern up high)
  const ARM_L = 244, PIP_SH = [56, -138];
  defS('s10_pip_arm_long', 70, 300, () => {
    paint(rrPts(20, 8, 30, 240, 14), PAL.lilac, { baseC: lite(PAL.lilac, 0.25), lw: 1.6, bleed: 0.01 });
    paint(ellPts(35, 262, 19, 19, 24), PAL.skin, { baseC: lite(PAL.skin, 0.35), lw: 1.6, bleed: 0.01 });
  }, { ay: 18 / 300 });

  // ----- Gato rig (Gato-local units, body centre = 0,0) -----
  const GS = 0.7, PS = 0.6;
  const PAWR_SH = [112, 22], PAWL_SH = [-118, -8], PAW_L = 104;
  const TAIL_B = [118, 62], TAIL_V = [232, -162];
  const pawTip = (sh, r) => [sh[0] - PAW_L * Math.sin(r), sh[1] + PAW_L * Math.cos(r)];
  const tailTip = (r) => { const [x, y] = rot2(TAIL_V[0], TAIL_V[1], r); return [TAIL_B[0] + x, TAIL_B[1] + y]; };
  const parab = (a, b, apexY, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t) + 4 * (apexY - (a[1] + b[1]) / 2) * t * (1 - t)];
  const JOFF = fract(0.585 - bcount(W_ME) / 6); // puts the controller on the tail tip right before "me"
  function gatoState(T) {
    const u = T - T_S, f = Math.max(0, T - W_GO);
    const g = { x: 590 + u * 106 + Math.sin(T * 0.9) * 16 + 40 * f, y: 655 - u * 44 + Math.sin(T * 1.3) * 9 - 160 * f - 700 * f * f };
    const bc = bcount(T);
    g.bc = bc;
    const pawPh = fract((bc + 6 * JOFF) / 2);
    g.pawL = 2.15 + 0.42 * Math.exp(-pawPh * 9) - 0.3 * sstep(0.72, 1, pawPh);
    const tailPh = fract((bc + 6 * JOFF - 3.6) / 2);
    g.tail = -0.04 - 0.3 * Math.exp(-tailPh * 9) + 0.16 * sstep(0.7, 1, tailPh) + 0.05 * Math.sin(T * 1.7) - 0.3 * pulse(T, W_ME, 5);
    g.pawR = lerp(-0.42 + 0.07 * Math.sin(T * 1.6), -2.45, Ez.inOut(inv(W_GO - 0.14, W_GO + 0.02, T)));
    g.sq = 1 + 0.025 * Math.sin(T * 2.6) + 0.06 * pulse(T, T_S, 5) - 0.06 * pulse(T, W_GO, 6);
    g.r = 0.04 * Math.sin(T * 1.1);
    return g;
  }
  const gW = (g, lx, ly) => { const [x, y] = rot2(lx * GS, ly * GS, g.r); return [g.x + x, g.y + y]; };
  // Pip hangs by the long right arm; V_COM = hand -> centre of mass (rig units)
  const HANG_A = 0.12;
  const HXL = PIP_SH[0] + Math.sin(HANG_A) * ARM_L, HYL = PIP_SH[1] - Math.cos(HANG_A) * ARM_L;
  const V_COM = [-HXL, -150 - HYL];
  const ANG0 = Math.atan2(V_COM[0], V_COM[1]);
  function hangSwing(T) {
    return 0.09 * Math.sin(T * 1.7) + 0.22 * pulse(T, W_PLEASE, 2.5) * Math.sin((T - W_PLEASE) * 8) + 0.2 * pulse(T, W_LET, 3) * Math.sin((T - W_LET) * 10) + 0.18 * pulse(T, W_ME, 3) * Math.sin((T - W_ME) * 9);
  }
  function pipHangState(T) {
    if (T < W_GO) {
      const g = gatoState(T);
      const hand = gW(g, ...pawTip(PAWR_SH, g.pawR));
      const ang = ANG0 + hangSwing(T);
      const [vx, vy] = rot2(V_COM[0] * PS, V_COM[1] * PS, ang);
      return { hand, ang, com: [hand[0] + vx, hand[1] + vy], falling: 0 };
    }
    const s0 = pipHangState(W_GO - 1e-4);
    const t = T - W_GO;
    const com = [s0.com[0] + 60 * t, s0.com[1] + 150 * t + 0.5 * 2600 * t * t];
    const ang = s0.ang + 1.8 * t;
    const [vx, vy] = rot2(V_COM[0] * PS, V_COM[1] * PS, ang);
    return { hand: [com[0] - vx, com[1] - vy], ang, com, falling: t };
  }
  function trackShift(T) {
    const k = sstep(W_GO + 0.02, W_GO + 0.3, T);
    if (k <= 0) return [0, 0];
    const st = pipHangState(T);
    return [(st.com[0] - IRIS_C[0]) * k, (st.com[1] - IRIS_C[1]) * k];
  }
  function drawPipHang(st, o) {
    push(); translate(st.hand[0], st.hand[1]); rotate(st.ang); scale(PS); translate(-HXL, -HYL);
    spr('s10_pip_arm_long', PIP_SH[0], PIP_SH[1], { r: Math.PI + HANG_A, seed: 31 });
    pip(0, 0, 1, { face: o.face, armL: o.armL, armR: -0.4, legs: o.legs, headR: o.headR ?? 0, seed: 3 });
    pop();
  }
  function drawGato(g, o) {
    push(); translate(g.x, g.y); rotate(g.r); scale(GS * g.sq, GS / g.sq);
    spr('s10_gato_tail', TAIL_B[0], TAIL_B[1], { r: g.tail, seed: 21 });
    const kk = 0.12 * Math.sin(G.T * 2.2);
    spr('s10_gato_foot', -64, 128, { r: 0.25 + kk, seed: 22 });
    spr('s10_gato_foot', 64, 128, { r: -0.25 - kk, flip: true, seed: 23 });
    spr('s10_gato_body', 0, 0, { seed: 25 });
    spr('acc_bow', 0, -150, { s: 0.6, r: 0.06 * Math.sin(G.T * 2), seed: 26 });
    spr('s10_gface', 0, 4, { seed: 27 });
    const lk = o.look || [0, 0];
    let eye = o.eyes || 'open';
    if (eye === 'open' && fract(G.T * 0.33 + 0.4) < 0.045) eye = 'blink';
    for (const sx of [-1, 1]) spr('s10_ge_' + eye, sx * 52 + lk[0], -34 + lk[1], { s: 0.9, seed: 28 + sx });
    spr(o.mouth === 'o' ? 's10_gm_o' : 's10_gm_w', 0, 14, { s: o.mouth === 'o' ? 0.9 : 0.75, seed: 30 });
    spr('s10_gato_paw', PAWR_SH[0], PAWR_SH[1], { r: g.pawR, seed: 32 });
    spr('s10_gato_paw', PAWL_SH[0], PAWL_SH[1], { r: g.pawL, flip: true, seed: 33 });
    pop();
  }
  const BUNCH = [[-150, -205, 'lilac'], [-52, -245, 'sky'], [58, -250, 'pink'], [158, -205, 'butter'], [-104, -120, 'mint'], [4, -150, 'coral'], [110, -125, 'sky']];
  function drawBalloons(g, T) {
    const tp = gW(g, 0, -150);
    const knots = BUNCH.map(([bx, by, c], i) => [tp[0] + bx * GS * 1.2 + 7 * Math.sin(T * 1.1 + i * 1.3), tp[1] + by * GS * 1.2 + 6 * Math.sin(T * 1.4 + i * 0.7), c, i]);
    noFill(); stroke(withAlphaCol(PAL.lilacLt, 0.8)); strokeWeight(2.2);
    for (const [kx, ky, , i] of knots) bezier(tp[0], tp[1], tp[0] + 4 * Math.sin(T + i), tp[1] - 40, kx + 12 * Math.sin(T * 1.3 + i), ky + 50, kx, ky);
    noStroke();
    for (const [kx, ky, c, i] of knots) spr('s10_bal_' + c, kx, ky, { s: 0.78, r: (kx - tp[0]) * 0.0012 + 0.05 * Math.sin(T * 1.2 + i), seed: i });
  }
  const JUG = ['s10_controller', 's10_robotarm', 's10_bubble'];
  function jugLocal(g, ph) {
    const P = pawTip(PAWL_SH, g.pawL), Q = tailTip(g.tail);
    if (ph < 0.5) return parab(P, Q, -340, ph / 0.5);
    if (ph < 0.6) return Q;
    if (ph < 0.92) return parab(Q, P, -225, (ph - 0.6) / 0.32);
    return P;
  }
  function drawJuggle(g, T) {
    for (let i = 0; i < 3; i++) {
      const ph = fract(g.bc / 6 + JOFF + i / 3);
      let lp = jugLocal(g, ph);
      if (i === 0 && T > W_ME) {
        // "me": the tail flicks the controller way up; "go": the paw holding Pip lets go to catch it
        const q0 = tailTip(-0.04), c = pawTip(PAWR_SH, -2.45);
        const t = inv(W_ME + 0.02, W_GO, T);
        lp = t < 1 ? parab(q0, c, -620, Ez.out(t) * 0.55 + t * 0.45) : c;
      }
      const [x, y] = gW(g, lp[0], lp[1]);
      // a little stardust trail while the job is in the air
      if (!(i === 0 && T > W_ME) && (ph < 0.5 || (ph > 0.6 && ph < 0.92))) {
        for (let k = 1; k <= 2; k++) { const q = jugLocal(g, ph - 0.035 * k), [tx, ty] = gW(g, q[0], q[1]); spr('sparkW', tx, ty, { s: 0.13 - 0.035 * k, a: 0.75 - 0.25 * k, r: T * 3 + k + i, seed: i * 3 + k }); }
      }
      spr(JUG[i], x, y, { s: 0.52, r: 0.35 * Math.sin(ph * TAU + i * 2) + (i === 0 && T > W_GO ? -0.5 : 0), seed: 40 + i });
    }
  }
  function cdSheen(x, y, r, T, a) {
    if (a <= 0) return;
    const spin = 7 * (1 - Math.exp(-(T - 87.9) * 1.2)) + (T - 87.9) * 0.4;
    noStroke();
    const cols = [PAL.pink, PAL.sky, PAL.mint, PAL.butter, PAL.lilac, PAL.sky];
    for (let k = 0; k < 6; k++) { fill(withAlphaCol(cols[k], 0.34 * a)); arc(x, y, r * 1.9, r * 1.9, spin + (k * TAU) / 6, spin + (k * TAU) / 6 + 0.62, PIE); }
    disc(x, y, r * 0.17, PAL.nightLt, 0.85 * a); ringLine(x, y, r * 0.17, PAL.lilacLt, 5, a); ringLine(x, y, r * 0.42, PAL.white, 2, 0.5 * a);
  }
  function shootingStar(T, t0, x0, y0, dx, dy) {
    const a = T - t0; if (a < 0 || a > 0.9) return;
    const k = Ez.out(clamp(a / 0.7)), f = 1 - inv(0.5, 0.9, a);
    for (let i = 0; i < 6; i++) { const t1 = Math.max(0, k - 0.05 * i), t2 = Math.max(0, k - 0.05 * (i + 1)); segLine(x0 + dx * t1, y0 + dy * t1, x0 + dx * t2, y0 + dy * t2, PAL.butterLt, 4 - i * 0.5, 0.7 * f * (1 - i / 6)); }
    glow(x0 + dx * k, y0 + dy * k, 18, PAL.butterLt, 0.6 * f); disc(x0 + dx * k, y0 + dy * k, 3.5, PAL.white, f);
  }

  shot({
    id: 'L26-gato', t0: T_S, tin: { type: 'bleed', d: 1.2, at: 0.5 },
    draw(s) {
      const T = s.T;
      const drift = Math.max(0, T - 89.2) * 22;
      const [dX, dY] = trackShift(T);
      spr('s10_sky', W / 2, H / 2, { s: 2, jit: 0 });
      // stars (far layer)
      push(); translate(-dX * 0.15, drift * 0.25 - dY * 0.25);
      for (let i = 0; i < 60; i++) { const x = R(i, 71) * W, y = R(i, 72) * 760 - 80; const k = 0.5 + 0.5 * Math.sin(T * (1.1 + R(i, 73) * 2.2) + i); disc(x, y, 1.1 + R(i, 74) * 2.2, i % 5 ? PAL.white : PAL.butterLt, 0.2 + 0.65 * k); }
      twinkles(T, 14, 77, [60, 10, 1800, 600], ['sparkW', 'star5'], 0.07, 0.2, 1.4);
      pop();
      shootingStar(T, 89.9, 1650, 110, -520, 170);
      shootingStar(T, 92.2, 520, 70, -420, 150);
      // the full moon sits exactly where s09's CD-R spun
      const mx = 960 - dX * 0.12, my = 420 + drift * 0.15 - dY * 0.12;
      glow(mx, my, 330, PAL.lilacLt, 0.4);
      glow(mx, my, 250, PAL.butterLt, 0.3);
      spr('s10_moon', mx, my, { jit: 0.3 });
      cdSheen(mx, my, 220, T, 1 - sstep(88.4, 89.8, T));
      for (let i = 0; i < 3; i++) {
        const cx = [260, 1560, 1180][i] + Math.sin(T * 0.2 + i) * 30 + (T - T_S) * (8 + i * 5) - dX * 0.45;
        const cy = [300, 190, 700][i] + drift * 0.5 - dY * 0.5;
        spr('s10_ncloud', cx, cy, { s: [0.9, 0.75, 1.1][i], a: 0.9, flip: i === 1, seed: i });
      }
      spr('s10_hills', 960 - dX * 0.8, 1000 + drift - dY, { s: 2, jit: 0 });
      spr('s10_ncloud', 300 + (T - T_S) * 40 - dX * 1.3, 1010 + drift * 1.3 - dY * 1.3, { s: 1.5, seed: 5 });
      spr('s10_ncloud', 1650 - (T - T_S) * 30 - dX * 1.3, 1060 + drift * 1.3 - dY * 1.3, { s: 1.3, flip: true, seed: 6 });
      // the floating group
      push(); translate(-dX, -dY);
      const g = gatoState(T);
      drawBalloons(g, T);
      const ps = pipHangState(T);
      let pf = 'pf_nervous';
      if (T > W_PLEASE) pf = 'pf_cry';
      if (T > W_LET && T < W_LET + 0.45) pf = 'pf_scared';
      if (T > W_ME) pf = 'pf_scared';
      if (T > W_GO) pf = 'pf_shock';
      const kickA = T > W_DONT && T < W_DONT + 1.3 ? 0.5 : 0.22;
      const legs = ps.falling ? [0.6 * Math.sin(T * 14), -0.6 * Math.sin(T * 14)] : [kickA * Math.sin(T * 5), -kickA * Math.sin(T * 5 + 0.6)];
      const armL = ps.falling ? 2.9 + 0.3 * Math.sin(T * 16) : (T > W_PLEASE ? 2.55 + 0.08 * Math.sin(T * 13) : 2.2 + 0.1 * Math.sin(T * 2));
      drawPipHang(ps, { face: pf, armL, legs, headR: ps.falling ? 0.2 : -0.18 + 0.05 * Math.sin(T * 1.5) });
      let eyes = 'happy', look = [0, 0], mouth = 'w';
      if (T > W_PLEASE - 0.05) { eyes = 'open'; look = [10, 12]; }
      if (T > W_DONT && T < W_DONT + 0.9) eyes = 'happy';
      if (T > W_LET - 0.1) { eyes = 'open'; look = [-6, -12]; }
      if (T > W_ME) { eyes = 'open'; look = [12, -14]; }
      if (T > W_GO) { eyes = 'wide'; look = [8, 10]; mouth = 'o'; }
      drawGato(g, { eyes, look, mouth });
      drawJuggle(g, T);
      // word hits
      burst(T, T_S, g.x, g.y - 40, { n: 12, names: ['sparkW', 'star5', 'spark'], spd: 520, g: 0, life: 1.1, s: 0.3, even: true, seed: 3 });
      if (!ps.falling) {
        const [fx, fy] = ps.com;
        burst(T, W_PLEASE, fx - 20, fy - 90, { n: 6, names: ['drop'], spd: 380, g: 900, life: 0.9, s: 0.4, spread: 1.8, ang0: -Math.PI / 2, seed: 11 });
        burst(T, W_ME, fx, fy - 80, { n: 5, names: ['drop'], spd: 420, g: 900, life: 0.8, s: 0.35, spread: 2.2, ang0: -Math.PI / 2, seed: 17 });
      }
      const ha = T - W_DONT;
      if (ha > 0 && ha < 1.4) { const [hx, hy] = gW(g, 150, -200); spr('heart', hx + 20 * ha, hy - 70 * ha, { s: 0.35 * Ez.outBack(clamp(ha / 0.3)), a: 1 - inv(0.9, 1.4, ha), r: 0.2 * Math.sin(T * 6) }); }
      burst(T, W_GO, ...gW(g, 180, -60), { n: 8, names: ['sparkW', 'spark'], spd: 420, g: 0, life: 0.6, s: 0.25, even: true, seed: 21 });
      pop();
      if (T > W_GO) { const f = sstep(W_GO, W_GO + 0.3, T), L = []; for (let i = 0; i < 12; i++) { const x = 150 + R(i, 91) * 1620, y = fract(R(i, 92) - T * 1.6) * 1300 - 110; L.push([x, y, x, y + 90 + 80 * R(i, 93)]); } segLines(L, PAL.lilacLt, 3, 0.35 * f); }
    },
  });
  lyr(26, { x: 1220, y: 1000, font: 'hand', size: 82, weight: 700, maxW: 1200, anim: 'rise', wave: 3, cols: [PAL.butter, PAL.pinkLt, PAL.white, PAL.white, PAL.white, PAL.pink], words: { 0: { size: 104, anim: 'pop' }, 1: { grow: 0.12 }, 5: { anim: 'drop', size: 108, grow: 0.1 } } });

  // ======================================================================
  // L27 + L28: the bedroom (dark with the P(doom) lantern, then lit and flooded with paperclips)
  // ======================================================================
  defS('s10_room', 1000, 580, () => {
    flat([[-20, -20], [1020, -20], [1020, 470], [-20, 470]], PAL.butterLt);
    for (let x = 12; x < 1000; x += 64) flat([[x, 0], [x + 24, 0], [x + 24, 466], [x, 466]], PAL.pinkLt, 0.5);
    for (let i = 0; i < 40; i++) { const x = 44 + (i % 16) * 64, y = 60 + Math.floor(i / 16) * 150 + (i % 2) * 70; flat(heartPts(x, y, 7), PAL.pink, 0.35); }
    blob(250, 230, 150, PAL.cream, 50, 0.05); blob(760, 330, 160, PAL.cream, 50, 0.05);
    flushB();
    flat([[-10, -10], [1010, -10], [1010, 16], [-10, 16]], PAL.cream);
    flat([[-20, 468], [1020, 468], [1020, 600], [-20, 600]], PAL.brownLt);
    for (let i = 0; i < 4; i++) flat([[-20, 496 + i * 28], [1020, 496 + i * 28], [1020, 508 + i * 28], [-20, 508 + i * 28]], mixc(PAL.brownLt, PAL.brown, 0.35), 0.35);
    flat([[-10, 456], [1010, 456], [1010, 470], [-10, 470]], PAL.cream);
    flat(ellPts(300, 540, 170, 30, 40), PAL.mintLt); flat(ellPts(300, 540, 118, 18, 40), lite(PAL.mint, 0.1), 0.8);
    // window with the night sky and the moon
    paint(rrPts(84, 74, 214, 212, 16), PAL.cream, { baseC: lite(PAL.cream, 0.3), lw: 2, bleed: 0.01 });
    paint(rrPts(98, 88, 186, 184, 10), PAL.navy, { baseC: mixc(PAL.navy, PAL.nightLt, 0.5), a: 200, lw: 1.6, bleed: 0.01 });
    paint(ellPts(236, 132, 24, 24, 24), PAL.butterLt, { baseC: PAL.cream, lw: 1.2, bleed: 0.01 });
    flushB();
    for (let i = 0; i < 16; i++) flat(ellPts(110 + random(160), 100 + random(160), 1.6, 1.6, 6), PAL.white, 0.8);
    flat([[186, 88], [196, 88], [196, 272], [186, 272]], PAL.cream); flat([[98, 176], [284, 176], [284, 186], [98, 186]], PAL.cream);
    flat(rrPts(72, 276, 238, 16, 6), lite(PAL.cream, 0.2));
    for (const [x0, dir] of [[60, 1], [322, -1]]) paint([[x0 - 18 * dir, 60], [x0 + 36 * dir, 60], [x0 + 30 * dir, 170], [x0 + 44 * dir, 300], [x0 - 14 * dir, 304], [x0 - 4 * dir, 180]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.8, bleed: 0.01 });
    // a sunset-beach picture (where the killswitch guys went)
    flat(rrPts(700, 86, 124, 88, 6), PAL.brownLt);
    flat(rrPts(710, 96, 104, 40, 2), PAL.pink); flat(ellPts(778, 134, 14, 14, 16), PAL.butter); flat(rrPts(710, 132, 104, 18, 2), PAL.sky); flat(rrPts(710, 150, 104, 14, 2), PAL.butterLt);
    // shelf with books and a plant
    flat(rrPts(790, 236, 170, 12, 4), mixc(PAL.brown, PAL.brownLt, 0.5));
    const bc = [PAL.coral, PAL.sky, PAL.mint, PAL.butter, PAL.lilac];
    for (let i = 0; i < 5; i++) flat(rrPts(800 + i * 15, 190 + (i % 2) * 6, 13, 46 - (i % 2) * 6, 2), bc[i]);
    flat([[880, 236], [914, 236], [918, 198], [876, 198]], PAL.brownLt);
    for (let i = 0; i < 4; i++) flat(ellPts(885 + i * 9, 190 - (i % 2) * 8, 9, 13, 12), PAL.green);
    pen(PAL.ink, 1.3, 'pen');
    for (let i = 0; i < 5; i++) brush.rect(800 + i * 15, 190 + (i % 2) * 6, 13, 46 - (i % 2) * 6);
    brush.polygon([[880, 236], [914, 236], [918, 198], [876, 198]]);
    brush.polygon(rrPts(72, 276, 238, 16, 6)); brush.polygon(rrPts(700, 86, 124, 88, 6)); brush.polygon(rrPts(790, 236, 170, 12, 4));
    brush.line(-10, 16, 1010, 16); brush.line(-10, 470, 1010, 470);
    for (let y = 496; y < 590; y += 28) brush.line(-20, y, 1020, y);
    for (const [x0, dir] of [[60, 1], [322, -1]]) brush.spline([[x0 + 10 * dir, 70], [x0 + 12 * dir, 180], [x0 + 16 * dir, 294]], 0.4);
    flushB();
    // nightstand + lamp
    const stand = [[rrPts(690, 350, 90, 112, 8), PAL.brownLt], [rrPts(726, 304, 18, 48, 4), PAL.cream], [[[702, 308], [768, 308], [754, 262], [716, 262]], PAL.mint]];
    for (const [pts, c] of stand) flat(pts, lite(c, 0.15));
    flat(ellPts(735, 380, 5, 5, 10), PAL.brown);
    pen(PAL.ink, 1.6, '2B'); for (const [pts] of stand) brush.polygon(pts); brush.line(698, 404, 772, 404);
    flushB();
    // headboard + pillow
    paint(rrPts(360, 250, 330, 230, 70), PAL.sky, { baseC: PAL.skyLt, lw: 2, bleed: 0.01 });
    paint(ellPts(525, 360, 120, 34, 30), PAL.white, { baseC: PAL.white, lw: 1.6, bleed: 0.01 });
  });
  defS('s10_quilt', 800, 300, () => {
    const pts = rrPts(20, 36, 760, 244, 60, 6);
    paint(pts, PAL.pinkLt, { baseC: lite(PAL.pinkLt, 0.3), lw: 2.2, bleed: 0.01 });
    flushB();
    const cols = [PAL.mint, PAL.butter, PAL.sky, PAL.pink, PAL.lilac];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { if ((r + c) % 2) continue; flat(rrPts(60 + c * 88, 70 + r * 66, 80, 58, 6), cols[(r * 3 + c) % cols.length], 0.75); }
    pen(mixc(PAL.pink, PAL.ink, 0.25), 1.4, 'pen');
    for (let c = 0; c <= 8; c++) brush.line(56 + c * 88, 64, 56 + c * 88, 268);
    flushB();
    paint(rrPts(20, 30, 760, 44, 20), PAL.white, { baseC: PAL.white, lw: 2, bleed: 0.01 });
  });
  defS('s10_lantern', 220, 320, () => {
    const cx = 110;
    ringLine(cx, 30, 19, PAL.ink, 9); ringLine(cx, 30, 19, PAL.gold, 4.5);
    const cap = [[cx - 60, 94], [cx - 42, 58], [cx + 42, 58], [cx + 60, 94]], knob = rrPts(cx - 16, 44, 32, 18, 6);
    flat(knob, lite(PAL.gold, 0.2)); flat(cap, lite(PAL.gold, 0.2));
    wc(PAL.gold, 120, 0.01, 0.5, 0.5); brush.polygon(cap); brush.noFill();
    pen(PAL.ink, 1.8, '2B'); brush.polygon(knob); brush.polygon(cap); flushB();
    paint(rrPts(cx - 62, 92, 124, 150, 18), PAL.butterLt, { baseC: mixc(PAL.cream, PAL.white, 0.5), a: 90, lw: 2.4, bleed: 0.01 });
    const dx = cx, dy = 214, r1 = 52, r2 = 30;
    for (const [c, a0, a1] of [[PAL.mint, 0, 0.35], [PAL.butter, 0.35, 0.6], [PAL.orange, 0.6, 0.8], [PAL.red, 0.8, 1]]) {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const a = Math.PI + (a0 + (a1 - a0) * (i / 8)) * Math.PI; pts.push([dx + Math.cos(a) * r1, dy + Math.sin(a) * r1]); }
      for (let i = 8; i >= 0; i--) { const a = Math.PI + (a0 + (a1 - a0) * (i / 8)) * Math.PI; pts.push([dx + Math.cos(a) * r2, dy + Math.sin(a) * r2]); }
      flat(pts, c);
    }
    pen(PAL.ink, 1.2, 'pen'); brush.arc(dx, dy, r1, 0, Math.PI); brush.arc(dx, dy, r2, 0, Math.PI); brush.line(dx - r1, dy, dx - r2, dy); brush.line(dx + r2, dy, dx + r1, dy);
    flushB();
    paint(rrPts(cx - 72, 238, 144, 34, 10), PAL.gold, { baseC: lite(PAL.gold, 0.3), lw: 2, bleed: 0.01 });
    flushB();
    segLine(cx - 62, 100, cx - 62, 236, mixc(PAL.gold, PAL.brown, 0.4), 7); segLine(cx + 62, 100, cx + 62, 236, mixc(PAL.gold, PAL.brown, 0.4), 7);
    const t = textImg('P(doom)', { font: 'pixel', size: 22, fill: PAL.ink, weight: 700 });
    image(t.img, cx - t.w / 2, 255 - t.h / 2);
  }, { ay: 12 / 320 });
  // darkness with a soft hole (a Canvas2D radial gradient painted once)
  defS('s10_dark', 512, 512, () => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const g2 = c.getContext('2d');
    const grd = g2.createRadialGradient(256, 256, 0, 256, 256, 256);
    for (const [st, a] of [[0, 0], [0.03, 0], [0.07, 0.34], [0.12, 0.68], [0.19, 0.85], [0.3, 0.92], [1, 0.94]]) grd.addColorStop(st, `rgba(16,12,40,${a})`);
    g2.fillStyle = grd; g2.fillRect(0, 0, 512, 512);
    const img = createImage(512, 512); img.drawingContext.drawImage(c, 0, 0); if (img.setModified) img.setModified(true);
    image(img, 0, 0, 512, 512);
  });
  // colourful paperclips (same wire as the kit sprite, drawn crisp)
  const CLIP_COLS = { gray: PAL.gray, sky: PAL.sky, pink: PAL.pink, mint: PAL.mint, butter: PAL.butter, lilac: PAL.lilac };
  for (const [nm, c] of Object.entries(CLIP_COLS)) defS('s10_clip_' + nm, 90, 200, () => { const p = clipPts(43, 98, 1, 0); segs([p], PAL.ink, 8.5); segs([p], c, 4.6); });
  const CLIPS = ['s10_clip_gray', 's10_clip_sky', 's10_clip_pink', 's10_clip_gray', 's10_clip_mint', 's10_clip_butter', 'paperclip', 's10_clip_lilac'];
  const bumpY = (x) => 11 * Math.sin(x * 0.012 + 0.7) + 7 * Math.sin(x * 0.029 + 2.1) + 4 * Math.sin(x * 0.071);
  const PILE_COLS = [PAL.grayLt, PAL.gray, PAL.sky, PAL.pink, PAL.mint, PAL.butter, PAL.lilac];
  defS('s10_pile', 1000, 600, () => {
    const top = (xs) => 30 + 0.5 * bumpY(2 * xs - 40);
    const poly = []; for (let xs = -10; xs <= 1010; xs += 20) poly.push([xs, top(xs)]);
    const full = [...poly, [1010, 610], [-10, 610]];
    flat(full, mixc(PAL.grayLt, PAL.lilacLt, 0.4));
    wc(mixc(PAL.gray, PAL.lilac, 0.3), 90, 0.01, 0.6, 0.5); brush.polygon(inB(full, 1000, 600)); brush.noFill();
    flushB();
    for (let i = 0; i < 5; i++) flat([[-10, 160 + i * 90], [1010, 160 + i * 90], [1010, 610], [-10, 610]], mixc(PAL.lilac, PAL.ink, 0.5), 0.07);
    const clips = [];
    for (let i = 0; i < 470; i++) { const xs = random(-20, 1020); clips.push([xs, top(xs) + 8 + Math.pow(random(), 0.85) * 590, random(0.17, 0.24), random(TAU), i % PILE_COLS.length]); }
    for (let xs = -10; xs <= 1010; xs += 14) clips.push([xs + random(-5, 5), top(xs) + random(0, 10), random(0.17, 0.21), random(-0.9, 0.9) + (random() < 0.5 ? Math.PI / 2 : 0), Math.floor(random(PILE_COLS.length))]);
    // back to front in layers so wires overlap like a real heap
    for (let L = 0; L < 5; L++) {
      const part = clips.filter((_, i) => i % 5 === L).map(([x, y, sc, rt, ci]) => [clipPts(x, y, sc, rt, CLIP_RAW), ci]);
      segs(part.map((p) => p[0]), PAL.ink, 3.2);
      for (let ci = 0; ci < PILE_COLS.length; ci++) segs(part.filter((p) => p[1] === ci).map((p) => p[0]), PILE_COLS[ci], 1.9);
    }
  }, { ay: 30 / 600 });

  // ----- shared bedroom staging (both shots use it so the light-bloom transition lines up) -----
  const PIP_R = [1010, 880];
  function roomCam(T) {
    const pin = Ez.inOut(inv(94.75, 96.35, T)), out = Ez.inOut(inv(96.95, 97.6, T));
    return [lerp(lerp(960, 1110, pin), 960, out), lerp(lerp(540, 640, pin), 540, out), lerp(lerp(1, 1.55, pin), 1, out)];
  }
  const toScr = (cm, x, y) => [(x - cm[0]) * cm[2] + W / 2, (y - cm[1]) * cm[2] + H / 2];
  // pile surface (world y) rising on the beats; it drops away through the floor to reveal the beach
  const PILE = [[97.083, 960], [97.501, 800], [97.988, 615], [98.18, 40]];
  const dropY = (T) => { const u = inv(98.45, 98.95, T); return 1300 * (0.35 * u + 0.65 * u * u); };
  function pileTop(T) {
    let y = 1160;
    for (let i = 0; i < PILE.length; i++) { const [t, v] = PILE[i], prev = i ? PILE[i - 1][1] : 1160; y += (v - prev) * Ez.outBack(clamp((T - t + 0.03) / (i === PILE.length - 1 ? 0.24 : 0.2)), 1.4); }
    return y + dropY(T);
  }
  function pipRoomState(T) {
    const la = Math.max(0, T - T_27);
    const land = T > T_27 - 0.3 ? 26 * Math.exp(-la * 6) * Math.sin(la * 13) : 0;
    const rise = T > 97.3 ? 0.3 * Math.max(0, 800 - (pileTop(T) - dropY(T))) : 0;
    const gx = PIP_R[0] + (T > 97.4 ? 6 * Math.sin(T * 9) : 0);
    const gy = PIP_R[1] + land - rise + (T > 97.1 ? 8 * hopB(T) : 0) + dropY(T);
    const armA = lerp(0.55, 0.3, sstep(97.3, 98.1, T)) + 0.03 * Math.sin(T * 2.1);
    const hand = [gx + PIP_SH[0] + Math.sin(armA) * ARM_L, gy + PIP_SH[1] - Math.cos(armA) * ARM_L];
    const lr = 0.32 * Math.exp(-la * 2.2) * Math.sin(la * 6.5) + 0.05 * Math.sin(T * 1.8) + 0.12 * pulse(T, W_PDOOM, 4) * Math.sin((T - W_PDOOM) * 12) + (T > 97.1 ? 0.1 * Math.sin(T * 7) : 0);
    const glass = [hand[0] - Math.sin(lr) * 112, hand[1] + Math.cos(lr) * 112];
    return { gx, gy, armA, hand, lr, glass };
  }
  const IRIS_C = pipRoomState(T_27).glass.map((v) => Math.round(v));
  function lanternNeedle(T) { const a = T - W_PDOOM; return pdoomAt(T) + (a > 0 ? 7 * Math.exp(-a * 6) * Math.sin(a * 22) : 0) + 1.5 * pulse(T, W_UPPING, 5) * Math.sin((T - W_UPPING) * 30); }
  function drawLantern(st, T) {
    const LS = 0.72;
    push(); translate(st.hand[0], st.hand[1] - 6); rotate(st.lr);
    spr('s10_lantern', 0, 0, { s: LS, seed: 51 });
    const hy = (214 - 12) * LS, v = lanternNeedle(T);
    const ang = Math.PI + clamp(v / 100) * Math.PI;
    segLine(0, hy, Math.cos(ang) * 40 * LS, hy + Math.sin(ang) * 40 * LS, PAL.ink, 5);
    segLine(0, hy, Math.cos(ang) * 38 * LS, hy + Math.sin(ang) * 38 * LS, PAL.coral, 2.4);
    disc(0, hy, 5, PAL.ink);
    pop();
  }
  function drawRoom(T, lit) {
    const st = pipRoomState(T);
    spr('s10_room', W / 2, H / 2, { s: 2, jit: 0 });
    const plushEyes = T > 97.95 ? 'ce_spiral' : lit ? 'ce_happy' : 'ce_sq';
    clawd(1690, 470 + (T > 97.9 ? 4 * Math.sin(T * 30) : 0), 0.2, { eyes: plushEyes, armL: 0.2, armR: 0.2, blush: true, seed: 4 });
    let face = 'pf_nervous';
    if (T < T_27 + 0.45) face = 'pf_shock';
    if (T > W_PDOOM - 0.02 && T < 96.9) face = 'pf_scared';
    if (T > 96.9) face = 'pf_shock';
    if (T > 97.45) face = 'pf_scared';
    if (T > 98.05) face = 'pf_dizzy';
    const armL = T > 97.3 ? 1.8 + 0.5 * Math.sin(T * 11) : 0.35 + 0.05 * Math.sin(T * 1.6);
    spr('s10_pip_arm_long', st.gx + PIP_SH[0], st.gy + PIP_SH[1], { r: Math.PI + st.armA, seed: 31 });
    pip(st.gx, st.gy, 1, { face, armL, armR: -0.4, headR: (T < 96.9 ? 0.1 : -0.1) + 0.04 * Math.sin(T * 1.3), seed: 3 });
    spr('s10_quilt', 1050, 920 + (T > 97.3 ? dropY(T) : 0), { jit: 0.5, sy: 1 + 0.04 * Math.exp(-Math.max(0, T - T_27) * 5) * Math.sin(Math.max(0, T - T_27) * 12) });
    drawLantern(st, T);
    return st;
  }
  // ---- L27: the quietest P(doom) ----
  shot({
    id: 'L27-lantern', t0: T_27, tin: { type: 'iris', d: 0.7, at: 0.5, c: IRIS_C },
    draw(s) {
      const T = s.T;
      const cm = roomCam(T);
      push(); cam(cm[0], cm[1], cm[2]);
      const st = drawRoom(T, false);
      pop();
      const warm = sstep(W_PDOOM, W_PDOOM + 0.35, T);
      const [lx, ly] = toScr(cm, st.glass[0], st.glass[1]);
      const flick = 1 + 0.05 * Math.sin(T * 13) + 0.04 * Math.sin(T * 21) + 0.1 * pulse(T, W_UPPING, 5);
      spr('s10_dark', lx, ly, { s: (5.4 + warm * 1.4) * cm[2] * (0.97 + 0.03 * flick), jit: 0 });
      // moonlight through the window
      const [wx, wy] = toScr(cm, 472, 262);
      glow(wx, wy, 70 * cm[2], PAL.butterLt, 0.55);
      blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.lilac, 0.07));
      const [a0x, a0y] = toScr(cm, 200, 180), [a1x, a1y] = toScr(cm, 560, 180), [a2x, a2y] = toScr(cm, 980, 1080), [a3x, a3y] = toScr(cm, 420, 1080);
      quad(a0x, a0y, a1x, a1y, a2x, a2y, a3x, a3y); blendMode(BLEND);
      // lantern light (cool, then warm on "P(doom)")
      const lc = mixc(PAL.mintLt, PAL.butter, warm);
      const [fx0, fy0] = toScr(cm, st.glass[0] + Math.sin(st.lr) * 34, st.glass[1] - Math.cos(st.lr) * 34);
      glow(lx, ly, (160 + 70 * warm) * cm[2] * flick, lc, 0.34 + 0.16 * warm);
      glow(fx0, fy0, 34 * cm[2] * flick, mixc(PAL.butterLt, PAL.orange, warm * 0.6), 0.55);
      const pa = T - W_PDOOM;
      if (pa > 0 && pa < 1.1) ringLine(lx, ly, (60 + pa * 420) * cm[2] * 0.7, PAL.butter, 6, 0.5 * (1 - pa / 1.1));
      // fireflies: drift, gather on "upping", scatter on "P(doom)"
      const gather = sstep(W_UPPING - 0.1, W_UPPING + 0.5, T) * (1 - sstep(W_PDOOM, W_PDOOM + 0.25, T));
      const scat = sstep(W_PDOOM, W_PDOOM + 0.8, T);
      for (let i = 0; i < 12; i++) {
        const bx = 200 + R(i, 61) * 1520, by = 180 + R(i, 62) * 620;
        let fx = bx + 70 * Math.sin(T * (0.6 + R(i, 63) * 0.5) + i * 2), fy = by + 45 * Math.sin(T * (0.8 + R(i, 64) * 0.6) + i);
        const ang = (i / 12) * TAU;
        fx = lerp(fx, lx + Math.cos(ang + T) * 110, gather * 0.75) + Math.cos(ang) * 160 * scat;
        fy = lerp(fy, ly + Math.sin(ang + T) * 80, gather * 0.75) + Math.sin(ang) * 120 * scat;
        const bl = 0.5 + 0.5 * Math.sin(T * (2 + R(i, 65) * 2) + i * 1.7);
        glow(fx, fy, 22, i % 3 ? PAL.butter : PAL.mint, 0.5 * bl + 0.1);
        disc(fx, fy, 3.2, PAL.butterLt, 0.5 + 0.5 * bl);
      }
      // the light front that becomes the lit room (the next shot's mask grows with it)
      const r = lightR(T);
      if (r > 0) { blendMode(ADD); ringLine(lx, ly, r + 30, PAL.butter, 60, 0.18); ringLine(lx, ly, r + 10, PAL.butterLt, 20, 0.3); blendMode(BLEND); }
    },
  });
  lyr(27, { y: 150, font: 'hand', size: 80, weight: 700, fill: PAL.lilacLt, anim: 'rise', words: { 1: { fill: PAL.white }, 3: { font: 'pixel', size: 78, fill: PAL.butter, anim: 'zoom', grow: 0.1 } } });

  // ---- L28: paperclips fill the room ----
  const LB0 = 96.54, LB1 = 97.14;
  function lightR(T) { const p = inv(LB0, LB1, T); return p <= 0 ? 0 : Ez.in(p) * 2300 + 6; }
  const STREAMS = [[250, 0.0], [560, 0.12], [880, 0.05], [1230, 0.18], [1540, 0.08], [1790, 0.22]];
  function fallingClips(T) {
    const t0 = 96.55, dt = 0.05, spread = 60 + 70 * sstep(W_FILL - 0.1, W_FILL + 0.1, T);
    for (let k = 0; k < STREAMS.length; k++) {
      const [sx, off] = STREAMS[k];
      const ts0 = t0 + off; if (T < ts0) continue;
      const nMax = Math.floor((T - ts0) / dt);
      for (let n = nMax; n >= Math.max(0, nMax - 13); n--) {
        const a = T - (ts0 + n * dt);
        const y = -110 + 1200 * a + 1600 * a * a;
        const x = sx + RS(n, k * 7 + 1) * spread + a * RS(n, k + 3) * 140;
        if (y > pileTop(T) + bumpY(x) + 30) continue;
        spr(CLIPS[(n + k) % CLIPS.length], x, y, { s: 0.45 + 0.15 * R(n, k + 9), r: R(n, k + 4) * TAU + a * 7 * RS(n, k + 5), seed: n + k });
      }
    }
  }
  shot({
    id: 'L28-clips', t0: T_28,
    tin: {
      type: 'mask', d: LB1 - LB0, at: (T_28 - LB0) / (LB1 - LB0),
      mask(p, T) {
        const cm = roomCam(T), st = pipRoomState(T);
        const [lx, ly] = toScr(cm, st.glass[0], st.glass[1]);
        const r = lightR(T);
        beginShape(); for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU; const rr = r * (1 + 0.05 * Math.sin(5 * a + T * 4) + 0.03 * Math.sin(9 * a - T * 3)); vertex(lx + Math.cos(a) * rr, ly + Math.sin(a) * rr); } endShape(CLOSE);
      },
    },
    draw(s) {
      const T = s.T;
      const cm = roomCam(T);
      const sh = T > 97.0 && T < 98.4 ? kick(T, 7) * 5 : 0;
      push(); shake(sh, 4); cam(cm[0], cm[1], cm[2]);
      const st = drawRoom(T, true);
      fallingClips(T);
      const top = pileTop(T);
      if (top < 1150) spr('s10_pile', 960, top, { s: 2, jit: 0.25 });
      for (let j = 0; j < 26; j++) {
        const x = -30 + j * 78 + RS(j, 41) * 22;
        spr(CLIPS[j % CLIPS.length], x, top + bumpY(x) + 6 + 5 * Math.sin(T * 3 + j), { s: 0.42 + 0.1 * R(j, 43), r: R(j, 44) * TAU + 0.2 * Math.sin(T * 2.5 + j), seed: j });
      }
      PILE.forEach(([t, v], i) => { for (let k = 0; k < 4; k++) burst(T, t + 0.05, 300 + k * 440 + i * 60, v + 20, { n: 5, names: CLIPS, spd: 700, g: 2400, life: 0.7, s: 0.4, spread: 1.6, ang0: -Math.PI / 2, seed: i * 20 + k * 5 }); });
      const buried = st.glass[1] > top + 40;
      pop();
      const [lx, ly] = toScr(cm, st.glass[0], st.glass[1]);
      if (T < 97.4) { blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.butter, 0.22 * (1 - inv(96.7, 97.4, T)))); rect(-10, -10, W + 20, H + 20); blendMode(BLEND); }
      glow(lx, ly, buried ? 150 : 90, PAL.butter, buried ? 0.55 : 0.3);
    },
  });
  lyr(28, { y: 972, font: 'hand', size: 90, weight: 700, anim: 'drop', cols: [PAL.white, PAL.skyLt, PAL.white, PAL.white, PAL.butter], words: { 1: { size: 104, jitter: 2 }, 2: { grow: 0.12 }, 4: { size: 106, grow: 0.1 } } });

  // ======================================================================
  // L29: Killswitch guys on PTO (sunset beach, postcard lead-out)
  // ======================================================================
  defS('s10_beach', 1000, 580, () => {
    gradRect(-20, -20, 1040, 160, mixc(PAL.lilac, PAL.pink, 0.3), PAL.pink);
    gradRect(-20, 139, 1040, 160, PAL.pink, mixc(PAL.orange, PAL.butter, 0.55));
    blob(260, 150, 120, PAL.pink, 50, 0.1); blob(560, 120, 110, mixc(PAL.lilac, PAL.pink, 0.5), 45, 0.1);
    blob(720, 280, 150, PAL.butterLt, 90, 0.2);
    flushB();
    for (const [x, y, w] of [[180, 90, 260], [560, 150, 200], [880, 70, 180]]) { flat(ellPts(x, y, w / 2, 12, 24), lite(PAL.lilac, 0.35), 0.8); flat(ellPts(x + 10, y - 3, w / 2 - 20, 6, 24), PAL.pinkLt, 0.6); }
    paint(ellPts(720, 292, 80, 80, 48), PAL.butter, { baseC: PAL.butterLt, lw: 2, bleed: 0.01 });
    const sea = [[-20, 290], [1020, 290], [1020, 410], [-20, 410]];
    flat(sea, mixc(PAL.skyLt, PAL.lilacLt, 0.4)); paint(inB(sea, 1000, 580), mixc(PAL.sky, PAL.lilac, 0.35), { base: false, a: 170, lw: 1.6, bleed: 0.01 });
    flushB();
    for (let i = 0; i < 9; i++) flat(rrPts(720 - (60 - i * 5) + random(-8, 8), 300 + i * 11, 120 - i * 10, 4, 2), PAL.butterLt, 0.85);
    for (let i = 0; i < 14; i++) flat(rrPts(random(1000), 300 + random(100), 30 + random(50), 3, 1), PAL.pinkLt, 0.6);
    const sTop = (x) => 392 + Math.sin(x * 0.01) * 8;
    const sand = [[-20, 600]]; for (let x = -20; x <= 1020; x += 40) sand.push([x, sTop(x)]); sand.push([1020, 600]);
    const sandB = [[4, 575]]; for (let x = 4; x < 996; x += 40) sandB.push([x, sTop(x)]); sandB.push([996, sTop(996)], [996, 575]);
    flat(sand, lite(PAL.butterLt, 0.3)); paint(sandB, PAL.butterLt, { base: false, a: 180, lw: 1.8, bleed: 0.01 });
    blob(250, 480, 80, PAL.peach, 60, 0.1); blob(760, 490, 70, PAL.peach, 50, 0.1);
    flushB();
    for (let i = 0; i < 26; i++) flat(ellPts(random(1000), 420 + random(160), 2, 2, 6), PAL.brownLt, 0.5);
    paint(starPts(120, 520, 16, 7, 5), PAL.coralLt, { baseC: PAL.peach, lw: 1.2, bleed: 0.01 });
    // palm tree
    const trunk = []; const tr = []; for (let i = 0; i <= 10; i++) { const t = i / 10; const x = lerp(962, 902, t * t), y = lerp(600, 228, t), w = lerp(15, 8, t); trunk.push([x - w, y]); tr.push([x + w, y]); }
    paint(inB([...trunk, ...tr.reverse()], 1000, 580), PAL.brownLt, { baseC: lite(PAL.brownLt, 0.2), lw: 1.8, bleed: 0.01 });
    const fronds = []; for (let i = 0; i < 6; i++) { const a = -Math.PI + i * 0.55 - 0.2; const tip = [900 + Math.cos(a) * 120, 230 + Math.sin(a) * 60 + 40]; fronds.push(inB([[900, 228], [lerp(900, tip[0], 0.5) - 10, lerp(228, tip[1], 0.5) - 26], tip, [lerp(900, tip[0], 0.5) + 10, lerp(228, tip[1], 0.5) + 6]], 1000, 580)); }
    for (const f of fronds) flat(f, PAL.mint);
    wc(PAL.green, 120, 0.01, 0.5, 0.5); for (const f of fronds) brush.polygon(f); brush.noFill();
    pen(PAL.ink, 1.4, '2B'); for (const f of fronds) brush.polygon(f);
  });
  defS('s10_umbrella', 540, 600, () => {
    paint(rrPts(262, 150, 16, 440, 6), PAL.cream, { baseC: PAL.white, lw: 1.8, bleed: 0.01 });
    const cx = 270, top = 40, rx = 250, bot = 220;
    const dome = []; for (let i = 0; i <= 40; i++) { const a = Math.PI + (i / 40) * Math.PI; dome.push([cx + Math.cos(a) * rx, bot + Math.sin(a) * (bot - top)]); }
    const scal = []; for (let i = 0; i <= 6; i++) { const x0 = cx - rx + (i / 6) * 2 * rx; scal.push([x0, bot]); if (i < 6) scal.push([x0 + rx / 6, bot + 22]); }
    const shape = [...dome, ...scal.reverse()];
    paint(shape, PAL.coral, { baseC: PAL.coralLt, lw: 2.2, bleed: 0.01 });
    flushB();
    for (let k = 1; k < 6; k += 2) {
      const x0 = cx - rx + (k / 6) * 2 * rx, x1 = cx - rx + ((k + 1) / 6) * 2 * rx;
      const pts = [[cx, top + 4]];
      for (let i = 0; i <= 6; i++) { const x = lerp(x0, x1, i / 6); pts.push([x, bot + (i === 0 || i === 6 ? 0 : 22 * Math.sin((i / 6) * Math.PI))]); }
      flat(pts, PAL.cream, 0.95);
    }
    pen(PAL.ink, 1.4, 'pen'); for (let k = 0; k <= 6; k++) brush.line(cx, top + 4, cx - rx + (k / 6) * 2 * rx, bot);
    flushB();
    paint(ellPts(cx, top, 12, 12, 16), PAL.butter, { baseC: PAL.butterLt, lw: 1.6, bleed: 0.01 });
  }, { ay: 590 / 600 });
  // front-view beach chair: striped sling back, wooden frame; hip point at (150,215)
  defS('s10_chair', 300, 330, () => {
    paint(rrPts(34, 10, 20, 316, 6), PAL.brownLt, { baseC: lite(PAL.brownLt, 0.2), lw: 1.8, bleed: 0.01 });
    paint(rrPts(246, 10, 20, 316, 6), PAL.brownLt, { baseC: lite(PAL.brownLt, 0.2), lw: 1.8, bleed: 0.01 });
    const sling = [[54, 24], [246, 24], [238, 222], [62, 222]];
    paint(sling, PAL.white, { baseC: PAL.white, lw: 2, bleed: 0.01 });
    flushB();
    for (let i = 0; i < 4; i++) { const x0 = lerp(54, 246, (2 * i) / 8), x1 = lerp(54, 246, (2 * i + 1) / 8); flat([[x0 + 1, 26], [x1, 26], [lerp(62, 238, (2 * i + 1) / 8), 220], [lerp(62, 238, (2 * i) / 8) + 1, 220]], PAL.mint, 0.95); }
    pen(PAL.ink, 1.8, '2B'); brush.polygon(sling);
  }, { ay: 215 / 330 });
  defS('s10_chair_bar', 300, 60, () => {
    paint(rrPts(20, 16, 260, 24, 10), PAL.brown, { baseC: PAL.brownLt, lw: 1.8, bleed: 0.01 });
  });
  defS('s10_coconut', 130, 160, () => {
    const umb = [[40, 40], [60, 10], [80, 40]], straw = rrPts(84, 14, 8, 64, 3), shell = ellPts(65, 104, 46, 42, 32), rim = ellPts(65, 74, 44, 12, 24);
    flat(umb, PAL.mint); flat(straw, PAL.pink); flat(shell, PAL.brownLt); flat(rim, PAL.white);
    wc(PAL.brown, 120, 0.01, 0.5, 0.5); brush.polygon(shell); brush.noFill();
    flat(rim, PAL.cream);
    pen(PAL.ink, 1.6, '2B'); brush.polygon(umb); brush.polygon(straw); brush.polygon(shell); brush.polygon(rim);
    pen(PAL.ink, 1.6, 'pen'); brush.line(60, 40, 64, 70);
    pen(dark(PAL.brown, 0.3), 1.2, 'pen'); for (let i = 0; i < 5; i++) brush.line(34 + i * 14, 92, 38 + i * 13, 130);
  });
  defS('s10_ks_base', 500, 460, () => {
    const body = [[110, 120], [390, 120], [420, 440], [80, 440]];
    paint(body, mixc(PAL.gray, PAL.lilac, 0.25), { baseC: mixc(PAL.grayLt, PAL.lilacLt, 0.3), lw: 2.4, bleed: 0.01 });
    flushB();
    flat([[106, 138], [394, 138], [398, 182], [102, 182]], PAL.butter);
    for (let i = 0; i < 9; i++) { const x = 100 + i * 36; flat([[Math.max(104, x), 138], [Math.min(396, x + 18), 138], [Math.min(400, Math.max(102, x + 2)), 182], [Math.max(100, x - 16), 182]], PAL.ink, 0.9); }
    wc(mixc(PAL.gray, PAL.ink, 0.25), 60, 0.01, 0.5, 0.4); brush.rect(96, 330, 316, 104); brush.noFill();
    paint(ellPts(250, 116, 160, 34, 40), PAL.gray, { baseC: lite(PAL.gray, 0.25), lw: 2.2, bleed: 0.01 });
    pen(PAL.ink, 2, '2B'); brush.line(104, 138, 396, 138); brush.line(100, 182, 400, 182);
  }, { ay: 440 / 460 });
  defS('s10_ks_dome', 340, 200, () => {
    const pts = []; for (let i = 0; i <= 30; i++) { const a = Math.PI + (i / 30) * Math.PI; pts.push([170 + Math.cos(a) * 140, 180 + Math.sin(a) * 150]); }
    paint(pts, PAL.red, { baseC: mixc(PAL.red, PAL.coral, 0.45), a: 170, lw: 2.4, bleed: 0.01 });
    wc(dark(PAL.red, 0.3), 70, 0.01); brush.circle(220, 170, 80); brush.noFill();
    flushB();
    flat(ellPts(118, 94, 24, 38, 20), PAL.white, 0.55);
    flat(ellPts(106, 138, 8, 10, 10), PAL.white, 0.4);
  }, { ay: 180 / 200 });
  defS('s10_ooo', 390, 210, () => {
    paint(rrPts(20, 26, 350, 160, 10), PAL.white, { baseC: PAL.white, lw: 2, bleed: 0.01, a: 60 });
    flushB();
    const t1 = textImg('OUT OF', { font: 'display', size: 58, fill: PAL.ink, weight: 700 });
    const t2 = textImg('OFFICE', { font: 'display', size: 58, fill: PAL.red, weight: 700 });
    image(t1.img, 195 - t1.w / 2, 72 - t1.h / 2); image(t2.img, 195 - t2.w / 2, 138 - t2.h / 2);
    for (const [x, y, r] of [[40, 30, -0.6], [350, 30, 0.6]]) { const [ax, ay] = rot2(34, 0, r), [bx, by] = rot2(0, 12, r); flat([[x - ax - bx, y - ay - by], [x + ax - bx, y + ay - by], [x + ax + bx, y + ay + by], [x - ax + bx, y - ay + by]], PAL.butterLt, 0.8); }
  });
  defS('s10_card', 1000, 580, () => {
    const o = 12, b = 44, pc = mixc(PAL.paper, PAL.cream, 0.3);
    for (const r of [[o, o, 1000 - 2 * o, b], [o, 580 - o - b, 1000 - 2 * o, b], [o, o, b, 580 - 2 * o], [1000 - o - b, o, b, 580 - 2 * o]]) flat(rrPts(r[0], r[1], r[2], r[3], 1), pc);
    for (let i = 0; i < 24; i++) { const t = i / 24; flat(ellPts(o + 30 + t * 920, i % 2 ? o + b / 2 : 580 - o - b / 2, 26, 9, 12), PAL.cream, 0.6); }
    pen(PAL.ink, 2.4, '2B'); brush.polygon(rrPts(o, o, 1000 - 2 * o, 580 - 2 * o, 8));
    pen(PAL.inkSoft, 1.4, 'pen'); brush.rect(o + b, o + b, 1000 - 2 * o - 2 * b, 580 - 2 * o - 2 * b);
    flushB();
    // stamp
    const sx = 842, sy = 70, sw = 92, sh = 108;
    flat(rrPts(sx, sy, sw, sh, 2), PAL.white);
    for (let i = 0; i <= 9; i++) { flat(ellPts(sx + (i / 9) * sw, sy, 4, 4, 8), PAL.pinkLt); flat(ellPts(sx + (i / 9) * sw, sy + sh, 4, 4, 8), PAL.pinkLt); }
    flat(rrPts(sx + 10, sy + 10, sw - 20, sh - 20, 3), PAL.skyLt);
    flat(ellPts(sx + sw / 2, sy + 56, 18, 18, 20), PAL.butter);
    flat(rrPts(sx + 10, sy + 66, sw - 20, 32, 2), PAL.sky);
    flat(heartPts(sx + sw / 2, sy + 30, 14), PAL.coral);
    pen(PAL.inkSoft, 1.6, 'pen'); brush.circle(800, 118, 40); brush.circle(800, 118, 30);
    for (let i = 0; i < 4; i++) brush.spline([[700, 90 + i * 14], [730, 82 + i * 14], [760, 96 + i * 14], [790, 86 + i * 14]], 0.6);
  });

  // a researcher lounging in a front-view beach chair; returns the coconut position
  function lounger(x, y, s, o) {
    spr('s10_chair', x, y, { s, seed: o.seed });
    push(); translate(x, y); rotate(o.lean);
    pip(0, 58 * s, s, { body: o.body, arm: o.arm, head: o.head, face: 'pf_cool', armL: o.armL, armR: o.armR, legs: o.legs, headR: o.headR, flip: o.flip, seed: o.seed, blink: false });
    const sx = o.flip ? -1 : 1;
    const hx = sx * (56 + 82 * Math.sin(o.armR)) * s, hy = (58 - 138 + 82 * Math.cos(o.armR)) * s;
    spr('s10_coconut', hx, hy - 34 * s, { s: s * 0.95, r: sx * 0.15 + (o.sip || 0) * sx, flip: o.flip, seed: o.seed });
    pop();
    spr('s10_chair_bar', x, y + 12 * s, { s, seed: o.seed + 1 });
    const [ax, ay] = rot2(hx, hy - 50 * s, o.lean);
    return [x + ax, y + ay];
  }
  function postcardState(T) {
    const u = inv(99.5, 99.96, T);
    return { u, y: lerp(1780, 540, Ez.outBack(u, 1.05)), S: lerp(1.3, 1.96, Ez.out(u)), r: lerp(-0.16, 0, Ez.out(inv(99.5, 99.98, T))) };
  }
  function drawPostcard(T) {
    const pc = postcardState(T);
    if (pc.u <= 0) return;
    const S = pc.S, k = S / 1.96;
    push(); translate(960 + 30 * (1 - pc.u), pc.y); rotate(pc.r);
    noStroke(); fill(withAlphaCol(PAL.ink, 0.28 * (1 - sstep(0.8, 1, pc.u)))); rect(-490 * S + 22, -280 * S + 30, 980 * S, 560 * S, 14);
    spr('s10_beach', 0, 0, { s: 0.888 * S, jit: 0 });
    spr('s10_card', 0, 0, { s: S, jit: 0 });
    txt('Greetings from', -30 * S, -120 * S, { font: 'hand', size: 112, weight: 700, fill: PAL.white, stroke: PAL.ink, sw: 9, shadow: 'rgba(43,33,64,0.45)' }, { s: k, r: -0.05 });
    const cols = [PAL.coral, PAL.butter, PAL.mint];
    const popK = Ez.outBack(clamp((T - W_PTO + 0.05) / 0.32), 2.2);
    ['P', 'T', 'O'].forEach((ch, i) => {
      const wv = 7 * Math.sin(T * 4.5 + i * 1.3);
      txt(ch, (-150 + i * 150) * S, 40 * S + wv, { font: 'display', size: 290, weight: 700, fill: cols[i], stroke: PAL.ink, sw: 14, shadow: 'rgba(43,33,64,0.6)' }, { s: k * popK * (1 + 0.04 * Math.sin(T * 5 + i)), r: (i - 1) * 0.06 + 0.03 * Math.sin(T * 3 + i) });
    });
    pop();
  }
  function gull(x, y, s, T, i) {
    const f = Math.sin(T * 9 + i * 2) * 0.6;
    noFill(); stroke(PAL.white); strokeWeight(4 * s);
    beginShape(); vertex(x - 30 * s, y - 12 * s * f - 4 * s); vertex(x - 14 * s, y - 8 * s * f - 6 * s); vertex(x, y); vertex(x + 14 * s, y - 8 * s * f - 6 * s); vertex(x + 30 * s, y - 12 * s * f - 4 * s); endShape();
    noStroke();
  }

  shot({
    id: 'L29-pto', t0: T_29,
    tin: {
      type: 'mask', d: 0.5, at: 0.5,
      mask(p, T) {
        const e = pileTop(T) + 26;
        beginShape(); vertex(-20, -20); vertex(W + 20, -20);
        for (let x = W + 20; x >= -20; x -= 24) vertex(x, e + bumpY(x) + 6 * Math.sin(x * 0.2));
        endShape(CLOSE);
      },
    },
    draw(s) {
      const T = s.T;
      const Z = lerp(1.06, 1.0, Ez.out(inv(98.45, 99.7, T)));
      push(); cam(960 + 20 * Math.sin(T * 0.7), 530, Z);
      spr('s10_beach', W / 2, H / 2, { s: 2, jit: 0 });
      for (let i = 0; i < 12; i++) { const k = 0.5 + 0.5 * Math.sin(T * 3 + i * 2.1); spr('sparkW', 200 + R(i, 81) * 1500, 610 + R(i, 82) * 170, { s: 0.08 + 0.1 * k, a: k, seed: i }); }
      noFill();
      for (let w = 0; w < 2; w++) {
        const yo = 792 + w * 22 + 10 * Math.sin(T * 1.8 + w * 1.4);
        stroke(withAlphaCol(PAL.white, 0.85 - w * 0.3)); strokeWeight(6 - w * 2);
        beginShape(); for (let x = -40; x <= W + 40; x += 40) vertex(x, yo + 6 * Math.sin(x * 0.02 + T * 2 + w)); endShape();
      }
      noStroke();
      for (let i = 0; i < 3; i++) gull(fract(0.2 + i * 0.37 - (T - 98) * 0.06) * 2300 - 200, 210 + i * 70 + 20 * Math.sin(T * 1.5 + i), 1.1 - i * 0.2, T, i);
      // the giant kill switch, out of office
      const kh = T - W_KILL;
      const boing = kh > 0 ? Math.exp(-kh * 5) * Math.sin(kh * 22) : 0;
      const KS = 1.36, kx = 440, ky = 896;
      spr('s10_ks_base', kx, ky, { s: KS, seed: 61 });
      spr('s10_ks_dome', kx, ky - (440 - 110) * KS, { s: KS, sx: 1 + 0.12 * boing, sy: 1 - 0.2 * boing, seed: 62 });
      spr('s10_ooo', kx + 4, ky - 250 * KS, { s: 1.05, r: -0.07 + 0.08 * boing + 0.02 * Math.sin(T * 3), seed: 63 });
      if (kh > 0 && kh < 1) ringLine(kx, ky - 420 * KS, 80 + kh * 460, PAL.red, 8, 0.6 * (1 - kh));
      burst(T, W_KILL, kx, ky - 470 * KS, { n: 12, names: ['sparkW', 'spark'], spd: 650, g: 300, life: 0.8, s: 0.34, even: true, seed: 71 });
      // umbrella, chairs, researchers
      spr('s10_umbrella', 1240, 905, { s: 1.05, r: 0.02 * Math.sin(T * 1.3), seed: 64 });
      const cheer = sstep(W_GUYS - 0.08, W_GUYS + 0.12, T) * (1 - sstep(W_ON + 0.05, W_ON + 0.3, T));
      const sip = sstep(W_ON, W_ON + 0.2, T) * (1 - sstep(W_ON + 0.5, W_ON + 0.7, T));
      const bob = (i) => 3 * Math.sin(T * 2.2 + i * 1.7) + 4 * hopB(T + i * 0.2);
      const h1 = lounger(1060, 780 + bob(0), 0.84, { body: 'npc_body_mint', arm: 'npc_arm_mint', head: 'npc_head2', lean: -0.1, armL: 2.75, armR: lerp(1.25, 2.05, cheer), legs: [0.25 + 0.08 * Math.sin(T * 5), -0.2], headR: -0.12, seed: 7, sip: -0.5 * sip });
      const h2 = lounger(1420, 784 + bob(1), 0.84, { body: 'npc_body_butter', arm: 'npc_arm_butter', head: 'npc_head3', lean: 0.1, armL: 2.7, armR: lerp(1.2, 2.0, cheer), legs: [0.22, -0.24 - 0.08 * Math.sin(T * 5 + 1)], headR: 0.12, flip: true, seed: 9, sip: -0.5 * sip });
      burst(T, W_GUYS + 0.06, (h1[0] + h2[0]) / 2, Math.min(h1[1], h2[1]), { n: 8, names: ['sparkW', 'heart'], spd: 380, g: 200, life: 0.8, s: 0.28, even: true, seed: 77 });
      const gl = T - W_ON; if (gl > 0 && gl < 0.6) { spr('sparkW', 1030, 520, { s: 0.4 * Math.sin((gl / 0.6) * Math.PI), r: gl * 4 }); spr('sparkW', 1450, 524, { s: 0.35 * Math.sin((gl / 0.6) * Math.PI), r: -gl * 4 }); }
      pop();
      drawPostcard(T);
      // glossy sheen and twinkles once the card fills the frame
      const sh = inv(100.02, 100.5, T);
      if (sh > 0 && sh < 1) { const x = lerp(-400, 2400, sh); blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.white, 0.12)); quad(x, -20, x + 220, -20, x - 280, H + 20, x - 500, H + 20); blendMode(BLEND); }
      if (T > 99.9) twinkles(T, 7, 91, [160, 140, 1600, 800], ['sparkW'], 0.12, 0.3, 3);
    },
  });
  // L29 flies up out of frame as the postcard settles, so it never collides with s11's L30 in the top band
  lyr(29, { x: 1030, y: (T) => 150 - 300 * Ez.inQuad(inv(100.02, 100.3, T)), font: 'hand', size: 92, weight: 700, anim: 'pop', cols: [PAL.white], words: { 0: { fill: PAL.red, size: 104, jitter: 1.5 }, 1: { fill: PAL.mint }, 3: { hide: true, draw: () => {} } } });
})();

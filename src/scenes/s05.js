// s05.js - S05 "Stable training run and singularity" (35.50-44.74), lyric lines L11-L12.
// L11: the iris from s04's red eye opens on a sleepy sun at (960, 500); the camera tilts down to a meadow with a red
// barn wearing a "STABLE" sign. Clawd (jockey headband) rides a cream pony round a little oval track while Pip times
// the laps with a stopwatch and a clipboard loss curve. From 40.5 the sky dims and a tiny black dot blips in overhead.
// L12: the dot pops open into a watercolor singularity; clouds, sun, flowers, hay, sign letters, the pony, a paperclip
// and Pip are pulled in piece by piece, then the whole meadow drains into (960, 540) for s06's swirl.
(() => {
  // ================= timing =================
  const nearBeat = (t) => BEATS.reduce((b, x) => (Math.abs(x - t) < Math.abs(b - t) ? x : b), BEATS[0]);
  const tWe = wordT(11, 0), tHad = wordT(11, 1), tStable = wordT(11, 3), tTrain = wordT(11, 4), tRun = wordT(11, 5);
  const tBut = wordT(12, 0), tNow = wordT(12, 1), tThe = wordT(12, 2), tSing = wordT(12, 3), tBegun = wordT(12, 4);
  const tDot = nearBeat(40.7); // the black dot blips in on a beat
  const LAP = tRun - tWe; // one lap: the pony crosses the finish line on "We" and again on "run,"
  const CLICKS = [tWe - LAP, tWe, tRun];
  const RIP = [42.1, 42.54, 43.0, 43.45, 43.9].map(nearBeat).concat([tBegun + 0.06]); // S-T-A-B-L-E rip off on beats
  const tGone = 44.62; // everything has drained into the centre
  const TILT = [35.8, 37.95];

  const tiltE = (T) => Ez.inOut(inv(TILT[0], TILT[1], T));
  // parallax push-down (px) while the camera is still looking at the sky; f = layer depth factor
  const par = (T, f) => 900 * (1 - tiltE(T)) * f;
  const dimAt = (T) => 0.4 * sstep(40.45, 41.1, T) + 0.6 * sstep(41.1, 42.1, T);
  const windAt = (T) => 0.45 * sstep(tBut, tNow, T) + 0.55 * sstep(tNow, tSing, T);
  const drainK = (T) => { const u = inv(tBegun, tGone, T); return 0.5 * Ez.inOut(u) + 0.5 * u * u; };
  const bump = (a, b, T, fall = 0.25) => sstep(a, a + 0.08, T) * (1 - sstep(b, b + fall, T));
  const rgba = (hex, a) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${clamp(a)})`; };

  // vortex centre, radius and spin (spin is counter-clockwise to match s06's swirl transition)
  function vC(T) { const e = Ez.inOut(inv(tSing, 44.1, T)); return [960, lerp(330, 540, e)]; }
  function vR(T) {
    if (T < tDot) return 0;
    let r = 6 * Ez.outBack(inv(tDot, tDot + 0.15, T), 3) + 8 * inv(tDot, tBut, T);
    r += 100 * Ez.outBack(inv(tBut, tBut + 0.3, T), 2.2) + 40 * inv(tBut + 0.3, tSing, T);
    r += 380 * Ez.outBack(inv(tSing, tSing + 0.55, T), 1.4) + 260 * inv(tSing + 0.55, tBegun, T);
    r += 760 * Ez.in(inv(tBegun, 44.5, T));
    return r * (1 + (T > tBut ? 0.035 : 0.12) * kick(T, 5));
  }
  const vSpin = (T) => -(1.7 * Math.max(0, T - tBut) + 1.1 * Math.max(0, T - tSing) ** 2);
  const coreR = (T) => clamp(vR(T) * 0.19, 0, 92);

  // spiral path into the vortex. it: { x, y (position at lift time tl), tl, D, turns, s, r, spin }
  function fly(T, it) {
    const age = T - it.tl;
    if (age < 0) return null;
    const q = clamp(age / it.D);
    const C0 = vC(it.tl), C = vC(T);
    const dx = it.x - C0[0], dy = it.y - C0[1];
    const r0 = Math.hypot(dx, dy), th0 = Math.atan2(dy, dx);
    const rr = r0 * (1 - Math.pow(q, 1.5));
    const th = th0 - (it.turns ?? 0.9) * TAU * q * q;
    return {
      x: C[0] + Math.cos(th) * rr, y: C[1] + Math.sin(th) * rr, q,
      s: (it.s ?? 1) * (1 - 0.94 * Ez.in(q)),
      r: (it.r || 0) - (it.spin ?? 1) * TAU * q * (0.4 + q),
      a: 1 - sstep(0.86, 1, q),
    };
  }
  // pre-lift rattle (0..1) for an item lifting at tl
  const rattle = (T, tl) => windAt(T) * sstep(tl - 0.6, tl, T);

  // tiny 2D affine helper (to hand Clawd off the flying pony without a pop)
  const MX = {
    mul: (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]],
    t: (x, y) => [1, 0, 0, 1, x, y],
    r: (a) => [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0],
    s: (x, y) => [x, 0, 0, y, 0, 0],
    ap: (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]],
  };
  const chain = (...ms) => ms.reduce((a, b) => MX.mul(a, b));

  // ================= sprites: sky =================
  defSprite('s05_sky', 1000, 580, () => {
    wash(-40, -40, 1080, 300, PAL.sky, 90, 0.2);
    wash(-40, 240, 1080, 400, PAL.skyLt, 110, 0.2);
    blob(220, 160, 170, '#FFFFFF', 70, 0.35);
    blob(760, 110, 200, PAL.skyLt, 90, 0.35);
    blob(560, 430, 240, '#FFFFFF', 80, 0.35);
  });
  defSprite('s05_void', 1000, 580, () => {
    flat([[-10, -10], [1010, -10], [1010, 590], [-10, 590]], '#1B1638');
    blob(260, 170, 250, '#3A2A78', 120, 0.4);
    blob(760, 380, 280, '#26357A', 110, 0.4);
    blob(540, 110, 190, '#5B2F6E', 90, 0.4);
    blob(900, 90, 150, '#3F2A70', 90, 0.4);
  });
  defSprite('s05_sun', 300, 300, () => {
    paint(ellPts(150, 150, 108, 108, 56), PAL.butter, { baseC: '#FFE27A', a: 170, lw: 2.4, lc: PAL.orange });
    blob(160, 178, 78, PAL.orange, 40, 0.3);
    blob(116, 108, 30, '#FFFFFF', 130, 0.2);
  }, { v: 2 });
  defSprite('s05_sun_rays', 480, 480, () => {
    for (const [off, r2, c] of [[TAU / 12, 196, PAL.orange], [0, 228, PAL.butter]]) {
      const pts = [];
      for (let i = 0; i < 6; i++) { const a = off + (i / 6) * TAU; pts.push([240 + Math.cos(a - 0.16) * 110, 240 + Math.sin(a - 0.16) * 110], [240 + Math.cos(a) * r2, 240 + Math.sin(a) * r2], [240 + Math.cos(a + 0.16) * 110, 240 + Math.sin(a + 0.16) * 110], [240 + Math.cos(a + TAU / 12) * 96, 240 + Math.sin(a + TAU / 12) * 96]); }
      paint(rrPtsPoly(pts, 10), c, { baseC: lite(c, 0.25), lw: 1.6, lc: PAL.orange, bleed: 0.02 });
    }
  });
  const sunFace = (name, fn) => defSprite(name, 200, 130, fn);
  const sunCheeks = () => { blob(38, 82, 14, PAL.pink, 130, 0.3); blob(162, 82, 14, PAL.pink, 130, 0.3); };
  sunFace('s05_sf_sleep', () => {
    pen(PAL.ink, 4, 'pen'); brush.spline([[46, 54], [61, 64], [76, 54]], 0.5); brush.spline([[124, 54], [139, 64], [154, 54]], 0.5); brush.noStroke();
    sunCheeks(); strokePath([[90, 92], [100, 97], [110, 92]], PAL.ink, 2.6, 'pen', 0.5);
  });
  sunFace('s05_sf_happy', () => {
    pen(PAL.ink, 4.5, 'pen'); brush.spline([[46, 62], [61, 44], [76, 62]], 0.5); brush.spline([[124, 62], [139, 44], [154, 62]], 0.5); brush.noStroke();
    sunCheeks(); paint([[78, 84], [122, 84], [112, 106], [88, 106]], PAL.red, { baseC: '#FF7A88', lw: 1.8 });
  });
  sunFace('s05_sf_worry', () => {
    for (const x of [61, 139]) { flat(ellPts(x, 56, 11, 13, 16), PAL.ink); flat(ellPts(x - 3, 51, 3.5, 3.5, 8), '#FFFFFF'); }
    strokePath([[44, 34], [74, 40]], PAL.ink, 3, 'pen', 0.3); strokePath([[126, 40], [156, 34]], PAL.ink, 3, 'pen', 0.3);
    sunCheeks(); strokePath([[78, 100], [88, 94], [100, 100], [112, 94], [122, 100]], PAL.ink, 2.8, 'pen', 0.3);
    paint([[176, 20], [186, 44], [176, 52], [166, 44]], PAL.sky, { baseC: '#BFE4FF', lw: 1.2 });
  });
  sunFace('s05_sf_shock', () => {
    for (const x of [61, 139]) { paint(ellPts(x, 54, 16, 18, 20), '#FFFFFF', { baseC: '#FFFFFF', lw: 2 }); flat(ellPts(x, 56, 5, 5, 10), PAL.ink); }
    paint(ellPts(100, 98, 14, 18, 20), PAL.ink, { baseC: '#3A2E4A', lw: 1.4 });
  });
  for (const [nm, c] of [['s05_bird', PAL.sky], ['s05_birdP', PAL.pink]]) {
    defSprite(nm, 100, 80, (v) => {
      const tail = [[26, 46], [6, 34], [10, 56]], beak = [[74, 42], [90, 47], [74, 53]];
      const wing = v === 0 ? [[36, 42], [52, 6], [68, 38]] : [[36, 46], [54, 76], [68, 48]];
      flat(tail, lite(c, 0.2)); flat(beak, PAL.orange);
      paint(ellPts(48, 46, 28, 22, 24), c, { baseC: lite(c, 0.35), lw: 1.8 });
      flat(wing, lite(c, 0.4));
      pen(PAL.ink, 1.4, '2B'); brush.polygon(tail); brush.polygon(beak); brush.polygon(wing); brush.noStroke();
      flat(ellPts(64, 40, 3.5, 4.2, 10), PAL.ink);
      blob(64, 52, 5, PAL.pinkLt, 160, 0.2);
    }, { v: 2 });
  }

  // ================= sprites: land =================
  const hillY = (x, y0, amp, f, ph) => y0 - amp * (0.5 + 0.5 * Math.sin(x * f + ph)) - amp * 0.25 * Math.sin(x * f * 2.3 + ph * 2);
  // big concave shapes use flat fills + circle/rect washes + pencil lines (p5.brush polygon fills spike on them)
  const ridge = (y0, amp, f, ph) => { const pts = []; for (let x = -40; x <= 1040; x += 20) pts.push([x, hillY(x, y0, amp, f, ph)]); return pts; };
  defSprite('s05_hills', 1000, 300, () => {
    const far = mixc(PAL.grass, PAL.skyLt, 0.38), near = mixc(PAL.grass, PAL.mint, 0.2);
    const r1 = ridge(150, 60, 0.008, 1.2), r2 = ridge(210, 45, 0.011, 4.0);
    flat([...r1, [1040, 320], [-40, 320]], far);
    for (let i = 0; i < 3; i++) blob(150 + i * 340, 250, 70, mixc(far, PAL.skyLt, 0.3), 70, 0.15);
    strokePath(r1, PAL.inkSoft, 1.5, '2B', 0.5);
    pen(PAL.ink, 1.2, '2B');
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 175 + random() * 50, y = hillY(x, 150, 60, 0.008, 1.2) + 8, cn = ellPts(x, y - 30, 14, 17, 16);
      flat(rrPts(x - 2, y - 20, 4, 20, 2), PAL.brown); flat(cn, mixc(PAL.grassDk, PAL.skyLt, 0.2)); brush.polygon(cn);
    }
    brush.noStroke();
    flat([...r2, [1040, 320], [-40, 320]], near);
    for (let i = 0; i < 3; i++) blob(120 + i * 360, 285, 55, mixc(near, PAL.grassDk, 0.3), 70, 0.15);
    strokePath(r2, PAL.ink, 1.7, '2B', 0.5);
  });
  defSprite('s05_meadow', 1000, 320, () => {
    const top = []; for (let x = -40; x <= 1040; x += 25) top.push([x, 60 + Math.sin(x * 0.013) * 6 + Math.sin(x * 0.041) * 3]);
    flat([...top, [1040, 330], [-40, 330]], mixc(PAL.grass, PAL.mint, 0.08));
    wash(-40, 250, 1080, 110, PAL.grassDk, 80, 0.15);
    for (const [x, y, r, c, a] of [[200, 190, 90, PAL.butterLt, 50], [700, 140, 80, PAL.mintLt, 60], [520, 270, 110, PAL.grassDk, 60], [880, 240, 90, PAL.grassDk, 50], [90, 280, 80, PAL.grassDk, 50]]) blob(x, y, r, c, a, 0.3);
    for (let i = 0; i < 70; i++) { const x = random() * 1000, y = 80 + random() * 230; flat(ellPts(x, y, 2.5, 2.5, 8), [PAL.pinkLt, PAL.butterLt, '#FFFFFF', PAL.lilacLt][i % 4], 0.9); }
    strokePath(top, PAL.ink, 1.8, '2B', 0.5);
  });
  // oval track: outer dirt ellipse, infield on top (inner ellipse nudged up for perspective), finish checkers at the front
  defSprite('s05_track', 700, 220, () => {
    paint(ellPts(350, 110, 232, 72, 72), '#E6C49C', { baseC: '#EDCFA8', a: 130, lw: 1.8, bleed: 0.015 });
    for (let i = 0; i < 60; i++) { const a = random() * TAU; flat(ellPts(350 + Math.cos(a) * (215 + random() * 10), 108 + Math.sin(a) * (58 + random() * 8), 2 + random() * 2.5, 1.5 + random() * 1.5, 8), PAL.brownLt, 0.7); }
    paint(ellPts(350, 104, 198, 44, 72), PAL.grass, { baseC: mixc(PAL.grass, PAL.mint, 0.15), a: 120, lw: 1.6, bleed: 0.015 });
    pen('#FFFFFF', 3.4, 'marker'); brush.spline(ellPts(350, 104, 201, 47, 40).concat([ellPts(350, 104, 201, 47, 40)[0]]), 0.5); brush.noStroke();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) flat([[344 + c * 7, 150 + r * 8], [351 + c * 7, 150 + r * 8], [351 + c * 7, 158 + r * 8], [344 + c * 7, 158 + r * 8]], (r + c) % 2 ? '#FFFFFF' : PAL.ink, 0.95);
  });
  defSprite('s05_barn', 460, 460, () => {
    const red = PAL.red, roof = mixc(PAL.brown, PAL.ink, 0.35);
    const fac = [[70, 432], [70, 205], [112, 128], [230, 70], [348, 128], [390, 205], [390, 432]];
    paint(fac, red, { baseC: '#F0566A', a: 150, lw: 2.4, bleed: 0.015 });
    const topAt = (x) => (x < 112 ? lerp(205, 128, (x - 70) / 42) : x < 230 ? lerp(128, 70, (x - 112) / 118) : x < 348 ? lerp(70, 128, (x - 230) / 118) : lerp(128, 205, (x - 348) / 42));
    pen(dark(red, 0.35), 1.3, 'pen'); for (let x = 98; x < 388; x += 29) brush.line(x, topAt(x) + 10, x, 428); brush.noStroke();
    const outer = [[42, 222], [96, 116], [230, 42], [364, 116], [418, 222]];
    const inner = [[76, 210], [120, 134], [230, 76], [340, 134], [384, 210]];
    paint([...outer, ...inner.slice().reverse()], roof, { baseC: lite(roof, 0.12), a: 160, lw: 2.2, bleed: 0.015 });
    // hayloft
    paint(rrPts(198, 116, 64, 60, 6), '#4A2438', { baseC: '#5E2F48', lw: 2 });
    paint([[200, 176], [206, 150], [218, 162], [228, 146], [240, 160], [252, 148], [260, 176]], PAL.butter, { baseC: PAL.butterLt, lw: 1.4 });
    pen('#FFFFFF', 6, 'marker'); brush.rect(196, 114, 68, 64); brush.noStroke();
    // doors with white X trim
    paint(rrPts(140, 286, 180, 146, 4), dark(red, 0.18), { baseC: mixc(red, '#FFFFFF', 0.12), lw: 2 });
    pen('#FFFFFF', 7, 'marker');
    brush.rect(140, 286, 180, 146); brush.line(230, 286, 230, 432);
    brush.line(144, 290, 226, 428); brush.line(226, 290, 144, 428); brush.line(234, 290, 316, 428); brush.line(316, 290, 234, 428);
    brush.line(73, 208, 73, 430); brush.line(387, 208, 387, 430);
    brush.noStroke();
    // little lantern by the door
    paint(rrPts(106, 300, 20, 28, 6), PAL.butter, { baseC: PAL.butterLt, lw: 1.4 });
  }, { ax: 0.5, ay: 432 / 460 });
  defSprite('s05_sign', 290, 100, () => {
    paint(rrPts(14, 12, 262, 72, 14), PAL.cream, { baseC: '#FFFBF0', lw: 2.6 });
    wc(PAL.butterLt, 90, 0.1); brush.rect(24, 60, 242, 18); brush.noFill();
    for (const [x, y] of [[28, 26], [262, 26], [28, 70], [262, 70]]) flat(ellPts(x, y, 3.5, 3.5, 10), PAL.gray);
  });
  defSprite('s05_hay', 160, 130, () => {
    paint(rrPts(14, 26, 128, 94, 44), PAL.butter, { baseC: PAL.butterLt, a: 160, lw: 2 });
    paint(ellPts(116, 73, 28, 45, 28), PAL.gold, { baseC: '#FFD878', lw: 1.8 });
    const sp = []; for (let i = 0; i < 26; i++) { const a = i * 0.55, r = 2 + i * 0.95; sp.push([116 + Math.cos(a) * r * 0.62, 73 + Math.sin(a) * r]); }
    strokePath(sp, dark(PAL.gold, 0.25), 1.8, 'pen', 0.5);
    pen(dark(PAL.gold, 0.2), 1.6, 'pen'); for (let i = 0; i < 12; i++) { const x = 26 + random() * 70, y = 34 + random() * 76; brush.line(x, y, x + 10 + random() * 8, y + random() * 4 - 2); } brush.noStroke();
    pen(PAL.red, 3.2, 'marker'); brush.line(52, 28, 52, 118); brush.noStroke();
  }, { ax: 0.5, ay: 120 / 130 });
  defSprite('s05_fence', 440, 150, () => {
    const shapes = [rrPts(10, 42, 420, 16, 5), rrPts(10, 86, 420, 16, 5)];
    for (const x of [20, 206, 392]) shapes.push([[x, 30], [x + 14, 18], [x + 28, 30], [x + 28, 140], [x, 140]]);
    for (const sh of shapes) flat(sh, '#FFFFFF');
    for (const x of [20, 206, 392]) flat(rrPts(x + 18, 34, 8, 104, 3), PAL.grayLt, 0.8);
    pen(PAL.ink, 1.8, '2B'); for (const sh of shapes) brush.polygon(sh); brush.noStroke();
  }, { ax: 0, ay: 140 / 150 });
  defSprite('s05_post', 80, 360, () => {
    const sh = [[22, 40], [40, 22], [58, 40], [58, 350], [22, 350]];
    flat(sh, '#FFFFFF'); flat(rrPts(44, 44, 10, 300, 4), PAL.grayLt, 0.8);
    pen(PAL.ink, 2, '2B'); brush.polygon(sh); brush.noStroke();
  }, { ax: 0.5, ay: 350 / 360 });
  defSprite('s05_lapbrd', 170, 110, () => {
    paint(rrPts(12, 12, 146, 86, 14), PAL.navy, { baseC: '#3A4A8A', lw: 2.4 });
    paint(rrPts(22, 22, 126, 66, 10), PAL.cream, { baseC: '#FFFBF0', lw: 1.6 });
    const t = textImg('LAP', { font: 'pixel', size: 26, fill: PAL.inkSoft, weight: 700 }); image(t.img, 60 - t.w / 2, 55 - t.h / 2);
  });
  defSprite('s05_hurdle', 180, 110, () => {
    for (const x of [22, 146]) { const st = rrPts(x, 26, 12, 74, 4); flat(st, '#FFFFFF'); pen(PAL.ink, 1.6, '2B'); brush.polygon(st); brush.noStroke(); }
    const bar = rrPts(12, 40, 156, 16, 7); flat(bar, '#FFFFFF');
    for (let i = 0; i < 5; i++) flat([[20 + i * 32, 41], [36 + i * 32, 41], [30 + i * 32, 55], [14 + i * 32, 55]], PAL.red, 0.9);
    pen(PAL.ink, 1.8, '2B'); brush.polygon(bar); brush.noStroke();
  }, { ax: 0.5, ay: 100 / 110 });
  defSprite('s05_finish', 120, 220, () => {
    const pole = rrPts(20, 30, 12, 184, 6), flag = [[32, 32], [110, 38], [110, 84], [32, 80]];
    flat(pole, '#FFFFFF'); flat(flag, '#FFFFFF');
    pen(PAL.ink, 1.8, '2B'); brush.polygon(pole); brush.polygon(flag); brush.noStroke();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) if ((r + c) % 2) flat([[34 + c * 15, 34 + r * 15 + c], [49 + c * 15, 35 + r * 15 + c], [49 + c * 15, 49 + r * 15 + c], [34 + c * 15, 48 + r * 15 + c]], PAL.ink, 0.9);
    paint(ellPts(26, 28, 9, 9, 12), PAL.red, { baseC: '#FF7A88', lw: 1.2 });
  }, { ax: 26 / 120, ay: 214 / 220 });
  // flowers (anchored at the stem base so they can bob)
  const stem = (h = 96) => { strokePath([[40, 146], [37, 146 - h * 0.5], [40, 146 - h]], PAL.grassDk, 4.2, 'marker', 0.5); paint([[39, 118], [14, 98], [22, 124]], PAL.green, { baseC: lite(PAL.green, 0.3), lw: 1.2 }); };
  const fl = (name, fn) => defSprite(name, 80, 150, fn, { ax: 0.5, ay: 146 / 150 });
  const petals = (cx, cy, n, r0, r1) => { const pts = []; for (let i = 0; i < n * 6; i++) { const a = (i / (n * 6)) * TAU; pts.push([cx + Math.cos(a) * lerp(r0, r1, Math.abs(Math.sin((a * n) / 2))), cy + Math.sin(a) * lerp(r0, r1, Math.abs(Math.sin((a * n) / 2)))]); } return pts; };
  fl('s05_daisy', () => { stem(100); paint(petals(40, 40, 8, 10, 25), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.3, lc: PAL.inkSoft, bleed: 0.02 }); paint(ellPts(40, 40, 9, 9, 14), PAL.butter, { baseC: PAL.butter, lw: 1.2 }); });
  fl('s05_tulip', () => { stem(92); paint([[24, 30], [32, 44], [40, 28], [48, 44], [56, 30], [58, 58], [40, 72], [22, 58]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.6 }); });
  fl('s05_bell', () => { stem(96); paint(petals(40, 44, 5, 12, 22), PAL.lilac, { baseC: mixc(PAL.lilac, '#FFFFFF', 0.2), lw: 1.3, bleed: 0.02 }); flat(ellPts(40, 44, 5, 5, 10), PAL.butter); });
  fl('s05_sunfl', () => { stem(104); paint(petals(40, 38, 10, 12, 27), PAL.butter, { baseC: PAL.butter, lw: 1.2, bleed: 0.02 }); paint(ellPts(40, 38, 10, 10, 14), PAL.brown, { baseC: PAL.brownLt, lw: 1.2 }); });
  defSprite('s05_tuft', 120, 80, () => {
    const pts = [[14, 76]]; for (let i = 0; i < 7; i++) { const x = 22 + i * 12 + random() * 5, h = 34 + random() * 30, lean = (random() - 0.5) * 22; pts.push([x - 4, 72], [x + lean, 76 - h], [x + 5, 70]); } pts.push([106, 76]);
    flat(pts, mixc(PAL.grass, PAL.grassDk, 0.45)); strokePath(pts.slice(1, -1), PAL.ink, 1.1, 'pen', 0.2);
  }, { v: 2, ax: 0.5, ay: 76 / 80 });

  // Clawd eye variants for this scene (same 96px cell as the shared eyes)
  defSprite('s05_ce_star', 96, 96, () => { paint(starPts(48, 48, 40, 16, 4), PAL.butter, { baseC: '#FFE680', lw: 3.2, bleed: 0.01 }); flat(ellPts(42, 40, 5, 5, 10), '#FFFFFF'); });

  // ================= sprites: props =================
  defSprite('s05_clipboard', 240, 300, () => {
    paint(rrPts(20, 30, 200, 252, 18), PAL.brownLt, { baseC: '#DDB38E', lw: 2.4 });
    paint(rrPts(36, 62, 168, 206, 6), '#FFFFFF', { baseC: '#FFFFFF', a: 120, lw: 1.6 });
    paint(rrPts(84, 16, 72, 36, 10), PAL.gray, { baseC: PAL.grayLt, lw: 2 });
    pen(PAL.ink, 2.2, 'pen'); brush.line(62, 92, 62, 236); brush.line(62, 236, 192, 236); brush.noStroke();
    const t = textImg('loss', { font: 'hand', size: 26, fill: PAL.inkSoft, weight: 700 }); image(t.img, 98 - t.w / 2, 252 - t.h / 2);
  });
  defSprite('s05_check', 140, 120, () => {
    paint([[14, 62], [38, 40], [58, 64], [118, 8], [132, 30], [58, 108]], PAL.green, { baseC: lite(PAL.green, 0.3), lw: 2.2 });
  });
  defSprite('s05_watch', 160, 180, () => {
    paint(rrPts(68, 14, 24, 22, 6), PAL.gray, { baseC: PAL.grayLt, lw: 1.6 });
    paint(ellPts(80, 100, 64, 64, 40), PAL.gold, { baseC: PAL.butter, lw: 2.4 });
    const face = ellPts(80, 100, 50, 50, 40); flat(face, '#FFFFFF'); pen(PAL.ink, 1.6, '2B'); brush.polygon(face); brush.noStroke();
    pen(PAL.ink, 2, 'pen'); for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; brush.line(80 + Math.cos(a) * 40, 100 + Math.sin(a) * 40, 80 + Math.cos(a) * 47, 100 + Math.sin(a) * 47); } brush.noStroke();
    const btn = rrPts(128, 50, 18, 14, 5, 2); flat(btn, PAL.grayLt); pen(PAL.ink, 1.4, '2B'); brush.polygon(btn); brush.noStroke();
  }, { ax: 0.5, ay: 100 / 180 });

  // ================= sprites: the pony (an original design) =================
  const PONY = '#FFF2DE', PONY_SH = '#EAD7BE', MANE = PAL.pink, MANE2 = PAL.lilac;
  defSprite('s05_pony_body', 300, 200, () => {
    paint(ellPts(150, 105, 102, 64, 48, 0.02), PONY, { baseC: '#FFFAF1', a: 150, lw: 2.2 });
    wc(PAL.peach, 70, 0.12); brush.polygon(ellPts(150, 138, 76, 22, 24)); brush.noFill();
    for (const [x, y, r] of [[100, 86, 12], [128, 70, 9], [206, 96, 10]]) blob(x, y, r, PAL.butterLt, 140, 0.2);
  }, { v: 2, ax: 0.5, ay: 105 / 200 });
  defSprite('s05_pony_head', 260, 280, () => {
    paint([[64, 244], [120, 244], [170, 150], [150, 96], [96, 112]], PONY, { baseC: '#FFFAF1', a: 150, lw: 2.2 });
    paint([[118, 64], [128, 10], [154, 56]], PONY, { baseC: '#FFFAF1', lw: 2 });
    flat([[124, 56], [130, 24], [144, 54]], PAL.pinkLt, 0.9);
    paint(ellPts(150, 110, 74, 64, 40), PONY, { baseC: '#FFFAF1', a: 150, lw: 2.2 });
    paint(ellPts(206, 140, 46, 36, 32, 0, 0.25), PAL.pinkLt, { baseC: '#FFE3EE', lw: 2 });
    flat(ellPts(224, 130, 5, 7, 10, 0, 0.3), dark(PAL.pink, 0.35));
    strokePath([[200, 160], [214, 168], [229, 159]], PAL.ink, 2.4, 'pen', 0.5);
    blob(176, 136, 12, PAL.pink, 140, 0.25);
    // mane: tufts down the back of the neck + forelock
    const path = [[152, 40], [118, 52], [96, 80], [84, 116], [76, 156], [70, 196], [66, 238]];
    const out = [], inn = [];
    path.forEach(([x, y], i) => { const w = 22 - i * 1.2; out.push([x - w - 6, y - 4], [x - w * 0.6 - 10, y + 12]); inn.push([x + 8, y + 6]); });
    paint([...out, ...inn.reverse()], MANE, { baseC: mixc(MANE, '#FFFFFF', 0.2), lw: 1.6, bleed: 0.02 });
    strokePath(path.map(([x, y]) => [x - 10, y + 4]), MANE2, 6, 'marker', 0.5);
    paint(ellPts(162, 48, 22, 14, 18, 0.1, 0.4), MANE2, { baseC: mixc(MANE2, '#FFFFFF', 0.2), lw: 1.5, bleed: 0.02 });
  }, { v: 2, ax: 90 / 260, ay: 232 / 280 });
  defSprite('s05_pony_eye', 70, 70, () => {
    flat(ellPts(35, 38, 12, 16, 20), PAL.ink);
    flat(ellPts(31, 31, 4.5, 5.5, 10), '#FFFFFF'); flat(ellPts(39, 45, 2.2, 2.2, 8), '#FFFFFF');
    strokePath([[26, 25], [22, 17]], PAL.ink, 2.2, 'pen', 0.2); strokePath([[33, 22], [32, 13]], PAL.ink, 2.2, 'pen', 0.2);
  });
  defSprite('s05_pony_eyeS', 70, 70, () => {
    paint(ellPts(35, 36, 16, 19, 20), '#FFFFFF', { baseC: '#FFFFFF', lw: 2 });
    flat(ellPts(38, 38, 4.5, 4.5, 10), PAL.ink);
  });
  const ponyLeg = (name, c, hoof) => defSprite(name, 60, 130, () => {
    paint(rrPts(18, 10, 26, 84, 12), c, { baseC: lite(c, 0.3), lw: 1.8 });
    paint(rrPts(12, 86, 38, 26, 9), hoof, { baseC: lite(hoof, 0.3), lw: 1.8 });
  }, { v: 2, ax: 0.5, ay: 18 / 130 });
  ponyLeg('s05_pony_leg', PONY, PAL.lilac);
  ponyLeg('s05_pony_legB', PONY_SH, '#8E78D6');
  defSprite('s05_pony_tail', 190, 200, () => {
    paint([[156, 18], [178, 40], [156, 90], [126, 140], [74, 188], [36, 178], [74, 134], [112, 80], [134, 30]], MANE, { baseC: lite(MANE, 0.3), lw: 1.8 });
    strokePath([[150, 40], [124, 92], [88, 142], [58, 170]], MANE2, 5, 'marker', 0.5);
  }, { v: 2, ax: 156 / 190, ay: 28 / 200 });
  defSprite('s05_saddle', 180, 120, () => {
    paint(rrPts(20, 44, 140, 60, 12), PAL.sky, { baseC: lite(PAL.sky, 0.3), lw: 2 });
    pen('#FFFFFF', 3, 'marker'); brush.rect(28, 52, 124, 44); brush.noStroke();
    const t = textImg('1', { font: 'pixel', size: 34, fill: '#FFFFFF', weight: 700, stroke: PAL.navy, sw: 3 }); image(t.img, 90 - t.w / 2, 78 - t.h / 2);
  }, { ax: 0.5, ay: 60 / 120 });

  // ================= sprites: the singularity =================
  // three log-spiral arms that wind clockwise going inward; drawn rotating counter-clockwise so they seem to pour in
  function armsSprite(name, S, cols, wind, wmul) {
    defSprite(name, S, S, () => {
      const c = S / 2, Rout = S * 0.47, Rin = S * 0.05, b = Math.log(Rout / Rin) / wind;
      cols.forEach((col, k) => {
        const th0 = (k / cols.length) * TAU, N = 44, L = [], Rr = [], mid = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N, t = u * wind, r = Rout * Math.exp(-b * t), th = th0 + t;
          const tx = -b * Math.cos(th) - Math.sin(th), ty = -b * Math.sin(th) + Math.cos(th), tl = Math.hypot(tx, ty);
          const nx = -ty / tl, ny = tx / tl;
          const w = r * wmul * Math.sin(Math.min(1, u / 0.3) * Math.PI / 2) * (1 - 0.35 * u);
          const px = c + Math.cos(th) * r, py = c + Math.sin(th) * r;
          L.push([px + nx * w / 2, py + ny * w / 2]); Rr.push([px - nx * w / 2, py - ny * w / 2]); mid.push([px, py]);
        }
        const Rrev = Rr.slice().reverse();
        flat([...L, ...Rrev], col, 0.96);
        const L2 = L.map((p, i) => [lerp(p[0], mid[i][0], 0.25), lerp(p[1], mid[i][1], 0.25)]), R2 = mid.map((p, i) => [lerp(p[0], Rr[i][0], 0.2), lerp(p[1], Rr[i][1], 0.2)]);
        flat([...L2, ...R2.reverse()], lite(col, 0.22), 0.7);
        strokePath(mid.slice(6, 40).map(([x, y], i) => [x + (random() - 0.5) * 4, y + (random() - 0.5) * 4]), lite(col, 0.45), 2.2, 'marker', 0.5);
        strokePath(L.slice(4), dark(col, 0.3), 2.2, 'marker', 0.5);
        pen(PAL.ink, 1.5, '2B'); brush.spline(L, 0.5); brush.spline(Rr, 0.5); brush.noStroke();
        for (let i = 8; i < 40; i += 6) flat(ellPts(mid[i][0], mid[i][1], 3, 3, 8), '#FFFFFF', 0.8);
      });
    }, { v: 2 });
  }
  armsSprite('s05_arms_a', 1000, [mixc(PAL.lilac, PAL.navy, 0.45), PAL.blue, mixc(PAL.pink, PAL.red, 0.35)], 4.6, 0.46);
  armsSprite('s05_arms_b', 700, [PAL.lilac, PAL.sky, PAL.pink], 5.2, 0.34);
  defSprite('s05_ring', 360, 360, () => {
    pen(PAL.lilac, 12, 'marker'); brush.circle(180, 180, 150);
    pen(PAL.pinkLt, 7, 'marker'); brush.circle(180, 180, 142);
    pen('#FFFFFF', 3, 'marker'); brush.circle(180, 180, 136);
    brush.noStroke();
    for (let i = 0; i < 10; i++) { const a = random() * TAU; flat(ellPts(180 + Math.cos(a) * 146, 180 + Math.sin(a) * 146, 4, 4, 8), PAL.butterLt, 0.9); }
  }, { v: 2 });
  defSprite('s05_core', 280, 280, () => {
    paint(ellPts(140, 140, 112, 112, 48), '#1A1230', { baseC: '#120C22', a: 230, lw: 2.6, lc: PAL.lilac });
    blob(140, 140, 70, '#2E1F55', 90, 0.3);
  });

  // ================= world layout (rest frame = screen at the end of the tilt) =================
  const BARN = { x: 225, y: 655, s: 1.05 };
  const SIGN = { x: 225, y: 655 + (240 - 432) * 1.05 };
  const TRACK = { x: 975, y: 794, rx: 430, ry: 117 };
  const PIP = { x: 1615, y: 1036, s: 0.95 };
  const POST = { x: 1745, y: 1046 };
  const GRIP = [1740, 868];
  const HAY = [[560, 648, 0.75, 42.3], [655, 652, 0.68, 42.72], [606, 594, 0.62, 43.15]];
  const FENCE = [[640, 668, 0.8, 42.75], [992, 668, 0.8, 43.05]];
  const MIDF = [[470, 720, 's05_daisy', 0.5], [560, 748, 's05_tulip', 0.55], [760, 745, 's05_bell', 0.45], [1090, 760, 's05_daisy', 0.45], [1240, 742, 's05_tulip', 0.45], [1540, 700, 's05_sunfl', 0.55], [1680, 676, 's05_daisy', 0.45], [1880, 650, 's05_tulip', 0.5], [140, 700, 's05_sunfl', 0.6], [60, 760, 's05_bell', 0.6]];
  const FGF = [[420, 1062, 's05_tulip', 0.95], [540, 1072, 's05_daisy', 0.85], [690, 1058, 's05_sunfl', 0.9], [860, 1078, 's05_bell', 0.8], [1060, 1070, 's05_daisy', 0.9], [1210, 1060, 's05_tulip', 0.85], [1360, 1074, 's05_bell', 0.9], [1500, 1066, 's05_sunfl', 0.8]];
  const TUFTS = [[330, 700, 0.7], [650, 722, 0.6], [1010, 706, 0.5], [1450, 690, 0.6], [1760, 718, 0.8], [210, 812, 0.9], [380, 884, 0.9], [1560, 960, 0.9], [1160, 1000, 0.8], [800, 1004, 0.8], [560, 980, 0.9], [1330, 860, 0.7]];
  const CLOUDS = [[330, 330, 0.75], [1270, 285, 0.6], [760, -130, 0.9], [1520, -40, 0.7], [180, -230, 0.8], [1820, 470, 0.5]];
  const cloudX = (T, i) => { const x = CLOUDS[i][0] + (T - 35.5) * (10 + 5 * (i % 3)); return x; };
  const birdPos = (T, i) => [-160 + fract((T - 35.0) * 0.085 + i * 0.13) * 2300, [400, 455, 425][i] + Math.sin(T * 2.6 + i * 2) * 14];

  // ---- lift schedule (all pure functions of T) ----
  const cloudIt = (i) => { const tl = 41.42 + i * 0.13; return { x: cloudX(tl, i), y: CLOUDS[i][1], tl, D: 1.6 - i * 0.05, turns: 0.7, s: CLOUDS[i][2], spin: 0.2 }; };
  const birdIt = (i) => { const tl = tBut + 0.2 + i * 0.1; const p = birdPos(tl, i); return { x: p[0], y: p[1], tl, D: 1.05, turns: 1.1, s: 0.8, spin: 1.5 }; };
  const sunIt = { x: 1660, y: 185, tl: tSing, D: 0.8, turns: 0.45, s: 0.8, spin: 0.2 };
  const midfIt = (i) => ({ x: MIDF[i][0], y: MIDF[i][1], tl: tNow + i * 0.07, D: 1.3 + R(i, 3) * 0.5, turns: 1, s: MIDF[i][3], spin: 1.4 * (R(i, 4) > 0.5 ? 1 : -1) });
  const fgfIt = (i) => ({ x: FGF[i][0], y: FGF[i][1], tl: tNow + 0.18 + i * 0.09, D: 1.4 + R(i, 5) * 0.5, turns: 1.1, s: FGF[i][3], spin: 1.6 * (R(i, 6) > 0.5 ? 1 : -1) });
  const tuftIt = (i) => ({ x: TUFTS[i][0], y: TUFTS[i][1], tl: 42.0 + i * 0.09, D: 1.3, turns: 0.9, s: TUFTS[i][2], spin: 1.2 });
  const hayIt = (i) => ({ x: HAY[i][0], y: HAY[i][1] - 40 * HAY[i][2], tl: HAY[i][3], D: 1.25, turns: 0.9, s: HAY[i][2], spin: 1.3 });
  const fenceIt = (i) => ({ x: FENCE[i][0] + 176, y: FENCE[i][1] - 50, tl: FENCE[i][3], D: 0.95, turns: 0.8, s: FENCE[i][2] * 0.75, spin: 0.9 });
  const letterIt = (i) => ({ x: SIGN.x + (i - 2.5) * 40, y: SIGN.y, tl: RIP[i], D: Math.min(1.05, tGone + 0.02 - RIP[i]), turns: 0.85, s: 1, spin: 1.3 * (i % 2 ? 1 : -1) });
  const finishIt = { x: TRACK.x, y: 790, tl: 42.9, D: 1.1, turns: 0.9, s: 1, spin: 1.1 };
  const lapIt = { x: POST.x, y: POST.y - 350, tl: tNow + 0.2, D: 1.2, turns: 0.9, s: 0.9, spin: -1.2 };

  // ================= the pony and its rider =================
  const beatsF = (T) => { const b = beatAt(T); return b.i + b.ph; };
  function ponyTrack(T) {
    const tt = T > tBut ? tBut + 0.1 * Ez.out(clamp((T - tBut) / 0.3)) : T; // skids to a stop on "But"
    const ph = (TAU * (tt - tWe)) / LAP;
    const c = Math.cos(ph);
    return {
      x: TRACK.x + TRACK.rx * Math.sin(ph), y: TRACK.y + TRACK.ry * c,
      s: lerp(0.7, 1.0, (1 + c) / 2), face: Math.sign(c || 1) * clamp(Math.abs(c) * 3.5, 0.3, 1),
    };
  }
  const ponyG = (T) => beatsF(Math.min(T, tBut + 0.05));
  const ponyRear = (T) => Ez.outBack(inv(tBut, tBut + 0.25, T)) * (1 - 0.6 * sstep(tThe + 0.2, tThe + 1.2, T));
  const ponyIt = (() => { const P = ponyTrack(tThe); return { x: P.x, y: P.y - 150 * P.s, tl: tThe, D: 1.8, turns: 0.95, s: P.s, r: 0, spin: 0.9 }; })();
  const ponyFace0 = ponyTrack(tThe).face;
  const HURDLE_PH = ((TAU * (tTrain - tWe)) / LAP) % TAU;
  const HURDLE = [TRACK.x + TRACK.rx * Math.sin(HURDLE_PH), TRACK.y + TRACK.ry * Math.cos(HURDLE_PH)];
  const hurdleIt = { x: HURDLE[0], y: HURDLE[1] - 30, tl: 42.6, D: 1.2, turns: 0.9, s: 0.62, spin: 1.2 };
  const trainHop = (T) => { if (T > tBut) return 0; const k = Math.round((T - tTrain) / LAP), tc = tTrain + k * LAP; return Math.sin(Math.PI * inv(tc - 0.24, tc + 0.3, T)) * 58; };
  // pony internal bob/pitch (shared by the painter and the rider hand-off maths)
  function ponyPose(g, rear, hop) {
    const bob = Math.abs(Math.sin(Math.PI * g)) * 16 * (1 - rear) + hop;
    const pitch = Math.sin(TAU * g + 0.6) * 0.05 * (1 - rear);
    return { bob, pitch };
  }
  // origin = ground point under the belly, facing right; s = 1 is about 360 px tall
  function pony(T, g, o = {}) {
    const rear = o.rear || 0, flail = o.flail || 0;
    const { bob, pitch } = ponyPose(g, rear, o.hop || 0);
    const sw = (ph, amp) => Math.sin(TAU * g + ph) * amp * (1 - rear * 0.7);
    const fx = (i) => (flail ? Math.sin(T * 26 + i * 1.7) * flail : 0);
    push();
    if (rear) { translate(-55, 0); rotate(-rear * 0.55); translate(55, 0); }
    translate(0, -bob);
    translate(0, -105); rotate(pitch); translate(0, 105);
    spr('s05_pony_legB', 68, -92, { r: sw(0.7, 0.55) - rear * 0.9 + fx(0), seed: 1 });
    spr('s05_pony_legB', -44, -92, { r: sw(Math.PI + 0.7, 0.5) + fx(1), seed: 2 });
    spr('s05_pony_leg', 52, -90, { r: sw(0, 0.55) - rear * 1.2 + fx(2), seed: 3 });
    spr('s05_pony_leg', -60, -90, { r: sw(Math.PI, 0.5) + fx(3), seed: 4 });
    spr('s05_pony_tail', -92, -128, { s: 0.8, sy: 0.9 + 0.1 * Math.sin(TAU * g + 2), r: -0.35 + Math.sin(TAU * g + 1) * 0.22 + fx(5) * 0.6 });
    if (o.rider) o.rider();
    spr('s05_pony_body', 0, -105, { seed: 5 });
    spr('s05_saddle', -30, -150, { s: 0.9 });
    const hr = Math.sin(TAU * g + 1.3) * 0.07 * (1 - rear) - rear * 0.25 + fx(6) * 0.3;
    push(); translate(84, -132); rotate(hr);
    spr('s05_pony_head', 0, 0, { seed: 6 });
    spr(o.scared ? 's05_pony_eyeS' : 's05_pony_eye', 84, -126, {});
    pop();
    if (o.rein) { const mx = 84 + Math.cos(hr) * 134 - Math.sin(hr) * -70, my = -132 + Math.sin(hr) * 134 + Math.cos(hr) * -70; segLine(o.rein[0], o.rein[1], mx, my, PAL.brown, 3.5); }
    pop();
  }
  const RIDER = [-44, -126], RIDER_S = 0.42;
  function riderOpts(T) {
    const wave = bump(tWe - 0.06, tWe + 0.6, T);
    const cheer = bump(tTrain - 0.1, tTrain + 0.45, T);
    const lookUp = sstep(40.8, 41.0, T);
    let eyes = 'ce_sq';
    if (T > tStable && T < tStable + 0.55) eyes = 'ce_happy';
    if (bump(tTrain - 0.1, tTrain + 0.4, T) > 0.5) eyes = 's05_ce_star';
    if (T > tRun && T < tRun + 0.35) eyes = 'ce_happy';
    if (T > tBut) eyes = 'ce_dot';
    return {
      acc: ['headband'], eyes, eyeS: 1.35, blush: T < tBut,
      armL: lerp(lerp(-0.3 + Math.sin(T * 9) * 0.1, -1.15 + Math.sin(T * 16) * 0.4, wave), -1.3, Math.max(cheer, bump(tBut, 99, T))),
      armR: lerp(lerp(0.5, -1.3, cheer), -1.2, bump(tBut, 99, T)),
      look: [0.35 - lookUp * 0.35, 0.3 - 0.45 * lookUp], hop: 0,
    };
  }
  // rider body centre (for the hand-off at "singularity's"), mirroring pony() transforms
  function riderCentre(T) {
    const F = fly(T, ponyIt); const rear = ponyRear(T); const { bob, pitch } = ponyPose(ponyG(T), rear, 0);
    const M = chain(MX.t(F.x, F.y), MX.r(F.r), MX.s(F.s * ponyFace0, F.s), MX.t(0, 150),
      MX.t(-55, 0), MX.r(-rear * 0.55), MX.t(55, 0), MX.t(0, -bob), MX.t(0, -105), MX.r(pitch), MX.t(0, 105));
    const p = MX.ap(M, [RIDER[0], RIDER[1] - 5 * CU * RIDER_S]);
    const ang = F.r + (-rear * 0.55 + pitch) * ponyFace0;
    return { x: p[0], y: p[1], s: F.s * RIDER_S, r: ang };
  }
  const SEP = riderCentre(tSing);
  function clawdHover(T) {
    const C = vC(T), psi = -0.2 - 0.32 * (T - tSing), rho = lerp(445, 400, inv(tSing + 0.7, tBegun, T));
    return [C[0] + Math.cos(psi) * rho, C[1] + Math.sin(psi) * rho + Math.sin(T * 3.1) * 12];
  }
  const clawdIt = (() => { const tl = tBegun + 0.04; const H = clawdHover(tl); return { x: H[0], y: H[1], tl, D: tGone - tl, turns: 0.55, s: 0.62, spin: 0.8 }; })();

  // ================= Pip =================
  const clickAmt = (T) => CLICKS.reduce((m, tc) => (T >= tc ? Math.max(m, Math.exp(-(T - tc) * 7)) : m), 0);
  const lapNum = (T) => (T < CLICKS[1] ? 1 : T < CLICKS[2] ? 2 : 3);
  function pipStandPose(T) {
    const raise = Ez.outBack(inv(tHad - 0.05, tHad + 0.25, T));
    const shock = sstep(tBut - 0.02, tBut + 0.1, T);
    let face = 'pf_neutral';
    if (bump(tStable - 0.05, tStable + 0.45, T) > 0.5 || bump(tRun - 0.03, tRun + 0.3, T) > 0.5 || bump(tWe - 0.03, tWe + 0.3, T) > 0.5) face = 'pf_happy';
    if (T > 40.85) face = 'pf_nervous';
    if (T > tBut) face = 'pf_shock';
    return {
      face, hop: T > 37.9 && T < tBut ? hopB(T) * 9 : 0,
      armL: lerp(lerp(0.35, 1.45, raise), 2.5, shock), armR: lerp(2.0 + 0.3 * clickAmt(T), 2.6, shock),
      headR: T > 40.85 ? -0.14 : Math.sin((T * Math.PI) / BEAT_LEN) * 0.05,
    };
  }
  const handL = (x, y, s, a, hop) => [x + s * (-56 - 82 * Math.sin(a)), y - hop + s * (-138 + 82 * Math.cos(a))];
  const handR = (x, y, s, a, hop) => [x + s * (56 + 82 * Math.sin(a)), y - hop + s * (-138 + 82 * Math.cos(a))];
  function pipCling(T) {
    const th = Math.PI / 2 + 0.12 + Math.sin(T * 19) * 0.08 + Math.sin(T * 7.3) * 0.05;
    const rA = 2.6 + Math.sin(T * 19 + 0.5) * 0.05, k = 2.2, s = PIP.s;
    const hx = s * (56 + 82 * k * Math.sin(rA)), hy = s * (-138 + 82 * k * Math.cos(rA));
    const c = Math.cos(th), sn = Math.sin(th);
    return { x: GRIP[0] - (hx * c - hy * sn), y: GRIP[1] - (hx * sn + hy * c), r: th, rA, k };
  }
  const pipIt = (() => { const P = pipCling(tBegun); const cx = P.x + 142 * Math.sin(P.r), cy = P.y - 142 * Math.cos(P.r); return { x: cx, y: cy, tl: tBegun, D: tGone - tBegun - 0.02, turns: 0.6, s: 1, r: P.r, spin: 0.9 }; })();
  function drawStretchArm(s, rA, k) { spr('pip_arm', 56 * s, -138 * s, { s, sy: k, r: -rA, seed: 4 }); }
  function pipFlapOpts(T, face) {
    return { face, armR: 2.6, armL: 1.0 + Math.sin(T * 21) * 0.9, legs: [Math.sin(T * 24) * 0.5, Math.sin(T * 24 + 2.1) * 0.5], headR: Math.sin(T * 17) * 0.12 };
  }
  // stopwatch + clipboard (with the hidden paperclip)
  function drawClipboard(x, y, s, r, T, a = 1, withClip = true) {
    push(); translate(x, y); rotate(r); scale(s);
    spr('s05_clipboard', 0, 0, { a, jit: 0.5 });
    push(); translate(-120, -150);
    const prog = 0.2 + 0.8 * inv(tHad, tRun - 0.12, T);
    const lossY = (u) => 100 + 118 * (1 - (0.1 + 0.9 * Math.exp(-3.4 * u) + 0.025 * Math.sin(u * 20) * (1 - u)));
    let px = 64, py = lossY(0); const segs = [];
    for (let i = 1; i <= 24; i++) { const u = (i / 24) * prog; const nx = 64 + u * 124, ny = lossY(u); segs.push([px, py, nx, ny]); px = nx; py = ny; }
    segLines(segs, PAL.blue, 5, a);
    disc(px, py, 5, PAL.coral, a);
    if (withClip) spr('paperclip', 52, 76, { s: 0.3, r: -0.5, a, v: 0 });
    const ck = T - tRun;
    if (ck > 0) spr('s05_check', 160, 120, { s: 0.55 * Ez.outBack(clamp(ck / 0.22), 3) * (1 + 0.6 * Math.exp(-ck * 10)), r: -0.1, a });
    pop();
    pop();
  }
  function drawWatch(x, y, s, r, T, a = 1) {
    push(); translate(x, y); rotate(r); scale(s * (1 + 0.18 * clickAmt(T)));
    spr('s05_watch', 0, 0, { a });
    const ang = -Math.PI / 2 + (TAU * (Math.min(T, tBut) - tWe)) / LAP;
    segLine(0, 0, Math.cos(ang) * 38, Math.sin(ang) * 38, PAL.red, 4, a); disc(0, 0, 6, PAL.ink, a);
    pop();
  }

  // ================= drawing =================
  const duskTint = (k) => { if (k <= 0.001) { tint(255); return; } tint(lerp(255, 105, k), lerp(255, 88, k), lerp(255, 168, k)); };

  function drawSky(T, dim) {
    if (dim > 0.001) {
      spr('s05_void', 960, 540, { s: 2.1, jit: 0 });
      for (let i = 0; i < 30; i++) {
        const tw = 0.5 + 0.5 * Math.sin(T * 3 + i * 1.7);
        spr(i % 3 ? 'sparkW' : 'spark', R(i, 51) * W, R(i, 52) * 820, { s: 0.06 + 0.1 * R(i, 53) * (0.5 + tw * 0.5), a: dim * (0.3 + 0.7 * tw), r: T * 0.5 + i, seed: i });
      }
    }
    if (dim < 0.999) {
      gradRect(-80, -80, W + 160, H + 160, rgba('#86C8FF', 1 - dim), rgba('#E6F5FF', 1 - dim));
      spr('s05_sky', 960, 540 + par(T, 0.25), { s: 2.2, jit: 0, a: 0.9 * (1 - dim) });
      const dusk = 0.6 * Math.sin(Math.PI * dim);
      if (dusk > 0.01) gradRect(-80, -80, W + 160, 900, rgba(mixc(PAL.lilac, PAL.navy, 0.35), dusk), rgba(PAL.pink, dusk * 0.8));
    }
  }
  function sunPos(T) { const e = tiltE(T); return [lerp(960, 1660, e), lerp(500, 185, e) - Math.sin(Math.PI * e) * 70]; }
  function sunFaceAt(T) { if (T < 35.68) return 's05_sf_sleep'; if (T > tBut) return 's05_sf_shock'; if (T > 40.8) return 's05_sf_worry'; return 's05_sf_happy'; }
  function drawSun(x, y, s, T, o = {}) {
    const k = kick(T, 5);
    if (o.rays !== false) spr('s05_sun_rays', x, y, { s: s * (1 + 0.06 * k), r: T * 0.35, a: o.a });
    const wake = T < 36.2 ? Ez.outElastic(clamp((T - 35.62) / 0.5)) : 1;
    spr('s05_sun', x, y, { s: s * (1 + 0.03 * k), sx: o.sx, sy: (o.sy ?? 1) * (0.94 + 0.06 * wake), r: o.r, a: o.a });
    spr(sunFaceAt(T), x, y + 12 * s, { s, sx: o.sx, sy: o.sy, r: o.r, a: o.a, jit: 0.5 });
  }
  function drawSkyThings(T) {
    // red halo that rhymes with s04's glowing eye, fading as the iris opens
    const [sx, sy] = sunPos(T);
    const halo = 1 - inv(35.5, 36.0, T);
    if (T < tSing) {
      if (halo > 0) {
        disc(sx, sy, 190, PAL.red, 0.2 * halo);
        const rg = Ez.out(inv(35.5, 36.0, T));
        ringLine(sx, sy, 125 + rg * 160, PAL.red, 16 * halo + 2, 0.85 * halo);
        ringLine(sx, sy, 110 + rg * 120, '#FFFFFF', 5 * halo, 0.7 * halo);
      }
      const sS = lerp(1.05, 0.8, tiltE(T)) * (1 + 0.04 * hopB(T));
      drawSun(sx + RS(G.boil, 31) * 3 * windAt(T), sy + RS(G.boil, 32) * 3 * windAt(T), sS, T);
    }
    for (let i = 0; i < CLOUDS.length; i++) {
      if (T >= cloudIt(i).tl) continue;
      const w = rattle(T, cloudIt(i).tl);
      spr('cloud', cloudX(T, i) + RS(G.boil + i, 33) * 6 * w, CLOUDS[i][1] + par(T, 0.4), { s: CLOUDS[i][2], seed: i, flip: i % 2 === 1, r: RS(G.boil + i, 34) * 0.03 * w });
    }
    for (let i = 0; i < 3; i++) {
      if (T >= birdIt(i).tl) continue;
      const [bx, by] = birdPos(T, i);
      spr(i === 1 ? 's05_birdP' : 's05_bird', bx, by + par(T, 0.4), { s: 0.8, v: fract(T * 6 + i * 0.37) < 0.5 ? 0 : 1, r: Math.sin(T * 5 + i) * 0.08 });
    }
  }
  function drawLand(T, dim) {
    duskTint(dim);
    spr('s05_hills', 960, 530 + par(T, 0.75), { s: 2, jit: 0 });
    spr('s05_meadow', 960, 780 + par(T, 1), { s: 2, jit: 0 });
    spr('s05_track', TRACK.x, 800 + par(T, 1), { s: 2, jit: 0.25 });
    tint(255);
  }
  function drawSign(T, oy) {
    spr('s05_sign', SIGN.x, SIGN.y + oy, { s: 1.05, r: RS(G.boil, 41) * 0.02 * windAt(T) });
    const word = 'STABLE';
    for (let i = 0; i < 6; i++) {
      if (T >= RIP[i]) continue;
      const hopI = Math.sin(Math.PI * inv(tStable + i * 0.045, tStable + i * 0.045 + 0.3, T));
      const gold = bump(tStable + i * 0.045, tStable + 0.7, T);
      const w = rattle(T, RIP[i]);
      const r = Math.sin(T * 38 + i * 2) * 0.18 * w;
      txt(word[i], SIGN.x + (i - 2.5) * 40, SIGN.y + oy - 2 - hopI * 22, { size: 50, fill: gold > 0.5 ? PAL.gold : PAL.navy, stroke: '#FFFFFF', sw: 3, weight: 700 }, { r, s: 1 + hopI * 0.15 });
    }
    if (T > tStable - 0.02 && T < tStable + 1.2) {
      burst(T, tStable, SIGN.x, SIGN.y + oy - 10, { n: 16, names: ['spark', 'star5', 'sparkW'], spd: 620, g: 160, life: 1.1, s: 0.32, seed: 71 });
      const tw = Math.sin(Math.PI * inv(tStable, tStable + 0.7, T));
      spr('sparkW', SIGN.x + 150, SIGN.y + oy - 40, { s: 0.55 * tw, r: T * 3 });
      spr('spark', SIGN.x - 145, SIGN.y + oy + 30, { s: 0.4 * tw, r: -T * 3 });
    }
  }
  function flowerR(T, i, x, y, tl) {
    const C = vC(T), w = windAt(T);
    const lean = Math.atan2(C[1] - y, C[0] - x) + Math.PI / 2;
    const leanN = Math.atan2(Math.sin(lean), Math.cos(lean));
    return (i % 2 ? 1 : -1) * 0.13 * kick(T, 6) * (1 - w) + Math.sin(T * 2 + i) * 0.05 + clamp(leanN, -1, 1) * 0.6 * w + Math.sin(T * 30 + i) * 0.15 * rattle(T, tl);
  }
  // far ground objects sit behind the vortex (it eats the scenery); the pony, Pip and foreground flowers stay in front
  function drawGroundBack(T, dim) {
    const oy = par(T, 1);
    duskTint(dim * 0.6);
    // barn, sign, hay
    spr('s05_barn', BARN.x, BARN.y + oy, { s: BARN.s, jit: 0.4 });
    drawSign(T, oy);
    duskTint(dim * 0.6);
    for (let i = 0; i < HAY.length; i++) {
      const it = hayIt(i); if (T >= it.tl) continue;
      const w = rattle(T, it.tl);
      spr('s05_hay', HAY[i][0] + RS(G.boil + i, 42) * 4 * w, HAY[i][1] + oy, { s: HAY[i][2], r: RS(G.boil + i, 43) * 0.06 * w, seed: i });
    }
    for (let i = 0; i < FENCE.length; i++) {
      if (T >= fenceIt(i).tl) continue;
      const w = rattle(T, fenceIt(i).tl);
      spr('s05_fence', FENCE[i][0], FENCE[i][1] + oy, { s: FENCE[i][2], r: RS(G.boil + i, 44) * 0.03 * w, seed: i });
    }
    for (let i = 0; i < TUFTS.length; i++) {
      const it = tuftIt(i); if (T >= it.tl) continue;
      spr('s05_tuft', TUFTS[i][0], TUFTS[i][1] + oy, { s: TUFTS[i][2], r: flowerR(T, i + 3, TUFTS[i][0], TUFTS[i][1], it.tl) * 0.7, seed: i });
    }
    for (let i = 0; i < MIDF.length; i++) {
      const it = midfIt(i); if (T >= it.tl) continue;
      const [x, y, nm, s] = MIDF[i];
      spr(nm, x, y + oy, { s, r: flowerR(T, i, x, y, it.tl), sy: 1 - 0.07 * kick(T, 6), seed: i });
    }
    if (T < hurdleIt.tl) spr('s05_hurdle', HURDLE[0], HURDLE[1] + 8 + oy, { s: 0.62, r: Math.sin(T * 29) * 0.1 * rattle(T, hurdleIt.tl) });
    if (T < finishIt.tl) spr('s05_finish', TRACK.x, 872 + oy, { s: 0.9, r: Math.sin(T * 4) * 0.03 + Math.sin(T * 31) * 0.08 * rattle(T, finishIt.tl) });
    tint(255);
  }
  function drawGroundFront(T, dim) {
    const oy = par(T, 1), oyF = par(T, 1.15);
    // pony on the ground (until lift-off)
    if (T < tThe) {
      const P = ponyTrack(T);
      duskTint(dim * 0.25);
      spr('blob_ink', P.x, P.y + oy + 6, { s: 1.3 * P.s, sy: 0.22, a: 0.16 });
      push(); translate(P.x, P.y + oy); scale(P.s * P.face, P.s);
      pony(T, ponyG(T), { rear: ponyRear(T), hop: trainHop(T), scared: T > tBut, rein: T < tBut ? [RIDER[0] + 84, RIDER[1] - 70] : null, rider: () => clawd(RIDER[0], RIDER[1] - trainHop(T) * 0.25 - Math.abs(Math.sin(Math.PI * (ponyG(T) - 0.18))) * 8 * (1 - ponyRear(T)), RIDER_S, riderOpts(T)) });
      pop();
      if (T > tTrain - 0.1 && T < tTrain + 0.6) burst(T, tTrain, P.x, P.y + oy - 60, { n: 10, names: ['spark', 'sparkW'], spd: 380, g: 300, life: 0.7, s: 0.25, seed: 91 });
      // happy whinny (hearts + notes) each time the pony crosses the finish line on "We" and "run,"
      for (const tc of [tWe, tRun]) if (T > tc && T < tc + 0.9) burst(T, tc, P.x + P.face * 200 * P.s, P.y + oy - 300 * P.s, { n: 5, names: ['heart', 'note', 'heartR'], spd: 300, g: -140, life: 0.9, s: 0.3, spread: 1.8, ang0: -Math.PI / 2, seed: 120 + Math.round(tc * 10) });
    }
    // Pip's post + lap board
    duskTint(dim * 0.5);
    spr('s05_fence', POST.x, POST.y + oy, { s: 0.8, seed: 5 });
    spr('s05_post', POST.x, POST.y + oy, { s: 1, jit: 0.3 });
    if (T < lapIt.tl) {
      const w = rattle(T, lapIt.tl), flip = inv(0, 0.18, T - CLICKS.reduce((m, c) => (T >= c ? c : m), -9));
      spr('s05_lapbrd', POST.x, POST.y - 350 + oy, { s: 0.9, r: Math.sin(T * 33) * 0.1 * w });
      txt(String(lapNum(T)), POST.x + 36, POST.y - 350 + oy + 2, { font: 'pixel', size: 44, fill: PAL.coral, weight: 700 }, { sy: flip, r: Math.sin(T * 33) * 0.1 * w });
    }
    // Pip
    duskTint(dim * 0.25);
    drawPip(T, oy);
    // foreground flowers
    duskTint(dim * 0.5);
    for (let i = 0; i < FGF.length; i++) {
      const it = fgfIt(i); if (T >= it.tl) continue;
      const [x, y, nm, s] = FGF[i];
      spr(nm, x, y + oyF, { s, r: flowerR(T, i + 1, x, y, it.tl), sy: 1 - 0.08 * kick(T, 6), seed: i });
    }
    tint(255);
  }
  const clipIt = { x: 1540, y: 1000, tl: tNow + 0.28, D: 1.5, turns: 0.9, s: 0.85, r: 0.3, spin: 0.8 };
  const watchIt = { x: 1745, y: 1014, tl: tNow + 0.12, D: 1.2, turns: 1.0, s: 0.72, r: -0.4, spin: -1.4 };
  const pclipIt = (() => { const F = fly(42.35, clipIt); return { x: F.x - 50, y: F.y - 60, tl: 42.35, D: 1.25, turns: 1.0, s: 0.55, r: -0.5, spin: 1.6 }; })();
  function drawPip(T, oy) {
    const s = PIP.s;
    if (T < tNow) {
      const P = pipStandPose(T);
      // props in hand (the clipboard sits behind Pip's hand), dropped on "But"
      const [lx, ly] = handL(PIP.x, PIP.y + oy, s, P.armL, P.hop), [rx, ry] = handR(PIP.x, PIP.y + oy, s, P.armR, P.hop);
      const drop = Ez.in(inv(tBut, tBut + 0.28, T));
      drawClipboard(lerp(lx - 70, clipIt.x, drop), lerp(ly - 62, clipIt.y + 30, drop), 0.85, lerp(-0.05, 0.3, drop), T);
      pip(PIP.x, PIP.y + oy, s, { face: P.face, armL: P.armL, armR: P.armR, hop: P.hop, headR: P.headR });
      drawWatch(lerp(rx + 4, watchIt.x, drop), lerp(ry - 34, watchIt.y + 20, drop), 0.72, lerp(0.15, -0.4, drop), T);
      if (T > CLICKS[1] - 0.02) for (const tc of CLICKS) if (T > tc && T < tc + 0.6) burst(T, tc, rx + 4, ry - 60, { n: 8, names: ['sparkW', 'spark'], spd: 360, g: 200, life: 0.55, s: 0.22, seed: 60 + Math.round(tc * 10) });
      return;
    }
    // props lying in the grass until they get pulled in
    if (T < watchIt.tl) drawWatch(watchIt.x, watchIt.y + 20, 0.72, -0.4 + Math.sin(T * 30) * 0.1, T);
    if (T < clipIt.tl) drawClipboard(clipIt.x, clipIt.y + 30, 0.85, 0.3 + Math.sin(T * 27) * 0.06, T);
    if (T >= tBegun) return;
    const Cl = pipCling(T);
    const e = Ez.outBack(inv(tNow, tNow + 0.3, T), 1.3);
    const x = lerp(PIP.x, Cl.x, e), y = lerp(PIP.y + oy, Cl.y, e), r = lerp(0, Cl.r, e), k = lerp(1, Cl.k, clamp(e));
    push(); translate(x, y); rotate(r);
    drawStretchArm(s, Cl.rA, k);
    pip(0, 0, s, pipFlapOpts(T, e > 0.6 ? 'pf_scared' : 'pf_shock'));
    pop();
    if (T > tNow && T < tNow + 0.5) burst(T, tNow + 0.05, GRIP[0], GRIP[1], { n: 6, names: ['puff'], spd: 260, g: -80, life: 0.5, s: 0.25, seed: 77 });
  }

  function drawVortex(T) {
    const Rv = vR(T); if (Rv <= 0) return;
    const [cx, cy] = vC(T);
    if (T < tBut) { // the tiny dot overhead
      disc(cx, cy, Rv * 3.2, PAL.lilac, 0.16); disc(cx, cy, Rv * 1.9, PAL.night, 0.25);
      disc(cx, cy, Rv, '#120C22');
      ringLine(cx, cy, Rv * 1.5 + kick(T, 5) * 6, PAL.lilac, 2, 0.55);
      return;
    }
    const Rc = coreR(T), spin = vSpin(T);
    disc(cx, cy, Rv * 1.02, '#140E28', 0.3); disc(cx, cy, Rv * 0.75, '#140E28', 0.3);
    spr('s05_arms_a', cx, cy, { s: Rv / 470, r: spin, a: 0.93, jit: 0.3 });
    spr('s05_arms_b', cx, cy, { s: (Rv * 0.6) / 329, r: spin * 1.7 + 1.0, a: 0.9, jit: 0.3 });
    for (let i = 0; i < 4; i++) { const f = fract(i / 4 - T * 0.9); ringLine(cx, cy, Rc + (Rv * 0.85 - Rc) * f, PAL.lilacLt, 3, 0.35 * Math.sin(Math.PI * f)); }
    // sparkles pouring inward (counter-clockwise, like the debris)
    for (let i = 0; i < 22; i++) {
      const p = fract(R(i, 81) + T * 0.5 * (0.7 + 0.6 * R(i, 82)));
      const rr = Rc + (Rv * (0.35 + 0.65 * R(i, 83)) - Rc) * (1 - p);
      const a = R(i, 84) * TAU - p * p * 2.6 - T * 0.3;
      spr(i % 3 ? 'sparkW' : 'spark', cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, { s: 0.1 + 0.14 * R(i, 85), a: Math.sin(Math.PI * p), r: T * 4 + i, seed: i });
    }
    glow(cx, cy, Rc * 1.6, PAL.pink, 0.35);
    spr('s05_ring', cx, cy, { s: (Rc * 1.35) / 150, r: -T * 2.4, a: 0.95 });
    spr('s05_core', cx, cy, { s: Rc / 112, jit: 0.2 });
  }
  const put = (F, fn) => { if (!F || F.a <= 0) return; fn(F); };
  function drawSkyDebris(T) {
    for (let i = 0; i < CLOUDS.length; i++) put(fly(T, cloudIt(i)), (F) => spr('cloud', F.x, F.y, { s: F.s, sx: 1 + F.q * 0.4, r: F.r, a: F.a * 0.92, seed: i, flip: i % 2 === 1 }));
    put(fly(T, sunIt), (F) => { drawSun(F.x, F.y, F.s, T, { rays: F.q < 0.3, sx: 1 + F.q * 1.6, sy: 1 - F.q * 0.4, r: F.r, a: F.a }); });
    for (let i = 0; i < 3; i++) put(fly(T, birdIt(i)), (F) => spr(i === 1 ? 's05_birdP' : 's05_bird', F.x, F.y, { s: F.s, r: F.r, a: F.a, v: fract(T * 9 + i) < 0.5 ? 0 : 1 }));
  }
  function drawDebris(T) {
    for (let i = 0; i < TUFTS.length; i++) put(fly(T, tuftIt(i)), (F) => spr('s05_tuft', F.x, F.y, { s: F.s, r: F.r, a: F.a, seed: i }));
    for (let i = 0; i < MIDF.length; i++) put(fly(T, midfIt(i)), (F) => spr(MIDF[i][2], F.x, F.y, { s: F.s, r: F.r, a: F.a, seed: i }));
    for (let i = 0; i < HAY.length; i++) put(fly(T, hayIt(i)), (F) => spr('s05_hay', F.x, F.y, { s: F.s, r: F.r, a: F.a, seed: i }));
    for (let i = 0; i < FENCE.length; i++) put(fly(T, fenceIt(i)), (F) => spr('s05_fence', F.x, F.y, { s: F.s, r: F.r, a: F.a, seed: i }));
    put(fly(T, finishIt), (F) => spr('s05_finish', F.x, F.y, { s: F.s * 0.9, r: F.r, a: F.a }));
    put(fly(T, hurdleIt), (F) => spr('s05_hurdle', F.x, F.y, { s: F.s, r: F.r, a: F.a }));
    put(fly(T, lapIt), (F) => spr('s05_lapbrd', F.x, F.y, { s: F.s, r: F.r, a: F.a }));
    put(fly(T, watchIt), (F) => drawWatch(F.x, F.y, F.s, F.r, T, F.a));
    put(fly(T, clipIt), (F) => drawClipboard(F.x, F.y, F.s, F.r, T, F.a, T < pclipIt.tl));
    put(fly(T, pclipIt), (F) => spr('paperclip', F.x, F.y, { s: F.s, r: F.r, a: F.a }));
    for (let i = 0; i < 6; i++) put(fly(T, letterIt(i)), (F) => txt('STABLE'[i], F.x, F.y, { size: 50, fill: PAL.navy, stroke: '#FFFFFF', sw: 3, weight: 700 }, { s: F.s * (1 + 0.5 * Math.sin(Math.PI * F.q)), r: F.r, a: F.a }));
    for (let i = 0; i < FGF.length; i++) put(fly(T, fgfIt(i)), (F) => spr(FGF[i][2], F.x, F.y, { s: F.s, r: F.r, a: F.a, seed: i }));
    // the pony tumbles in; Clawd rides it until "singularity's", then floats free
    put(fly(T, ponyIt), (F) => {
      push(); translate(F.x, F.y); rotate(F.r); scale(F.s * ponyFace0, F.s); translate(0, 150);
      const rear = ponyRear(T);
      pony(T, ponyG(T), { rear, flail: 0.5 * sstep(tThe, tThe + 0.3, T), scared: true, rider: T < tSing ? () => clawd(RIDER[0], RIDER[1], RIDER_S, riderOpts(T)) : null });
      pop();
    });
  }
  function drawClawdFree(T) {
    if (T < tSing) return;
    let x, y, s, r, a = 1;
    if (T < clawdIt.tl) {
      const e = Ez.inOut(inv(tSing, tSing + 0.7, T));
      const H = clawdHover(T);
      x = lerp(SEP.x, H[0], e); y = lerp(SEP.y, H[1], e) - Math.sin(Math.PI * e) * 70;
      s = lerp(SEP.s, 0.62, e); r = lerp(SEP.r, Math.sin(T * 2.2) * 0.14, e);
    } else {
      const F = fly(T, clawdIt); if (!F || F.a <= 0) return;
      x = F.x; y = F.y; s = F.s; r = F.r + Math.sin(clawdIt.tl * 2.2) * 0.14; a = F.a;
    }
    blendMode(ADD); disc(x, y, 150 * s / 0.62, PAL.lilac, 0.12 * a); blendMode(BLEND);
    for (let i = 0; i < 6; i++) { const an = T * 2.4 + (i / 6) * TAU, rr = (135 + 18 * Math.sin(T * 5 + i)) * s / 0.62; spr(i % 2 ? 'sparkW' : 'spark', x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.8, { s: (0.16 + 0.08 * Math.sin(T * 7 + i)) * a, r: T * 3 + i, seed: i }); }
    push(); translate(x, y); rotate(r);
    const joy = Ez.outBack(inv(tSing, tSing + 0.3, T));
    clawd(0, 5 * CU * s, s, { eyes: T < tSing + 0.6 || T > clawdIt.tl ? 's05_ce_star' : 'ce_happy', eyeS: 1.35, look: [0, 0.4], acc: ['headband'], armL: lerp(-0.3, -1.25, joy) + Math.sin(T * 9) * 0.35, armR: lerp(-0.3, -1.25, joy) + Math.sin(T * 9 + 1.5) * 0.35, sq: 1 + 0.06 * Math.sin(T * 9), blush: true, mouth: T < tSing + 0.8 ? 'smile' : null, a, legs: [[0, Math.sin(T * 9) * 0.2], [0, -0.1], [0, 0.1], [0, Math.sin(T * 9 + 1) * 0.2]] });
    pop();
  }
  function drawPipFly(T) {
    const F = fly(T, pipIt); if (!F || F.a <= 0) return;
    push(); translate(F.x, F.y); rotate(F.r); scale(F.s);
    pip(0, 142, PIP.s, { ...pipFlapOpts(T, 'pf_dizzy'), armL: 2.5 + Math.sin(T * 20) * 0.4 });
    pop();
  }
  function drawWind(T) {
    const w = windAt(T) * (1 - drainK(T));
    if (w <= 0.01) return;
    const [cx, cy] = vC(T), segs = [], segs2 = [];
    const at = (i, p) => { const r0 = 700 + 700 * R(i, 61), th = R(i, 62) * TAU - p * p * 1.6; const rr = lerp(r0, 60, Ez.in(p)); return [cx + Math.cos(th) * rr, cy + Math.sin(th) * rr * 0.8]; };
    for (let i = 0; i < 26; i++) {
      const p = fract(R(i, 63) + T * (0.55 + 0.3 * R(i, 64)));
      if (p < 0.06 || p > 0.92) continue;
      let q = at(i, p - 0.06);
      for (let k = 1; k <= 3; k++) { const n = at(i, p - 0.06 + 0.02 * k); (i % 3 ? segs : segs2).push([q[0], q[1], n[0], n[1]]); q = n; }
    }
    segLines(segs, '#FFFFFF', 4, 0.6 * w);
    segLines(segs2, PAL.lilacLt, 6, 0.5 * w);
  }
  function drawFX(T) {
    const [cx, cy] = vC(T);
    // "But": the dot pops open with a shockwave
    const a1 = T - tBut;
    if (a1 > 0 && a1 < 0.7) {
      const k = Ez.out(clamp(a1 / 0.7));
      ringLine(cx, cy, 30 + k * 1150, '#FFFFFF', 18 * (1 - k) + 2, 0.85 * (1 - k));
      ringLine(cx, cy, 20 + k * 850, PAL.lilac, 12 * (1 - k) + 1, 0.8 * (1 - k));
      ringLine(cx, cy, 10 + k * 560, PAL.pink, 8 * (1 - k) + 1, 0.7 * (1 - k));
      disc(cx, cy, 150 * (1 - k * 0.5), '#FFFFFF', 0.6 * (1 - clamp(a1 / 0.22)));
    }
    // "singularity's": bloom flash + a ring of stars that opens and gets sucked back
    const a2 = T - tSing;
    if (a2 > 0 && a2 < 1.1) {
      blendMode(ADD); disc(cx, cy, 260 * Ez.out(clamp(a2 / 0.2)), PAL.pinkLt, 0.3 * (1 - clamp(a2 / 0.45))); blendMode(BLEND);
      const rr = 560 * Math.sin(Math.PI * clamp(a2 / 1.1)) ** 0.7;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU - a2 * 2.2; spr(i % 2 ? 'star5' : 'sparkW', cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, { s: 0.42 * (1 - a2 / 1.1 * 0.6), r: a2 * 5 + i, a: 1 - inv(0.8, 1.1, a2) }); }
    }
    // the singularity point
    if (T > tBut) {
      const Rc = coreR(T);
      glow(cx, cy, Rc * 1.1, PAL.pinkLt, 0.45);
      disc(cx, cy, Math.max(3, Rc * 0.12) * (1 + 0.3 * kick(T, 6)), '#FFFFFF', 0.95);
    }
    const a3 = T - tGone;
    if (a3 > -0.05 && a3 < 0.5) {
      burst(T, tGone, cx, cy, { n: 14, names: ['sparkW', 'spark', 'star5'], spd: 520, g: 0, life: 0.5, s: 0.35, even: true, seed: 97 });
      blendMode(ADD); disc(cx, cy, 120 * Ez.out(clamp(a3 / 0.15)), '#FFFFFF', 0.35 * (1 - clamp(a3 / 0.4))); blendMode(BLEND);
    }
  }
  function drainXf(T) {
    const k = drainK(T), wob = sstep(tSing, 42.6, T) * (1 - k);
    const [cx, cy] = vC(T);
    translate(cx, cy);
    rotate(-k * 3.3 + Math.sin(T * 6.5) * 0.012 * wob);
    scale(Math.max(0.001, 1 - k * 0.995));
    translate(-cx, -cy);
  }
  function camFX(T) {
    // L11: slow push-in and a little punch toward the STABLE sign on "stable"
    const push1 = 1 + 0.03 * sstep(37.6, 41.0, T);
    const sp = sstep(tStable - 0.05, tStable + 0.14, T) * (1 - sstep(39.95, 40.4, T));
    translate(960, 560); scale(push1); translate(-960, -560);
    translate(760, 520); scale(1 + 0.035 * sp); translate(-760, -520);
    // L12: push toward the vortex, jolts on "But" and "singularity's", rumble throughout
    const [cx, cy] = vC(T);
    const jolt = 0.05 * Math.exp(-Math.max(0, T - tBut) * 8) * (T > tBut ? 1 : 0) + 0.06 * Math.exp(-Math.max(0, T - tSing) * 7) * (T > tSing ? 1 : 0);
    const z = 1 + 0.05 * Ez.inOut(inv(tSing, 44.3, T)) + jolt;
    translate(cx, cy); scale(z); translate(-cx, -cy);
    shake(windAt(T) * 5 + 14 * Math.exp(-Math.max(0, T - tBut) * 6) * (T > tBut ? 1 : 0) + 10 * Math.exp(-Math.max(0, T - tSing) * 6) * (T > tSing ? 1 : 0), 5);
  }

  function frame(T) {
    const dim = dimAt(T);
    bg(PAL.night);
    push();
    camFX(T);
    drawSky(T, dim);
    drawSkyThings(T);
    if (drainK(T) < 0.995) { push(); drainXf(T); drawLand(T, dim); drawGroundBack(T, dim); pop(); }
    drawSkyDebris(T);
    drawVortex(T);
    if (drainK(T) < 0.995) { push(); drainXf(T); drawGroundFront(T, dim); pop(); }
    drawWind(T);
    drawDebris(T);
    drawClawdFree(T);
    drawPipFly(T);
    drawFX(T);
    pop();
    tint(255);
  }

  shot({ id: 'L11-stable', t0: 35.5, tin: { type: 'iris', d: 0.8, at: 0.5, c: [960, 500] }, draw(s) { frame(s.T); } });
  // continuous camera and world: the hand-off to L12 is the dot popping open on "But"
  shot({ id: 'L12-singularity', t0: tBut, tin: { type: 'cut', d: 0 }, draw(s) { frame(Math.min(s.T, 45.3)); } });

  lyr(11, { y: 150, size: 72, wave: 2, words: { 3: { fill: PAL.butter, anim: 'drop', grow: 0.12 }, 4: { anim: 'rise' }, 5: { fill: PAL.mint, anim: 'slide' } } });
  lyr(12, { y: 948, size: 72, words: { 0: { anim: 'shake', jitter: 3 }, 3: { fill: PAL.pink, anim: 'spin', size: 84, wave: 4 }, 4: { fill: PAL.butter, anim: 'zoom', size: 96, grow: 0.15, jitter: 3 } } });
})();

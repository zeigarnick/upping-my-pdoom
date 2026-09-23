// s09.js - see docs/STORYBOARD.md for this scene brief. Everything here is private to this IIFE.
// S09: L23 museum (the old machine gets retired), L24 sharp left turn (drift + giant Clawd sunrise),
// L25 DJ Clawd and the lonely CD-R that floats up to become the lead-in for s10's moon.
(() => {
  const FLOOR = 880; // museum floor line (case / dolly ground)
  const CREAM = mixc(PAL.cream, PAL.brownLt, 0.28);
  const LAMP_COLS = [PAL.butter, PAL.red, PAL.mint, PAL.sky, PAL.orange];
  // long thin bars: p5.brush's watercolor fill spikes badly on extreme aspect ratios, so paint the
  // wash in short overlapping chunks and pencil one outline around the whole shape
  function paintBar(x, y, w, h, r, c, o = {}) {
    const pts = rrPts(x, y, w, h, r);
    flat(pts, o.baseC || lite(c, 0.18));
    const n = Math.min(3, Math.ceil(w / Math.max(130, h * 4)));
    for (let i = 0; i < n; i++) { wc(c, o.a ?? 150, 0.02, 0.55, 0.8); brush.rect(x + (i * w) / n + 2, y + 3, w / n - 4, h - 6); }
    brush.noFill();
    pen(PAL.ink, o.lw ?? 2, '2B'); brush.polygon(pts); brush.noStroke();
  }
  // cheap detail paint for small parts: flat tint + pencil outline (no watercolor fill pass)
  function pd(pts, c, lw = 1.4, baseC = null, lc = PAL.ink) { flat(pts, baseC || lite(c, 0.08)); pen(lc, lw, '2B'); brush.polygon(pts); brush.noStroke(); }

  // ================= L23 sprites: museum, machine, case =================
  defSprite('s09_museum', 1000, 580, () => {
    wash(-40, -40, 1080, 460, mixc(PAL.cream, PAL.lilacLt, 0.4), 210, 0.08);
    blob(250, 170, 200, PAL.butterLt, 110, 0.35);
    blob(760, 150, 210, PAL.pinkLt, 70, 0.35);
    wash(-40, -40, 1080, 64, mixc(PAL.lilac, PAL.cream, 0.4), 200, 0.05);
    pen(PAL.inkSoft, 1.3, '2B'); brush.line(-10, 24, 1010, 24); brush.noStroke();
    wash(-40, 318, 1080, 80, mixc(PAL.brownLt, PAL.lilac, 0.3), 180, 0.06);
    pen(PAL.inkSoft, 1.3, '2B'); brush.line(-10, 318, 1010, 318); brush.line(-10, 392, 1010, 392); brush.noStroke();
    pen(mixc(PAL.brown, PAL.inkSoft, 0.3), 1.1, 'pen');
    for (let i = 0; i < 9; i++) brush.rect(16 + i * 112, 334, 88, 44);
    brush.noStroke();
    // floor
    wash(-40, 392, 1080, 230, mixc(PAL.brownLt, PAL.cream, 0.4), 215, 0.08);
    blob(500, 480, 280, PAL.butterLt, 80, 0.4);
    pen(mixc(PAL.brown, PAL.cream, 0.25), 1.1, 'pen');
    for (let i = -9; i <= 9; i++) brush.line(500 + i * 34, 394, 500 + i * 170, 620);
    for (const y of [412, 440, 480, 534]) brush.line(-10, y, 1010, y);
    brush.noStroke();
    // columns
    for (const x of [46, 954]) {
      pd(rrPts(x - 34, 40, 68, 356, 8), PAL.cream, 1.8, '#FFFBF1');
      pen(PAL.grayLt, 2, 'pen'); for (let k = -1; k <= 1; k++) brush.line(x + k * 16, 70, x + k * 16, 370); brush.noStroke();
      pd(rrPts(x - 44, 30, 88, 24, 6), PAL.cream, 1.6, '#FFFBF1');
      pd(rrPts(x - 44, 380, 88, 22, 6), PAL.cream, 1.6, '#FFFBF1');
    }
    // two gallery paintings
    pd(rrPts(118, 96, 160, 124, 8), PAL.gold, 2, '#FFD75A');
    pd(rrPts(134, 112, 128, 92, 4), PAL.skyLt, 1.2, '#E4F3FF');
    blob(222, 140, 18, PAL.butter, 220, 0.1);
    paint([[134, 204], [180, 160], [214, 184], [262, 150], [262, 204]], PAL.grass, { baseC: lite(PAL.grass, 0.3), lw: 1.2 });
    pd(rrPts(730, 86, 140, 164, 8), PAL.gold, 2, '#FFD75A');
    pd(rrPts(746, 102, 108, 132, 4), PAL.mintLt, 1.2, '#E6FAF1');
    blob(790, 150, 26, PAL.pink, 200, 0.2); blob(818, 196, 18, PAL.lilac, 200, 0.2);
  });
  defSprite('s09_machine', 780, 480, () => {
    strokePath([[120, 46], [190, 6], [320, 30], [388, 46]], PAL.inkSoft, 5, 'marker', 0.6);
    strokePath([[404, 46], [520, 10], [650, 46]], PAL.teal, 5, 'marker', 0.6);
    const cab = (x, w) => paint(rrPts(x, 40, w, 412, 16), CREAM, { baseC: lite(CREAM, 0.35), a: 160, lw: 2.4 });
    cab(22, 232); cab(268, 244); cab(526, 232);
    // left cabinet: dials, switches, card hopper, knob
    pd(rrPts(40, 64, 196, 96, 10), PAL.mint, 1.6, lite(PAL.mint, 0.15));
    for (let i = 0; i < 3; i++) {
      const x = 80 + i * 58;
      pd(ellPts(x, 112, 22, 22, 24), '#FFFFFF');
      pen(PAL.red, 2.4, 'pen'); brush.line(x, 112, x + Math.cos(-2.4 + i * 0.8) * 16, 112 + Math.sin(-2.4 + i * 0.8) * 16); brush.noStroke();
    }
    for (let i = 0; i < 6; i++) pd(rrPts(50 + i * 30, 182, 16, 28, 4), [PAL.red, PAL.butter, PAL.sky][i % 3], 1.2);
    pd(rrPts(52, 236, 180, 40, 8), PAL.ink, 1.6, '#3A3050');
    pd(ellPts(138, 334, 36, 36, 28), PAL.orange, 1.8, lite(PAL.orange, 0.1));
    pen(PAL.ink, 4, 'marker'); brush.line(138, 334, 158, 312); brush.noStroke();
    // centre cabinet: two reel windows (they read as eyes) + lamp panel
    for (const x of [330, 452]) {
      pd(ellPts(x, 132, 60, 60, 36), PAL.grayLt, 2, '#EEEAF4');
      pd(ellPts(x, 132, 50, 50, 36), PAL.navy, 1.4, '#2E3A70');
    }
    pd(rrPts(288, 212, 204, 164, 12), PAL.navy, 1.8, '#27305E');
    // right cabinet: lamp panel, printer slot with paper tape, keys
    pd(rrPts(548, 66, 190, 128, 12), PAL.navy, 1.8, '#27305E');
    pd(rrPts(560, 226, 166, 22, 6), PAL.ink, 1.4, '#3A3050');
    pd([[606, 244], [680, 244], [686, 296], [664, 322], [624, 318], [610, 292]], '#FFFFFF', 1.4, '#FFFDF6');
    for (let k = 0; k < 4; k++) flat(ellPts(624 + k * 14, 262 + (k % 2) * 12, 3, 3, 8), PAL.inkSoft, 0.8);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) pd(rrPts(568 + c * 40, 348 + r * 34, 28, 22, 5), [PAL.sky, PAL.pink, PAL.butter, PAL.mint][(r + c) % 4], 1.2);
    // vents
    pen(PAL.inkSoft, 2, 'pen');
    for (let i = 0; i < 4; i++) { brush.line(60, 392 + i * 11, 216, 392 + i * 11); brush.line(300, 396 + i * 11, 480, 396 + i * 11); }
    brush.noStroke();
  }, { v: 1, ay: 0.96 });
  defSprite('s09_reel', 120, 120, () => {
    paint(ellPts(60, 60, 44, 44, 36), PAL.brown, { baseC: mixc(PAL.brown, PAL.ink, 0.2), a: 190, lw: 1.4 });
    pen(mixc(PAL.brown, PAL.white, 0.3), 1.2, 'pen'); brush.circle(60, 60, 34); brush.noStroke();
    paint(ellPts(60, 60, 24, 24, 28), PAL.grayLt, { baseC: '#F4F2F8', lw: 1.4 });
    for (let k = 0; k < 3; k++) { const a = (k * TAU) / 3; flat(ellPts(60 + Math.cos(a) * 13, 60 + Math.sin(a) * 13, 6, 6, 12), PAL.navy); }
    flat(ellPts(60, 60, 4, 4, 10), PAL.ink);
  }, { v: 2 });
  defSprite('s09_dolly', 860, 90, () => {
    pd(rrPts(20, 20, 820, 34, 8), PAL.brownLt, 2, lite(PAL.brownLt, 0.15));
    pen(PAL.brown, 1.4, 'pen'); for (let i = 1; i < 8; i++) brush.line(20 + i * 102, 24, 20 + i * 102, 50); brush.noStroke();
    for (const x of [80, 780]) pd(rrPts(x - 16, 50, 32, 20, 4), PAL.gray, 1.4, PAL.grayLt);
  }, { ay: 0.25 });
  defSprite('s09_wheel', 64, 64, () => {
    paint(ellPts(32, 32, 22, 22, 24), PAL.ink, { baseC: '#4A3E66', lw: 1.4 });
    flat(ellPts(32, 32, 9, 9, 16), PAL.gray);
    flat(rrPts(29, 14, 6, 14, 2), PAL.grayLt);
  }, { v: 1 });
  defSprite('s09_case', 920, 660, () => {
    // (glass tint + highlights are drawn live: translucent fills inside sprites composite too bright)
    pen(lite(PAL.sky, 0.1), 1.4, 'pen'); brush.line(74, 62, 846, 62); brush.line(74, 62, 74, 546); brush.line(846, 62, 846, 546); brush.noStroke();
    pen(PAL.gold, 6, 'marker'); brush.line(34, 36, 34, 568); brush.line(886, 36, 886, 568); brush.noStroke();
    pen(PAL.ink, 1.8, '2B'); brush.rect(30, 32, 860, 538); brush.noStroke();
    paintBar(18, 14, 884, 30, 8, PAL.brown, { baseC: PAL.brownLt });
    paintBar(12, 566, 896, 70, 10, PAL.brown, { baseC: mixc(PAL.brown, PAL.brownLt, 0.5), lw: 2.2 });
  }, { ay: 636 / 660 });
  defSprite('s09_plaque', 380, 100, () => {
    paint(rrPts(14, 14, 352, 72, 14), PAL.gold, { baseC: '#FFD75A', lw: 2 });
    const t = textImg('OBSOLETE', { font: 'pixel', size: 48, fill: PAL.ink, weight: 700 });
    image(t.img, 190 - t.w / 2, 50 - t.h / 2);
    for (const x of [32, 348]) flat(ellPts(x, 50, 5, 5, 10), PAL.brown);
  });
  defSprite('s09_cobweb', 220, 220, () => {
    const O = [12, 12], sp = [0, 0.32, 0.66, 0.98, 1.28, 1.5708];
    pen(mixc(PAL.gray, PAL.inkSoft, 0.3), 1.6, 'pen');
    for (const a of sp) brush.line(O[0], O[1], O[0] + Math.cos(a) * 200, O[1] + Math.sin(a) * 200);
    for (let k = 1; k <= 5; k++) {
      const r = k * 36, pts = [];
      for (let i = 0; i < sp.length; i++) {
        pts.push([O[0] + Math.cos(sp[i]) * r, O[1] + Math.sin(sp[i]) * r]);
        if (i < sp.length - 1) { const m = (sp[i] + sp[i + 1]) / 2; pts.push([O[0] + Math.cos(m) * r * 0.86, O[1] + Math.sin(m) * r * 0.86]); }
      }
      brush.spline(pts, 0.5);
    }
    brush.noStroke();
  }, { ax: 0.05, ay: 0.05 });
  defSprite('s09_card', 110, 70, () => {
    paint([[14, 14], [86, 14], [96, 24], [96, 56], [14, 56]], PAL.butterLt, { baseC: '#FFF6D0', lw: 1.4 });
    for (let i = 0; i < 14; i++) flat(rrPts(22 + (i % 7) * 10, 22 + Math.floor(i / 7) * 14 + (random() < 0.5 ? 0 : 6), 4, 7, 1), PAL.inkSoft, 0.8);
  }, { v: 2 });
  defSprite('s09_post', 70, 230, () => {
    paint(ellPts(35, 210, 30, 10, 20), PAL.gold, { baseC: '#FFD75A', lw: 1.6 });
    paint(rrPts(29, 30, 12, 180, 5), PAL.gold, { baseC: '#FFE17A', lw: 1.6 });
    paint(ellPts(35, 28, 14, 14, 20), PAL.gold, { baseC: '#FFD75A', lw: 1.6 });
  }, { ay: 0.95 });
  defSprite('s09_camera', 110, 80, () => {
    paint(rrPts(10, 20, 90, 52, 10), PAL.ink, { baseC: '#4A3E66', lw: 1.6 });
    paint(rrPts(20, 10, 30, 14, 4), PAL.gray, { lw: 1.2 });
    paint(ellPts(58, 46, 18, 18, 24), PAL.sky, { baseC: lite(PAL.sky, 0.3), lw: 1.6 });
    flat(ellPts(52, 40, 5, 5, 10), '#FFFFFF', 0.9);
  });

  // ================= L23: Now von Neumann's obsolete =================
  // lamp grid in machine-sprite coords: centre panel 4x5 (it doubles as the machine's mouth), right panel 3x5
  const LAMPS = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) LAMPS.push([310 + c * 42, 238 + r * 38, r + c]);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) LAMPS.push([572 + c * 36, 92 + r * 36, r * 2 + c]);
  const HERO = 7; // centre panel row 1 col 2: the lamp that matches s08's last blinking node
  const FROWN = new Set([11, 12, 13, 15, 19]);
  const SMILE = new Set([10, 14, 16, 17, 18]);
  const PATS = [80.27, 80.5];
  const SLAM = 79.82;
  function lampLevel(i, T) {
    const b = beatAt(T);
    if (T < 77.28) return i === HERO ? (b.ph < 0.5 ? 1 : 0.12) : 0;
    const on = i === HERO ? 77.28 : 77.36 + R(i, 3) * 0.42;
    if (T < on) return 0;
    if (T < SLAM) {
      if (T < on + 0.12 || Math.abs(T - 78.7) < 0.14) return 1;
      return R(i, b.i * 2 + (b.ph > 0.5 ? 1 : 0)) > 0.42 ? 1 : 0.15;
    }
    if (T < 80.0) return R(i, Math.floor(T * 30)) > 0.72 ? 0.6 : 0.04;
    if (i < 20) { const face = T < PATS[1] + 0.02 ? FROWN : SMILE; return face.has(i) ? 0.8 + 0.2 * Math.sin(T * 7) : 0.05; }
    return R(i, b.i) > 0.55 ? 0.7 : 0.1;
  }
  const machineX = (T) => lerp(700, 960, Ez.inOut(inv(77.2, 79.35, T)));
  // droopy lid over a reel window (d = 0 open .. 1 shut)
  function reelLid(x, y, d) {
    if (d <= 0.01) return;
    const r = 51, yc = -r + d * 2 * r;
    const beta = Math.asin(clamp(yc / r, -1, 1));
    noStroke(); fill(CREAM);
    arc(x, y, r * 2, r * 2, Math.PI - beta, TAU + beta, CHORD);
    const hw = Math.sqrt(Math.max(0, r * r - yc * yc));
    segLine(x - hw, y + yc, x + hw, y + yc, PAL.ink, 3.5);
  }
  function patArm(T) {
    let a = 0.3;
    for (const tp of PATS) {
      const d = T - tp;
      if (d > -0.18 && d <= 0) a = lerp(lerp(0.3, -0.9, Ez.out(inv(-0.18, -0.07, d))), 0.3, Ez.in(inv(-0.07, 0, d)));
      else if (d > 0 && d < 0.22) a = 0.3 - 0.14 * Math.sin(d * 30) * Math.exp(-d * 12);
    }
    return a;
  }
  const VIS = [
    { x: 1540, y: 992, s: 0.68, body: 'npc_body_mint', arm: 'npc_arm_mint', head: 'npc_head2', seed: 11 },
    { x: 1690, y: 1004, s: 0.66, body: 'npc_body_butter', arm: 'npc_arm_butter', head: 'npc_head3', seed: 23, cam: true },
    { x: 1830, y: 986, s: 0.7, body: 'npc_body_sky', arm: 'npc_arm_sky', head: 'npc_head2', seed: 37 },
  ];
  const FLASHES = [79.98, 80.56];
  shot({
    id: 'L23-museum', t0: 77.28, tin: { type: 'pixel', d: 0.6, at: 0.5 },
    draw(s) {
      const T = s.T;
      const lit = T < 77.46 ? 0 : T < 77.74 ? (R(Math.floor(T * 22), 5) > 0.45 ? 0.85 : 0.2) : 1;
      const mx = machineX(T);
      const jt = T - 78.62;
      const jolt = jt > 0 ? Math.exp(-jt * 6) * Math.abs(Math.sin(jt * 20)) : 0;
      const my = FLOOR - 58 - jolt * 34 - (T < 79.35 ? hopB(T) * 4 : 0);
      const ox = mx - 390, oy = my - 461;
      const heroX = ox + LAMPS[HERO][0], heroY = oy + LAMPS[HERO][1];
      const pull = Ez.inOut(inv(77.55, 78.5, T));
      const slam = T - SLAM;
      const push2 = sstep(79.95, 80.7, T);
      const Z = lerp(2.8, 1, pull) * (1 + 0.12 * push2) + (slam > 0 ? Math.exp(-slam * 9) * 0.03 : 0);
      const cx = lerp(heroX, 960, pull) - 70 * push2, cy = lerp(heroY, 540, pull) + 20 * push2;
      push();
      if (slam > 0) shake(Math.exp(-slam * 6) * 20, 3);
      cam(cx, cy, Z);
      washBG('s09_museum');
      // floating dust motes in the gallery light
      for (let i = 0; i < 26; i++) {
        const x = 100 + R(i, 41) * 1720 + Math.sin(T * 0.7 + i) * 20;
        const y = 820 - fract(R(i, 42) + T * 0.05 * (0.5 + R(i, 43))) * 760;
        disc(x, y, 2 + R(i, 44) * 3, '#FFFFFF', lit * (0.35 + 0.35 * Math.sin(T * 3 + i)));
      }
      // spotlight that clunks on over the exhibit after the slam
      const spot = sstep(79.9, 80.0, T);
      if (spot > 0) { noStroke(); fill(withAlphaCol(PAL.butterLt, 0.22 * spot)); triangle(900, -60, 1020, -60, 1480, FLOOR + 20); triangle(900, -60, 440, FLOOR + 20, 1480, FLOOR + 20); }
      spr('paperclip', 1400, 912, { s: 0.26, r: 1.25 });
      // falling-case shadow, then the case's floor shadow
      const fall = inv(79.3, SLAM, T);
      if (fall > 0) { noStroke(); fill(withAlphaCol(PAL.ink, 0.22 * Ez.in(fall))); ellipse(960, FLOOR + 6, 940 * lerp(0.4, 1, Ez.in(fall)), 46); }
      // dolly + machine
      spr('s09_dolly', mx, FLOOR - 48, { jit: 0.5 });
      const wheel = (mx - 700) / 22;
      for (const dx of [-350, 350]) spr('s09_wheel', mx + dx, FLOOR - 22, { r: wheel, jit: 0 });
      spr('s09_machine', mx, my, { jit: 0.6, seed: 2 });
      const reel = Math.min(T, SLAM) * 1.4 + 9 * Ez.inOut(inv(77.2, 79.35, T)) + 6 * sstep(78.62, 79.1, T) + Math.max(0, T - PATS[1]) * 9;
      spr('s09_reel', ox + 330, oy + 132, { r: reel, jit: 0, seed: 1 });
      spr('s09_reel', ox + 452, oy + 132, { r: reel * 1.1 + 1, jit: 0, seed: 2, v: 1 });
      // reel "eyes": blink while rolling, droop after the slam, perk up after Clawd's pats
      const blinkP = fract(T * 0.55 + 0.3);
      let lid = blinkP < 0.05 ? 0.8 * (1 - Math.abs(blinkP - 0.025) * 40) : 0;
      if (T > SLAM) lid = 0.5 * sstep(SLAM, SLAM + 0.25, T) * (1 - sstep(PATS[1], PATS[1] + 0.12, T));
      reelLid(ox + 330, oy + 132, lid); reelLid(ox + 452, oy + 132, lid);
      // "von": the machine huffs a steam puff from its top
      burst(T, 78.02, ox + 390, oy + 40, { n: 5, names: ['puff'], spd: 360, g: -200, drag: 3, life: 1.0, s: 0.4, spread: 1.4, ang0: -Math.PI / 2, seed: 70 });
      // "Neumann's": the dolly bumps a floor seam and spits punch cards
      burst(T, 78.62, ox + 142, oy + 250, { n: 14, names: ['s09_card'], spd: 1100, g: 1500, drag: 1.5, life: 1.3, s: 0.9, spread: 1.5, ang0: -Math.PI / 2 - 0.5, spin: 6, seed: 80 });
      // darkness until the gallery lights flicker on
      if (lit < 1) { noStroke(); fill(withAlphaCol(PAL.night, 0.96 * (1 - lit))); rect(-200, -200, W + 400, H + 400); }
      // lamps (drawn over the darkness so they glow)
      for (let i = 0; i < LAMPS.length; i++) {
        const [lx, ly, ci] = LAMPS[i];
        const lev = lampLevel(i, T), px = ox + lx, py = oy + ly;
        const c = i < 20 && T > 80.0 ? PAL.butter : LAMP_COLS[ci % 5];
        disc(px, py, 13, '#141026');
        disc(px, py, 10, c, 0.15 + 0.85 * lev);
        if (lev > 0.5) { disc(px - 3, py - 3, 3.2, '#FFFFFF', 0.8 * lev); glow(px, py, 34, c, lev * (0.12 + 0.45 * (1 - lit))); }
      }
      if (T < 77.6) glow(heroX, heroY, 150 * (1 + kick(T, 5)), PAL.butter, 0.5 * Math.exp(-Math.max(0, T - 77.28) * 3) * (T >= 77.28 ? 1 : 0.4));
      // the glass case drops on "obsolete"
      const caseY = T < 79.5 ? -80 : lerp(-80, FLOOR, Ez.in(inv(79.5, SLAM, T)));
      if (T > 79.5) {
        const sq = slam > 0 ? 1 - 0.08 * Math.exp(-slam * 9) * Math.cos(slam * 34) : 1.04;
        push(); translate(960, caseY); scale(2 - sq, sq);
        noStroke(); fill(withAlphaCol(PAL.skyLt, 0.2)); rect(-426, -602, 852, 536);
        fill(withAlphaCol('#FFFFFF', 0.28));
        for (const [x, w] of [[-160, 40], [-100, 12], [310, 30], [354, 10]]) quad(x, -596, x + w, -596, x + w - 220, -72, x - 220, -72);
        pop();
        spr('s09_case', 960, caseY, { sy: sq, sx: 2 - sq, jit: 0.4 });
        const pk = slam > 0 ? Ez.outBack(clamp(slam / 0.25), 3) : 0;
        spr('s09_plaque', 960, caseY - 34 * sq, { s: 0.92 * (0.6 + 0.4 * pk), a: clamp(pk * 3) });
        // cobwebs creep into the corners
        const web = Ez.outBack(inv(80.0, 80.35, T));
        if (web > 0.001) {
          spr('s09_cobweb', 566, 278, { s: web * 0.85, jit: 0.3 });
          spr('s09_cobweb', 1354, 278, { s: web * 0.7, flip: true, jit: 0.3, seed: 3 });
          spr('s09_cobweb', ox + 30, oy + 44, { s: web * 0.45, jit: 0.3, seed: 5 });
          // a tiny dangling spider bobbing to the beat
          const sy = 278 + web * (110 + hopB(T) * 22);
          segLine(1250, 278, 1250, sy, PAL.gray, 1.5);
          for (let k = 0; k < 6; k++) { const sd = k < 3 ? -1 : 1, kk = k % 3; segLine(1250, sy, 1250 + sd * 20, sy - 10 + kk * 10 + Math.sin(T * 12 + k) * 3, PAL.ink, 2.4); }
          disc(1250, sy, 12, PAL.ink); disc(1245, sy - 3, 3.5, '#FFFFFF'); disc(1255, sy - 3, 3.5, '#FFFFFF');
        }
        // slam dust
        burst(T, SLAM, 540, FLOOR - 16, { n: 8, names: ['puff'], spd: 900, g: -120, drag: 4, life: 1.3, s: 0.55, spread: 0.9, ang0: Math.PI, seed: 90 });
        burst(T, SLAM, 1380, FLOOR - 16, { n: 8, names: ['puff'], spd: 900, g: -120, drag: 4, life: 1.3, s: 0.55, spread: 0.9, ang0: 0, seed: 99 });
        burst(T, SLAM, 960, 290, { n: 6, names: ['puff'], spd: 520, g: 160, drag: 3, life: 0.9, s: 0.26, spread: Math.PI, ang0: -Math.PI / 2, seed: 120 });
        // the machine cheers up: hearts after the second pat
        burst(T, PATS[1] + 0.02, 960, 520, { n: 9, names: ['heart', 'heartR', 'spark'], spd: 520, g: -260, drag: 2.4, life: 1.1, s: 0.42, spread: 2.4, ang0: -Math.PI / 2, seed: 130 });
      }
      // Clawd: pushes the dolly, hops clear of the falling case, gives two sympathetic pats, then zooms off right
      const cs = 0.64;
      const o = { eyes: 'ce_sq', armL: 0.25 + Math.sin(T * 7) * 0.15, armR: -0.2, blush: true, look: [0.45, 0] };
      let clx = mx - 516, cly = 900;
      if (T < 79.35) { o.walk = (T - 77.0) * 2.15; o.r = 0.1; o.armR = -0.22; }
      else if (T < 79.98) {
        const hb = inv(79.5, 79.72, T);
        clx = lerp(mx - 516, 356, Ez.out(hb));
        o.hop = Math.sin(Math.PI * hb) * 80;
        o.sq = 1 + 0.18 * Math.exp(-Math.max(0, T - 79.72) * 12) * (T > 79.72 ? 1 : 0) - (hb > 0 && hb < 1 ? 0.1 : 0);
        o.eyes = T > 79.42 ? 'ce_dot' : 'ce_sq'; o.look = [0.3, -0.7];
        o.armL = T > 79.42 ? -1.2 : 0.2; o.armR = T > 79.42 ? -1.2 : 0.2;
        if (slam > 0) { o.eyes = 'ce_x'; o.look = [0, 0]; o.hop = Math.exp(-slam * 10) * 30; }
      } else if (T < 80.72) {
        clx = lerp(356, 408, Ez.inOut(inv(79.98, 80.12, T)));
        o.walk = T < 80.12 ? (T - 79.98) * 6 : null;
        o.armR = patArm(T); o.armL = 0.3;
        o.eyes = T > 80.12 ? 'ce_happy' : 'ce_sq'; o.look = [0.3, 0];
        o.r = 0.05 + 0.03 * Math.sin(T * 6);
      } else {
        const zt = T - 80.72;
        o.acc = ['headband'];
        o.eyes = 'ce_sq'; o.look = [0.8, 0];
        o.sq = zt < 0.08 ? 1 + zt * 2.5 : 1.3;
        clx = 408 - 20 * Math.sin(Math.PI * clamp(zt / 0.08)) * (zt < 0.08 ? 1 : 0) + 2600 * Ez.in(inv(80.8, 81.1, T));
        o.armL = -0.6; o.armR = 0.6; o.r = 0.12;
        if (zt > 0.08) for (let i = 0; i < 7; i++) { const y = cly - 40 - i * 34; segLine(clx - 180 - R(i, 7) * 400, y, clx - 160, y, PAL.inkSoft, 5, 0.5); }
      }
      clawd(clx, cly, cs, o);
      if (T > 80.0 && T < 80.72) for (const tp of PATS) burst(T, tp, 560, 772, { n: 5, names: ['sparkW'], spd: 300, g: 0, life: 0.4, s: 0.25, even: true, seed: Math.round(tp * 10) });
      // velvet rope + visitors peering in
      spr('s09_post', 1430, 935, { s: 0.8, jit: 0.4 }); spr('s09_post', 1905, 935, { s: 0.8, jit: 0.4, seed: 2 });
      noFill(); stroke(PAL.red); strokeWeight(12);
      beginShape(); for (let k = 0; k <= 16; k++) { const u = k / 16; vertex(lerp(1430, 1905, u), 790 + Math.sin(Math.PI * u) * (50 + Math.sin(T * 3) * 4)); } endShape();
      noStroke();
      const peer = sstep(79.9, 80.2, T);
      for (let i = 0; i < VIS.length; i++) {
        const v = VIS[i];
        const shock = slam > 0 && slam < 0.5;
        const face = shock ? 'pf_shock' : T > PATS[1] + 0.05 ? 'pf_love' : 'pf_neutral';
        const vx = v.x - peer * 36;
        const hop = shock ? Math.exp(-slam * 8) * 40 : hopB(T + i * 0.15) * 7;
        const armR = v.cam ? 1.7 : shock ? 2.3 : i === 0 && T < 79.4 ? 1.3 + Math.sin(T * 5) * 0.2 : 0.25;
        pip(vx, v.y, v.s, { flip: true, body: v.body, arm: v.arm, head: v.head, face, r: -0.14 * peer, hop, armR, armL: shock ? 2.3 : 0.2, seed: v.seed, headR: T < 79.4 ? -0.08 + Math.sin(T * 2 + i) * 0.05 : 0 });
        if (v.cam) {
          const camX = vx - 92 * v.s - peer * 20, camY = v.y - hop - 300 * v.s;
          spr('s09_camera', camX, camY, { s: 0.8, flip: true });
          for (const ft of FLASHES) {
            const fa = T - ft;
            if (fa > 0 && fa < 0.3) { spr('sparkW', camX - 30, camY - 10, { s: 1.4 * Ez.outBack(clamp(fa / 0.08)), a: 1 - fa / 0.3, r: fa * 3 }); glow(camX - 30, camY - 10, 160, '#FFFFFF', 0.5 * (1 - fa / 0.3)); }
          }
        }
      }
      pop();
      // camera flash washes the frame for a blink
      for (const ft of FLASHES) { const fa = T - ft; if (fa > 0 && fa < 0.2) { noStroke(); fill(withAlphaCol('#FFFFFF', 0.35 * (1 - fa / 0.2))); rect(0, 0, W, H); } }
    },
  });
  // "obsolete" becomes a red rubber stamp in the lyric layer
  function stampWord(T, age, wd, a) {
    if (age < 0) return;
    const k = clamp(age / 0.1);
    const sc = lerp(2.8, 1, Ez.in(k)) * (1 + 0.12 * Math.exp(-Math.max(0, age - 0.1) * 12) * (k >= 1 ? 1 : 0));
    const t = textImg('OBSOLETE', { font: 'pixel', size: 66, fill: PAL.red, weight: 700, stroke: '#FFFFFF', sw: 5 });
    const al = a * clamp(k * 2);
    push(); rotate(-0.09); scale(sc);
    noFill(); stroke(withAlphaCol('#FFFFFF', al)); strokeWeight(14); rect(-t.tw / 2 - 24, -50, t.tw + 48, 100, 14);
    stroke(withAlphaCol(PAL.red, al)); strokeWeight(7); rect(-t.tw / 2 - 24, -50, t.tw + 48, 100, 14); noStroke();
    tint(255, 255 * al); image(t.img, -t.w / 2, -t.h / 2); tint(255);
    pop();
  }
  lyr(23, { y: 140, size: 76, words: { 0: { anim: 'zoom' }, 1: { fill: PAL.butterLt }, 2: { fill: PAL.butter, anim: 'drop' }, 3: { anim: 'type', draw: stampWord } } });


  // ================= L24 sprites: the road trip =================
  const HOR = 600, KZ = 520, RW = 1.1, ZCAR = 1.3;
  const ROAD_A = mixc(PAL.gray, PAL.lilac, 0.3), ROAD_B = mixc(mixc(PAL.gray, PAL.lilac, 0.3), PAL.ink, 0.12);
  function mountains(c, cl) {
    for (const [x, h, w] of [[90, 110, 170], [330, 150, 210], [580, 100, 170], [820, 140, 200], [1010, 96, 150]]) pd([[x - w, 336], [x - w * 0.18, 330 - h], [x + w * 0.18, 336 - h], [x + w, 336]], c, 1.4, cl);
    wc(c, 90, 0.1, 0.6, 0.5); brush.rect(-20, 200, 1040, 140); brush.noFill();
  }
  defSprite('s09_sky_day', 1000, 330, () => {
    flat([[-10, -10], [1010, -10], [1010, 340], [-10, 340]], lite(PAL.sky, 0.3));
    wash(-40, -40, 1080, 420, PAL.sky, 160, 0.06);
    for (let i = 0; i < 4; i++) blob(i * 300 + 50, 370, 210, PAL.skyLt, 170, 0.3);
    for (const [x, y, r] of [[160, 80, 50], [220, 74, 36], [740, 58, 44], [796, 70, 32]]) blob(x, y, r, '#FFFFFF', 210, 0.15);
    mountains(PAL.lilac, PAL.lilacLt);
  });
  defSprite('s09_sky_dusk', 1000, 330, () => {
    flat([[-10, -10], [1010, -10], [1010, 340], [-10, 340]], mixc(PAL.lilac, PAL.pink, 0.3));
    wash(-40, -40, 1080, 420, PAL.lilac, 170, 0.06);
    for (let i = 0; i < 4; i++) blob(i * 300 + 50, 330, 230, PAL.pink, 150, 0.3);
    blob(500, 400, 240, PAL.orange, 130, 0.3);
    for (const [x, y, r] of [[150, 90, 44], [800, 70, 38]]) blob(x, y, r, PAL.pinkLt, 180, 0.15);
    mountains(mixc(PAL.lilac, PAL.navy, 0.35), mixc(PAL.lilac, PAL.pink, 0.3));
  });
  defSprite('s09_hills', 1000, 170, () => {
    for (let i = 0; i < 9; i++) { const x = i * 125, y = 160 + (i % 2) * 12, r = 64 + (i % 3) * 12; flat(ellPts(x, y, r, r, 32), lite(PAL.mint, 0.1)); blob(x, y, r, PAL.mint, 170, 0.12); }
  }, { ay: 1 });
  defSprite('s09_ground', 1000, 300, () => {
    flat([[-10, -10], [1010, -10], [1010, 310], [-10, 310]], lite(PAL.grass, 0.15));
    wash(-40, -40, 1080, 380, PAL.grass, 170, 0.06);
    for (let i = 0; i < 2; i++) blob(i * 600 + 200, 60, 200, PAL.mintLt, 90, 0.35);
    for (let i = 0; i < 3; i++) blob(170 + i * 330, 240, 150, PAL.grassDk, 90, 0.35);
    for (let i = 0; i < 90; i++) { const y = 20 + random() * 270, r = 2 + y * 0.022; flat(ellPts(random() * 1000, y, r, r * 0.8, 10), [PAL.pink, PAL.butter, '#FFFFFF'][i % 3], 0.9); }
  });
  defSprite('s09_tree', 220, 300, () => {
    paint(rrPts(97, 170, 26, 120, 8), PAL.brown, { baseC: PAL.brownLt, lw: 1.6 });
    paint(ellPts(110, 112, 92, 88, 32, 0.08), PAL.grass, { baseC: lite(PAL.grass, 0.3), lw: 2 });
    blob(82, 86, 28, lite(PAL.grass, 0.5), 150, 0.2);
    for (let i = 0; i < 5; i++) flat(ellPts(60 + random() * 100, 70 + random() * 90, 7, 7, 12), [PAL.pink, PAL.butter][i % 2]);
  }, { v: 2, ay: 0.97 });
  defSprite('s09_rpost', 50, 150, () => {
    pd(rrPts(16, 14, 18, 128, 6), '#FFFFFF', 1.4, '#FFFFFF');
    flat(rrPts(16, 26, 18, 18, 3), PAL.red);
  }, { ay: 0.95 });
  defSprite('s09_sign', 400, 640, () => {
    pd(rrPts(187, 300, 26, 330, 8), PAL.gray, 1.8, PAL.grayLt);
    const d = [[200, 18], [372, 190], [200, 362], [28, 190]];
    paint(rrPtsPoly(d, 26), PAL.butter, { baseC: '#FFE17A', lw: 3 });
    pen(PAL.ink, 3.5, 'marker'); brush.polygon(rrPtsPoly(scalePts(d, 200, 190, 0.86), 20)); brush.noStroke();
    pd([[216, 292], [216, 172], [150, 172], [150, 204], [96, 150], [150, 96], [150, 128], [260, 128], [260, 292]], PAL.ink, 1.4, '#3A3050');
    paint(rrPts(34, 384, 332, 150, 16), '#FFFFFF', { baseC: '#FFFFFF', lw: 3 });
    for (const [str, y, sz] of [['SHARP LEFT', 428, 52], ['TURN', 492, 58]]) { const t = textImg(str, { font: 'display', size: sz, fill: PAL.ink, weight: 700 }); image(t.img, 200 - t.w / 2, y - t.h / 2); }
  }, { ay: 0.98 });
  defSprite('s09_chev', 170, 280, () => {
    pd(rrPts(76, 140, 18, 130, 6), PAL.gray, 1.4, PAL.grayLt);
    paint(rrPts(12, 16, 146, 130, 14), PAL.butter, { baseC: '#FFE17A', lw: 2 });
    pd([[36, 81], [96, 30], [128, 30], [70, 81], [128, 132], [96, 132]], PAL.ink, 1.2, '#3A3050');
  }, { ay: 0.97 });
  defSprite('s09_car', 470, 300, () => {
    for (const x of [34, 356]) pd(rrPts(x, 186, 80, 96, 18), PAL.ink, 1.6, '#3A3050');
    const body = [[64, 108], [406, 108], [440, 168], [446, 244], [24, 244], [30, 168]];
    paint(rrPtsPoly(body, 24), PAL.mint, { baseC: lite(PAL.mint, 0.25), a: 160, lw: 2.4 });
    flat(rrPts(206, 112, 22, 128, 4), '#FFFFFF', 0.95); flat(rrPts(242, 112, 22, 128, 4), '#FFFFFF', 0.95);
    pd(rrPts(48, 146, 76, 36, 12), PAL.red, 1.6, '#FF5A6E');
    pd(rrPts(346, 146, 76, 36, 12), PAL.red, 1.6, '#FF5A6E');
    pd(rrPts(186, 190, 98, 38, 8), '#FFFFFF', 1.6, '#FFFFFF');
    pd(heartPts(235, 210, 26), PAL.pink, 1.2, PAL.pink);
    pd(rrPts(330, 236, 40, 22, 9), PAL.gray, 1.4, PAL.grayLt);
    pd(rrPts(40, 232, 390, 22, 10), mixc(PAL.mint, PAL.ink, 0.25), 1.6, mixc(PAL.mint, PAL.ink, 0.25));
  }, { v: 2, ay: 0.94 });

  // ================= L24: Sharp left turn and there you are =================
  const TURN = 82.0, SWAP = 82.45, GS = 1.35;
  const posPre = (T) => 16 * (T - 80.5);
  const S_TURN = posPre(TURN) + ZCAR + 0.35;
  const rxPre = (s) => (s < S_TURN ? 0.8 * Math.sin(s * 0.21) * (1 - sstep(S_TURN - 9, S_TURN - 3, s)) : -2.6 * Math.pow(s - S_TURN, 1.25));
  const posPost = (T) => { const t = clamp(T - SWAP, 0, 0.9); return 14 * (t - (t * t) / 1.8); };
  const rxPost = () => 0;
  // roadside objects: [sprite, s, lateral offset from road centre, world height, seed]
  const OBJ_PRE = [], OBJ_POST = [];
  for (let k = 0; k < 14; k++) { const s = 2.1 * k + R(k, 60) * 1.1; if (s < S_TURN - 1) OBJ_PRE.push(['s09_tree', s, (k % 2 ? 1 : -1) * (RW + 1.3 + R(k, 61) * 2.4), 2.7 + R(k, 62) * 0.9, k]); }
  for (let k = 0; k < 20; k++) { const s = 1.3 * k; if (s < S_TURN - 0.4) { OBJ_PRE.push(['s09_rpost', s, RW + 0.32, 0.8, k]); OBJ_PRE.push(['s09_rpost', s, -RW - 0.32, 0.8, k + 50]); } }
  OBJ_PRE.push(['s09_sign', S_TURN + 0.9, 0.1, 2.9, 0], ['s09_chev', S_TURN + 0.75, 1.7, 1.25, 1], ['s09_chev', S_TURN + 0.6, 3.1, 1.25, 2], ['s09_chev', S_TURN + 0.8, -1.5, 1.25, 3]);
  for (let k = 0; k < 6; k++) OBJ_PRE.push(['s09_tree', S_TURN + 2.5 + k * 1.6, 2.4 + R(k, 63) * 3, 3, k + 20]);
  for (let k = 0; k < 18; k++) OBJ_POST.push(['s09_tree', 1.9 * k + R(k, 64) * 0.8, (k % 2 ? 1 : -1) * (RW + 1.2 + R(k, 65) * 3), 2.8 + R(k, 66) * 0.8, k]);
  for (let k = 0; k < 24; k++) { OBJ_POST.push(['s09_rpost', 1.3 * k, RW + 0.32, 0.8, k]); OBJ_POST.push(['s09_rpost', 1.3 * k, -RW - 0.32, 0.8, k + 50]); }
  const OBJ_H = { s09_tree: 290, s09_rpost: 142, s09_sign: 627, s09_chev: 272 };
  const qv = (ax, ay, bx, by, cx, cy, dx, dy, c) => { fill(c); vertex(ax, ay); vertex(bx, by); vertex(cx, cy); vertex(ax, ay); vertex(cx, cy); vertex(dx, dy); };
  // pseudo-3D road: y = HOR + KZ/z, x = 960 + (wx - camX) * KZ / z
  function roadWorld(T, o) {
    const pos = o.pos, rx = o.rx, camX = rx(pos + ZCAR);
    const X = (wx, z) => 960 + (wx - camX) * KZ / z, Y = (z) => HOR + KZ / z;
    // backdrop (extended flat colours so the banked frame never shows empty corners)
    const dusk = o.dusk;
    gradRect(-2600, -1600, 7000, 1600 + HOR, dusk ? mixc(PAL.lilac, PAL.navy, 0.2) : lite(PAL.sky, 0.2), dusk ? PAL.pinkLt : PAL.skyLt);
    spr(dusk ? 's09_sky_dusk' : 's09_sky_day', 960, HOR - 330, { s: 2, jit: 0 });
    if (o.back) o.back();
    noStroke(); fill(dusk ? mixc(PAL.teal, PAL.lilac, 0.55) : lite(PAL.grass, 0.15)); rect(-2600, HOR - 4, 7000, 2600);
    if (dusk) tint(180, 175, 255);
    spr('s09_hills', 960, HOR + 26, { s: 2, jit: 0 });
    spr('s09_ground', 960, HOR + 290, { s: 2, jit: 0 });
    tint(255);
    if (dusk) { fill(withAlphaCol(PAL.lilac, 0.16)); rect(-2600, HOR - 4, 7000, 2600); gradRect(-2600, HOR - 4, 7000, 260, withAlphaCol(PAL.pink, 0.35), withAlphaCol(PAL.pink, 0)); }
    // bands: exact stripe edges up close, log-spaced far away
    const zs = [];
    for (let z = 70; z > 14; z *= 0.86) zs.push(z);
    const st = 0.65;
    for (let k = Math.floor((pos + 14) / st); k * st > pos + 0.3; k--) zs.push(k * st - pos);
    zs.push(0.3);
    noStroke(); beginShape(TRIANGLES);
    const grassDk = withAlphaCol(dusk ? PAL.lilac : PAL.grassDk, dusk ? 0.16 : 0.13);
    for (let i = 0; i < zs.length - 1; i++) {
      const za = zs[i], zb = zs[i + 1];
      const sa = pos + za, sb = pos + zb, par = Math.floor((sa + sb) / 2 / st) % 2 === 0;
      const ya = Y(za), yb = Y(zb), xa = X(rx(sa), za), xb = X(rx(sb), zb), ha = RW * KZ / za, hb = RW * KZ / zb;
      if (par) qv(-2600, ya, 4400, ya, 4400, yb, -2600, yb, grassDk);
      qv(xa - ha, ya, xa + ha, ya, xb + hb, yb, xb - hb, yb, color(par ? ROAD_A : ROAD_B));
      const kc = color(par ? PAL.red : '#FFFFFF'), e = 0.14;
      qv(xa - ha * (1 + e), ya, xa - ha, ya, xb - hb, yb, xb - hb * (1 + e), yb, kc);
      qv(xa + ha, ya, xa + ha * (1 + e), ya, xb + hb * (1 + e), yb, xb + hb, yb, kc);
      if (Math.floor((sa + sb) / 2 / (st * 2)) % 2 === 0) { const da = ha * 0.04, db = hb * 0.04; qv(xa - da, ya, xa + da, ya, xb + db, yb, xb - db, yb, color(PAL.butterLt)); }
    }
    endShape();
    // roadside objects, far to near
    const items = [];
    for (const it of o.objs) { const z = it[1] - pos; if (z > 0.45 && z < (o.zMax || 62)) items.push([z, it]); }
    items.sort((a, b) => b[0] - a[0]);
    if (dusk) tint(255, 205, 235);
    for (const [z, it] of items) {
      const [nm, sw, dx, h, sd] = it;
      const x = X(rx(sw) + dx, z), y = Y(z);
      const sc = (h * KZ) / z / OBJ_H[nm];
      if (nm === 's09_sign') {
        // the sign springs up on "Sharp" and its beacon blinks on the beats
        const pop = Ez.outBack(inv(81.02, 81.3, T), 2.2), lp = T > 81.86 ? 1 + 0.18 * Math.exp(-(T - 81.86) * 7) * Math.cos((T - 81.86) * 30) : 1;
        spr(nm, x, y, { s: sc * lp, sy: pop, jit: 0.5 });
        const bx = x, by = y - 610 * sc * pop;
        disc(bx, by, 22 * sc, PAL.orange, pop); if (beatAt(T).ph < 0.5) glow(bx, by, 150 * sc, PAL.orange, 0.5 * pop);
      } else spr(nm, x, y, { s: sc, seed: sd, r: nm === 's09_tree' ? Math.sin(T * 2 + sd) * 0.03 : 0 });
    }
    tint(255);
    return { vx: X(rx(pos + 60), 60) };
  }
  // Clawd driving, seen from behind (no eyes), in a little mint roadster
  function carRig(x, y, sc, T, o = {}) {
    push(); translate(x, y); rotate(o.r || 0); scale(sc * (o.sq || 1), sc / (o.sq || 1));
    noStroke(); fill(withAlphaCol(PAL.ink, 0.25)); ellipse(0, 8, 470, 50);
    const bob = o.bob || 0;
    push(); translate(0, -bob);
    clawd(0, -96 - (o.lift || 0), 0.6, { eyes: o.eyes || 's09_none', look: o.look, eyeS: 1.35, armL: o.armL ?? -0.5, armR: o.armR ?? -0.5, acc: ['headband'], seed: 4, r: o.lean || 0, sq: o.csq || 1 });
    // headband tails flapping in the wind
    const segs = [];
    for (let t = 0; t < 2; t++) { let px = 92, py = -271 - (o.lift || 0) + t * 12; for (let k = 1; k <= 5; k++) { const nx = 92 + k * 16, ny = -271 - (o.lift || 0) + t * 12 + Math.sin(T * 26 + k * 0.9 + t) * (3 + k * 2.2) + k * 3; segs.push([px, py, nx, ny]); px = nx; py = ny; } }
    segLines(segs, PAL.red, 7);
    spr('s09_car', 0, 0, { seed: 3 });
    const br = o.brake || 0;
    if (br > 0) for (const sx of [-149, 149]) { disc(sx, -115, 30, '#FF2A3C', 0.6 * br); glow(sx, -115, 90, PAL.red, 0.45 * br); }
    pop();
    pop();
  }
  function giantY(T) {
    let y = HOR + 500;
    y -= 300 * Ez.outBack(inv(82.76, 83.02, T), 1.5);
    y -= 20 * inv(83.02, 83.3, T);
    y -= 80 * Ez.outBack(inv(83.3, 83.5, T), 1.6);
    y -= 50 * Ez.outBack(inv(83.58, 83.84, T), 2.4);
    return y - (T > 83.9 ? hopB(T) * 12 : 0);
  }
  shot({
    id: 'L24-turn', t0: 81.1, tin: { type: 'whip', d: 0.45, at: 0.5, ang: 0 },
    draw(s) {
      const T = s.T;
      const post = T >= SWAP;
      const dr = Math.sin(Math.PI * inv(TURN - 0.04, 82.84, T));
      let bank, yaw;
      if (!post) { bank = (Math.PI / 2) * Ez.inOut(inv(TURN - 0.04, 82.36, T)); yaw = 760 * Ez.in(inv(TURN - 0.04, SWAP, T)); }
      else { bank = (Math.PI / 2) * (1 - Ez.outBack(inv(SWAP + 0.01, 82.86, T), 1.3)); yaw = -760 * (1 - Ez.out(inv(SWAP, 82.86, T))); }
      if (T < TURN) bank += -0.06 * Math.cos((posPre(T) + ZCAR + 3) * 0.21) * (1 - sstep(81.5, 81.9, T));
      const bz = 1 + 0.3 * dr;
      const gy = giantY(T);
      const pin = Ez.in(inv(84.0, 84.98, T)), pc = Ez.inOut(inv(83.98, 84.4, T));
      const eyeX = 960 - 2.5 * CU * GS, eyeY = gy - 6.5 * CU * GS;
      const CX = 960 + 150 * dr, CY = 1010;
      push();
      cam(lerp(960, eyeX, pc), lerp(540, eyeY, pc), 1 + 5 * pin);
      push();
      translate(960, 880); rotate(bank); scale(bz); translate(-960, -880);
      push(); translate(yaw, 0);
      if (!post) {
        const w = roadWorld(T, { pos: posPre(T), rx: rxPre, objs: OBJ_PRE, dusk: false });
        // speed streaks rushing out of the vanishing point
        const segs = [], vx = w.vx, vy = HOR;
        for (let i = 0; i < 22; i++) { const a = Math.PI * (0.05 + 0.9 * R(i, 70)) + (i % 2 ? Math.PI : 0); const ph = fract(R(i, 71) + T * (1.6 + R(i, 72))); const r0 = 160 + ph * 1300; segs.push([vx + Math.cos(a) * r0, vy + Math.sin(a) * r0 * 0.55, vx + Math.cos(a) * (r0 + 90 + ph * 260), vy + Math.sin(a) * (r0 + 90 + ph * 260) * 0.55]); }
        segLines(segs, '#FFFFFF', 4, 0.5);
      } else {
        roadWorld(T, { pos: posPost(T), rx: rxPost, objs: OBJ_POST, dusk: true, zMax: 16, back: () => {
          const rise = inv(HOR + 500, HOR + 50, gy);
          const bcx = 960, bcy = gy - 5 * CU * GS;
          // sunrise rays + sun disc behind the giant
          push(); translate(bcx, bcy); rotate(T * 0.25);
          noStroke();
          for (let k = 0; k < 16; k++) { const a0 = (k / 16) * TAU, a1 = a0 + TAU / 32; fill(withAlphaCol(k % 2 ? PAL.butterLt : PAL.pinkLt, (0.35 + 0.15 * kick(T)) * rise)); triangle(0, 0, Math.cos(a0) * 1700, Math.sin(a0) * 1700, Math.cos(a1) * 1700, Math.sin(a1) * 1700); }
          pop();
          disc(bcx, bcy, 330 + 20 * kick(T), PAL.butter, 0.55 * rise);
          glow(bcx, bcy, 420, PAL.butter, 0.45 * rise);
          twinkles(T, 12, 91, [120, 40, 1680, 360], ['sparkW', 'spark'], 0.1, 0.25);
          // the giant Clawd, rising like the sun
          const up = inv(83.3, 83.84, T);
          const arm = lerp(0.35, -0.95, Ez.outBack(up, 2)) + (T > 83.9 ? Math.sin(T * 13.5) * 0.18 : 0);
          clawd(960, gy, GS, { eyes: 's09_none', armL: arm, armR: arm, blush: T > 83.6, seed: 9 });
          const wink = T > 83.64 && T < 84.0;
          const bl = !wink && fract(T * 0.4 + 0.5) < 0.04;
          const ey = gy - 6.5 * CU * GS + CU * GS * (T < 83.3 ? 0.35 : 0.1);
          spr(bl ? 'ce_blink' : 'ce_sq', 960 - 2.5 * CU * GS, ey, { s: (CU / EU) * GS, seed: 8 });
          spr(wink ? 'ce_happy' : bl ? 'ce_blink' : 'ce_sq', 960 + 2.5 * CU * GS, ey, { s: (CU / EU) * GS, seed: 9 });
          burst(T, 83.64, 960, gy - 200, { n: 18, names: ['spark', 'star5', 'heart'], spd: 1500, g: 100, drag: 2.2, life: 0.9, s: 0.5, even: true, seed: 140 });
        } });
      }
      pop();
      // tyre smoke from the drift (in the banked frame)
      const smoke = [];
      for (let i = 0; i < 28; i++) {
        const age = T - (TURN - 0.03 + i * 0.028);
        if (age < 0 || age > 0.95) continue;
        const sd = i % 2 ? 1 : -1;
        smoke.push([CX + sd * 150 + (sd * 200 + 320) * age + RS(i, 80) * 50 * age, CY - 30 - age * 160 * (0.5 + R(i, 81)), 0.35 + age * 2.1, (1 - age / 0.95) * 0.95, i]);
      }
      for (const p of smoke) spr('puff', p[0], p[1], { s: p[2], a: p[3], r: p[2] * RS(p[4], 82), seed: p[4] });
      // the car: weaving, braking, drifting, then stopping to stare at the giant
      const brake = sstep(81.66, 81.8, T) * (1 - sstep(82.05, 82.15, T)) + sstep(82.8, 82.9, T) * (1 - sstep(83.4, 83.6, T));
      const stop = T > 83.35;
      const look = sstep(82.84, 83.0, T);
      const wave = T > 83.64 ? Math.sin(T * 13.5) * 0.5 : 0;
      carRig(CX + (T < TURN ? Math.sin(T * 3.1) * 16 : 0), CY, 0.9, T, {
        r: -0.36 * dr + (T < TURN ? Math.sin(T * 3.1) * 0.02 : 0), sq: 1 + 0.08 * dr,
        bob: hopB(T) * (stop ? 7 : 4) + (stop ? 0 : Math.abs(vnoise(T * 14, 3)) * 5),
        armL: T > 83.64 ? -1.3 + wave : dr > 0.1 ? -1.2 + Math.sin(T * 30) * 0.4 : -0.5, armR: T > 83.64 ? -1.3 - wave : dr > 0.1 ? -1.2 + Math.cos(T * 30) * 0.4 : -0.5,
        brake, lean: -0.08 * look, lift: 12 * look,
        eyes: T > 81.12 && T < 81.66 ? 'ce_star' : null, look: [0, -0.2], csq: 1 + 0.12 * (Math.exp(-Math.abs(T - 81.12) * 30) + Math.exp(-Math.abs(T - 81.66) * 30)),
      });
      // exhaust puffs on the beats
      for (let k = 0; k < 3; k++) { const b = beatAt(T); const bt = b.t - k * b.len; const age = T - bt; if (age < 0 || age > 1.2) continue; spr('puff', CX + 110 + age * 90, CY - 40 - age * 70, { s: 0.14 + age * 0.35, a: 0.7 * (1 - age / 1.2), seed: k + b.i }); }
      // "!" when the giant appears
      const ex = T - 82.9;
      if (ex > 0) txt('!', CX, CY - 330, { size: 130, fill: PAL.butter, stroke: PAL.ink, sw: 9 }, { s: Ez.outBack(clamp(ex / 0.18), 3) * (1 + 0.08 * kick(T)), r: 0.12, a: 1 - inv(83.9, 84.1, T) });
      pop();
      pop();
      // the drift smoke swallows the frame while the world swaps
      const cover = sstep(82.24, 82.41, T) * (1 - sstep(82.48, 82.68, T));
      if (cover > 0) {
        for (let i = 0; i < 9; i++) spr('puff', 960 + (R(i, 90) - 0.5) * 1700 + (T - 82.2) * 300, 540 + (R(i, 91) - 0.5) * 900, { s: (3.2 + R(i, 92) * 2) * (0.6 + 0.4 * cover), a: cover, r: T * 0.8 * RS(i, 93), seed: i });
        noStroke(); fill(withAlphaCol('#FFFFFF', 0.3 * cover)); rect(0, 0, W, H);
      }
      speedLines(T, 10, 95, '#FFFFFF', 0.5 * dr, 380, 6, 3200, 1, [0, 120, W, 840]);
    },
  });
  lyr(24, { y: 140, size: 70, maxW: 1700, words: { 0: { fill: PAL.butter, anim: 'slide' }, 1: { fill: PAL.butter, anim: 'slide' }, 2: { fill: PAL.butter, anim: 'spin', size: 84 }, 4: { fill: PAL.pinkLt, anim: 'rise' }, 5: { fill: PAL.pinkLt, anim: 'rise' }, 6: { fill: PAL.pink, anim: 'zoom', grow: 0.15 } } });


  // ================= L25 sprites: DJ booth, empty rack, the lonely CD-R =================
  const CLUB = mixc(PAL.night, PAL.lilac, 0.14);
  const DUSKLINE = mixc(PAL.lilac, PAL.white, 0.2);
  defSprite('s09_club', 1000, 580, () => {
    flat([[-10, -10], [1010, -10], [1010, 590], [-10, 590]], CLUB);
    wash(-40, -40, 1080, 660, PAL.nightLt, 150, 0.1);
    blob(500, 250, 270, PAL.lilac, 80, 0.4);
    blob(240, 170, 150, PAL.pink, 50, 0.4); blob(770, 160, 160, PAL.sky, 45, 0.4);
    for (let i = 0; i < 8; i++) pd(rrPts(70 + i * 112, 70, 56, 250, 12), PAL.lilac, 1.1, mixc(CLUB, PAL.lilac, 0.16), mixc(CLUB, PAL.lilac, 0.45));
    flat([[-10, 440], [1010, 440], [1010, 590], [-10, 590]], mixc(CLUB, PAL.ink, 0.35));
    for (const x of [80, 920]) for (const [y, h] of [[210, 120], [334, 130]]) {
      pd(rrPts(x - 72, y, 144, h, 12), PAL.ink, 1.6, '#221B3A', DUSKLINE);
      flat(ellPts(x, y + h / 2 + 8, 44, 44, 28), '#140F26');
      pen(DUSKLINE, 1.4, 'pen'); brush.circle(x, y + h / 2 + 8, 44); brush.circle(x, y + h / 2 + 8, 22); brush.noStroke();
      flat(ellPts(x, y + 22, 12, 12, 16), '#140F26');
    }
  });
  defSprite('s09_night', 1000, 580, () => {
    flat([[-10, -10], [1010, -10], [1010, 590], [-10, 590]], PAL.night);
    wash(-40, -40, 1080, 660, PAL.navy, 150, 0.1);
    blob(500, 210, 230, PAL.nightLt, 150, 0.4);
    blob(500, 210, 150, PAL.lilac, 45, 0.4);
    for (let i = 0; i < 40; i++) { const r = 1 + random() * 2; flat(ellPts(random() * 1000, random() * 560, r, r, 8), '#FFFFFF', 0.5 + random() * 0.4); }
  });
  defSprite('s09_booth', 1000, 210, () => {
    paintBar(10, 26, 980, 176, 12, mixc(PAL.lilac, PAL.night, 0.5), { baseC: mixc(PAL.lilac, PAL.night, 0.55) });
    pd(rrPts(0, 6, 1000, 26, 8), PAL.grayLt, 1.6, mixc(PAL.grayLt, PAL.lilac, 0.35));
    const zz = []; for (let i = 0; i <= 40; i++) zz.push([20 + i * 24, 70 + (i % 2) * 22]);
    strokePath(zz, PAL.pink, 3, 'marker', 0);
    for (let i = 0; i < 6; i++) pd(starPts(90 + i * 165, 140, 16, 7, 5), PAL.butter, 1, PAL.butter);
  }, { ax: 0.5, ay: 0.03 });
  defSprite('s09_deck', 420, 200, () => {
    pd(rrPts(14, 30, 392, 152, 24), PAL.grayLt, 2, mixc(PAL.grayLt, PAL.lilac, 0.25));
    wc(PAL.lilac, 80, 0.05); brush.rect(24, 40, 372, 132); brush.noFill();
    flat(ellPts(180, 104, 144, 64, 40), '#1B1830');
    strokePath([[362, 52], [352, 120], [306, 148]], PAL.gray, 5, 'marker', 0.5);
    flat(ellPts(362, 52, 14, 10, 16), PAL.gray);
    for (let i = 0; i < 2; i++) flat(ellPts(46 + i * 28, 160, 9, 6, 12), [PAL.mint, PAL.pink][i]);
  });
  defSprite('s09_vinyl', 300, 300, () => {
    flat(ellPts(150, 150, 140, 140, 48), '#17131F');
    pen('#3E3558', 1.3, 'pen'); for (let r = 56; r < 136; r += 11) brush.circle(150, 150, r); brush.noStroke();
    flat(ellPts(150, 150, 46, 46, 32), PAL.pink);
    const half = [[150, 150]]; for (let k = 0; k <= 16; k++) { const a = (k / 16) * Math.PI; half.push([150 + Math.cos(a) * 46, 150 + Math.sin(a) * 46]); }
    flat(half, PAL.butter);
    flat(ellPts(150, 150, 6, 6, 12), PAL.ink);
  });
  defSprite('s09_mixer', 300, 170, () => {
    pd(rrPts(12, 20, 276, 136, 18), PAL.ink, 2, '#2E2745', DUSKLINE);
    for (let i = 0; i < 3; i++) { flat(rrPts(76 + i * 70, 70, 8, 70, 3), '#15112B'); flat(rrPts(66 + i * 70, 84 + (i % 2) * 24, 28, 16, 4), PAL.butter); }
    for (let i = 0; i < 4; i++) flat(ellPts(56 + i * 62, 46, 10, 10, 14), [PAL.pink, PAL.sky, PAL.mint, PAL.butter][i]);
  });
  defSprite('s09_phones', 440, 240, () => {
    const band = [];
    for (let k = 0; k <= 20; k++) { const a = Math.PI + (k / 20) * Math.PI; band.push([220 + Math.cos(a) * 186, 176 + Math.sin(a) * 150]); }
    for (let k = 20; k >= 0; k--) { const a = Math.PI + (k / 20) * Math.PI; band.push([220 + Math.cos(a) * 168, 176 + Math.sin(a) * 134]); }
    pd(band, PAL.butter, 1.6, PAL.butter);
    for (const x of [16, 364]) paint(rrPts(x, 136, 60, 96, 24), PAL.pink, { baseC: PAL.pinkLt, lw: 1.8 });
  }, { ay: 176 / 240 });
  defSprite('s09_rack', 220, 340, () => {
    pd(rrPts(24, 20, 172, 300, 10), PAL.ink, 1.6, '#2A2342', DUSKLINE);
    for (const x of [24, 184]) pd(rrPts(x, 14, 12, 316, 5), PAL.gray, 1.2, PAL.grayLt);
    for (let k = 0; k < 6; k++) { const y = 64 + k * 46; flat(rrPts(34, y, 152, 6, 2), PAL.gray); for (let j = 0; j < 7; j++) flat(rrPts(44 + j * 20, y - 20, 3, 20, 1), mixc(PAL.gray, PAL.night, 0.4)); }
    pd(rrPts(70, 0, 80, 26, 8), PAL.butter, 1.2, PAL.butter);
  }, { ay: 0.97 });
  defSprite('s09_cd', 500, 500, () => {
    const c = 250, r = 228;
    const silver = mixc(PAL.grayLt, PAL.lilacLt, 0.5);
    flat(ellPts(c, c, r, r, 72), silver);
    const cols = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lilac, PAL.pink];
    // opaque pastel wedges out to the rim (clean edge on dark grounds), watercolor texture kept well inside
    for (let i = 0; i < 6; i++) {
      const a0 = (i / 6) * TAU, a1 = a0 + TAU / 6, pts = [[c, c]], inner = [[c, c]];
      for (let k = 0; k <= 12; k++) { const a = lerp(a0, a1, k / 12); pts.push([c + Math.cos(a) * (r - 3), c + Math.sin(a) * (r - 3)]); inner.push([c + Math.cos(a) * (r - 70), c + Math.sin(a) * (r - 70)]); }
      flat(pts, mixc(silver, cols[i], 0.35));
      wc(cols[i], 90, 0.02, 0.5, 0.5); brush.polygon(inner);
    }
    brush.noFill();
    flat(ellPts(c, c, 80, 80, 40), mixc(PAL.skyLt, PAL.white, 0.5));
    pen(PAL.gray, 1.4, 'pen'); brush.circle(c, c, 80); brush.circle(c, c, 52); brush.noStroke();
    pen(PAL.ink, 2.6, '2B'); brush.circle(c, c, r); brush.noStroke();
    const t = textImg('mix', { font: 'hand', size: 64, fill: PAL.ink, weight: 700 });
    image(t.img, c - t.w / 2 + 10, c + 128 - t.h / 2);
    pd(heartPts(c + 84, c + 124, 30), PAL.red, 1.2, PAL.red);
  });
  defSprite('s09_fan', 200, 280, (v) => {
    const c = mixc(PAL.night, PAL.lilac, 0.28);
    pd([[16, 282], [26, 206], [66, 176], [134, 176], [174, 206], [184, 282]], c, 1.6, c, DUSKLINE);
    pd(ellPts(100, 132, 46, 50, 28), c, 1.6, c, DUSKLINE);
    const arm = (sd) => pd([[100 + sd * 46, 200], [100 + sd * 70, 110], [100 + sd * 86, 30], [100 + sd * 104, 36], [100 + sd * 92, 120], [100 + sd * 72, 210]], c, 1.6, c, DUSKLINE);
    arm(-1); if (v === 1) arm(1);
  }, { v: 2, ay: 1 });
  defSprite('s09_ball', 200, 200, () => {
    flat(ellPts(100, 100, 80, 80, 40), PAL.grayLt);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const x = 36 + i * 17, y = 36 + j * 17;
      if (Math.hypot(x + 7 - 100, y + 7 - 100) < 72) flat(rrPts(x, y, 14, 14, 2), [PAL.white, PAL.lilacLt, PAL.skyLt, PAL.gray][(i * 3 + j * 5) % 4]);
    }
    pen(PAL.ink, 1.8, '2B'); brush.circle(100, 100, 80); brush.noStroke();
  });

  // ================= L25: Without a single CDR =================
  const DECK_Y = 700, DECKL = 640, DECKR = 1280, RACK_X = 1570, CD_R0 = 62, CD_STOP = 1770;
  const CDR_T = 86.32;
  // spin angle as the integral of a speed profile: 0 -> 12 rad/s spin-up on "CDR", easing to a calm 3 rad/s hold
  function cdSpin(T) {
    const k = T - CDR_T;
    if (k <= 0) return 0;
    const a1 = k < 0.3 ? (12 * k * k) / 0.6 : 1.8 + 12 * (Math.min(k, 1.1) - 0.3);
    if (k <= 1.1) return a1;
    const u = Math.min(k - 1.1, 0.9); // 87.42 .. 88.32 slows 12 -> 3
    return a1 + 12 * u - 5 * u * u + Math.max(0, k - 2.0) * 3;
  }
  // CD position in club-world coords while it rolls in and settles on the booth (before "CDR")
  function cdWorld(T) {
    if (T < 85.9) { const x = lerp(2040, CD_STOP, Ez.out(inv(85.2, 85.9, T))); return { x, y: DECK_Y - 10 - CD_R0, rot: -(x - 2040) / CD_R0 }; }
    const w = T - 85.9, rock = T < CDR_T ? Math.sin(w * 18) * Math.exp(-w * 6) : 0;
    return { x: CD_STOP + rock * 12, y: DECK_Y - 10 - CD_R0, rot: -(CD_STOP - 2040) / CD_R0 + rock * 0.25 };
  }
  // L25 camera: pull back from the record, lean toward the rack and the lonely disc, then tilt up after "CDR"
  function clubCam(T) {
    const pb = Ez.inOut(inv(84.62, 85.2, T));
    const focus = sstep(85.42, 85.95, T) * (1 - sstep(86.3, 86.75, T));
    const tilt = Ez.inOut(inv(86.5, 87.9, T));
    const Z = lerp(3.4, 1, pb) * (1 + 0.2 * focus) * (1 + 0.012 * kick(T) * (1 - sstep(87.1, 88.2, T)));
    const cx = lerp(lerp(DECKR - 30, 960, pb), 1390, focus), cy = lerp(lerp(DECK_Y + 4, 540, pb), 585, focus);
    return { Z, cx, cy, ty: 330 * tilt, w2s: (x, y) => [(x - cx) * Z + 960, (y - cy) * Z + 540 + 330 * tilt] };
  }
  // screen-space CD state: follows the booth through the camera, then floats to the (960, 420) lead-out spot
  function cdState(T, C) {
    const wd = cdWorld(T);
    if (T < CDR_T) { const [x, y] = C.w2s(wd.x, wd.y); return { x, y, r: CD_R0 * C.Z, rot: wd.rot }; }
    const hop = Ez.outBack(clamp((T - CDR_T) / 0.22), 2.2);
    const fu = inv(86.42, 87.8, T), fl = Ez.inOut(fu), fy = Ez.out(clamp(fu * 1.25)); // rise first, then drift to centre
    const [sx, sy] = C.w2s(wd.x, wd.y - 110 * hop);
    return { x: lerp(sx, 960, fl), y: lerp(sy, 420, fy) + (T > 87.8 ? Math.sin((T - 87.8) * 2.4) * 5 : 0), r: lerp(CD_R0 * (1 + 0.3 * hop) * C.Z, 220, fl), rot: wd.rot + cdSpin(T) };
  }
  function drawCD(T, st, dim) {
    const { x, y, r, rot } = st;
    const k = r / 228;
    const sheen = sstep(CDR_T - 0.05, CDR_T + 0.2, T);
    if (sheen > 0) glow(x, y, r * 1.6, PAL.lilacLt, 0.24 * sheen + 0.12 * kick(T) * (1 - dim));
    spr('s09_cd', x, y, { s: k, r: rot, jit: 0.3 });
    // iridescent reflections: a slowly turning rainbow fan plus a fixed white glint
    push(); translate(x, y); blendMode(ADD); noStroke();
    const rr = r * 0.94, cols = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lilac];
    const base = T * 0.8;
    beginShape(TRIANGLES);
    for (let i = 0; i < 10; i++) {
      const a0 = base + (i / 10) * TAU, a1 = a0 + TAU / 10;
      fill(withAlphaCol(cols[i % 5], (0.1 + 0.28 * sheen) * (0.6 + 0.4 * Math.sin(T * 3 + i))));
      vertex(Math.cos(a0) * rr * 0.36, Math.sin(a0) * rr * 0.36); vertex(Math.cos(a0) * rr, Math.sin(a0) * rr); vertex(Math.cos(a1) * rr, Math.sin(a1) * rr);
      vertex(Math.cos(a0) * rr * 0.36, Math.sin(a0) * rr * 0.36); vertex(Math.cos(a1) * rr, Math.sin(a1) * rr); vertex(Math.cos(a1) * rr * 0.36, Math.sin(a1) * rr * 0.36);
    }
    endShape();
    for (const g of [-0.7, Math.PI - 0.7]) { fill(withAlphaCol('#FFFFFF', 0.22 + 0.2 * sheen)); triangle(0, 0, Math.cos(g - 0.12) * rr, Math.sin(g - 0.12) * rr, Math.cos(g + 0.12) * rr, Math.sin(g + 0.12) * rr); }
    blendMode(BLEND);
    pop();
    disc(x, y, r * 0.085, mixc(CLUB, PAL.night, dim));
  }
  const FANS = [[480, 1.0, 0], [640, 1.1, 1], [860, 0.95, 0], [1080, 1.12, 1], [1300, 1.0, 0], [1520, 1.08, 1], [1740, 0.98, 0]];
  const BEAM_COLS = [PAL.pink, PAL.sky, PAL.butter, PAL.mint];
  shot({
    id: 'L25-cdr', t0: 84.68, tin: { type: 'zoom', d: 0.6, at: 0.5, c: [960, 540] },
    draw(s) {
      const T = s.T;
      const dim = sstep(87.1, 88.2, T);
      const club = 1 - dim;
      const b = beatAt(T), kk = kick(T) * club;
      // camera: opens tight on the right deck's spinning record (matching the eye we zoomed into), pulls back,
      // leans in on the empty rack and the lonely disc, then tilts up after "CDR" leaving Clawd gazing up from below
      const C = clubCam(T);
      push();
      translate(0, C.ty);
      cam(C.cx, C.cy, C.Z);
      noStroke(); fill(mixc(CLUB, PAL.nightLt, 0.3)); rect(-700, -700, W + 1400, H + 1400);
      washBG('s09_club');
      // sweeping ceiling beams (additive on the dark club), rainbow after "CDR"
      const rainbow = sstep(CDR_T, CDR_T + 0.15, T);
      blendMode(ADD); noStroke();
      for (let i = 0; i < 4; i++) {
        const ox = 220 + i * 500, ang = Math.PI / 2 + 0.55 * Math.sin(T * (1.3 + i * 0.2) + i * 1.7) + (i % 2 ? 0.2 : -0.2);
        const c = BEAM_COLS[(i + b.i + (rainbow > 0 ? Math.floor(T * 6) : 0)) % 4];
        fill(withAlphaCol(c, (0.1 + 0.12 * kk + (Math.abs(T - 84.68) < 0.25 ? 0.15 : 0)) * club));
        triangle(ox, -40, ox + Math.cos(ang - 0.08) * 1500, -40 + Math.sin(ang - 0.08) * 1500, ox + Math.cos(ang + 0.08) * 1500, -40 + Math.sin(ang + 0.08) * 1500);
      }
      blendMode(BLEND);
      // mirror ball + drifting light spots
      const bx = 1690, by = 150;
      segLine(bx, -20, bx, by - 70, DUSKLINE, 3, club);
      spr('s09_ball', bx, by, { s: 0.85, r: T * 0.5, a: club });
      for (let i = 0; i < 28; i++) {
        const a = T * 0.35 + (i / 28) * TAU, rad = 300 + R(i, 150) * 900;
        const px = bx + Math.cos(a) * rad * 1.3, py = by + 200 + Math.sin(a * 1.3 + i) * rad * 0.35;
        disc(px, py, 5 + R(i, 151) * 5, [PAL.white, PAL.pinkLt, PAL.skyLt, PAL.butterLt][i % 4], (0.35 + 0.3 * kk) * club);
      }
      // DJ Clawd behind the booth
      const cx = 960, cy = 770;
      const scratch = Math.sin(b.ph * TAU) * 0.28;
      const o = { eyes: 'ce_happy', armL: 0.55 + scratch, armR: 0.55 - scratch, hop: hopB(T) * 16 * club, blush: true, look: [0, 0.2], r: Math.sin(T * 4.3) * 0.03, seed: 2 };
      if (T > 85.24 && T < 85.6) { o.eyes = 'ce_dot'; o.look = [0.9, -0.1]; o.armR = -0.35; o.armL = 0.9; o.hop = 0; }
      if (T >= 85.6 && T < CDR_T) { o.eyes = 'ce_sq'; o.look = [0.9, 0.25]; o.eyeS = 1.25; o.armR = 0.6; o.armL = 0.7; }
      if (T >= CDR_T) {
        const cd = cdState(T, C);
        o.eyes = T < CDR_T + 0.9 ? 'ce_star' : 'ce_heart'; o.eyeS = 1.45;
        o.look = [clamp((cd.x - cx) / 700, -1, 1), -0.8];
        const up = Ez.outBack(clamp((T - CDR_T) / 0.2), 2);
        o.armL = lerp(0.6, -1.1, up) + Math.sin(T * 6) * 0.15; o.armR = lerp(0.6, -1.1, up) - Math.sin(T * 6) * 0.15;
        o.hop = Math.exp(-(T - CDR_T) * 5) * 60 * up + hopB(T) * 8 * club;
      }
      clawd(cx, cy, 1, o);
      spr('s09_phones', cx, cy - (o.hop || 0) - 300, { r: o.r, jit: 0.4 });
      const qa = T - 85.26;
      if (qa > 0 && qa < 0.45) txt('?', cx + 150, cy - 400, { size: 110, fill: PAL.butter, stroke: PAL.ink, sw: 8 }, { s: Ez.outBack(clamp(qa / 0.15), 3), r: 0.15, a: 1 - inv(0.3, 0.45, qa) });
      // booth, decks with spinning records, mixer
      spr('s09_booth', 1260, DECK_Y - 30, { s: 2, jit: 0.3 });
      for (const [dx, sd] of [[DECKL, 0], [DECKR, 1]]) {
        spr('s09_deck', dx, DECK_Y - 10, { seed: sd, jit: 0.4 });
        push(); translate(dx - 30, DECK_Y - 6); scale(1, 0.43); rotate(T * 3.4 + sd + (sd ? scratch : -scratch) * 0.8); spr('s09_vinyl', 0, 0, { s: 0.92, jit: 0 }); pop();
      }
      spr('s09_mixer', cx, DECK_Y + 6, { jit: 0.3 });
      // the empty CD rack: rattles on "a", puffs dust and lets a moth out
      const rat = T > 85.24 ? Math.exp(-(T - 85.24) * 6) * Math.sin((T - 85.24) * 40) : 0;
      spr('s09_rack', RACK_X, DECK_Y - 16, { r: rat * 0.06, jit: 0.4 });
      spr('paperclip', RACK_X + 42, DECK_Y - 176, { s: 0.16, r: 1.4 });
      spr('s09_cobweb', RACK_X - 76, DECK_Y - 318, { s: 0.3, jit: 0.2 });
      burst(T, 85.26, RACK_X, DECK_Y - 200, { n: 6, names: ['puff'], spd: 300, g: -60, drag: 3, life: 1.0, s: 0.3, spread: 1.6, ang0: -Math.PI / 2, seed: 160 });
      const mt = T - 85.28;
      if (mt > 0 && mt < 1.6) {
        const mx = RACK_X - mt * 260 + Math.sin(mt * 9) * 30, my = DECK_Y - 240 - mt * 190 + Math.sin(mt * 13) * 18, fl = Math.abs(Math.sin(mt * 38));
        noStroke(); fill(withAlphaCol(PAL.grayLt, club)); triangle(mx, my, mx - 26, my - 22 * fl, mx - 8, my + 6); triangle(mx, my, mx + 26, my - 22 * fl, mx + 8, my + 6);
        disc(mx, my, 5, PAL.gray, club);
      }
      // bopping crowd silhouettes
      for (let i = 0; i < FANS.length; i++) {
        const [fx, fs, fv] = FANS[i];
        spr('s09_fan', fx, 1100 - hopB(T + i * 0.07) * 26 * club, { s: fs, v: fv, r: Math.sin(T * 5 + i) * 0.07, a: 1 - dim * 0.9, seed: i });
      }
      pop();
      // the club dissolves into a calm night as the music drops away
      if (dim > 0) { spr('s09_night', 960, 540, { s: 2, a: dim, jit: 0 }); twinkles(T, 14, 170, [80, 60, 1760, 900], ['sparkW'], 0.08, 0.2, 1.4); }
      // the lonely CD-R
      const cd = cdState(T, C);
      if (T > 85.2) {
        const [shx, shy] = C.w2s(cdWorld(T).x, DECK_Y - 8);
        noStroke(); fill(withAlphaCol(PAL.ink, 0.35 * (1 - inv(CDR_T, CDR_T + 0.5, T)))); ellipse(shx, shy, CD_R0 * C.Z * 1.6, 14 * C.Z);
        // a lonely spotlight follows the disc in
        const sp = sstep(85.3, 85.5, T) * (1 - sstep(CDR_T, CDR_T + 0.3, T));
        if (sp > 0) { blendMode(ADD); fill(withAlphaCol(PAL.butterLt, 0.2 * sp)); triangle(shx - 30, -40, shx + 30, -40, shx + 130 * C.Z, shy); triangle(shx - 30, -40, shx - 130 * C.Z, shy, shx + 130 * C.Z, shy); blendMode(BLEND); }
        // rainbow rays thrown across the room on "CDR"
        const ray = sstep(CDR_T - 0.04, CDR_T + 0.12, T) * (1 - 0.75 * dim);
        if (ray > 0) {
          push(); translate(cd.x, cd.y); rotate(T * 0.9); blendMode(ADD); noStroke();
          for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; fill(withAlphaCol([PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lilac][i % 5], 0.16 * ray)); triangle(0, 0, Math.cos(a - 0.05) * 2200, Math.sin(a - 0.05) * 2200, Math.cos(a + 0.05) * 2200, Math.sin(a + 0.05) * 2200); }
          blendMode(BLEND); pop();
        }
        drawCD(T, cd, dim);
        burst(T, CDR_T, cd.x, cd.y, { n: 16, names: ['spark', 'sparkW', 'star5'], spd: 1000, g: 0, drag: 2.6, life: 1.0, s: 0.45, even: true, seed: 180 });
        // gentle motes drifting around the hold
        if (dim > 0) for (let i = 0; i < 16; i++) { const a = T * 0.3 + (i / 16) * TAU, rad = 280 + 40 * Math.sin(T + i); disc(960 + Math.cos(a) * rad, 420 + Math.sin(a) * rad * 0.8, 3 + (i % 3), [PAL.pinkLt, PAL.skyLt, PAL.butterLt, PAL.mintLt][i % 4], 0.6 * dim); }
      }
    },
  });
  // "CDR" shimmers through the rainbow, letter by letter
  function rainbowWord(T, age, wd, a) {
    if (age < -0.06) return;
    const k = Ez.outBack(clamp((age + 0.06) / 0.3), 2.4);
    const cols = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lilac];
    const L = ['C', 'D', 'R'], ims = L.map((ch, i) => textImg(ch, { font: 'display', size: 88, fill: cols[(i + Math.floor(T * 6)) % 5], stroke: PAL.ink, sw: 9, weight: 700 }));
    const tot = ims.reduce((acc, im) => acc + im.tw, 0) + 8;
    let x = -tot / 2;
    push(); scale(k); tint(255, 255 * a);
    for (let i = 0; i < 3; i++) { const im = ims[i]; image(im.img, x + im.tw / 2 - im.w / 2, -im.h / 2 + Math.sin(T * 8 + i) * 8); x += im.tw + 4; }
    tint(255); pop();
  }
  lyr(25, { y: 135, size: 74, words: { 0: { fill: PAL.lilacLt }, 2: { fill: PAL.butter, anim: 'drop' }, 3: { anim: 'type', size: 88, draw: rainbowWord } } });
})();

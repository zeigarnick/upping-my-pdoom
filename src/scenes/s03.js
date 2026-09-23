// s03.js - S03 "Gauge, FOOM, Chinese room, shrooms" (22.04-29.60), lyric lines L5-L8.
// Brief: docs/STORYBOARD.md. Rules: docs/ANIMATION_GUIDE.md. Everything here is private to this IIFE.
(() => {
  // ================= scene-wide helpers =================
  // the chorus kick that ends the held-breath dip (storyboard "24.0"; the detected beat and the audio peak sit at ~23.89)
  const KICK = BEATS.find((b) => b > 23.8 && b < 24.1) || 23.893;
  const PSY = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lilac, PAL.orange];
  const cyc = (t, pal = PSY) => { const n = pal.length, i = Math.floor(t), f = t - i; return mixc(pal[((i % n) + n) % n], pal[(((i + 1) % n) + n) % n], f * f * (3 - 2 * f)); };
  // camera that pins world point (px,py) to screen point (sx,sy)
  function camAt(px, py, sx, sy, z = 1, r = 0) { translate(sx, sy); if (r) rotate(r); scale(z); translate(-px, -py); }
  function tintC(c, a = 1) { const [r, g, b] = hexToRgb(c); tint(r, g, b, 255 * clamp(a)); }
  // sprite drawn with a colour tint (multiplies; paint white sprites to recolour them freely)
  function sprC(name, x, y, c, o = {}) { const a = o.a ?? 1; if (a <= 0.004) return; push(); tintC(c, a); spr(name, x, y, { ...o, a: undefined }); pop(); }
  // world position of one of Pip's hands for a given rig pose (mirrors pip() in art.js)
  function pipHand(side, x, y, s, o) {
    const a = side > 0 ? (o.armR ?? 0.15) : (o.armL ?? 0.15);
    let hx = side * (56 + 82.4 * Math.sin(a)), hy = -138 + 82.4 * Math.cos(a);
    const sq = o.sq ?? 1;
    hx *= s * sq * (o.flip ? -1 : 1); hy *= s / sq;
    const r = o.r || 0, c = Math.cos(r), sn = Math.sin(r);
    return [x + hx * c - hy * sn, y - (o.hop || 0) + hx * sn + hy * c];
  }
  // clean-edged house paint for set pieces that sit edge to edge (room walls, floor, furniture, consoles, the city):
  // the fill's white paper rim would zigzag across the neighbouring surfaces, so this uses flat base + brush wash +
  // soft pigment blotches kept strictly inside the shape + scratchy pencil line. Loose props keep the sticker paint().
  const inPoly = (x, y, pts) => { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins; } return ins; };
  function mottle(pts, c, n, a) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, cx = 0, cy = 0;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); cx += x; cy += y; }
    const inner = scalePts(pts, cx / pts.length, cy / pts.length, 0.86), rmax = Math.min(x1 - x0, y1 - y0) * 0.16;
    noStroke();
    for (let i = 0; i < n; i++) {
      const x = x0 + random() * (x1 - x0), y = y0 + random() * (y1 - y0); if (!inPoly(x, y, inner)) continue;
      fill(withAlphaCol(i % 3 ? dark(c, 0.12) : lite(c, 0.35), a * (0.4 + random() * 0.6)));
      const r = 3 + random() * rmax; ellipse(x, y, r * (1 + random()), r);
    }
  }
  function pnt(pts, c, o = {}) {
    flat(pts, o.baseC || lite(c, o.baseLite ?? 0.18));
    brush.noStroke(); brush.noHatch(); brush.noFill();
    brush.wash(c, o.a ?? 120); brush.polygon(pts); brush.noWash();
    if (o.tex !== false) mottle(pts, c, o.tn ?? 60, o.ta ?? 0.1);
    if (o.line !== false) { pen(o.lc || PAL.ink, o.lw ?? 2, o.lt || '2B'); brush.polygon(pts); brush.noStroke(); }
  }

  // ---------- Chinese characters, painted as brush strokes (no CJK font needed) ----------
  // unit-box stroke lists: 0 中, 1 文, 2 人, 3 口, 4 大, 5 山, 6 日, 7 月, 8 木
  const GLY = [
    [[[0.22, 0.3], [0.22, 0.72]], [[0.22, 0.3], [0.78, 0.3], [0.78, 0.72]], [[0.22, 0.7], [0.78, 0.7]], [[0.5, 0.05], [0.5, 0.96]]],
    [[[0.42, 0.0], [0.6, 0.2]], [[0.1, 0.3], [0.9, 0.3]], [[0.74, 0.33], [0.56, 0.64], [0.12, 0.94]], [[0.28, 0.36], [0.54, 0.68], [0.92, 0.93]]],
    [[[0.52, 0.06], [0.46, 0.52], [0.1, 0.92]], [[0.5, 0.44], [0.7, 0.74], [0.92, 0.92]]],
    [[[0.2, 0.22], [0.2, 0.84]], [[0.2, 0.22], [0.8, 0.22], [0.8, 0.84]], [[0.2, 0.82], [0.8, 0.82]]],
    [[[0.08, 0.36], [0.92, 0.36]], [[0.5, 0.06], [0.47, 0.5], [0.08, 0.94]], [[0.5, 0.46], [0.72, 0.74], [0.94, 0.94]]],
    [[[0.5, 0.08], [0.5, 0.86]], [[0.14, 0.36], [0.14, 0.86], [0.86, 0.86]], [[0.86, 0.36], [0.86, 0.86]]],
    [[[0.26, 0.08], [0.26, 0.92]], [[0.26, 0.08], [0.74, 0.08], [0.74, 0.92]], [[0.26, 0.5], [0.74, 0.5]], [[0.26, 0.9], [0.74, 0.9]]],
    [[[0.3, 0.08], [0.3, 0.64], [0.12, 0.94]], [[0.3, 0.08], [0.76, 0.08], [0.76, 0.9], [0.64, 0.86]], [[0.3, 0.36], [0.76, 0.36]], [[0.3, 0.62], [0.76, 0.62]]],
    [[[0.08, 0.32], [0.92, 0.32]], [[0.5, 0.04], [0.5, 0.96]], [[0.48, 0.36], [0.26, 0.66], [0.08, 0.82]], [[0.52, 0.36], [0.74, 0.66], [0.92, 0.82]]],
  ];
  function paintGlyph(k, cx, cy, size, col, w, type = 'marker') {
    pen(col, w, type);
    for (const st of GLY[k]) {
      const p = st.map(([u, v]) => [cx + (u - 0.5) * size, cy + (v - 0.5) * size]);
      if (p.length === 2) brush.line(p[0][0], p[0][1], p[1][0], p[1][1]); else brush.spline(p, 0.2);
    }
    brush.noStroke();
  }
  // atlas painted in white so it can be tinted to any colour
  defSprite('s03_glyphs', 900, 100, () => { for (let k = 0; k < 9; k++) paintGlyph(k, 50 + k * 100, 50, 70, '#FFFFFF', 3.4); });
  function glyph(k, x, y, s, c, a = 1, r = 0) {
    const S = SPR.s03_glyphs; if (!S || a <= 0.004) return;
    push(); translate(x, y); if (r) rotate(r); scale(s); tintC(c, a);
    image(S.fbs[0], -50, -50, 100, 100, k * 100, 0, 100, 100);
    pop();
  }

  // ================= L5: I'm upping my P(doom) =================
  const HUB = [880, 745], GS = 0.9;   // gauge needle hub (world) and dial scale
  const PIP5 = [1655, 930, 1.2];       // Pip's ground point and scale
  defSprite('s03_stage', 1000, 580, () => {
    flat(rrPts(-20, -20, 1040, 620, 2), '#221B46');
    wash(-40, -40, 1080, 520, '#2E2562', 150, 0.12);
    blob(460, 250, 290, '#4A3A8E', 110, 0.4);
    blob(140, 120, 170, '#382B74', 100, 0.3);
    blob(870, 110, 190, '#3E2D6E', 100, 0.3);
    brush.noFill(); for (let i = 0; i < 10; i++) { brush.wash('#17123A', 70); brush.rect(20 + i * 104, -20, 30, 480); } brush.noWash();
    flat([[-20, 448], [1020, 448], [1020, 600], [-20, 600]], '#17122E');
    wash(-20, 450, 1040, 150, '#29204F', 150, 0.08);
    blob(470, 480, 250, '#3D3070', 100, 0.35);
    pen(PAL.lilac, 1.6, 'pen'); brush.line(0, 450, 1000, 450); brush.noStroke();
  });
  const LAMPS = [200, 620, 1300, 1720];
  defSprite('s03_truss', 1000, 140, () => {
    pen('#8C84AE', 3, 'marker'); brush.line(0, 18, 1000, 18); brush.line(0, 44, 1000, 44);
    pen('#8C84AE', 1.6, 'pen'); for (let x = 0; x < 1000; x += 26) { brush.line(x, 18, x + 13, 44); brush.line(x + 13, 44, x + 26, 18); }
    brush.noStroke();
    for (const wx of LAMPS) {
      const x = 500 + (wx - 960) / 2;
      pen(PAL.ink, 2, 'pen'); brush.line(x, 44, x, 62); brush.noStroke();
      pnt([[x - 26, 60], [x + 26, 60], [x + 34, 108], [x - 34, 108]], '#4B4470', { baseC: '#5E567F', lw: 1.6, tex: false });
      flat(ellPts(x, 108, 30, 8, 16), PAL.butterLt, 0.95);
    }
  }, { ax: 0.5, ay: 0 });
  defSprite('s03_console', 1000, 200, () => {
    pnt(rrPtsPoly([[70, 16], [930, 16], [975, 172], [25, 172]], 18), '#6A5BA6', { baseC: '#7F70BA', lw: 2.4 });
    const band = [[36, 134], [964, 134], [970, 160], [30, 160]];
    flat(band, PAL.butter);
    for (let x = 30; x < 960; x += 40) flat([[x, 160], [x + 18, 134], [x + 34, 134], [x + 16, 160]], PAL.ink, 0.85);
    pen(PAL.ink, 1.8, '2B'); brush.polygon(band); brush.noStroke();
    pnt(rrPts(150, 38, 700, 74, 20), '#4F4488', { baseC: '#5D5299', lw: 1.8, tex: false });
    for (const x of [640, 770]) pnt(ellPts(x, 75, 30, 30, 28), PAL.cream, { baseC: '#FFF8EA', lw: 1.6, tex: false });
    for (const [x, y] of [[92, 34], [908, 34], [60, 150], [940, 150]]) flat(ellPts(x, y, 6, 6, 10), PAL.grayLt);
  }, { ax: 0.5, ay: 16 / 200 });
  defSprite('s03_speaker', 250, 440, () => {
    pnt(rrPts(20, 20, 210, 405, 16), '#3A3162', { baseC: '#4A4175', lw: 2.2 });
    pen(PAL.ink, 1.6, '2B'); brush.line(24, 215, 226, 215); brush.noStroke();
    for (const [y, r] of [[118, 70], [318, 78]]) {
      pnt(ellPts(125, y, r, r, 36), '#2A2448', { baseC: '#352E58', lw: 1.8, tex: false });
      pnt(ellPts(125, y, r * 0.55, r * 0.55, 28), '#5B5288', { baseC: '#6A6196', lw: 1.4, tex: false });
      flat(ellPts(125, y, r * 0.18, r * 0.18, 16), PAL.lilac);
    }
  }, { ax: 0.5, ay: 425 / 440 });
  defSprite('s03_beacon', 150, 180, () => {
    pnt(rrPts(25, 128, 100, 34, 8), '#8C84AE', { baseC: '#A69FC4', lw: 1.8, tex: false });
    const dome = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; dome.push([75 + Math.cos(a) * 44, 130 + Math.sin(a) * 92]); }
    pnt(dome, PAL.red, { baseC: '#FF6A7E', lw: 2 });
    flat([[52, 110], [60, 66], [70, 60], [64, 112]], '#FFFFFF', 0.6);
  }, { ax: 0.5, ay: 160 / 180 });
  defSprite('s03_post', 90, 260, () => {
    pnt(rrPts(30, 14, 30, 220, 10), '#8C84AE', { baseC: '#A69FC4', lw: 1.8, tex: false });
    pnt(rrPts(8, 222, 74, 28, 10), '#6A5BA6', { baseC: '#7F70BA', lw: 1.8, tex: false });
  }, { ax: 0.5, ay: 250 / 260 });
  defSprite('s03_shaft', 50, 320, () => { pnt(rrPts(13, 12, 24, 296, 11), '#C3C9DB', { baseC: '#E1E5F0', lw: 1.8, tex: false }); flat(rrPts(18, 22, 6, 270, 3), '#FFFFFF', 0.7); }, { ax: 0.5, ay: 300 / 320 });
  defSprite('s03_knob', 110, 110, () => { pnt(ellPts(55, 55, 38, 38, 28), PAL.red, { baseC: '#FF6A7E', lw: 2 }); flat(ellPts(42, 42, 11, 8, 12), '#FFFFFF', 0.85); });
  defSprite('s03_lbase', 170, 170, () => {
    pnt(ellPts(85, 85, 58, 58, 32), '#8C84AE', { baseC: '#A69FC4', lw: 2, tex: false });
    pnt(ellPts(85, 85, 26, 26, 20), '#5E567F', { lw: 1.4, tex: false });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; flat(ellPts(85 + Math.cos(a) * 44, 85 + Math.sin(a) * 44, 5, 5, 8), PAL.grayLt); }
  });
  defSprite('s03_crack', 620, 440, () => {
    const cx = 310, cy = 220;
    for (let i = 0; i < 11; i++) {
      let a = (i / 11) * TAU + (random() - 0.5) * 0.4, x = cx, y = cy;
      const pts = [[x, y]], n = 4 + Math.floor(random() * 3), len = 150 + random() * 140;
      for (let k = 0; k < n; k++) { a += (random() - 0.5) * 0.7; x += (Math.cos(a) * len) / n; y += ((Math.sin(a) * len) / n) * 0.8; pts.push([x, y]); }
      strokePath(offsetPts(pts, 2.5, 2.5), PAL.ink, 2.4, 'pen', 0);
      strokePath(pts, '#FFFFFF', 3, 'pen', 0);
    }
    for (const r of [70, 130]) { const pts = []; for (let i = 0; i <= 14; i++) { const a = (i / 14) * TAU; const rr = r * (0.85 + random() * 0.3); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8]); } strokePath(pts, '#FFFFFF', 2.4, 'pen', 0); }
    flat(starPts(cx, cy, 36, 12, 7), '#FFFFFF', 0.9);
  });

  function pipPose5(T) {
    const crouch = sstep(22.4, 22.58, T) * (1 - sstep(22.6, 22.7, T));
    const jump = Ez.out(inv(22.6, 22.76, T));
    const yank = Ez.outBack(inv(22.93, 23.1, T), 1.4);
    const yc = clamp(yank);
    const land = T > 23.08 ? Math.exp(-(T - 23.08) * 9) : 0;
    const strain = T > 23.05 && T < KICK ? 1 : 0;
    const hit = T >= KICK;
    const blown = hit ? Ez.out(inv(KICK, KICK + 0.3, T)) : 0;
    const fly = hit ? Math.sin(Math.PI * inv(KICK, KICK + 0.45, T)) : 0;
    const tr = strain * Math.sin(T * 47);
    const o = {
      flip: true,
      hop: jump * 48 * (1 - yc) + (T < 22.4 ? hopB(T) * 10 : 0) + fly * 60,
      sq: 1 + crouch * 0.13 - jump * (1 - yc) * 0.07 + land * 0.12,
      r: lerp(-0.12 * jump, 0.3, yc) + tr * 0.02 + blown * 0.26,
      armR: hit ? lerp(0.62, 2.7, blown) : lerp(lerp(0.3 + Math.sin(T * 5) * 0.1, 2.95, jump), 0.62, yank) + tr * 0.05,
      armL: hit ? lerp(1.7, 2.9, blown) : lerp(lerp(0.3, 1.1, jump), 2.0, yc) - strain * 0.3 + tr * 0.06,
      legs: strain ? [0.28, -0.22] : hit ? [0.4 * fly, -0.5 * fly] : null,
      headR: -0.1,
      face: T < 22.6 ? 'pf_nervous' : T < 23.12 ? 'pf_shock' : T < wordT(5, 3) ? 'pf_nervous' : T < KICK ? 'pf_scared' : 'pf_shock',
    };
    return { x: PIP5[0] + blown * 30, y: PIP5[1], s: PIP5[2], o };
  }
  const handAt5 = (T) => { const p = pipPose5(T); return pipHand(1, p.x, p.y, p.s, p.o); };
  // lever pivot: equidistant from Pip's hand at the grab and at the end of the yank, on the gauge side
  const LEV = (() => {
    const a = handAt5(22.74), b = handAt5(23.2), L = 205;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], half = Math.hypot(dx, dy) / 2;
    const k = Math.sqrt(Math.max(0, L * L - half * half)) / (2 * half);
    return [mx - dy * k * (dy > 0 ? 1 : -1), my + dx * k * (dy > 0 ? 1 : -1)];
  })();

  shot({
    id: 'L5-gauge', t0: 22.04, tin: { type: 'iris', d: 0.7, at: 0.5, c: [1000, 700] },
    draw(s) {
      const T = s.T;
      const tUp = wordT(5, 1), tMy = wordT(5, 2), tPd = wordT(5, 3);
      const ka = T - KICK, hit = ka >= 0;
      const dip = inv(tUp, KICK, T), inDip = T > tUp && !hit;
      const hitK = hit ? Math.exp(-ka * 5) : 0;
      const g = (a, r) => [HUB[0] + Math.cos(a) * r * GS, HUB[1] + Math.sin(a) * r * GS]; // point on the dial
      // camera: opens pinned on the needle hub at the iris centre, pulls back, creeps in with a dutch tilt through the dip, punches on the kick
      const intro = Ez.inOut(inv(22.04, 22.72, T));
      const z = lerp(1.8, 1, intro) + 0.045 * Ez.inOut(dip) + 0.08 * hitK;
      const rot = -0.022 * Ez.inOut(dip) * (hit ? Math.max(0, 1 - ka * 4) : 1);
      push();
      camAt(lerp(HUB[0], 960, intro), lerp(HUB[1], 560, intro), lerp(1000, 960, intro), lerp(700, 560, intro), z, rot);
      shake(hit ? 16 * hitK : inDip ? 1 + 2.5 * dip : 0, 5);
      spr('s03_stage', 960, 540, { s: 2.1, jit: 0 });

      // ---- light: warm key light on the gauge + four sweeping truss beams (they freeze and dim in the dip, go red on the kick)
      blendMode(ADD); noStroke();
      fill(withAlphaCol(PAL.butter, inDip ? 0.05 : 0.09)); triangle(HUB[0], 180, HUB[0] - 640, 940, HUB[0] + 640, 940);
      const tFreeze = Math.min(T, tUp);
      for (let i = 0; i < 4; i++) {
        const lx = LAMPS[i], ly = 208, base = i < 2 ? 0.25 : -0.25;
        let ang = base + Math.sin(tFreeze * 1.6 + i * 1.7) * 0.34;
        if (hit) ang = base + Math.sin(T * 9 + i * 2) * 0.7;
        const col = hit ? PAL.red : [PAL.lilac, PAL.sky, PAL.pink, PAL.butter][i];
        const dx = Math.sin(ang), dy = Math.cos(ang), len = 950, w = 150;
        fill(withAlphaCol(col, hit ? 0.12 : inDip ? 0.035 : 0.1));
        triangle(lx, ly, lx + dx * len - dy * w, ly + dy * len + dx * w, lx + dx * len + dy * w, ly + dy * len - dx * w);
      }
      blendMode(BLEND);
      spr('s03_truss', 960, -8, { s: 2, jit: 0.3 });
      // dust motes hanging in the key light
      for (let i = 0; i < 26; i++) { const x = HUB[0] + RS(i, 17) * 420 + Math.sin(T * 0.7 + i) * 30, y = 260 + fract(R(i, 18) - T * 0.04) * 620; disc(x, y, 1.5 + R(i, 19) * 2, PAL.butterLt, 0.25 + 0.35 * Math.sin(T * 3 + i)); }

      // ---- speaker stack thumps on the beats, falls silent in the dip, booms on the kick
      const pump = T < tUp ? kick(T, 7) : hit ? 1.6 * hitK : 0;
      spr('s03_speaker', 190, 905, { sx: 1 + pump * 0.035, sy: 1 + pump * 0.045, jit: 0.4 });
      if (!inDip) for (const cy of [598, 798]) { const bt = hit ? KICK : beatAt(T).t; const a = T - bt; if (a < 0.4) ringLine(190, cy, 60 + a * 380 * (hit ? 1.6 : 1), hit ? PAL.red : PAL.lilacLt, 6, 0.6 * (1 - a / 0.4)); }
      // alarm beacon on top of the speakers: dark until the kick, then spinning red
      if (hit) {
        blendMode(ADD); noStroke();
        for (let j = 0; j < 2; j++) { const a = T * 8 + j * Math.PI; fill(withAlphaCol(PAL.red, 0.16)); triangle(190, 448, 190 + Math.cos(a - 0.14) * 1500, 448 + Math.sin(a - 0.14) * 1500, 190 + Math.cos(a + 0.14) * 1500, 448 + Math.sin(a + 0.14) * 1500); }
        blendMode(BLEND);
        spr('s03_beacon', 190, 502, { s: 1.05, jit: 0.3 });
        glow(190, 445, 120, PAL.red, 0.55);
      } else sprC('s03_beacon', 190, 502, '#7D6A88', { s: 1.05, jit: 0.3 });

      // ---- console: buttons chase the beat, mini dials twitch
      spr('s03_console', HUB[0], 766, { s: 1.05, jit: 0.3 });
      const bi = beatAt(T).i, bcol = [PAL.red, PAL.mint, PAL.butter, PAL.sky, PAL.pink];
      for (let i = 0; i < 7; i++) {
        const bx = HUB[0] + (220 + i * 46 - 500) * 1.05, by = 766 + 59 * 1.05;
        const on = hit ? fract(ka * 6) < 0.5 : inDip ? R(i, Math.floor(T * 14)) > 0.75 : (i + bi) % 3 === 0;
        disc(bx, by, 14, PAL.ink); disc(bx, by, 10.5, on ? (hit ? PAL.red : bcol[i % 5]) : '#4A416F');
        if (on) disc(bx - 3, by - 4, 3.5, '#FFFFFF', 0.8);
      }
      for (let j = 0; j < 2; j++) {
        const dx0 = HUB[0] + ([640, 770][j] - 500) * 1.05, dy0 = 766 + 59 * 1.05;
        const a = -Math.PI / 2 + (hit ? T * 30 * (j ? 1 : -1) : inDip ? 1.2 + Math.sin(T * 60 + j) * 0.12 : Math.sin(T * 3 + j * 2) * 0.9);
        segLine(dx0, dy0, dx0 + Math.cos(a) * 26, dy0 + Math.sin(a) * 26, PAL.red, 4);
        disc(dx0, dy0, 5, PAL.ink);
      }

      // ---- the gauge (kit drawGauge, reading pdoomAt(T)); it strains in the dip and pegs red on the kick
      let val = pdoomAt(T);
      if (inDip) val += (1.2 + 3.4 * dip) * Math.sin(T * 71) + 2.5 * Ez.out(inv(tUp, tUp + 0.1, T)) - 3 * sstep(KICK - 0.1, KICK, T);
      if (hit) val += 70 * (1 - sstep(0.16, 0.55, ka)) + 3.5 * Math.sin(ka * 85) * Math.exp(-ka * 3);
      const rat = inDip ? 1 + 3 * dip : hit ? 5 * hitK : 0;
      push(); translate(Math.sin(T * 83) * rat, Math.cos(T * 97) * rat * 0.6);
      drawGauge(HUB[0], HUB[1] - 255 * GS, GS, val);
      noFill(); stroke(255, 255, 255, 55); strokeWeight(16); arc(HUB[0], HUB[1], 900 * GS, 900 * GS, Math.PI + 0.3, Math.PI + 0.85); noStroke();
      // marquee bulbs chase the beat, flicker in the dip, blink red on the kick
      for (let i = 0; i < 25; i++) {
        const [bx, by] = g(Math.PI + (i / 24) * Math.PI, 560);
        let on, col = PAL.butter;
        if (hit) { on = fract(ka * 7 + (i % 2) * 0.5) < 0.6; col = PAL.red; }
        else if (inDip) on = R(i, Math.floor(T * 18)) > 0.3 + 0.55 * dip;
        else on = (i + Math.floor((T - 22) / (BEAT_LEN / 4))) % 3 === 0;
        disc(bx, by, 12, '#2A2346'); disc(bx, by, 8.5, on ? col : '#5A5078');
        if (on) glow(bx, by, 32, col, 0.45);
      }
      // glass cracks spread from the pegged needle tip
      const tipC = g(Math.PI * 1.83, 360);
      if (hit) spr('s03_crack', tipC[0], tipC[1], { s: 0.85 * Ez.outBack(clamp(ka / 0.12), 2), jit: 0.3 });
      pop();

      // ---- lever on its post: Pip jumps, grabs the knob and hauls it down on "upping"; after the kick it springs loose
      const pp = pipPose5(T);
      let tip = T < 22.74 ? handAt5(22.74) : !hit ? pipHand(1, pp.x, pp.y, pp.s, pp.o) : handAt5(KICK - 0.001);
      if (hit) { const wbl = 0.3 * Math.exp(-ka * 5) * Math.sin(ka * 30), vx = tip[0] - LEV[0], vy = tip[1] - LEV[1]; tip = [LEV[0] + vx * Math.cos(wbl) - vy * Math.sin(wbl), LEV[1] + vx * Math.sin(wbl) + vy * Math.cos(wbl)]; }
      const ldx = tip[0] - LEV[0], ldy = tip[1] - LEV[1];
      spr('s03_post', LEV[0], PIP5[1] - 4, { sy: (PIP5[1] - 4 - LEV[1]) / 236, jit: 0.3 });
      if (T > 22.93 && T < 23.16) { const arc = []; for (let k = 1; k < 7; k++) { const a0 = handAt5(T - (k - 1) * 0.014), a1 = handAt5(T - k * 0.014); arc.push([a0[0], a0[1], a1[0], a1[1]]); } segLines(arc, '#FFFFFF', 6, 0.7); }
      spr('s03_shaft', LEV[0], LEV[1], { r: Math.atan2(ldx, -ldy), sy: Math.hypot(ldx, ldy) / 288, jit: 0.3 });
      spr('s03_lbase', LEV[0], LEV[1], { s: 0.7, jit: 0.3 });
      spr('s03_knob', tip[0], tip[1], { s: 0.95 });
      burst(T, 23.02, LEV[0], LEV[1], { n: 10, names: ['spark', 'sparkW'], spd: 650, g: 500, life: 0.55, s: 0.3, seed: 21 });
      pip(pp.x, pp.y, pp.s, pp.o);
      // sweat flies off Pip through the dip
      if (T > 23.1 && T < KICK + 0.3) for (let k = 0; k < 6; k++) { const b = 23.12 + k * 0.14, a = T - b; if (a < 0 || a > 0.45) continue; const side = k % 2 ? 1 : -1; spr('drop', pp.x - 30 + side * (80 + a * 260), pp.y - 400 - a * 220 + a * a * 900, { s: 0.5, r: side * 0.6, a: 1 - a / 0.45, seed: k }); }

      // ---- Clawd perched on the dial: bops on the beats, peers down in the dip, gets launched by the kick
      const cUp = hit ? Math.sin(Math.PI * clamp(ka / 0.6)) * 200 : 0;
      const cb = T < tUp ? hopB(T) : 0;
      clawd(HUB[0], HUB[1] - 530 * GS + 6, 0.5, {
        hop: cb * 22 + cUp, sq: T < tUp ? 1 + (1 - cb) * 0.06 : hit ? 0.9 : 1,
        eyes: T > tPd ? 'ce_star' : 'ce_sq', look: inDip && T < tPd ? [0, 0.7] : [0, 0], eyeS: inDip ? 1.25 : 1,
        armL: T < tUp ? -1.2 - cb * 0.8 : T < tPd ? 0.4 : -2.4 - Math.sin(T * 30) * 0.3,
        armR: T < tUp ? -1.2 - cb * 0.8 : T < tPd ? 0.4 : -2.4 - Math.cos(T * 30) * 0.3,
        r: inDip ? Math.sin(T * 40) * 0.015 : hit ? Math.sin(ka * 12) * 0.2 : 0,
      });

      // ---- held-breath details: steam hisses from the seams, a bolt pops off on "my"
      if (inDip || (hit && ka < 0.4)) for (let k = 0; k < 9; k++) {
        const b = tUp + 0.05 + k * 0.1, a = T - b; if (a < 0 || a > 0.7) continue;
        const side = k % 2 ? 1 : -1;
        spr('puff', HUB[0] + side * (440 + a * 150), 772 - a * 190, { s: 0.2 + a * 0.55, a: 0.75 * (1 - a / 0.7), seed: k, r: a * side });
      }
      const ba = T - tMy, b0 = g(Math.PI * 1.02, 500);
      if (ba > 0) {
        const bx = b0[0] - ba * 430, by = Math.min(b0[1] - ba * 760 + ba * ba * 1900, 905);
        if (ba < 1.4) { push(); translate(bx, by); rotate(-ba * 18); disc(0, 0, 13, '#B8B0D0'); ringLine(0, 0, 13, PAL.ink, 3); segLine(-7, 0, 7, 0, PAL.ink, 3); pop(); }
        if (ba < 0.25) spr('sparkW', b0[0], b0[1], { s: 0.55 * (1 - ba / 0.25), r: ba * 6 });
      }

      // ---- the kick: paint burst + glass shards from the pegged tip
      burst(T, KICK, tipC[0], tipC[1], { n: 22, names: ['blob_red', 'blob_orange', 'spark', 'star5'], spd: 1400, g: 800, life: 1.0, s: 0.5, seed: 9 });
      burst(T, KICK + 0.02, tipC[0], tipC[1], { n: 12, names: ['sparkW'], spd: 1800, g: 300, life: 0.6, s: 0.25, seed: 70 });
      pop();

      // screen-space: red alarm pulse, then light leaking through the cracks into the flash
      if (hit) {
        noStroke(); fill(withAlphaCol(PAL.red, 0.1 + 0.06 * Math.sin(ka * 30))); rect(-20, -20, W + 40, H + 40);
        ringLine(960, 540, 1050, PAL.red, 520, 0.18);
        const leak = inv(0.05, 0.35, ka);
        if (leak > 0) glow(tipC[0], tipC[1], 260 + leak * 1400, '#FFFFFF', 0.6);
      }
    },
  });
  lyr(5, { y: 1000, cols: ['#FFFFFF'], words: { 1: { anim: 'rise', fill: PAL.butter }, 3: { font: 'pixel', fill: PAL.red, size: 104, anim: 'zoom', jitter: 4 } } });

  // ================= L6: 'cause the future goes FOOM =================
  defSprite('s03_city', 1000, 360, () => {
    const cols = [PAL.lilac, PAL.sky, PAL.pink, PAL.mint, PAL.butter];
    for (let i = 0; i < 14; i++) {
      const x = 10 + i * 72 + random() * 20, w = 60 + random() * 40, h = 100 + random() * 200;
      const c = cols[i % cols.length];
      if (i % 3 === 0) pnt(ellPts(x + w / 2, 360 - h, w / 2, w / 2, 24), c, { baseC: lite(c, 0.3), line: false, tex: false });
      pnt(rrPts(x, 360 - h, w, h + 20, 10), c, { baseC: lite(c, 0.3), line: false, tex: false });
      for (let k = 0; k < 4; k++) flat(rrPts(x + 12 + (k % 2) * (w / 2 - 6), 360 - h + 24 + Math.floor(k / 2) * 40, 14, 18, 3), PAL.butterLt, 0.9);
    }
  });
  defSprite('s03_sky', 1000, 580, () => {
    gradRect(-20, -20, 1040, 330, '#FFBFD8', '#FFD8C8');
    gradRect(-20, 300, 1040, 300, '#FFD8C8', '#FFF0C2');
    wash(-40, -40, 1080, 300, PAL.pinkLt, 90, 0.15);
    wash(-40, 300, 1080, 320, PAL.butterLt, 100, 0.15);
    blob(180, 110, 150, PAL.lilacLt, 90, 0.35);
    blob(820, 80, 170, '#FFE0EE', 100, 0.35);
    for (const [x, y, r] of [[250, 168, 46], [320, 160, 54], [740, 116, 50]]) blob(x, y, r, '#FFFFFF', 160, 0.2);
  });
  defSprite('s03_sun', 360, 360, () => { pnt(ellPts(180, 180, 140, 140, 48), PAL.butter, { baseC: '#FFE98C', lw: 2.2 }); blob(150, 150, 60, '#FFFFFF', 110, 0.3); });
  const BCOL = [PAL.lilac, PAL.sky, PAL.pink, PAL.mint, PAL.butter];
  const BTOP = [470, 390, 430, 510, 410]; // height of each building kind above its anchor (sprite px)
  function building(k) {
    const c = BCOL[k], o = { baseC: lite(c, 0.3), lw: 1.8 };
    const win = (x0, y0, cols, rows, dx, dy, w, h, round) => { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const x = x0 + i * dx, y = y0 + j * dy; flat(round ? ellPts(x + w / 2, y + h / 2, w / 2, h / 2, 14) : rrPts(x, y, w, h, 3), PAL.butterLt, 0.95); } };
    if (k === 0) { pnt(rrPts(40, 110, 140, 430, 18), c, o); pnt(rrPts(62, 60, 96, 60, 26), dark(c, 0.1), { ...o, tex: false }); win(58, 140, 3, 8, 38, 46, 22, 26); }
    if (k === 1) {
      const dome = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; dome.push([110 + Math.cos(a) * 84, 232 + Math.sin(a) * 82]); }
      pnt(dome, lite(c, 0.2), { ...o, tex: false }); pnt(rrPts(26, 226, 168, 314, 12), c, o); win(46, 262, 3, 5, 48, 52, 26, 26, true);
    }
    if (k === 2) { pnt(rrPts(20, 330, 180, 210, 10), c, o); pnt(rrPts(45, 210, 130, 130, 10), c, o); pnt(rrPts(70, 110, 80, 110, 10), c, { ...o, tex: false }); win(40, 360, 4, 3, 38, 50, 20, 24); win(64, 236, 3, 2, 34, 46, 20, 22); win(92, 136, 1, 2, 0, 40, 36, 20); }
    if (k === 3) { pnt([[110, 20], [134, 160], [86, 160]], dark(c, 0.08), { ...o, tex: false }); pnt(rrPts(66, 150, 88, 390, 30), c, o); win(84, 190, 2, 7, 30, 46, 22, 26); }
    if (k === 4) {
      pnt(rrPts(40, 120, 140, 420, 70), c, o); win(70, 210, 2, 6, 52, 50, 28, 28, true);
      pen(PAL.ink, 1.8, '2B'); brush.polygon(ellPts(110, 196, 96, 18, 32)); brush.noStroke();
    }
  }
  for (let k = 0; k < 5; k++) defSprite('s03_b' + k, 220, 540, () => building(k), { ax: 0.5, ay: 530 / 540 });
  defSprite('s03_tower', 320, 640, () => {
    pen(PAL.coralDk, 4, 'marker'); brush.line(80, 200, 80, 630); brush.line(160, 200, 160, 630); brush.noStroke();
    pen(PAL.coral, 2.2, 'pen'); for (let y = 200; y < 620; y += 40) { brush.line(80, y, 160, y + 40); brush.line(160, y, 80, y + 40); brush.line(80, y, 160, y); } brush.noStroke();
    pnt(rrPts(160, 322, 150, 18, 6), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6, tex: false });
    pnt(rrPts(10, 30, 220, 170, 20), PAL.navy, { baseC: '#2E3A74', lw: 2.4, tex: false });
    pnt(rrPts(28, 48, 184, 134, 14), '#1B2150', { baseC: '#1B2150', lw: 1.4, tex: false });
  }, { ax: 120 / 320, ay: 630 / 640 });
  defSprite('s03_pad', 460, 120, () => {
    pnt(rrPts(30, 50, 400, 50, 10), '#8C84AE', { baseC: '#A69FC4', lw: 2, tex: false });
    const band = [[40, 30], [420, 30], [430, 54], [30, 54]];
    flat(band, PAL.butter);
    for (let x = 36; x < 420; x += 32) flat([[x, 54], [x + 14, 30], [x + 28, 30], [x + 14, 54]], PAL.ink, 0.85);
    pen(PAL.ink, 1.8, '2B'); brush.polygon(band); brush.noStroke();
  }, { ax: 0.5, ay: 30 / 120 });
  defSprite('s03_pod', 190, 120, () => {
    pnt(ellPts(95, 50, 42, 32, 28), PAL.skyLt, { baseC: '#E6F4FF', lw: 1.8, tex: false });
    pnt(rrPts(22, 52, 146, 42, 20), '#FFFFFF', { baseC: '#FFFFFF', lw: 2 });
    flat(ellPts(50, 98, 14, 5, 12), PAL.butter); flat(ellPts(140, 98, 14, 5, 12), PAL.butter);
  }, { v: 2 });
  // city layout: [kind, x, scale, flip] - the middle stays open for the launch pad
  const FRONT = [[0, 60, 0.86, 0], [3, 190, 0.9, 1], [1, 330, 0.82, 0], [4, 470, 0.86, 1], [2, 610, 0.78, 0], [2, 1330, 0.8, 1], [1, 1470, 0.86, 1], [0, 1610, 0.9, 0], [4, 1745, 0.82, 0], [3, 1870, 0.88, 0]];
  const MID = [[1, 130, 0.62, 1], [2, 400, 0.66, 0], [4, 1260, 0.62, 0], [3, 1560, 0.6, 1], [1, 1810, 0.64, 0]];
  const PODS = [[300, 1, 0.9, PAL.mint], [395, -1, 0.75, PAL.pink], [240, 1, 0.6, PAL.sky], [470, -1, 0.85, PAL.butter], [340, 1, 0.7, PAL.lilac]];
  const FOOM_C = [960, 520];
  const ROCK = [1000, 880, 1.05];

  shot({
    id: 'L6-foom', t0: 24.24, tin: { type: 'flash', d: 0.4, at: 0.4 },
    draw(s) {
      const T = s.T;
      const tFut = wordT(6, 2), tGoes = wordT(6, 3), tF = wordT(6, 4);
      const fa = T - tF, boom = fa >= 0;
      const rumble = sstep(tGoes - 0.05, tF, T) * (boom ? Math.exp(-fa * 3) : 1);
      const out = Ez.in(inv(25.6, 25.8, T)); // FOOM letters fly apart as the smoke closes in
      const z = 1.03 + 0.04 * Ez.inOut(inv(24.24, tF, T)) + (boom ? 0.06 * Math.exp(-fa * 5) : 0);
      push();
      camAt(960, 600, 960, 600, z, 0);
      shake(rumble * 5 + (boom ? 24 * Math.exp(-fa * 4) : 0) + kick(T, 9) * 2.5, 7);
      // once the billowing smoke fully covers the frame (from ~0.5 s after FOOM) only the smoke itself is drawn
      if (T < tF + 0.5) {
      spr('s03_sky', 960, 540, { s: 2.08, jit: 0 });
      // sun and its slowly turning rays (they spin up on FOOM)
      const sunX = 1570, sunY = 380, spin = T * 0.3 + (boom ? Ez.out(clamp(fa / 0.6)) * 2 : 0);
      noStroke();
      for (let i = 0; i < 14; i++) { const a = spin + (i / 14) * TAU; fill(withAlphaCol(i % 2 ? PAL.butterLt : '#FFFFFF', 0.35)); triangle(sunX, sunY, sunX + Math.cos(a - 0.09) * 900, sunY + Math.sin(a - 0.09) * 900, sunX + Math.cos(a + 0.09) * 900, sunY + Math.sin(a + 0.09) * 900); }
      spr('s03_sun', sunX, sunY, { s: 1 + kick(T, 6) * 0.04 + (boom ? 0.25 * Math.exp(-fa * 4) : 0), jit: 0.3 });
      sprC('s03_city', 960, 840, '#EDE4FF', { s: 1.9, jit: 0, a: 0.6 });

      // flying pods zip across the lanes (blown away by the blast)
      PODS.forEach(([y, dir, sc, c], i) => {
        let x = fract(R(i, 51) + (dir * T * (260 + i * 60)) / 2300) * 2300 - 190, py = y + Math.sin(T * 3 + i) * 10, r = Math.sin(T * 2 + i) * 0.06;
        if (boom) { const k = Ez.out(clamp(fa / 0.6)), ang = Math.atan2(py - FOOM_C[1], x - FOOM_C[0]); x += Math.cos(ang) * 1400 * k; py += Math.sin(ang) * 1400 * k - 200 * k; r += fa * 8 * (i % 2 ? 1 : -1); }
        segLines([1, 2, 3].map((k) => [x - dir * (70 + k * 36) * sc, py + 12 * sc - k * 6, x - dir * (100 + k * 40) * sc, py + 12 * sc - k * 6]), '#FFFFFF', 3, 0.7);
        sprC('s03_pod', x, py, c, { s: sc, flip: dir < 0, r, seed: i });
      });

      // searchlights sweep up from behind the skyline
      blendMode(ADD); noStroke();
      for (let i = 0; i < 2; i++) { const bx = i ? 1420 : 480, a = -Math.PI / 2 + Math.sin(T * 1.8 + i * 2.2) * 0.45; fill(withAlphaCol(i ? PAL.skyLt : PAL.pinkLt, 0.12)); triangle(bx, 900, bx + Math.cos(a - 0.07) * 1100, 900 + Math.sin(a - 0.07) * 1100, bx + Math.cos(a + 0.07) * 1100, 900 + Math.sin(a + 0.07) * 1100); }
      blendMode(BLEND);

      // the city: rumbles on "goes", every tower lifts off on its own little rocket flames after FOOM
      const lift = (tl) => { const a = T - tl; return a > 0 ? -(a * a * 6000 + a * 1100) : 0; };
      const tlF = (i) => tF + 0.02 + R(i, 31) * 0.12, tlM = (i) => tF + 0.06 + R(i, 33) * 0.12;
      MID.forEach(([k, x, sc, fl], i) => {
        const off = lift(tlM(i)), jx = rumble * RS(G.boil + i, 34) * 3;
        if (off < 0) spr('flame', x + jx, 1010 + off - 6, { s: 1.1 * sc + Math.sin(T * 40 + i) * 0.1, sy: 1.4, r: Math.PI, seed: i });
        sprC('s03_b' + k, x + jx, 1010 + off, '#F1EAFF', { s: sc, flip: !!fl, seed: i, a: 0.9 });
      });
      // street-level smoke: gathers from "goes" and pours out from under each tower as it lifts
      for (let i = 0; i < 18; i++) {
        const early = i < 8, t0 = early ? tGoes + i * 0.035 : tlF(i - 8) + 0.02, a = T - t0;
        if (a < 0) continue;
        const x = (early ? 640 + R(i, 41) * 720 : FRONT[i - 8][1]) + RS(i, 43) * 120 * a;
        sprC('puff', x, 1090 - a * (early ? 70 : 260), ['#FFFFFF', PAL.pinkLt, PAL.butterLt, PAL.lilacLt][i % 4], { s: early ? 0.5 + a * 0.9 : 0.8 + a * 3.2, seed: i, r: i + a });
      }
      FRONT.forEach(([k, x, sc, fl], i) => {
        const off = lift(tlF(i)), jx = rumble * RS(G.boil + i, 32) * 4;
        const by = 1112 + off;
        if (off < 0) spr('flame', x + jx, by - 8, { s: 1.5 * sc + Math.sin(T * 40 + i) * 0.15, sy: 1.6, r: Math.PI, seed: i + 9 });
        spr('s03_b' + k, x + jx, by, { s: sc, flip: !!fl, seed: i, r: off < 0 ? RS(i, 36) * 0.06 * Math.min(1, -off / 300) : 0 });
        // rooftop lights wake up on "future" and blink on the beats
        if (T > tFut + i * 0.025) { const on = (beatAt(T).i + i) % 2 === 0; const lx = x + jx, ly = by - BTOP[k] * sc - 14; disc(lx, ly, 13, PAL.ink); disc(lx, ly, 10, on ? cyc(i * 0.7 + T) : '#FFF6D6'); if (on) disc(lx - 3, ly - 3, 3.5, '#FFFFFF'); }
      });
      for (let i = 0; i < FRONT.length; i++) { const a = T - (tFut + i * 0.025); if (a > 0 && a < 0.45) { const [k, x, sc] = FRONT[i]; spr('sparkW', x, 1112 - BTOP[k] * sc - 55 + lift(tlF(i)), { s: 0.55 * Math.sin((Math.PI * a) / 0.45), r: a * 5, seed: i }); } }

      // launch tower with the countdown board (3, 2, 1 on the beats, GO on FOOM)
      spr('s03_tower', 770, 915, { jit: 0.3 });
      const cdb = BEATS.filter((b) => b > 24.3 && b < tF - 0.05).slice(-3);
      let lab = '', lt0 = 0;
      if (boom) { lab = 'GO!'; lt0 = tF; } else cdb.forEach((b, i) => { if (T >= b) { lab = String(3 - i); lt0 = b; } });
      if (lab) txt(lab, 770, 400, { font: 'pixel', size: lab.length > 1 ? 74 : 112, fill: boom ? PAL.mint : PAL.butter, weight: 700 }, { s: 1 + 0.45 * Math.exp(-(T - lt0) * 10) });
      else for (let i = 0; i < 3; i++) disc(740 + i * 30, 400, 8, PAL.butter, 0.4 + 0.6 * (Math.floor(T * 6) % 3 === i));
      // the pad vents steam on every countdown beat
      for (const b of cdb) { const a = T - b; if (a > 0 && a < 0.6) for (const d of [-1, 1]) sprC('puff', ROCK[0] + d * (150 + a * 260), 900 - a * 90, d < 0 ? '#FFFFFF' : PAL.lilacLt, { s: 0.3 + a * 0.9, a: 1 - a / 0.6, seed: d + 7, r: a * d }); }
      spr('s03_pad', ROCK[0], 905, { jit: 0.3 });

      // rocket + Clawd in shades: ignition on "goes", squat, then FOOM
      const launch = Ez.in(inv(tF - 0.03, tF + 0.45, T));
      const squat = sstep(tF - 0.16, tF - 0.03, T) * (1 - sstep(tF - 0.03, tF + 0.05, T));
      const stretch = 1 + 0.28 * Math.sin(Math.PI * clamp(launch * 1.6)) - squat * 0.08;
      const rx = ROCK[0] + rumble * (RS(G.boil, 35) * 4 + Math.sin(T * 50) * 2), ry = ROCK[1] - launch * 1700 + squat * 10;
      for (let i = 0; i < 16; i++) { // exhaust trail
        const born = tF + i * 0.028, a = T - born; if (a < 0) continue;
        const py = ROCK[1] - Ez.in(inv(tF - 0.03, tF + 0.45, born)) * 1700 + 90;
        sprC('puff', ROCK[0] + RS(i, 2) * 70 * a, py + a * 60, i % 3 ? '#FFFFFF' : PAL.pinkLt, { s: 0.5 + a * 1.5, seed: i, r: i });
      }
      if (T > tGoes) spr('flame', rx, ry + 36 * stretch, { s: (boom ? 2.4 : 0.8 + 0.6 * inv(tGoes, tF, T)) + Math.sin(T * 40) * 0.15, sy: boom ? 1.6 : 1, r: Math.PI, seed: 3 });
      if (T > tGoes) glow(rx, ry + 70, boom ? 160 : 80, PAL.orange, 0.4);
      spr('rocket', rx, ry, { s: ROCK[2], sx: 1 / Math.sqrt(stretch), sy: stretch, jit: 0.5 });
      clawd(rx, ry - 150 * stretch, 0.5, {
        acc: ['shades'], seed: 3,
        armL: boom ? -2.6 + Math.sin(T * 20) * 0.2 : -2.3 + Math.sin(T * 14) * 0.45, armR: boom ? -2.6 - Math.sin(T * 20) * 0.2 : 0.35,
        legs: [[0, 0.5], [0, 0.22], [0, -0.22], [0, -0.5]], sq: 1 - squat * 0.1, hop: boom ? 0 : hopB(T) * 6,
      });
      }

      // the exhaust billows up and swallows the frame just before the smoke clears into the void
      for (let i = 0; i < 32; i++) {
        const col = i % 8, row = Math.floor(i / 8), t0 = tF + 0.13 + R(i, 47) * 0.06, a = T - t0;
        if (a < 0) continue;
        const x = ((col + 0.5 + (row % 2) * 0.5) / 8) * W - 60 + RS(i, 46) * 80 + RS(i, 43) * 100 * a;
        const y = 1250 - a * (900 + row * 700 + R(i, 44) * 200);
        sprC('puff', x, y, ['#FFFFFF', PAL.pinkLt, PAL.butterLt, PAL.lilacLt][i % 4], { s: 1.2 + a * (6 + R(i, 45) * 1.5), seed: i, r: i + a });
      }

      // FOOM!: shockwave rings, paint splats that stick, and the giant word, one bouncing letter at a time
      if (boom && out < 1) {
        for (let i = 0; i < 3; i++) { const a = fa - i * 0.1; if (a > 0) { spr('ring', FOOM_C[0], FOOM_C[1], { s: a * 6.5, a: clamp(1 - a * 1.6), seed: i }); ringLine(FOOM_C[0], FOOM_C[1], a * 1500, '#FFFFFF', 18 * (1 - clamp(a * 1.4)), 0.8 * clamp(1 - a * 1.4)); } }
        for (let i = 0; i < 12; i++) {
          if (fa < 0.02) break;
          const ang = (i / 12) * TAU + RS(i, 61) * 0.25, k = Ez.out(clamp((fa - 0.02) / 0.12));
          const tx = FOOM_C[0] + Math.cos(ang) * (580 + R(i, 62) * 240), ty = FOOM_C[1] + Math.sin(ang) * (300 + R(i, 63) * 140);
          sprC('splat', lerp(FOOM_C[0], tx, k), lerp(FOOM_C[1], ty, k), PSY[i % 6], { s: (0.4 + R(i, 64) * 0.45) * Ez.outBack(clamp((fa - 0.02) / 0.2), 2), r: R(i, 65) * TAU, seed: i, a: 1 - out });
        }
        burst(T, tF, FOOM_C[0], FOOM_C[1], { n: 24, names: ['blob_coral', 'blob_butter', 'blob_pink', 'blob_sky', 'star5'], spd: 1900, g: 500, life: 1.2, s: 0.55, even: true, seed: 33 });
      }
      if (T > tF - 0.09 && out < 1) {
        const L = ['F', 'O', 'O', 'M', '!'], cols = [PAL.coral, PAL.butter, PAL.mint, PAL.sky, PAL.pink];
        const st = (c) => ({ size: 300, fill: c, stroke: PAL.ink, sw: 16, weight: 700, shadow: 'rgba(43,33,64,0.85)' });
        const ws = L.map((ch, i) => textImg(ch, st(cols[i])).tw * 0.95), tot = ws.reduce((a, b) => a + b, 0);
        let x = FOOM_C[0] - tot / 2;
        for (let i = 0; i < 5; i++) {
          const cx = x + ws[i] / 2; x += ws[i];
          const la = T - (tF - 0.09 + i * 0.022); if (la < 0) continue;
          const k = Ez.outBack(clamp(la / 0.22), 2.6);
          const y = FOOM_C[1] + Math.sin(T * 9 + i * 1.3) * 12 * clamp(la * 3) - (1 - k) * 140;
          const fx = FOOM_C[0] + (cx - FOOM_C[0]) * (1 + out * 2.2) + (i - 2) * out * 260, fy = y - out * (520 + 160 * Math.abs(i - 2));
          txt(L[i], fx, fy, st(cols[i]), { s: k * (1 + 0.05 * kick(T, 8)) * (1 + out * 0.4), r: Math.sin(T * 7 + i * 2) * 0.07 + (1 - k) * 0.5 * (i % 2 ? 1 : -1) + out * (i - 2) * 0.9, a: 1 - Ez.in(out) });
        }
      }
      pop();
    },
  });
  lyr(6, { y: 150, x: 1110, words: { 2: { fill: PAL.mint, anim: 'rise' }, 3: { anim: 'drop' }, 4: { hide: true, draw: () => {} } } });

  // ================= L7 + L8: the Chinese room, then the shrooms (one continuous room) =================
  const RC = [960, 470], RSC = 1.1;     // room centre (world) and base scale (room sprites are 1000x580)
  const tTrap = wordT(7, 0), tChi = wordT(7, 3), tRoom = wordT(7, 4);
  const tA = wordT(8, 1), tBag = wordT(8, 2), tOf = wordT(8, 3), tShr = wordT(8, 4);
  const SLIPS = BEATS.filter((b) => b > 26.05 && b < 28.1);             // a slip shoots in through the IN slot on each beat
  const SPROUT = [...BEATS.filter((b) => b > 28.4 && b < 29.1), tShr, ...BEATS.filter((b) => b > 29.3 && b < 29.5)];
  const SLIP_IN = [[0, 1], [2, 3], [4, 5], [8], [6, 7]], SLIP_OUT = [[3], [5], [2], [6, 7], [0]];
  const psyAt = (T) => sstep(28.36, 28.95, T);
  const meltAt = (T) => clamp((T - tShr + 0.02) / 0.85);
  const SLOT_L = [155, 338], SLOT_R = [845, 332], BOOK = [500, 396];
  // smoke-clearing transition: its timing is shared by the mask and by the smoke rim drawn inside the room shot
  const TIN7 = { d: 0.42, at: 0.45 };
  const holeR = (p) => 1350 * Math.pow(clamp(p), 0.8);
  const HOLE_C = [960, 500];
  // melt drip tongues: [strip centre (of 96), extra length px, half-width in strips]
  const DRIPS = [[8, 520, 1.6], [19, 380, 1.3], [27, 640, 1.9], [38, 300, 1.2], [46, 560, 1.7], [55, 420, 1.4], [63, 700, 2], [72, 340, 1.3], [81, 600, 1.8], [90, 450, 1.5]];

  defSprite('s03_void', 1000, 580, () => {
    flat(rrPts(-20, -20, 1040, 620, 2), '#1A1535');
    wash(-40, -40, 1080, 660, '#241E4E', 150, 0.15);
    blob(500, 260, 300, '#33296A', 110, 0.4);
    blob(150, 450, 220, '#1E3152', 110, 0.35);
    blob(860, 120, 200, '#3A2462', 110, 0.35);
    blob(880, 480, 180, '#2A2058', 90, 0.35);
    for (let i = 0; i < 70; i++) flat(ellPts(random() * 1000, random() * 580, 0.8 + random() * 1.4, 0.8 + random() * 1.4, 8), '#FFFFFF', 0.25 + random() * 0.5);
  });
  defSprite('s03_floor', 1000, 580, () => {
    pnt([[36, 544], [964, 544], [700, 388], [300, 388]], '#E2B383', { baseC: '#ECC59C', lw: 1.8 });
    pen(dark('#C98F5E', 0.15), 1.2, 'pen'); for (let k = 1; k < 8; k++) brush.line(36 + k * 116, 544, 300 + k * 50, 388); brush.noStroke();
    pnt(ellPts(500, 498, 280, 34, 40), '#E8747A', { baseC: '#F29A9E', lw: 1.6, tex: false });
    pen(PAL.butterLt, 2, 'pen'); brush.polygon(ellPts(500, 498, 230, 24, 36)); brush.noStroke();
  });
  defSprite('s03_walls', 1000, 580, () => {
    pnt([[36, 36], [964, 36], [700, 169], [300, 169]], '#F1E4CE', { baseC: '#F7EEDF', lw: 1.8 });
    pnt([[36, 36], [300, 169], [300, 388], [36, 544]], '#EFD5AE', { baseC: '#F6E2C4', lw: 1.8 });
    pnt([[964, 36], [700, 169], [700, 388], [964, 544]], '#EFD5AE', { baseC: '#F6E2C4', lw: 1.8 });
    pnt([[300, 169], [700, 169], [700, 388], [300, 388]], '#FFF0D4', { baseC: '#FFF6E6', lw: 1.8 });
    for (let x = 318; x < 690; x += 36) flat(rrPts(x, 172, 14, 214, 2), '#F0D8AE', 0.55);
    pen(PAL.inkSoft, 1.2, 'pen'); brush.line(36, 420, 300, 330); brush.line(964, 420, 700, 330); brush.noStroke();
    for (const right of [false, true]) {
      const m = (p) => (right ? [1000 - p[0], p[1]] : p);
      pnt([[100, 235], [210, 244], [210, 441], [100, 506]].map(m), PAL.brownLt, { baseC: '#DDB592', lw: 2 });
      flat([[114, 340], [198, 325], [198, 338], [114, 355]].map(m), PAL.ink);
      flat(ellPts(m([194, 384])[0], 384, 6, 7, 10), PAL.gold);
      const sx = m([155, 0])[0];
      pnt(rrPts(sx - 40, 178, 80, 38, 8), right ? PAL.mint : PAL.pink, { lw: 1.6, tex: false });
      const t = textImg(right ? 'OUT' : 'IN', { font: 'pixel', size: 26, fill: PAL.ink, weight: 700 });
      image(t.img, sx - t.w / 2, 197 - t.h / 2);
    }
    pnt([[440, 72], [560, 72], [552, 104], [448, 104]], '#E2CCA8', { baseC: '#EAD8B8', lw: 1.6, tex: false });
    pnt(ellPts(612, 214, 24, 24, 24), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6, tex: false });
    const fc = '#E3C79E', fo = { baseC: '#EDD6B2', lw: 2.2, tex: false };
    pnt([[12, 12], [988, 12], [964, 36], [36, 36]], fc, fo);
    pnt([[12, 568], [988, 568], [964, 544], [36, 544]], fc, fo);
    pnt([[12, 12], [36, 36], [36, 544], [12, 568]], fc, fo);
    pnt([[988, 12], [964, 36], [964, 544], [988, 568]], fc, fo);
  });
  defSprite('s03_desk', 600, 170, () => {
    const wood = '#B97F51';
    pnt(rrPts(34, 52, 38, 112, 8), dark(wood, 0.1), { lw: 1.6, tex: false });
    pnt(rrPts(528, 52, 38, 112, 8), dark(wood, 0.1), { lw: 1.6, tex: false });
    pnt(rrPts(60, 52, 480, 76, 10), wood, { baseC: lite(wood, 0.2), lw: 1.8 });
    pnt(rrPts(240, 70, 120, 36, 8), lite(wood, 0.15), { lw: 1.4, tex: false });
    flat(ellPts(300, 88, 7, 7, 10), PAL.gold);
    pnt([[40, 10], [560, 10], [584, 34], [16, 34]], lite(wood, 0.25), { baseC: lite(wood, 0.4), lw: 1.8, tex: false });
    pnt(rrPts(14, 32, 572, 24, 8), wood, { baseC: lite(wood, 0.15), lw: 1.8, tex: false });
  }, { ax: 0.5, ay: 22 / 170 });
  defSprite('s03_book', 560, 150, () => {
    pnt([[26, 30], [534, 30], [552, 130], [8, 130]], '#B8384A', { baseC: '#D0505E', lw: 2, tex: false });
    pnt([[40, 20], [272, 34], [276, 122], [24, 118]], PAL.cream, { baseC: '#FFFBF0', lw: 1.6 });
    pnt([[288, 34], [520, 20], [536, 118], [284, 122]], PAL.cream, { baseC: '#FFFBF0', lw: 1.6 });
    const t = textImg('RULES', { font: 'pixel', size: 20, fill: PAL.coralDk, weight: 700 });
    image(t.img, 150 - t.w / 2, 40 - t.h / 2);
    for (let row = 0; row < 3; row++) {
      const y = 64 + row * 22;
      for (const [x0, a, b] of [[70, row * 2, row * 2 + 1], [330, 8 - row, (row + 3) % 9]]) {
        paintGlyph(a, x0, y, 18, PAL.ink, 1.3, 'pen');
        pen(PAL.coralDk, 1.2, 'pen'); brush.line(x0 + 18, y, x0 + 52, y); brush.line(x0 + 46, y - 4, x0 + 52, y); brush.line(x0 + 46, y + 4, x0 + 52, y); brush.noStroke();
        paintGlyph(b, x0 + 72, y, 18, PAL.ink, 1.3, 'pen');
        pen(PAL.grayLt, 1, 'pen'); brush.line(x0 + 100, y + 4, x0 + 170, y + 2); brush.noStroke();
      }
    }
    pen(PAL.inkSoft, 1.4, 'pen'); brush.line(280, 34, 280, 124); brush.noStroke();
  });
  defSprite('s03_page', 260, 110, () => {
    pnt([[6, 14], [238, 2], [252, 96], [4, 100]], PAL.cream, { baseC: '#FFFBF0', lw: 1.6, tex: false });
    pen(PAL.grayLt, 1, 'pen'); for (let k = 0; k < 4; k++) brush.line(30, 30 + k * 18, 220, 24 + k * 18); brush.noStroke();
  }, { ax: 6 / 260, ay: 0.5 });
  defSprite('s03_slip', 200, 110, () => {
    pnt(rrPtsPoly([[16, 22], [184, 14], [188, 90], [12, 96]], 6), '#FFF8E6', { baseC: '#FFFCF2', lw: 1.8, tex: false });
    pen(PAL.grayLt, 1, 'pen'); brush.line(100, 20, 100, 92); brush.noStroke();
  }, { v: 2 });
  defSprite('s03_lock', 110, 150, () => {
    const sh = [[30, 78], [30, 46], [42, 24], [68, 24], [80, 46], [80, 78]];
    strokePath(sh, '#A8A2BE', 9, 'marker', 0.5); strokePath(sh, PAL.ink, 1.6, 'pen', 0.5);
    pnt(rrPts(14, 70, 82, 66, 12), PAL.gold, { baseC: '#FFD75A', lw: 2, tex: false });
    flat(ellPts(55, 96, 8, 8, 12), PAL.ink); flat([[52, 100], [58, 100], [60, 120], [50, 120]], PAL.ink);
  });
  defSprite('s03_hand', 50, 50, () => { pnt(ellPts(25, 25, 16, 16, 20), PAL.skin, { baseC: '#FFE3CF', lw: 1.6, tex: false }); });
  defSprite('s03_bulb', 80, 120, () => {
    pnt(rrPts(28, 6, 24, 26, 4), '#9C96B4', { lw: 1.4, tex: false });
    pnt(ellPts(40, 62, 26, 32, 24), PAL.butterLt, { baseC: '#FFF8D8', lw: 1.6, tex: false });
    flat(ellPts(32, 52, 5, 9, 10), '#FFFFFF', 0.9);
  }, { ax: 0.5, ay: 0.05 });
  defSprite('s03_bag', 260, 330, () => {
    const kraft = '#C99A66';
    pnt([[40, 96], [220, 96], [236, 316], [24, 316]], kraft, { baseC: '#DDB488', lw: 2.2 });
    pnt([[40, 100], [44, 62], [70, 84], [96, 50], [124, 80], [150, 48], [176, 82], [202, 56], [220, 100]], lite(kraft, 0.1), { baseC: '#E4C29A', lw: 2, tex: false });
    pen(dark(kraft, 0.2), 1.2, 'pen'); brush.line(60, 120, 50, 300); brush.line(200, 120, 212, 300); brush.noStroke();
    pnt(rrPts(46, 170, 168, 92, 12), '#FFFFFF', { baseC: '#FFFDF7', lw: 1.8, tex: false });
    const t = textImg('shrooms', { font: 'hand', size: 48, fill: PAL.ink, weight: 700 });
    image(t.img, 130 - t.w / 2, 226 - t.h / 2);
    pnt([[112, 194], [120, 180], [140, 180], [148, 194]], PAL.red, { lw: 1.2, tex: false });
  }, { v: 2, ax: 0.5, ay: 318 / 330 });
  function shroom(k) {
    const psy = k === 3, cap = psy ? PAL.lilac : PAL.red, capB = psy ? '#D8C8FF' : '#FF6A7E', dot = psy ? PAL.butter : '#FFFFFF';
    const face = (x, y) => { flat(ellPts(x - 9, y, 3.2, 4.2, 8), PAL.ink); flat(ellPts(x + 9, y, 3.2, 4.2, 8), PAL.ink); flat(ellPts(x - 18, y + 7, 5, 3, 8), PAL.pink, 0.85); flat(ellPts(x + 18, y + 7, 5, 3, 8), PAL.pink, 0.85); };
    const dome = (cx, cy, rx, ry) => { const p = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + (i / 24) * Math.PI; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } p.push([cx + rx * 0.8, cy + ry * 0.12], [cx - rx * 0.8, cy + ry * 0.12]); return p; };
    // mushrooms are little characters, so they get the house sticker paint like Pip and Clawd
    const pnt = paint, stem = { baseC: '#FFF8EC', lw: 1.8 }, capO = { baseC: capB, lw: 2 };
    if (k === 0 || k === 3) {
      pnt(rrPtsPoly([[52, 80], [88, 80], [94, 150], [46, 150]], 12), PAL.cream, stem);
      pnt(dome(70, 90, 62, 64), cap, capO);
      for (const [x, y, r] of [[46, 62, 10], [80, 46, 12], [102, 72, 7], [62, 80, 6]]) flat(ellPts(x, y, r, r * 0.85, 12), dot, 0.95);
      face(70, 120);
    } else if (k === 1) {
      pnt(rrPtsPoly([[56, 70], [84, 70], [90, 150], [50, 150]], 12), PAL.cream, stem);
      pnt([[70, 8], [104, 50], [118, 84], [22, 84], [36, 50]], cap, capO);
      for (const [x, y, r] of [[70, 34, 8], [52, 64, 8], [92, 62, 9]]) flat(ellPts(x, y, r, r * 0.85, 12), dot, 0.95);
      face(70, 118);
    } else {
      pnt(rrPtsPoly([[36, 100], [56, 100], [60, 150], [32, 150]], 8), PAL.cream, stem);
      pnt(dome(46, 106, 36, 38), cap, capO);
      pnt(rrPtsPoly([[86, 70], [110, 70], [114, 150], [82, 150]], 10), PAL.cream, stem);
      pnt(dome(98, 78, 42, 44), cap, capO);
      for (const [x, y, r] of [[36, 90, 6], [56, 82, 5], [90, 52, 7], [110, 64, 6]]) flat(ellPts(x, y, r, r * 0.85, 12), dot, 0.95);
      face(98, 110);
    }
  }
  for (let k = 0; k < 4; k++) defSprite('s03_sh' + k, 140, 160, () => shroom(k), { v: 2, ax: 0.5, ay: 150 / 160 });
  defSprite('s03_drip', 90, 560, () => {
    pnt([[18, 0], [72, 0], [66, 380], [76, 470], [62, 530], [45, 546], [28, 530], [14, 470], [24, 380]], '#FFFFFF', { baseC: '#FFFFFF', lw: 1.6, tex: false });
    flat(rrPts(52, 20, 10, 420, 4), '#E2DDEC', 0.7);
    flat(ellPts(36, 500, 6, 12, 10), '#FFFFFF', 0.9);
  }, { v: 2, ax: 0.5, ay: 0 });
  // runtime canvas: the whole room is re-rendered into it each frame of the melt, then drawn back in stretched strips
  defSprite('s03_meltfb', W, H, () => {}, { ax: 0, ay: 0 });

  // [x, y, rot, scale, sprout index, kind] - room-sprite coords inside, world coords outside
  const MUSH_IN = [
    [150, 530, 0, 0.8, 0, 1], [862, 532, 0, 0.75, 0, 0], [335, 524, 0, 0.55, 0, 2],
    [380, 92, Math.PI, 0.6, 1, 0], [630, 100, Math.PI, 0.55, 1, 1], [58, 320, Math.PI / 2, 0.62, 1, 0], [942, 300, -Math.PI / 2, 0.62, 1, 1], [232, 546, 0, 0.72, 1, 3], [585, 396, 0, 0.42, 1, 2],
    [420, 532, 0, 0.62, 2, 0], [770, 540, 0, 0.72, 2, 3], [318, 390, 0, 0.36, 2, 1], [676, 392, 0, 0.34, 2, 0], [500, 96, Math.PI, 0.5, 2, 3],
    [60, 460, Math.PI / 2, 0.5, 3, 3], [940, 440, -Math.PI / 2, 0.55, 3, 0], [150, 150, Math.PI * 0.75, 0.45, 3, 2], [850, 140, -Math.PI * 0.75, 0.45, 3, 3],
  ];
  const MUSH_OUT = [[250, 330, -0.3, 1.1, 1, 0], [1650, 250, 0.3, 1.0, 2, 3], [175, 720, -0.2, 0.9, 2, 1], [1790, 880, 0.25, 1.0, 3, 0], [470, 920, -0.15, 0.75, 3, 2], [1480, 930, 0.2, 0.8, 3, 1]];
  function sproutK(T, g) { const t = SPROUT[g]; return t == null || T < t ? 0 : Ez.outBack(clamp((T - t) / 0.22), 2.4); }
  function drawShroom(T, x, y, r, sc, g, kind, i) {
    const k = sproutK(T, g); if (k <= 0) return;
    const kk = kick(T, 8);
    spr('s03_sh' + kind, x, y, { s: sc * k, sx: 1 + kk * 0.06, sy: 1 - kk * 0.08 + Math.sin(T * 6 + i) * 0.03, r: r + Math.sin(T * 3 + i) * 0.08, seed: i });
  }
  function drawSlip(x, y, s, r, glyphs, a = 1) {
    if (a <= 0.004) return;
    push(); translate(x, y); rotate(r); scale(s);
    spr('s03_slip', 0, 0, { a, jit: 0.6 });
    glyphs.forEach((k, j) => glyph(k, (j - (glyphs.length - 1) / 2) * 62, 4, 0.56, PAL.ink, a));
    pop();
  }

  function roomXf(T) {
    let sq;
    if (T < tTrap - 0.12) sq = 1.2;
    else if (T < tTrap) sq = lerp(1.2, 1.26, Ez.out((T - tTrap + 0.12) / 0.12));
    else if (T < tTrap + 0.07) sq = lerp(1.26, 0.8, Ez.in((T - tTrap) / 0.07));
    else sq = lerp(0.8, 1, Ez.outElastic(clamp((T - tTrap - 0.07) / 0.75)));
    const psy = psyAt(T);
    sq *= 1 - (T > tTrap + 0.4 ? 0.022 * kick(T, 7) : 0) + psy * 0.045 * Math.sin(T * 5.3);
    const sy = 1 + (1 - sq) * 0.4 + psy * 0.04 * Math.sin(T * 4.1 + 1);
    return { x: RC[0], y: RC[1] + Math.sin(T * 1.7) * 8, sx: RSC * sq, sy: RSC * sy, r: Math.sin(T * 1.2) * 0.012 + psy * Math.sin(T * 2.3) * 0.03 };
  }
  const toWorld = (xf, px, py) => { const lx = (px - 500) * xf.sx, ly = (py - 290) * xf.sy, c = Math.cos(xf.r), s = Math.sin(xf.r); return [xf.x + lx * c - ly * s, xf.y + lx * s + ly * c]; };
  function roomCam(T) {
    const push1 = Ez.inOut(inv(26.25, 26.9, T)), pull = Ez.inOut(inv(27.18, 27.75, T));
    const chi = T >= tChi ? Math.exp(-(T - tChi) * 6) : 0, psy = psyAt(T);
    const z = 1 + 0.1 * push1 * (1 - pull) + 0.07 * chi - 0.16 * pull + 0.035 * kick(T, 8) * psy + (T > tShr ? 0.07 * Math.exp(-(T - tShr) * 5) : 0);
    const py = lerp(lerp(480, 560, push1), 480, pull);
    return { px: 960, py, z, r: psy * Math.sin(T * 1.9) * 0.035 };
  }
  const applyCam = (c) => camAt(c.px, c.py, c.px, c.py, c.z, c.r);

  function pipRoom(T) {
    const b = beatAt(T);
    let li = -1; for (let i = 0; i < SLIPS.length; i++) if (T >= SLIPS[i] + 0.1) li = i;
    const wk = li >= 0 ? T - (SLIPS[li] + 0.1) : 9, grab = wk < 0.34 ? Math.sin(Math.PI * clamp(wk / 0.34)) : 0;
    const jolt = T >= tTrap ? Math.exp(-(T - tTrap) * 6) : 0;
    const chi = T >= tChi ? Math.sin(Math.PI * clamp((T - tChi) / 0.5)) : 0;
    const bagJ = T >= tBag ? Math.sin(Math.PI * clamp((T - tBag) / 0.35)) : 0;
    const hold = sstep(28.5, 28.62, T) * (1 - sstep(tOf - 0.04, tOf + 0.04, T));   // Pip lifts a mushroom for a curious sniff
    const trip = sstep(tOf - 0.05, tOf + 0.1, T), float = sstep(tOf, tShr + 0.5, T);
    const side = li % 2 ? 1 : -1;
    let face = 'pf_neutral';
    if (T >= tTrap && T < tTrap + 0.4) face = 'pf_shock';
    else if (chi > 0.15) face = 'pf_shock';
    else if (T >= tTrap && T < tA) face = 'pf_nervous';
    else if (T >= tA && T < tBag) face = 'pf_scared';
    else if (T >= tBag && T < 28.5) face = 'pf_shock';
    else if (T >= 28.5 && T < tOf) face = 'pf_happy';
    if (T >= tOf) face = 'pf_dizzy';
    const work = (1 - trip) * (T < tA ? 1 : 1 - sstep(tA, tA + 0.1, T));
    const o = {
      face,
      armL: lerp(0.6, 1.55 + (side < 0 ? grab * 0.7 : 0) + jolt * 1.1 + chi * 1.0, work) + trip * (1.9 + Math.sin(T * 5) * 0.45) + (1 - work) * (1 - trip) * 0.4,
      armR: lerp(0.6, 1.55 + (side > 0 ? grab * 0.7 : 0) + jolt * 1.1 + chi * 1.0, work) + trip * (1.9 + Math.sin(T * 5 + 1.3) * 0.45) + hold * 1.4 + (1 - work) * (1 - trip) * 0.4 * (1 - hold),
      hop: jolt * 34 + bagJ * 30 + chi * 12 + float * 80 + Math.sin(T * 3) * 8 * float + (T < tOf ? hopB(T) * 4 : 0),
      r: trip * Math.sin(T * 3.1) * 0.16 - chi * 0.05,
      headR: (T < tOf ? Math.sin(b.ph * TAU) * 0.05 : Math.sin(T * 4.3) * 0.15) - (T >= tA && T < tBag + 0.1 ? 0.18 : 0),
      sq: 1 + jolt * -0.12 * Math.cos((T - tTrap) * 30),
    };
    return { x: 500, y: 456, s: 0.78, o, work, hold };
  }

  // everything that lives inside the box (room-sprite coords)
  function roomGroup(T, xf) {
    push(); translate(xf.x, xf.y); rotate(xf.r); scale(xf.sx, xf.sy); translate(-500, -290);
    const psy = psyAt(T);
    const wallC = mixc('#FFFFFF', cyc(T * 2.4), psy * 0.85), floorC = mixc('#FFFFFF', cyc(T * 2.4 + 2.5), psy * 0.7);
    sprC('s03_floor', 500, 290, floorC, { jit: 0.3 });
    sprC('s03_walls', 500, 290, wallC, { jit: 0.3 });
    // psychedelic back wall: rainbow stripes that march sideways
    if (psy > 0) {
      noStroke();
      const off = fract(T * 1.5) * 40;
      for (let k = -1; k < 10; k++) { const x0 = Math.max(302, 302 + k * 40 + off), x1 = Math.min(698, 302 + k * 40 + off + 40); if (x1 > x0) { fill(withAlphaCol(cyc(k * 0.7 - Math.floor(T * 1.5) * 0.7 + T * 0.8), psy * 0.5)); rect(x0, 171, x1 - x0, 215); } }
    }
    // wall clock (spins like mad once the shrooms kick in)
    const ca = T * (0.8 + psy * 14);
    segLine(612, 214, 612 + Math.cos(ca) * 16, 214 + Math.sin(ca) * 16, PAL.ink, 3); segLine(612, 214, 612 + Math.cos(ca * 0.2 - 1) * 11, 214 + Math.sin(ca * 0.2 - 1) * 11, PAL.ink, 4);
    // ceiling hatch opens on "a" and the bag drops through
    const hatch = sstep(tA - 0.1, tA - 0.02, T);
    if (hatch > 0) { flat([[448, 74], [552, 74], [546, 102], [454, 102]], PAL.ink); flat([[448, 102], [552, 102], [552 - 4, 102 + 40 * hatch], [448 + 4, 102 + 40 * hatch]], '#E2CCA8'); }
    // hanging bulb swings on the slam
    const sw = 0.05 * Math.sin(T * 2) + (T >= tTrap ? 0.32 * Math.exp(-(T - tTrap) * 2.2) * Math.sin((T - tTrap) * 9) : 0) + psy * 0.25 * Math.sin(T * 4);
    const bx = 500 + Math.sin(sw) * 80, by = 110 + Math.cos(sw) * 80;
    segLine(500, 110, bx, by, PAL.ink, 2.5);
    disc(bx, by + 32, 58, psy > 0 ? cyc(T * 3) : PAL.butterLt, 0.28 + 0.1 * kick(T, 6));
    spr('s03_bulb', bx, by, { r: -sw, s: 0.9 });
    // the padlock slams onto the IN door on "Trapped"
    if (T >= tTrap + 0.04) { const k = Ez.outBack(clamp((T - tTrap - 0.04) / 0.2), 2); spr('s03_lock', 172, 372 - (1 - k) * 60, { s: lerp(1.6, 0.52, k), r: (1 - k) * -0.7 + Math.sin((T - tTrap) * 14) * 0.08 * Math.exp(-(T - tTrap) * 3) }); }
    // mushrooms on the walls and floor behind the desk
    const front = (m) => m[1] >= 380 && m[1] <= 500 && m[0] >= 200 && m[0] <= 800;
    MUSH_IN.forEach((m, i) => { if (!front(m)) drawShroom(T, m[0], m[1], m[2], m[3], m[4], m[5], i); });
    // Pip behind the desk
    const pp = pipRoom(T);
    pip(pp.x, pp.y, pp.s, pp.o);
    spr('s03_desk', 500, 400, { s: 0.9, jit: 0.3 });
    // slip pile (with a paperclip) grows on the desk's left end
    let piled = 0; SLIPS.forEach((t) => { if (T > t + 0.45) piled++; });
    for (let i = 0; i < piled; i++) spr('s03_slip', 300 + RS(i, 91) * 6, 392 - i * 5, { s: 0.42, r: RS(i, 92) * 0.12, seed: i });
    if (piled) spr('paperclip', 282, 380 - piled * 5, { s: 0.2, r: 1.2 });
    // the giant rulebook; a page flips after each slip
    spr('s03_book', BOOK[0], BOOK[1], { s: 0.82, jit: 0.4 });
    SLIPS.forEach((t, i) => { const f = inv(t + 0.18, t + 0.42, T); if (f > 0 && f < 1) spr('s03_page', BOOK[0], BOOK[1] - 4 - Math.sin(Math.PI * f) * 36, { sx: Math.cos(Math.PI * f) * 0.82, sy: 0.82, seed: i }); });
    // hands on the book while working
    if (pp.work > 0.5) for (const sd of [-1, 1]) { const h = pipHand(sd, pp.x, pp.y, pp.s, pp.o); if (h[1] > 352) spr('s03_hand', h[0], h[1], { s: 0.78, seed: sd + 2 }); }
    // Pip's curious mushroom
    if (pp.hold > 0.01) { const h = pipHand(1, pp.x, pp.y, pp.s, pp.o); spr('s03_sh0', h[0], h[1] + 8, { s: 0.34 * pp.hold, r: 0.2 }); }
    // the bag: falls through the hatch on "a", plops onto the desk on "bag"
    if (T > tA - 0.08) {
      const u = inv(tA - 0.08, tBag, T), la = T - tBag;
      const y = lerp(150, 400, Ez.in(u));
      const sy = la < 0 ? 1 + 0.18 * u : 1 - 0.28 * Math.exp(-la * 7) * Math.cos(la * 26);
      spr('s03_bag', 694, y, { s: 0.74, sx: 1 / Math.sqrt(sy), sy, r: la < 0 ? (1 - u) * 0.4 : 0, jit: 0.5 });
      if (la > 0 && la < 0.6) for (const d of [-1, 1]) spr('puff', 694 + d * (70 + la * 180), 395 - la * 40, { s: 0.2 + la * 0.5, a: 1 - la / 0.6, seed: d + 5 });
    }
    // mushrooms on the desk, the book and the bag (in front)
    MUSH_IN.forEach((m, i) => { if (front(m)) drawShroom(T, m[0], m[1], m[2], m[3], m[4], m[5], i); });
    if (T > SPROUT[0]) drawShroom(T, 694, 400 - 250 * 0.74, 0.1, 0.6, 0, 0, 40);
    // the glyph fountain on "Chinese"
    const ca2 = T - tChi;
    if (ca2 > -0.02 && ca2 < 1.2) {
      for (let i = 0; i < 16; i++) {
        const a = Math.max(0, ca2), side = i % 2 ? 1 : -1, ang = -Math.PI / 2 + side * (0.45 + R(i, 81) * 0.9), sp = 700 + R(i, 82) * 500;
        const gx = BOOK[0] + side * 150 + Math.cos(ang) * sp * a, gy = BOOK[1] - 20 + Math.sin(ang) * sp * a + 800 * a * a;
        glyph(i % 9, gx, gy, (0.3 + R(i, 83) * 0.3) * Ez.outBack(clamp(a / 0.15)), [PAL.red, PAL.coralDk, PAL.gold, PAL.blue][i % 4], 1 - inv(0.7, 1.1, a), a * 6 * RS(i, 84));
      }
      for (let j = 0; j < 2; j++) { // 中文 rises big and hangs above the book
        const k = Ez.outBack(clamp(ca2 / 0.25), 1.8), a = 1 - inv(0.55, 0.85, ca2);
        const gx = BOOK[0] + (j ? 62 : -62), gy = BOOK[1] - 60 - 215 * k;
        disc(gx, gy, 56 * k, PAL.butterLt, 0.85 * a);
        glyph(j, gx, gy, 1.0 * k, PAL.red, a, Math.sin(T * 8 + j) * 0.08);
      }
    }
    // inside legs of the slips: IN slot -> book, then the answer: book -> OUT slot
    SLIPS.forEach((t, i) => {
      const v = inv(t, t + 0.2, T);
      if (T >= t && T < t + 0.45) { const tx = BOOK[0] - 60 + i * 12, ty = BOOK[1] - 26; drawSlip(lerp(SLOT_L[0], tx, Ez.out(v)), lerp(SLOT_L[1], ty, v) - Math.sin(Math.PI * v) * 90, lerp(0.55, 0.62, v), (1 - v) * 5 + RS(i, 93) * 0.2, SLIP_IN[i % 5], 1 - inv(0.36, 0.45, T - t)); }
      const w2 = inv(t + 0.22, t + 0.4, T);
      if (w2 > 0 && w2 < 1) drawSlip(lerp(BOOK[0] + 60, SLOT_R[0], Ez.in(w2)), lerp(BOOK[1] - 30, SLOT_R[1], w2) - Math.sin(Math.PI * w2) * 80, 0.6, -w2 * 4, SLIP_OUT[i % 5]);
    });
    pop();
  }

  function roomShot(s) {
    const T = s.T;
    const xf = roomXf(T), cm = roomCam(T), psy = psyAt(T), m = meltAt(T);
    // the void (screen space, slight parallax)
    spr('s03_void', 960 + Math.sin(T * 0.4) * 10, 540, { s: 2.1 + (cm.z - 1) * 0.3, jit: 0 });
    push(); applyCam(cm);
    // drifting glyph-stars in the void
    for (let i = 0; i < 16; i++) {
      const x = fract(R(i, 11) + T * 0.012 * (1 + R(i, 12))) * 2300 - 190, y = 40 + R(i, 13) * 1000;
      glyph(i % 9, x, y, 0.3 + R(i, 14) * 0.35, psy > 0 ? cyc(i * 0.4 + T * 2) : PAL.lilacLt, 0.28 + 0.2 * Math.sin(T * 2 + i) + psy * 0.4, T * 0.2 * RS(i, 15));
    }
    // kaleidoscope rings and petals bloom behind the box
    if (psy > 0) {
      for (let i = 0; i < 12; i++) { const f = fract(T * 0.6 + i / 12); ringLine(RC[0], RC[1], 140 + f * 1300, cyc(i * 0.8 + T * 1.5), 26 + f * 44, psy * 0.6 * (1 - f)); }
      noStroke();
      for (let ring = 0; ring < 2; ring++) {
        const n = 12 + ring * 6, rad = 640 + ring * 280, rot = T * (ring ? -0.5 : 0.45);
        for (let k = 0; k < n; k++) { const a = rot + (k / n) * TAU; push(); translate(RC[0] + Math.cos(a) * rad, RC[1] + Math.sin(a) * rad * 0.8); rotate(a); fill(withAlphaCol(cyc(k * 0.5 + T * 2 + ring), psy * 0.5)); ellipse(0, 0, 150 + ring * 50, 50 + ring * 18); pop(); }
      }
    }
    // soft glow under the floating box
    disc(xf.x, xf.y + 330 * xf.sy, 380 * xf.sx, '#3B2E7A', 0.35);
    // outside legs of the slips (drawn behind the box, so they vanish into / emerge from its walls)
    SLIPS.forEach((t, i) => {
      const u = inv(t - 0.32, t, T);
      if (u > 0 && u < 1) { const e = toWorld(xf, 40, SLOT_L[1]), sx = -140, sy = 200 + R(i, 94) * 420; drawSlip(lerp(sx, e[0], Ez.in(u)), lerp(sy, e[1], u) - Math.sin(Math.PI * u) * 60, 0.7, u * 7 + i, SLIP_IN[i % 5]); }
      const w = inv(t + 0.4, t + 0.72, T);
      if (w > 0 && w <= 1) { const e = toWorld(xf, 960, SLOT_R[1]), c = [1690, 520 + Math.sin((t + 0.72) * 1.5) * 14]; drawSlip(lerp(e[0], c[0], Ez.out(w)), lerp(e[1], c[1], w) - Math.sin(Math.PI * w) * 70, 0.7, -w * 6, SLIP_OUT[i % 5], 1 - inv(0.85, 1, w)); }
    });
    // big mushrooms float in the void once the trip starts
    MUSH_OUT.forEach((mm, i) => { push(); translate(Math.sin(T * 1.3 + i) * 14, Math.cos(T * 1.1 + i) * 12); drawShroom(T, mm[0], mm[1], mm[2] + Math.sin(T * 1.7 + i) * 0.15, mm[3], mm[4], mm[5], i + 50); pop(); });
    // the room itself (re-rendered into a buffer and drawn back as stretching strips once it melts)
    if (m <= 0) roomGroup(T, xf);
    pop();
    if (m > 0) {
      const fb = SPR.s03_meltfb.fbs[0];
      fb.draw(() => { clear(); push(); translate(-W / 2, -H / 2); applyCam(cm); roomGroup(T, xf); pop(); });
      const top = Math.max(0, cm.py + (xf.y - 300 * xf.sy - cm.py) * cm.z);
      // one textured strip mesh: every column keeps its top and sags by its own amount, so the drips have smooth rounded tongues
      const N = 96;
      push(); noStroke(); textureMode(NORMAL); texture(fb);
      beginShape(TRIANGLE_STRIP);
      for (let i = 0; i <= N; i++) {
        let d = 140 + 220 * (0.5 + 0.5 * vnoise(i * 0.18, 7));
        for (const [c, len, wd] of DRIPS) { const q = (i - c) / wd; d += len * Math.exp(-q * q) * (1 + 0.12 * Math.sin(T * 5 + c)); }
        d *= m * m;
        const x = (i / N) * W;
        vertex(x, top, 0, i / N, top / H); vertex(x, H + d, 0, i / N, 1);
      }
      endShape();
      textureMode(IMAGE); pop();
    }
    // Clawd floats outside the OUT slot, catching answers (and trips out too)
    push(); applyCam(cm);
    let ci = -1; SLIPS.forEach((t, i) => { if (T >= t + 0.72) ci = i; });
    const ca = ci >= 0 ? T - (SLIPS[ci] + 0.72) : 9, catchK = ca < 0.3 ? Math.sin((Math.PI * ca) / 0.3) : 0;
    const cx = 1718, cy = 590 + Math.sin(T * 1.5) * 14;
    const cTrip = T >= tShr;
    clawd(cx, cy, 0.42, {
      eyes: cTrip ? 'ce_spiral' : T >= tRoom && T < tRoom + 0.5 ? 'ce_heart' : ca < 0.4 ? 'ce_happy' : 'ce_sq',
      armL: -0.6 - catchK * 1.4 + (cTrip ? Math.sin(T * 8) * 0.8 : 0), armR: -0.6 - catchK * 1.4 - (cTrip ? Math.sin(T * 8) * 0.8 : 0),
      r: Math.sin(T * 1.2) * 0.12 + (cTrip ? (T - tShr) * 3 : 0), hop: catchK * 16, seed: 5, blush: T >= tRoom && T < tRoom + 0.6,
    });
    if (ci >= 0 && ca < 0.5) spr('heart', cx + 40, cy - 190 - ca * 120, { s: 0.35 * Math.sin(Math.PI * clamp(ca / 0.5)), seed: ci });
    // "Trapped": motion streaks as the walls slam in, then dust bursts from the box's corners
    if (T > tTrap - 0.05 && T < tTrap + 0.1) for (const sd of [-1, 1]) { const e = toWorld(xf, sd < 0 ? 12 : 988, 290); for (let k = 0; k < 5; k++) segLine(e[0] - sd * (30 + k * 26), e[1] - 200 + k * 100, e[0] - sd * (110 + k * 26), e[1] - 200 + k * 100, '#FFFFFF', 5, 0.7); }
    const da = T - tTrap - 0.07;
    if (da > 0 && da < 0.5) for (const [px, py] of [[12, 12], [988, 12], [12, 568], [988, 568]]) { const e = toWorld(xf, px, py); for (let k = 0; k < 4; k++) { const a = Math.atan2(py - 290, px - 500) + RS(k + px, 3) * 0.7, d = 60 + 200 * Ez.out(da / 0.5) * (0.5 + R(k + py, 4)); sprC('puff', e[0] + Math.cos(a) * d, e[1] + Math.sin(a) * d, PAL.lilacLt, { s: 0.28 * (1 - da / 0.5 * 0.4), a: 0.85 * (1 - da / 0.5), seed: k, r: da * 4 }); } }
    pop();
    // the FOOM smoke's rim, riding the edge of the clearing hole (hides the mask edge), then drifting off
    const p7 = (T - (tTrap - TIN7.d * TIN7.at)) / TIN7.d;
    if (p7 < 1.6) {
      const r = holeR(p7) + (p7 > 1 ? (p7 - 1) * 900 : 0), fade = 1 - inv(1, 1.6, p7);
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + 0.2; sprC('puff', HOLE_C[0] + Math.cos(a) * (r + 70), HOLE_C[1] + Math.sin(a) * (r + 70) * 0.9, ['#FFFFFF', PAL.pinkLt, PAL.lilacLt][i % 3], { s: 1.5 + r / 620, a: fade, seed: i, r: i }); }
    }
    // paint starts running down from the top of frame as the room melts (meets the S04 drip transition)
    for (let i = 0; i < 18; i++) {
      const t0 = tShr + 0.08 + R(i, 71) * 0.3, u = inv(t0, t0 + 0.9, T); if (u <= 0) continue;
      const x = (i + 0.5) * (W / 18) + RS(i, 72) * 30;
      sprC('s03_drip', x, -30, cyc(i * 0.6 + T * 1.5), { s: 0.6 + R(i, 74) * 0.4, sy: Ez.out(u) * (0.45 + R(i, 73) * 0.8), jit: 0.3, seed: i });
    }
  }

  shot({
    id: 'L7-room', t0: 25.96,
    // FOOM smoke clears into the void: a cloud-edged hole opens from the middle out (its rim puffs are drawn in roomShot)
    tin: {
      type: 'mask', d: TIN7.d, at: TIN7.at,
      mask(p) {
        const r = holeR(p);
        disc(HOLE_C[0], HOLE_C[1], r, '#FFFFFF');
        for (let j = 0; j < 9; j++) { const a = (j / 9) * TAU; disc(HOLE_C[0] + Math.cos(a) * r * 0.75, HOLE_C[1] + Math.sin(a) * r * 0.7, r * 0.42, '#FFFFFF'); }
      },
    },
    draw: roomShot,
  });
  shot({ id: 'L8-shrooms', t0: 27.76, tin: { type: 'cut', d: 0 }, draw: roomShot });
  lyr(7, { y: 1000, size: 70, maxW: 1500, words: { 0: { anim: 'shake', size: 86, fill: PAL.coralLt, jitter: 3 }, 3: { fill: PAL.red, anim: 'zoom' }, 4: { anim: 'drop' } } });
  lyr(8, { y: 140, size: 72, maxW: 1500, gap: 0.45, words: { 2: { anim: 'drop', fill: '#E9C08F' }, 4: { anim: 'zoom', fill: PAL.pink, wave: 10, size: 90 } } }); // sized up front so the layout leaves room
})();

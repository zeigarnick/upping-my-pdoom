// s04.js - S04 "Shoggoth and shinigami eyes" (29.60-35.50), lyric lines L9-L10.
// L9: a sweet pastel blob in a candy meadow; Pip peers through a big magnifying glass and the lens (clip)
//     shows the truth: a dark-teal many-eyed shoggoth in a spooky night. The tiny smiley mask pops off on
//     "lies" and the truth floods out of the lens. Pip hides behind the glass (magnified scared face).
//     Push in to the shoggoth's big eye, which blinks shut: blink match cut into Clawd's red eye.
// L10: Clawd on a deep-red watercolor night with a red moon and drifting black feathers; red scanning
//      beams sweep the distant shoggoth, glyphs and numbers burst above it on "shinigami"; on "eyes" the
//      camera rushes into one glowing red eye centred at (960, 500) for the S05 iris.
(() => {
  // ================= local paint helpers =================
  // p5.brush commits a pending op only when the next op runs, so trim() flushes before erasing.
  // Brush fills also turn transparent pixels under their bleed into opaque paper white. Props like the mask keep that
  // cut-paper rim (house style); pieces that must blend (the bodies the tentacles grow from, eyes, beads, sky, hills,
  // glyphs, the close-up eye) are trimmed to their silhouettes, and dark grounds get a flat base.
  const DBG = false;
  function flush() { brush.set('pen', '#010203', 0.5); brush.line(-400, -400, -399, -400); brush.noStroke(); brush.noFill(); }
  const areaOf = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; };
  // keep only the inside of the polygons (even-odd: nested polygons make rings)
  function trim(polys, w, h) {
    flush();
    const t0 = performance.now();
    erase(); noStroke(); fill(255);
    beginShape(); vertex(-20, -20); vertex(w + 20, -20); vertex(w + 20, h + 20); vertex(-20, h + 20);
    for (const p of polys) { beginContour(); for (const v of (areaOf(p) > 0 ? p.slice().reverse() : p)) vertex(v[0], v[1]); endContour(); }
    endShape(CLOSE); noErase();
    if (DBG) console.log('[s04 paint] trim ' + w + 'x' + h + ' ' + (performance.now() - t0).toFixed(0) + 'ms');
  }
  // keep the union of overlapping polygons (scanline erase of the gaps)
  function trimUnion(polys, w, h, step = 1) {
    flush();
    const t0 = performance.now();
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
    if (DBG) console.log('[s04 paint] trimUnion ' + w + 'x' + h + ' ' + (performance.now() - t0).toFixed(0) + 'ms');
  }
  const circ = (x, y, r, n = 48) => ellPts(x, y, r, r, n);
  const fullRect = (w, h, c) => flat([[-20, -20], [w + 20, -20], [w + 20, h + 20], [-20, h + 20]], c);
  const segPoly = (x1, y1, x2, y2, hw) => { const d = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (-(y2 - y1) / d) * hw, ny = ((x2 - x1) / d) * hw; return [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]; };
  // scratch batches, filled and flushed within a single draw call (no state survives between frames)
  const QB = [];
  function qLine(x1, y1, x2, y2, w) { const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, nx = (-dy / d) * w * 0.5, ny = (dx / d) * w * 0.5; QB.push([x1 + nx, y1 + ny, x2 + nx, y2 + ny, x2 - nx, y2 - ny, x1 - nx, y1 - ny]); }
  function qArc(cx, cy, rx, ry, a0, a1, w, n = 6) { let px = cx + Math.cos(a0) * rx, py = cy + Math.sin(a0) * ry; for (let i = 1; i <= n; i++) { const a = lerp(a0, a1, i / n), x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; qLine(px, py, x, y, w); px = x; py = y; } }
  function qFlush(c) {
    if (!QB.length) return;
    noStroke(); fill(c); beginShape(TRIANGLES);
    for (const q of QB) { vertex(q[0], q[1]); vertex(q[2], q[3]); vertex(q[4], q[5]); vertex(q[0], q[1]); vertex(q[4], q[5]); vertex(q[6], q[7]); }
    endShape(); QB.length = 0;
  }
  function def(name, w, h, fn, o) {
    defSprite(name, w, h, (v, ww, hh) => {
      const t0 = performance.now();
      fn(v, ww, hh);
      if (DBG) console.log('[s04 paint] ' + name + '#' + v + ' ' + (performance.now() - t0).toFixed(0) + 'ms');
    }, o);
  }

  // ================= shared constants =================
  const T_MD = mixc(PAL.teal, PAL.ink, 0.3);
  const T_DK = mixc(PAL.teal, PAL.ink, 0.5);
  const T_DKR = mixc(PAL.teal, PAL.ink, 0.72);
  const T_HI = mixc(PAL.teal, PAL.mint, 0.55);
  const RED_DK = mixc(PAL.red, PAL.ink, 0.62);
  const RED_MD = mixc(PAL.red, PAL.ink, 0.35);
  const RED_HOT = '#FF4D63';
  const GLY = '#FFE3E8';
  const SIL = '#16303A'; // distant silhouette colour (deep teal)

  const wSee = wordT(9, 0), wThrough = wordT(9, 1), wShog = wordT(9, 3), wLies = wordT(9, 4);
  const wWith = wordT(10, 0), wYour = wordT(10, 1), wShin = wordT(10, 2), wEyes = wordT(10, 3);

  // ================= L9 geometry (world = screen at zoom 1) =================
  const BX = 860, BY = 590, BRX = 385, BRY = 340, GROUND = 920;
  const SBW = 940, SBH = 800, SCX = 470, SCY = 410; // body sprite size and the body centre inside it
  const MASK = [872, 632];
  const BIG = { x: 860, y: 372, r: 80 };
  const PS = 1.2, PGY = 1012; // Pip scale and ground
  const LENS_R = 190;

  const truthK = (a) => 1 + 0.07 * Math.sin(5 * a + 1) + 0.05 * Math.sin(9 * a + 2.3) + 0.035 * Math.sin(14 * a + 0.7);
  function truthPts(cx, cy, g = 0) {
    const pts = [];
    const bot = cy + BRY * 0.9;
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * TAU;
      const k = truthK(a);
      let x = cx + Math.cos(a) * (BRX * k + g), y = cy + Math.sin(a) * (BRY * k + g);
      if (y > bot + g) { y = bot + g + (y - bot - g) * 0.22; x = cx + (x - cx) * 1.06; }
      pts.push([x, y]);
    }
    return pts;
  }
  function sweetPts(cx, cy, g = 0) {
    const pts = [];
    const bot = cy + 20 + 292 + g;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU;
      const x = cx + Math.cos(a) * (350 * (1 + 0.025 * Math.sin(3 * a + 0.4)) + g);
      let y = cy + 20 + Math.sin(a) * (312 + g);
      if (y > bot) y = bot + (y - bot) * 0.2;
      pts.push([x, y]);
    }
    return pts;
  }
  function inBody(x, y, m) { const dx = (x - BX) / BRX, dy = (y - BY) / BRY; return Math.hypot(dx, dy) < truthK(Math.atan2(dy, dx)) * m; }

  // eyes: a few hand-placed along the lens path, the rest scattered deterministically
  const EYES = [];
  const addEye = (x, y, r) => EYES.push({ x, y, r, i: EYES.length });
  for (const [x, y, r] of [[1000, 724, 38], [1090, 800, 22], [938, 816, 19], [1080, 650, 22], [690, 490, 44], [1020, 488, 40], [620, 660, 30], [764, 790, 28], [1160, 580, 32], [950, 584, 24]]) addEye(x, y, r);
  for (let k = 0; EYES.length < 30 && k < 4000; k++) {
    const x = BX + RS(k, 61) * BRX, y = BY + RS(k, 62) * BRY, r = 13 + Math.pow(R(k, 63), 1.6) * 30;
    if (!inBody(x, y, 0.8) || y > GROUND - 60) continue;
    if (Math.hypot(x - MASK[0], y - MASK[1]) < 64 + r) continue;
    if (Math.hypot(x - BIG.x, y - BIG.y) < BIG.r + r + 16) continue;
    if (EYES.some((e) => Math.hypot(e.x - x, e.y - y) < e.r + r + 10)) continue;
    addEye(x, y, r);
  }
  const UNDER = [[850, 626, 11], [893, 619, 13], [872, 652, 9]];
  const TENTS = [
    { x: 488, y: 740, a: Math.PI - 0.1, len: 330, n: 15, r0: 34, curl: 1.5, ph: 0.0 },
    { x: 512, y: 450, a: Math.PI + 0.55, len: 290, n: 14, r0: 30, curl: 1.3, ph: 1.3 },
    { x: 690, y: 262, a: -Math.PI / 2 - 1.15, len: 215, n: 11, r0: 27, curl: -1.3, ph: 2.1 },
    { x: 1040, y: 262, a: -Math.PI / 2 + 1.1, len: 225, n: 11, r0: 27, curl: 1.4, ph: 0.7, clip: true },
    { x: 1232, y: 470, a: -0.45, len: 300, n: 14, r0: 30, curl: -1.2, ph: 2.8 },
    { x: 1236, y: 780, a: 0.05, len: 300, n: 15, r0: 32, curl: -1.1, ph: 1.9, hi: true },
  ];
  const FLOW = [[420, 1000, 0], [548, 1046, 1], [706, 1004, 2], [1012, 1044, 0], [1148, 1000, 1], [1262, 1050, 2], [612, 950, 1], [1216, 948, 0]];
  const WAVE = [31.626, 32.09];

  // ================= L9 sprites =================
  def('s04_sweet_bg', 1000, 580, () => {
    fullRect(1000, 580, '#FBE3EE');
    gradRect(-20, -20, 1040, 300, lite(PAL.lilacLt, 0.2), '#FBE3EE');
    wash(-40, -40, 1080, 660, PAL.pinkLt, 140, 0.1);
    blob(830, 105, 70, PAL.butterLt, 220, 0.3);
    blob(830, 105, 44, '#FFFFFF', 170, 0.2);
    const RB = [PAL.pink, PAL.orange, PAL.butter, PAL.mint, PAL.sky, PAL.lilac];
    for (let k = 0; k < RB.length; k++) {
      const r0 = 345 - k * 19, r1 = r0 - 19, pts = [];
      for (let i = 0; i <= 36; i++) { const a = Math.PI + (i / 36) * Math.PI; pts.push([430 + Math.cos(a) * r0, 460 + Math.sin(a) * r0]); }
      for (let i = 36; i >= 0; i--) { const a = Math.PI + (i / 36) * Math.PI; pts.push([430 + Math.cos(a) * r1, 460 + Math.sin(a) * r1]); }
      wc(RB[k], 125, 0.03, 0.4, 0.5); brush.polygon(pts);
    }
    for (const [x, y, r] of [[160, 146, 66], [735, 58, 52], [955, 205, 44]]) { flat(ellPts(x, y + r * 0.2, r * 1.3, r * 0.55, 24), '#FFFFFF', 0.75); blob(x, y, r, '#FFFFFF', 200, 0.15); }
    const g = [[-40, 460]];
    for (let x = 0; x <= 1040; x += 40) g.push([x, 448 + Math.sin(x * 0.012) * 10 + Math.sin(x * 0.031) * 5]);
    g.push([1040, 640], [-40, 640]);
    paint(g, PAL.grass, { baseC: PAL.mintLt, a: 110, lw: 1.8 });
    for (let i = 0; i < 44; i++) flat(circ(random(0, 1000), random(474, 575), random(2, 4.5), 10), [PAL.pink, PAL.butter, '#FFFFFF', PAL.lilac][i % 4], 0.85);
  });
  def('s04_truth_bg', 1000, 580, () => {
    fullRect(1000, 580, PAL.night);
    wash(-40, -40, 1080, 660, PAL.night, 150, 0.08);
    blob(250, 210, 250, PAL.nightLt, 120, 0.4);
    blob(770, 150, 220, mixc(PAL.night, PAL.teal, 0.35), 110, 0.4);
    blob(480, 360, 300, mixc(PAL.lilac, PAL.night, 0.7), 70, 0.4);
    blob(130, 92, 50, mixc(PAL.mintLt, PAL.butterLt, 0.5), 225, 0.2);
    blob(112, 82, 40, PAL.night, 170, 0.15);
    for (let i = 0; i < 46; i++) flat(circ(random(0, 1000), random(0, 400), random(1, 2.6), 8), '#FFFFFF', random(0.45, 0.9));
    const g = [[-40, 460]];
    for (let x = 0; x <= 1040; x += 40) g.push([x, 446 + Math.sin(x * 0.014 + 2) * 12 + Math.sin(x * 0.04) * 5]);
    g.push([1040, 640], [-40, 640]);
    paint(g, T_DKR, { baseC: mixc(T_DKR, PAL.night, 0.4), a: 150, lw: 1.8 });
    for (let i = 0; i < 16; i++) flat(ellPts(random(0, 1000), random(480, 570), random(8, 20), random(3, 6), 16), PAL.mint, 0.22);
  });
  const PETALS = []; for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; const r = 25 + 9 * Math.cos(5 * a); PETALS.push([52 + Math.cos(a) * r, 52 + Math.sin(a) * r]); }
  const MS = [MASK[0] - BX + SCX, MASK[1] - BY + SCY]; // mask position inside the body sprite
  const CROWN = [[-74, PAL.pink], [0, PAL.butter], [74, PAL.sky]].map(([dx, c]) => [SCX + dx, SCY - 278 + Math.abs(dx) * 0.3, c]);
  def('s04_sbody', SBW, SBH, () => {
    for (const s of [-1, 1]) paint(ellPts(SCX + s * 150, SCY + 318, 64, 30, 28), PAL.mint, { baseC: PAL.mintLt, lw: 2 });
    paint(sweetPts(SCX, SCY), PAL.mint, { baseC: PAL.mintLt, a: 130, lw: 2.6 });
    blob(SCX - 170, SCY - 140, 110, '#FFFFFF', 120, 0.3);
    paint(starPts(SCX - 200, SCY - 170, 26, 7, 4), '#FFFFFF', { baseC: '#FFFFFF', line: false });
    blob(SCX + 70, SCY + 210, 180, mixc(PAL.mint, PAL.teal, 0.25), 60, 0.3);
    for (const s of [-1, 1]) blob(MS[0] + s * 104, MS[1] + 22, 30, PAL.pink, 130, 0.25);
    const dots = [[-230, -40], [-130, 70], [150, -110], [240, 40], [60, 200], [-200, 170], [230, 200], [-60, -170], [150, 110], [-260, 90]];
    dots.forEach(([dx, dy], i) => flat(circ(SCX + dx, SCY + dy, 12, 16), [PAL.pinkLt, PAL.butterLt, PAL.skyLt][i % 3], 0.9));
    for (const [fx, fy, c] of CROWN) {
      paint(PETALS.map(([x, y]) => [x - 52 + fx, y - 52 + fy]), c, { baseC: lite(c, 0.4), lw: 1.3 });
      flat(circ(fx, fy, 10, 16), c === PAL.butter ? PAL.orange : PAL.butter);
    }
    trimUnion([sweetPts(SCX, SCY, -0.5), ...[-1, 1].map((s) => ellPts(SCX + s * 150, SCY + 318, 63.5, 29.5, 28)), ...CROWN.map(([fx, fy]) => PETALS.map(([x, y]) => [x - 52 + fx, y - 52 + fy]))], SBW, SBH, 2);
  }, { v: 1, ax: 0.5, ay: SCY / SBH });
  def('s04_sarm', 130, 100, () => { paint(ellPts(62, 50, 46, 30, 28), PAL.mint, { baseC: PAL.mintLt, lw: 2 }); blob(80, 42, 10, '#FFFFFF', 140, 0.2); trim([ellPts(62, 50, 45.5, 29.5, 28)], 130, 100); }, { v: 2, ax: 0.22, ay: 0.5 });
  def('s04_tbody', SBW, SBH, () => {
    const pts = truthPts(SCX, SCY);
    paint(pts, T_MD, { baseC: T_DK, a: 150, lw: 2.6, tex: 0.6 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + random(-0.4, 0.4), rr = random(0.25, 0.55);
      blob(SCX + Math.cos(a) * BRX * rr, SCY - 30 + Math.sin(a) * BRY * rr, random(90, 130), T_HI, 40, 0.3);
    }
    blob(SCX, SCY + 190, 170, T_DKR, 80, 0.3);
    pen(PAL.ink, 1.3, '2B');
    for (let i = 0; i < 12; i++) {
      const a = random(TAU), rr = random(0.3, 0.75), x = SCX + Math.cos(a) * BRX * rr, y = SCY + Math.sin(a) * BRY * rr, s = random(30, 60);
      brush.spline([[x - s, y + s * 0.2], [x, y - s * 0.25], [x + s, y + s * 0.2]], 0.5);
    }
    brush.noStroke();
    for (let i = 0; i < 26; i++) { const a = random(TAU), rr = random(0, 0.8); flat(circ(SCX + Math.cos(a) * BRX * rr, SCY + Math.sin(a) * BRY * rr, random(2.5, 5.5), 10), PAL.mint, 0.7); }
    for (const [x, y, r] of [[-220, -170, 34], [-60, -290, 26], [150, -250, 30], [270, -80, 22]]) { flat(ellPts(SCX + x, SCY + y, r, r * 0.7, 20), '#FFFFFF', 0.16); flat(ellPts(SCX + x - r * 0.25, SCY + y - r * 0.2, r * 0.35, r * 0.22, 12), '#FFFFFF', 0.35); }
    trim([truthPts(SCX, SCY, -0.5)], SBW, SBH); // tentacles must join the body seamlessly
  }, { v: 2, ax: 0.5, ay: SCY / SBH });
  def('s04_eye', 120, 120, () => {
    paint(circ(60, 60, 46, 36), '#FFFFFF', { baseC: '#FFFFFF', a: 90, lw: 2.4 });
    blob(62, 78, 24, PAL.mintLt, 90, 0.2);
    trim([circ(60, 60, 46, 36)], 120, 120);
  }, { v: 2 });
  def('s04_iris', 70, 70, (v) => {
    const c = [PAL.butter, PAL.pink, PAL.mint][v];
    paint(circ(35, 35, 24, 24), c, { baseC: lite(c, 0.2), lw: 1.4 });
    flat(circ(35, 36, 12, 20), PAL.black);
    flat(circ(29, 29, 5, 12), '#FFFFFF');
    trim([circ(35, 35, 24, 24)], 70, 70);
  }, { v: 3 });
  def('s04_bigeye', 560, 560, () => {
    paint(circ(280, 280, 250, 72), '#FFFFFF', { baseC: '#FFFFFF', a: 90, lw: 3.6 });
    blob(290, 390, 140, PAL.mintLt, 90, 0.3);
    trim([circ(280, 280, 250, 72)], 560, 560);
  });
  def('s04_bigiris', 320, 320, () => {
    paint(circ(160, 160, 140, 64), PAL.gold, { baseC: PAL.butter, a: 150, lw: 2.6 });
    blob(160, 190, 90, PAL.orange, 70, 0.3);
    pen(PAL.orange, 2.2, 'pen');
    for (let k = 0; k < 30; k++) { const a = (k / 30) * TAU; brush.line(160 + Math.cos(a) * 60, 160 + Math.sin(a) * 60, 160 + Math.cos(a) * 128, 160 + Math.sin(a) * 128); }
    brush.noStroke();
    trim([circ(160, 160, 140, 64)], 320, 320);
  });
  def('s04_bead', 90, 90, () => {
    paint(circ(45, 45, 32, 28), T_MD, { baseC: T_DK, line: false });
    blob(38, 36, 11, T_HI, 100, 0.2);
    trim([circ(45, 45, 31.5, 28)], 90, 90);
  }, { v: 2 });
  def('s04_beadS', 90, 90, () => {
    paint(circ(45, 45, 32, 28), T_MD, { baseC: T_DK, line: false });
    blob(38, 36, 11, T_HI, 100, 0.2);
    flat(ellPts(45, 64, 11, 8, 16), PAL.inkSoft); flat(ellPts(45, 64, 8.5, 6, 16), PAL.lilacLt); flat(ellPts(45, 64, 3.2, 2.4, 10), PAL.inkSoft);
    trim([circ(45, 45, 31.5, 28)], 90, 90);
  }, { v: 2 });
  def('s04_mask', 180, 180, () => {
    pen(PAL.ink, 2, 'pen'); brush.line(24, 86, 6, 74); brush.line(156, 86, 174, 74); brush.noStroke();
    paint(ellPts(90, 90, 66, 64, 40), PAL.butter, { baseC: '#FFE680', lw: 2.6 });
    blob(64, 62, 13, '#FFFFFF', 150, 0.2);
    flat(ellPts(68, 80, 7, 11, 16), PAL.ink); flat(ellPts(112, 80, 7, 11, 16), PAL.ink);
    blob(50, 104, 11, PAL.pink, 160, 0.2); blob(130, 104, 11, PAL.pink, 160, 0.2);
    strokePath([[60, 106], [90, 128], [120, 106]], PAL.ink, 3.6, 'pen', 0.5);
  }, { v: 2 });
  def('s04_flower', 100, 170, (v) => {
    const c = [PAL.pink, PAL.butter, PAL.sky][v];
    strokePath([[50, 165], [46, 118], [52, 70]], PAL.grassDk, 4, 'marker', 0.5);
    paint([[48, 124], [82, 106], [58, 134]], PAL.grass, { baseC: lite(PAL.grass, 0.3), lw: 1.2 });
    paint(PETALS, c, { baseC: lite(c, 0.4), lw: 1.3 });
    flat(circ(52, 52, 10, 16), v === 1 ? PAL.orange : PAL.butter);
    trimUnion([PETALS, [[46, 60], [56, 60], [55, 168], [45, 168]], [[46, 124], [83, 105], [58, 135]]], 100, 170);
  }, { v: 3, ay: 0.95 });
  const STALK = [[26, 176], [22, 130], [30, 80], [33, 40], [41, 38], [42, 80], [38, 130], [44, 176]];
  def('s04_stalk', 70, 180, () => { paint(STALK, T_MD, { baseC: T_DK, lw: 1.6 }); trim([STALK], 70, 180); }, { v: 2, ay: 0.97 });
  def('s04_rim', 480, 480, () => {
    pen(mixc(PAL.gold, PAL.brown, 0.35), 11, 'marker'); brush.circle(240, 240, 203);
    pen(PAL.gold, 6, 'marker'); brush.circle(240, 240, 200);
    pen(PAL.ink, 2.4, '2B'); brush.circle(240, 240, 215); brush.circle(240, 240, 190);
    brush.noStroke();
    trim([circ(240, 240, 215.5, 72), circ(240, 240, 189.5, 72)], 480, 480);
  }, { v: 2 });
  def('s04_handle', 90, 300, () => {
    paint(rrPts(27, 40, 36, 250, 16), PAL.brown, { baseC: PAL.brownLt, lw: 2 });
    pen(PAL.ink, 1.4, 'pen');
    for (let k = 0; k < 4; k++) brush.line(29, 150 + k * 22, 61, 146 + k * 22);
    brush.noStroke();
    paint(rrPts(20, 8, 50, 44, 10), PAL.gold, { baseC: PAL.butter, lw: 1.8 });
    trimUnion([rrPts(27, 40, 36, 250, 16), rrPts(20, 8, 50, 44, 10)], 90, 300);
  }, { ax: 0.5, ay: 0.03 });
  def('s04_fist', 70, 70, () => {
    paint(ellPts(35, 35, 21, 19, 22), PAL.skin, { baseC: '#FFE3CF', lw: 1.8 });
    pen(PAL.ink, 1.2, 'pen'); brush.line(24, 30, 26, 44); brush.line(34, 28, 35, 44); brush.noStroke();
    trim([ellPts(35, 35, 21, 19, 22)], 70, 70);
  });

  const BWING = [[8, 34], [16, 12], [40, 4], [60, 10], [58, 26], [44, 34], [54, 46], [40, 56], [22, 52], [10, 42]];
  def('s04_bfly', 70, 60, (v) => {
    const c = [PAL.pink, PAL.butter, PAL.sky][v];
    paint(BWING, c, { baseC: lite(c, 0.45), lw: 1.4 });
    flat(circ(38, 20, 6, 12), '#FFFFFF', 0.8); flat(circ(36, 46, 4, 10), lite(c, 0.6), 0.9);
    trim([BWING], 70, 60);
  }, { v: 3, ax: 8 / 70, ay: 34 / 60 });
  const BAT = [[6, 34], [22, 12], [46, 4], [66, 8], [58, 20], [50, 16], [46, 30], [36, 24], [30, 38], [18, 32], [10, 42]];
  def('s04_bat', 70, 60, () => { const c = mixc(PAL.lilac, PAL.ink, 0.45); paint(BAT, c, { baseC: mixc(c, PAL.ink, 0.3), lw: 1.5 }); trim([BAT], 70, 60); }, { v: 2, ax: 6 / 70, ay: 34 / 60 });
  const FLY = [
    { x: 1040, y: 700, ax: 110, ay: 55, w: 1.9, p: 0.4 },
    { x: 560, y: 330, ax: 140, ay: 60, w: 1.5, p: 2.1 },
    { x: 1330, y: 360, ax: 90, ay: 70, w: 1.7, p: 4.0 },
  ];
  function flyer(T, i, truth, ctx) {
    const F = FLY[i];
    const x = F.x + Math.sin(T * F.w + F.p) * F.ax, y = F.y + Math.sin(T * F.w * 1.7 + F.p) * F.ay + Math.sin(T * 9 + i) * 6;
    if (ctx && ctx.vis && !ctx.vis(x, y, 50)) return;
    const flap = 0.2 + 0.8 * Math.abs(Math.cos(T * 15 + i * 2));
    const tilt = Math.cos(T * F.w + F.p) * 0.25;
    if (!truth) {
      for (const sg of [-1, 1]) spr('s04_bfly', x, y, { v: i % 3, s: 1.25, sx: sg * flap, r: tilt - sg * 0.25, seed: i });
      flat(ellPts(x, y, 6, 18, 12, 0, tilt), PAL.ink);
    } else {
      for (const sg of [-1, 1]) spr('s04_bat', x, y, { s: 1.3, sx: sg * flap, r: tilt - sg * 0.15, seed: i });
      const e = { x, y, r: 22, i: 60 + i };
      drawEye(x, y, 22, e.i, eyeOpen(T, e), eyeLook(T, e, ctx));
    }
  }

  // ================= L9 drawing =================
  function idleOpen(T, i) { const ph = fract(T * (0.3 + R(i, 51) * 0.35) + R(i, 52)); return ph < 0.07 ? Math.abs(ph - 0.035) / 0.035 : 1; }
  function eyeOpen(T, e) {
    let o = idleOpen(T, e.i);
    for (const bt of WAVE) { const d = T - bt - ((e.x - 400) / 1000) * 0.22; if (d > 0 && d < 0.12) o = Math.min(o, Math.abs(d - 0.06) / 0.06); }
    if (T < wShog) o *= 0.56 + 0.06 * Math.sin(T * 3 + e.i);
    else o *= lerp(0.56, 1, Ez.outBack(clamp((T - wShog) / 0.14), 3));
    if (T > 32.4) o *= 1 - sstep(32.44, 32.58, T); // everyone blinks shut with the big eye
    return o;
  }
  function eyeLook(T, e, ctx) {
    if (T < wShog) return [vnoise(T * 1.3, e.i) * 0.8, vnoise(T * 1.1, e.i + 50) * 0.5];
    if (T < 31.35) return [RS(e.i, 5) * 0.08, 0.05]; // everyone stares straight out at us
    if (T < 31.98) {
      const dx = ctx.pipX - e.x, dy = 760 - e.y, d = Math.hypot(dx, dy) || 1;
      return [(dx / d) * 0.9 + vnoise(T * 2, e.i) * 0.1, (dy / d) * 0.9];
    }
    return [RS(e.i, 5) * 0.06 * (1 - inv(32, 32.3, T)), 0];
  }
  function drawEye(x, y, r, iv, open, lk, pop = 1) {
    const rp = r * pop;
    if (open < 0.3) { qArc(x, y - rp * 0.3, rp * 0.8, rp * 0.55, 0.25, Math.PI - 0.25, Math.max(2.5, r * 0.17)); return; } // closed: a cute curved lash (batched)
    const s = rp / 46, sy = open;
    spr('s04_eye', x, y, { s, sy, seed: iv });
    spr('s04_iris', x + lk[0] * r * 0.38, y + lk[1] * r * 0.38 * sy, { s, sy, v: iv % 3, seed: iv });
    if (open < 0.75) qLine(x - rp * 0.96, y - rp * sy * 0.88, x + rp * 0.96, y - rp * sy * 0.88, Math.max(2.5, r * 0.15));
  }
  function drawBigEye(T, open, lk, dil, g = 1) {
    const { x, y, r } = BIG;
    const sy = Math.max(0.035, open);
    spr('s04_bigeye', x, y, { s: r / 250, sy, jit: 0.5 * g });
    if (open > 0.15) {
      const ix = x + lk[0] * r * 0.3, iy = y + lk[1] * r * 0.3 * sy;
      const k = clamp((open - 0.15) / 0.4);
      spr('s04_bigiris', ix, iy, { s: r / 250, sy: sy * k, jit: 0.5 * g });
      push(); translate(ix, iy); scale(1, sy * k);
      disc(0, 0, r * 0.24 * dil, PAL.black);
      disc(-r * 0.16, -r * 0.16, r * 0.085, '#FFFFFF', 0.95);
      disc(r * 0.1, r * 0.1, r * 0.035, '#FFFFFF', 0.8);
      pop();
    }
    if (open < 0.8) {
      const ly = y - r * sy * 0.92, a = clamp((0.8 - open) * 3);
      segLine(x - r * 1.02, ly, x + r * 1.02, ly, PAL.ink, r * 0.09, a);
      if (open < 0.5) for (let i = -2; i <= 2; i++) segLine(x + i * r * 0.36, ly, x + i * r * 0.46, ly - r * 0.28, PAL.ink, r * 0.05, clamp(1.4 - open * 2.4));
    }
  }
  function tentPts(tn, T, g) {
    const pts = [];
    let x = tn.x, y = tn.y;
    const step = tn.len / (tn.n - 1);
    const om = TAU / (2 * BEAT_LEN), k = kick(T) * g;
    const hi = tn.hi ? sstep(31.35, 31.6, T) * (1 - sstep(32.0, 32.3, T)) : 0;
    for (let j = 0; j < tn.n; j++) {
      const t = j / (tn.n - 1);
      pts.push([x, y, lerp(tn.r0, tn.r0 * 0.34, t), t]);
      let ang = tn.a + tn.curl * t * t + Math.sin(T * om + tn.ph - t * 2.6) * 0.5 * t + k * 0.18 * t * Math.sign(tn.curl);
      if (hi) ang += hi * (-1.1 * t + Math.sin(T * 13) * 0.55 * t);
      x += Math.cos(ang) * step; y += Math.sin(ang) * step;
    }
    return pts;
  }
  // tentacle ribbons as one triangle strip per tentacle (ink rim, then teal core); painted beads add texture
  function tentRibbons(all, layers, wk = 1) {
    noStroke();
    for (const [c, extra] of layers) {
      fill(c);
      for (const pts of all) {
        beginShape(TRIANGLE_STRIP);
        for (let j = 0; j < pts.length; j++) {
          const p = pts[j], q = pts[Math.min(j + 1, pts.length - 1)], o = pts[Math.max(j - 1, 0)];
          const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, w = p[2] * wk + extra;
          vertex(p[0] - (dy / d) * w, p[1] + (dx / d) * w); vertex(p[0] + (dy / d) * w, p[1] - (dx / d) * w);
        }
        endShape();
      }
    }
  }
  function drawTents(T, vis, g, plain) {
    const all = TENTS.map((tn) => tentPts(tn, T, g));
    if (plain) { tentRibbons(all, [[SIL, 0]], 0.72); return; }
    TENTS.forEach((tn, k) => {
      if (!tn.clip) return;
      const pts = all[k], tip = pts[pts.length - 1], pre = pts[pts.length - 2];
      if (!vis || vis(tip[0], tip[1], 60)) spr('paperclip', tip[0] + (tip[0] - pre[0]) * 1.1, tip[1] + (tip[1] - pre[1]) * 1.1, { s: 0.32, r: Math.atan2(tip[1] - pre[1], tip[0] - pre[0]) + Math.PI / 2 + 0.3, v: 0 });
    });
    tentRibbons(all, [[PAL.ink, 2.5], [T_DK, 0]]);
    TENTS.forEach((tn, k) => {
      const pts = all[k], n = pts.length, sg = Math.sign(tn.curl);
      for (let j = n - 1; j >= 0; j -= 2) {
        const [x, y, r, t] = pts[j];
        if (vis && !vis(x, y, r)) continue;
        const q = pts[Math.min(j + 1, n - 1)], o = pts[Math.max(j - 1, 0)];
        const dir = Math.atan2((q[1] - o[1]) * sg, (q[0] - o[0]) * sg); // sprite +y (the sucker) faces the inside of the curl
        spr(t > 0.12 && t < 0.88 ? 's04_beadS' : 's04_bead', x, y, { s: r / 34, seed: j + tn.ph * 10, r: dir });
      }
    });
  }
  function maskTremble(T) { const k = inv(wLies - 0.2, wLies, T); return [Math.sin(T * 60) * 0.12 * k, 1 - 0.1 * k * (0.5 + 0.5 * Math.sin(T * 45))]; }

  function sweetWorld(T) {
    spr('s04_sweet_bg', W / 2, H / 2, { s: 2, jit: 0 });
    twinkles(T, 10, 7, [120, 60, 1680, 760], ['sparkW', 'spark'], 0.12, 0.3, 3);
    const k = kick(T);
    push();
    translate(BX, GROUND); scale(1 + 0.03 * k, 1 - 0.035 * k); translate(-BX, -GROUND);
    const wv = Math.sin((T * TAU) / (2 * BEAT_LEN));
    spr('s04_sarm', 505, 700, { s: 1.35, flip: true, r: -0.3 + wv * 0.5, seed: 1 });
    spr('s04_sarm', 1215, 700, { s: 1.35, r: -0.3 - wv * 0.5, seed: 2 });
    spr('s04_sbody', BX, BY, { seed: 1 });
    const [mr, ms] = maskTremble(T);
    if (T < wLies) spr('s04_mask', MASK[0], MASK[1], { s: 0.66 * ms, r: mr + Math.sin(T * 5) * 0.05, seed: 2 });
    pop();
    for (const [x, y, v] of FLOW) spr('s04_flower', x, y, { v, s: 0.9, r: Math.sin((T * TAU) / (2 * BEAT_LEN) + x * 0.01) * 0.16, sy: 1 - 0.07 * k });
    floaters(T, 8, 4, ['heart', 'heartR'], [440, 180, 900, 700], 70, 0.26, 25);
    for (let i = 0; i < FLY.length; i++) flyer(T, i, false);
  }
  function truthWorld(T, ctx) {
    const vis = ctx.vis || null;
    const g = ctx.groove ?? 1;
    spr('s04_truth_bg', W / 2, H / 2, { s: 2, jit: 0 });
    const spores = [];
    for (let i = 0; i < 12; i++) {
      const ph = fract(R(i, 81) + T * (0.08 + 0.05 * R(i, 82)));
      const x = 100 + R(i, 83) * 1720 + Math.sin(T * 1.4 + i) * 20, y = 1000 - ph * 900;
      if (!vis || vis(x, y, 20)) spores.push([x, y, sstep(0, 0.15, ph) * (1 - sstep(0.8, 1, ph))]);
    }
    blendMode(ADD);
    for (const [x, y, a] of spores) for (let k = 3; k >= 1; k--) disc(x, y, 12 * k, PAL.mint, 0.35 * a * 0.07 * (4 - k));
    blendMode(BLEND);
    for (const [x, y, a] of spores) disc(x, y, 4, PAL.mintLt, 0.8 * a);
    for (const [x, y, v] of FLOW) {
      if (vis && !vis(x, y - 70, 90)) continue;
      const sw = Math.sin((T * TAU) / (2 * BEAT_LEN) + x * 0.01) * 0.2;
      spr('s04_stalk', x, y, { s: 0.85, r: sw, seed: v });
      const tx = x + Math.sin(sw) * 117, ty = y - Math.cos(sw) * 117;
      const e = { x: tx, y: ty, r: 17, i: 40 + v * 3 + (Math.round(x) % 7) };
      drawEye(tx, ty, 17, e.i, eyeOpen(T, e), eyeLook(T, e, ctx));
    }
    qFlush(PAL.ink);
    const k = kick(T) * g;
    push();
    translate(BX, GROUND); rotate(Math.sin((T * TAU) / (4 * BEAT_LEN)) * 0.015 * g); scale(1 + 0.03 * k, 1 - 0.035 * k); translate(-BX, -GROUND);
    drawTents(T, vis, g, false);
    spr('s04_tbody', BX, BY, { seed: 2, jit: g });
    const popK = T > wShog ? 1 + 0.2 * Math.exp(-(T - wShog) * 6) : 1;
    for (const e of EYES) {
      if (vis && !vis(e.x, e.y, e.r)) continue;
      drawEye(e.x, e.y, e.r, e.i, eyeOpen(T, e), eyeLook(T, e, ctx), popK);
    }
    if (!vis || vis(BIG.x, BIG.y, BIG.r)) {
      const e = { x: BIG.x, y: BIG.y, r: BIG.r, i: 99 };
      const open = T > 31.9 ? 1 - sstep(32.42, 32.58, T) : eyeOpen(T, e);
      drawBigEye(T, open, eyeLook(T, e, ctx), 1 + 0.7 * sstep(32.0, 32.4, T), g);
    }
    if (T < wLies) { const [mr, ms] = maskTremble(T); spr('s04_mask', MASK[0], MASK[1], { s: 0.66 * ms, r: mr + Math.sin(T * 5) * 0.05, seed: 2 }); }
    else for (const [x, y, r] of UNDER) { const o = Ez.outBack(clamp((T - wLies - 0.25 - r * 0.02) / 0.2)); if (o > 0) drawEye(x, y, r, 70 + r, o * eyeOpen(T, { x, y, r, i: 70 + r }), [0, 0.1]); }
    qFlush(PAL.ink);
    pop();
    for (let i = 0; i < FLY.length; i++) flyer(T, i, true, ctx);
    qFlush(PAL.ink);
  }

  // Pip and the magnifying glass
  function pipX(T) { return lerp(1570, 1426, Ez.inOut(inv(wThrough - 0.02, wShog - 0.08, T))) + Ez.out(inv(wLies, wLies + 0.3, T)) * 54; }
  const HOVER = (u) => [1025 + Math.sin(u * 7) * 16, 742 + Math.sin(u * 13) * 8 - u * 10];
  function lensC(T, px) {
    if (T < wSee) { const k = Ez.outBack(inv(wSee - 0.36, wSee, T), 1.3); return [lerp(1330, 1025, k), lerp(940, 742, k)]; }
    if (T < wThrough) return HOVER(T - wSee);
    const A = HOVER(wThrough - wSee);
    if (T < wShog) {
      const u = Ez.inOut(inv(wThrough, wShog - 0.03, T)), C = [1130, 450];
      return [(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * C[0] + u * u * MASK[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * C[1] + u * u * MASK[1]];
    }
    const nerv = inv(wShog, wLies, T), rec = T > wLies ? Math.exp(-(T - wLies) * 8) * Math.sin((T - wLies) * 30) : 0;
    const M = [MASK[0] + Math.sin(T * 47) * 3 * nerv + rec * 16, MASK[1] + Math.sin(T * 53) * 3 * nerv + rec * 10];
    const k = Ez.inOut(inv(31.3, 31.56, T));
    const Hd = [px - 14 + Math.sin(T * 41) * 3 * k, 716 + Math.sin(T * 37) * 3 * k];
    return [lerp(M[0], Hd[0], k), lerp(M[1], Hd[1], k) - Math.sin(k * Math.PI) * 90];
  }
  function pipRig(T) {
    const px = pipX(T);
    const hop = Math.sin(inv(wLies, wLies + 0.34, T) * Math.PI) * 52 + (T < wLies ? hopB(T) * 7 : 0);
    const S = [px - 56 * PS, PGY - hop - 138 * PS];
    const L = lensC(T, px);
    const dx = L[0] - S[0], dy = L[1] - S[1], dl = Math.hypot(dx, dy) || 1;
    const aim = Math.atan2(-dx / dl, dy / dl);
    const m2 = sstep(31.3, 31.56, T);
    const th = lerp(aim < -1 ? aim + TAU : aim, 0.55, m2);
    const hand = [S[0] - Math.sin(th) * 82.4 * PS, S[1] + Math.cos(th) * 82.4 * PS];
    return { px, hop, S, L, th, hand, m2 };
  }
  function pipBody(T, st) {
    const face = T < 30.0 ? 'pf_happy' : T < wShog ? 'pf_neutral' : T < wLies ? 'pf_nervous' : T < 31.3 ? 'pf_shock' : 'pf_scared';
    const scared = T > 31.3;
    const trem = scared ? RS(G.boil, 3) * 3 : 0;
    const armR = T < wLies ? 0.2 + hopB(T) * 0.15 : T < 31.3 ? lerp(0.2, 2.4, Ez.outBack(inv(wLies, wLies + 0.15, T))) : 1.0 + Math.sin(T * 31) * 0.08;
    const night = sstep(wLies + 0.15, wLies + 0.45, T); // cool night light once the truth floods out
    push();
    if (night > 0) tint(lerp(255, 208, night), lerp(255, 222, night), 255);
    pip(st.px + trem, PGY, PS, { face, armL: st.th, armR, hop: st.hop, lean: T > 29.8 && T < wLies ? -0.1 : 0, headR: scared ? Math.sin(T * 29) * 0.03 : 0, sq: T > wLies && T < wLies + 0.1 ? 0.9 : 1 });
    pop();
  }
  function drawLens(T, st, inner) {
    const [lx, ly] = st.L;
    push();
    clip(() => { noStroke(); fill(0, 0); circle(lx, ly, LENS_R * 2); });
    inner();
    pop();
    disc(lx, ly, LENS_R, PAL.skyLt, 0.08);
    noFill(); stroke(withAlphaCol('#FFFFFF', 0.55)); strokeWeight(12);
    arc(lx, ly, LENS_R * 1.55, LENS_R * 1.55, Math.PI + 0.35, Math.PI + 1.25); noStroke();
    disc(lx - LENS_R * 0.52, ly - LENS_R * 0.2, 9, '#FFFFFF', 0.7);
    spr('s04_rim', lx, ly, { s: LENS_R / 200, r: T * 0.2 });
  }
  function drawHandle(st) {
    const [lx, ly] = st.L, hx = st.hand[0] - lx, hy = st.hand[1] - ly, d = Math.hypot(hx, hy) || 1;
    const ux = hx / d, uy = hy / d;
    spr('s04_handle', lx + ux * LENS_R * 1.06, ly + uy * LENS_R * 1.06, { r: Math.atan2(uy, ux) - Math.PI / 2, s: 0.95 });
    spr('s04_fist', st.hand[0], st.hand[1], { s: PS * 0.85, r: st.th });
  }
  function flyingMask(T) {
    const t = T - wLies;
    if (t < 0) return;
    const g = 6090, vy0 = -1674, tl = 0.726, vx = 620;
    let x, y, r;
    if (t < tl) { x = MASK[0] + vx * t; y = MASK[1] + vy0 * t + 0.5 * g * t * t; r = (t / tl) * 2 * TAU; }
    else {
      const t2 = t - tl, b1 = 0.227;
      if (t2 < b1) { y = 1000 - 690 * t2 + 0.5 * g * t2 * t2; x = MASK[0] + vx * tl + 170 * t2; }
      else { y = 1000; x = MASK[0] + vx * tl + 170 * b1 + 30 * Ez.out(clamp((t2 - b1) / 0.5)); }
      r = Math.sin(t2 * 16) * 0.35 * Math.exp(-t2 * 4);
    }
    const land = t > tl ? Math.exp(-(t - tl) * 14) : 0;
    const s = lerp(0.66, 0.85, clamp(t * 4));
    spr('s04_mask', x, y, { s, sx: 1 + land * 0.3, sy: 1 - land * 0.3, r, seed: 2 });
  }

  shot({
    id: 'L9-shoggoth', t0: 29.60, tin: { type: 'drip', d: 0.8, at: 0.5 },
    draw(s) {
      const T = s.T;
      QB.length = 0;
      const st = pipRig(T);
      const C = (() => {
        const Zb = 1 + 0.035 * Ez.inOut(inv(29.4, 32.0, T)) + 0.006 * kick(T);
        const e = Ez.in(inv(31.98, 32.56, T));
        const Z = Math.exp(lerp(Math.log(Zb), Math.log(5.3), e));
        const g = Ez.inOut(inv(31.95, 32.45, T));
        const bx = 960 + (st.L[0] - 960) * 0.05, by = 540 + (st.L[1] - 600) * 0.04; // handheld follow of the lens
        const sx = lerp(960 + (BIG.x - bx) * Zb, 960, g), sy = lerp(540 + (BIG.y - by) * Zb, 500, g);
        return { Z, cx: BIG.x - (sx - 960) / Z, cy: BIG.y - (sy - 540) / Z, e };
      })();
      const groove = 1 - C.e;
      const view = { x0: C.cx - 960 / C.Z, y0: C.cy - 540 / C.Z, x1: C.cx + 960 / C.Z, y1: C.cy + 540 / C.Z };
      const inView = (x, y, r) => x + r > view.x0 - 20 && x - r < view.x1 + 20 && y + r > view.y0 - 40 && y - r < view.y1 + 40;
      const fl = inv(wLies + 0.02, wLies + 0.48, T);
      push();
      cam(C.cx, C.cy, C.Z);
      if (T > wLies) shake(Math.exp(-(T - wLies) * 6) * 16, 4);
      // ---- world: sweet outside, truth inside the flood circle ----
      if (fl < 1) sweetWorld(T);
      if (fl > 0) {
        const rr = lerp(LENS_R, 2300, Ez.in(fl));
        const [fx, fy] = lensC(wLies + 0.02, pipX(wLies));
        push();
        if (fl < 1) clip(() => { noStroke(); fill(0, 0); circle(fx, fy, rr * 2); });
        const inFlood = (x, y, r) => Math.hypot(x - fx, y - fy) < rr + r + 30;
        truthWorld(T, { vis: fl < 1 ? inFlood : C.Z > 1.2 ? inView : null, groove, pipX: st.px });
        pop();
        if (fl < 1) {
          ringLine(fx, fy, rr, T_HI, 34, 0.5); ringLine(fx, fy, rr - 16, PAL.mint, 10, 0.7); ringLine(fx, fy, rr + 22, PAL.lilacLt, 6, 0.4);
          for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU + R(i, 9); spr('blob_mint', fx + Math.cos(a) * rr, fy + Math.sin(a) * rr, { s: 0.5 + R(i, 8) * 0.4, seed: i }); }
        }
      }
      // ---- the lens (mode 1: aimed at the shoggoth, drawn behind Pip) ----
      const mode2 = st.m2 > 0.5;
      const lensInner = (withPip) => () => {
        const [lx, ly] = st.L, M = withPip ? 1.45 : 1.35;
        translate(lx, ly); scale(M); translate(-lx, -ly);
        const rr = LENS_R / M;
        truthWorld(T, { vis: (x, y, r) => Math.hypot(x - lx, y - ly) < rr + r + 8, groove, pipX: st.px });
        if (withPip) pipBody(T, st);
      };
      // Pip and the glass are skipped once the push-in leaves them out of view
      const pipVis = st.px + 230 > view.x0 && st.px - 260 < view.x1 && PGY > view.y0 && 440 < view.y1;
      const lensOn = pipVis;
      if (lensOn && !mode2) {
        // motion smear while sweeping "through"
        if (T > wThrough && T < wShog) for (let k = 1; k <= 4; k++) { const p = lensC(T - k * 0.025, st.px); ringLine(p[0], p[1], LENS_R, '#FFFFFF', 7, 0.28 * (1 - k / 5)); }
        drawLens(T, st, lensInner(false));
        // flash inside the lens when every eye pops open on "shoggoth's"
        const pa = T - wShog;
        if (pa > 0 && pa < 0.3) ringLine(st.L[0], st.L[1], LENS_R * (0.5 + pa * 2), '#FFFFFF', 10, 0.6 * (1 - pa / 0.3));
      }
      // the mask pops and tumbles on "lies"
      flyingMask(T);
      burst(T, wLies, MASK[0], MASK[1], { n: 14, names: ['spark', 'star5', 'sparkW'], spd: 900, g: 500, life: 0.8, s: 0.34, seed: 41 });
      if (T > wLies && T < wLies + 0.35) spr('ring', MASK[0], MASK[1], { s: 0.2 + (T - wLies) * 2.4, a: 1 - (T - wLies) / 0.35 });
      // ---- Pip ----
      if (pipVis) {
        pipBody(T, st);
        if (T > wShog && T < wShog + 0.5) spr('drop', st.px + 96, PGY - 420 - (T - wShog) * 120, { s: 0.5, r: 0.4, a: 1 - inv(wShog + 0.3, wShog + 0.5, T) });
        if (lensOn && mode2) drawLens(T, st, lensInner(true));
        if (lensOn) drawHandle(st);
      }
      // glint on "See"
      const ga = T - (wSee - 0.05);
      if (ga > 0 && ga < 0.5) spr('sparkW', st.L[0] - 130, st.L[1] - 130, { s: 0.7 * Ez.outBack(clamp(ga / 0.15)) * (1 - inv(0.3, 0.5, ga)), r: ga * 4 });
      pop();
      // zoom lines rushing into the big eye
      const zl = sstep(32.0, 32.2, T) * (1 - sstep(32.45, 32.6, T));
      if (zl > 0) {
        const segs = [];
        for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU + R(i, 3) * 0.2, r1 = 380 + fract(R(i, 4) + T * 2.6) * 900; segs.push([960 + Math.cos(a) * r1, 500 + Math.sin(a) * r1, 960 + Math.cos(a) * (r1 + 170), 500 + Math.sin(a) * (r1 + 170)]); }
        segLines(segs, '#FFFFFF', 5, 0.35 * zl);
      }
    },
  });
  lyr(9, { y: (T) => 150 + 80 * (1 - Ez.out(inv(29.62, 29.92, T))) - 300 * Ez.inOut(inv(32.4, 32.7, T)), size: 76, maxW: 1600, words: { 0: { anim: 'zoom', fill: PAL.butter }, 1: { anim: 'slide' }, 3: { fill: PAL.mint, anim: 'shake', jitter: 2 }, 4: { fill: PAL.butter, anim: 'spin', tilt: 0.2 } } });

  // ================= L10 sprites =================
  const hillY = (x) => 118 + Math.sin(x * 0.009 + 1) * 20 + Math.sin(x * 0.027) * 7 - 20 * Math.exp(-(((x - 725) / 90) ** 2));
  const HILL_X = 725, SHX = 960 + (HILL_X - 500) * 2, SHY = 810 + (hillY(HILL_X) - 150) * 2 + 8;
  def('s04_red_sky', 1000, 580, () => {
    fullRect(1000, 580, RED_DK);
    gradRect(-20, 200, 1040, 400, RED_DK, RED_MD);
    wash(-40, -40, 1080, 260, mixc(PAL.red, PAL.ink, 0.75), 120, 0.2);
    wash(-40, 300, 1080, 360, mixc(PAL.red, PAL.ink, 0.22), 100, 0.25);
    blob(720, 210, 230, mixc(PAL.red, PAL.orange, 0.3), 45, 0.4);
    for (let i = 0; i < 4; i++) { wc(mixc(PAL.red, PAL.ink, 0.78), 90, 0.15, 0.5, 0.5); brush.rect(random(-100, 700), 50 + i * 60 + random(0, 30), random(300, 520), random(10, 22)); }
    brush.noFill();
    for (let i = 0; i < 40; i++) flat(circ(random(0, 1000), random(0, 260), random(0.8, 2.2), 8), PAL.pinkLt, random(0.35, 0.8));
  });
  def('s04_moon', 440, 440, () => {
    paint(circ(220, 220, 190, 64), PAL.red, { baseC: mixc(PAL.red, '#FFFFFF', 0.18), a: 150, lw: 2.2, lc: RED_DK });
    blob(200, 200, 120, mixc(PAL.red, '#FFFFFF', 0.4), 70, 0.4);
    for (let i = 0; i < 3; i++) { const a = random(TAU), r = random(30, 110); flat(circ(220 + Math.cos(a) * r, 220 + Math.sin(a) * r, random(16, 30), 20), mixc(PAL.red, PAL.ink, 0.12), 0.35); }
    blob(170, 160, 70, '#FFFFFF', 40, 0.3);
    trim([circ(220, 220, 190, 64)], 440, 440);
  });
  const WISP = [[20, 50], [200, 28], [420, 34], [580, 50], [400, 62], [180, 66]];
  def('s04_wisp', 600, 90, () => { flat(WISP, mixc(PAL.red, PAL.ink, 0.66), 0.8); wc(mixc(PAL.red, PAL.ink, 0.72), 150, 0.2, 0.5, 0.4); brush.polygon(WISP); trim([WISP], 600, 90); });
  const FAR = [[-40, 300], [-40, hillY(0)]];
  for (let x = 0; x <= 1040; x += 20) FAR.push([x, hillY(x)]);
  FAR.push([1040, 300]);
  const NEAR = [[-40, 300]];
  for (let x = -40; x <= 1040; x += 20) NEAR.push([x, 205 + Math.sin(x * 0.012 + 3) * 16 + Math.sin(x * 0.041) * 6]);
  NEAR.push([1040, 300]);
  def('s04_hills', 1000, 300, () => {
    paint(FAR, mixc(PAL.red, PAL.ink, 0.5), { baseC: mixc(PAL.red, PAL.ink, 0.6), a: 150, lw: 1.6, lc: RED_DK });
    paint(NEAR, mixc(PAL.red, PAL.ink, 0.74), { baseC: mixc(PAL.red, PAL.ink, 0.8), a: 160, lw: 1.6, lc: RED_DK });
    trim([FAR], 1000, 300);
  });
  const CLIFF_TOP = [];
  for (let x = 0; x <= 820; x += 20) CLIFF_TOP.push([x, 30 + Math.sin(x * 0.03) * 4 + R(x, 7) * 3]);
  const CLIFF = [...CLIFF_TOP, [860, 70], [890, 150], [925, 260], [955, 380], [0, 380]];
  def('s04_cliff', 1100, 380, () => {
    paint(CLIFF, mixc(PAL.ink, PAL.red, 0.28), { baseC: mixc(PAL.ink, PAL.black, 0.35), a: 180, lw: 2 });
    strokePath(CLIFF_TOP.map(([x, y]) => [x, y + 4]), mixc(PAL.red, PAL.pinkLt, 0.35), 3, 'marker', 0.3);
    pen(mixc(PAL.ink, PAL.red, 0.2), 2, 'pen');
    for (let i = 0; i < 16; i++) { const x = random(10, 800); brush.line(x, 32, x - 8 + random(-4, 4), 10 + random(0, 8)); brush.line(x, 32, x + 6, 14 + random(0, 8)); }
    brush.noStroke();
    for (let i = 0; i < 2; i++) blob(random(150, 700), random(160, 300), random(50, 80), mixc(PAL.ink, PAL.red, 0.4), 60, 0.3);
    trim([CLIFF], 1100, 380);
  }, { ax: 0, ay: 0 });
  const FEATHER = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; FEATHER.push([12 + t * 146, 35 - Math.pow(Math.sin(Math.PI * t), 0.7) * 22 * Math.min(1, t / 0.25) + (i === 12 ? 6 : 0)]); }
  for (let i = 20; i >= 0; i--) { const t = i / 20; FEATHER.push([12 + t * 146, 35 + Math.pow(Math.sin(Math.PI * t), 0.7) * 15 * Math.min(1, t / 0.25)]); }
  def('s04_feather', 170, 70, () => {
    paint(FEATHER, PAL.black, { baseC: '#2A1C30', a: 210, lw: 1.5 });
    pen(mixc(PAL.gray, PAL.red, 0.35), 2.2, 'pen'); brush.line(4, 36, 152, 34);
    pen(PAL.inkSoft, 1.1, 'pen');
    for (let k = 0; k < 7; k++) { const x = 40 + k * 16; brush.line(x, 34, x + 12, 20); brush.line(x, 36, x + 10, 46); }
    brush.noStroke();
    trimUnion([FEATHER, segPoly(2, 36, 40, 35, 2.5)], 170, 70);
  }, { v: 2 });
  const GLYPHS = [
    [[[50, 12], [50, 88]], [[30, 64], [72, 40]], [[38, 22], [62, 22], [62, 38], [38, 38], [38, 22]]],
    [[[24, 26], [76, 26], [50, 82]], [[46, 48], [54, 52]]],
    [[[28, 30], [70, 30], [70, 70], [40, 70], [40, 50], [56, 50]], [[20, 88], [80, 88]]],
    [[[30, 18], [30, 82]], [[70, 18], [70, 82]], [[30, 50], [45, 38], [55, 62], [70, 50]]],
    [[[16, 50], [34, 32], [50, 26], [66, 32], [84, 50], [66, 68], [50, 74], [34, 68], [16, 50]], [[46, 48], [54, 52]]],
    [[[50, 86], [50, 18]], [[30, 40], [50, 18], [70, 40]], [[34, 66], [66, 66]]],
  ];
  for (const [nm, off] of [['s04_glyphA', 0], ['s04_glyphB', 3]]) {
    def(nm, 140, 140, (v) => {
      const G0 = GLYPHS[off + v];
      for (const [c, hw] of [['#2A0612', 7.5], [GLY, 3.5]]) for (const s of G0) for (let i = 0; i < s.length; i++) {
        const [x, y] = s[i];
        flat(circ(x + 20, y + 20, hw, 12), c);
        if (i) flat(segPoly(s[i - 1][0] + 20, s[i - 1][1] + 20, x + 20, y + 20, hw), c);
      }
    }, { v: 3 });
  }
  def('s04_reticle', 320, 320, () => {
    pen(RED_HOT, 7, 'marker'); brush.circle(160, 160, 118);
    pen(GLY, 2.2, 'pen'); brush.circle(160, 160, 92);
    pen(RED_HOT, 6, 'marker'); brush.line(160, 18, 160, 62); brush.line(160, 258, 160, 302); brush.line(18, 160, 62, 160); brush.line(258, 160, 302, 160);
    brush.noStroke();
  }, { v: 2 });
  def('s04_ring_red', 400, 400, () => { pen(RED_HOT, 10, 'marker'); brush.circle(200, 200, 170); pen(GLY, 4, 'marker'); brush.circle(200, 200, 150); brush.noStroke(); }, { v: 2 });
  const EK = 6.32; // big red eye = ce_red painted 6.32x larger
  def('s04_redeye_big', 480, 480, () => {
    const c = 240;
    blob(c, c, 32 * EK * 0.95, PAL.red, 120, 0.3);
    flat(circ(c, c, 26.9 * EK, 72), '#FF2A3C');
    wc('#FF6A78', 80, 0.1, 0.5, 0.4); brush.circle(c - 34, c - 34, 110); brush.noFill();
    flat(circ(c, c, 19.2 * EK, 72), '#3A0010');
    wc('#5A0A20', 110, 0.05, 0.6, 0.4); brush.circle(c + 10, c + 14, 96); brush.noFill();
    pen('#FFD0D0', 4, 'pen'); brush.circle(c, c, 23 * EK); brush.noStroke();
    flat(circ(c, c, 6.4 * EK, 40), '#FF2A3C');
    flat(circ(c - 63, c - 63, 30, 32), '#FFFFFF');
    flat(circ(c + 58, c + 50, 12, 20), '#FFFFFF', 0.7);
    trim([circ(c, c, 180, 72)], 480, 480);
  });
  def('s04_skin_big', 1000, 580, () => {
    fullRect(1000, 580, '#E9563F');
    gradRect(-20, -20, 1040, 620, '#F47359', '#C23E3C');
    wash(-40, -40, 1080, 660, PAL.coral, 110, 0.08);
    blob(230, 130, 230, '#FFB09A', 70, 0.4);
    blob(820, 480, 260, mixc(PAL.coralDk, PAL.red, 0.5), 100, 0.4);
    blob(90, 500, 200, mixc(PAL.coralDk, PAL.ink, 0.25), 80, 0.4);
    blob(700, 90, 150, '#FF9C84', 60, 0.4);
  });

  // ================= L10 drawing =================
  const CLX = 620, CLY = 990, CS = 1.3;
  const ZE = 12;
  function zoom2(T) {
    const Zw = 1 + 0.035 * inv(33.4, wEyes, T);
    let Z;
    if (T < 32.72) Z = lerp(ZE * 1.05, ZE, inv(32.4, 32.72, T));
    else if (T < 33.45) Z = Math.exp(lerp(Math.log(ZE), Math.log(Zw), Ez.inOut(inv(32.72, 33.45, T))));
    else if (T < wEyes) Z = Zw;
    else if (T < 35.08) Z = Math.exp(lerp(Math.log(Zw), Math.log(ZE), Ez.inOut(inv(wEyes, 35.08, T))));
    else Z = ZE * (1 + (T - 35.08) * 0.1);
    return { Z, Zw, f: clamp(Math.log(Z / Zw) / Math.log(ZE / Zw)) };
  }
  function pose2(T, f) {
    const g = 1 - f;
    const point = Ez.outBack(inv(wYour - 0.12, wYour + 0.06, T), 2) * (1 - Ez.inOut(inv(34.3, 34.6, T)));
    const shin = T > wShin ? Math.exp(-(T - wShin) * 6) : 0;
    const flare = (T > wShin ? Math.exp(-(T - wShin) * 5) * 0.25 : 0) + (T > wEyes ? Math.exp(-(T - wEyes) * 4) * 0.2 : 0);
    const lk = lerp(0.12, 0.45, g);
    return {
      hop: (hopB(T) * 8 + shin * 22) * g, sq: 1 + (shin * 0.1 - kick(T) * 0.03) * g, r: (0.03 + Math.sin(T * 1.7) * 0.015) * g,
      armL: 0.25 + Math.sin(T * 2.3) * 0.08, armR: lerp(0.2, -0.95, point) + Math.sin(T * 2.1) * 0.05,
      eyeS: 1.15 * (1 + flare), look: [lk, 0.05 * g],
      legs: [[0, -0.12], [0, -0.04], [0, 0.04], [0, 0.12]],
    };
  }
  function eyePos(P, side) {
    const lx = (side * 2.5 + P.look[0]) * CU * CS * P.sq, ly = ((-6.5 + P.look[1]) * CU * CS) / P.sq;
    const c = Math.cos(P.r), s = Math.sin(P.r);
    return [CLX + c * lx - s * ly, CLY - P.hop + s * lx + c * ly];
  }
  function cam2(T) {
    const zz = zoom2(T);
    const P = pose2(T, zz.f);
    const e = eyePos(P, 1);
    const g = Ez.inOut(zz.f);
    const natX = 960 + (e[0] - 960) * zz.Zw, natY = 540 + (e[1] - 540) * zz.Zw;
    const sx = lerp(natX, 960, g), sy = lerp(natY, 500, g);
    return { Z: zz.Z, f: zz.f, P, eye: e, cx: e[0] - (sx - 960) / zz.Z, cy: e[1] - (sy - 540) / zz.Z };
  }
  const lay = (C, p) => ({ Zp: Math.pow(C.Z, p), lx: 960 + (C.cx - 960) * p, ly: 540 + (C.cy - 540) * p });
  function layerOn(C, p) { const L = lay(C, p); push(); translate(W / 2, H / 2); scale(L.Zp); translate(-L.lx, -L.ly); }
  function toScr(C, p, x, y) { const L = lay(C, p); return [960 + (x - L.lx) * L.Zp, 540 + (y - L.ly) * L.Zp]; }

  // the distant shoggoth as a dark silhouette with glowing eyes (same rig as L9)
  function shogFar(T, x, y, s) {
    const k = kick(T), fl = T > wShin ? Math.exp(-(T - wShin) * 5) : 0;
    push(); translate(x, y); scale(s); translate(-BX, -GROUND);
    push(); translate(BX, GROUND); scale(1 + 0.04 * k + fl * 0.12, 1 - 0.05 * k - fl * 0.14); translate(-BX, -GROUND);
    drawTents(T, null, 1, true);
    tint(58, 92, 104);
    spr('s04_tbody', BX, BY, { seed: 5 });
    tint(255); // noTint() leaves a null tint that makes the next image() throw in WEBGL
    const bright = 0.75 + 0.25 * kick(T, 4) + fl * 0.8;
    blendMode(ADD);
    for (const e of EYES) { if (idleOpen(T, e.i) < 0.3) continue; disc(e.x, e.y, e.r * 1.6, RED_HOT, 0.2 * bright); }
    blendMode(BLEND);
    for (const e of EYES) { if (idleOpen(T, e.i) < 0.3) continue; disc(e.x, e.y, e.r * 0.62 * (1 + fl * 0.4), '#FFD6DC', 0.95); disc(e.x, e.y, e.r * 0.24, PAL.black, 0.9); }
    disc(BIG.x, BIG.y, BIG.r * 0.66 * (1 + fl * 0.3), '#FFE9A8', 0.95); disc(BIG.x, BIG.y, BIG.r * 0.26, PAL.black, 0.9);
    for (const [ux, uy, ur] of UNDER) disc(ux, uy, ur * 0.6, '#FFD6DC', 0.9);
    pop(); pop();
  }
  const NUMS = [['0.999', '0.998', '0.997', '0.999'], ['1e27', '3e26', '7e27', '1e27'], ['404', '808', '101', '404'], ['8', '88', '888', '∞']];
  const READ0 = 34.1, READ1 = 34.66;
  const readAng = (T) => lerp(-2.8, -0.34, Ez.inOut(inv(READ0, READ1, T)));
  function readout(T, cx, cy) {
    const age = T - wShin;
    if (age < -0.02) return;
    const items = [['A', 0], ['n', 0], ['B', 1], ['A', 1], ['n', 1], ['p', 0], ['B', 2], ['n', 2], ['A', 2], ['n', 3], ['B', 0]];
    const N = items.length;
    for (let i = 0; i < N; i++) {
      const a0 = age - i * 0.025;
      if (a0 < 0) continue;
      const ang = lerp(-2.8, -0.34, i / (N - 1)), rad = 215 + R(i, 91) * 80 + a0 * 14;
      const k = Ez.outBack(clamp(a0 / 0.32), 1.8);
      const x = cx + Math.cos(ang) * rad * k + Math.sin(T * 2 + i) * 6, y = cy + Math.sin(ang) * rad * k - a0 * 18 + Math.sin(T * 3 + i * 1.3) * 5;
      const lit = T > READ0 && T < READ1 + 0.1 ? Math.exp(-(((ang - readAng(T)) / 0.25) ** 2)) : 0;
      const fk = Math.min(1, 0.8 + 0.2 * Math.sin(T * 37 + i * 2.1) + lit);
      const [kind, v] = items[i];
      glow(x, y, 60 + lit * 30, PAL.red, (0.45 + lit * 0.15) * k);
      if (kind === 'A' || kind === 'B') spr(kind === 'A' ? 's04_glyphA' : 's04_glyphB', x, y, { v, s: 0.78 * k, a: fk, r: Math.sin(T * 2.5 + i) * 0.12, seed: i });
      else if (kind === 'p') spr('paperclip', x, y, { s: 0.45 * k, r: 0.5 + Math.sin(T * 3) * 0.2, v: 0 });
      else { const L = NUMS[v]; const str = a0 < 0.5 ? L[(G.boil + i) % (L.length - 1)] : L[L.length - 1]; txt(str, x, y, { font: 'pixel', size: 56, fill: '#FFF4F6', stroke: '#2A0612', sw: 7, weight: 700 }, { s: k, a: fk }); }
    }
  }
  function feathers(T, n, seed, box, s0, spd, a = 1) {
    for (let i = 0; i < n; i++) {
      const fr = fract(R(i, seed) + T * spd * (0.6 + 0.8 * R(i, seed + 1)));
      const x = box[0] + fr * box[2], y = box[1] + R(i, seed + 2) * box[3] + fr * 240 + Math.sin(T * 1.3 + i) * 30;
      const fl = Math.cos(T * (2.4 + R(i, seed + 3) * 1.5) + i);
      spr('s04_feather', x, y, { s: s0 * (0.6 + 0.7 * R(i, seed + 4)), sy: 0.35 + 0.65 * Math.abs(fl), r: -0.5 + Math.sin(T * 2 + i * 1.7) * 0.6, flip: fl < 0, a, seed: i });
    }
  }
  function beam(ax, ay, bx, by, on, w0) {
    if (on <= 0) return;
    const ex = lerp(ax, bx, clamp(on * 1.2)), ey = lerp(ay, by, clamp(on * 1.2));
    const dx = ex - ax, dy = ey - ay, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    blendMode(ADD); noStroke();
    for (const [w1, w2, c, a] of [[w0, w0 * 7, PAL.red, 0.2], [w0 * 0.5, w0 * 3, RED_HOT, 0.25]]) {
      fill(withAlphaCol(c, a * on));
      beginShape(); vertex(ax + nx * w1, ay + ny * w1); vertex(ex + nx * w2, ey + ny * w2); vertex(ex - nx * w2, ey - ny * w2); vertex(ax - nx * w1, ay - ny * w1); endShape(CLOSE);
    }
    blendMode(BLEND);
    segLine(ax, ay, ex, ey, '#FFD6DC', w0 * 0.35, 0.8 * on);
  }
  // blink match cut: the almond opening (screen coords) used by the transition mask and the lid line
  function almond(T) {
    const k = inv(32.6, 32.93, T);
    return { hh: lerp(0, 1150, Ez.inOut(k)), hw: lerp(520, 2100, Ez.out(k)), k };
  }
  function almondPts(A, n = 40) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const x = -A.hw + (2 * A.hw * i) / n; pts.push([960 + x, 500 - A.hh * Math.pow(1 - (x / A.hw) ** 2, 0.85)]); }
    for (let i = n; i >= 0; i--) { const x = -A.hw + (2 * A.hw * i) / n; pts.push([960 + x, 500 + A.hh * 0.8 * Math.pow(1 - (x / A.hw) ** 2, 0.85)]); }
    return pts;
  }

  shot({
    id: 'L10-shinigami', t0: wWith,
    tin: { type: 'mask', d: 0.5, at: 0.4, mask(p, T) { const A = almond(T); if (A.hh < 1) return; beginShape(); for (const [x, y] of almondPts(A)) vertex(x, y); endShape(CLOSE); } },
    draw(s) {
      const T = s.T;
      const C = cam2(T), P = C.P;
      const ecuA = sstep(2.6, 3.8, C.Z);
      const shin = T > wShin ? Math.exp(-(T - wShin) * 6) : 0;
      const beamOn = sstep(33.12, 33.32, T) * (1 - sstep(34.86, 35.0, T));
      const farS = 0.27, pFar = 0.55;
      const shogC = [SHX, SHY - (GROUND - BY) * farS - 10];
      if (ecuA < 1) {
        push(); shake(shin * 10, 8);
        // sky, moon, wisps (slow parallax)
        layerOn(C, 0.08); spr('s04_red_sky', W / 2, H / 2, { s: 2.04, jit: 0 }); pop();
        layerOn(C, 0.25);
        glow(1440, 430, 330, PAL.red, 0.45 + 0.12 * kick(T, 4));
        spr('s04_moon', 1440, 430, { s: 1.05, jit: 0.3 });
        for (let i = 0; i < 3; i++) spr('s04_wisp', -300 + fract(R(i, 5) + T * 0.03 * (1 + i * 0.4)) * 2500, 330 + i * 110, { s: 1 + i * 0.2, a: 0.85, seed: i });
        pop();
        // far hills, the distant shoggoth, the scan reticle and the readout
        layerOn(C, pFar);
        spr('s04_hills', 960, 810, { s: 2, jit: 0.3 });
        shogFar(T, SHX, SHY, farS);
        const lock = Ez.outBack(inv(wYour - 0.04, wYour + 0.14, T), 2);
        if (T > wYour - 0.04) spr('s04_reticle', shogC[0], shogC[1], { s: lerp(1.5, 0.62, lock) * (1 + shin * 0.2), r: T * 1.4, a: clamp((T - wYour + 0.04) * 8) * (1 - sstep(34.9, 35.05, T)) });
        if (shin > 0.01) spr('s04_ring_red', shogC[0], shogC[1], { s: 0.4 + (1 - shin) * 1.6, a: shin });
        readout(T, shogC[0], shogC[1] - 20);
        feathers(T, 6, 30, [-200, 150, 2400, 500], 0.3, 0.035, 0.85);
        pop();
        // mid feathers + embers
        layerOn(C, 0.8);
        feathers(T, 9, 50, [-300, 60, 2500, 700], 0.55, 0.05);
        for (let i = 0; i < 16; i++) { const ph = fract(R(i, 61) + T * 0.2 * (0.6 + R(i, 62))); const x = R(i, 63) * 1920 + Math.sin(T * 2 + i) * 30, y = 1100 - ph * 1000; glow(x, y, 16, PAL.orange, 0.4 * Math.sin(ph * Math.PI)); }
        pop();
        // cliff + Clawd
        layerOn(C, 1);
        spr('s04_cliff', -60, CLY - 34, { jit: 0.3 });
        push(); tint(255, 196, 204); // red moonlight
        clawd(CLX, CLY, CS, { eyes: 'ce_red', look: P.look, eyeS: P.eyeS, armL: P.armL, armR: P.armR, hop: P.hop, sq: P.sq, r: P.r, legs: P.legs, seed: 4 });
        pop();
        for (const side of [-1, 1]) { const e = eyePos(P, side); glow(e[0], e[1], 50 * CS * P.eyeS, RED_HOT, 0.5 + 0.1 * kick(T)); }
        pop();
        // beams (screen space: eyes on layer 1, target on the far layer)
        if (beamOn > 0) {
          const sweep = T < wYour ? 1 - Ez.out(inv(wYour - 0.08, wYour + 0.1, T)) : 0;
          let tx = shogC[0] + Math.sin((T - 33.1) * 9) * 150 * sweep, ty = shogC[1] + Math.cos((T - 33.1) * 6) * 60 * sweep + Math.sin(T * 8) * 40 * (1 - sweep);
          const rd = sstep(READ0 - 0.1, READ0 + 0.05, T) * (1 - sstep(READ1, READ1 + 0.1, T));
          if (rd > 0) { const a = readAng(T); tx = lerp(tx, shogC[0] + Math.cos(a) * 250, rd); ty = lerp(ty, shogC[1] - 20 + Math.sin(a) * 250, rd); }
          const tgt = toScr(C, pFar, tx, ty);
          for (const side of [-1, 1]) { const e = toScr(C, 1, ...eyePos(P, side)); beam(e[0], e[1], tgt[0] + side * 10, tgt[1], beamOn, 7 * Math.pow(C.Z, 0.5)); }
          glow(tgt[0], tgt[1], 60, RED_HOT, 0.5 * beamOn);
        }
        if (shin > 0.02) { blendMode(ADD); noStroke(); fill(withAlphaCol(RED_HOT, 0.22 * shin)); rect(-40, -40, W + 80, H + 80); blendMode(BLEND); }
        // flare rings on "shinigami" and "eyes"
        for (const [t0, sc] of [[wShin, 0.5], [wEyes, 0.7]]) {
          const a0 = T - t0;
          if (a0 > 0 && a0 < 0.45) for (const side of [-1, 1]) { const e = toScr(C, 1, ...eyePos(P, side)); spr('s04_ring_red', e[0], e[1], { s: (0.15 + a0 * 1.6) * sc * C.Z, a: 1 - a0 / 0.45, seed: side }); }
        }
        pop();
      }
      // ---- extreme close-up layer: crisp painted eye on coral skin ----
      if (ecuA > 0) {
        spr('s04_skin_big', W / 2, H / 2, { s: 2.05, a: ecuA, jit: 0.4 });
        const sx = 960 + (C.eye[0] - C.cx) * C.Z, sy = 540 + (C.eye[1] - C.cy) * C.Z;
        const k = (16.8 * CS * P.eyeS * C.Z) / 170;
        const ign = T < 33.2 ? Ez.out(inv(32.6, 32.85, T)) : 1;
        glow(sx, sy, 330 * k, PAL.red, (0.25 + 0.2 * kick(T, 4)) * ecuA * ign);
        spr('s04_redeye_big', sx, sy, { s: k, a: ecuA, jit: 0.4 });
        // scanning arcs inside the pupil; at the end the distant shoggoth is reflected in the eye
        push(); translate(sx, sy); scale(k);
        noFill(); stroke(withAlphaCol(RED_HOT, 0.8 * ecuA)); strokeWeight(6);
        for (let i = 0; i < 5; i++) { const a = T * 1.8 + (i / 5) * TAU; arc(0, 0, 205, 205, a, a + 0.7); }
        noStroke();
        for (const big of [0, 1]) {
          const segs = [];
          for (let i = 0; i < 36; i++) { if ((i % 3 === 0) !== !!big) continue; const a = -T * 0.5 + (i / 36) * TAU, l = big ? 14 : 7; segs.push([Math.cos(a) * (146 - l), Math.sin(a) * (146 - l), Math.cos(a) * (146 + l), Math.sin(a) * (146 + l)]); }
          segLines(segs, GLY, big ? 4 : 2.5, 0.85 * ecuA);
        }
        pop();
        disc(sx - 63 * k, sy - 63 * k, 30 * k, '#FFFFFF', 0.9 * ecuA);
        for (let i = 0; i < 10; i++) { const ph = fract(R(i, 71) + T * 0.35 * (0.6 + R(i, 72))); glow(R(i, 73) * 1920 + Math.sin(T * 2 + i) * 40, 1150 - ph * 1250, 26, PAL.butter, 0.45 * Math.sin(ph * Math.PI) * ecuA); }
      }
      // lid line of the blink-match opening
      const A = almond(T);
      if (A.k > 0 && A.k < 1) { noFill(); stroke(PAL.ink); strokeWeight(20); beginShape(); for (const [x, y] of almondPts(A)) vertex(x, y); endShape(CLOSE); noStroke(); }
      // foreground feathers sweep past the lens
      feathers(T, 3, 70, [-500, -100, 2900, 700], 1.8, 0.16, 0.95);
    },
  });
  lyr(10, { y: 150, size: 80, fill: '#FFF1F3', stroke: '#3A0A1A', words: { 2: { font: 'pixel', fill: RED_HOT, stroke: '#FFFFFF', sw: 6, size: 98, anim: 'drop', jitter: 3 }, 3: { fill: RED_HOT, stroke: '#FFFFFF', sw: 6, size: 92, anim: 'pop' } } });
})();

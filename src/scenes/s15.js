// s15.js - Finale and end card (140.30 to the end of the song, 156.65). Everything here is private to this IIFE.
// Curtains fly open on the 140.3 hit, the giant gauge bursts into confetti, then a one-callout-per-four-beats
// parade of callbacks (paperclips, mushrooms, chinchillas, flip-flops, the boombox serpent, a GPU rocket to the
// smiling moon, hearts) while Clawd, Pip and the researcher friends dance. A watercolor wash sweeps it all away
// into a calm end card that holds after the song ends.
(() => {
  // ================= timing =================
  const HB = BEATS.findIndex((b) => b > 140.2); // the 140.27 hit
  const bt = (k) => { const i = HB + k, L = BEATS.length - 1; return i <= L ? BEATS[i] : BEATS[L] + (i - L) * BEAT_LEN; };
  const T0 = 140.30;
  // callout slots start on every fourth beat (a kick): open, clips, shrooms, chins, flops, serpent, moon, (end)
  const SL = [T0, bt(4), bt(8), bt(12), bt(16), bt(20), bt(24), bt(28)];
  const T_CRACK = bt(2), T_BOOM = bt(3), T_CUBE = bt(13), T_FLIP = bt(18), T_LAND = bt(19), T_DOCK = bt(26), T_SWEEP = bt(27);
  const E_MOVE0 = 152.95, E_MOVE1 = 153.75, E_T1 = 153.42, E_T2 = 153.68, E_RIB = 154.0, E_SETTLE = 155.0;

  // ================= sprite helpers =================
  // A brush fill on a transparent sprite leaves an opaque paper-white fringe that grows with the shape's size;
  // big shapes erase everything outside a slightly enlarged copy of their outline to keep a thin, clean deckle.
  function eraseOutside(pts, w, h, k = 1.015) {
    let cx = 0, cy = 0; for (const [x, y] of pts) { cx += x; cy += y; } cx /= pts.length; cy /= pts.length;
    const q = scalePts(pts, cx, cy, k);
    erase(); noStroke(); beginShape(); vertex(-20, -20); vertex(w + 20, -20); vertex(w + 20, h + 20); vertex(-20, h + 20);
    beginContour(); for (let i = q.length - 1; i >= 0; i--) vertex(q[i][0], q[i][1]); endContour(); endShape(CLOSE); noErase();
  }

  // ================= sprites =================
  const CONF = [PAL.butter, PAL.pink, PAL.mint, PAL.sky, PAL.lilac, PAL.coralLt, PAL.orange, PAL.green];
  defSprite('s15_conf', 64, 64, (v) => {
    const c = CONF[v], pts = v % 3 === 2 ? ellPts(32, 32, 13, 13, 16) : rrPts(10, 24, 44, 16, 4);
    flat(pts, lite(c, 0.1)); pen(PAL.ink, 1.1, '2B'); brush.polygon(pts);
  }, { v: 8 });
  const SPLC = [PAL.coral, PAL.butter, PAL.mint, PAL.pink];
  defSprite('s15_splat', 280, 280, (v) => {
    const c = SPLC[v], pts = [], n = 22;
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const r = i % 2 ? 58 + random() * 20 : 88 + random() * 28; pts.push([140 + Math.cos(a) * r, 140 + Math.sin(a) * r]); }
    for (let i = 0; i < 6; i++) { const a = random() * TAU, r = 7 + random() * 8; flat(ellPts(140 + Math.cos(a) * 118, 140 + Math.sin(a) * 118, r, r, 12), lite(c, 0.1)); }
    paint(pts, c, { baseC: lite(c, 0.2), a: 190, lw: 1.4 });
  }, { v: 4 });
  defSprite('s15_shard', 200, 200, (v) => {
    const c = [PAL.mint, PAL.butter, PAL.orange, PAL.red, PAL.paper][v];
    const pts = [[22, 52 + random() * 12], [176, 24 + random() * 12], [150 + random() * 12, 112], [72, 178]];
    flat(pts, lite(c, 0.1)); flat(scalePts(pts, 100, 90, 0.6), lite(c, 0.35), 0.6); pen(PAL.ink, 2, '2B'); brush.polygon(pts);
  }, { v: 5 });
  defSprite('s15_crack', 520, 360, () => {
    for (let i = 0; i < 7; i++) {
      let x = 260, y = 180; const a0 = (i / 7) * TAU + random() * 0.5; const pts = [[x, y]];
      for (let k = 0; k < 4; k++) { const a = a0 + (random() - 0.5) * 0.9; const d = 28 + random() * 36; x += Math.cos(a) * d; y += Math.sin(a) * d * 0.8; pts.push([x, y]); }
      strokePath(pts, PAL.ink, 2.6, 'pen', 0.05);
    }
  });
  defSprite('s15_floor', 1000, 200, () => {
    const fl = [[-20, 34], [1020, 34], [1020, 220], [-20, 220]];
    paint(fl, PAL.brownLt, { baseC: '#E2BE9C', a: 130, lw: 2, bleed: 0.01 });
    eraseOutside(fl, 1000, 200, 1.01);
    pen(PAL.brown, 1.8, 'pen');
    for (const y of [80, 132, 184]) brush.line(-10, y, 1010, y + 2);
    for (let i = 0; i < 14; i++) { const x = 30 + i * 74 + random() * 20; const r = Math.floor(random() * 3); brush.line(x, [36, 82, 134][r], x + 2, [80, 132, 184][r]); }
    brush.noStroke();
    wc('#FFFFFF', 70, 0.02); brush.rect(0, 40, 1000, 22); brush.noFill();
  });
  function bgSprite(name, base, blooms, ground, flatC) {
    defSprite(name, 1000, 580, () => {
      flat([[-10, -10], [1010, -10], [1010, 590], [-10, 590]], flatC || lite(base, 0.25));
      wash(-40, -40, 1080, 660, base, 225, 0.1);
      for (const [x, y, r, c, a] of blooms) blob(x, y, r, c, a ?? 110, 0.35);
      if (ground) { wash(-40, 440, 1080, 200, ground, 190, 0.12); blob(300, 520, 160, lite(ground, 0.3), 90, 0.3); }
    }, { v: 1 });
  }
  bgSprite('s15_bg_party', PAL.butterLt, [[200, 150, 200, PAL.pinkLt], [760, 430, 210, PAL.pinkLt]]);
  bgSprite('s15_bg_clips', PAL.skyLt, [[250, 160, 210, PAL.lilacLt], [760, 150, 190, '#FFFFFF', 150]], PAL.lilacLt);
  bgSprite('s15_bg_shroom', mixc(PAL.pinkLt, PAL.lilacLt, 0.5), [[200, 170, 210, PAL.butterLt], [800, 160, 190, PAL.pink, 70]], mixc(PAL.mint, PAL.lilac, 0.35));
  bgSprite('s15_bg_chin', PAL.mintLt, [[220, 140, 210, PAL.skyLt], [760, 170, 200, PAL.butterLt]], mixc(PAL.mint, PAL.sky, 0.3));
  bgSprite('s15_bg_flop', mixc(PAL.butterLt, PAL.peach, 0.45), [[500, 110, 210, PAL.butter, 110], [160, 260, 190, PAL.pinkLt]], mixc(PAL.butter, PAL.peach, 0.5));
  bgSprite('s15_bg_club', mixc(PAL.night, PAL.lilac, 0.3), [[250, 160, 230, PAL.nightLt, 150], [760, 330, 240, mixc(PAL.pink, PAL.night, 0.45), 110]], null, mixc(PAL.night, PAL.lilac, 0.18));
  bgSprite('s15_bg_night', PAL.night, [[260, 150, 240, PAL.navy, 150], [620, 450, 280, mixc(PAL.lilac, PAL.night, 0.45), 130]], null, PAL.night);

  // colourful paperclips (one colour per variant)
  const CLIPC = [PAL.coral, PAL.sky, PAL.mint, PAL.butter, PAL.pink, PAL.lilac];
  const CLIP_PTS = [[60, 150], [60, 40], [45, 22], [28, 40], [28, 170], [45, 186], [70, 168], [70, 30], [52, 10], [26, 10], [14, 30], [14, 150]];
  defSprite('s15_clip', 120, 250, (v) => {
    const pts = CLIP_PTS.map(([x, y]) => [18 + x * 1.2, 12 + y * 1.2]);
    strokePath(pts, CLIPC[v], 3.6, 'marker', 0.6); strokePath(pts, PAL.ink, 1.3, 'pen', 0.6);
  }, { v: 6 });
  defSprite('s15_clip_pile', 1000, 320, () => {
    const top = [];
    for (let i = 0; i <= 20; i++) top.push([-20 + i * 52, 72 + Math.sin(i * 1.3) * 16 + random() * 18]);
    const mound = [...top, [1020, 330], [-20, 330]];
    paint(mound, PAL.lilacLt, { baseC: '#EDE6FF', a: 110, lw: 1.6, bleed: 0.006, border: 0.4 });
    eraseOutside(mound, 1000, 320, 1.02);
    for (let k = 0; k < 70; k++) {
      const x = random() * 1000, y = 92 + random() * 215, a = random() * TAU, s = 0.34 + random() * 0.14;
      const pts = CLIP_PTS.map(([px, py]) => { const dx = (px - 42) * s, dy = (py - 98) * s; return [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)]; });
      strokePath(pts, CLIPC[k % 6], 1.8, 'marker', 0.6);
      if (k % 2 === 0) strokePath(pts, PAL.ink, 0.8, 'pen', 0.6);
    }
  }, { ay: 0.25 });

  // red-cap mushrooms with little faces
  function shroomPaint(w, k) {
    const cx = w / 2;
    paint(rrPtsPoly([[cx - 38 * k, 150 * k], [cx + 38 * k, 150 * k], [cx + 50 * k, 282 * k], [cx - 50 * k, 282 * k]], 18 * k), PAL.cream, { baseC: '#FFFBF0', lw: 2 });
    flat(ellPts(cx - 16 * k, 204 * k, 5 * k, 7 * k, 12), PAL.ink); flat(ellPts(cx + 16 * k, 204 * k, 5 * k, 7 * k, 12), PAL.ink);
    blob(cx - 30 * k, 224 * k, 8 * k, PAL.pink, 130, 0.2); blob(cx + 30 * k, 224 * k, 8 * k, PAL.pink, 130, 0.2);
    strokePath([[cx - 9 * k, 224 * k], [cx, 231 * k], [cx + 9 * k, 224 * k]], PAL.ink, 2, 'pen', 0.5);
    const cap = [];
    for (let i = 0; i <= 26; i++) { const a = Math.PI + (i / 26) * Math.PI; cap.push([cx + Math.cos(a) * 120 * k, 168 * k + Math.sin(a) * 128 * k]); }
    cap.push([cx + 96 * k, 180 * k], [cx, 186 * k], [cx - 96 * k, 180 * k]);
    paint(cap, PAL.red, { baseC: '#FF6A7E', a: 170, lw: 2.2 });
    pen(PAL.ink, 1.2, 'pen');
    for (const [dx, dy, r] of [[-62, -52, 20], [8, -98, 24], [66, -44, 17], [-18, -30, 12], [96, -8, 10], [-98, -6, 11]]) { const e = ellPts(cx + dx * k, 168 * k + dy * k, r * k, r * 0.85 * k, 16); flat(e, '#FFFFFF'); brush.polygon(e); }
    brush.noStroke();
    wc('#FFFFFF', 70, 0.1); brush.circle(cx - 50 * k, 90 * k, 22 * k); brush.noFill();
  }
  defSprite('s15_shroom', 280, 310, (v, w) => shroomPaint(w, 1), { v: 2, ay: 0.92 });
  defSprite('s15_shroom_big', 540, 600, (v, w) => shroomPaint(w, 1.95), { v: 1, ay: 0.93 });

  // chinchilla: round, fluffy, huge ears (k scales the design)
  function chinPaint(k) {
    const g = mixc(PAL.gray, '#FFFFFF', 0.25), P = (x, y) => [x * k, y * k];
    paint(ellPts(206 * k, 168 * k, 30 * k, 42 * k, 20, 0.25), g, { baseC: lite(g, 0.3), lw: 1.6 });
    for (const x of [80, 164]) { paint(ellPts(x * k, 62 * k, 38 * k, 44 * k, 24), g, { baseC: lite(g, 0.3), lw: 1.8 }); flat(ellPts(x * k, 66 * k, 22 * k, 28 * k, 20), PAL.pinkLt); }
    paint(ellPts(122 * k, 150 * k, 90 * k, 78 * k, 48, 0.07), g, { baseC: lite(g, 0.32), a: 140, lw: 2 });
    flat(ellPts(122 * k, 186 * k, 48 * k, 36 * k, 28), '#F5F2FA', 0.85);
    for (const x of [96, 148]) { flat(ellPts(x * k, 132 * k, 11 * k, 12 * k, 16), PAL.ink); flat(ellPts((x - 3) * k, 128 * k, 4 * k, 4 * k, 10), '#FFFFFF'); }
    flat(ellPts(78 * k, 156 * k, 12 * k, 9 * k, 14), PAL.pink, 0.55); flat(ellPts(166 * k, 156 * k, 12 * k, 9 * k, 14), PAL.pink, 0.55);
    flat([P(114, 150), P(130, 150), P(122, 160)], PAL.pink);
    pen(PAL.inkSoft, 1.2, 'pen');
    for (const s of [-1, 1]) for (const d of [-6, 4]) brush.line((122 + s * 16) * k, (156 + d * 0.5) * k, (122 + s * 58) * k, (150 + d * 1.6) * k);
    brush.noStroke();
    for (const x of [92, 152]) { const e = ellPts(x * k, 222 * k, 20 * k, 10 * k, 16); flat(e, lite(g, 0.3)); pen(PAL.ink, 1.4, '2B'); brush.polygon(e); brush.noStroke(); }
  }
  defSprite('s15_chin', 250, 240, () => chinPaint(1), { v: 2, ay: 0.95 });
  defSprite('s15_chin_big', 500, 480, () => chinPaint(2), { v: 1, ay: 0.95 });
  // the glowing "super-dense" cube, chinchillas squashed inside
  defSprite('s15_cube', 340, 340, () => {
    paint([[60, 120], [120, 60], [290, 60], [230, 120]], PAL.butterLt, { baseC: '#FFF7D6', a: 120, lw: 2.2 });
    paint([[230, 120], [290, 60], [290, 230], [230, 290]], PAL.butter, { baseC: '#FFE7A0', a: 120, lw: 2.2 });
    const g = mixc(PAL.gray, '#FFFFFF', 0.25);
    for (const [x, y, r] of [[100, 170, 34], [170, 160, 36], [120, 240, 36], [196, 236, 32], [150, 200, 28]]) {
      flat(ellPts(x, y, r, r * 0.9, 20), lite(g, 0.2)); pen(PAL.ink, 1.2, 'pen'); brush.polygon(ellPts(x, y, r, r * 0.9, 20)); brush.noStroke();
      flat(ellPts(x - 9, y - 4, 4, 4, 8), PAL.ink); flat(ellPts(x + 9, y - 4, 4, 4, 8), PAL.ink);
    }
    paint([[60, 120], [230, 120], [230, 290], [60, 290]], PAL.butterLt, { baseC: '#FFFBE8', baseA: 0.35, a: 60, lw: 2.6 });
    flat([[76, 134], [120, 134], [84, 200], [76, 200]], '#FFFFFF', 0.55);
  }, { v: 1 });

  // flip-flops (sole colour + strap colour per variant)
  const FLOPC = [[PAL.pink, PAL.red], [PAL.mint, PAL.teal], [PAL.sky, PAL.blue], [PAL.butter, PAL.orange]];
  defSprite('s15_flop', 150, 280, (v) => {
    const [c, st] = FLOPC[v];
    const sole = [[75, 22], [104, 30], [122, 58], [124, 94], [112, 134], [108, 164], [116, 198], [114, 232], [96, 254], [75, 260], [54, 254], [36, 232], [34, 198], [42, 164], [38, 134], [26, 94], [28, 58], [46, 30]];
    paint(sole, c, { baseC: lite(c, 0.25), lw: 2 });
    flat(scalePts(sole, 75, 140, 0.8), lite(c, 0.45), 0.8);
    strokePath([[30, 128], [75, 66], [120, 128]], PAL.ink, 11, 'marker', 0.5);
    strokePath([[30, 128], [75, 66], [120, 128]], st, 7, 'marker', 0.5);
    paint(ellPts(75, 64, 12, 12, 16), PAL.butterLt, { baseC: '#FFFFFF', lw: 1.2 });
  }, { v: 4 });

  // the boombox serpent: segments, head (crown + shades), boombox, disco ball, notes
  defSprite('s15_seg', 150, 150, () => { paint(ellPts(75, 75, 58, 58, 32, 0.03), PAL.green, { baseC: '#86DDAE', a: 150, lw: 2 }); flat(ellPts(58, 56, 16, 13, 14), PAL.mintLt, 0.8); }, { v: 2 });
  defSprite('s15_seg_b', 150, 150, () => { paint(ellPts(75, 75, 58, 58, 32, 0.03), PAL.butter, { baseC: '#FFE7A0', a: 150, lw: 2 }); flat(ellPts(58, 56, 16, 13, 14), '#FFFFFF', 0.8); }, { v: 1 });
  defSprite('s15_snake_head', 340, 300, () => {
    paint(ellPts(160, 172, 124, 98, 44, 0.02), PAL.green, { baseC: '#86DDAE', a: 150, lw: 2.4 });
    flat(ellPts(226, 204, 74, 50, 28), '#D8F5E8', 0.9);
    flat(ellPts(262, 218, 16, 11, 14), PAL.pink, 0.6); flat(ellPts(110, 206, 18, 12, 14), PAL.pink, 0.5);
    strokePath([[214, 238], [254, 250], [292, 230]], PAL.ink, 2.8, 'pen', 0.5);
    paint(rrPts(126, 112, 84, 52, 16), PAL.black, { baseC: '#1C1628', lw: 1.6 });
    paint(rrPts(222, 112, 72, 52, 16), PAL.black, { baseC: '#1C1628', lw: 1.6 });
    pen(PAL.black, 5, 'marker'); brush.line(208, 128, 224, 128); brush.line(128, 128, 84, 146); brush.noStroke();
    flat([[142, 120], [162, 120], [148, 154], [138, 154]], '#FFFFFF', 0.5); flat([[236, 120], [254, 120], [242, 154], [232, 154]], '#FFFFFF', 0.5);
    paint([[122, 84], [212, 78], [210, 32], [188, 58], [168, 20], [148, 60], [124, 38]], PAL.gold, { baseC: '#FFD75A', lw: 1.8 });
    for (const [x, c] of [[146, PAL.red], [170, PAL.sky], [194, PAL.mint]]) flat(ellPts(x, 72, 6, 6, 10), c);
  }, { v: 1 });
  defSprite('s15_boombox', 320, 240, () => {
    strokePath([[92, 72], [104, 22], [216, 22], [228, 72]], PAL.ink, 7, 'marker', 0.3);
    paint(rrPts(20, 62, 280, 158, 26), PAL.lilac, { baseC: '#D2C2FF', lw: 2.4 });
    for (const x of [86, 234]) { paint(ellPts(x, 146, 52, 52, 32), PAL.ink, { baseC: '#3A2E5C', lw: 1.8 }); paint(ellPts(x, 146, 26, 26, 24), PAL.sky, { baseC: '#BFE4FF', lw: 1.4 }); flat(ellPts(x, 146, 8, 8, 12), PAL.ink); }
    paint(rrPts(128, 92, 64, 40, 6), PAL.butterLt, { baseC: '#FFF6D0', lw: 1.4 });
    for (let i = 0; i < 4; i++) flat(rrPts(124 + i * 18, 180, 12, 14, 3), [PAL.coral, PAL.mint, PAL.butter, PAL.sky][i]);
  }, { v: 1, ay: 0.09 });
  defSprite('s15_disco', 220, 250, () => {
    pen(PAL.grayLt, 3, 'pen'); brush.line(110, 0, 110, 44); brush.noStroke();
    paint(ellPts(110, 140, 90, 90, 40), PAL.grayLt, { baseC: '#EEEAF6', lw: 2 });
    const cs = ['#FFFFFF', PAL.skyLt, PAL.lilacLt, PAL.pinkLt, PAL.butterLt];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const x = 40 + c * 20, y = 70 + r * 20; if (Math.hypot(x - 110, y - 140) < 78) flat(rrPts(x - 8, y - 8, 16, 16, 2), cs[(r * 3 + c) % 5], 0.9); }
  }, { v: 2, ay: 0.02 });
  defSprite('s15_note', 100, 130, (v) => {
    const c = [PAL.butter, PAL.pink, PAL.mint][v];
    const e = ellPts(34, 100, 24, 17, 24, 0, -0.4);
    flat(e, c); pen(PAL.ink, 1.3, '2B'); brush.polygon(e);
    pen(c, 6, 'marker'); brush.line(55, 96, 55, 20); brush.line(55, 20, 84, 38);
  }, { v: 3 });

  // the smiling moon (eyes drawn separately so they can blink or turn into hearts)
  defSprite('s15_moon', 600, 600, () => {
    const disc0 = ellPts(300, 300, 250, 250, 64);
    paint(disc0, PAL.butterLt, { baseC: '#FFF6D2', a: 160, lw: 3, bleed: 0.02 });
    eraseOutside(disc0, 600, 600, 1.02);
    blob(215, 190, 52, PAL.butter, 90, 0.3); blob(405, 405, 60, PAL.butter, 80, 0.3);
    for (const [x, y, r] of [[380, 160, 26], [170, 430, 30], [330, 520, 18]]) flat(ellPts(x, y, r, r * 0.9, 20), PAL.butter, 0.5);
    for (const x of [185, 415]) flat(ellPts(x, 352, 40, 30, 24), PAL.pink, 0.45);
    strokePath([[236, 386], [300, 432], [364, 386]], PAL.ink, 4.5, 'pen', 0.5);
  }, { v: 1 });
  defSprite('s15_moon_eye', 120, 80, () => { pen(PAL.ink, 9, 'marker'); brush.spline([[14, 62], [60, 18], [106, 62]], 0.3); });

  // end card: wash strokes, hill, ribbon, title bloom
  function strokeBand(name, c) {
    defSprite(name, 1000, 300, () => {
      const top = [], bot = [];
      for (let i = 0; i <= 24; i++) { const x = i * 40; top.push([x, 40 + random() * 18 + Math.sin(i * 0.7) * 8]); bot.push([x, 262 - random() * 18 - Math.sin(i * 0.9) * 8]); }
      const end = [];
      for (let i = 1; i < 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; end.push([962 + Math.cos(a) * 30, 151 + Math.sin(a) * 108]); }
      const band = [...top, ...end, ...bot.reverse()];
      paint(band, c, { baseC: lite(c, 0.15), a: 150, line: false, bleed: 0.012, border: 0.5 });
      blob(320, 160, 95, lite(c, 0.35), 90, 0.3); blob(720, 140, 80, dark(c, 0.04), 70, 0.3);
      eraseOutside(band, 1000, 300, 1.012);
      strokePath(end.map(([x, y]) => [x - 8, y]), dark(c, 0.1), 3.2, 'marker', 0.5); // wet edge where the pigment pooled
    });
  }
  strokeBand('s15_band0', PAL.lilacLt);
  strokeBand('s15_band1', PAL.pinkLt);
  strokeBand('s15_band2', PAL.butterLt);
  defSprite('s15_hill', 1000, 260, () => {
    const pts = [[-20, 120]];
    for (let i = 0; i <= 20; i++) pts.push([i * 50, 96 + Math.sin(i * 0.42 + 0.6) * 30 + random() * 6]);
    pts.push([1020, 120], [1020, 280], [-20, 280]);
    paint(pts, PAL.grass, { baseC: '#BCE8A6', a: 140, lw: 2, bleed: 0.01, border: 0.5 });
    blob(700, 210, 150, PAL.grassDk, 60, 0.3); blob(250, 200, 130, PAL.mintLt, 80, 0.3);
    eraseOutside(pts, 1000, 260, 1.02);
    for (let i = 0; i < 30; i++) { const x = 20 + random() * 960, y = 150 + random() * 100, r = 4 + random() * 4; flat(ellPts(x, y, r, r, 10), [PAL.pink, PAL.butter, '#FFFFFF', PAL.lilac][i % 4]); flat(ellPts(x, y, r * 0.4, r * 0.4, 8), PAL.butter); }
  }, { ay: 0 });
  defSprite('s15_ribbon', 900, 200, () => {
    const cd = dark(PAL.butter, 0.12);
    paint([[30, 64], [160, 64], [160, 160], [30, 160], [74, 112]], cd, { baseC: lite(cd, 0.15), lw: 2 });
    paint([[870, 64], [740, 64], [740, 160], [870, 160], [826, 112]], cd, { baseC: lite(cd, 0.15), lw: 2 });
    paint(rrPts(110, 40, 680, 112, 18), PAL.butter, { baseC: '#FFE9A8', lw: 2.2, bleed: 0.02 });
    wc('#FFFFFF', 80, 0.02); brush.rect(130, 52, 640, 16); brush.noFill();
    // build the end-card text images now so the title frames never pay for them
    textImg("I'm Upping My", { size: 104, fill: PAL.ink, weight: 700, stroke: '#FFFFFF', sw: 8 });
    textImg('P(doom)', { size: 240, fill: PAL.coral, weight: 700, stroke: PAL.ink, sw: 12, shadow: 'rgba(43,33,64,0.9)' });
    textImg('P(doom) = 99.9%', { font: 'pixel', size: 66, fill: PAL.ink, weight: 700 });
    eraseOutside([[30, 64], [110, 64], [110, 40], [790, 40], [790, 64], [870, 64], [826, 112], [870, 160], [790, 160], [790, 152], [110, 152], [110, 160], [30, 160], [74, 112]], 900, 200, 1.01);
  });
  defSprite('s15_bloom', 900, 420, () => { blob(450, 210, 175, PAL.pinkLt, 150, 0.35); blob(290, 170, 115, PAL.butterLt, 130, 0.35); blob(640, 250, 125, PAL.lilacLt, 120, 0.35); });

  // ================= small helpers =================
  const pArm = (a) => (a >= 0 ? lerp(1.0, 2.6, a) : lerp(1.0, 0.15, -a));
  const cArm = (a) => (a >= 0 ? lerp(-0.1, -1.35, a) : lerp(-0.1, 0.85, -a));
  // confetti burst with fixed colours and a paper flutter
  function cburst(T, t0, x, y, o = {}) {
    const age = T - t0, life = o.life ?? 1.6;
    if (age < 0 || age > life) return;
    const n = o.n ?? 40, drag = o.drag ?? 2.4, g = o.g ?? 700, spd = o.spd ?? 1600;
    const e = (1 - Math.exp(-age * drag)) / drag;
    const fade = 1 - inv(life * 0.7, life, age);
    for (let i = 0; i < n; i++) {
      const sd = (o.seed || 0) + i * 1.37;
      const ang = (o.ang0 ?? -Math.PI / 2) + (o.spread ?? TAU) * (R(sd, 1) - 0.5);
      const sp = spd * (0.3 + 0.7 * R(sd, 2));
      const px = x + Math.cos(ang) * sp * e + Math.sin(age * 4 + i) * 24 * age;
      const py = y + Math.sin(ang) * sp * e + 0.5 * g * age * age;
      const fl = Math.cos(age * (8 + 6 * R(sd, 3)) + i);
      spr(o.name || 's15_conf', px, py, { v: (o.v0 || 0) + (i % (o.nv || 8)), s: (o.s ?? 0.7) * (0.6 + 0.6 * R(sd, 4)), sx: 0.25 + 0.75 * Math.abs(fl), r: age * 6 * RS(sd, 5) + R(sd, 6) * TAU, a: fade, seed: i });
    }
  }
  // looping confetti shower in a box
  function confRain(T, n, seed, box, spd = 260, s0 = 0.6, a = 1) {
    for (let i = 0; i < n; i++) {
      const ph = fract(R(i, seed) + (T * spd) / box[3] * (0.7 + 0.3 * R(i, seed + 1)));
      const y = box[1] + ph * box[3];
      const x = box[0] + R(i, seed + 2) * box[2] + Math.sin(T * 2.2 + i * 1.7) * 40;
      const fl = Math.cos(T * (7 + 5 * R(i, seed + 3)) + i);
      spr('s15_conf', x, y, { v: i % 8, s: s0 * (0.6 + 0.7 * R(i, seed + 4)), sx: 0.25 + 0.75 * Math.abs(fl), r: T * 3 * RS(i, seed + 5) + i, a: a * sstep(0, 0.05, ph) * (1 - sstep(0.9, 1, ph)), seed: i });
    }
  }
  // cartoon sunburst (every other wedge)
  function rays(cx, cy, n, cols, a, rot, R0 = 2600) {
    noStroke();
    for (let i = 0; i < n; i += 2) {
      const a0 = rot + (i / n) * TAU, a1 = rot + ((i + 1) / n) * TAU;
      fill(withAlphaCol(cols[(i / 2) % cols.length], a));
      triangle(cx, cy, cx + Math.cos(a0) * R0, cy + Math.sin(a0) * R0, cx + Math.cos(a1) * R0, cy + Math.sin(a1) * R0);
    }
  }
  // paint splats that smack onto the lens, then slide and fade
  function lensSplats(T, t0, list, life = 0.9) {
    const age = T - t0;
    if (age < 0 || age > life) return;
    list.forEach(([x, y, s, v], i) => {
      const a2 = age - i * 0.04; if (a2 < 0) return;
      spr('s15_splat', x, y + a2 * a2 * 60, { v, s: s * Ez.outBack(clamp(a2 / 0.09), 2.5), r: i * 1.9, a: 1 - inv(life * 0.55, life, a2), seed: i });
    });
  }

  // ================= slot 0 theatre: audience + the s14 spotlight =================
  // the house (dark silhouettes in the same seats s14 uses), dim until the hit, then on their feet cheering
  const SIL = mixc(PAL.ink, PAL.night, 0.35), DARK = mixc(PAL.night, PAL.black, 0.45);
  defSprite('s15_fan', 170, 200, (v) => {
    if (v === 1) flat(ellPts(85, 32, 26, 22, 20), SIL);
    if (v === 2) { flat(ellPts(58, 36, 13, 34, 16, 0, -0.25), SIL); flat(ellPts(112, 36, 13, 34, 16, 0, 0.25), SIL); }
    if (v === 3) for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; flat(ellPts(85 + Math.cos(a) * 44, 84 + Math.sin(a) * 44, 22, 22, 16), SIL); }
    flat(rrPts(22, 120, 126, 90, 40), SIL); flat(ellPts(85, 86, 44, 48, 28), SIL);
    pen(PAL.lilac, 2.2, 'pen'); brush.spline([[48, 70], [66, 44], [96, 40], [120, 58]], 0.5);
  }, { v: 4, ax: 0.5, ay: 1 });
  const FANS = [];
  for (let i = 0; i < 11; i++) FANS.push({ x: 90 + i * 178 + RS(i, 81) * 20, y: 1062, s: 0.62 + R(i, 82) * 0.1, v: i % 4 });
  for (let i = 0; i < 9; i++) FANS.push({ x: 180 + i * 200 + RS(i, 83) * 26, y: 1130, s: 0.86 + R(i, 84) * 0.1, v: (i + 2) % 4 });
  function audience(T) {
    const sink = 280 * Ez.in(inv(T_BOOM + 0.05, SL[1], T));
    if (sink >= 270) return;
    const arms = [[], []];
    FANS.forEach((f, i) => {
      const live = T > T0 + 0.01;
      const jump = live ? Math.max(0, Math.sin(Math.PI * clamp((T - T0 - R(i, 88) * 0.1) / 0.5))) * 90 * f.s : 0;
      const bob = live ? hopB(T + R(i, 85) * 0.1) * (12 + R(i, 86) * 12) : 0;
      const y = f.y - jump - bob + sink;
      if (live && i % 3 !== 1) { // raised arms (round line caps make the fists), batched per row
        const wv = Math.sin(T * 9 + i) * 16;
        for (const sd of [-1, 1]) arms[i < 11 ? 0 : 1].push([f.x + sd * 30 * f.s, y - 60 * f.s, f.x + sd * (58 + wv * 0.4) * f.s, y - 170 * f.s + (sd > 0 ? wv : -wv) * f.s]);
      }
      spr('s15_fan', f.x, y, { v: f.v, s: f.s, r: RS(i, 87) * 0.08 + (live ? 0.05 * Math.sin(T * 5 + i) : 0), seed: i });
    });
    segLines(arms[0], SIL, 24); segLines(arms[1], SIL, 32);
  }
  // darkness everywhere except a feathered ellipse (the same spotlight s14 closes on)
  function spotDark(cx, cy, rx, ry, a, fe = 1.28) {
    const N = 56, cIn = withAlphaCol(DARK, 0), cOut = withAlphaCol(DARK, a);
    noStroke();
    beginShape(TRIANGLE_STRIP);
    for (let i = 0; i <= N; i++) { const t = (i / N) * TAU, c = Math.cos(t), sn = Math.sin(t); fill(cIn); vertex(cx + c * rx, cy + sn * ry); fill(cOut); vertex(cx + c * rx * fe, cy + sn * ry * fe); }
    endShape();
    beginShape(TRIANGLE_STRIP);
    for (let i = 0; i <= N; i++) { const t = (i / N) * TAU, c = Math.cos(t), sn = Math.sin(t); fill(cOut); vertex(cx + c * rx * fe, cy + sn * ry * fe); vertex(cx + c * 4000, cy + sn * 4000); }
    endShape();
  }

  // ================= dancers =================
  const STY = {
    cheer: (k) => (k & 1) ? [0.3, 0.3, 0] : [1, 1, 0],
    alt: (k) => (k & 1) ? [-0.5, 1, -0.1] : [1, -0.5, 0.1],
    wobble: (k) => (k & 1) ? [0.8, -0.1, -0.18] : [-0.1, 0.8, 0.18],
    pump: (k) => (k & 1) ? [0.45, 0.45, 0] : [1.05, 1.05, 0],
    point: (k) => (k & 1) ? [-0.3, 1.1, 0.04] : [0, 1.0, 0.1],
  };
  function styleAt(T) {
    if (T < SL[2]) return 'alt';
    if (T < SL[3]) return 'wobble';
    if (T < SL[4]) return 'cheer';
    if (T < SL[5]) return 'alt';
    if (T < SL[6]) return 'pump';
    if (T < T_DOCK) return 'point';
    return 'cheer';
  }
  function groove(T, style, mirror = false) {
    const b = beatAt(T), k = b.i - HB, ph = clamp(b.ph);
    const f = STY[style] || STY.cheer;
    const e = Ez.outBack(clamp(ph * 3.2));
    const A = f(k - 1), B = f(k);
    let aL = lerp(A[0], B[0], e), aR = lerp(A[1], B[1], e), r = lerp(A[2], B[2], e);
    if (mirror) { const t = aL; aL = aR; aR = t; r = -r; }
    return { aL, aR, r, hop: Math.sin(Math.PI * ph), land: Math.exp(-ph * 10), k, ph };
  }
  // group backflip on T_FLIP (crouch, spin, land)
  function flipState(T) {
    if (T < T_FLIP - 0.22 || T > T_LAND + 0.22) return null;
    if (T < T_FLIP) return { hop: 0, spin: 0, sq: 1 + 0.26 * Ez.out(inv(T_FLIP - 0.22, T_FLIP, T)), arms: -0.7 };
    if (T < T_LAND) { const u = inv(T_FLIP, T_LAND, T); return { hop: 290 * 4 * u * (1 - u), spin: -TAU * Ez.inOut(u), sq: 1 - 0.08 * Math.sin(Math.PI * u), arms: 1 }; }
    return { hop: 0, spin: 0, sq: 1 + 0.22 * (1 - Ez.out(inv(T_LAND, T_LAND + 0.22, T))), arms: 1 };
  }
  function pipPose(x, y, s, T, o) {
    const g = o.g, fs = o.flip;
    const hop = fs ? fs.hop : g.hop * 26 * (o.hopK ?? 1);
    const sq = fs ? fs.sq : 1 + 0.12 * g.land - 0.05 * g.hop;
    const armL = fs ? pArm(fs.arms) : pArm(g.aL), armR = fs ? pArm(fs.arms) : pArm(g.aR);
    const opt = { face: o.face, hat: 'party', armL, armR, sq, legs: [-0.25 * g.hop, 0.25 * g.hop], lean: g.r * 0.6, r: fs ? 0 : g.r * 0.5, body: o.body, arm: o.arm, head: o.head, seed: o.seed || 0, walk: o.walk };
    if (fs && fs.spin) { push(); translate(x, y - hop - 150 * s); rotate(fs.spin); pip(0, 150 * s, s, opt); pop(); }
    else pip(x, y, s, { ...opt, hop });
  }
  function clawdPose(x, y, s, T, o) {
    const g = o.g, fs = o.flip;
    const hop = fs ? fs.hop : g.hop * 32 * (o.hopK ?? 1);
    const sq = fs ? fs.sq : 1 + 0.14 * g.land - 0.07 * g.hop;
    const armL = fs ? cArm(fs.arms) : cArm(g.aL), armR = fs ? cArm(fs.arms) : cArm(g.aR);
    const legs = [[0, -0.22 * g.hop], [0, -0.08 * g.hop], [0, 0.08 * g.hop], [0, 0.22 * g.hop]];
    const opt = { eyes: o.eyes, look: o.look, acc: o.acc, armL, armR, sq, legs, blush: true, r: fs ? 0 : g.r * 0.6, walk: o.walk };
    if (fs && fs.spin) { push(); translate(x, y - hop - 5 * CU * s); rotate(fs.spin); clawd(0, 5 * CU * s, s, opt); pop(); }
    else clawd(x, y, s, { ...opt, hop });
  }
  const FR = [
    { body: 'npc_body_mint', arm: 'npc_arm_mint', head: 'npc_head2', x: 470, y: 934, s: 0.7, tj: bt(9), from: -200, seed: 11 },
    { body: 'npc_body_butter', arm: 'npc_arm_butter', head: 'npc_head3', x: 1478, y: 932, s: 0.7, tj: bt(13), from: 2120, seed: 23 },
    { body: 'npc_body_sky', arm: 'npc_arm_sky', head: 'npc_head2', x: 1735, y: 940, s: 0.64, tj: bt(17), from: 2160, seed: 37 },
  ];
  function friends(T) {
    const st = styleAt(T), fs = flipState(T);
    FR.forEach((f, i) => {
      if (T < f.tj - 0.35) return;
      const m = Ez.out(inv(f.tj - 0.35, f.tj + 0.2, T));
      const x = lerp(f.from, f.x, m);
      const g = groove(T - 0.05 * (i + 1), st, i % 2 === 0);
      const face = T > SL[5] && T < SL[6] ? 'pf_cool' : T > T_DOCK ? 'pf_love' : 'pf_happy';
      pipPose(x, f.y, f.s, T, { g, flip: fs, face, body: f.body, arm: f.arm, head: f.head, seed: f.seed, walk: m < 1 ? T * 3 : null, hopK: 0.9 });
    });
  }
  // Pip and Clawd: positions over the whole finale (shared by every shot so transitions line up)
  function mainPos(T) {
    let px = 760, py = 962, ps = 0.82, cx = 1165, cy = 958, cs = 0.72;
    if (T < SL[1] + 0.05) { const k = Ez.inOut(inv(T_BOOM + 0.05, SL[1] + 0.05, T)); px = lerp(440, px, k); cx = lerp(1480, cx, k); py = lerp(905, py, k); cy = lerp(900, cy, k); ps = lerp(0.9, ps, k); cs = lerp(0.8, cs, k); }
    if (T > E_MOVE0) { const k = Ez.inOut(inv(E_MOVE0, E_MOVE1, T)); px = lerp(px, 1290, k); cx = lerp(cx, 1650, k); py = lerp(py, 985, k); cy = lerp(cy, 978, k); ps = lerp(ps, 1.12, k); cs = lerp(cs, 0.98, k); }
    return { px, py, ps, cx, cy, cs };
  }
  function mainLooks(T) {
    let face = 'pf_happy', eyes = 'ce_happy', acc = ['party'], look = [0, 0];
    if (T < T_BOOM) { face = T < T_CRACK ? 'pf_happy' : 'pf_shock'; eyes = T < T_CRACK - 0.25 ? 'ce_star' : 'ce_sq'; look = T < T_CRACK - 0.25 ? [0, 0] : [0.4, -0.35]; }
    else if (T < SL[2]) { face = 'pf_love'; eyes = 'ce_happy'; }
    else if (T < SL[3]) { face = 'pf_dizzy'; eyes = 'ce_spiral'; }
    else if (T < SL[4]) { face = 'pf_love'; eyes = 'ce_heart'; }
    else if (T < SL[5]) { const air = T > T_FLIP - 0.25 && T < T_LAND; face = air ? 'pf_shock' : 'pf_happy'; eyes = air ? 'ce_star' : 'ce_happy'; }
    else if (T < SL[6]) { face = 'pf_cool'; eyes = 'ce_sq'; acc = ['party', 'shades']; }
    else { face = T < T_DOCK ? 'pf_happy' : 'pf_love'; eyes = T < T_DOCK ? 'ce_sq' : 'ce_heart'; look = T < T_DOCK ? [0.3, -0.35] : [0, 0]; }
    return { face, eyes, acc, look };
  }
  function mainDancers(T) {
    const P = mainPos(T), L = mainLooks(T);
    const running = T > T_BOOM && T < SL[1] + 0.05;
    let gP, gC;
    if (T < T_BOOM) { gP = groove(T, 'cheer'); gC = groove(T, 'cheer'); }
    else if (running) { const r = { aL: 0.4, aR: 0.4, r: 0, hop: Math.abs(Math.sin(T * 14)), land: 0, k: 0, ph: 0 }; gP = r; gC = r; }
    else { const st = styleAt(T); gP = groove(T, st); gC = groove(T, st, true); }
    const fs = flipState(T);
    // at the hit both strike a "ta-da" pose
    if (T < T0 + 0.5) { const k = 1 - inv(T0 + 0.3, T0 + 0.5, T); gP = { ...gP, aL: lerp(gP.aL, 1.1, k), aR: lerp(gP.aR, 1.1, k) }; gC = { ...gC, aL: lerp(gC.aL, 1.1, k), aR: lerp(gC.aR, 1.1, k) }; }
    pipPose(P.px, P.py, P.ps, T, { g: gP, flip: fs, face: L.face, walk: running ? T * 3.4 : null });
    clawdPose(P.cx, P.cy, P.cs, T, { g: gC, flip: fs, eyes: L.eyes, acc: L.acc, look: L.look, walk: running ? T * 3.4 : null });
  }

  // ================= slot 0: curtains + gauge =================
  function gaugeAct(T) {
    const age = T - T_BOOM;
    if (age > 0.1) return;
    const strain = inv(141.0, T_BOOM, T);
    const gs = 0.88 * (1 + 0.035 * kick(T, 7) + (age > 0 ? Ez.out(age / 0.1) * 0.25 : 0));
    const a = age > 0 ? 1 - age / 0.1 : 1;
    push();
    translate(RS(G.boil, 21) * 12 * strain, RS(G.boil, 22) * 12 * strain);
    drawGauge(960, 470, gs, pdoomAt(T), { wobble: 0.015 + 0.09 * strain, a });
    push(); translate(960, 470); scale(gs);
    if (T > T_CRACK) spr('s15_crack', -210, -60, { a, s: Ez.outBack(clamp((T - T_CRACK) / 0.1)) });
    if (T > T_CRACK + 0.23) spr('s15_crack', 230, -10, { a, r: 1.3, s: 0.8 * Ez.outBack(clamp((T - T_CRACK - 0.23) / 0.1)) });
    pop();
    // steam puffs from the strain
    for (let i = 0; i < 4; i++) { const t = fract(T * 2.2 + i / 4); if (strain > 0) spr('puff', 960 + (i % 2 ? 470 : -470) * gs, 520 - t * 220, { s: 0.25 + t * 0.4, a: strain * (1 - t), seed: i }); }
    pop();
  }
  function boomFX(T, flash) {
    const age = T - T_BOOM;
    if (age < 0 || age > 2.3) return;
    for (let i = 0; i < 3; i++) { const a2 = age - i * 0.09; if (a2 > 0 && a2 < 0.7) spr('ring', 960, 560, { s: a2 * 7, a: 1 - a2 / 0.7, seed: i }); }
    cburst(T, T_BOOM, 960, 600, { name: 's15_shard', nv: 5, n: 18, spd: 2300, g: 1500, drag: 1.8, life: 1.4, s: 1.1, seed: 150 });
    cburst(T, T_BOOM, 960, 560, { n: 66, spd: 2600, g: 800, drag: 2.3, life: 2.3, s: 0.9, seed: 300 });
    burst(T, T_BOOM, 960, 560, { n: 14, names: ['spark', 'star5', 'sparkW'], spd: 1800, g: 300, life: 1.0, s: 0.6, seed: 77 });
    lensSplats(T, T_BOOM + 0.03, [[560, 330, 1.0, 1], [1420, 360, 1.15, 3], [1300, 760, 0.8, 2], [640, 740, 0.9, 0]], 0.8);
    if (flash && age < 0.14) { noStroke(); fill(withAlphaCol(PAL.paper, 0.55 * (1 - age / 0.14))); rect(-60, -60, W + 120, H + 120); }
  }
  shot({
    id: 'finale-open', t0: T0, tin: { type: 'cut', d: 0 },
    draw(s) {
      const T = s.T, age = T - T0;
      const open = Ez.out(inv(T0, T0 + 0.34, T));
      const lights = sstep(T0, T0 + 0.12, T);
      const Z = 1 + 0.05 * Math.sin(Math.PI * clamp(age / 0.6)) * (age > 0 ? 1 : 0) + 0.012 * kick(T, 8) * lights;
      push();
      shake(18 * inv(T0, T0 + 0.03, T) * Math.exp(-Math.max(0, age) * 6) + (T > T_BOOM ? 20 * Math.exp(-(T - T_BOOM) * 7) : 0), 3);
      cam(960, 540, Z);
      washBG('s15_bg_party');
      rays(960, 700, 22, [PAL.butter, PAL.pinkLt, '#FFFFFF'], 0.4, T * 0.3);
      spr('s15_floor', 960, 1000, { s: 2, jit: 0 });
      twinkles(T, 10, 5, [120, 120, 1680, 600], ['spark', 'star5'], 0.15, 0.32, 4);
      gaugeAct(T);
      mainDancers(T);
      const seam = 1 - inv(0.02, 0.14, open); // keep the stage from showing through the shut seam
      if (seam > 0) { noStroke(); fill(withAlphaCol(DARK, seam)); rect(890, -60, 140, 1200); }
      if (lights < 1) { noStroke(); fill(withAlphaCol(DARK, 0.6 * (1 - lights))); rect(-60, -60, W + 120, H + 120); } // dim set walls at the sides
      drawCurtains(open, T);
      audience(T);
      // the house is dark with one spotlight on the seam (s14's last frame); the lights slam up on the hit
      if (lights < 1) {
        spotDark(960, 640, 290, 330, 0.82 * (1 - lights));
        blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.butterLt, 0.1 * (1 - lights))); triangle(960, -60, 690, 1120, 1230, 1120); blendMode(BLEND);
        glow(960, 640, 280, PAL.butterLt, 0.45 * (1 - lights));
      }
      // confetti cannons from both corners + sparkles on the hit
      cburst(T, T0, -40, 1100, { n: 44, ang0: -0.95, spread: 0.7, spd: 3000, g: 1100, drag: 1.6, life: 1.55, s: 0.9, seed: 10 });
      cburst(T, T0, W + 40, 1100, { n: 44, ang0: -Math.PI + 0.95, spread: 0.7, spd: 3000, g: 1100, drag: 1.6, life: 1.55, s: 0.9, seed: 90 });
      burst(T, T0 + 0.02, 960, 520, { n: 22, names: ['spark', 'sparkW', 'star5'], spd: 1600, g: 200, life: 1.1, s: 0.55, even: true, seed: 5 });
      lensSplats(T, T0 + 0.04, [[210, 250, 1.1, 0], [1730, 230, 1.2, 1], [1690, 820, 0.9, 2], [300, 700, 0.85, 3]], 0.9);
      pop();
      boomFX(T, true);
    },
  });

  // ================= slot 1: paperclips =================
  const CLIPS = [];
  for (let i = 0; i < 60; i++) CLIPS.push({ ts: SL[1] - 0.3 + i * 0.035 + R(i, 41) * 0.05, x: 60 + R(i, 42) * 1800, s: 0.45 + R(i, 43) * 0.35, v: i % 6, spin: RS(i, 44) * 7, front: i % 4 === 0 });
  const pileTop = (T) => lerp(1240, 868, Ez.out(inv(SL[1] - 0.2, SL[2], T))) - 16 * kick(T, 9) * (T > SL[1] ? 1 : 0);
  function clipRain(T, front) {
    const top = pileTop(T);
    for (const c of CLIPS) {
      if (c.front !== front) continue;
      const age = T - c.ts; if (age < 0) continue;
      const y = -160 + 300 * age + 0.5 * 2600 * age * age;
      const land = top + 40 + (c.front ? 60 : 0);
      if (y > land + 40) continue;
      spr('s15_clip', c.x, Math.min(y, land), { v: c.v, s: c.s * (c.front ? 1.25 : 1), r: c.spin * age, seed: c.v });
    }
  }
  function clipBunting(T) {
    for (let row = 0; row < 2; row++) {
      const sag = 90 + row * 50 + 22 * kick(T, 5), y0 = 20 + row * 56, n = 15;
      const pt = (u) => [lerp(-60, W + 60, u), y0 + sag * 4 * u * (1 - u) + Math.sin(T * 4 + u * 9 + row) * 8];
      noFill(); stroke(withAlphaCol(PAL.ink, 0.6)); strokeWeight(3); beginShape(); for (let i = 0; i <= 30; i++) { const [x, y] = pt(i / 30); vertex(x, y); } endShape(); noStroke();
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5 + row * 0.5) / (n + 0.5); const [x, y] = pt(u);
        spr('s15_clip', x, y + 50, { v: (i + row * 3) % 6, s: 0.42, r: Math.sin(T * 6 + i * 0.8) * 0.25 + (i % 2 ? 0.1 : -0.1), seed: i });
      }
    }
  }
  // the hero: a giant paperclip rising out of the pile and grooving
  function giantClip(T) {
    const rise = Ez.outBack(inv(SL[1] - 0.05, SL[1] + 0.45, T), 1.4);
    if (rise <= 0) return;
    const k = kick(T, 7), b = beatAt(T);
    const sway = Math.sin(Math.PI * (b.i - HB) + Math.PI * clamp(b.ph)) * 0.16;
    spr('s15_clip', 960, lerp(1250, 470, rise), { v: 5, s: 2.5 * (1 + 0.04 * k), sy: 1 - 0.05 * k, r: sway, seed: 3 });
  }
  function starMask(p) {
    const r1 = 2800 * Math.pow(p, 1.1), r2 = r1 * 0.6;
    beginShape(); for (const [x, y] of starPts(960, 560, r1, r2, 14, p * 1.3)) vertex(x, y); endShape(CLOSE);
  }
  shot({
    id: 'parade-clips', t0: SL[1], tin: { type: 'mask', d: 0.36, at: 0.5, mask: (p) => starMask(p) },
    draw(s) {
      const T = s.T;
      push(); cam(960, 540, 1.02 + 0.015 * kick(T, 8));
      washBG('s15_bg_clips');
      rays(960, 1250, 26, [PAL.lilacLt, '#FFFFFF'], 0.55, -T * 0.25);
      clipBunting(T);
      giantClip(T);
      clipRain(T, false);
      spr('s15_clip_pile', 960, pileTop(T), { s: 2, jit: 0.3 });
      mainDancers(T);
      spr('s15_clip_pile', 960, pileTop(T) + 92, { s: 2.1, flip: true, jit: 0.3, seed: 3 });
      clipRain(T, true);
      pop();
      boomFX(T, false);
    },
  });

  // ================= slot 2: red-cap mushrooms =================
  const SHROOMS = [ // x, ground y, scale, sprout beat, front, big
    [960, 800, 1.0, 8, 0, 1], [1640, 862, 0.85, 8, 0, 0], [520, 850, 0.75, 9, 0, 0], [1340, 830, 0.6, 9, 0, 0],
    [200, 868, 0.9, 10, 0, 0], [1860, 880, 0.7, 10, 0, 0], [690, 800, 0.45, 11, 0, 0], [1200, 790, 0.45, 11, 0, 0],
    [610, 1090, 1.05, 10, 1, 0], [1360, 1092, 1.15, 11, 1, 0], [1800, 1085, 1.0, 9, 1, 0],
  ];
  const DOMES = [[960, 560], [1640, 760], [520, 780]];
  function shroomField(T, front) {
    SHROOMS.forEach(([x, y, sc, kb, fr, big], i) => {
      if (fr !== front) return;
      const t0 = bt(kb) - 0.04, age = T - t0;
      if (age < 0) return;
      const grow = Ez.outBack(clamp(age / 0.28), 2.2);
      const k = kick(T, 7);
      const sx = sc * grow * (1 + 0.1 * k), sy = sc * grow * (1 - 0.1 * k);
      spr(big ? 's15_shroom_big' : 's15_shroom', x, y, { sx, sy, r: Math.sin(T * 3 + i) * 0.07, seed: i });
    });
  }
  function kaleido(T) {
    const c4 = [PAL.pinkLt, PAL.lilacLt, PAL.mintLt, PAL.butterLt];
    const h = T * 1.6, i0 = Math.floor(h), f = h - i0;
    const cA = mixc(c4[i0 % 4], c4[(i0 + 1) % 4], f), cB = mixc(c4[(i0 + 2) % 4], c4[(i0 + 3) % 4], f);
    rays(960, 560, 24, [cA, cB], 0.6, T * 0.7);
    for (let i = 0; i < 5; i++) { const r = fract(T * 0.9 + i / 5) * 1400; ringLine(960, 560, r, i % 2 ? PAL.pink : PAL.butter, 30, 0.5 * (1 - r / 1400)); }
  }
  function puffFrontY(T) { return lerp(1300, -320, Ez.inOut(inv(SL[3] - 0.25, SL[3] + 0.25, T))); }
  function puffFront(T) {
    if (T < SL[3] - 0.25 || T > SL[3] + 0.25) return;
    const yf = puffFrontY(T);
    for (let i = 0; i < 15; i++) spr('puff', i * 140 - 20, yf + RS(i, 3) * 30, { s: 1.15 + R(i, 4) * 0.3, r: i, seed: i });
  }
  shot({
    id: 'parade-shrooms', t0: SL[2],
    tin: { type: 'mask', d: 0.44, at: 0.5, mask: (p) => { DOMES.forEach(([x, y], i) => { const r = Math.max(0, p * 1.3 - i * 0.12) * 1900; if (r > 0) circle(x, y, r * 2); }); } },
    draw(s) {
      const T = s.T;
      push(); cam(960, 540, 1.02 + 0.02 * kick(T, 8), Math.sin(T * 2.2) * 0.012);
      washBG('s15_bg_shroom');
      kaleido(T);
      shroomField(T, 0);
      floaters(T, 14, 5, ['sparkW', 'spark', 'star5'], [100, 250, 1720, 700], 140, 0.25, 30);
      friends(T);
      mainDancers(T);
      shroomField(T, 1);
      // spore puff from the big cap on the last beat
      burst(T, bt(11), 960, 330, { n: 12, names: ['puff'], spd: 700, g: -100, life: 0.9, s: 0.4, seed: 21 });
      pop();
      puffFront(T);
    },
  });

  // ================= slot 3: chinchillas =================
  const CHINS = [ // landing x, y, scale, delay, front
    [400, 875, 0.62, 0.0, 0], [1040, 902, 0.5, 0.04, 0], [1845, 890, 0.6, 0.02, 0],
    [660, 820, 0.4, 0.06, 0], [1290, 812, 0.4, 0.08, 0], [1600, 830, 0.44, 0.05, 0], [230, 820, 0.45, 0.09, 0],
    [620, 1065, 0.8, 0.03, 1], [1330, 1070, 0.82, 0.07, 1], [1660, 1058, 0.72, 0.1, 1], [950, 1080, 0.72, 0.12, 1],
  ];
  function cubeAct(T) {
    const age = T - T_CUBE;
    if (age > 0.12) return;
    const shake2 = inv(SL[3] - 0.2, T_CUBE, T);
    const s = 1.15 * (1 + 0.07 * kick(T, 8) + (age > 0 ? Ez.out(age / 0.12) * 0.4 : 0));
    const a = age > 0 ? 1 - age / 0.12 : 1;
    glow(960, 460, 300, PAL.butter, 0.35 * a);
    spr('s15_cube', 960 + RS(G.boil, 31) * 8 * shake2, 460 + RS(G.boil, 32) * 8 * shake2, { s, a, r: Math.sin(T * 30) * 0.03 * shake2 });
  }
  // the "super-dense" cube decompresses into one giant fluffy chinchilla
  function giantChin(T) {
    const age = T - T_CUBE;
    if (age < 0) return;
    const g = Ez.outElastic(clamp(age / 0.7));
    const k = kick(T, 7);
    spr('s15_chin_big', 960, lerp(560, 820, Ez.out(clamp(age / 0.45))), { s: lerp(0.15, 1.05, g), sx: 1 + 0.06 * k, sy: 1 - 0.06 * k, r: Math.sin(T * 2.4) * 0.05 });
  }
  function chinchillas(T, front) {
    const g = beatAt(T);
    CHINS.forEach(([lx, ly, sc, dl, fr], i) => {
      if (fr !== front) return;
      const t0 = T_CUBE + dl, age = T - t0;
      if (age < 0) return;
      const u = clamp(age / 0.5);
      let x = lerp(960, lx, u), y = lerp(460, ly, u) - 460 * 4 * u * (1 - u), r = (1 - u) * RS(i, 5) * 7, sq = 1;
      if (u >= 1) { const hb = Math.abs(Math.sin(Math.PI * (g.ph + R(i, 6) * 0.3))); y -= hb * 60 * sc; sq = 1 + 0.18 * Math.exp(-g.ph * 9); r = Math.sin(T * 5 + i) * 0.08; }
      spr('s15_chin', x, y, { s: sc * lerp(0.5, 1, u), sx: sq, sy: 1 / sq, r, seed: i, flip: i % 2 === 1 });
    });
    // one rides on Clawd's head
    if (front === 1) {
      const age = T - T_CUBE - 0.05, u = clamp(age / 0.55);
      if (age > 0) {
        const P = mainPos(T), gc = groove(T, styleAt(T), true);
        const hx = P.cx - 50 * P.cs / 0.72, hy = P.cy - 8 * CU * P.cs - gc.hop * 32 + 6;
        const x = lerp(960, hx, u), y = lerp(460, hy, u) - 380 * 4 * u * (1 - u);
        spr('s15_chin', x, y, { s: 0.42, r: (1 - u) * 5 + Math.sin(T * 6) * 0.06, seed: 9 });
      }
    }
  }
  shot({
    id: 'parade-chins', t0: SL[3],
    tin: { type: 'mask', d: 0.5, at: 0.5, mask: (p, T) => { const yf = puffFrontY(T); rect(-50, yf, W + 100, H - yf + 200); for (let i = 0; i < 15; i++) circle(i * 140 - 20, yf + RS(i, 3) * 30, (150 + R(i, 4) * 45) * 2); } },
    draw(s) {
      const T = s.T;
      push(); cam(960, 540, 1.02 + 0.015 * kick(T, 8));
      washBG('s15_bg_chin');
      rays(960, 460, 20, ['#FFFFFF', PAL.butterLt], 0.45, T * 0.35);
      giantChin(T);
      cubeAct(T);
      if (T > T_CUBE) { for (let i = 0; i < 3; i++) { const a2 = T - T_CUBE - i * 0.08; if (a2 > 0 && a2 < 0.6) spr('ring', 960, 460, { s: a2 * 6, a: 1 - a2 / 0.6, seed: i }); } }
      burst(T, T_CUBE, 960, 460, { n: 16, names: ['sparkW', 'spark', 'heart'], spd: 1500, g: 300, life: 1.0, s: 0.5, seed: 13 });
      chinchillas(T, 0);
      friends(T);
      mainDancers(T);
      chinchillas(T, 1);
      floaters(T, 8, 19, ['heart', 'sparkW'], [200, 200, 1520, 500], 120, 0.3, 40);
      pop();
      puffFront(T);
    },
  });

  // ================= slot 4: flip-flops =================
  const FLOPS = [];
  for (let i = 0; i < 52; i++) FLOPS.push({ ts: SL[4] - 0.9 + i * 0.05 + R(i, 81) * 0.04, x: 70 + R(i, 82) * 1780, yl: 900 + R(i, 83) * 170, s: 0.55 + R(i, 84) * 0.4, v: i % 4, spin: RS(i, 85), rest: RS(i, 86) * 0.6 + (i % 2 ? 1.3 : -1.3), tf: 1.0 + R(i, 87) * 0.4 });
  function flopRain(T, front) {
    for (let i = 0; i < FLOPS.length; i++) {
      const f = FLOPS[i];
      if ((f.yl > 1010) !== front) continue;
      const age = T - f.ts; if (age < 0) continue;
      if (age < f.tf) {
        const u = age / f.tf;
        spr('s15_flop', f.x + Math.sin(age * 5 + i) * 40, lerp(-200, f.yl, u * u), { v: f.v, s: f.s, sx: Math.cos(age * 11 + i), r: f.spin * age * 4, seed: i });
      } else {
        const la = age - f.tf;
        const bounce = Math.abs(Math.sin(Math.min(la, 0.4) * Math.PI / 0.4)) * 50 * Math.exp(-la * 5);
        const sq = 1 + 0.35 * Math.exp(-la * 12);
        spr('s15_flop', f.x, f.yl - bounce, { v: f.v, s: f.s, sx: sq, sy: 1 / sq, r: f.rest + Math.sin(la * 20) * 0.2 * Math.exp(-la * 6), seed: i });
      }
    }
  }
  // the hero: a giant pair that stomps flip... flop... on alternate beats
  function giantFlops(T) {
    const up = Ez.outBack(inv(SL[4] - 0.2, SL[4] + 0.2, T));
    const b = beatAt(T), k = b.i - HB, ph = clamp(b.ph);
    for (const side of [0, 1]) {
      const mine = (k & 1) === side;
      const lift = mine ? Math.sin(Math.PI * ph) * 150 : 0;
      const slap = mine ? 0 : Math.exp(-ph * 10);
      const x = side ? 1330 : 590, y = lerp(-400, 470, up) - lift;
      spr('s15_flop', x, y, { v: side ? 2 : 0, s: 1.9, sx: 1 + 0.12 * slap, sy: 1 - 0.1 * slap, r: (side ? 0.12 : -0.12) - (mine ? 0.25 * Math.sin(Math.PI * ph) * (side ? -1 : 1) : 0), seed: side });
      if (!mine && up >= 1 && ph < 0.4) spr('puff', x + (side ? 90 : -90), y + 230, { s: 0.3 + ph * 0.9, a: 1 - ph / 0.4, seed: side + 4 });
    }
  }
  shot({
    id: 'parade-flops', t0: SL[4], tin: { type: 'flip', d: 0.5, at: 0.62 },
    draw(s) {
      const T = s.T;
      const fl = flipState(T);
      push(); cam(960, 540 - (fl ? fl.hop * 0.15 : 0), 1.02 + 0.015 * kick(T, 8));
      washBG('s15_bg_flop');
      rays(960, 120, 28, [PAL.butter, '#FFFFFF'], 0.5, T * 0.4);
      glow(960, 120, 220, PAL.butter, 0.3);
      giantFlops(T);
      flopRain(T, false);
      friends(T);
      mainDancers(T);
      flopRain(T, true);
      if (T > T_LAND) burst(T, T_LAND, 960, 900, { n: 18, names: ['spark', 'star5', 'sparkW'], spd: 1500, g: 600, life: 0.9, s: 0.5, spread: Math.PI, ang0: -Math.PI / 2, seed: 44 });
      pop();
    },
  });

  // ================= slot 5: the boombox serpent =================
  const SN0 = SL[5] - 0.5 * 0.35, SN1 = SL[5] + 0.5 * 0.65;
  const snFront = (T) => lerp(-260, 2260, inv(SN0, SN1, T));
  function serpent(T) {
    const uh = Math.min(1690, snFront(T) - 190 + 320);
    const k = kick(T, 6);
    const P = (u) => [-320 + u, 395 + (60 + 34 * k) * (0.3 + 0.7 * clamp((uh - u) / 450)) * Math.sin(u * 0.0085 - T * 5.5)];
    const n = 30, gap = 50;
    for (let i = n - 1; i >= 0; i--) {
      const u = uh - (i + 1) * gap; const [x, y] = P(u);
      if (x < -120) continue;
      spr(i % 4 === 1 ? 's15_seg_b' : 's15_seg', x, y, { s: lerp(0.95, 0.42, i / (n - 1)) * (1 + 0.08 * k), seed: i });
    }
    const [hx, hy] = P(uh), [qx, qy] = P(uh - 12);
    const ang = Math.atan2(hy - qy, hx - qx) * 0.5 - 0.12 * kick(T, 5);
    const hs = 0.86;
    push(); translate(hx + 40, hy - 40); rotate(ang);
    spr('s15_snake_head', 0, 0, { s: hs, seed: 2 });
    const mx = (272 - 170) * hs, my = (240 - 150) * hs;
    spr('s15_boombox', mx, my, { s: 0.74 * (1 + 0.06 * k), r: Math.sin(T * 5) * 0.14 - ang, seed: 4 });
    pop();
    const bx = hx + 40 + Math.cos(ang) * mx - Math.sin(ang) * my, by = hy - 40 + Math.sin(ang) * mx + Math.cos(ang) * my + 100;
    return [bx, by, uh >= 1690];
  }
  function discoFloor(T) {
    const b = beatAt(T).i;
    const cs = [PAL.pink, PAL.sky, PAL.butter, PAL.mint, PAL.lilac];
    const rows = [800, 850, 920, 1010, 1130], vx = 960, vy = 380;
    const X = (y, cc) => vx + (cc * 300) * (y - vy) / (1080 - vy);
    for (let r = 0; r < rows.length - 1; r++) {
      for (let c = -6; c < 6; c++) {
        const on = (r + c + b + 60) % 3 === 0;
        fill(withAlphaCol(cs[(r * 7 + c + 20 + b) % 5], on ? 0.8 : 0.3));
        beginShape(); vertex(X(rows[r], c) + 2, rows[r] + 2); vertex(X(rows[r], c + 1) - 2, rows[r] + 2); vertex(X(rows[r + 1], c + 1) - 2, rows[r + 1] - 2); vertex(X(rows[r + 1], c) + 2, rows[r + 1] - 2); endShape(CLOSE);
      }
    }
  }
  function beams(T) {
    blendMode(ADD); noStroke();
    const cs = [PAL.pink, PAL.sky, PAL.butter, PAL.mint];
    [260, 760, 1160, 1660].forEach((x, i) => {
      const a = Math.sin(T * 1.7 + i * 1.3) * 0.5 + (i < 2 ? 0.15 : -0.15);
      const L = 1500, w = 0.14;
      fill(withAlphaCol(cs[i], 0.16 + 0.08 * kick(T, 6)));
      triangle(x, -40, x + Math.sin(a - w) * L, -40 + Math.cos(a - w) * L, x + Math.sin(a + w) * L, -40 + Math.cos(a + w) * L);
    });
    blendMode(BLEND);
  }
  shot({
    id: 'parade-snake', t0: SL[5],
    tin: { type: 'mask', d: 0.5, at: 0.35, mask: (p, T) => { const F = snFront(T); beginShape(); vertex(-100, -100); for (let y = -100; y <= 1180; y += 30) vertex(F + 70 * Math.sin(y * 0.009 + T * 7), y); vertex(-100, 1180); endShape(CLOSE); } },
    draw(s) {
      const T = s.T;
      push(); cam(960, 540, 1.02 + 0.02 * kick(T, 8));
      washBG('s15_bg_club');
      discoFloor(T);
      beams(T);
      spr('s15_disco', 960, -20 + Math.sin(T * 2) * 6, { s: 0.9 });
      twinkles(T, 16, 9, [300, 40, 1320, 420], ['sparkW', 'spark'], 0.12, 0.3, 5);
      const [bx, by, settled] = serpent(T);
      // bass rings out of the boombox on every beat
      const b = beatAt(T);
      for (let j = 0; j < 2; j++) {
        const age = T - (b.t - j * b.len);
        if (age > 0 && age < 0.8 && T > SL[5] - 0.1) { ringLine(bx, by, 40 + age * 900, j % 2 ? PAL.sky : PAL.pink, 14 * (1 - age / 0.8), 0.9 * (1 - age / 0.8)); ringLine(bx, by, 20 + age * 600, PAL.butter, 8 * (1 - age / 0.8), 0.7 * (1 - age / 0.8)); }
      }
      if (settled) floaters(T, 9, 17, ['s15_note', 'spark'], [bx - 360, 80, 720, by - 60], 180, 0.45, 50);
      friends(T);
      mainDancers(T);
      pop();
    },
  });

  // ================= slot 6: GPU rocket to the smiling moon, hearts =================
  const RK = [[615, 1250], [600, 440], [860, 230], [1080, 300]];
  const MOON = [1450, 300, 0.8];
  function bez(P, u) { const v = 1 - u; const a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u; return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]; }
  const rkU = (T) => Ez.inOut(inv(SL[6] - 0.1, T_DOCK, T));
  function rocketAt(x, y, r, s, T, thrust) {
    push(); translate(x, y); rotate(r); scale(s);
    if (thrust > 0) { glow(0, 60, 110, PAL.orange, 0.5 * thrust); spr('flame', 0, 10, { s: (1.7 + Math.sin(T * 40) * 0.25) * thrust, r: Math.PI }); }
    spr('gpu', -118, -170, { s: 0.52, r: -Math.PI / 2, seed: 1 }); spr('gpu', 118, -170, { s: 0.52, r: Math.PI / 2, seed: 2, v: 1 });
    spr('rocket', 0, 0, { s: 1 });
    pop();
  }
  function moonScene(T, o = {}) {
    washBG('s15_bg_night');
    twinkles(T, 34, 7, [20, 20, 1880, 720], ['spark', 'sparkW', 'star5'], 0.1, 0.3, 3);
    // moon
    const dockAge = T - T_DOCK;
    const [mx, my, ms] = MOON;
    const bump = dockAge > 0 ? Math.exp(-dockAge * 5) * 0.12 : 0;
    const msc = ms * (1 + 0.02 * kick(T, 6) + bump);
    glow(mx, my, 300, PAL.butterLt, 0.3);
    push(); translate(mx, my + Math.sin(T * 1.8) * 8); rotate(Math.sin(T * 1.3) * 0.04);
    spr('s15_moon', 0, 0, { s: msc });
    if (dockAge > 0) { for (const sx of [-1, 1]) spr('heartR', sx * 70 * msc, -10 * msc, { s: (0.8 + 0.12 * kick(T, 6)) * msc }); }
    else { const bl = fract(T * 0.4) < 0.05; for (const sx of [-1, 1]) spr('s15_moon_eye', sx * 70 * msc, -10 * msc, { s: msc * 1.05, sy: bl ? 0.3 : 1 }); }
    pop();
    // rocket
    const u = rkU(T);
    if (u > 0) {
      const [x, y] = bez(RK, u), [x2, y2] = bez(RK, Math.min(1, u + 0.01)), [x1, y1] = bez(RK, Math.max(0, u - 0.01));
      const r = Math.atan2(x2 - x1, -(y2 - y1));
      for (let j = 0; j < 16; j++) {
        const tj = SL[6] - 0.05 + j * 0.06; const a = T - tj; if (a < 0 || a > 1.2 || rkU(tj) >= 1) continue;
        const [px, py] = bez(RK, rkU(tj));
        spr('puff', px + RS(j, 2) * 30 * a, py + 60 + a * 50, { s: 0.25 + a * 0.6, a: 1 - a / 1.2, seed: j });
      }
      const wig = dockAge > 0 ? Math.sin(T * 30) * 0.08 * Math.exp(-dockAge * 3) : 0;
      rocketAt(x, y, r + wig, 0.56, T, dockAge > 0 ? 0 : 1);
    }
    if (dockAge > 0) { burst(T, T_DOCK, mx - 120, my + 20, { n: 16, names: ['heart', 'heartR', 'spark'], spd: 1300, g: 500, life: 1.4, s: 0.6, seed: 61 }); burst(T, T_DOCK, 1250, 330, { n: 6, names: ['puff'], spd: 400, g: -100, life: 0.8, s: 0.45, seed: 62 }); }
    // night hill
    push(); tint(120, 105, 185); spr('s15_hill', 960, 715, { s: 2, jit: 0 }); pop();
    if (o.friends !== false) friends(T);
    if (o.main !== false) mainDancers(T);
  }
  shot({
    id: 'parade-moon', t0: SL[6], tin: { type: 'whip', d: 0.44, at: 0.5, ang: -Math.PI / 2 },
    draw(s) {
      const T = s.T;
      push(); cam(960, 540, 1.02 + 0.015 * kick(T, 8));
      moonScene(T);
      pop();
    },
  });

  // ================= end card =================
  const BANDS = [ // sprite, final y, start time, from the left?
    ['s15_band0', 190, T_SWEEP, true], ['s15_band1', 540, T_SWEEP + 0.13, false], ['s15_band2', 890, T_SWEEP + 0.26, true],
  ];
  const SWEEP_D = 0.55, SWEEP_END = T_SWEEP + 0.26 + SWEEP_D;
  function bands(T) {
    for (const [nm, y, t0, left] of BANDS) {
      const u = Ez.out(inv(t0, t0 + SWEEP_D, T));
      if (u <= 0) continue;
      const x = left ? lerp(-1250, 960, u) : lerp(3170, 960, u);
      spr(nm, x, y + (1 - u) * 30, { s: 2.2, sy: 2.3 / 2.2, flip: !left, jit: 0.2 });
    }
  }
  function endDancers(T) {
    if (T < E_MOVE0) { mainDancers(T); return; }
    const P = mainPos(T);
    const moving = T < E_MOVE1;
    const settle = sstep(E_SETTLE - 0.6, E_SETTLE + 0.4, T);
    const b = beatAt(T);
    const bounce = T < 154.4 ? Math.sin(Math.PI * clamp(b.ph)) * (1 - inv(153.9, 154.4, T)) : 0;
    const breathe = Math.sin(T * 2.2);
    // Pip waves with the outer (left) arm; the inner arm reaches over to hold Clawd's hand
    const wv = Math.sin(T * lerp(9, 3.2, settle)) * lerp(0.35, 0.14, settle);
    const blink = fract(T * 0.5 + 0.3) < 0.04;
    const face = T < E_MOVE1 + 0.2 ? 'pf_love' : T < E_SETTLE - 0.3 ? 'pf_happy' : blink ? 'pf_happy' : 'pf_neutral';
    const hopP = moving ? Math.abs(Math.sin(T * 11)) * 30 : bounce * 20;
    pip(P.px, P.py, P.ps, { face, hat: 'party', armL: moving ? 1.8 : 2.35 + wv, armR: moving ? 0.8 : lerp(1.55, 1.45, settle), hop: hopP, sq: 1 + 0.012 * breathe, walk: moving ? T * 3.4 : null, lean: moving ? 0 : 0.04 * Math.sin(T * 1.4), blink: false });
    const wc2 = Math.sin(T * lerp(9, 3.2, settle) + 1.2) * lerp(0.4, 0.16, settle);
    const eyes = T < E_MOVE1 ? 'ce_heart' : T < E_SETTLE - 0.3 ? 'ce_happy' : 'ce_sq';
    clawd(P.cx, P.cy, P.cs, { eyes, acc: ['party'], armL: moving ? -0.6 : lerp(0.45, 0.52, settle), armR: moving ? -1.2 : -1.25 + wc2, hop: moving ? Math.abs(Math.sin(T * 11 + 1)) * 34 : bounce * 24, sq: 1 + 0.015 * Math.sin(T * 2.2 + 0.7), walk: moving ? T * 3.4 : null, blush: true, look: [0, 0] });
  }
  shot({
    id: 'endcard', t0: T_SWEEP, tin: { type: 'cut', d: 0 },
    draw(s) {
      const T = s.T;
      // the parade underneath until the wash has covered it
      if (T < SWEEP_END + 0.02) { push(); cam(960, 540, 1.02 + 0.015 * kick(T, 8)); moonScene(T, { main: false }); pop(); }
      bands(T);
      const calm = inv(SWEEP_END - 0.1, SWEEP_END + 0.4, T);
      if (calm > 0) {
        // soft clouds drift through the lilac band, a tiny smiling moon and stars
        for (let i = 0; i < 3; i++) spr('cloud', fract(0.18 + i * 0.37 + T * 0.012) * 2400 - 240, 120 + i * 42, { s: 0.55 + 0.15 * i, a: 0.75 * calm, seed: i });
        const ma = sstep(153.5, 154.2, T), my = 190 + (1 - ma) * 40 + Math.sin(T * 1.2) * 4;
        glow(1705, my, 120, PAL.butterLt, 0.3 * ma);
        spr('s15_moon', 1705, my, { s: 0.3, a: ma });
        for (const sx of [-1, 1]) spr('s15_moon_eye', 1705 + sx * 21, my - 3, { s: 0.36, a: ma, sy: fract(T * 0.23 + 0.3) < 0.03 ? 0.3 : 1 });
        twinkles(T, 14, 31, [60, 30, 1800, 330], ['spark', 'sparkW', 'star5'], 0.12, 0.3, 2.2);
      }
      // grassy hill blooms in under the pair
      const hl = Ez.outBack(clamp(inv(153.15, 153.7, T)), 1.2);
      if (hl > 0) spr('s15_hill', 960, lerp(1200, 740, hl), { s: 2, jit: 0.2 });
      // title (bloom behind, then the words)
      const a1 = T - E_T1, a2 = T - E_T2;
      if (a2 > -0.1) spr('s15_bloom', 690, 420, { s: 1.35 * Ez.out(clamp((a2 + 0.1) / 0.5)), a: 0.85 * clamp((a2 + 0.1) / 0.3), jit: 0.3 });
      if (a1 > -0.05) txt("I'm Upping My", 690, 228, { size: 104, fill: PAL.ink, weight: 700, stroke: '#FFFFFF', sw: 8 }, { s: Ez.outBack(clamp((a1 + 0.05) / 0.3), 2.2), r: -0.035 + Math.sin(T * 1.1) * 0.006 });
      if (a2 > -0.1) {
        const kb = T < 154.4 ? kick(T, 6) * (1 - inv(153.9, 154.4, T)) : 0;
        const ps = lerp(2.2, 1, Ez.out(clamp(a2 / 0.35))) * (1 + 0.04 * kb + 0.01 * Math.sin(T * 1.7));
        txt('P(doom)', 690, 420, { size: 240, fill: PAL.coral, weight: 700, stroke: PAL.ink, sw: 12, shadow: 'rgba(43,33,64,0.9)' }, { s: ps, a: clamp(a2 / 0.15), r: 0.02 });
      }
      const ar = inv(E_RIB, E_RIB + 0.45, T);
      if (ar > 0) {
        spr('s15_ribbon', 690, 640, { s: 1.0, crop: [0.5 - 0.5 * Ez.out(ar), 0, 0.5 + 0.5 * Ez.out(ar), 1], jit: 0.3 });
        txt('P(doom) = 99.9%', 690, 638, { font: 'pixel', size: 66, fill: PAL.ink, weight: 700 }, { a: sstep(E_RIB + 0.2, E_RIB + 0.45, T), s: 1 + 0.25 * (1 - Ez.outBack(clamp((T - E_RIB - 0.2) / 0.3))) });
      }
      // confetti settling: a last gentle shower that thins out
      const shower = 1 - sstep(154.2, 155.6, T);
      if (shower > 0) confRain(T, 26, 71, [0, -60, W, 1140], lerp(90, 260, shower), 0.55, shower);
      // one slow sparkle drifting down forever (idle motion on the final frame)
      spr('sparkW', 1180 + Math.sin(T * 0.9) * 30, 110 + fract(T * 0.05) * 60, { s: 0.22, r: T * 0.5, a: 0.8 * calm });
      endDancers(T);
      // hearts from the finale keep flying over the wash for a moment
      cburst(T, T_SWEEP, 960, 520, { name: 'heart', nv: 2, n: 30, spd: 2600, g: 300, drag: 2.0, life: 1.6, s: 1.1, seed: 500 });
    },
  });
})();

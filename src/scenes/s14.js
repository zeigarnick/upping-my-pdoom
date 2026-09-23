// s14.js - S14 "masked days, recursion, the keyhole, the curtain" (127.88-140.30). Everything here is private to this IIFE.
// L41 photo-album page of baby Clawd (masked) -> page turn -> L42 Droste stack of Clawds building Clawds ->
// the recursion turns out to be the view through a giant keyhole (L43) -> door slams, darkness, question marks ->
// lights up: it was a stage set (L44), Clawd bows, flowers fly, the shared curtains close in a single spotlight.
(() => {
  const TL41 = 127.88, TL42 = 129.60, TL43 = 131.38, TL44 = 135.16;
  const w41 = (j) => wordT(41, j), w42 = (j) => wordT(42, j), w43 = (j) => wordT(43, j), w44 = (j) => wordT(44, j);
  const since = (T, t, k = 8) => (T < t ? 0 : Math.exp(-(T - t) * k)); // decaying hit envelope
  const poly = (pts) => { beginShape(); for (const p of pts) vertex(p[0], p[1]); endShape(CLOSE); };
  // clip() mask callbacks must draw with a transparent fill and no stroke (an opaque fill would paint on screen)
  const clipTo = (shapes, o) => clip(() => { noStroke(); fill(0, 0); shapes(); }, o);
  const DARK = mixc(PAL.night, PAL.black, 0.45);
  // cheap "ink and flat colour" paint for thin or small parts (skips the costly watercolour fill)
  function inkp(pts, c, o = {}) { flat(pts, o.baseC || lite(c, 0.18)); pen(o.lc || PAL.ink, o.lw ?? 1.4, '2B'); brush.polygon(pts); brush.noStroke(); }
  // local frame of a Clawd rig (mirrors clawd() in art.js) so props can ride on it
  function clawdFrame(x, y, s, o, fn) {
    const sq = o.sq ?? 1;
    push(); translate(x, y - (o.hop || 0)); if (o.r) rotate(o.r); scale(s * sq * (o.flip ? -1 : 1), s / sq); fn(); pop();
  }
  function clawdEyePts(x, y, s, o) {
    const sq = o.sq ?? 1, r = o.r || 0, lk = o.look || [0, 0];
    return [-2.5, 2.5].map((ex) => {
      const px = (ex + lk[0]) * CU * s * sq, py = (-6.5 + lk[1]) * CU * s / sq;
      return [x + px * Math.cos(r) - py * Math.sin(r), y - (o.hop || 0) + px * Math.sin(r) + py * Math.cos(r)];
    });
  }
  function pipEyePts(x, y, s, o) {
    const r = o.r || 0, sq = o.sq ?? 1, fl = o.flip ? -1 : 1, hr = (o.headR || 0) + (o.lean || 0);
    return [-35, 35].map((ex) => {
      let px = ex * Math.cos(hr) + 59 * Math.sin(hr), py = ex * Math.sin(hr) - 59 * Math.cos(hr) - 170;
      px *= s * fl * sq; py *= s / sq;
      return [x + px * Math.cos(r) - py * Math.sin(r), y - (o.hop || 0) + px * Math.sin(r) + py * Math.cos(r)];
    });
  }

  // =====================================================================================
  // L41 - "From masked pre-training days": a scrapbook page of baby Clawd
  // =====================================================================================
  const PH = { x: 760, y: 520, r: -0.035 }; // photo centre + tilt; photo is 720x540 (4:3, like the s13 frame)
  defSprite('s14_album', 1000, 580, () => {
    wash(-40, -40, 1080, 660, mixc(PAL.lilac, PAL.ink, 0.5), 220, 0.06);
    const pg = rrPts(18, 12, 926, 516, 6);
    flat(pg, PAL.paper);
    wc(PAL.cream, 120, 0.1, 0.45, 0.4); brush.polygon(pg); brush.noFill();
    blob(70, 50, 120, PAL.pinkLt, 120, 0.35);
    blob(930, 40, 130, PAL.butterLt, 130, 0.35);
    blob(935, 545, 120, PAL.mintLt, 120, 0.35);
    wc(mixc(PAL.cream, PAL.brown, 0.4), 110, 0.12, 0.4, 0.3); brush.rect(18, 12, 24, 516);
    wc(mixc(PAL.cream, PAL.brown, 0.22), 70, 0.2, 0.4, 0.3); brush.rect(18, 12, 60, 516); brush.noFill();
    pen(mixc(PAL.cream, PAL.brown, 0.4), 1.2, 'pen');
    for (let i = 1; i <= 4; i++) brush.line(944 + i * 3.5, 14 + i * 1.5, 944 + i * 3.5, 526 - i * 1.5);
    pen(PAL.ink, 1.6, '2B'); brush.polygon(pg); brush.noStroke();
  });
  defSprite('s14_doodles', 1000, 580, () => {
    const c = PAL.inkSoft;
    for (const [x, y, r] of [[118, 262, 13], [66, 330, 9], [606, 96, 11], [936, 290, 10], [612, 470, 12], [872, 500, 9], [300, 64, 10], [190, 470, 9]]) { pen(c, 1.5, '2B'); brush.polygon(starPts(x, y, r, r * 0.45, 5)); brush.noStroke(); }
    for (const [x, y, s] of [[478, 438, 12], [930, 186, 10], [150, 420, 10]]) { pen(PAL.red, 1.6, '2B'); brush.polygon(heartPts(x, y, s, 24)); brush.noStroke(); }
    const sp = []; for (let i = 0; i < 40; i++) { const a = i * 0.35, r = 1 + i * 0.42; sp.push([790 + Math.cos(a) * r, 60 + Math.sin(a) * r]); }
    strokePath(sp, c, 1.4, '2B', 0.5);
    strokePath([[318, 446], [342, 440], [366, 448], [390, 440], [414, 448], [440, 442]], c, 1.6, '2B', 0.5);
    strokePath([[122, 232], [150, 190], [192, 172]], c, 1.5, '2B', 0.5);
    strokePath([[180, 164], [194, 172], [182, 184]], c, 1.5, '2B', 0.2);
    strokePath([[640, 300], [652, 318], [640, 336], [652, 354]], c, 1.4, '2B', 0.5);
    strokePath([[880, 370], [900, 360], [920, 372], [940, 362]], c, 1.4, '2B', 0.5);
    for (const [x, y] of [[660, 60], [952, 420], [560, 470]]) { pen(PAL.butter, 2, 'pen'); brush.line(x - 8, y, x + 8, y); brush.line(x, y - 8, x, y + 8); brush.noStroke(); }
  }, { v: 2 });
  defSprite('s14_photo', 760, 580, () => {
    flat(offsetPts(rrPts(20, 20, 720, 540, 6), 8, 12), PAL.ink, 0.16);
    paint(rrPts(20, 20, 720, 540, 6), '#FFFFFF', { baseC: '#FFFFFF', a: 50, lw: 1.8 });
    const ix = 46, iy = 46, iw = 668, ih = 488, fy = iy + ih * 0.72;
    flat([[ix, iy], [ix + iw, iy], [ix + iw, iy + ih], [ix, iy + ih]], lite(PAL.lilac, 0.55));
    wc(PAL.lilacLt, 140, 0.08, 0.5, 0.4); brush.rect(ix, iy, iw, fy - iy);
    blob(ix + 160, iy + 120, 130, PAL.skyLt, 90, 0.35);
    wc(PAL.peach, 190, 0.06, 0.5, 0.4); brush.rect(ix, fy, iw, iy + ih - fy); brush.noFill();
    pen(dark(PAL.peach, 0.25), 1.2, 'pen'); brush.line(ix, fy + 2, ix + iw, fy + 2); brush.noStroke();
    for (let i = 0; i < 24; i++) { const x = ix + 24 + random() * (iw - 48), y = iy + 20 + random() * (fy - iy - 40); if (x > 530 && y < 250) continue; flat(starPts(x, y, 7, 3, 4), i % 2 ? '#FFFFFF' : PAL.butterLt, 0.9); }
    // window with a crescent moon (top right)
    paint(rrPts(532, 70, 150, 150, 70, 6), PAL.navy, { baseC: '#3A4A8A', lw: 1.8 });
    blob(632, 118, 26, PAL.butterLt, 230, 0.08); flat(ellPts(645, 110, 24, 24, 20), '#3A4A8A');
    for (let i = 0; i < 6; i++) flat(ellPts(560 + random() * 100, 150 + random() * 50, 3, 3, 8), '#FFFFFF');
    pen(PAL.brownLt, 5, 'marker'); brush.line(607, 72, 607, 218); brush.line(534, 150, 680, 150); brush.noStroke();
    // rug
    inkp(ellPts(330, 486, 236, 28, 32), PAL.pink, { baseC: PAL.pinkLt, lw: 1.3 });
    // toy blocks spelling MASK
    const bc = [PAL.sky, PAL.mint, PAL.butter, PAL.pink];
    'MASK'.split('').forEach((ch, i) => {
      const bx = 572 + i * 34, by = 428 - (i % 2) * 4;
      inkp(rrPts(bx, by, 32, 32, 4), bc[i], { baseC: lite(bc[i], 0.25), lw: 1.2 });
      const t = textImg(ch, { font: 'pixel', size: 24, fill: PAL.ink, weight: 700 }); image(t.img, bx + 16 - t.w / 2, by + 17 - t.h / 2);
    });
    pen(PAL.ink, 1.4, 'pen'); brush.rect(ix, iy, iw, ih); brush.noStroke();
  });
  // crib, photo-local coords: back sprite spans x -280..180, y -45..245; front spans x -280..180, y 75..250
  const CRIB_WOOD = PAL.butter;
  defSprite('s14_crib_back', 460, 290, () => {
    const L = (x, y) => [x + 280, y + 45];
    const R = (x0, y0, x1, y1, r = 5) => rrPts(L(x0, y0)[0], L(x0, y0)[1], x1 - x0, y1 - y0, r);
    inkp(R(-226, 186, 126, 208, 8), '#FFFFFF', { baseC: PAL.skyLt, lw: 1.3 }); // mattress
    for (let x = -210; x < 120; x += 32) inkp(R(x, 82, x + 10, 190, 4), lite(CRIB_WOOD, 0.3), { lw: 1 });
    inkp(R(-236, 68, 136, 84, 6), CRIB_WOOD, { lw: 1.4 });
    for (const x of [-250, 126]) { inkp(R(x, 30, x + 24, 238, 8), CRIB_WOOD, { baseC: lite(CRIB_WOOD, 0.1), lw: 1.6 }); inkp(ellPts(L(x + 12, 24)[0], L(x + 12, 24)[1], 16, 14, 16), PAL.pink, { lw: 1.3 }); }
  });
  defSprite('s14_crib_front', 460, 175, () => {
    const L = (x, y) => [x + 280, y - 75];
    const R = (x0, y0, x1, y1, r = 5) => rrPts(L(x0, y0)[0], L(x0, y0)[1], x1 - x0, y1 - y0, r);
    for (let x = -224; x < 126; x += 34) inkp(R(x, 138, x + 13, 208, 5), CRIB_WOOD, { lw: 1.2 });
    for (const [y0, y1] of [[122, 140], [204, 219]]) { const pts = R(-240, y0, 140, y1, 8); inkp(pts, CRIB_WOOD, { baseC: lite(CRIB_WOOD, 0.1), lw: 1.6 }); pen('#FFFFFF', 2, 'pen'); brush.line(pts[0][0] - 4, L(0, y0 + 5)[1], pts[0][0] - 340, L(0, y0 + 5)[1]); brush.noStroke(); }
    for (let i = 0; i < 5; i++) flat(starPts(L(-180 + i * 70, 131)[0], L(-180 + i * 70, 131)[1], 6, 2.6, 5), PAL.pink, 0.9);
  });
  defSprite('s14_tape', 180, 64, () => {
    const pts = [[10, 14], [170, 8], [164, 20], [172, 32], [166, 44], [172, 56], [12, 58], [18, 46], [8, 34], [16, 22]];
    flat(pts, PAL.pinkLt, 0.7); wc(PAL.pink, 60, 0.05, 0.4, 0.4); brush.polygon(pts); brush.noFill();
    pen('#FFFFFF', 3, 'marker'); for (let x = 34; x < 164; x += 26) brush.line(x, 12, x - 14, 56); brush.noStroke();
  });
  defSprite('s14_rattle', 90, 160, () => {
    paint(rrPts(38, 62, 14, 86, 6), PAL.mint, { baseC: PAL.mintLt, lw: 1.3 });
    paint(ellPts(45, 42, 32, 32, 28), PAL.butter, { baseC: PAL.butterLt, lw: 1.6 });
    flat(ellPts(36, 32, 8, 6, 12), '#FFFFFF', 0.9); blob(56, 50, 6, PAL.pink, 220, 0.05);
  }, { ay: 0.8 });
  defSprite('s14_mob_moon', 90, 90, () => { paint([...ellPts(45, 45, 32, 32, 28).slice(4, 22), [36, 58], [30, 45], [36, 32]], PAL.butter, { baseC: PAL.butterLt, lw: 1.4 }); });
  defSprite('s14_mob_block', 80, 80, () => {
    paint(rrPts(10, 10, 60, 60, 8), PAL.sky, { baseC: PAL.skyLt, lw: 1.4 });
    const t = textImg('M', { font: 'pixel', size: 38, fill: PAL.ink, weight: 700 }); image(t.img, 40 - t.w / 2, 42 - t.h / 2);
  });
  // flash cards (card body 250x320 inside a 270x340 sprite)
  function cardBody(c = '#FFFFFF') { paint(rrPts(10, 10, 250, 320, 18), c, { baseC: lite(c, 0.4), a: 60, lw: 2 }); }
  function maskLabel() {
    paint(rrPts(34, 244, 202, 62, 12), PAL.lilacLt, { baseC: lite(PAL.lilac, 0.65), lw: 1.4 });
    const t = textImg('[MASK]', { font: 'pixel', size: 42, fill: PAL.ink, weight: 700 }); image(t.img, 135 - t.w / 2, 276 - t.h / 2);
  }
  defSprite('s14_card_apple', 270, 340, () => {
    cardBody();
    paint([[135, 92], [175, 70], [212, 96], [216, 150], [190, 200], [135, 214], [80, 200], [54, 150], [58, 96], [95, 70]], PAL.red, { baseC: '#FF7080', lw: 1.8 });
    strokePath([[135, 94], [138, 60], [146, 44]], PAL.brown, 4, 'marker', 0.4);
    paint([[146, 60], [184, 44], [168, 72]], PAL.green, { baseC: PAL.mintLt, lw: 1.3 });
    flat(ellPts(92, 118, 12, 20, 14, 0, 0.4), '#FFFFFF', 0.7);
    maskLabel();
  });
  defSprite('s14_card_cat', 270, 340, () => {
    cardBody();
    const face = [[60, 90], [78, 36], [112, 72], [158, 72], [192, 36], [210, 90], [214, 150], [190, 200], [135, 214], [80, 200], [56, 150]];
    paint(face, PAL.orange, { baseC: '#FFC08A', lw: 1.8 });
    for (const x of [106, 164]) flat(ellPts(x, 132, 9, 12, 14), PAL.ink);
    flat([[126, 156], [144, 156], [135, 166]], PAL.pink);
    strokePath([[135, 166], [126, 176], [116, 172]], PAL.ink, 1.6, 'pen', 0.5); strokePath([[135, 166], [144, 176], [154, 172]], PAL.ink, 1.6, 'pen', 0.5);
    pen(PAL.ink, 1.2, 'pen'); for (const s of [-1, 1]) { brush.line(135 + s * 40, 160, 135 + s * 92, 150); brush.line(135 + s * 40, 168, 135 + s * 92, 172); } brush.noStroke();
    maskLabel();
  });
  defSprite('s14_card_math', 270, 340, () => {
    cardBody();
    const t = textImg('2+2=', { font: 'display', size: 76, fill: PAL.blue, weight: 700 }); image(t.img, 135 - t.w / 2, 138 - t.h / 2);
    for (let i = 0; i < 4; i++) inkp(ellPts(70 + i * 44, 206, 11, 11, 16), [PAL.coral, PAL.mint, PAL.butter, PAL.sky][i], { lw: 1.1 });
    maskLabel();
  });
  defSprite('s14_card_back', 270, 340, () => {
    cardBody(PAL.lilac);
    for (let i = 0; i < 9; i++) flat(starPts(50 + (i % 3) * 85, 70 + Math.floor(i / 3) * 100, 16, 7, 4), '#FFFFFF', 0.85);
    pen('#FFFFFF', 2, 'pen'); brush.rect(26, 26, 218, 288); brush.noStroke();
  });
  // tear-off day calendar
  defSprite('s14_cal', 230, 260, () => {
    paint(rrPts(15, 30, 200, 215, 12), PAL.sky, { baseC: PAL.skyLt, lw: 1.8 });
    paint(rrPts(22, 20, 186, 36, 8), PAL.navy, { baseC: PAL.blue, lw: 1.5 });
    for (const x of [70, 160]) { pen(PAL.gray, 4, 'marker'); brush.circle(x, 20, 9); brush.noStroke(); }
  });
  defSprite('s14_calpage', 190, 190, () => {
    paint(rrPts(8, 8, 174, 174, 6), '#FFFFFF', { baseC: '#FFFFFF', a: 50, lw: 1.6 });
    paint(rrPts(8, 8, 174, 42, 6), PAL.red, { baseC: '#FF6A7E', lw: 1.3 });
    const t = textImg('DAY', { font: 'pixel', size: 30, fill: '#FFFFFF', weight: 700 }); image(t.img, 95 - t.w / 2, 30 - t.h / 2);
  });
  const CAL = { x: 232, y: 318 };
  const TEARS = (() => {
    const t = BEATS.filter((b) => b > 127.9 && b < 129.4);
    for (let i = 0; i < 6; i++) t.push(w41(3) + 0.02 + i * 0.045);
    return t.sort((a, b) => a - b);
  })();
  function drawCalendar(T) {
    spr('s14_cal', CAL.x, CAL.y, { r: -0.06 });
    let n = 0; for (const t of TEARS) if (T >= t) n++;
    push(); translate(CAL.x, CAL.y + 22); rotate(-0.06);
    spr('s14_calpage', 0, 0, { s: 0.98, jit: 0.4 });
    const lift = n < TEARS.length ? 0.25 * since(T, TEARS[Math.max(0, n - 1)], 10) : 0;
    txt(String(n + 1), 0, 22 - lift * 20, { font: 'pixel', size: 88, fill: PAL.ink, weight: 700 });
    pop();
  }
  function drawTornPages(T) {
    TEARS.forEach((t0, i) => {
      const age = T - t0;
      if (age < 0 || age > 1.8) return;
      const vx = 560 + R(i, 41) * 520, vy = -260 - R(i, 42) * 200;
      const x = CAL.x + vx * age + Math.sin(age * 5 + i) * 30, y = CAL.y + 22 + vy * age + 0.5 * 420 * age * age;
      const fx = Math.cos(age * (9 + i)), fa = 1 - inv(1.3, 1.8, age);
      push(); translate(x, y); rotate(age * (2 + R(i, 43) * 3) * (i % 2 ? 1 : -1) - 0.06);
      scale(fx * 0.72, 0.74);
      spr('s14_calpage', 0, 0, { a: fa, seed: i });
      if (fx > 0) txt(String(i + 1), 0, 22, { font: 'pixel', size: 88, fill: PAL.ink, weight: 700 }, { a: fa });
      pop();
    });
  }
  const CARDS = [
    { n: 's14_card_apple', x: 1420, y: 292, r: 0.07, t: w41(2) },
    { n: 's14_card_cat', x: 1690, y: 440, r: -0.08, t: w41(2) + 0.14 },
    { n: 's14_card_math', x: 1462, y: 682, r: 0.05, t: w41(2) + 0.28 },
  ];
  function drawCards(T) {
    CARDS.forEach((c, i) => {
      const f = inv(c.t - 0.08, c.t + 0.14, T);
      const k = Math.cos(Math.PI * f);
      const bob = T > c.t + 0.2 ? hopB(T + i * 0.15) * 7 : 0;
      const pk = 1 + 0.08 * since(T, c.t + 0.06, 9);
      push(); translate(c.x, c.y - bob); rotate(c.r + 0.05 * Math.sin(T * 2.3 + i));
      scale(Math.max(0.02, Math.abs(k)) * pk, pk);
      spr(k > 0 ? 's14_card_back' : c.n, 0, 0, { seed: i });
      pop();
      if (T > c.t) burst(T, c.t + 0.04, c.x, c.y, { n: 7, names: ['sparkW', 'spark'], spd: 520, g: 300, life: 0.6, s: 0.28, seed: 20 + i * 9 });
    });
  }
  // ---- the photo (lives inside its own frame; baby Clawd plays peekaboo with the mask) ----
  function drawPhoto(T) {
    const mT = w41(1);
    push(); translate(PH.x, PH.y); rotate(PH.r);
    spr('s14_photo', 0, 0, { jit: 0.3 });
    push();
    clipTo(() => rect(-334, -244, 668, 488));
    // mobile
    const mob = T * 1.7;
    segLine(-50, -250, -50, -170, PAL.ink, 2.5);
    noFill(); stroke(withAlphaCol(PAL.ink, 0.8)); strokeWeight(2.5); ellipse(-50, -168, 200, 22); noStroke();
    const items = [['s14_mob_moon', 0.7], ['star5', 0.5], ['s14_mob_block', 0.62], ['heart', 0.5]];
    const ord = items.map((it, i) => ({ it, a: mob + (i * Math.PI) / 2 })).sort((p, q) => Math.sin(p.a) - Math.sin(q.a));
    for (const { it, a } of ord) {
      const x = -50 + Math.cos(a) * 100, dz = Math.sin(a), y = -168 + 58 + Math.sin(T * 3 + a) * 4;
      segLine(x, -168 + dz * 10, x, y - 22, PAL.ink, 1.5, 0.8);
      spr(it[0], x, y, { s: it[1] * (0.85 + 0.15 * dz), sx: 0.55 + 0.45 * Math.abs(Math.cos(a * 1.3)), a: 0.8 + 0.2 * dz, seed: Math.round(a) });
    }
    spr('s14_crib_back', -50, 100, { jit: 0.4 });
    // baby Clawd
    const up = T < mT - 0.1 ? 1 : T < mT ? 1 - Ez.in(inv(mT - 0.1, mT, T)) : 0;
    const slap = since(T, mT, 9);
    const bounce = T > mT ? hopB(T) * 10 : Math.abs(Math.sin(T * 9)) * 4;
    const rat = Math.sin(beatAt(T).ph * TAU);
    const o = {
      eyes: up > 0.5 ? 'ce_happy' : 'ce_sq', blush: true, hop: bounce, sq: 1 + 0.16 * slap - 0.04 * up,
      armL: up > 0.01 ? lerp(0.1, -1.2, up) : -0.25 + 0.15 * rat, armR: up > 0.01 ? lerp(0.1, -1.2, up) : -0.7 + 0.55 * rat,
      look: up > 0.5 ? [0, 0] : [0.2 * Math.sin(T * 2), 0.1], seed: 3,
    };
    const bx = -50, by = 204, bs = 0.6;
    clawd(bx, by, bs, o);
    clawdFrame(bx, by, bs, o, () => {
      if (up <= 0.01) { push(); translate(4 * CU, -5 * CU); rotate(o.armR); spr('s14_rattle', 1.7 * CU, -0.2 * CU, { s: 1.25, r: -o.armR - 0.35 + rat * 0.5 }); pop(); }
      const my = lerp(-6.4 * CU, -10.6 * CU, up);
      spr('acc_mask', 0, my, { s: 1.05 * (1 + 0.1 * slap), r: up * 0.05 * Math.sin(T * 14) });
      if (up < 0.5) { // eyes peek through the mask's holes
        for (const ex of [-2.5, 2.5]) { disc(ex * CU, -6.5 * CU, 0.78 * CU, dark(PAL.lilac, 0.55)); spr(fract(T * 0.4) < 0.04 ? 'ce_blink' : 'ce_sq', (ex + o.look[0]) * CU, (-6.5 + o.look[1]) * CU, { s: CU / EU, seed: ex > 0 ? 9 : 8 }); }
      }
    });
    if (T > mT - 0.02) burst(T, mT, bx, by - 6.4 * CU * bs - bounce, { n: 12, names: ['spark', 'sparkW', 'star5'], spd: 620, g: 200, life: 0.8, s: 0.32, even: true, seed: 5 });
    spr('s14_crib_front', -50, 162.5, { jit: 0.4 });
    pop();
    // washi tape over the corners
    spr('s14_tape', -340, -262, { r: -0.62 });
    spr('s14_tape', 344, -260, { r: 0.6, seed: 2 });
    spr('s14_tape', 330, 266, { r: -0.55, seed: 4, s: 0.8 });
    pop();
  }
  // ---- page flutter and page turn (screen space; corner (W,H) peels toward the spine at x=0) ----
  const TURN0 = 129.33, TURN1 = 129.87;
  function turnE(T) {
    let e = 0;
    for (const bt of BEATS) {
      if (bt < 128.4 || bt > 129.1) continue;
      const a = T - bt; if (a > 0 && a < 0.36) e = Math.max(e, 0.05 * Math.sin((Math.PI * a) / 0.36));
    }
    const d = w41(3);
    if (T > d - 0.06) e = Math.max(e, 0.065 * Ez.outBack(clamp((T - d + 0.06) / 0.2)));
    if (T > TURN0) e = Math.max(e, lerp(0.065, 1, Ez.inOut(inv(TURN0, TURN1, T))));
    return clamp(e);
  }
  function clipHalf(pl, m, n) {
    const out = [];
    for (let i = 0; i < pl.length; i++) {
      const a = pl[i], b = pl[(i + 1) % pl.length];
      const da = (a[0] - m[0]) * n[0] + (a[1] - m[1]) * n[1], db = (b[0] - m[0]) * n[0] + (b[1] - m[1]) * n[1];
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function pageTurn(e) {
    if (e < 0.002) return null;
    const Q = [W - 2 * W * e, H - Math.sin(Math.PI * e) * H * 0.42];
    const d = [W - Q[0], H - Q[1]], L = Math.hypot(d[0], d[1]);
    const n = [d[0] / L, d[1] / L], m = [(W + Q[0]) / 2, (H + Q[1]) / 2];
    const rev = clipHalf([[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]], m, n);
    const flap = rev.map(([x, y]) => { const k = 2 * ((x - m[0]) * n[0] + (y - m[1]) * n[1]); return [x - k * n[0], y - k * n[1]]; });
    return { m, n, rev, flap, ang: Math.atan2(n[1], n[0]) };
  }
  function drawTurn(pt, under) {
    if (!pt || pt.flap.length < 3) return;
    if (under) { // the page beneath, peeking out during the flutters
      flat(pt.rev, '#EEDFC8');
      push(); clipTo(() => poly(pt.rev)); translate(pt.m[0], pt.m[1]); rotate(pt.ang);
      gradRect(0, -2200, 70, 4400, withAlphaCol(PAL.ink, 0.28), withAlphaCol(PAL.ink, 0), false);
      pop();
    }
    flat(offsetPts(pt.flap, -16, 10), PAL.ink, 0.16);
    flat(pt.flap, '#F4E8D6');
    push(); clipTo(() => poly(pt.flap)); translate(pt.m[0], pt.m[1]); rotate(pt.ang);
    gradRect(-340, -2200, 340, 4400, withAlphaCol('#FFF8EE', 0), withAlphaCol('#C9B08E', 0.85), false);
    segLines([0, 1, 2, 3, 4].map((i) => [-60 - i * 90, -2200, -60 - i * 90, 2200]), PAL.lilacLt, 3, 0.25);
    pop();
    push(); clipTo(() => poly(pt.flap)); // the front page's pencil marks show through the paper, mirrored
    translate(pt.m[0], pt.m[1]); rotate(pt.ang); scale(-1, 1); rotate(-pt.ang); translate(-pt.m[0], -pt.m[1]);
    spr('s14_doodles', 960, 540, { s: 2, a: 0.22, jit: 0 });
    pop();
    noFill(); stroke(withAlphaCol(PAL.ink, 0.7)); strokeWeight(2.4); poly(pt.flap); noStroke();
  }
  function camL41(T) {
    const e = Ez.inOut(inv(TL41 + 0.02, 128.6, T));
    const Z = Math.exp(lerp(Math.log(1.92), Math.log(1.06), e)) * (1 + 0.035 * sstep(128.6, 129.4, T));
    return { cx: lerp(PH.x, 960, e), cy: lerp(PH.y, 540, e), Z, r: lerp(-PH.r, 0, e) + 0.006 * Math.sin(T * 1.7) * e };
  }
  shot({
    id: 'L41-album', t0: TL41, tin: { type: 'zoom', d: 0.6, at: 0.5, c: [960, 540] },
    draw(s) {
      const T = s.T;
      const cm = camL41(T);
      push();
      cam(cm.cx, cm.cy, cm.Z, cm.r);
      spr('s14_album', 960, 540, { s: 2, jit: 0 });
      spr('s14_doodles', 960, 540, { s: 2, jit: 0.4 });
      spr('star5', 1256, 162, { s: 0.42, r: 0.3 + 0.1 * Math.sin(T * 3) });
      spr('heart', 330, 700, { s: 0.45, r: -0.2, seed: 2 });
      spr('star5', 1180, 880, { s: 0.3, r: T * 0.5, seed: 3 });
      drawCalendar(T);
      drawPhoto(T);
      const cap = T - 128.453; // pops in on the beat once the camera has settled
      if (cap > 0) txt('epoch 0', PH.x - 30, 826, { font: 'hand', size: 62, fill: PAL.ink, weight: 700 }, { r: -0.03 + 0.2 * (1 - clamp(cap / 0.2)), s: Ez.outBack(clamp(cap / 0.22), 2.6) });
      drawCards(T);
      drawTornPages(T);
      pop();
      const e = turnE(T);
      if (e > 0.002) drawTurn(pageTurn(e), T < TURN0);
    },
  });
  lyr(41, { y: 975, size: 74, maxW: 1400, cols: ['#FFFFFF'], words: { 1: { fill: PAL.lilacLt, anim: 'drop' }, 2: { fill: PAL.pinkLt }, 3: { fill: PAL.butter, anim: 'spin' } } });

  // =====================================================================================
  // L42 - "To recursive self-upgrade": an endless Droste stack of Clawds building Clawds
  // =====================================================================================
  defSprite('s14_hammer', 330, 140, () => {
    paint(rrPts(18, 60, 262, 20, 8), PAL.brownLt, { baseC: lite(PAL.brownLt, 0.3), lw: 1.6 });
    inkp(rrPts(16, 57, 56, 26, 9), PAL.red, { baseC: lite(PAL.red, 0.3), lw: 1.4 });
    paint(rrPts(248, 12, 64, 116, 12), PAL.gray, { baseC: PAL.grayLt, lw: 2 });
    inkp(rrPts(248, 100, 64, 28, 6), dark(PAL.gray, 0.2), { baseC: PAL.gray, lw: 1.4 });
  }, { ax: 40 / 330, ay: 0.5 });
  defSprite('s14_blueprint', 250, 190, () => {
    inkp(rrPts(12, 12, 226, 166, 8), PAL.blue, { baseC: mixc(PAL.blue, PAL.sky, 0.45), lw: 1.6 });
    pen('#FFFFFF', 1, 'pen'); for (let x = 30; x < 236; x += 22) brush.line(x, 16, x, 174); for (let y = 30; y < 176; y += 22) brush.line(16, y, 234, y);
    pen('#FFFFFF', 2.6, 'pen'); brush.rect(70, 50, 110, 80); brush.rect(50, 70, 20, 24); brush.rect(180, 70, 20, 24);
    for (const x of [76, 100, 150, 174]) brush.rect(x - 5, 130, 10, 26);
    brush.noStroke(); flat(rrPts(96, 70, 14, 14, 2), '#FFFFFF'); flat(rrPts(140, 70, 14, 14, 2), '#FFFFFF');
    const t = textImg('v+1', { font: 'pixel', size: 30, fill: '#FFFFFF', weight: 700 }); image(t.img, 196 - t.w / 2, 34 - t.h / 2);
  });
  function gearPts(cx, cy, r1, r2, n) { const pts = []; for (let i = 0; i < n * 4; i++) { const a = (i / (n * 4)) * TAU; pts.push([cx + Math.cos(a) * (i % 4 < 2 ? r1 : r2), cy + Math.sin(a) * (i % 4 < 2 ? r1 : r2)]); } return pts; }
  defSprite('s14_gear_m', 140, 140, () => { paint(gearPts(70, 70, 58, 45, 10), PAL.mint, { baseC: PAL.mintLt, lw: 1.8 }); paint(ellPts(70, 70, 17, 17, 20), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.5 }); });
  defSprite('s14_gear_b', 140, 140, () => { paint(gearPts(70, 70, 58, 45, 8), PAL.butter, { baseC: PAL.butterLt, lw: 1.8 }); paint(ellPts(70, 70, 17, 17, 20), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.5 }); });
  defSprite('s14_nut', 70, 70, () => { paint(ellPts(35, 35, 26, 26, 6, 0, Math.PI / 6), PAL.gray, { baseC: PAL.grayLt, lw: 1.5 }); flat(ellPts(35, 35, 9, 9, 16), PAL.skyLt); });
  const DK = 2.5, DTH = 0.1, DZB = 1.1;
  const DC = [760, 300];
  const DV = [-2.0 * CU, -8 * CU]; // where each Clawd stands on the next bigger Clawd's head (its local units)
  const DG = (() => { // ground offset of level 0 from the fixed point: (Rot(-th)/k - I)^-1 v
    const c = Math.cos(-DTH) / DK, sn = Math.sin(-DTH) / DK;
    const a = c - 1, b = -sn, cc = sn, d = c - 1, det = a * d - b * cc;
    return [(d * DV[0] - b * DV[1]) / det, (-cc * DV[0] + a * DV[1]) / det];
  })();
  const UPG = w42(2); // self-upgrade
  const dZ = (T) => (T - TL42) / 0.93 + Ez.inOut(inv(UPG - 0.18, UPG + 0.32, T));
  function hammerArm(ph) {
    if (ph < 0.12) return lerp(0.54, 0.4, Ez.out(ph / 0.12)); // contact at ~0.54 rad, then a small rebound
    if (ph < 0.7) return lerp(0.4, -1.3, Ez.inOut((ph - 0.12) / 0.58));
    if (ph < 0.9) return -1.3 - 0.14 * Ez.out((ph - 0.7) / 0.2);
    return lerp(-1.44, 0.54, Ez.in((ph - 0.9) / 0.1));
  }
  function drosteLevel(T, m, x, y, s, r) {
    const b = beatAt(T), arm = hammerArm(b.ph);
    const up = T >= UPG;
    const star = T > UPG && T < UPG + 0.6;
    push(); translate(x, y); rotate(r); scale(s);
    // floating workshop bits (self-similar, so they scale with the level)
    spr('s14_gear_m', -7.5 * CU, -1.6 * CU, { s: 0.8, r: T * 1.6 + m, seed: m });
    spr('s14_gear_b', 9.5 * CU, -11 * CU, { s: 0.7, r: -T * 2.2 + m, seed: m + 1 });
    spr('s14_nut', 12 * CU, -4 * CU, { s: 0.8, r: T + m * 2, seed: m + 2 });
    spr('s14_blueprint', -12.5 * CU, -7 * CU, { s: 0.72, r: -0.22 + 0.08 * Math.sin(T * 2 + m), seed: m });
    pop();
    const o = { r, armR: arm, armL: -0.55 + 0.25 * Math.sin(T * 5 + m), look: [0.45, 0.35], eyes: star ? 'ce_star' : 'ce_sq', seed: m * 3, blush: up };
    clawd(x, y, s, o);
    clawdFrame(x, y, s, o, () => {
      push(); translate(4 * CU, -5 * CU); rotate(arm); spr('s14_hammer', 1.5 * CU, 0, { seed: m }); pop();
      // this Clawd's own hat (the smaller Clawd stands on the left half of this head); hard hat -> crown on the upgrade
      const hatK = up ? Ez.outBack(clamp((T - UPG) / 0.3), 2.5) : 1;
      if (!up) spr('acc_hardhat', 3.3 * CU, -8 * CU, { s: 0.42, r: 0.2, seed: m });
      else spr('acc_crown', 3.3 * CU, -8.1 * CU, { s: 0.52 * hatK, r: 0.18, seed: m });
      if (up && T < UPG + 0.7) { const q = (T - UPG) / 0.7; spr('acc_hardhat', 3.3 * CU + q * 120, -8 * CU - Math.sin(Math.PI * q) * 260 - q * 80, { s: 0.42, r: 0.2 + q * 6, a: 1 - q, seed: m }); }
      if (s > 0.12) {
        burst(T, b.t, 9.6 * CU, -4, { n: 7, names: ['spark', 'sparkW'], spd: 900, g: 1600, life: 0.42, s: 0.42, spread: 2.2, ang0: -Math.PI / 2, seed: m * 13 + b.i });
        const pb = BEATS[b.i - 1];
        if (pb) burst(T, pb, 9.6 * CU, -4, { n: 7, names: ['spark', 'sparkW'], spd: 900, g: 1600, life: 0.42, s: 0.42, spread: 2.2, ang0: -Math.PI / 2, seed: m * 13 + b.i - 1 });
      }
      if (up && T < UPG + 0.5) burst(T, UPG, 0, -9 * CU, { n: 8, names: ['star5', 'spark'], spd: 520, g: 0, life: 0.5, s: 0.3, even: true, seed: m * 7 });
    });
  }
  function drawDroste(T, o = {}) {
    const z = dZ(T), C = DC, big = !!o.big;
    const camR = -z * DTH;
    noStroke(); fill(PAL.skyLt); rect(-4000, -4000, 10000, 10000);
    // sun rays around the fixed point (scale invariant, so they suit the endless zoom)
    const n = 26, RR = big ? 9000 : 2600, rot = camR + T * 0.12;
    blendMode(BLEND); fill(withAlphaCol('#FFFFFF', 0.42));
    beginShape(TRIANGLES);
    for (let i = 0; i < n; i += 2) {
      const a0 = rot + (i / n) * TAU, a1 = rot + ((i + 1) / n) * TAU;
      vertex(C[0], C[1]); vertex(C[0] + Math.cos(a0) * RR, C[1] + Math.sin(a0) * RR); vertex(C[0] + Math.cos(a1) * RR, C[1] + Math.sin(a1) * RR);
    }
    endShape();
    fill(withAlphaCol(PAL.lilacLt, 0.35));
    beginShape(TRIANGLES);
    for (let i = 1; i < n; i += 4) {
      const a0 = rot + (i / n) * TAU, a1 = rot + ((i + 1) / n) * TAU;
      vertex(C[0], C[1]); vertex(C[0] + Math.cos(a0) * RR, C[1] + Math.sin(a0) * RR); vertex(C[0] + Math.cos(a1) * RR, C[1] + Math.sin(a1) * RR);
    }
    endShape();
    // rings that sink into the centre as we zoom out
    for (let k = Math.floor(z) - 5; k <= Math.floor(z) + 4; k++) {
      const rr = 620 * DZB * Math.pow(DK, k - z);
      if (rr < 6 || rr > (big ? 9000 : 2600)) continue;
      ringLine(C[0], C[1], rr, '#FFFFFF', Math.max(1.5, rr * 0.03), 0.5);
      ringLine(C[0], C[1], rr * 1.12, PAL.lilac, Math.max(1, rr * 0.008), 0.35);
    }
    // "recursive": a ripple rushes down the chain into the centre
    const rp = inv(w42(1) - 0.04, w42(1) + 0.4, T);
    if (rp > 0 && rp < 1) for (let i = 0; i < 3; i++) { const q = clamp(rp * 1.3 - i * 0.15); if (q > 0 && q < 1) ringLine(C[0], C[1], lerp(1500, 10, Ez.out(q)), PAL.butter, 18 * (1 - q) + 2, 0.8 * (1 - q)); }
    // the stack, biggest first
    const shk = 3 * kick(T, 14);
    push(); translate(RS(G.boil, 31) * shk, RS(G.boil, 32) * shk);
    for (let m = Math.floor(z) + 4; m >= Math.floor(z) - 6; m--) {
      const u = m - z, sc = DZB * Math.pow(DK, u);
      if (sc < 0.022 || sc > (big ? 12 : 7.5)) continue;
      const r = u * DTH;
      const gx = C[0] + (DG[0] * Math.cos(r) - DG[1] * Math.sin(r)) * sc, gy = C[1] + (DG[0] * Math.sin(r) + DG[1] * Math.cos(r)) * sc;
      if (!big && (gy - 560 * sc > H + 40 || gx + 560 * sc < -40 || gx - 560 * sc > W + 40)) continue;
      drosteLevel(T, m, gx, gy, sc, r);
    }
    pop();
    // level-up flash
    const la = T - UPG;
    if (la > -0.05 && la < 1.2) {
      const fl = since(T, UPG, 7);
      noStroke(); fill(withAlphaCol('#FFFFFF', 0.75 * fl)); rect(-4000, -4000, 10000, 10000);
      for (let i = 0; i < 2; i++) { const q = clamp((la - i * 0.1) / 0.6); if (q > 0 && q < 1) ringLine(C[0], C[1], 40 + Ez.out(q) * 1500, PAL.gold, 30 * (1 - q) + 2, 1 - q); }
      if (la > 0) {
        const k = Ez.outBack(clamp(la / 0.22), 2.4), a = 1 - inv(0.8, 1.15, la);
        txt('LEVEL UP!', 1430, 560 - la * 60, { font: 'pixel', size: 118, fill: PAL.butter, stroke: PAL.ink, sw: 10, weight: 700, shadow: 'rgba(43,33,64,0.5)' }, { s: k, a, r: -0.06 + 0.03 * Math.sin(T * 12) });
        for (let i = 0; i < 6; i++) { const ay = 760 - fract(la * 0.9 + i / 6) * 520; const ax = 1180 + i * 90 + Math.sin(T * 4 + i) * 16; noStroke(); fill(withAlphaCol(PAL.gold, a * 0.9)); triangle(ax, ay - 26, ax - 22, ay + 10, ax + 22, ay + 10); fill(withAlphaCol(PAL.gold, a * 0.9)); rect(ax - 9, ay + 8, 18, 22); }
      }
    }
  }
  // soft shadow the turning album page casts on the new page
  function foldShadow(T) {
    const pt = pageTurn(turnE(T));
    if (!pt) return;
    push(); translate(pt.m[0], pt.m[1]); rotate(pt.ang);
    gradRect(0, -2200, 120, 4400, withAlphaCol(PAL.ink, 0.3), withAlphaCol(PAL.ink, 0), false);
    pop();
  }
  shot({
    id: 'L42-recursion', t0: TL42,
    tin: { type: 'mask', d: TURN1 - TURN0, at: (TL42 - TURN0) / (TURN1 - TURN0), mask(p, T) { const pt = pageTurn(turnE(T)); if (pt) poly(pt.rev); } },
    draw(s) {
      drawDroste(s.T);
      if (s.T < TURN1) foldShadow(s.T);
    },
  });
  lyr(42, { y: 150, size: 80, words: { 1: { anim: 'zoom', fill: PAL.lilacLt }, 2: { fill: PAL.butter, anim: 'pop' } } });

  // =====================================================================================
  // L43 + L44 - the keyhole, the slam, the stage reveal, the bow, the curtain
  // (one continuous stage world; both shots call drawStage so the cut at 135.16 is seamless)
  // =====================================================================================
  const K = { x: 960, y: 600, r: 66, tw: 30, bw: 68, bh: 200 };
  const ZS = 17.5; // camera zoom on the keyhole when L43 opens (keyhole covers the frame)
  const SLAM = w43(4), NEVER = w43(5), KNOW = w43(6);
  defSprite('s14_backstage', 1000, 580, () => {
    flat([[-10, -10], [1010, -10], [1010, 590], [-10, 590]], mixc(PAL.night, PAL.black, 0.2));
    wash(-40, -40, 1080, 660, PAL.night, 200, 0.08);
    wash(-40, -40, 1080, 230, mixc(PAL.night, PAL.black, 0.4), 150, 0.2);
    blob(500, 380, 330, mixc(PAL.nightLt, PAL.red, 0.12), 80, 0.4);
    for (const x of [48, 92, 908, 952]) { pen(mixc(PAL.nightLt, PAL.gray, 0.3), 1.3, 'pen'); brush.line(x, 0, x + 4, 430); }
    pen(PAL.inkSoft, 3, 'marker'); brush.line(120, 82, 880, 82); brush.noStroke();
    for (let i = 0; i < 6; i++) { inkp(rrPts(162 + i * 132, 86, 40, 34, 10), PAL.ink, { baseC: PAL.inkSoft, lw: 1.2, lc: PAL.gray }); flat(ellPts(182 + i * 132, 122, 12, 5, 12), PAL.gray, 0.8); }
  });
  // the stage flat: dark papered wall (half res, drawn 2x: world x 300..1620, y 120..880)
  defSprite('s14_flatwall', 660, 380, () => {
    inkp([[602, 70], [628, 70], [654, 372], [628, 372]], PAL.brownLt, { lw: 1.3 });
    const face = rrPts(20, 15, 620, 360, 3);
    paint(face, mixc(PAL.lilac, PAL.ink, 0.66), { baseC: mixc(PAL.lilac, PAL.ink, 0.72), a: 150, lw: 2 });
    for (let i = 0; i < 12; i++) flat([[42 + i * 52, 17], [56 + i * 52, 17], [56 + i * 52, 304], [42 + i * 52, 304]], mixc(PAL.lilac, PAL.ink, 0.5), 0.35);
    paint(rrPts(20, 304, 620, 71, 2), mixc(PAL.brown, PAL.ink, 0.5), { baseC: mixc(PAL.brown, PAL.ink, 0.55), lw: 1.6 });
    pen(mixc(PAL.lilac, '#FFFFFF', 0.1), 1.6, 'pen'); brush.line(22, 18, 638, 18); brush.line(22, 306, 638, 306); brush.noStroke();
    inkp(ellPts(640, 366, 22, 11, 20), PAL.brownLt, { baseC: PAL.peach, lw: 1.2 });
  });
  // the door (1:1 world: x 700..1220, y 250..870)
  defSprite('s14_door', 520, 620, () => {
    const wood = mixc(PAL.brown, PAL.ink, 0.5);
    paint(rrPts(8, 8, 504, 612, 4), mixc(PAL.brown, PAL.ink, 0.32), { baseC: mixc(PAL.brown, PAL.ink, 0.38), lw: 2.2 });
    paint(rrPts(38, 38, 444, 582, 3), wood, { baseC: mixc(PAL.brown, PAL.ink, 0.56), a: 170, lw: 2 });
    for (const [x, y, w, h] of [[70, 70, 120, 510], [330, 70, 120, 510], [210, 70, 100, 150]]) inkp(rrPts(x, y, w, h, 6), mixc(PAL.brown, PAL.ink, 0.42), { baseC: mixc(PAL.brown, PAL.ink, 0.47), lw: 1.6 });
    for (let i = 0; i < 7; i++) { pen(mixc(PAL.brown, PAL.ink, 0.62), 1, 'pen'); brush.line(90 + i * 55, 60, 94 + i * 55, 600); } brush.noStroke();
    paint(ellPts(452, 360, 22, 22, 24), PAL.gold, { baseC: PAL.butter, lw: 1.6 });
    flat(ellPts(446, 353, 7, 5, 12), '#FFFFFF', 0.8);
  });
  defSprite('s14_plate', 260, 380, () => {
    const pts = [[130, 12], [196, 40], [226, 110], [220, 250], [236, 330], [130, 368], [24, 330], [40, 250], [34, 110], [64, 40]];
    paint(rrPtsPoly(pts, 30), PAL.gold, { baseC: '#FFD86A', lw: 2.2 });
    paint(rrPtsPoly(scalePts(pts, 130, 190, 0.84), 26), PAL.orange, { baseC: PAL.gold, a: 90, lw: 1.2, lc: dark(PAL.gold, 0.3) });
    for (const [x, y] of [[130, 36], [130, 344], [52, 190], [208, 190]]) inkp(ellPts(x, y, 9, 9, 14), PAL.gold, { baseC: PAL.butterLt, lw: 1.2 });
  });
  defSprite('s14_floor', 1000, 170, () => {
    flat([[-10, 42], [1010, 42], [1010, 92], [-10, 92]], mixc(PAL.brownLt, PAL.brown, 0.25)); // opaque bases
    flat([[-10, 90], [1010, 90], [1010, 124], [-10, 124]], mixc(PAL.brown, PAL.ink, 0.55));
    flat([[-10, 122], [1010, 122], [1010, 180], [-10, 180]], mixc(PAL.night, PAL.black, 0.2));
    wash(-20, 40, 1040, 52, PAL.brownLt, 170, 0.05);
    wc(PAL.brown, 70, 0.05, 0.5, 0.3); brush.rect(-20, 40, 1040, 14); brush.noFill();
    pen(dark(PAL.brownLt, 0.35), 1.1, 'pen');
    for (const y of [52, 64, 78]) brush.line(-10, y, 1010, y);
    for (let i = 0; i < 40; i++) { const y = [40, 52, 64, 78][i % 4], x = (i * 97 + (i % 4) * 41) % 1000; brush.line(x, y, x, y + [12, 12, 14, 12][i % 4]); }
    brush.noStroke();
    wash(-20, 90, 1040, 32, mixc(PAL.brown, PAL.ink, 0.55), 230, 0.05);
    pen(PAL.gold, 3, 'marker'); brush.line(-10, 91, 1010, 91); brush.noStroke();
  });
  // audience silhouettes (anchor at bottom centre)
  const SIL = mixc(PAL.ink, PAL.night, 0.35);
  function headSprite(name, extra) {
    defSprite(name, 170, 200, () => {
      extra();
      flat(rrPts(22, 120, 126, 90, 40), SIL); flat(ellPts(85, 86, 44, 48, 28), SIL);
      pen(PAL.lilac, 2.2, 'pen'); brush.spline([[48, 70], [66, 44], [96, 40], [120, 58]], 0.5); brush.noStroke();
    }, { ax: 0.5, ay: 1 });
  }
  headSprite('s14_head_a', () => {});
  headSprite('s14_head_b', () => { flat(ellPts(85, 34, 24, 20, 20), SIL); });
  headSprite('s14_head_c', () => { flat([[46, 70], [52, 24], [70, 50], [84, 14], [98, 48], [118, 22], [124, 70]], SIL); });
  headSprite('s14_head_d', () => { flat(ellPts(62, 30, 12, 36, 16, 0, -0.2), SIL); flat(ellPts(110, 30, 12, 36, 16, 0, 0.2), SIL); });
  headSprite('s14_head_e', () => { for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; flat(ellPts(85 + Math.cos(a) * 44, 84 + Math.sin(a) * 44, 22, 22, 16), SIL); } });
  // flowers, top hat, petal, question marks
  defSprite('s14_rose', 120, 180, () => {
    strokePath([[60, 172], [62, 120], [58, 70]], PAL.green, 5, 'marker', 0.5);
    paint([[62, 130], [96, 112], [74, 140]], PAL.green, { baseC: PAL.mintLt, lw: 1.2 });
    paint(ellPts(60, 52, 32, 30, 24, 0.12), PAL.red, { baseC: '#FF6A7E', lw: 1.6 });
    strokePath([[46, 50], [60, 38], [74, 52], [62, 62], [52, 54]], dark(PAL.red, 0.3), 2, 'pen', 0.6);
  }, { v: 2 });
  defSprite('s14_tulip', 120, 180, () => {
    strokePath([[60, 172], [58, 110], [60, 70]], PAL.green, 5, 'marker', 0.5);
    paint([[58, 150], [26, 120], [54, 132]], PAL.green, { baseC: PAL.mintLt, lw: 1.2 });
    paint([[34, 40], [48, 60], [60, 30], [72, 60], [86, 40], [84, 72], [60, 88], [36, 72]], PAL.pink, { baseC: PAL.pinkLt, lw: 1.6 });
  });
  defSprite('s14_daisy', 120, 180, () => {
    strokePath([[60, 172], [62, 120], [60, 70]], PAL.green, 5, 'marker', 0.5);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; inkp(ellPts(60 + Math.cos(a) * 24, 52 + Math.sin(a) * 24, 14, 8, 12, 0, a), '#FFFFFF', { baseC: '#FFFFFF', lw: 1 }); }
    paint(ellPts(60, 52, 14, 14, 18), PAL.butter, { baseC: PAL.butterLt, lw: 1.3 });
  });
  defSprite('s14_tophat', 200, 170, () => {
    paint(rrPts(50, 14, 100, 120, 10), PAL.ink, { baseC: '#3B2F55', lw: 2 });
    inkp(rrPts(50, 96, 100, 24, 4), PAL.red, { baseC: '#FF6A7E', lw: 1.4 });
    paint(ellPts(100, 138, 88, 20, 30), PAL.ink, { baseC: '#3B2F55', lw: 2 });
    flat(rrPts(62, 24, 14, 64, 6), '#FFFFFF', 0.25);
  }, { ay: 0.82 });
  defSprite('s14_petal', 50, 50, () => { paint([[25, 6], [40, 22], [34, 42], [16, 42], [10, 22]], PAL.red, { baseC: '#FF7A8E', lw: 1 }); });
  function qPts() { // thick question-mark hook as a polygon
    const c = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * 1.05 + (i / 16) * Math.PI * 1.3; c.push([70 + Math.cos(a) * 38, 64 + Math.sin(a) * 38]); }
    c.push([82, 104], [74, 118], [72, 132]);
    const L = [], Rr = [], hw = 13;
    for (let i = 0; i < c.length; i++) {
      const p0 = c[Math.max(0, i - 1)], p1 = c[Math.min(c.length - 1, i + 1)];
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 1;
      L.push([c[i][0] - (dy / d) * hw, c[i][1] + (dx / d) * hw]); Rr.push([c[i][0] + (dy / d) * hw, c[i][1] - (dx / d) * hw]);
    }
    return [...L, ...Rr.reverse()];
  }
  [['s14_q0', PAL.butter], ['s14_q1', PAL.pink], ['s14_q2', PAL.sky]].forEach(([nm, c]) => {
    defSprite(nm, 150, 200, () => { paint(qPts(), c, { baseC: lite(c, 0.35), lw: 2 }); paint(ellPts(72, 166, 15, 15, 20), c, { baseC: lite(c, 0.35), lw: 2 }); });
  });
  // visions inside the keyhole: shapes you almost recognise (translucent washes with dark pencil)
  const VW = { base: false, a: 150, lw: 2.2, lc: PAL.inkSoft };
  defSprite('s14_vis0', 220, 220, () => { paint([[20, 110], [60, 70], [110, 56], [160, 70], [200, 110], [160, 150], [110, 164], [60, 150]], PAL.skyLt, VW); paint(ellPts(110, 110, 34, 34, 28), PAL.lilac, VW); flat(ellPts(110, 110, 14, 14, 16), PAL.ink); });
  defSprite('s14_vis1', 220, 220, () => { for (const s of [1, -1]) { const p = []; for (let i = 0; i < 30; i++) { const a = i * 0.22, r = 8 + i * 3.1; p.push([110 + s * Math.cos(a) * r, 110 + s * Math.sin(a) * r]); } strokePath(p, PAL.lilac, 6, 'marker', 0.6); strokePath(p, PAL.inkSoft, 1.4, 'pen', 0.6); } blob(110, 110, 16, PAL.pink, 200, 0.1); });
  defSprite('s14_vis2', 220, 220, () => { paint(ellPts(110, 110, 50, 50, 32), PAL.mint, VW); pen(PAL.sky, 6, 'marker'); brush.spline(ellPts(110, 110, 96, 26, 24, 0, -0.35), 0.4); pen(PAL.inkSoft, 1.4, 'pen'); brush.spline(ellPts(110, 110, 96, 26, 24, 0, -0.35), 0.4); brush.noStroke(); });
  defSprite('s14_vis3', 220, 220, () => { const br = (x, y, a, l, d) => { if (d > 4) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; pen(PAL.mint, 7 - d, 'marker'); brush.line(x, y, x2, y2); pen(PAL.inkSoft, 1.2, 'pen'); brush.line(x, y, x2, y2); brush.noStroke(); br(x2, y2, a - 0.45, l * 0.72, d + 1); br(x2, y2, a + 0.45, l * 0.72, d + 1); }; br(110, 205, -Math.PI / 2, 60, 0); });
  defSprite('s14_vis4', 220, 220, () => { const p = [[110, 30], [190, 76], [190, 164], [110, 210], [30, 164], [30, 76]]; paint(p, PAL.lilacLt, VW); pen(PAL.inkSoft, 2, '2B'); brush.line(110, 120, 110, 210); brush.line(110, 120, 30, 76); brush.line(110, 120, 190, 76); brush.noStroke(); });
  defSprite('s14_vis5', 220, 220, () => { paint(ellPts(64, 110, 40, 40, 28), PAL.butter, VW); flat(ellPts(64, 110, 15, 15, 16), PAL.pinkLt); paint([[100, 100], [200, 100], [200, 120], [196, 120], [196, 144], [182, 144], [182, 120], [172, 120], [172, 150], [158, 150], [158, 120], [100, 120]], PAL.butter, VW); });

  // ---- timeline helpers ----
  function stageCam(T) {
    const e1 = Ez.inOut(inv(TL43, 132.12, T));
    let Z = Math.exp(lerp(Math.log(ZS), Math.log(2.0), e1));
    Z *= 1 + 0.06 * sstep(132.12, SLAM, T) - 0.05 * sstep(SLAM, 134.6, T) + 0.04 * since(T, SLAM, 10);
    const ks = lerp(540, 356, e1);
    let cx = K.x, cy = K.y - (ks - 540) / Z;
    const e2 = Ez.inOut(inv(TL44 + 0.04, 136.45, T));
    if (e2 > 0) { Z = Math.exp(lerp(Math.log(Z), 0, e2)); cy = lerp(cy, 540, e2); cx = lerp(cx, 960, e2); }
    // push in on the ta-da and the bow, then ease back to exactly the curtain frame for the hand-off
    const bw = Ez.inOut(inv(136.6, 137.45, T)) * (1 - Ez.inOut(inv(138.3, 138.8, T)));
    Z *= 1 + 0.2 * bw; cy += 150 * bw;
    return { cx, cy, Z };
  }
  const lightsOn = (T) => sstep(TL44, TL44 + 0.16, T);
  const houseDim = (T) => sstep(138.3, 138.85, T);
  const curtainOpen = (T) => 0.86 * (1 - Ez.inOut(inv(138.36, 139.62, T)));
  function ambDark(T) {
    if (T < SLAM) return 0.4;
    if (T < TL44) return lerp(0.4, 0.8, inv(SLAM, SLAM + 0.06, T)) + 0.06 * inv(NEVER, NEVER + 0.12, T);
    return 0.86 * (1 - lightsOn(T));
  }
  function lightLevel(T) { // flicker + flares on "Ilya" / "see?"
    const fl = 0.84 + 0.12 * vnoise(T * 17, 3) + 0.06 * vnoise(T * 41, 4) + 0.1 * kick(T, 7);
    return fl + 0.7 * since(T, w43(2), 5) + 0.9 * since(T, w43(3), 3.5) + 0.35 * since(T, w43(1), 6);
  }
  // character blocking (world coords)
  function pipState(T) {
    const lean = sstep(w43(1) - 0.1, w43(1) + 0.05, T), flare = T > w43(2) && T < SLAM;
    const blown = Ez.outBack(clamp((T - SLAM) / 0.3));
    let x = 812 - 10 * (flare ? since(T, w43(2), 3) : 0) - 60 * blown, y = 895, s = 0.66;
    const o = { face: 'pf_neutral', r: 0.1 + 0.07 * lean, headR: 0.14 + 0.04 * lean, armL: 0.35, armR: 1.25 + 0.2 * lean, hop: hopB(T) * 5 };
    if (flare) { o.face = 'pf_shock'; o.armR = 1.7; o.armL = 0.9; }
    if (T > SLAM) {
      const a = T - SLAM;
      if (T > SLAM + 0.35 && T < KNOW) x += Math.sin(T * 38) * 2;
      o.face = 'pf_scared'; o.r = lerp(0.2, -0.08, clamp(a / 0.3)); o.headR = 0; o.hop = Math.sin(Math.PI * clamp(a / 0.34)) * 50;
      o.armL = 2.2; o.armR = 2.2;
      const sh = Ez.outBack(clamp((T - KNOW) / 0.25)) * (1 - inv(TL44 - 0.1, TL44 + 0.1, T));
      if (T > KNOW - 0.05) { o.face = 'pf_nervous'; o.armL = lerp(0.3, 1.6, sh); o.armR = lerp(0.3, 1.6, sh); o.r = 0; o.hop = sh * 8 * hopB(T); }
    }
    if (T > TL44) { // lights up: startled, then hurry into the wings to the rope
      o.face = T < TL44 + 0.35 ? 'pf_shock' : 'pf_happy'; o.hop = T < TL44 + 0.3 ? Math.sin(Math.PI * inv(TL44, TL44 + 0.3, T)) * 26 : 0;
      o.r = 0; o.headR = 0; o.armL = 0.6; o.armR = 0.6;
      const wk = inv(135.5, 136.3, T);
      x = lerp(752, 250, Ez.inOut(wk)); y = lerp(895, 905, wk); s = lerp(0.66, 0.7, wk);
      if (wk > 0 && wk < 1) { o.walk = (T - 135.5) * 2.6; o.flip = true; o.hop = Math.abs(Math.sin((T - 135.5) * 2.6 * Math.PI)) * 12; o.face = 'pf_nervous'; }
      if (T > 136.3 && T < 138.3) { const c = beatAt(T).ph; o.armL = 1.0 + 0.45 * Math.cos(c * TAU); o.armR = 1.0 + 0.45 * Math.cos(c * TAU); o.hop = hopB(T) * 10; }
      if (T > 138.3) { // pull the rope hand over hand while the curtain closes
        const pull = inv(138.36, 139.62, T), ph = pull * 2.2;
        o.face = 'pf_neutral'; o.armL = 2.35 + 0.35 * Math.sin(ph * TAU); o.armR = 2.35 - 0.35 * Math.sin(ph * TAU); o.hop = 0; o.r = 0.04 * Math.sin(ph * TAU);
      }
      if (T > 139.6) { // let go and slip behind the closed curtain (s15 opens with Pip hidden)
        const g = Ez.inOut(inv(139.6, 139.86, T));
        x = lerp(250, 440, g); o.walk = (T - 139.6) * 3; o.armL = lerp(o.armL, 0.3, g); o.armR = lerp(o.armR, 0.3, g);
      }
    }
    return { x, y, s, o };
  }
  function clawdState(T) {
    const lean = sstep(w43(1) - 0.1, w43(1) + 0.05, T), flare = T > w43(2) && T < SLAM;
    const blown = Ez.outBack(clamp((T - SLAM) / 0.3));
    let x = 1122 + 56 * blown, y = 895, s = 0.56;
    const o = { r: -0.07 - 0.05 * lean, look: [-0.85, 0.15], armL: 0.1, armR: 0.3, hop: hopB(T + 0.1) * 5, seed: 1 };
    if (flare) { o.eyes = 'ce_dot'; o.eyeS = 1.5; o.armL = -1.2; o.armR = 0.2; }
    let hat = null;
    if (T > SLAM) {
      const a = T - SLAM;
      o.r = lerp(0.25, 0, clamp(a / 0.35)); o.hop = Math.sin(Math.PI * clamp(a / 0.34)) * 44; o.eyes = 'ce_x'; o.armL = -1.4; o.armR = -1.4; o.look = [0, 0];
      if (a > 0.5) { o.eyes = 'ce_sq'; o.armL = 0.2; o.armR = 0.2; }
      const sh = Ez.outBack(clamp((T - KNOW) / 0.25)) * (1 - inv(TL44 - 0.1, TL44 + 0.1, T));
      if (T > KNOW - 0.05) { o.armL = lerp(0.2, -1.5, sh); o.armR = lerp(0.2, -1.5, sh); o.hop = sh * 8 * hopB(T + 0.1); }
    }
    if (T > TL44) {
      o.r = 0; o.eyes = T < TL44 + 0.35 ? 'ce_dot' : 'ce_happy'; o.eyeS = T < TL44 + 0.35 ? 1.4 : 1; o.look = [0, 0.1]; o.armL = 0.2; o.armR = 0.2;
      o.hop = T < TL44 + 0.3 ? Math.sin(Math.PI * inv(TL44, TL44 + 0.3, T)) * 30 : 0;
      const wk = inv(135.52, 136.62, T);
      x = lerp(1178, 960, Ez.inOut(wk)); y = lerp(895, 936, Ez.inOut(wk)); s = lerp(0.56, 0.8, Ez.inOut(wk));
      if (wk > 0 && wk < 1) { o.walk = (T - 135.52) * 2.2; o.hop = hopB(T) * 16; o.eyes = 'ce_sq'; o.look = [-0.3, 0.2]; o.armL = 0.3 * Math.sin(T * 13); o.armR = -0.3 * Math.sin(T * 13); }
      const HD = 136.66; // the top hat drops in
      if (T > HD - 0.25) hat = { mode: 'head', y: -((Math.max(0, 1 - inv(HD - 0.25, HD, T))) ** 2) * 700, sq: 1 + 0.3 * since(T, HD, 10) };
      if (T > HD && T < 137.35) { const k = Ez.outBack(clamp((T - HD) / 0.2)); o.armL = -1.25 * k; o.armR = -1.25 * k; o.eyes = 'ce_happy'; o.hop = hopB(T) * 18; o.sq = 1 + 0.12 * since(T, HD, 9); }
      if (T > 137.35 && T < 137.5) { const k = inv(137.35, 137.5, T); o.sq = 1 - 0.06 * k; o.armL = -0.4 * k; o.armR = -0.4 * k; o.hop = 8 * k; }
      const bow = T > w44(1) ? Ez.outBack(clamp((T - w44(1)) / 0.16)) * (1 - Ez.inOut(inv(138.02, 138.3, T))) : 0;
      if (bow > 0) { o.sq = 1 + 0.2 * bow; o.look = [0, 0.95 * bow]; o.eyes = 'ce_happy'; o.armL = lerp(0.2, 0.9, bow); o.armR = lerp(0.2, 0.7, bow); o.hop = 0; }
      if (T > w44(2) - 0.08 && T < 138.5) { // tip the hat on "all"
        const k = Ez.outBack(clamp((T - w44(2) + 0.08) / 0.2));
        o.armR = lerp(o.armR, -1.9, k); hat = { mode: 'hand' };
      }
      if (T > 138.02) { o.blush = true; o.eyes = T < 138.4 ? 'ce_heart' : 'ce_happy'; }
      if (T > 138.3) { // step back upstage as the curtain comes down
        const sb = Ez.inOut(inv(138.3, 138.7, T));
        y = lerp(936, 900, sb); s = lerp(0.8, 0.64, sb);
      }
      if (T > 138.5) { // single small wave in the silence
        hat = { mode: 'head', y: 0, sq: 1 }; o.armR = 0.3;
        const wv = inv(138.6, 139.5, T); o.armL = -1.2 - 0.35 * Math.sin(wv * TAU * 1.5) * Math.sin(Math.PI * wv); o.look = [0, 0];
      }
    }
    return { x, y, s, o, hat };
  }
  function drawClawdStage(T) {
    const c = clawdState(T);
    clawd(c.x, c.y, c.s, c.o);
    if (c.hat) clawdFrame(c.x, c.y, c.s, c.o, () => {
      if (c.hat.mode === 'head') spr('s14_tophat', 0.3 * CU, -7.9 * CU + c.hat.y, { s: 0.95, sx: c.hat.sq, sy: 1 / c.hat.sq, r: 0.12 });
      else { push(); translate(4 * CU, -5 * CU); rotate(c.o.armR); spr('s14_tophat', 2.3 * CU, -1.3 * CU, { s: 0.95, r: -c.o.armR - 0.3 }); pop(); } // tipped in the right hand
    });
    return c;
  }
  // flowers thrown from the audience on "it"/"all"
  const FLOWERS = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
    t: 137.56 + i * 0.05 + R(i, 71) * 0.06, x0: 260 + i * 180 + RS(i, 72) * 40, y0: 1060,
    x1: 960 + (i - 4) * 62 + RS(i, 73) * 24, y1: 944 + R(i, 74) * 20, n: ['s14_rose', 's14_tulip', 's14_daisy'][i % 3], rr: RS(i, 75) * 1.4 + (i % 2 ? 1.57 : -1.57),
  }));
  function drawFlowers(T) {
    for (let i = 0; i < FLOWERS.length; i++) {
      const f = FLOWERS[i], u = (T - f.t) / 0.52;
      if (u < 0) continue;
      if (u < 1) { const x = lerp(f.x0, f.x1, u), y = lerp(f.y0, f.y1, u) - Math.sin(Math.PI * u) * 430; spr(f.n, x, y, { s: 0.8, r: u * 7 * (i % 2 ? 1 : -1), seed: i }); }
      else { const b = since(T, f.t + 0.52, 12); spr(f.n, f.x1, f.y1 - b * 14, { s: 0.76, sy: 0.6, r: f.rr, seed: i }); }
    }
  }
  const AUD = (() => { const a = []; for (let i = 0; i < 11; i++) a.push({ x: 90 + i * 178 + RS(i, 81) * 20, y: 1062, s: 0.62 + R(i, 82) * 0.1, n: 's14_head_' + 'abcde'[i % 5], row: 0 }); for (let i = 0; i < 9; i++) a.push({ x: 180 + i * 200 + RS(i, 83) * 26, y: 1130, s: 0.86 + R(i, 84) * 0.1, n: 's14_head_' + 'cadeb'[i % 5], row: 1 }); return a; })();
  function drawAudience(T) {
    const live = T < 138.32, waving = T > 136.6 && T < 138.4;
    const clap = live && T > 136.6 ? since(T, beatAt(T).t, 6) : 0;
    const arms = [[], []];
    AUD.forEach((h, i) => {
      const hop = live ? hopB(T + R(i, 85) * 0.12) * (8 + R(i, 86) * 8) : 0;
      if (waving && i % 3 !== 1) { // arms up waving, clapping on the beat
        const ax = h.x + (i % 2 ? 50 : -50) * h.s, ay = h.y - 150 * h.s - hop - 30 * clap;
        arms[h.row].push([h.x + (i % 2 ? 30 : -30) * h.s, h.y - 60 * h.s, ax, ay]); disc(ax, ay, 14 * h.s, SIL);
      }
      spr(h.n, h.x, h.y - hop, { s: h.s, r: RS(i, 87) * 0.08 + (live ? 0.04 * Math.sin(T * 3 + i) : 0), seed: i });
    });
    segLines(arms[0], SIL, 12); segLines(arms[1], SIL, 16);
  }
  // keyhole geometry helpers
  function keyholeClip() { circle(K.x, K.y, K.r * 2); quad(K.x - K.tw, K.y, K.x + K.tw, K.y, K.x + K.bw, K.y + K.bh, K.x - K.bw, K.y + K.bh); }
  function keyholeOutline() {
    const r = K.r, jy = Math.sqrt(r * r - K.tw * K.tw), aJ = Math.atan2(jy, K.tw), span = TAU - (Math.PI - 2 * aJ);
    beginShape();
    for (let i = 0; i <= 44; i++) { const a = aJ - (i / 44) * span; vertex(K.x + Math.cos(a) * r, K.y + Math.sin(a) * r); }
    vertex(K.x - K.bw, K.y + K.bh); vertex(K.x + K.bw, K.y + K.bh);
    endShape(CLOSE);
  }
  function keyholeInside(T) {
    const la = sstep(131.45, 131.98, T);
    push();
    clipTo(keyholeClip);
    noStroke(); fill(PAL.black); rect(K.x - 200, K.y - 200, 400, 500);
    if (T < 132.05) { push(); translate(K.x, K.y); scale(1 / ZS); translate(-960, -540); drawDroste(T, { big: true }); pop(); }
    if (la > 0 && T < SLAM + 0.02) {
      const L = lightLevel(T);
      fill(withAlphaCol(mixc(PAL.lilac, PAL.pink, 0.5), la)); rect(K.x - 200, K.y - 200, 400, 500);
      for (let i = 5; i >= 0; i--) disc(K.x, K.y + 40, 24 + i * 30, mixc(PAL.butterLt, PAL.orange, i / 5), la * (0.16 + 0.05 * L));
      const bl = ['blob_pink', 'blob_lilac', 'blob_sky', 'blob_mint', 'blob_butter', 'blob_orange'];
      for (let i = 0; i < 9; i++) {
        const sp = (0.9 + (i % 3) * 0.45) * (i % 2 ? 1 : -1), ang = T * sp + i * 0.8, rr = 28 + (i % 4) * 20;
        spr(bl[i % bl.length], K.x + Math.cos(ang) * rr, K.y + 50 + Math.sin(ang) * rr * 1.5, { s: 0.55 + 0.25 * (i % 3), r: ang, a: la * clamp(0.5 * L), seed: i });
      }
      disc(K.x, K.y + 34, 26 + 6 * L, '#FFFFFF', 0.55 * la);
      const st = []; for (let i = 0; i < 12; i++) { const a = T * 0.7 + (i / 12) * TAU; st.push([K.x + Math.cos(a) * 40, K.y + 30 + Math.sin(a) * 40, K.x + Math.cos(a) * 240, K.y + 30 + Math.sin(a) * 240]); }
      segLines(st, '#FFFFFF', 3, la * 0.14 * L);
      // visions drifting toward us out of the glare
      for (let i = 0; i < 5; i++) {
        const P = 1.3, q = (T - 131.8) / P + i / 5, cyc = Math.floor(q), ph = fract(q);
        const nm = 's14_vis' + ((cyc * 2 + i * 3) % 6 + 6) % 6;
        const ang = R(cyc * 5 + i, 91) * TAU, dist = 10 + ph * 50;
        const flick = 0.55 + 0.45 * vnoise(T * 22 + i * 7, 9);
        spr(nm, K.x + Math.cos(ang) * dist, K.y + 40 + Math.sin(ang) * dist * 1.4, { s: lerp(0.2, 0.62, ph), r: RS(cyc, i) * 0.6 + ph * 0.5, a: la * sstep(131.8, 132.0, T) * Math.sin(Math.PI * ph) * flick * 0.8, seed: i });
      }
      if (T > w43(2)) { const f = since(T, w43(2), 6) + since(T, w43(3), 5); fill(withAlphaCol('#FFFFFF', clamp(f * 0.4))); rect(K.x - 200, K.y - 200, 400, 500); }
    }
    // the far door slams shut (seen through the keyhole)
    const sw = inv(SLAM - 0.13, SLAM, T);
    if (sw > 0) {
      const ex = lerp(K.x + K.bw + 10, K.x - K.bw - 10, Ez.in(sw));
      fill(mixc(PAL.brown, PAL.ink, 0.72)); rect(ex, K.y - 200, 400, 500);
      segLine(ex, K.y - 200, ex, K.y + 300, PAL.butter, 4, 0.8 * (1 - sw));
    }
    pop();
  }
  function keyholeLeak(T) { // light leaking under the slammed far door, flickering out on "never"
    if (T < SLAM || T > NEVER + 0.15) return;
    const lk = (1 - inv(NEVER - 0.05, NEVER + 0.15, T)) * (0.55 + 0.45 * vnoise(T * 30, 12));
    push(); clipTo(keyholeClip);
    blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.butter, 0.8 * lk)); rect(K.x - K.bw, K.y + K.bh - 16, K.bw * 2, 14); blendMode(BLEND);
    pop();
    glow(K.x, K.y + K.bh - 10, 90, PAL.butter, 0.3 * lk);
  }
  function keyholeMotes(T, I) { // specks of the light drifting out into the room
    for (let i = 0; i < 12; i++) {
      const ph = fract(T * (0.35 + 0.2 * R(i, 51)) + R(i, 52)), a = -Math.PI / 2 + RS(i, 53) * 1.6;
      const d = 40 + ph * (260 + 160 * R(i, 54));
      const x = K.x + Math.cos(a) * d * 1.3 + Math.sin(T * 2 + i) * 12, y = K.y + 40 + Math.sin(a) * d * 0.7 + ph * 90;
      spr(i % 3 ? 'sparkW' : 'spark', x, y, { s: 0.1 + 0.08 * R(i, 55), r: T * 2 + i, a: I * Math.sin(Math.PI * ph) * 0.9, seed: i });
    }
  }
  function keyholeGlow(T, ps, cl) {
    const la = sstep(131.45, 131.98, T);
    const aft = T >= SLAM ? since(T, SLAM, 14) : 1;
    const I = la * aft * lightLevel(T);
    if (I <= 0.01) return;
    keyholeMotes(T, clamp(I));
    blendMode(ADD); noStroke();
    // god rays fanning out of the keyhole
    for (let i = 0; i < 11; i++) {
      const a = 0.2 + (i / 10) * (Math.PI - 0.4) + 0.04 * Math.sin(T * 1.3 + i), w = 0.035 + 0.02 * R(i, 61);
      const len = 900 + 200 * R(i, 62), al = 0.035 * I * (0.6 + 0.4 * vnoise(T * 3 + i, 63));
      const r0 = 150, cx = K.x, cy = K.y + 60;
      fill(withAlphaCol(PAL.butter, al));
      quad(cx + Math.cos(a - w * 2) * r0, cy + Math.sin(a - w * 2) * r0, cx + Math.cos(a - w) * len, cy + Math.sin(a - w) * len, cx + Math.cos(a + w) * len, cy + Math.sin(a + w) * len, cx + Math.cos(a + w * 2) * r0, cy + Math.sin(a + w * 2) * r0);
    }
    // keyhole-shaped pool of light on the floor
    fill(withAlphaCol(PAL.butter, 0.3 * I)); ellipse(960, 884, 150, 30); quad(930, 884, 990, 884, 1070, 968, 850, 968);
    fill(withAlphaCol(PAL.butterLt, 0.18 * I)); ellipse(960, 925, 420, 90);
    blendMode(BLEND);
    glow(K.x, K.y + 50, 240, PAL.orange, 0.2 * I);
    const pe = pipEyePts(ps.x, ps.y, ps.s, ps.o), ce = clawdEyePts(cl.x, cl.y, cl.s, cl.o);
    glow((pe[0][0] + pe[1][0]) / 2 + 20, pe[0][1], 90, PAL.butter, 0.4 * I);
    const gl = since(T, w43(2), 5) + since(T, w43(3), 4); // glasses glint on "Ilya" / "see?"
    if (gl > 0.02 && T < SLAM) for (const [x, y] of pe) spr('sparkW', x + 10, y - 8, { s: 0.3 * clamp(gl), r: T * 3, a: clamp(gl) });
    glow((ce[0][0] + ce[1][0]) / 2 - 20, ce[0][1], 90, PAL.butter, 0.4 * I);
  }
  function darkEyes(T, ps, cl) { // cartoon eyes glowing in the dark
    const d = T > SLAM + 0.05 ? (1 - lightsOn(T)) : 0;
    if (d <= 0) return;
    const blink = (t) => (T > t && T < t + 0.12 ? 0.12 : 1);
    const bk = Math.min(blink(NEVER + 0.06), blink(134.75));
    const lookP = sstep(NEVER + 0.2, NEVER + 0.4, T) * (1 - sstep(KNOW - 0.1, KNOW, T));
    const pe = pipEyePts(ps.x, ps.y, ps.s, ps.o);
    for (const [x, y] of pe) { push(); translate(x, y); scale(1, bk); disc(0, 0, 11 * ps.s * 2, '#FFFFFF', d); disc(6 * lookP * 2 + 0, 1, 5 * ps.s * 2, PAL.ink, d); pop(); }
    const ce = clawdEyePts(cl.x, cl.y, cl.s, cl.o);
    const es = CU * cl.s;
    for (const [x, y] of ce) { push(); translate(x, y); scale(1, bk); noStroke(); fill(withAlphaCol('#FFFFFF', d)); rect(-es / 2, -es / 2, es, es, 3); fill(withAlphaCol(PAL.ink, d)); rect(-es * 0.22 - lookP * es * 0.2, -es * 0.2, es * 0.4, es * 0.4, 2); pop(); }
  }
  function qmarks(T, ps, cl) {
    if (T < KNOW - 0.05 || T > 136.4) return;
    const fade = 1 - inv(135.7, 136.4, T);
    for (let i = 0; i < 6; i++) {
      const t0 = KNOW + i * 0.07, age = T - t0;
      if (age < 0) continue;
      const isP = i % 2 === 0, bx = isP ? ps.x + 20 : cl.x;
      const topY = isP ? ps.y - 250 * ps.s : cl.y - 330 * cl.s;
      const x = bx + (Math.floor(i / 2) - 1) * 70 + Math.sin(T * 2.2 + i) * 14, y = topY - 40 - age * 60 - Math.floor(i / 2) * 26;
      spr('s14_q' + (i % 3), x, y, { s: 0.55 * Ez.outBack(clamp(age / 0.25), 2.6), r: 0.25 * Math.sin(T * 3 + i), a: fade, seed: i });
    }
  }
  function stageLights(T) {
    const L = lightsOn(T), house = houseDim(T);
    if (L <= 0) return;
    blendMode(ADD); noStroke();
    const on = L * (1 - house);
    const sweep = sstep(136.3, 136.8, T);
    for (const sx of [-1, 1]) {
      const tx = 960 - sx * 180 + sx * Math.sin((T - 136.3) * (sx > 0 ? 2.7 : 2.3)) * 330 * sweep;
      fill(withAlphaCol(sx > 0 ? PAL.pinkLt : PAL.skyLt, 0.09 * on)); triangle(960 + sx * 780, 140, tx - 110, 1000, tx + 110, 1000);
    }
    fill(withAlphaCol(PAL.butterLt, 0.08 * L * sstep(136.4, 136.7, T) * (1 - house))); triangle(960, -60, 730, 1000, 1190, 1000);
    blendMode(BLEND);
    glow(960, 760, 620, PAL.butter, 0.22 * on);
    for (let i = 0; i < 11; i++) glow(330 + i * 126, 948, 40, PAL.butter, 0.3 * on * (0.8 + 0.2 * kick(T + i * 0.03, 5)));
    if (T > TL44) burst(T, TL44 + 0.02, 960, 540, { n: 10, names: ['sparkW'], spd: 1300, g: 0, life: 0.6, s: 0.4, even: true, seed: 140 });
  }
  function spotDark(cx, cy, rx, ry, a, fe = 1.28) {
    const N = 56, cIn = withAlphaCol(DARK, 0), cOut = withAlphaCol(DARK, a);
    noStroke();
    beginShape(TRIANGLE_STRIP);
    for (let i = 0; i <= N; i++) { const t = (i / N) * TAU, c = Math.cos(t), s = Math.sin(t); fill(cIn); vertex(cx + c * rx, cy + s * ry); fill(cOut); vertex(cx + c * rx * fe, cy + s * ry * fe); }
    endShape();
    beginShape(TRIANGLE_STRIP);
    for (let i = 0; i <= N; i++) { const t = (i / N) * TAU, c = Math.cos(t), s = Math.sin(t); fill(cOut); vertex(cx + c * rx * fe, cy + s * ry * fe); vertex(cx + c * 4000, cy + s * 4000); }
    endShape();
  }
  function drawRope(T) {
    const pull = inv(138.36, 139.62, T);
    const rx = 300;
    segLine(rx, -60, rx, 820, PAL.ink, 9); segLine(rx, -60, rx, 820, PAL.brownLt, 5);
    const tk = []; for (let y = -60 + ((pull * 260) % 26); y < 820; y += 26) tk.push([rx - 4, y, rx + 4, y + 10]);
    segLines(tk, dark(PAL.brownLt, 0.3), 2);
    disc(rx, 832, 14, PAL.gold); segLines([0, 1, 2, 3, 4].map((i) => [rx - 8 + i * 4, 838, rx - 10 + i * 5, 880]), PAL.gold, 3);
  }
  const LATTICE = []; for (let i = -8; i < 20; i++) LATTICE.push([340 + i * 90, 150, 340 + i * 90 + 440, 740], [340 + i * 90 + 440, 150, 340 + i * 90, 740]);
  function drawStage(T) {
    const cm = stageCam(T);
    const ps = pipState(T), cs = clawdState(T);
    const sh = 16 * since(T, SLAM, 7) + 4 * since(T, TL44, 10);
    const world = () => { shake(sh, 5); cam(cm.cx, cm.cy, cm.Z); };
    const L = lightsOn(T), op = curtainOpen(T);
    // ---- the world ----
    push();
    world();
    spr('s14_backstage', 960, 540, { s: 2, jit: 0 });
    spr('s14_flatwall', 960, 500, { s: 2, jit: 0 });
    push(); clipTo(() => rect(344, 154, 1232, 452)); segLines(LATTICE, PAL.lilac, 2, 0.16); pop(); // crisp wallpaper lattice over the soft wash
    spr('s14_door', 960, 560, { jit: 0.3 });
    spr('s14_plate', 960, 640, { jit: 0.3 });
    fill(PAL.black); keyholeOutline();
    if (T < SLAM + 0.3) keyholeInside(T);
    noFill(); stroke(PAL.ink); strokeWeight(4); keyholeOutline(); noStroke();
    spr('s14_floor', 960, 950, { s: 2, jit: 0 });
    for (let i = 0; i < 11; i++) { const x = 330 + i * 126; disc(x, 958, 13, PAL.ink); disc(x, 954, 9, L > 0 ? PAL.butterLt : PAL.gray, 1); }
    if (T > TL44 - 0.3) drawRope(T);
    pip(ps.x, ps.y, ps.s, ps.o);
    drawClawdStage(T);
    drawFlowers(T);
    if (T > SLAM) { // slam dust and impact marks
      for (let i = 0; i < 7; i++) burst(T, SLAM + i * 0.02, 700 + i * 86, 262 + (i % 2) * 20, { n: 3, names: ['puff'], spd: 160, g: 380, life: 1.1, s: 0.3, spread: 2, ang0: Math.PI / 2, seed: 170 + i * 3 });
      burst(T, SLAM, K.x, K.y + 90, { n: 8, names: ['puff'], spd: 420, g: 260, life: 0.8, s: 0.2, seed: 190 });
      const im = 1 - inv(SLAM, SLAM + 0.28, T);
      if (im > 0) segLines([...Array(12).keys()].map((i) => { const a = (i / 12) * TAU + 0.13, r0 = 170, r1 = 240 + 40 * (i % 2); return [K.x + Math.cos(a) * r0, K.y + 70 + Math.sin(a) * r0 * 1.3, K.x + Math.cos(a) * r1, K.y + 70 + Math.sin(a) * r1 * 1.3]; }), PAL.butterLt, 14 * im, im);
    }
    drawAudience(T);
    const seam = 1 - inv(0.02, 0.14, op); // keep the lit set from showing through the closed curtain seam
    if (seam > 0) { noStroke(); fill(withAlphaCol(DARK, seam)); rect(890, -60, 140, 1200); }
    drawCurtains(op, T);
    pop();
    // ---- lighting: dim room (the lit keyhole stays bright), then blackout after the slam ----
    const amb = ambDark(T);
    if (amb > 0) {
      push(); world();
      if (T < SLAM) clipTo(keyholeClip, { invert: true });
      noStroke(); fill(withAlphaCol(DARK, amb)); rect(-6000, -6000, 14000, 14000);
      pop();
    }
    push();
    world();
    keyholeGlow(T, ps, cs);
    keyholeLeak(T);
    if (T > SLAM && T < TL44 + 0.3) { // dust drifting down in the dark after the slam
      const da = (1 - inv(TL44, TL44 + 0.3, T)) * sstep(SLAM, SLAM + 0.3, T);
      for (let i = 0; i < 14; i++) { const ph = fract((T - SLAM) * (0.18 + 0.12 * R(i, 57)) + R(i, 58)); disc(560 + R(i, 59) * 800 + Math.sin(T * 1.4 + i) * 20, 440 + ph * 520, 2.2 + 1.8 * R(i, 60), PAL.lilacLt, da * 0.55 * Math.sin(Math.PI * ph)); }
    }
    darkEyes(T, ps, cs);
    qmarks(T, ps, cs);
    stageLights(T);
    pop();
    if (L > 0 && T < TL44 + 0.4) { noStroke(); fill(withAlphaCol(PAL.butterLt, 0.45 * since(T, TL44, 8))); rect(-60, -60, W + 120, H + 120); }
    // ---- the silence: one spotlight on the seam (matches s15's opening frame) ----
    const hd = houseDim(T);
    if (hd > 0) {
      spotDark(960, 640, 290, 330, 0.82 * hd);
      blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.butterLt, 0.1 * hd)); triangle(960, -60, 690, 1120, 1230, 1120); blendMode(BLEND);
      glow(960, 640, 280, PAL.butterLt, 0.45 * hd);
      const pa = T - 138.7; // a single rose petal drifting down through the beam
      if (pa > 0) { const py = lerp(-30, 1000, pa / 1.7), px = 960 + 60 * Math.sin(pa * 2.4) + 40 * pa; spr('s14_petal', px, py, { s: 1.05, r: Math.sin(pa * 3) * 0.9 + pa, sx: 0.4 + 0.6 * Math.abs(Math.cos(pa * 2.2)), a: 1 - inv(1.5, 1.7, pa) }); }
    }
  }
  shot({ id: 'L43-keyhole', t0: TL43, tin: { type: 'cut', d: 0 }, draw(s) { drawStage(s.T); } });
  shot({ id: 'L44-curtain', t0: TL44, tin: { type: 'cut', d: 0 }, draw(s) { drawStage(s.T); } });
  lyr(43, { y: 150, size: 70, maxW: 1500, words: { 2: { fill: PAL.butterLt }, 3: { fill: PAL.butter, anim: 'spin' }, 4: { fill: PAL.lilacLt }, 5: { fill: PAL.lilacLt, anim: 'shake', jitter: 2 }, 6: { fill: PAL.lilacLt, anim: 'drop' } } });
  lyr(44, {
    y: (T) => lerp(985, 470, Ez.inOut(inv(138.28, 138.48, T))), size: 80, maxW: 540,
    words: { 3: { size: 92, fill: PAL.butterLt, anim: 'rise' }, 4: { size: 104, fill: PAL.butter, anim: 'rise' } },
  });
})();

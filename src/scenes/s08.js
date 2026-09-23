// s08.js - S08 "1e30 flops, safe enough, MLP dance" (65.98-77.28). Everything here is private to this IIFE.
// L20: a giant rolling FLOP-o-meter on top of a compute reactor while flip-flops rain and pile up.
// L21: the camera tilts down the reactor to a hard-hat crew, a tiny fence and a clipboard that gets a big SAFE tick.
// L22: node-shaped holes punch through into a neural-net disco floor; Clawd line-dances forward and back.
(() => {
  // p5.brush commits a pending stroke only when a later brush op runs, so each painter ends with an invisible
  // off-canvas fill; without it the final outline of a sprite is silently dropped.
  const defSprite = (n, w, h, fn, o) => window.defSprite(n, w, h, (...a) => { fn(...a); wc('#FFFFFF', 1); brush.circle(-80, -80, 2); brush.noFill(); }, o);
  // ================= timing =================
  const WT = (i) => SONG.lines[i].w.map((w) => w[1]);
  const [tOne, tE, tThirty, tFlops, tA, tSec] = WT(20);
  const [tThat, tWas, tSafe, tEnough, tWe, tReck] = WT(21);
  const [tFwd, tMLP, tBack, tRep] = WT(22);
  const tThirty2 = tThirty + 0.14;
  const PAN0 = 67.95, PAN1 = 68.9, GY = 1920;
  const bt = (t) => { let b = BEATS[0]; for (const x of BEATS) if (Math.abs(x - t) < Math.abs(b - t)) b = x; return b; };
  const B_HATS = bt(68.92), B_FENCE = bt(69.36), B_VIBES = bt(69.82), B_NERV = bt(71.63), B_FALL = bt(72.1), B_CRACK = bt(72.54);
  const pulse = (T, t, k = 7) => (T < t ? 0 : Math.exp(-(T - t) * k));
  const METAL = mixc(PAL.gray, PAL.lilac, 0.3), METAL_LT = mixc(PAL.grayLt, PAL.lilacLt, 0.5);

  // ================= world camera (L20 + L21 share one tall world) =================
  function camW(T) {
    const pan = Ez.inOut(inv(PAN0, PAN1, T));
    let punch = 0;
    for (const t of [tOne + 0.03, tE, tThirty, tThirty2, tFlops, tSec]) { const a = T - t; if (a >= 0 && a < 0.6) punch = Math.max(punch, Math.exp(-a * 8)); }
    let z = 1 + (0.04 * Ez.inOut(inv(66.0, 67.9, T)) + 0.022 * punch) * (1 - pan);
    let cx = 960, cy = lerp(540, 1580, pan);
    const drift = 0.025 * Ez.inOut(inv(68.9, 69.9, T));
    const push = Ez.inOut(inv(71.0, 72.85, T));
    z *= 1 + drift + 0.15 * push;
    cy -= 120 * push;
    // snap onto the clipboard between "was" and "safe", ease back out after "enough"
    const cl = Ez.out(inv(tWas, tSafe, T)) * (1 - Ez.inOut(inv(tEnough + 0.11, 71.0, T)));
    cx = lerp(cx, 1430, cl); cy = lerp(cy, 1672, cl); z = lerp(z, 1.55, cl);
    const rot = 0.007 * Math.sin((Math.PI * T) / BEAT_LEN) * (1 - pan) * inv(65.98, 66.3, T);
    return { cx, cy, z, pan, rot };
  }
  const camTopAt = (t) => { const C = camW(t); return C.cy - 540 / C.z; };

  // ================= flip-flops =================
  const FFC = [[PAL.pink, PAL.butter], [PAL.mint, PAL.lilac], [PAL.butter, PAL.sky], [PAL.sky, PAL.pink], [PAL.lilac, PAL.mint], [PAL.orange, PAL.skyLt]];
  const FL = 190, FFW = 110, FFH = 220, FTOP = 15;
  function ffHW(t) {
    const Wb = 0.215, Wa = 0.15, Wh = 0.175;
    let w;
    if (t < 0.13) w = Wb * Math.sqrt(Math.max(0, 1 - Math.pow((0.13 - t) / 0.13, 2)));
    else if (t < 0.36) w = Wb;
    else if (t < 0.62) w = lerp(Wb, Wa, sstep(0.36, 0.62, t));
    else if (t < 0.86) w = lerp(Wa, Wh, sstep(0.62, 0.86, t));
    else w = Wh * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.86) / 0.14, 2)));
    return w * FL;
  }
  function solePts(cx, top) {
    const Rt = [], Lt = [], n = 18;
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = top + t * FL;
      if (i === 0 || i === n) { Rt.push([cx, y]); continue; }
      const hw = ffHW(t), bul = t < 0.45 ? 0.03 * FL * Math.sin((t / 0.45) * Math.PI) : 0;
      Rt.push([cx + hw, y]); Lt.push([cx - hw - bul, y]);
    }
    return Rt.concat(Lt.reverse());
  }
  function strapPts(a, b, bow, w0, w1) {
    const L1 = [], L2 = [], n = 8;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const c = [(a[0] + b[0]) / 2 + nx * bow, (a[1] + b[1]) / 2 + ny * bow];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t, w = lerp(w0, w1, t);
      const px = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], py = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
      L1.push([px + nx * w, py + ny * w]); L2.push([px - nx * w, py - ny * w]);
    }
    return L1.concat(L2.reverse());
  }
  FFC.forEach(([sc, st], k) => {
    defSprite('s08_ff' + k, FFW, FFH, () => {
      const cx = FFW / 2, sole = solePts(cx, FTOP);
      paint(sole, sc, { baseC: lite(sc, 0.3), lw: 1.8, a: 150 });
      flat(scalePts(sole, cx, FTOP + FL * 0.5, 0.76), lite(sc, 0.5), 0.45);
      const post = [cx - 3, FTOP + 0.25 * FL], yE = FTOP + 0.53 * FL;
      paint(strapPts(post, [cx - ffHW(0.53) + 2, yE], 10, 4, 7.5), st, { baseC: lite(st, 0.2), lw: 1.4 });
      paint(strapPts(post, [cx + ffHW(0.53) - 2, yE], -10, 4, 7.5), st, { baseC: lite(st, 0.2), lw: 1.4 });
      flat(ellPts(post[0], post[1], 7.5, 7.5, 12), PAL.ink); flat(ellPts(post[0], post[1], 5.5, 5.5, 12), dark(st, 0.15));
    });
    defSprite('s08_ffb' + k, FFW, FFH, () => {
      const cx = FFW / 2, sole = solePts(cx, FTOP), c = dark(sc, 0.14);
      paint(sole, c, { baseC: mixc(sc, c, 0.5), lw: 1.8, a: 140 });
      pen(dark(sc, 0.38), 1.6, 'pen');
      for (let i = 1; i < 10; i++) { const t = i / 10.4, y = FTOP + t * FL, hw = ffHW(t) * 0.66; brush.line(cx - hw, y + 3, cx + hw, y - 3); }
      brush.noStroke();
      flat(ellPts(cx - 3, FTOP + 0.25 * FL, 5, 5, 10), dark(st, 0.1));
    });
  });

  // ---------- the heaps (one sprite composited from the flip-flop sprites, no brush work) ----------
  const HPW = 1240, HPH = 1180, HPK = 66; // peak sits at (HPW/2, HPK) in sprite space
  const HS = 2.8;
  const heapProf = (dx) => { const a = Math.abs(dx); return a < 180 ? 0.0055 * a * a : 178 + HS * (a - 180); };
  const heapSlope = (dx) => Math.sign(dx) * (Math.abs(dx) < 180 ? 0.011 * Math.abs(dx) : HS);
  const heapHalfW = (d) => (d < 178 ? Math.sqrt(Math.max(0, d) / 0.0055) : 180 + (d - 178) / HS);
  defSprite('s08_heap', HPW, HPH, () => {
    const cx = HPW / 2;
    const sil = [];
    for (let x = -610; x <= 610; x += 20) sil.push([cx + x, Math.min(HPH - 6, HPK + 18 + heapProf(x))]);
    sil.push([cx + 610, HPH - 6], [cx - 610, HPH - 6]);
    flat(sil, mixc(PAL.lilacLt, PAL.pinkLt, 0.45));
    const items = [];
    let guard = 0;
    while (items.length < 470 && guard++ < 5000) {
      const d = random() * (HPH - HPK - 30);
      if (random() > heapHalfW(d) / 610) continue;
      const hw = heapHalfW(d);
      items.push({ d, x: cx + (random() * 2 - 1) * hw * 0.96, r: random() * TAU, k: Math.floor(random() * FFC.length), b: random() < 0.3, s: 0.52 + random() * 0.2, o: random() });
    }
    items.sort((a, b) => a.o - b.o);
    for (const it of items) {
      const sh = 1 - 0.26 * (it.d / HPH);
      tint(255 * sh, 246 * sh, Math.min(255, 262 * sh));
      const S = SPR[(it.b ? 's08_ffb' : 's08_ff') + it.k];
      push(); translate(it.x, HPK + it.d); rotate(it.r); scale(it.s); image(S.fbs[0], -S.w / 2, -S.h / 2, S.w, S.h); pop();
    }
    tint(255);
  }, { ay: HPK / HPH });
  const HX = [-60, 1790], HTOP = [900, 740];
  const heapRise = (t) => 0.3 * Ez.out(inv(65.5, 66.8, t)) + 0.3 * Ez.out(inv(tFlops - 0.05, tFlops + 0.6, t)) + 0.4 * Ez.out(inv(tSec - 0.05, 68.1, t));
  const heapTop = (k, t) => HTOP[k] + 420 * (1 - heapRise(t));
  function surf(x, t) {
    let y = GY, sl = 0, w = 2;
    for (let k = 0; k < 2; k++) { const dx = x - HX[k], hy = heapTop(k, t) + heapProf(dx); if (hy < y) { y = hy; sl = heapSlope(dx); w = k; } }
    return [y, sl, w];
  }

  // ---------- baked flip-flop physics (computed once at load; drawing reads it as a pure function of T) ----------
  const FF = [];
  (function spawnAll() {
    let i = 0;
    const add = (ts, x, y) => {
      FF.push({ i, ts, x, y: y ?? camTopAt(ts) - 70 - R(i, 11) * 180, vx: RS(i, 12) * 90, vy: 180 + R(i, 13) * 260, th: R(i, 14) * TAU, w: RS(i, 15) * 7, ph: R(i, 16) * TAU, wp: RS(i, 17) * 10, col: Math.floor(R(i, 18) * FFC.length), s: 0.62 + R(i, 19) * 0.26 });
      i++;
    };
    const rate = (t) => (t < tFlops ? 11 : t < tSec ? 30 : t < 68.25 ? 52 : 2.2);
    let t = 65.25, n = 0;
    while (t < 72.7) {
      let x;
      if (t < 68.3) x = -60 + R(n, 21) * 2040;
      else x = R(n, 22) < 0.5 ? -120 + R(n, 23) * 380 : 1760 + R(n, 23) * 320;
      add(t, x);
      t += (0.5 + R(n, 24)) / rate(t); n++;
    }
    for (const [tb, cnt, sd] of [[tFlops, 12, 31], [tSec, 16, 37]]) {
      for (let k = 0; k < cnt; k++) add(tb - 0.14 + R(k, sd) * 0.08, ((k + 0.5) / cnt) * 2000 - 40 + RS(k, sd + 1) * 40, camTopAt(tb) - 40 - R(k, sd + 2) * 60);
    }
  })();
  const SAMP = 60, DT = 1 / 240;
  for (const f of FF) {
    let x = f.x, y = f.y, vx = f.vx, vy = f.vy, th = f.th, w = f.w, ph = f.ph, wp = f.wp;
    const S = [], hits = [];
    let t = 0, next = 0, hitC = false, nb = 0, rest = null, tc = null;
    while (t < 6.5) {
      if (t >= next - 1e-6) { S.push(x, y, th, ph); next += 1 / SAMP; }
      const T = f.ts + t, py = y;
      vy = Math.min(1100, vy + 1700 * DT);
      x += vx * DT; y += vy * DT; th += w * DT; ph += wp * DT;
      if (!hitC && vy > 0 && x > 345 && x < 1575 && py <= 292 && y > 292) {
        hitC = true; hits.push([T, x, 292]);
        if (x > 420 && x < 1500 && f.ts < 67.9 && R(f.i, 44) < 0.2) { y = 292 - 9; rest = 3; tc = T; break; }
        y = 292; vy = -vy * 0.42 - 140; vx = Math.sign(x - 960 || 1) * (320 + 640 * Math.pow(R(f.i, 41), 1.2)); w = RS(f.i, 42) * 12; wp *= 0.7;
      }
      const [sy, sl, which] = surf(x, T);
      if (y > sy - 12) {
        y = sy - 12;
        if (tc == null) tc = T;
        const nl = Math.hypot(sl, 1), nx = sl / nl, ny = -1 / nl;
        const vn = vx * nx + vy * ny;
        if (vn < 0) {
          const e = which === 2 ? 0.32 : 0.24, fr = which === 2 ? 0.55 : 0.4;
          const tx = vx - vn * nx, ty = vy - vn * ny;
          vx = tx * fr - e * vn * nx; vy = ty * fr - e * vn * ny;
          w = w * 0.5 + RS(f.i * 7 + nb, 43) * 6; wp *= 0.5; nb++;
          if (Math.abs(vn) > 330) hits.push([T, x, y]);
          if (Math.hypot(vx, vy) < 170 || nb > 5) { rest = which; break; }
        }
      }
      if (y > GY + 300 || x < -700 || x > 2700) break;
      t += DT;
    }
    if (rest != null) { // ease the flop to lie flat (on ledges and the ground they turn sideways to lie along the surface)
      const ph1 = Math.round(ph / Math.PI) * Math.PI;
      const th1 = rest >= 2 ? Math.round((th - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2 + RS(f.i, 46) * 0.2 : th;
      for (let k = 1; k <= 10; k++) S.push(x, y, lerp(th, th1, Ez.out(k / 10)), lerp(ph, ph1, Ez.out(k / 10)));
    }
    f.S = new Float32Array(S); f.n = S.length / 4; f.rest = rest; f.tR = f.ts + (f.n - 1) / SAMP; f.hits = hits; f.tc = tc ?? 999;
  }
  function ffPose(f, T) {
    const age = T - f.ts;
    if (age < 0) return null;
    let k = age * SAMP, settled = false;
    if (k >= f.n - 1) { if (f.rest == null) return null; k = f.n - 1; settled = true; }
    const i = Math.floor(k), u = k - i, j = Math.min(i + 1, f.n - 1), S = f.S;
    const x = lerp(S[i * 4], S[j * 4], u), th = lerp(S[i * 4 + 2], S[j * 4 + 2], u), ph = lerp(S[i * 4 + 3], S[j * 4 + 3], u);
    let y = lerp(S[i * 4 + 1], S[j * 4 + 1], u);
    if (settled && f.rest < 2) y += heapTop(f.rest, T) - heapTop(f.rest, f.tR);
    return { x, y, th, ph, settled };
  }
  const JOLTS = [tOne + 0.03, tE, tThirty, tThirty2, tFlops, tSec];
  function drawFF(f, P, T) {
    const c = Math.cos(P.ph);
    let y = P.y, sx = 1;
    if (f.rest >= 2) sx = lerp(1, f.rest === 2 ? 0.7 : 0.5, clamp((T - f.tR + 0.17) / 0.17));
    if (f.rest === 3 && P.settled) { let j = 8 * kick(T, 9); for (const t of JOLTS) j += 26 * pulse(T, t, 9) * Math.min(1, (T - t) * 30); y -= j * (0.5 + 0.5 * R(f.i, 45)); }
    spr((c >= 0 ? 's08_ff' : 's08_ffb') + f.col, P.x, y, { s: f.s, sx, sy: Math.max(0.2, Math.abs(c)), r: P.th, seed: f.i });
  }

  // ================= L20 props: sky, FLOP-o-meter, stopwatch =================
  defSprite('s08_skywash', 1000, 580, () => {
    blob(170, 130, 150, '#FFFFFF', 70, 0.4); blob(840, 100, 160, PAL.butterLt, 60, 0.4); blob(880, 440, 190, PAL.pinkLt, 50, 0.4); blob(110, 470, 180, PAL.lilacLt, 50, 0.4);
  });
  defSprite('s08_counter', 1280, 380, () => {
    paint(rrPts(20, 30, 1240, 320, 48), PAL.mint, { baseC: lite(PAL.mint, 0.3), lw: 2.6, a: 150 });
    wc(dark(PAL.mint, 0.15), 70, 0.06, 0.5, 0.5); brush.rect(40, 292, 1200, 48); brush.noFill();
    wc('#FFFFFF', 80, 0.1, 0.4, 0.4); brush.rect(80, 44, 480, 22); brush.noFill();
    paint(rrPts(60, 12, 1160, 36, 16), PAL.butter, { baseC: PAL.butterLt, lw: 2 });
    paint(rrPts(90, 338, 1100, 32, 12), PAL.teal, { baseC: lite(PAL.teal, 0.35), lw: 1.8 });
    for (let i = 0; i < 4; i++) { const x = 145 + i * 168; paint(rrPts(x - 80, 72, 160, 226, 14), PAL.navy, { baseC: dark(PAL.navy, 0.1), lw: 2 }); }
    paint(rrPts(733, 72, 484, 226, 16), PAL.navy, { baseC: dark(PAL.navy, 0.1), lw: 2 });
    for (const [x, y] of [[48, 70], [1232, 70], [48, 310], [1232, 310]]) { flat(ellPts(x, y, 10, 10, 12), PAL.inkSoft); flat(ellPts(x - 1, y - 1, 7, 7, 12), PAL.grayLt); }
  });
  defSprite('s08_plate', 490, 240, () => {
    paint(rrPts(12, 14, 466, 212, 22), PAL.butter, { baseC: PAL.butterLt, lw: 2.6 });
    pen('#FFFFFF', 4, 'marker'); brush.rect(32, 34, 426, 172); brush.noStroke();
    const t = textImg('FLOP/s', { font: 'display', size: 112, fill: PAL.ink, weight: 700, shadow: PAL.pink });
    image(t.img, 245 - t.w / 2, 122 - t.h / 2);
  });
  defSprite('s08_watch', 200, 250, () => {
    paint(rrPts(84, 14, 32, 36, 8), PAL.red, { baseC: lite(PAL.red, 0.3), lw: 1.6 });
    paint(rrPts(92, 44, 16, 22, 4), PAL.gray, { baseC: PAL.grayLt, lw: 1.4 });
    paint(ellPts(100, 148, 86, 86, 40), PAL.sky, { baseC: lite(PAL.sky, 0.3), lw: 2.4 });
    paint(ellPts(100, 148, 68, 68, 40), PAL.cream, { baseC: '#FFFDF6', lw: 1.6 });
    pen(PAL.ink, 2, 'pen');
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; brush.line(100 + Math.cos(a) * 54, 148 + Math.sin(a) * 54, 100 + Math.cos(a) * 64, 148 + Math.sin(a) * 64); }
    brush.noStroke();
  }, { v: 2, ay: 148 / 250 });
  const GLYPH = { font: 'display', size: 176, fill: PAL.ink, weight: 700 };
  const DRUMS = [
    { g: '0123456789', f: '1', tl: tOne + 0.03 },
    { g: 'e0123456789', f: 'e', tl: tE },
    { g: '0123456789', f: '3', tl: tThirty },
    { g: '0123456789', f: '0', tl: tThirty2 },
  ];
  const DRX = [465, 633, 801, 969], DRY = 450, DRW = 146, DRH = 212;
  function drumPos(d, T) {
    const n = d.g.length, F = d.g.indexOf(d.f) + n * 400;
    if (T < d.tl) return F - 15 * (d.tl - T);
    const a = T - d.tl;
    return F - 0.2 * Math.sin(a * 34) * Math.exp(-a * 9);
  }
  function drawDrum(d, x, T) {
    const n = d.g.length, pos = drumPos(d, T), i0 = Math.floor(pos), f = pos - i0, spin = T < d.tl;
    push();
    clip(() => { rect(x - DRW / 2, DRY - DRH / 2, DRW, DRH); });
    noStroke(); fill(PAL.cream); rect(x - DRW / 2, DRY - DRH / 2, DRW, DRH);
    for (let k = -1; k <= 1; k++) {
      const gi = (((i0 + k) % n) + n) % n;
      const gy = DRY + (k - f) * DRH * 0.95;
      if (spin) { txt(d.g[gi], x, gy + 26, GLYPH, { sy: 1.3, a: 0.3 }); txt(d.g[gi], x, gy, GLYPH, { sy: 1.2, a: 0.75 }); }
      else txt(d.g[gi], x, gy, GLYPH);
    }
    gradRect(x - DRW / 2, DRY - DRH / 2, DRW, 64, withAlphaCol(PAL.ink, 0.55), withAlphaCol(PAL.ink, 0));
    gradRect(x - DRW / 2, DRY + DRH / 2 - 64, DRW, 64, withAlphaCol(PAL.ink, 0), withAlphaCol(PAL.ink, 0.55));
    const fl = pulse(T, d.tl, 7);
    if (fl > 0.01) { fill(withAlphaCol('#FFFFFF', 0.85 * fl)); rect(x - DRW / 2, DRY - DRH / 2, DRW, DRH); }
    pop();
  }
  function drawMeter(T) {
    const k = kick(T, 5);
    // crank on the left side spins while the drums roll
    const spinning = T < tThirty2;
    const ca = spinning ? T * 22 : tThirty2 * 22 + (T - tThirty2) * 3 + k * 0.4;
    segLine(335, 450, 335 + Math.cos(ca) * 70, 450 + Math.sin(ca) * 70, PAL.ink, 14);
    segLine(335, 450, 335 + Math.cos(ca) * 70, 450 + Math.sin(ca) * 70, PAL.gray, 7);
    disc(335 + Math.cos(ca) * 70, 450 + Math.sin(ca) * 70, 16, PAL.red); disc(335, 450, 14, PAL.ink);
    push(); translate(960, 450); scale((1 + 0.012 * k) * lerp(0.8, 1, Ez.outBack(inv(65.9, 66.3, T), 2))); translate(-960, -450);
    spr('s08_counter', 960, 450, { jit: 0.35 });
    for (let i = 0; i < 4; i++) drawDrum(DRUMS[i], DRX[i], T);
    pop();
    // chase bulbs along the top
    const b = beatAt(T).i;
    const cols = [PAL.butter, PAL.pink, PAL.sky, PAL.mint];
    for (let i = 0; i < 14; i++) {
      const x = 390 + i * 88, on = (i + b) % 3 === 0;
      disc(x, 276, 12, on ? cols[i % 4] : mixc(cols[i % 4], PAL.gray, 0.5));
      if (on) { glow(x, 276, 34, cols[i % 4], 0.45 * (0.6 + 0.4 * k)); disc(x - 3, 272, 4, '#FFFFFF', 0.9); }
    }
    // unit plate slams into its slot on "flops"
    const pa = T - (tFlops - 0.15);
    if (pa > 0) {
      const py = lerp(-260, 450, Ez.outBack(clamp(pa / 0.15), 1.3));
      spr('s08_plate', 1295, py, { r: (1 - clamp(pa / 0.2)) * -0.1 + Math.sin(T * 5) * 0.006 });
      if (pa > 0.12) { burst(T, tFlops, 1070, 560, { n: 7, names: ['puff'], spd: 420, g: -60, life: 0.6, s: 0.3, spread: 1.2, ang0: Math.PI, seed: 5 }); burst(T, tFlops, 1520, 560, { n: 7, names: ['puff'], spd: 420, g: -60, life: 0.6, s: 0.3, spread: 1.2, ang0: 0, seed: 9 }); burst(T, tFlops, 1295, 330, { n: 8, names: ['star5', 'spark'], spd: 700, g: 500, life: 0.6, s: 0.3, spread: 2.2, ang0: -Math.PI / 2, seed: 13 }); }
    }
    // stopwatch pops up on "a" and rings on "second"
    const wa = T - tA;
    if (wa > 0) {
      const ring = pulse(T, tSec, 3.5);
      const ws = Ez.outBack(clamp(wa / 0.2), 2.2);
      const hand = T < tSec ? -Math.PI / 2 : -Math.PI / 2 + Math.min(1, T - tSec) * TAU;
      push(); translate(1655, 250); rotate(Math.sin(T * 60) * 0.12 * ring); scale(ws * (1 + ring * 0.08));
      spr('s08_watch', 0, 0, {});
      segLine(0, 0, Math.cos(hand) * 52, Math.sin(hand) * 52, PAL.red, 6); disc(0, 0, 7, PAL.ink);
      pop();
      if (T > tSec) { for (let r = 0; r < 3; r++) { const a = T - tSec - r * 0.12; if (a > 0 && a < 0.5) ringLine(1655, 250, 100 + a * 260, PAL.white, 6 * (1 - a * 2), 0.8); } }
    }
  }

  // ================= reactor =================
  defSprite('s08_dome', 900, 460, () => {
    paint(rrPts(400, 6, 100, 200, 16), PAL.gray, { baseC: PAL.grayLt, lw: 2 });
    const dome = [];
    for (let i = 0; i <= 40; i++) { const a = Math.PI + (i / 40) * Math.PI; dome.push([450 + Math.cos(a) * 410, 430 + Math.sin(a) * 290]); }
    paint(dome, METAL, { baseC: METAL_LT, lw: 2.4, a: 140 });
    wc('#FFFFFF', 90, 0.12, 0.4, 0.4); brush.circle(290, 250, 70); brush.noFill();
    for (const [x, y] of [[230, 330], [450, 250], [670, 330]]) { paint(ellPts(x, y, 38, 38, 28), PAL.mint, { baseC: PAL.mintLt, lw: 2 }); flat(ellPts(x - 10, y - 12, 9, 7, 12), '#FFFFFF', 0.8); }
    paint(rrPts(26, 404, 848, 48, 16), PAL.gray, { baseC: PAL.grayLt, lw: 2 });
    for (let x = 60; x < 860; x += 48) flat(ellPts(x, 428, 5, 5, 10), PAL.inkSoft);
  }, { ay: 1 });
  defSprite('s08_tower', 1000, 980, () => {
    const pipeC = PAL.sky;
    paint([[160, 300], [74, 300], [40, 334], [40, 975], [100, 975], [100, 362], [160, 362]], pipeC, { baseC: lite(pipeC, 0.3), lw: 2 });
    paint([[840, 420], [926, 420], [960, 454], [960, 975], [900, 975], [900, 482], [840, 482]], pipeC, { baseC: lite(pipeC, 0.3), lw: 2 });
    for (const [x, y] of [[70, 620], [930, 700]]) { paint(ellPts(x, y, 36, 36, 24), PAL.red, { baseC: lite(PAL.red, 0.3), lw: 1.8 }); pen(PAL.ink, 2, 'pen'); brush.line(x - 28, y, x + 28, y); brush.line(x, y - 28, x, y + 28); brush.noStroke(); flat(ellPts(x, y, 8, 8, 12), PAL.ink); }
    const body = rrPts(150, 8, 700, 890, 28);
    paint(body, METAL, { baseC: METAL_LT, a: 150, lw: 2.4 });
    wc(dark(METAL, 0.22), 70, 0.08, 0.5, 0.5); brush.rect(152, 10, 90, 880); brush.rect(758, 10, 90, 880); brush.noFill();
    wc('#FFFFFF', 70, 0.1, 0.4, 0.4); brush.rect(300, 20, 60, 860); brush.noFill();
    for (const y of [140, 620]) { paint(rrPts(140, y, 720, 34, 12), PAL.gray, { baseC: PAL.grayLt, lw: 1.8 }); for (let x = 172; x < 850; x += 44) flat(ellPts(x, y + 17, 5, 5, 10), PAL.inkSoft); }
    paint(rrPts(150, 790, 700, 70, 8), PAL.butter, { baseC: PAL.butterLt, lw: 1.6 });
    brush.clip([152, 792, 848, 858]); pen(PAL.ink, 14, 'marker'); for (let x = 100; x < 900; x += 64) brush.line(x, 870, x + 70, 780); brush.noClip(); brush.noStroke();
    paint(rrPts(110, 878, 780, 70, 14), dark(METAL, 0.1), { baseC: METAL, lw: 2 });
    flat(ellPts(500, 420, 168, 168, 48), PAL.navy);
    paint(ellPts(500, 715, 52, 52, 32), PAL.butter, { baseC: PAL.butterLt, lw: 2 });
    paint(starPts(500, 715, 40, 11, 4), PAL.orange, { baseC: lite(PAL.orange, 0.3), lw: 1.6 });
    for (const vx of [260, 740]) { paint(rrPts(vx - 50, 230, 100, 60, 10), PAL.inkSoft, { baseC: PAL.gray, lw: 1.8 }); pen(PAL.ink, 2, 'pen'); for (let k = 0; k < 4; k++) brush.line(vx - 38, 244 + k * 11, vx + 38, 244 + k * 11); brush.noStroke(); }
    paint(ellPts(760, 330, 36, 36, 24), PAL.cream, { baseC: '#FFFDF6', lw: 1.8 });
    wc(PAL.red, 120, 0.04); brush.rect(770, 300, 20, 18); brush.noFill();
  }, { ay: 0 });
  defSprite('s08_port_rim', 420, 420, () => {
    for (let h = 0; h < 2; h++) {
      const half = [];
      for (let i = 0; i <= 24; i++) { const a = (h + i / 24) * Math.PI; half.push([210 + Math.cos(a) * 192, 210 + Math.sin(a) * 192]); }
      for (let i = 24; i >= 0; i--) { const a = (h + i / 24) * Math.PI; half.push([210 + Math.cos(a) * 150, 210 + Math.sin(a) * 150]); }
      paint(half, PAL.gray, { baseC: PAL.grayLt, line: false, a: 130 });
    }
    pen(PAL.ink, 2.4, '2B'); brush.circle(210, 210, 192); brush.circle(210, 210, 150); brush.noStroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; flat(ellPts(210 + Math.cos(a) * 171, 210 + Math.sin(a) * 171, 8, 8, 12), PAL.inkSoft); flat(ellPts(208 + Math.cos(a) * 171, 207 + Math.sin(a) * 171, 3, 3, 8), '#FFFFFF', 0.7); }
  });
  defSprite('s08_far', 1000, 300, () => {
    const hill = (y0, amp, f, ph, c, a) => { const pts = [[-20, 320]]; for (let x = -20; x <= 1020; x += 40) pts.push([x, y0 - amp * (0.5 + 0.5 * Math.sin(x * f + ph)) - amp * 0.3 * Math.sin(x * f * 2.7 + ph * 2)]); pts.push([1020, 320]); paint(pts, c, { baseC: lite(c, 0.3), line: false, a }); };
    hill(180, 70, 0.008, 1, mixc(PAL.lilacLt, PAL.skyLt, 0.5), 110);
    for (const [x, h] of [[110, 90], [300, 56], [720, 110], [890, 66]]) {
      const tw = [[x - 26, 240], [x - 16, 240 - h], [x + 16, 240 - h], [x + 26, 240]]; flat(tw, lite(PAL.lilacLt, 0.2)); pen(PAL.inkSoft, 1, '2B'); brush.polygon(tw); brush.noStroke();
      blob(x, 232 - h - 16, 12, '#FFFFFF', 150, 0.3);
    }
    hill(262, 44, 0.011, 3, mixc(PAL.mint, PAL.grass, 0.4), 130);
  });
  defSprite('s08_ground', 1160, 240, () => {
    wash(-30, 12, 1220, 260, PAL.grass, 210, 0.08);
    wash(-30, 70, 1220, 200, PAL.grassDk, 90, 0.15);
    paint([[330, 16], [830, 16], [900, 110], [260, 110]], mixc(PAL.gray, PAL.lilac, 0.25), { baseC: mixc(PAL.gray, PAL.grayLt, 0.5), lw: 1.2 });
    pen(PAL.grassDk, 2, '2B'); brush.line(-10, 12, 330, 12); brush.line(830, 12, 1170, 12); brush.noStroke();
    for (let i = 0; i < 46; i++) { const x = random() * 1160, y = 30 + random() * 200; if (x > 250 && x < 910 && y < 120) continue; flat(ellPts(x, y, 3 + random() * 2.5, 3 + random() * 2.5, 10), [PAL.butter, PAL.pink, '#FFFFFF'][i % 3], 0.95); }
  });
  const CRACKS = [
    { t: tReck, x: 690, y: 1235, a: -0.5, len: 150 },
    { t: B_NERV, x: 1236, y: 1150, a: 3.7, len: 130 },
    { t: B_FALL, x: 760, y: 1600, a: -0.1, len: 120 },
  ].map((c, ci) => { const pts = [[0, 0]]; let x = 0, y = 0; for (let i = 1; i <= 6; i++) { const a = c.a + RS(i, ci + 50) * 0.7; x += Math.cos(a) * c.len / 6; y += Math.sin(a) * c.len / 6; pts.push([x, y]); } return { ...c, pts }; });
  function drawReactor(T, C) {
    const rumble = 1.5 + 2.5 * kick(T, 6) + 7 * sstep(71.1, 72.8, T);
    push();
    shake(rumble, 21);
    spr('s08_tower', 960, 980, { jit: 0.35 });
    // dome windows pulse
    spr('s08_dome', 960, 1005, { jit: 0.35 });
    const k = kick(T, 4);
    for (const [x, y] of [[730, 875], [960, 795], [1190, 875]]) glow(x, y, 50, PAL.mint, 0.35 + 0.25 * k);
    // porthole with Clawd inside
    porthole(T);
    // beacons
    for (const [bx, s] of [[640, 1], [1280, -1]]) {
      const ang = T * 5 * s;
      blendMode(ADD); noStroke(); fill(withAlphaCol(PAL.red, 0.12 + 0.1 * sstep(71, 72.5, T)));
      triangle(bx, 1100, bx + Math.cos(ang - 0.18) * 380, 1100 + Math.sin(ang - 0.18) * 140, bx + Math.cos(ang + 0.18) * 380, 1100 + Math.sin(ang + 0.18) * 140);
      blendMode(BLEND);
      disc(bx, 1100, 20, PAL.red); disc(bx - 5, 1094, 6, '#FFFFFF', 0.8);
    }
    // gauge needle wobbles toward red
    const na = -2.4 + 1.3 * sstep(69, 72.6, T) + Math.sin(T * 40) * 0.08 * (1 + sstep(71, 72.6, T) * 3);
    segLine(1220, 1310, 1220 + Math.cos(na) * 28, 1310 + Math.sin(na) * 28, PAL.ink, 4);
    // cracks leak sparkles
    for (const c of CRACKS) {
      const g = Ez.out(clamp((T - c.t) / 0.14));
      if (g <= 0) continue;
      const n = Math.max(1, Math.round(g * (c.pts.length - 1)));
      const segs = [];
      for (let i = 0; i < n; i++) { const [x1, y1] = c.pts[i], [x2, y2] = c.pts[i + 1]; segs.push([c.x + x1, c.y + y1, c.x + x2, c.y + y2]); }
      segLines(segs, PAL.ink, 11); segLines(segs, PAL.mintLt, 5);
      glow(c.x + c.pts[2][0], c.y + c.pts[2][1], 80, PAL.mint, 0.5);
      for (let i = 0; i < 7; i++) {
        const ph = fract(T * 1.3 + i / 7), m = c.pts[1 + (i % 4)];
        const dir = c.a + (i % 2 ? -1.8 : 1.8);
        const px = c.x + m[0] + Math.cos(dir) * ph * 110, py = c.y + m[1] + Math.sin(dir) * ph * 60 - ph * 120;
        spr(i % 3 ? 'spark' : 'sparkW', px, py, { s: 0.2 * (1 - ph) + 0.06, r: ph * 4 + i, a: 1 - ph * ph, seed: i });
      }
    }
    // steam from the vents on each beat
    const b = beatAt(T);
    for (let back = 0; back < 2; back++) {
      const tb = b.t - back * b.len, age = T - tb;
      if (tb < 68.8) continue;
      for (const [vx, dir] of [[720, -1], [1200, 1]]) spr('puff', vx + dir * age * 60, 1250 - age * 170, { s: 0.16 + age * 0.45, a: 0.85 * clamp(1 - age / 0.9), seed: back + dir });
    }
    pop();
    // sparkle seepage all over the tower
    floaters(T, 12, 81, ['spark', 'sparkW', 'star5'], [620, 1040, 680, 820], 110, 0.2, 30);
  }
  function porthole(T) {
    const x = 960, y = 1400, r = 152;
    const press = sstep(71.4, 71.7, T);
    push();
    clip(() => { circle(x, y, r * 2); });
    const pk = kick(T, 5);
    disc(x, y, r, mixc(PAL.teal, PAL.mint, 0.45));
    disc(x, y + 10, r * (0.78 + 0.04 * pk), mixc(PAL.mint, PAL.mintLt, 0.5), 0.9);
    disc(x, y + 20, r * (0.48 + 0.05 * pk), mixc(PAL.mintLt, PAL.butterLt, 0.55), 0.9);
    for (let i = 0; i < 9; i++) { const ph = fract(T * 0.7 + R(i, 3)); disc(x + RS(i, 4) * 115 + Math.sin(T * 3 + i) * 8, y + 150 - ph * 300, 4 + R(i, 5) * 7, '#FFFFFF', 0.55 * (1 - ph)); }
    let eyes = 'ce_sq', look = [-0.5, 0.35];
    if (T > tSafe && T < tReck) { eyes = 'ce_happy'; look = [0, 0]; }
    if (T >= tReck) { eyes = 'ce_star'; look = [0.45, -0.1]; }
    const tap = Math.sin(Math.PI * beatAt(T).ph) * 0.25;
    clawd(x + Math.sin(T * 1.7) * 14 * (1 - press), y + lerp(128, 178, press) - hopB(T) * 8 * (1 - press), lerp(0.6, 0.84, press), { eyes, look, armL: -0.9 - tap - 0.5 * pulse(T, tSafe, 4), armR: -0.9 - (T > tReck ? 0.4 : tap) - 0.5 * pulse(T, tSafe, 4), sq: 1 + press * 0.12, blush: T > tSafe, seed: 3 });
    disc(x, y, r, PAL.skyLt, 0.08);
    // glass cracks as Clawd pushes
    for (const [tc, sd] of [[B_FALL, 1], [B_CRACK, 2]]) {
      const g = Ez.out(clamp((T - tc) / 0.1));
      if (g <= 0) continue;
      const cx0 = x + (sd === 1 ? -40 : 50), cy0 = y + (sd === 1 ? -30 : 20);
      const segs = [];
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + sd, L = (60 + R(i, sd) * 70) * g; segs.push([cx0, cy0, cx0 + Math.cos(a) * L, cy0 + Math.sin(a) * L]); }
      segLines(segs, '#FFFFFF', 4, 0.9); segLines(segs, PAL.inkSoft, 1.5, 0.8);
    }
    const hot = sstep(72.3, 72.8, T);
    if (hot > 0) disc(x, y, r, '#FFFFFF', 0.7 * hot);
    pop();
    noFill(); stroke(withAlphaCol('#FFFFFF', 0.7)); strokeWeight(10); arc(x, y, r * 1.6, r * 1.6, Math.PI * 1.08, Math.PI * 1.42); noStroke();
    spr('s08_port_rim', x, y, { jit: 0.4 });
    glow(x, y, 230, PAL.mint, 0.12 + 0.12 * kick(T, 4) + 0.3 * sstep(71.5, 72.8, T));
  }

  // ================= crew, tiny fence, clipboard =================
  defSprite('s08_thumb', 90, 110, () => {
    paint(rrPts(34, 10, 22, 52, 11), PAL.skin, { baseC: '#FFE3CF', lw: 1.6 });
    paint(ellPts(45, 70, 26, 24, 24), PAL.skin, { baseC: '#FFE3CF', lw: 1.8 });
    pen(PAL.ink, 1.4, 'pen'); brush.line(58, 58, 68, 61); brush.line(60, 70, 70, 72); brush.line(58, 82, 67, 82); brush.noStroke();
  }, { v: 2, ay: 70 / 110 });
  defSprite('s08_picket', 70, 170, () => {
    paint([[15, 42], [35, 12], [55, 42], [55, 158], [15, 158]], '#FFFFFF', { baseC: '#FFFFFF', lw: 2 });
    wc(PAL.lilacLt, 70, 0.05); brush.rect(40, 44, 13, 110); brush.noFill();
  }, { v: 2, ay: 158 / 170 });
  defSprite('s08_rail', 300, 40, () => { paint(rrPts(8, 10, 284, 20, 6), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.8 }); });
  defSprite('s08_clipboard', 360, 470, () => {
    paint(rrPts(20, 30, 320, 420, 22), PAL.brownLt, { baseC: lite(PAL.brownLt, 0.25), lw: 2.2 });
    paint(rrPts(42, 62, 276, 372, 8), PAL.cream, { baseC: '#FFFDF6', lw: 1.6, a: 110 });
    paint(rrPts(120, 14, 120, 56, 12), PAL.gray, { baseC: PAL.grayLt, lw: 2 });
    flat(ellPts(180, 32, 10, 8, 12), PAL.inkSoft);
    const t = textImg('SAFETY', { font: 'display', size: 44, fill: PAL.ink, weight: 700 });
    image(t.img, 180 - t.w / 2, 104 - t.h / 2);
    pen(PAL.inkSoft, 1.4, 'pen'); brush.line(70, 134, 290, 134); brush.noStroke();
    ['hard hats', 'fence', 'vibes'].forEach((lb, i) => {
      const y = 177 + i * 70;
      paint(rrPts(48, y - 17, 34, 34, 5), '#FFFFFF', { baseC: '#FFFFFF', lw: 1.8 });
      const tt = textImg(lb, { font: 'hand', size: 42, fill: PAL.inkSoft, weight: 700 });
      image(tt.img, 92, y - tt.h / 2);
    });
    paint(rrPts(48, 350, 58, 58, 6), '#FFFFFF', { baseC: '#FFFFFF', lw: 2.2 });
  }, { v: 2 });
  // hand position of the Pip rig arm (rig units, before the rig scale)
  const handAt = (side, a) => [side * (56 + 82.4 * Math.sin(a)), -138 + 82.4 * Math.cos(a)];
  function crew(x, y, s, o) {
    pip(x, y, s, { ...o, hat: o.hat === undefined ? 'hardhat' : o.hat });
    if (!o.thumbL && !o.thumbR) return;
    const sw = o.walk != null ? Math.sin(o.walk * TAU) * 0.5 : 0;
    const fl = o.flip ? -1 : 1, sq = o.sq ?? 1;
    push(); translate(x, y - (o.hop || 0)); if (o.r) rotate(o.r); scale(s * fl * sq, s / sq);
    if (o.thumbL) { const [hx, hy] = handAt(-1, (o.armL ?? 0.15) + sw); spr('s08_thumb', hx, hy, { s: 1.15, r: -(o.r || 0), seed: (o.seed || 0) + 11 }); }
    if (o.thumbR) { const [hx, hy] = handAt(1, (o.armR ?? 0.15) + sw); spr('s08_thumb', hx, hy, { s: 1.15, r: -(o.r || 0), seed: (o.seed || 0) + 12 }); }
    pop();
  }
  function tick(pts, u, w, c) {
    if (u <= 0) return;
    let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let d = u * total;
    for (let pass = 0; pass < 2; pass++) {
      let left = d;
      for (let i = 1; i < pts.length && left > 0; i++) {
        const [x1, y1] = pts[i - 1], [x2, y2] = pts[i], L = Math.hypot(x2 - x1, y2 - y1), k = Math.min(1, left / L);
        segLine(x1, y1, lerp(x1, x2, k), lerp(y1, y2, k), pass ? c : PAL.ink, pass ? w : w + 6);
        left -= L;
      }
    }
  }
  function clipboard(T, hx, hy) {
    const lift = pulse(T, tSafe - 0.04, 5) * Math.min(1, (T - tSafe + 0.04) * 12);
    const cx = hx + 128, cy = hy - 150 - lift * 30, r = -0.07 + Math.sin(T * 2.1) * 0.02 - lift * 0.06;
    push(); translate(cx, cy); rotate(r); scale(0.85);
    spr('s08_clipboard', 0, 0, { jit: 0.5 });
    spr('paperclip', 132, -150, { s: 0.42, r: 0.3, jit: 0.5 });
    [B_HATS, B_FENCE, B_VIBES].forEach((t, i) => tick([[-129, -58 + i * 70], [-118, -46 + i * 70], [-98, -76 + i * 70]], clamp((T - t) / 0.12), 7, PAL.green));
    const su = clamp((T - tSafe + 0.03) / 0.13);
    if (su > 0) {
      tick([[-140, 128], [-100, 172], [40, -8]], su, 16, PAL.green);
      const sa = T - tSafe;
      const ss = lerp(2.4, 1, Ez.outBack(clamp((sa + 0.02) / 0.14), 1.8));
      push(); translate(70, 150); rotate(-0.2); scale(ss);
      noFill(); stroke(withAlphaCol(PAL.red, 0.9)); strokeWeight(7); rect(-104, -44, 208, 88, 14); noStroke();
      txt('SAFE', 0, 2, { font: 'display', size: 76, fill: PAL.red, weight: 700 }, { a: clamp((sa + 0.02) / 0.05) });
      pop();
    }
    pop();
    burst(T, tSafe, cx + 40, cy + 110, { n: 14, names: ['spark', 'star5', 'sparkW'], spd: 900, g: 300, life: 0.8, s: 0.34, seed: 17 });
  }
  function tinyFence(T) {
    const fx = 960, fy = 1958;
    const pops = [B_FENCE, B_FENCE + 0.07, B_FENCE + 0.14];
    const ra = sstep(B_FENCE + 0.16, B_FENCE + 0.24, T);
    if (ra > 0) { spr('s08_rail', fx, fy - 28, { s: 0.6, sx: ra }); spr('s08_rail', fx, fy - 58, { s: 0.6, sx: ra, seed: 2 }); }
    for (let i = 0; i < 3; i++) {
      const a = T - pops[i];
      if (a < 0) continue;
      const g = Ez.outBack(clamp(a / 0.16), 2.6);
      const r = i === 2 ? Ez.outBack(clamp((T - B_FALL) / 0.3), 2) * 1.45 : Math.sin(T * 9 + i) * 0.03 * sstep(71.2, 72.5, T);
      spr('s08_picket', fx + (i - 1) * 62, fy, { s: 0.56, sy: g, r, seed: i });
      burst(T, pops[i], fx + (i - 1) * 62, fy, { n: 5, names: ['puff'], spd: 200, g: 200, life: 0.45, s: 0.07, spread: Math.PI, ang0: -Math.PI / 2, seed: 30 + i });
    }
  }
  function crewL21(T) {
    const hop = hopB(T) * 5, k = kick(T, 6);
    const thumbs = sstep(B_VIBES - 0.1, B_VIBES + 0.04, T);
    const pumpAt = (t, amp = 1) => (T < t ? 0 : amp * Math.exp(-(T - t) * 5) * Math.sin(Math.min((T - t) * 16, Math.PI)));
    const pump = pumpAt(B_VIBES) + pumpAt(tSafe) + pumpAt(tEnough, 0.6) + pumpAt(tReck, 1.1);
    const lookUp = 1 - sstep(68.75, 68.95, T);
    const nod = 0.14 * (sstep(tWe - 0.06, tWe + 0.06, T) - 2 * sstep(tReck - 0.06, tReck + 0.06, T) + sstep(71.35, 71.6, T));
    const glint = (x, y, t) => { const a = T - t; if (a > 0 && a < 0.5) spr('sparkW', x, y, { s: 0.35 * Math.sin((a / 0.5) * Math.PI), r: a * 6 }); };
    // bun researcher (mint)
    crew(480, 1935, 0.95, { body: 'npc_body_mint', head: 'npc_head2', arm: 'npc_arm_mint', face: 'pf_happy', armL: lerp(0.2, 2.05, thumbs) + 0.35 * pump, armR: 0.25 + 0.06 * Math.sin(T * 3), thumbL: thumbs > 0.3, hop, headR: nod - 0.25 * lookUp, sq: 1 + 0.02 * k, seed: 20 });
    // curly researcher (butter)
    crew(718, 1946, 1.0, { body: 'npc_body_butter', head: 'npc_head3', arm: 'npc_arm_butter', face: 'pf_cool', armR: lerp(0.2, 2.05, thumbs) + 0.35 * pump, armL: 0.25 + 0.06 * Math.sin(T * 3 + 1), thumbR: thumbs > 0.3, hop: hopB(T + 0.1) * 5, headR: nod + 0.2 * lookUp, sq: 1 + 0.02 * k, seed: 30 });
    // Pip with the clipboard
    const nerv = T > B_NERV;
    const armR = 1.15 + 0.3 * pulse(T, tSafe - 0.04, 5);
    const px = 1215, py = 1940, ps = 0.95;
    crew(px, py, ps, { face: nerv ? 'pf_nervous' : 'pf_happy', armL: lerp(0.2, 2.05, thumbs) + 0.35 * pump, armR, thumbL: thumbs > 0.3, hop, headR: nod - (nerv ? 0.22 : 0) - 0.2 * lookUp, sq: 1 + 0.02 * k, seed: 40 });
    const [hx, hy] = handAt(1, armR);
    const HX_ = px + hx * ps, HY_ = py - hop + hy * ps;
    clipboard(T, HX_, HY_);
    push(); translate(HX_ + 10, HY_ - 12); rotate(-0.5); noStroke(); fill(PAL.skin); stroke(PAL.ink); strokeWeight(2.5); ellipse(0, 0, 18, 30); noStroke(); pop();
    if (nerv) { const a = T - B_NERV; spr('drop', px + 70, py - 330 + Math.min(a, 0.6) * 40, { s: 0.45, r: 0.3, a: 1 - inv(0.9, 1.2, a) }); }
    // hard hat glints on the "hard hats" tick and on "reckoned"
    for (const t of [B_HATS, tReck]) { glint(470, 1650, t); glint(712, 1640, t + 0.05); glint(1205, 1655, t + 0.1); }
  }

  // node-hole radius for the L21 > L22 mask (also used to paint light rims on the outgoing side)
  const TIN22 = { d: 0.6, at: 0.17 };
  function maskR(n, T) {
    const p = (T - (tFwd - TIN22.d * TIN22.at)) / TIN22.d;
    const pop = Ez.outBack(clamp((T - passT(WAVES[0], n.l)) / 0.08), 2);
    return 58 * pop + 1250 * Ez.in(clamp((p - 0.55) / 0.45));
  }
  // screen point -> world point for the world camera
  const invCam = (C, sx, sy) => [C.cx + (sx - 960) / C.z, C.cy + (sy - 540) / C.z];
  // ================= L20 + L21 world =================
  function drawWorld(T) {
    const C = camW(T);
    bg(PAL.skyLt);
    push();
    cam(C.cx, C.cy, C.z, C.rot);
    // sky gradient (world locked)
    const stops = [[-700, PAL.sky], [520, lite(PAL.sky, 0.3)], [1150, mixc(PAL.skyLt, PAL.lilacLt, 0.5)], [1700, mixc(PAL.pinkLt, PAL.lilacLt, 0.35)], [2400, PAL.pinkLt]];
    for (let i = 0; i < stops.length - 1; i++) gradRect(-800, stops[i][0], 3500, stops[i + 1][0] - stops[i][0] + 2, stops[i][1], stops[i + 1][1]);
    // sunburst behind the meter
    const ra = 1 - C.pan;
    if (ra > 0) {
      noStroke();
      const n = 20, rot = T * 0.12;
      for (let i = 0; i < n; i += 2) {
        const a0 = rot + (i / n) * TAU, a1 = rot + ((i + 1) / n) * TAU;
        fill(withAlphaCol(i % 4 ? PAL.butterLt : PAL.pinkLt, ra * (0.2 + 0.1 * kick(T, 4))));
        triangle(960, 450, 960 + Math.cos(a0) * 2400, 450 + Math.sin(a0) * 2400, 960 + Math.cos(a1) * 2400, 450 + Math.sin(a1) * 2400);
      }
    }
    const par = (f) => (C.cy - 540) * (1 - f);
    spr('s08_skywash', 960, 540 + par(0.45), { s: 2, jit: 0, a: 0.6 });
    for (let i = 0; i < 5; i++) {
      const x = ((R(i, 61) * 2400 + T * (18 + 10 * R(i, 62))) % 2600) - 340;
      spr('cloud', x, 120 + R(i, 63) * 700 + par(0.55), { s: 0.7 + R(i, 64) * 0.5, a: 0.9, seed: i });
    }
    spr('s08_far', 960, 1640 + (C.cy - 1580) * 0.12, { s: 2, jit: 0 });
    // heaps (settled flip-flops ride on them)
    for (let k = 0; k < 2; k++) spr('s08_heap', HX[k], heapTop(k, T), { flip: k === 0, jit: 0.25, seed: k });
    const V = { x0: C.cx - 960 / C.z - 130, x1: C.cx + 960 / C.z + 130, y0: C.cy - 540 / C.z - 130, y1: C.cy + 540 / C.z + 130 };
    const air = [], ground = [];
    for (const f of FF) {
      const P = ffPose(f, T);
      if (!P || P.x < V.x0 || P.x > V.x1 || P.y < V.y0 || P.y > V.y1) continue;
      if (P.settled && f.rest < 2) drawFF(f, P, T);
      else if (P.settled || T >= f.tc) ground.push([f, P]);
      else air.push([f, P]);
    }
    const hz = 0.34 * sstep(PAN0 + 0.25, PAN1, T);
    if (hz > 0) {
      noStroke(); fill(withAlphaCol(mixc(PAL.pinkLt, PAL.lilacLt, 0.5), hz));
      for (let k = 0; k < 2; k++) { beginShape(); for (let dx = -640; dx <= 640; dx += 20) vertex(HX[k] + dx, heapTop(k, T) + heapProf(dx) + 22); vertex(HX[k] + 640, GY + 60); vertex(HX[k] - 640, GY + 60); endShape(CLOSE); }
    }
    spr('s08_ground', 960, GY + 220, { s: 2, jit: 0 });
    drawReactor(T, C);
    // the meter sits on the reactor
    if (C.cy - 540 / C.z < 700) drawMeter(T);
    for (const [f, P] of ground) drawFF(f, P, T);
    // light rims around the node-shaped holes of the transition into L22
    if (T > tFwd - 0.05) { for (const n of NODES) { const r = maskR(n, T); if (r > 2 && r < 400) { const [x, y] = invCam(C, 960 + n.X * 300, 540 + n.d * 150); const ra = 1 - inv(250, 400, r); ringLine(x, y, r / C.z + 4, PAL.butter, 10 / C.z, 0.9 * ra); ringLine(x, y, r / C.z + 12, PAL.butterLt, 5 / C.z, 0.5 * ra); } } }
    if (T > 68.3) { crewL21(T); tinyFence(T); }
    for (const [f, P] of air) drawFF(f, P, T);
    // impact sparkles
    for (const f of FF) for (const [ht, hx, hy] of f.hits) { if (T > ht && T < ht + 0.4 && hx > V.x0 && hx < V.x1 && hy > V.y0 && hy < V.y1) burst(T, ht, hx, hy, { n: 4, names: ['spark', 'sparkW'], spd: 320, g: 500, life: 0.4, s: 0.16, seed: f.i * 3 }); }
    // speed streaks during the tilt
    const sp = Math.sin(Math.PI * inv(PAN0, PAN1, T));
    if (sp > 0.05) { const segs = []; for (let i = 0; i < 16; i++) { const x = R(i, 71) * 1920, y = C.cy - 700 + fract(R(i, 72) - T * 2.2) * 1400; segs.push([x, y, x, y + 220 * sp]); } segLines(segs, '#FFFFFF', 5, 0.55 * sp); }
    pop();
    // opening flash bloom (continues s07's white dot)
    const ob = inv(65.9, 66.45, T);
    if (ob > 0 && ob < 1) {
      for (let r = 0; r < 3; r++) { const a = ob - r * 0.12; if (a > 0) ringLine(960, 540, 60 + Ez.out(a) * 1100, '#FFFFFF', 40 * (1 - a), 0.8 * (1 - a)); }
      burst(T, 65.98, 960, 540, { n: 18, names: ['sparkW', 'spark', 'star5'], spd: 1500, g: 200, life: 0.8, s: 0.45, even: true, seed: 91 });
    }
  }

  shot({
    id: 'L20-flops', t0: tOne, tin: { type: 'flash', d: 0.4, at: 0.5 },
    draw(s) { drawWorld(s.T); },
  });
  lyr(20, { y: 150, size: 80, cols: ['#FFFFFF'], words: { 0: { fill: PAL.butter }, 1: { font: 'pixel', fill: PAL.pink, anim: 'zoom' }, 2: { fill: PAL.butter, anim: 'zoom' }, 3: { anim: 'drop', fill: PAL.mint, grow: 0.15 }, 5: { anim: 'shake', jitter: 3, fill: PAL.sky } } });

  shot({
    id: 'L21-safe', t0: tThat, tin: { type: 'cut', d: 0 },
    draw(s) { drawWorld(s.T); },
  });
  lyr(21, { x: 1085, y: 990, size: 70, maxW: 1560, words: { 2: { fill: PAL.mint, size: 96, anim: 'drop', grow: 0.12 }, 3: { fill: PAL.mintLt }, 5: { fill: PAL.butter, wave: 5 } } });

  // ================= L22: neural-net disco =================
  const LAYERS = [3, 4, 5, 4, 3];
  const NODES = [];
  LAYERS.forEach((n, l) => { for (let j = 0; j < n; j++) NODES.push({ l, j, X: l - 2, d: j - (n - 1) / 2, i: NODES.length }); });
  const EDGES = [];
  for (const a of NODES) for (const b of NODES) if (b.l === a.l + 1) EDGES.push([a, b]);
  const CENTER = NODES.find((n) => n.X === 0 && n.d === 0);
  const OFF = {};
  NODES.filter((n) => n !== CENTER).map((n) => [n, R(n.i, 71)]).sort((a, b) => a[1] - b[1]).forEach(([n], r, arr) => { OFF[n.i] = 76.92 + (r / (arr.length - 1)) * 0.24; });
  OFF[CENTER.i] = 999;
  const TILT0 = 73.02, TILT1 = 73.42;
  function FP(X, d, k) { const z = 2 - 0.45 * d; return [lerp(960 + X * 300, 960 + (X * 520) / z, k), lerp(540 + d * 150, 39 + 1002 / z, k), z]; }
  const WAVES = [
    { t: tFwd, d: 0.22, dir: 1, c: PAL.butter, a: 1 },
    { t: bt(73.91) - 0.1, d: 0.26, dir: 1, c: PAL.pink, a: 0.8 },
    { t: bt(74.37) - 0.1, d: 0.26, dir: 1, c: PAL.pink, a: 0.8 },
    { t: tBack, d: 0.34, dir: -1, c: PAL.mint, a: 1 },
    { t: tRep, d: 0.32, dir: 1, c: PAL.butter, a: 1 },
  ];
  const passT = (w, l) => w.t + w.d * ((w.dir > 0 ? l : 4 - l) / 4);
  // Clawd's line dance on the floor (X in layer units, fixed depth)
  const CL_D = 0.9;
  const S1 = bt(73.91), S2 = bt(74.37), LAND0 = bt(73.45), LAND_REP = tRep + 0.38;
  function clawdX(T) {
    let X = -1.25;
    X += 0.6 * Ez.inOut(inv(S1 - 0.26, S1 + 0.02, T));
    X += 0.6 * Ez.inOut(inv(S2 - 0.26, S2 + 0.02, T));
    X -= 0.95 * Ez.inOut(inv(tBack, tBack + 0.36, T));
    X += 2.3 * Ez.inOut(inv(tRep, LAND_REP, T));
    return X;
  }
  const STOMPS = [LAND0, S1, S2, bt(74.82), LAND_REP].map((t) => ({ t, X: clawdX(t + 0.01), d: CL_D }));
  function nodeLit(n, T) {
    let v = 0.12 + 0.06 * Math.sin(T * 3 + n.i * 1.7), c = PAL.lilac;
    const put = (x, col) => { if (x > v) { v = x; c = col; } };
    for (const w of WAVES) { const tp = passT(w, n.l); if (T >= tp) put(w.a * Math.exp(-(T - tp) * 3.2), w.c); }
    if (T >= 74.75 && T < 76.05) { const b = beatAt(T); if ((n.l + n.j + b.i) % 2 === 0) put(0.85 * Math.exp(-b.ph * 2.2), [PAL.pink, PAL.sky, PAL.lilac][b.i % 3]); }
    if (T >= tMLP) put(Math.exp(-(T - tMLP) * 2.6), '#FFFFFF');
    for (const st of STOMPS) { if (T >= st.t) { const dd = Math.hypot(n.X - st.X, (n.d - st.d) * 0.8); if (dd < 1) put(0.95 * Math.exp(-(T - st.t) * 3) * (1 - dd), PAL.butter); } }
    if (T > OFF[n.i]) v = 0;
    return [v, c];
  }
  defSprite('s08_club', 1000, 580, () => {
    flat([[0, 0], [1000, 0], [1000, 580], [0, 580]], mixc(PAL.night, PAL.navy, 0.15));
    wash(-40, -40, 1080, 660, PAL.night, 200, 0.08);
    wash(-60, -60, 620, 420, mixc(PAL.lilac, PAL.night, 0.6), 110, 0.3);
    wash(520, -60, 560, 380, mixc(PAL.pink, PAL.night, 0.65), 100, 0.3);
    for (let i = 0; i < 30; i++) flat(ellPts(random() * 1000, random() * 300, 2, 2, 8), '#FFFFFF', 0.25 + random() * 0.3);
  });
  defSprite('s08_truss', 1000, 90, () => {
    paint(rrPts(-10, 20, 1020, 14, 5), PAL.gray, { baseC: PAL.grayLt, lw: 1.2 });
    paint(rrPts(-10, 56, 1020, 14, 5), PAL.gray, { baseC: PAL.grayLt, lw: 1.2 });
    pen(PAL.grayLt, 2.4, 'marker'); for (let x = 0; x < 1000; x += 40) { brush.line(x, 32, x + 20, 58); brush.line(x + 20, 58, x + 40, 32); } brush.noStroke();
  });
  defSprite('s08_spot', 130, 150, () => {
    paint(rrPts(50, 6, 30, 30, 6), PAL.gray, { baseC: PAL.grayLt, lw: 1.4 });
    paint([[30, 34], [100, 34], [112, 120], [18, 120]], PAL.inkSoft, { baseC: PAL.gray, lw: 2 });
    paint(ellPts(65, 122, 48, 16, 24), PAL.butterLt, { baseC: '#FFFFFF', lw: 1.6 });
  }, { ay: 0.1 });
  defSprite('s08_ball', 240, 240, () => {
    paint(ellPts(120, 120, 100, 100, 40), PAL.grayLt, { baseC: '#FFFFFF', lw: 2.2 });
    const cols = ['#FFFFFF', PAL.skyLt, PAL.lilacLt, PAL.pinkLt, PAL.grayLt, PAL.gray, PAL.butterLt];
    for (let gy = 26; gy < 214; gy += 18) for (let gx = 26; gx < 214; gx += 18) {
      const dx = gx + 9 - 120, dy = gy + 9 - 120;
      if (dx * dx + dy * dy > 90 * 90) continue;
      flat(rrPts(gx + 1, gy + 1, 16, 16, 2), cols[Math.floor(random() * cols.length)], 0.9);
    }
    pen(PAL.ink, 2.2, '2B'); brush.circle(120, 120, 100); brush.noStroke();
  }, { v: 3 });
  function ellA(x, y, rx, ry, c, a) { noStroke(); fill(withAlphaCol(c, a)); ellipse(x, y, rx * 2, ry * 2); }
  function nodeDisc(x, y, rx, ry, a, kf) {
    ellA(x, y + ry * 0.18, rx * 1.06, ry * 1.06, PAL.black, 0.35 * a * kf);
    ellA(x, y, rx, ry, mixc(PAL.navy, PAL.night, 0.35), a);
    noFill(); stroke(withAlphaCol(PAL.lilacLt, 0.85 * a)); strokeWeight(lerp(4.5, 3, kf)); ellipse(x, y, rx * 2, ry * 2);
    stroke(withAlphaCol(PAL.ink, 0.9 * a)); strokeWeight(1.5); ellipse(x, y, rx * 2 + 6, ry * 2 + 6); noStroke();
    ellA(x - rx * 0.3, y - ry * 0.35, rx * 0.28, ry * 0.2, '#FFFFFF', 0.22 * a);
  }
  const DANCERS = [
    { X: -2.25, d: 1.3, body: 'pip_body', head: 'pip_head', arm: 'pip_arm', face: 'pf_happy', side: -1, seed: 1 },
    { X: 2.25, d: 1.3, body: 'npc_body_mint', head: 'npc_head2', arm: 'npc_arm_mint', face: 'pf_cool', side: 1, seed: 2 },
    { X: -3.0, d: -1.9, body: 'npc_body_butter', head: 'npc_head3', arm: 'npc_arm_butter', face: 'pf_happy', side: -1, seed: 3 },
    { X: 3.0, d: -1.9, body: 'npc_body_sky', head: 'npc_head2', arm: 'npc_arm_sky', face: 'pf_cool', side: 1, seed: 4 },
  ];
  function dancer(D, T, kf) {
    const enter = Ez.out(inv(73.15, 73.6, T));
    if (enter <= 0) return;
    const b = beatAt(T), e = Ez.inOut(clamp(b.ph * 1.5));
    const sway = 0.12 * Math.cos(Math.PI * (b.i + e));
    const back = 0.25 * Ez.inOut(inv(tBack, tBack + 0.3, T)) * (1 - Ez.inOut(inv(tRep, tRep + 0.3, T)));
    const X = D.X + sway - back + D.side * 1.6 * (1 - enter);
    const [x, y, z] = FP(X, D.d, kf);
    const s = 1.05 / z;
    const mlp = sstep(tMLP - 0.05, tMLP + 0.05, T) * (1 - sstep(74.95, 75.15, T));
    const alt = b.i % 2 ? 1 : 0;
    let armL = lerp(0.3 + 1.7 * alt * kick(T, 4), 2.6, mlp), armR = lerp(0.3 + 1.7 * (1 - alt) * kick(T, 4), 2.6, mlp);
    const spin = inv(tRep, tRep + 0.34, T);
    const flip = spin > 0.25 && spin < 0.75;
    const dim = 1 - 0.75 * sstep(76.9, 77.1, T);
    ellA(x, y, 120 * s, 30 * s, PAL.pink, 0.18 * dim);
    crew(x, y, s, { body: D.body, head: D.head, arm: D.arm, face: T > 76.95 ? 'pf_shock' : D.face, armL, armR, thumbL: mlp < 0.5 && alt === 1, thumbR: mlp < 0.5 && alt === 0, hop: (hopB(T) * 14 + mlp * 20) * s, r: -back * 0.5 * D.side + sway * 0.4, flip, seed: D.seed * 10 });
  }
  function clawdDisco(T, kf) {
    const drop = Ez.in(inv(73.12, LAND0, T));
    if (drop <= 0) return;
    const X = clawdX(T), [x, y, z] = FP(X, CL_D, kf), s = 1.3 / z;
    const b = beatAt(T);
    let hop = 0, sq = 1, r = 0, armL = 0.2, armR = 0.2, eyes = 'ce_sq', look = [0, 0], walk = null, sx = 1;
    // landing from the ceiling
    hop += (1 - drop) * 900;
    const land = T - LAND0;
    if (land > 0) sq *= 1 + 0.35 * Math.exp(-land * 9) * Math.cos(land * 30);
    // grapevine steps right
    for (const st of [S1, S2]) { const p = inv(st - 0.26, st + 0.02, T); if (p > 0 && p < 1) { walk = p; r += 0.12 * Math.sin(p * Math.PI); hop += Math.sin(p * Math.PI) * 30; } }
    if (T < tMLP) { armL = 0.3 + 0.5 * Math.sin(T * 9); armR = 0.3 - 0.5 * Math.sin(T * 9); look = [0.4, 0]; }
    // MLP pose
    const mlp = sstep(tMLP - 0.04, tMLP + 0.04, T) * (1 - sstep(74.9, 75.1, T));
    if (mlp > 0) { armL = lerp(armL, -1.05, mlp); armR = lerp(armR, -1.05, mlp); eyes = 'ce_star'; hop += Math.sin(Math.PI * clamp((T - tMLP) / 0.38)) * 60 * mlp; }
    // groove in place
    if (T > 74.95 && T < tBack) {
      hop += hopB(T) * 26; armL = -0.3 - 0.8 * Math.sin(Math.PI * b.ph) * (b.i % 2); armR = -0.3 - 0.8 * Math.sin(Math.PI * b.ph) * (1 - (b.i % 2)); r = 0.1 * Math.cos(Math.PI * (b.i + Ez.inOut(clamp(b.ph * 1.4)))); eyes = 'ce_happy';
      const sp = inv(bt(75.28), bt(75.28) + 0.3, T); if (sp > 0 && sp < 1) sx = Math.max(0.3, Math.abs(Math.cos(sp * TAU)));
    }
    // moonwalk backward
    const mw = inv(tBack, tBack + 0.36, T);
    if (mw > 0 && mw < 1) { walk = -mw * 2; r = 0.12; armL = 0.5; armR = -0.6; look = [0.5, 0]; eyes = 'ce_sq'; }
    if (T >= tBack + 0.36 && T < tRep) { r = 0.06; armL = -0.6; armR = -0.6; }
    // repeat: hop-spin forward
    const rp = inv(tRep, LAND_REP, T);
    if (rp > 0 && rp < 1) { hop += Math.sin(rp * Math.PI) * 110; sx = Math.max(0.3, Math.abs(Math.cos(rp * TAU))); armL = -1.1; armR = -1.1; eyes = 'ce_happy'; }
    const lr = T - LAND_REP;
    if (lr > 0) { sq *= 1 + 0.3 * Math.exp(-lr * 9) * Math.cos(lr * 30); armL = -1.1; armR = -1.1; eyes = T > 76.95 ? 'ce_x' : 'ce_star'; }
    const dim = 1 - 0.75 * sstep(76.9, 77.1, T);
    ellA(x, y, 150 * s, 36 * s, PAL.butter, 0.25 * dim * drop);
    const ma = T - tMLP;
    if (ma > 0 && ma < 0.9) {
      noFill();
      for (let i = 0; i < 3; i++) { const a = ma - i * 0.12; if (a <= 0) continue; const rr = 60 + Ez.out(clamp(a / 0.7)) * 900; stroke(withAlphaCol(i % 2 ? PAL.pink : PAL.butter, 0.8 * (1 - clamp(a / 0.7)))); strokeWeight(10 * (1 - clamp(a / 0.7)) + 2); ellipse(x, y, rr * 2, rr * 0.8); }
      noStroke();
      burst(T, tMLP, x, y - 150 * s * 2, { n: 18, names: ['star5', 'spark', 'sparkW', 'heart'], spd: 1300, g: 700, life: 0.9, s: 0.45, seed: 61 });
    }
    push(); translate(x, y); scale(sx, 1);
    clawd(0, 0, s, { hop, sq, r, armL, armR, eyes, look, walk, blush: T > 74.9 && T < tBack, seed: 7 });
    pop();
  }
  function discoFloor(T) {
    const kf = Ez.inOut(inv(TILT0, TILT1, T));
    const k = kick(T, 5);
    const lights = sstep(LAND0 - 0.04, LAND0 + 0.04, T) * (1 - sstep(76.88, 76.94, T));
    const Z = 1 + 0.012 * k * kf + 0.05 * pulse(T, tMLP, 4);
    push();
    const follow = (FP(clawdX(T), CL_D, 1)[0] - 960) * 0.1 * sstep(73.3, 73.8, T) * (1 - sstep(76.6, 76.88, T));
    cam(960 + follow, 540, Z, 0.008 * Math.sin(T * 1.7) * kf * (1 - sstep(76.8, 77.0, T)));
    washBG('s08_club');
    // truss + cans at the top of the room
    const trussY = lerp(-140, 36, kf);
    spr('s08_truss', 960, trussY, { s: 2, jit: 0.3 });
    // floor quad
    const q = [FP(-3.2, -3.6, kf), FP(3.2, -3.6, kf), FP(3.2, 3.6, kf), FP(-3.2, 3.6, kf)];
    noStroke(); fill(mixc(PAL.night, PAL.navy, 0.45));
    quad(q[0][0], q[0][1], q[1][0], q[1][1], q[2][0], q[2][1], q[3][0], q[3][1]);
    // disco tiles
    const b = beatAt(T);
    if (kf > 0.5 && lights > 0) {
      const tcol = [PAL.pink, PAL.sky, PAL.butter, PAL.mint, PAL.lilac];
      for (let a = 0; a < 12; a++) for (let c = 0; c < 12; c++) {
        if (R(a * 31 + c * 7 + b.i * 131, 5) > 0.13) continue;
        const X0 = -3.2 + a * (6.4 / 12), X1 = X0 + 6.4 / 12, d0 = -3.6 + c * 0.6, d1 = d0 + 0.6;
        const p0 = FP(X0, d0, kf), p1 = FP(X1, d0, kf), p2 = FP(X1, d1, kf), p3 = FP(X0, d1, kf);
        fill(withAlphaCol(tcol[(a + c + b.i) % 5], 0.3 * (0.45 + 0.55 * Math.exp(-b.ph * 2)) * lights * kf));
        quad(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
      }
    }
    // grid
    const gc = lerp(0, 1, kf) > 0.5 ? PAL.lilac : PAL.sky;
    const grid = [];
    for (let a = 0; a <= 12; a++) { const X = -3.2 + a * (6.4 / 12); const p = FP(X, -3.6, kf), p2 = FP(X, 3.6, kf); grid.push([p[0], p[1], p2[0], p2[1]]); }
    for (let c = 0; c <= 12; c++) { const d = -3.6 + c * 0.6; const p = FP(-3.2, d, kf), p2 = FP(3.2, d, kf); grid.push([p[0], p[1], p2[0], p2[1]]); }
    segLines(grid, gc, 2, 0.16);
    // spot cans hang from the truss
    for (const sx of [330, 760, 1160, 1590]) spr('s08_spot', sx, trussY + 40, { s: 0.7, r: Math.sin(T * 1.3 + sx) * 0.3 * lights });
    // disco ball drops in on the landing
    const bd = Ez.outBack(inv(LAND0 - 0.1, LAND0 + 0.25, T), 1.4);
    if (bd > 0) { segLine(1700, -20, 1700, lerp(-260, 150, bd) - 90, PAL.grayLt, 3); spr('s08_ball', 1700, lerp(-260, 150, bd), { s: 0.75, r: T * 0.5 }); glow(1700, lerp(-260, 150, bd), 120, PAL.lilacLt, 0.3 * lights); }
    // node positions this frame
    const P = NODES.map((n) => FP(n.X, n.d, kf));
    const L = NODES.map((n) => nodeLit(n, T));
    // edges + travelling pulses
    const live = [], dead = [], ew = lerp(3, 2.2, kf);
    for (const [a, c] of EDGES) {
      const pa = P[a.i], pc = P[c.i], q = [pa[0], pa[1], pc[0], pc[1]];
      if (T > Math.min(OFF[a.i], OFF[c.i])) { dead.push(q); continue; }
      live.push(q);
      const lv = Math.min(L[a.i][0], L[c.i][0]);
      if (lv > 0.2) segLine(q[0], q[1], q[2], q[3], PAL.lilacLt, ew, 0.4 * lv);
    }
    segLines(live, PAL.lilacLt, ew, 0.24); segLines(dead, PAL.lilacLt, ew, 0.05);
    for (const w of WAVES) {
      if (T < w.t || T > w.t + w.d + 0.1) continue;
      for (const [a, c] of EDGES) {
        const t0 = passT(w, w.dir > 0 ? a.l : c.l), t1 = passT(w, w.dir > 0 ? c.l : a.l);
        const u = inv(t0, t1, T);
        if (u <= 0 || u >= 1) continue;
        const from = w.dir > 0 ? P[a.i] : P[c.i], to = w.dir > 0 ? P[c.i] : P[a.i];
        disc(lerp(from[0], to[0], u), lerp(from[1], to[1], u), 7, w.c, 0.95);
      }
    }
    // nodes
    for (const n of NODES) {
      const [x, y, z] = P[n.i];
      const rx = lerp(46, 94 / z, kf), ry = lerp(46, 42 / z, kf);
      const [v, c] = L[n.i];
      const off = T > OFF[n.i];
      nodeDisc(x, y, rx, ry, off ? 0.45 : 1, kf);
      if (v > 0.02) {
        ellA(x, y, rx * 0.86, ry * 0.86, c, Math.min(1, v * 1.1));
        ellA(x, y - ry * 0.1, rx * 0.4, ry * 0.4, '#FFFFFF', v * 0.8);
        if (v > 0.25) glow(x, y, rx * 1.7, c, 0.5 * v);
      }
      // the powered-down flicker
      const fo = T - OFF[n.i];
      if (fo > 0 && fo < 0.07) ellA(x, y, rx, ry, '#FFFFFF', 0.7);
    }
    // characters, far to near
    dancer(DANCERS[2], T, kf); dancer(DANCERS[3], T, kf);
    clawdDisco(T, kf);
    dancer(DANCERS[0], T, kf); dancer(DANCERS[1], T, kf);
    // light beams + mirror-ball reflections
    if (lights > 0) {
      blendMode(ADD); noStroke();
      const bc = [PAL.pink, PAL.butter, PAL.sky, PAL.mint];
      [330, 760, 1160, 1590].forEach((sx, i) => {
        const a = Math.PI / 2 + Math.sin(T * 1.3 + sx) * 0.3 * 1.4;
        fill(withAlphaCol(bc[i], 0.09 * lights * (0.7 + 0.3 * k)));
        const y0 = trussY + 80;
        triangle(sx, y0, sx + Math.cos(a - 0.1) * 1100, y0 + Math.sin(a - 0.1) * 1100, sx + Math.cos(a + 0.1) * 1100, y0 + Math.sin(a + 0.1) * 1100);
      });
      blendMode(BLEND);
      for (let i = 0; i < 28; i++) {
        const a = R(i, 91) * TAU + T * 0.7, rr = 260 + R(i, 92) * 1100;
        const x = 1700 + Math.cos(a) * rr * 1.1, y = 520 + Math.sin(a) * rr * 0.45;
        disc(x, y, 4 + R(i, 93) * 5, [PAL.white, PAL.pinkLt, PAL.skyLt][i % 3], 0.55 * lights * (0.6 + 0.4 * Math.sin(T * 7 + i)));
      }
    }
    pop();
    // power down: the room drops to darkness, one node keeps blinking
    const dk = sstep(76.9, 77.16, T);
    if (dk > 0) {
      noStroke(); fill(withAlphaCol(PAL.black, 0.93 * dk)); rect(-20, -20, W + 40, H + 40);
      const [x, y] = FP(0, 0, 1);
      const on = (T > 77.15 && T < 77.2) || (T > 77.4 && T < 77.45) ? 0.12 : 0.85 + 0.15 * Math.sin(T * 30);
      nodeDisc(x, y, 47, 21, dk, 1);
      ellA(x, y, 40, 19, PAL.butter, on * dk);
      ellA(x, y - 2, 18, 9, '#FFFFFF', on * dk);
      glow(x, y, 90, PAL.butter, 0.55 * on * dk);
    }
  }
  shot({
    id: 'L22-mlp', t0: tFwd,
    tin: {
      type: 'mask', d: TIN22.d, at: TIN22.at,
      mask(p, T) {
        noStroke(); fill(255);
        for (const n of NODES) { const r = maskR(n, T); if (r > 1) circle(960 + n.X * 300, 540 + n.d * 150, r * 2); }
      },
    },
    draw(s) { discoFloor(s.T); },
  });
  lyr(22, { y: 128, size: 78, maxW: 1560, words: { 0: { fill: PAL.butter, anim: 'zoom' }, 1: { font: 'pixel', fill: PAL.pink, size: 96, anim: 'pop', jitter: 2 }, 2: { fill: PAL.mint, anim: 'slide' }, 3: { fill: PAL.sky, anim: 'spin' } } });
})();

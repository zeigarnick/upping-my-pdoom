// main.js - setup, render pipeline, lyrics, HUD, player controls, export hooks

const SHOTS = [];
// shot({ id, t0, draw(s), tin: { type, d, at, c:[x,y], ang, mask(p,T) } })
function shot(o) { SHOTS.push(o); }

let sceneFB = [], maskFB = null, comp = null, READY = false;
const audio = document.getElementById('song');

// ---------- shot scheduling ----------
function trWindow(k) {
  const s = SHOTS[k], tin = s.tin || { type: 'cut', d: 0 };
  const d = tin.d ?? 0.6, at = tin.at ?? 0.5;
  return { start: s.t0 - d * at, end: s.t0 + d * (1 - at), d, tin };
}
function pickShots(T) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) { if (trWindow(i).start <= T) k = i; }
  const w = trWindow(k);
  if (k > 0 && T < w.end && w.d > 0) return { a: SHOTS[k - 1], b: SHOTS[k], p: (T - w.start) / w.d, tin: w.tin };
  return { a: SHOTS[k], b: null, p: 0, tin: null };
}
// push/pop depth is tracked so one scene's runtime error can't corrupt the others
let PUSHD = 0;
const ERRS = (window.__errors = []);
function reportErr(where, e) { const m = where + ': ' + (e && e.message); if (!ERRS.includes(m)) { ERRS.push(m); console.error('[scene error]', m, e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : ''); } }
function drawShot(sh, T, fb) {
  fb.draw(() => {
    clear();
    const d0 = PUSHD;
    push();
    translate(-W / 2, -H / 2);
    const d = sh.t1 - sh.t0;
    const lt = T - sh.t0;
    try { sh.draw({ T, lt, d, u: lt / d }); } catch (e) { reportErr(sh.id || 'shot@' + sh.t0, e); }
    while (PUSHD > d0 + 1) pop();
    pop();
    blendMode(BLEND); tint(255); // noTint() breaks the next image() in p5 2.2.3 WEBGL
  });
}

// ---------- lyrics layer ----------
// per-line styles are registered by scenes: LSTYLE[lineIndex] = {...}
const LSTYLE = {};
const LDEF = { x: W / 2, y: 952, size: 74, font: 'display', fill: '#FFFFFF', stroke: PAL.ink, sw: 9, shadow: 'rgba(43,33,64,0.35)', maxW: 1180, anim: 'pop', lead: 1.18, cols: null, swash: null, r: 0, gap: 0.28 };
function lineLayout(i, st) {
  const L = SONG.lines[i];
  const words = L.w.map(([w], j) => {
    const ov = st.words?.[j] || {};
    const ws = { font: ov.font || st.font, size: ov.size || st.size, fill: ov.fill || (st.cols ? st.cols[j % st.cols.length] : st.fill), stroke: ov.stroke || st.stroke, sw: ov.sw ?? st.sw, shadow: st.shadow, weight: ov.weight || st.weight };
    const img = textImg(w, ws);
    return { w, t: L.w[j][1], img, ws, ov, adv: img.tw + st.size * st.gap };
  });
  // wrap
  const rows = [[]]; let rw = 0;
  for (const wd of words) { if (rw + wd.img.tw > st.maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(wd); rw += wd.adv; }
  const lh = st.size * st.lead;
  rows.forEach((row, ri) => {
    const tot = row.reduce((a, b) => a + b.adv, 0) - st.size * st.gap;
    let x = -tot / 2;
    for (const wd of row) { wd.x = x + wd.img.tw / 2; wd.y = (ri - (rows.length - 1) / 2) * lh; x += wd.adv; }
  });
  return { words, rows, w: Math.max(...rows.map((r) => r.reduce((a, b) => a + b.adv, 0))), h: rows.length * lh };
}
const LCACHE = {};
function drawLyrics(T) {
  if (!G.lyricsOn) return;
  for (let i = 0; i < SONG.lines.length; i++) {
    const L = SONG.lines[i];
    const first = L.w[0][1];
    const tEnd = L.t1;
    if (T < first - 0.3 || T > tEnd + 0.08) continue;
    const st = { ...LDEF, ...(LSTYLE[i] || {}) };
    if (st.hide) continue;
    const lay = LCACHE[i] || (LCACHE[i] = lineLayout(i, st));
    const out = inv(tEnd - 0.14, tEnd + 0.06, T); // clear out quickly: the next line's first word lands at about tEnd
    const bx = typeof st.x === 'function' ? st.x(T) : st.x;
    const by = typeof st.y === 'function' ? st.y(T) : st.y;
    push();
    translate(bx, by - out * 70);
    if (out > 0) scale(1 - out * 0.12);
    const lr = typeof st.r === 'function' ? st.r(T) : st.r;
    if (lr) rotate(lr);
    if (st.swash) {
      const sa = inv(first - 0.3, first, T) * (1 - out);
      const reveal = clamp(inv(first - 0.2, (L.w[L.w.length - 1][1] + 0.3), T) * 1.2);
      spr(st.swash, 0, 0, { sx: (lay.w + 160) / 1400, sy: (lay.h + 70) / 150, a: sa * 0.92, crop: [0, 0, Math.max(0.02, reveal), 1], jit: 0.4 });
    }
    for (let j = 0; j < lay.words.length; j++) {
      const wd = lay.words[j];
      const next = lay.words[j + 1]?.t ?? tEnd;
      const age = T - wd.t;
      if (age < -0.06 || wd.ov.hide) continue; // hidden words keep their layout slot
      const k = clamp((age + 0.06) / 0.28);
      const anim = wd.ov.anim || st.anim;
      let s = 1, dx = 0, dy = 0, r = 0, a = 1 - out;
      const singing = T >= wd.t && T < next ? 1 : 0;
      if (anim === 'pop') { s = Ez.outBack(k, 2.2); a *= clamp(k * 3); }
      else if (anim === 'drop') { dy = (1 - Ez.outBack(k, 1.6)) * -120; a *= clamp(k * 3); }
      else if (anim === 'rise') { dy = (1 - Ez.out(k)) * 80; a *= clamp(k * 2); }
      else if (anim === 'slide') { dx = (1 - Ez.out(k)) * 160; a *= clamp(k * 2); }
      else if (anim === 'spin') { s = Ez.outBack(k); r = (1 - Ez.out(k)) * -3; a *= clamp(k * 3); }
      else if (anim === 'type') { a *= k > 0.2 ? 1 : 0; }
      else if (anim === 'zoom') { s = lerp(3.2, 1, Ez.out(k)); a *= clamp(k * 2); }
      else if (anim === 'shake') { s = Ez.outBack(k, 2.5); dx = RS(G.boil * 3 + j, 1) * 7; dy = RS(G.boil * 3 + j, 2) * 7; a *= clamp(k * 3); }
      if (wd.ov.wave || st.wave) dy += Math.sin(T * 7 + j * 0.9) * (wd.ov.wave || st.wave);
      if (wd.ov.tilt) r += wd.ov.tilt * clamp(age * 3);
      if (wd.ov.jitter) { dx += RS(G.boil + j * 7, 3) * wd.ov.jitter; dy += RS(G.boil + j * 7, 4) * wd.ov.jitter; }
      if (wd.ov.grow) s *= 1 + wd.ov.grow * Ez.out(clamp(age / 0.5));
      s *= 1 + singing * 0.06 * Math.exp(-(T - wd.t) * 4);
      push();
      translate(wd.x + dx, wd.y + dy);
      if (r) rotate(r);
      scale(s);
      if (wd.ov.draw) wd.ov.draw(T, age, wd, a);
      else { if (a < 1) tint(255, 255 * clamp(a)); image(wd.img.img, -wd.img.w / 2, -wd.img.h / 2); }
      pop();
    }
    if (L.stutter && st.stutter !== false) {
      for (const [n, ts] of L.stutter.entries()) {
        const age = T - ts; if (age < 0 || age > 0.6) continue;
        const im = textImg('just', { ...st, size: st.size * 0.8, fill: PAL.butter });
        const k = Ez.outBack(clamp(age / 0.2));
        push(); translate(-360 + n * 240, -110 - n * 20); rotate(-0.2 + n * 0.2); scale(k); tint(255, 255 * (1 - inv(0.35, 0.6, age))); image(im.img, -im.w / 2, -im.h / 2); pop();
      }
    }
    pop();
  }
}

// ---------- P(doom) HUD ----------
const PDOOM = [[-99, 2], [1.4, 4], [16.18, 9], [23.6, 17], [25.38, 26], [41.98, 31], [52.72, 36], [59.96, 44], [61.82, 49], [63.76, 55], [65.5, 58], [71.06, 61], [82.0, 67], [86.32, 70], [96.32, 76], [98.32, 81], [103.74, 86], [111.18, 90], [118.2, 92], [121.82, 94], [125.44, 97], [132.66, 98.2], [139.64, 98.9], [141.0, 99.9]];
function pdoomAt(T) {
  let v = PDOOM[0][1];
  for (let i = 1; i < PDOOM.length; i++) { const [t, val] = PDOOM[i]; const prev = PDOOM[i - 1][1]; if (T >= t) v = lerp(prev, val, Ez.inOut(clamp((T - t) / 0.55))); }
  return v;
}
function pdoomBump(T) { let b = 0; for (let i = 1; i < PDOOM.length; i++) { const age = T - PDOOM[i][0]; if (age >= 0 && age < 0.8) b = Math.max(b, Math.exp(-age * 5)); } return b; }
function drawHUD(T, a = 1) {
  if (a <= 0) return;
  const v = pdoomAt(T), b = pdoomBump(T);
  push();
  translate(150, 1000);
  scale(0.78 * (1 + b * 0.12));
  rotate(-0.03 + b * 0.05 * Math.sin(T * 40));
  spr('hud_card', 0, 0, { s: 1, a: a * 0.96 });
  txt('P(doom)', -58, -26, { font: 'pixel', size: 30, fill: PAL.ink, weight: 600 }, { a });
  const hot = mixc(PAL.mint, PAL.red, clamp(v / 100));
  const str = (v >= 99 ? Math.min(v, 99.9).toFixed(1) : v < 10 ? v.toFixed(1) : Math.round(v).toString()) + '%'; // never reads 100% on the way to 99.9
  txt(str, 30, 24, { font: 'pixel', size: 58, fill: b > 0.25 ? PAL.red : PAL.ink, weight: 700, stroke: '#FFFFFF', sw: 3 }, { a });
  // mini gauge bar
  noStroke(); fill(withAlphaCol(PAL.grayLt, a)); rect(-128, 44, 256, 10, 5);
  fill(withAlphaCol(hot, a)); rect(-128, 44, 256 * clamp(v / 100), 10, 5);
  pop();
}

// ---------- frame render ----------
let flipUV = 0;
function renderFrame(T) {
  G.T = T;
  G.boil = Math.floor(T * 8);
  const pk = pickShots(T);
  drawShot(pk.a, T, sceneFB[0]);
  let type = 0, p = 0, tin = pk.tin;
  if (pk.b) {
    drawShot(pk.b, T, sceneFB[1]);
    type = TR[tin.type] ?? 1; p = clamp(pk.p);
    if (tin.type === 'mask' && tin.mask) {
      maskFB.draw(() => { background(0); push(); translate(-maskFB.width / 2, -maskFB.height / 2); scale(maskFB.width / W); noStroke(); fill(255); tin.mask(p, T); pop(); });
    }
  }
  push();
  shader(comp);
  comp.setUniform('uA', sceneFB[0]);
  comp.setUniform('uB', pk.b ? sceneFB[1] : sceneFB[0]);
  comp.setUniform('uM', maskFB);
  comp.setUniform('uP', p);
  comp.setUniform('uType', type);
  comp.setUniform('uT', T);
  comp.setUniform('uAng', tin?.ang ?? 0);
  const c = tin?.c || [W / 2, H / 2];
  comp.setUniform('uC', [c[0] / W, c[1] / H]); // vUv.y runs top-down
  comp.setUniform('uRes', [W, H]);
  comp.setUniform('uInk', [0.11, 0.09, 0.2]);
  comp.setUniform('uGrain', 0.11);
  comp.setUniform('uVig', 0.28);
  comp.setUniform('uFlip', flipUV);
  noStroke();
  plane(W, H);
  resetShader();
  pop();
  push();
  translate(-W / 2, -H / 2);
  drawLyrics(T);
  const hudA = T < -0.5 ? 0 : 1 - inv(152.5, 154, T);
  drawHUD(T, hudA);
  if (G.debug) {
    const lab = (pk.b ? pk.a.id + ' > ' + pk.b.id + ' ' + tin.type + ' p=' + p.toFixed(2) : pk.a.id) + '   T=' + T.toFixed(2);
    noStroke(); fill(0, 160); rect(W - 760, 12, 748, 54, 10);
    txt(lab, W - 386, 40, { font: 'pixel', size: 30, fill: '#FFFFFF', weight: 600 });
  }
  pop();
}

// ---------- clock ----------
let started = false, clockBase = null;
function songClock() {
  if (!started) return -9 + ((performance.now() / 1000) % 8); // poster idles on a loop before first play (export uses T = -1)
  if (!audio.paused) {
    const now = performance.now() / 1000, at = audio.currentTime;
    if (!clockBase) clockBase = { at, now };
    const pred = clockBase.at + (now - clockBase.now);
    if (Math.abs(pred - at) > 0.06) { clockBase = { at, now }; return at; }
    return pred;
  }
  clockBase = null;
  return audio.currentTime;
}

// ---------- p5 lifecycle ----------
async function setup() {
  const cnv = createCanvas(W, H, WEBGL);
  cnv.parent('stage');
  pixelDensity(1);
  brush.scaleBrushes(2);
  comp = createShader(VERT, FRAG_FULL);
  for (let i = 0; i < 2; i++) sceneFB.push(createFramebuffer({ width: W, height: H, density: 1 })); // depth+stencil so clip() works in scenes
  maskFB = createFramebuffer({ width: W / 2, height: H / 2, density: 1, depth: false });
  try { await Promise.race([Promise.all(['600 40px "DynaPuff"', '700 40px "Gaegu"', '600 40px "Pixelify Sans"', '700 40px "DynaPuff"', '400 40px "Gaegu"', '700 40px "Pixelify Sans"'].map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 4000))]); } catch (e) { /* fall back to system fonts */ }
  SHOTS.sort((a, b) => a.t0 - b.t0);
  for (let i = 0; i < SHOTS.length; i++) SHOTS[i].t1 = SHOTS[i + 1] ? SHOTS[i + 1].t0 : SONG.duration + 5;
  // warm up the native line/fill shaders once, so the first painter that uses them doesn't pay for compilation
  maskFB.draw(() => { clear(); stroke(255); strokeWeight(3); line(0, 0, 10, 10); noStroke(); fill(255); rect(0, 0, 4, 4); triangle(0, 0, 4, 0, 0, 4); });
  // track push/pop depth (scene code calls the globals)
  const _push = window.push, _pop = window.pop;
  window.push = function () { PUSHD++; return _push.apply(this, arguments); };
  window.pop = function () { PUSHD = Math.max(0, PUSHD - 1); return _pop.apply(this, arguments); };
  const q = new URLSearchParams(location.search);
  G.debug = q.has('debug');
  const exportMode = q.has('export');
  // paint the shared sprites and the title scene first so the poster can appear quickly;
  // the rest paint in the background while the poster idles (export mode paints everything up front)
  const first = SPR_DEFS.filter((d) => !/^s\d\d_/.test(d.name) || d.name.startsWith('s01_'));
  PENDING = SPR_DEFS.filter((d) => !first.includes(d));
  let last = performance.now();
  const batch = async (list) => {
    for (const d of list) {
      paintOne(d);
      if (performance.now() - last > 40) { UI.progress(PAINTED / SPR_DEFS.length); last = performance.now(); await new Promise((r) => setTimeout(r, 0)); }
    }
  };
  await batch(first);
  // pre-build every lyric line's word images so no line stalls a frame the first time it appears
  for (let i = 0; i < SONG.lines.length; i++) {
    const st = { ...LDEF, ...(LSTYLE[i] || {}) };
    if (st.hide) continue;
    try { LCACHE[i] = lineLayout(i, st); if (SONG.lines[i].stutter) textImg('just', { ...st, size: st.size * 0.8, fill: PAL.butter }); } catch (e) { reportErr('lyrics L' + i, e); }
  }
  if (exportMode) {
    await batch(PENDING);
    PENDING = [];
    noLoop(); G.exporting = true;
    finishLoading();
  } else {
    POSTER = true;
    UI.poster();
  }
  if (q.has('t')) { started = true; audio.currentTime = parseFloat(q.get('t')); }
}
let PENDING = [], POSTER = false, PAINTED = 0;
const PSTATS = {};
function paintOne(d) {
  const t0 = performance.now();
  try { paintSprite(d); } catch (e) { reportErr('paint ' + d.name, e); }
  const key = (d.name.match(/^s\d\d_/) || ['shared'])[0].replace('_', '');
  const st = PSTATS[key] || (PSTATS[key] = { ms: 0, n: 0, mb: 0 });
  st.ms += performance.now() - t0; st.n++; st.mb += (d.w * d.h * 4 * d.v) / 1048576;
  PAINTED++;
}
function finishLoading() {
  window.__paintStats = PSTATS;
  console.log('[paint] ' + Object.entries(PSTATS).map(([k, v]) => `${k}: ${v.ms.toFixed(0)}ms ${v.n} sprites ${v.mb.toFixed(1)}MB`).join(' | '));
  UI.progress(1);
  READY = true;
  window.__ready = true;
  UI.ready();
}
function draw() {
  if (G.exporting || !POSTER) return;
  if (!READY) {
    // keep painting in ~20 ms slices while the poster idles
    const t0 = performance.now();
    while (PENDING.length && performance.now() - t0 < 20) paintOne(PENDING.shift());
    UI.progress(PAINTED / SPR_DEFS.length);
    if (!PENDING.length) finishLoading();
  }
  const T = songClock();
  renderFrame(T);
  UI.tick(T);
}
// deterministic render for export & tests
window.renderAt = function (t) { G.exporting = true; const t0 = performance.now(); push(); resetMatrix(); renderFrame(t); pop(); return performance.now() - t0; };
window.frameData = function (t, type = 'image/jpeg', q = 0.92) { const ms = window.renderAt(t); return { ms, url: document.querySelector('#stage canvas').toDataURL(type, q) }; };

// ---------- UI ----------
const UI = {
  el: (id) => document.getElementById(id),
  progress(f) {
    const pct = Math.round(f * 100) + '%';
    const b = this.el('loadbar'); if (b) b.style.width = pct;
    for (const id of ['loadpct', 'pillpct']) { const p = this.el(id); if (p) p.textContent = pct; }
  },
  ready() { document.body.classList.add('ready'); },
  poster() {
    document.body.classList.add('poster');
    if (!document.fullscreenEnabled) { // e.g. inside a sandboxed frame: hide controls that could not work
      this.el('btn-fs').hidden = true;
      const c = this.el('credit'); if (c) c.textContent = c.textContent.replace(' · F for full screen', '');
    }
    const play = this.el('bigplay');
    play.addEventListener('click', () => this.toggle());
    this.el('btn-play').addEventListener('click', () => this.toggle());
    this.el('btn-cc').addEventListener('click', () => this.cc());
    this.el('btn-fs').addEventListener('click', () => this.fs());
    const sc = this.el('scrub');
    sc.addEventListener('input', () => { if (!READY) return; started = true; audio.currentTime = (sc.value / 1000) * SONG.duration; clockBase = null; });
    audio.addEventListener('ended', () => { document.body.classList.remove('playing'); });
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return;
      if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); this.toggle(); }
      if (e.key === 'ArrowRight') { started = true; audio.currentTime = Math.min(SONG.duration, audio.currentTime + 5); clockBase = null; }
      if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); clockBase = null; }
      if (e.key === 'c' || e.key === 'l') this.cc();
      if (e.key === 'f' && document.fullscreenEnabled) this.fs();
    });
    let idle;
    const wake = () => { document.body.classList.add('awake'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.remove('awake'), 2200); };
    window.addEventListener('mousemove', wake); window.addEventListener('touchstart', wake, { passive: true });
  },
  toggle() {
    if (!READY) return;
    if (audio.paused) { started = true; if (audio.ended || audio.currentTime >= SONG.duration - 0.05) audio.currentTime = 0; audio.play(); document.body.classList.add('playing', 'started'); }
    else { audio.pause(); document.body.classList.remove('playing'); }
    this.el('btn-play').setAttribute('aria-label', audio.paused ? 'Play' : 'Pause');
  },
  cc() { G.lyricsOn = !G.lyricsOn; this.el('btn-cc').setAttribute('aria-pressed', String(G.lyricsOn)); },
  fs() { const s = this.el('player'); if (!document.fullscreenElement) s.requestFullscreen?.(); else document.exitFullscreen?.(); },
  tick(T) {
    const t = Math.max(0, T);
    const sc = this.el('scrub');
    if (document.activeElement !== sc) sc.value = Math.round((t / SONG.duration) * 1000);
    const f = (x) => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0');
    this.el('time').textContent = f(t) + ' / ' + f(SONG.duration);
  },
};

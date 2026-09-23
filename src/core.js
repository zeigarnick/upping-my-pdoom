// core.js - timing, math, sprite system, text, compositing
// Everything visible is a pure function of song time T so playback, scrubbing and export stay in sync.

const W = 1920, H = 1080;

const PAL = {
  paper: '#FFF8EE', coral: '#F15B45', coralLt: '#F7866F', coralDk: '#C9412E',
  pink: '#FF8FB8', pinkLt: '#FFC4DA', mint: '#6FD6B0', mintLt: '#BFF0DC', butter: '#FFD35C', butterLt: '#FFEFB0',
  sky: '#7CC6FF', skyLt: '#C8E7FF', lilac: '#B69CFF', lilacLt: '#DCCFFF', ink: '#2B2140', inkSoft: '#5A4B7A',
  night: '#1D1A3C', nightLt: '#34306A', grass: '#86D06A', grassDk: '#4FA65A', peach: '#FFCFB0', skin: '#FFD9BF',
  orange: '#FF9A3D', teal: '#27A99B', red: '#E83A4F', blue: '#4C7BF4', navy: '#243063', cream: '#FFF3DA',
  gray: '#A49DB5', grayLt: '#DAD5E4', green: '#3FBF7F', gold: '#F5B82E', brown: '#9A6B4F', brownLt: '#C99A73',
  white: '#FFFFFF', black: '#141018',
};

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sstep = (a, b, x) => { const t = inv(a, b, x); return t * t * (3 - 2 * t); };
const fract = (x) => x - Math.floor(x);
const TAU = Math.PI * 2;
const Ez = {
  in: (t) => t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t, s = 1.70158) => { const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inQuad: (t) => t * t,
};
// deterministic hash noise
const R = (i, s = 0) => fract(Math.sin(i * 127.1 + s * 311.7 + 17.13) * 43758.5453);
const RS = (i, s = 0) => R(i, s) * 2 - 1;
function strHash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 100000; }
// smooth 1D value noise, deterministic
function vnoise(x, s = 0) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(R(i, s), R(i + 1, s), u) * 2 - 1; }
const wob = (T, speed = 1, s = 0) => vnoise(T * speed, s);

// ---------- audio envelopes & beats ----------
function decodeEnv(b64) { const s = atob(b64); const a = new Float32Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) / 255; return a; }
const ENV = { rms: decodeEnv(ENV_RMS_B64), low: decodeEnv(ENV_LOW_B64), high: decodeEnv(ENV_HIGH_B64) };
function env(name, T) { const a = ENV[name]; const f = T * ENV_FPS; const i = Math.floor(f); if (i < 0) return 0; if (i >= a.length - 1) return a[a.length - 1] || 0; return lerp(a[i], a[i + 1], f - i); }
const BEAT_LEN = 60 / SONG.bpm;
function beatAt(T) {
  if (T < BEATS[0]) { const k = Math.floor((T - BEATS[0]) / BEAT_LEN); const b = BEATS[0] + k * BEAT_LEN; return { i: k, ph: (T - b) / BEAT_LEN, len: BEAT_LEN, t: b }; }
  let lo = 0, hi = BEATS.length - 1;
  if (T >= BEATS[hi]) { const k = Math.floor((T - BEATS[hi]) / BEAT_LEN); const b = BEATS[hi] + k * BEAT_LEN; return { i: hi + k, ph: (T - b) / BEAT_LEN, len: BEAT_LEN, t: b }; }
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (BEATS[m] <= T) lo = m; else hi = m - 1; }
  const b = BEATS[lo], n = BEATS[lo + 1]; return { i: lo, ph: (T - b) / (n - b), len: n - b, t: b };
}
// 1 on each beat, decaying
const kick = (T, k = 6) => Math.exp(-beatAt(T).ph * k);
// bouncing 0..1 (up at mid-beat) for hop cycles
const hopB = (T) => Math.sin(Math.PI * beatAt(T).ph);

// ---------- global frame state ----------
const G = { T: 0, boil: 0, lyricsOn: true, exporting: false };

// ---------- sprite system ----------
// Sprites are painted once with p5.brush into framebuffers, then composited every frame.
const SPR = {};
const SPR_DEFS = [];
function defSprite(name, w, h, fn, o = {}) { SPR_DEFS.push({ name, w, h, fn, v: o.v || 1, ax: o.ax ?? 0.5, ay: o.ay ?? 0.5 }); }

function paintSprite(d) {
  const s = { w: d.w, h: d.h, ax: d.ax, ay: d.ay, fbs: [] };
  for (let v = 0; v < d.v; v++) {
    const fb = createFramebuffer({ width: d.w, height: d.h, density: 1, depth: false, antialias: false });
    fb.draw(() => {
      clear();
      brush.load(fb);
      push();
      translate(-d.w / 2, -d.h / 2);
      randomSeed(strHash(d.name) + v * 7919);
      noiseSeed(strHash(d.name) + v * 31);
      if (brush.seed) brush.seed(strHash(d.name) + v * 7919);
      if (brush.noiseSeed) brush.noiseSeed(strHash(d.name) + v * 31);
      d.fn(v, d.w, d.h);
      // p5.brush commits a stroke only when the next brush op runs, so the painter's last mark would be
      // dropped (or land in the next sprite). An off-canvas dummy op commits it here.
      brush.set('pen', '#010203', 0.5); brush.line(-400, -400, -399, -400);
      brush.noStroke(); brush.noFill(); brush.noHatch();
      pop();
    });
    brush.load();
    s.fbs.push(fb);
  }
  SPR[d.name] = s;
}

// Draw a sprite. o: s (scale), sx, sy, r (rotation), a (alpha 0..1), v (variant), flip, jit (boil jitter), seed
function spr(name, x, y, o = {}) {
  const s = SPR[name];
  if (!s) return;
  const n = s.fbs.length;
  const seed = o.seed || 0;
  const vi = ((Math.floor(o.v != null ? o.v : G.boil + seed) % n) + n) % n;
  let r = o.r || 0;
  let jx = 0, jy = 0;
  if (o.jit !== 0) {
    const j = o.jit ?? 1;
    const b = G.boil * 7.31 + seed * 3.7;
    r += RS(b, 1) * 0.012 * j;
    jx = RS(b, 2) * 1.5 * j; jy = RS(b, 3) * 1.5 * j;
  }
  const sc = o.s ?? 1;
  push();
  translate(x + jx, y + jy);
  if (r) rotate(r);
  scale(sc * (o.sx ?? 1) * (o.flip ? -1 : 1), sc * (o.sy ?? 1));
  if (o.a != null && o.a < 1) { if (o.a <= 0) { pop(); return; } tint(255, 255 * o.a); }
  if (o.crop) { // reveal part of sprite: crop = [x0,y0,x1,y1] in 0..1
    const [c0, c1, c2, c3] = o.crop;
    if (c2 <= c0 || c3 <= c1) { pop(); return; }
    image(s.fbs[vi], -s.ax * s.w + c0 * s.w, -s.ay * s.h + c1 * s.h, (c2 - c0) * s.w, (c3 - c1) * s.h,
      c0 * s.w, c1 * s.h, (c2 - c0) * s.w, (c3 - c1) * s.h);
  } else {
    image(s.fbs[vi], -s.ax * s.w, -s.ay * s.h, s.w, s.h);
  }
  pop();
}
const sprW = (name) => SPR[name]?.w || 0;
const sprH = (name) => SPR[name]?.h || 0;

// ---------- text images (Canvas2D -> p5.Image, cached) ----------
const FONTS = { display: '"DynaPuff", "Baloo 2", "Comic Sans MS", system-ui, sans-serif', hand: '"Gaegu", "Patrick Hand", "Comic Sans MS", cursive', pixel: '"Pixelify Sans", "Courier New", monospace' };
const TXT = {};
function textImg(str, st = {}) {
  const font = st.font || 'display', size = st.size || 64, weight = st.weight || 600;
  const fill = st.fill || PAL.ink, stroke = st.stroke || null, sw = st.sw || 0, shadow = st.shadow || null;
  const key = [str, font, size, weight, fill, stroke, sw, shadow].join('|');
  if (TXT[key]) return TXT[key];
  const c = document.createElement('canvas');
  const cx = c.getContext('2d');
  const fstr = `${weight} ${size}px ${FONTS[font] || font}`;
  cx.font = fstr;
  const m = cx.measureText(str);
  const pad = Math.ceil(sw + size * 0.25 + (shadow ? size * 0.08 : 0));
  const w = Math.ceil(m.width + pad * 2), h = Math.ceil(size * 1.35 + pad * 2);
  c.width = w; c.height = h;
  cx.font = fstr; cx.textBaseline = 'middle'; cx.textAlign = 'center'; cx.lineJoin = 'round'; cx.miterLimit = 2;
  const x = w / 2, y = h / 2 + size * 0.04;
  if (shadow) { cx.fillStyle = shadow; cx.fillText(str, x + size * 0.05, y + size * 0.07); if (stroke && sw) { cx.strokeStyle = shadow; cx.lineWidth = sw * 2; cx.strokeText(str, x + size * 0.05, y + size * 0.07); } }
  if (stroke && sw) { cx.strokeStyle = stroke; cx.lineWidth = sw * 2; cx.strokeText(str, x, y); }
  cx.fillStyle = fill; cx.fillText(str, x, y);
  const img = createImage(w, h);
  img.drawingContext.drawImage(c, 0, 0);
  if (img.setModified) img.setModified(true);
  const out = { img, w, h, tw: m.width };
  TXT[key] = out;
  return out;
}
// draw text centered at x,y
function txt(str, x, y, st = {}, o = {}) {
  const t = textImg(str, st);
  push();
  translate(x, y);
  if (o.r) rotate(o.r);
  const s = o.s ?? 1;
  scale(s * (o.sx ?? 1), s * (o.sy ?? 1));
  if (o.a != null && o.a < 1) { if (o.a <= 0) { pop(); return t; } tint(255, 255 * o.a); }
  image(t.img, -t.w / 2, -t.h / 2, t.w, t.h);
  pop();
  return t;
}

// ---------- drawing helpers (native p5, used live) ----------
function cam(cx, cy, z = 1, r = 0) { translate(W / 2, H / 2); if (r) rotate(r); scale(z); translate(-cx, -cy); }
function gradRect(x, y, w, h, c1, c2, vertical = true) {
  noStroke();
  beginShape(TRIANGLES);
  const A = color(c1), B = color(c2);
  const v = (px, py, c) => { fill(c); vertex(px, py); };
  if (vertical) { v(x, y, A); v(x + w, y, A); v(x + w, y + h, B); v(x, y, A); v(x + w, y + h, B); v(x, y + h, B); }
  else { v(x, y, A); v(x + w, y, B); v(x + w, y + h, B); v(x, y, A); v(x + w, y + h, B); v(x, y + h, A); }
  endShape();
}
function bg(c) { noStroke(); fill(c); rect(-50, -50, W + 100, H + 100); }
function disc(x, y, r, c, a = 1) { noStroke(); const col = color(c); col.setAlpha(255 * a); fill(col); circle(x, y, r * 2); }
function ringLine(x, y, r, c, wgt, a = 1) { noFill(); const col = color(c); col.setAlpha(255 * a); stroke(col); strokeWeight(wgt); circle(x, y, r * 2); noStroke(); }
function segLine(x1, y1, x2, y2, c, wgt, a = 1) { const col = color(c); col.setAlpha(255 * a); stroke(col); strokeWeight(wgt); line(x1, y1, x2, y2); noStroke(); }
function withAlphaCol(c, a) { const col = color(c); col.setAlpha(255 * a); return col; }

// ---------- compositing shader ----------
const VERT = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec2 vUv;
void main(){ vUv = aTexCoord; gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uM;
uniform float uP;
uniform float uType;
uniform float uT;
uniform float uAng;
uniform vec2 uC;
uniform vec2 uRes;
uniform vec3 uInk;
uniform float uGrain;
uniform float uVig;
uniform float uFlip;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
vec2 fl(vec2 uv){ return uFlip > 0.5 ? vec2(uv.x, 1.0-uv.y) : uv; }
vec4 SA(vec2 uv){ return texture2D(uA, fl(clamp(uv,0.0,1.0))); }
vec4 SB(vec2 uv){ return texture2D(uB, fl(clamp(uv,0.0,1.0))); }
vec2 swirl(vec2 uv, vec2 c, float amt){ vec2 d=(uv-c)*vec2(uRes.x/uRes.y,1.0); float r=length(d); float a=atan(d.y,d.x)+amt*exp(-r*2.0); d=vec2(cos(a),sin(a))*r; return c + d/vec2(uRes.x/uRes.y,1.0); }
void main(){
  vec2 uv = vUv;
  float asp = uRes.x/uRes.y;
  vec2 q = uv*vec2(asp,1.0);
  int t = int(uType+0.5);
  float p = uP;
  vec3 col;
  if (t==0) { col = SA(uv).rgb; }
  else if (t==1) { // watercolor bloom dissolve
    float n = fbm(q*2.5 + 3.0)*0.75 + fbm(q*14.0)*0.25;
    float th = p*1.3 - 0.15;
    float m = smoothstep(n-0.05, n+0.05, th);
    float edge = smoothstep(0.0,0.05,th-n+0.05) * (1.0-smoothstep(0.05,0.12,th-n+0.05));
    col = mix(SA(uv).rgb, SB(uv).rgb, m);
    col *= 1.0 - edge*0.18;
  }
  else if (t==2) { // cartoon iris: close on A at uC, open on B
    vec2 d = (uv-uC)*vec2(asp,1.0);
    float r = length(d);
    float wob = (fbm(vec2(atan(d.y,d.x)*3.0, uT*0.5))-0.5)*0.05;
    float R = p<0.5 ? mix(1.4,0.0,Ez(p*2.0)) : mix(0.0,1.4,Ez(p*2.0-1.0));
    float inside = 1.0 - smoothstep(R-0.006+wob, R+0.006+wob, r);
    vec3 img = p<0.5 ? SA(uv).rgb : SB(uv).rgb;
    col = mix(uInk, img, inside);
  }
  else if (t==3) { // painted wipe along angle
    vec2 dir = vec2(cos(uAng), sin(uAng));
    float d = dot((uv-0.5)*vec2(asp,1.0), dir)/(0.5*(abs(dir.x)*asp+abs(dir.y))) *0.5 + 0.5;
    float n = (fbm(q*vec2(6.0,6.0)+vec2(0.0,uT*0.2))-0.5)*0.22 + (noise(q*40.0)-0.5)*0.04;
    float th = p*1.4 - 0.2;
    float m = 1.0 - smoothstep(th-0.015, th+0.015, d + n);
    float edge = 1.0 - smoothstep(0.0, 0.03, abs(d+n-th));
    col = mix(SA(uv).rgb, SB(uv).rgb, m);
    col = mix(col, col*0.8, edge*0.6);
  }
  else if (t==4) { // flash through paper white
    vec3 w = vec3(1.0,0.98,0.94);
    col = p<0.5 ? mix(SA(uv).rgb, w, smoothstep(0.0,0.5,p)) : mix(w, SB(uv).rgb, smoothstep(0.5,1.0,p));
  }
  else if (t==5) { // zoom through: A rushes toward viewer at uC, B grows from it
    float za = 1.0 + Ez(p)*6.0;
    vec2 ua = uC + (uv-uC)/za;
    float zb = mix(0.35, 1.0, Eo(p));
    vec2 ub = uC + (uv-uC)/zb;
    float mb = smoothstep(0.25, 0.75, p);
    col = mix(SA(ua).rgb, SB(ub).rgb, mb);
  }
  else if (t==6) { // paint drip from top
    float dx = floor(uv.x*48.0);
    float drip = hash(vec2(dx,3.0))*0.35 + noise(vec2(uv.x*30.0,1.0))*0.15;
    float y = uv.y; // 0 at top
    float front = p*1.6 - drip;
    float m = 1.0 - smoothstep(front-0.01, front+0.01, y);
    col = mix(SA(uv).rgb, SB(uv).rgb, m);
  }
  else if (t==7) { // swirl into drain then out
    float amt = p<0.5 ? Ez(p*2.0)*12.0 : (1.0-Ez(p*2.0-1.0))*-12.0;
    float z = p<0.5 ? mix(1.0,0.2,Ez(p*2.0)) : mix(0.2,1.0,Ez(p*2.0-1.0));
    vec2 u2 = uC + (uv-uC)*z;
    u2 = swirl(u2, uC, amt);
    col = p<0.5 ? SA(u2).rgb : SB(u2).rgb;
  }
  else if (t==8) { // pixel mosaic (Clawd pixels)
    float k = p<0.5 ? p*2.0 : (1.0-p)*2.0;
    float bs = max(1.0, floor(pow(k,1.6)*90.0));
    vec2 cell = (floor(uv*uRes/bs)+0.5)*bs/uRes;
    col = p<0.5 ? SA(cell).rgb : SB(cell).rgb;
  }
  else if (t==9) { // custom mask
    float m = texture2D(uM, fl(uv)).r;
    col = mix(SA(uv).rgb, SB(uv).rgb, m);
  }
  else if (t==10) { // card flip
    float k = p<0.5 ? cos(p*3.14159) : -cos(p*3.14159);
    float x = (uv.x-0.5)/max(k,0.001)+0.5;
    vec3 papr = vec3(1.0,0.97,0.93)*0.9;
    if (x<0.0||x>1.0) col = papr; else col = p<0.5 ? SA(vec2(x,uv.y)).rgb : SB(vec2(x,uv.y)).rgb;
  }
  else if (t==11) { // whip pan with motion blur
    vec2 dir = vec2(cos(uAng), sin(uAng));
    float e = Ez(p);
    float blur = sin(p*3.14159)*0.08;
    vec3 acc = vec3(0.0);
    for (int i=0;i<12;i++){
      float o = (float(i)/11.0-0.5)*blur;
      vec2 ua = uv + dir*(e + o);
      vec2 ub = uv + dir*(e - 1.0 + o);
      vec3 ca = SA(ua).rgb; vec3 cb = SB(ub).rgb;
      float inA = step(0.0,ua.x)*step(ua.x,1.0)*step(0.0,ua.y)*step(ua.y,1.0);
      acc += mix(cb, ca, inA);
    }
    col = acc/12.0;
  }
  else { col = SA(uv).rgb; }
  // paper grain + vignette (applied everywhere)
  float g = fbm(q*260.0)*0.55 + fbm(q*55.0+7.0)*0.45;
  col *= 1.0 - uGrain*(g-0.48);
  float fib = smoothstep(0.7,0.78,noise(q*vec2(30.0,34.0)+3.0))*0.5;
  col *= 1.0 - uGrain*0.3*fib;
  vec2 vd = (uv-0.5)*vec2(asp,1.0);
  col *= 1.0 - uVig*smoothstep(0.45, 1.15, length(vd));
  gl_FragColor = vec4(col, 1.0);
}`;
// easing helpers must exist in GLSL too
const FRAG_FULL = FRAG.replace('float hash(vec2 p)', 'float Ez(float t){ return t<0.5 ? 4.0*t*t*t : 1.0-pow(-2.0*t+2.0,3.0)/2.0; }\nfloat Eo(float t){ return 1.0-pow(1.0-t,3.0); }\nfloat hash(vec2 p)');

const TR = { cut: 0, bleed: 1, iris: 2, wipe: 3, flash: 4, zoom: 5, drip: 6, swirl: 7, pixel: 8, mask: 9, flip: 10, whip: 11 };

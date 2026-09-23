// Render frames of the P(doom) video headlessly for review.
// usage: node tools/frames.js --out <dir> [--scenes s03,s04] [--nodebug] [--grid 2|3] [--range t0 t1 n] [t ...]
// Writes <dir>/f_<t>.jpg, contact sheets <dir>/sheet_<k>.jpg, and prints per-frame render ms, paint stats and errors.
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
// Uses Playwright's Chromium (npx playwright-core install chromium) unless CHROME_PATH points at another Chrome.
const CHROME = process.env.CHROME_PATH || undefined;
const args = process.argv.slice(2);
let out = 'frames', scenes = '', debug = true, grid = 2; const times = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') out = args[++i];
  else if (a === '--scenes') scenes = args[++i];
  else if (a === '--nodebug') debug = false;
  else if (a === '--grid') grid = parseInt(args[++i]);
  else if (a === '--range') { const t0 = +args[++i], t1 = +args[++i], n = +args[++i]; for (let k = 0; k < n; k++) times.push(+(t0 + (t1 - t0) * (n === 1 ? 0 : k / (n - 1))).toFixed(3)); }
  else times.push(+a);
}
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files', '--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', (m) => { const t = m.text(); if (/GPU stall|WebGL: |Automatic fallback/.test(t)) return; console.log('[console]', t); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  const q = ['export=1', debug ? 'debug=1' : '', scenes ? 'scenes=' + scenes : ''].filter(Boolean).join('&');
  const t0 = Date.now();
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html') + '?' + q);
  await page.waitForFunction('window.__ready === true', null, { timeout: 300000 });
  console.log(`ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  fs.mkdirSync(out, { recursive: true });
  const files = []; const msList = [];
  for (const t of times) {
    const r = await page.evaluate((t) => window.frameData(t, 'image/jpeg', 0.85), t);
    const f = path.join(out, `f_${t.toFixed(2)}.jpg`);
    fs.writeFileSync(f, Buffer.from(r.url.split(',')[1], 'base64'));
    files.push(f); msList.push(r.ms);
  }
  const errs = await page.evaluate(() => window.__errors || []);
  await browser.close();
  if (msList.length) console.log(`render ms: avg ${(msList.reduce((a, b) => a + b, 0) / msList.length).toFixed(1)}  max ${Math.max(...msList).toFixed(1)}  (${times.map((t, i) => t + ':' + msList[i].toFixed(0)).join(' ')})`);
  console.log(errs.length ? 'SCENE ERRORS:\n  ' + errs.join('\n  ') : 'no scene errors');
  // contact sheets
  const per = grid * grid;
  for (let k = 0; k * per < files.length; k++) {
    const grp = files.slice(k * per, (k + 1) * per);
    while (grp.length < per) grp.push(grp[grp.length - 1]);
    const layout = []; for (let i = 0; i < per; i++) { const x = i % grid, y = Math.floor(i / grid); layout.push(`${x ? Array(x).fill('w0').join('+') : '0'}_${y ? Array(y).fill('h0').join('+') : '0'}`); }
    const sheet = path.join(out, `sheet_${k}.jpg`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...grp.flatMap((f) => ['-i', f]), '-filter_complex', `xstack=inputs=${per}:layout=${layout.join('|')},scale=1920:-1`, sheet]);
    console.log('sheet', sheet, '<-', grp.map((f) => path.basename(f)).join(' '));
  }
})().catch((e) => { console.error(e); process.exit(1); });

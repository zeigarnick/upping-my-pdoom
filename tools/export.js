// Export the video to MP4, frame-accurately, with the original audio.
// usage: node tools/export.js [--fps 30] [--from 0] [--to 156.65] [--out dist/pdoom.mp4] [--scenes s01,s02]
// Renders every frame headlessly through window.frameData(t) and pipes JPEGs into ffmpeg.
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
// Uses Playwright's Chromium (npx playwright-core install chromium) unless CHROME_PATH points at another Chrome.
const CHROME = process.env.CHROME_PATH || undefined;
const ROOT = path.resolve(__dirname, '..');

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const fps = +opt('fps', 30), from = +opt('from', 0), to = +opt('to', 156.65);
const out = path.resolve(ROOT, opt('out', 'dist/pdoom.mp4'));
const scenes = opt('scenes', '');

(async () => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files', '--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?export=1' + (scenes ? '&scenes=' + scenes : ''));
  await page.waitForFunction('window.__ready === true', null, { timeout: 300000 });

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-ss', String(from), '-i', path.join(ROOT, 'pdoom.mp3'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

  const n = Math.round((to - from) * fps);
  const t0 = Date.now();
  let msSum = 0, msMax = 0;
  for (let i = 0; i < n; i++) {
    const t = from + i / fps;
    const r = await page.evaluate((t) => window.frameData(t, 'image/jpeg', 0.95), t);
    msSum += r.ms; msMax = Math.max(msMax, r.ms);
    const buf = Buffer.from(r.url.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise((res) => ff.stdin.once('drain', res));
    if (i % (fps * 5) === 0) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r${t.toFixed(1)}s / ${to}s  (${Math.round((i / n) * 100)}%, ${el.toFixed(0)}s elapsed, render avg ${(msSum / (i + 1)).toFixed(1)}ms max ${msMax.toFixed(0)}ms)   `);
    }
  }
  const errs = await page.evaluate(() => window.__errors || []);
  await browser.close();
  ff.stdin.end();
  await new Promise((res) => ff.on('close', res));
  console.log(`\nwrote ${path.relative(ROOT, out)} in ${((Date.now() - t0) / 1000).toFixed(0)}s; render avg ${(msSum / n).toFixed(1)}ms, max ${msMax.toFixed(0)}ms`);
  console.log(errs.length ? 'SCENE ERRORS:\n  ' + errs.join('\n  ') : 'no scene errors');
})().catch((e) => { console.error(e); process.exit(1); });

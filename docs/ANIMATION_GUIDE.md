# Animation guide

How to build a scene for the P(doom) music video so that 15 scenes made in parallel feel like one film.
The storyboard (`docs/STORYBOARD.md`) says what happens; this guide says how it should look, move and be built.

## 1. The look

- Watercolor on warm paper, cute and cartoony, bright but never neon.
- Every painted object uses the house recipe `paint(pts, color, opts)`: a flat base in a lighter tint, a textured p5.brush watercolor layer, and a scratchy 2B pencil outline in plum ink `PAL.ink`.
- Backgrounds are big soft washes painted at half resolution (1000x580) with `washSprite()` or your own `defSprite`, drawn at 2x with `washBG(name)` or `spr(name, W/2, H/2, { s: 2 })`. Layer blooms (`blob`) of two or three related colours for depth.
- Palette: only `PAL.*` colours or `mixc`/`lite`/`dark` blends of them. Clawd coral `PAL.coral` is the hero colour; do not reuse pure coral for large background areas.
- Outlines: 1.4-2.4 weight `'2B'` for objects, `'pen'` for fine detail, `'marker'` for bold graphic strokes, `'charcoal'` for heavy chunky lines.
- The paper grain and vignette are added globally by the compositor; do not add your own grain overlay.
- **The white torn-paper rim is the house style.** p5.brush paints as if on white paper, so every painted sprite gets a thin white watercolor rim where it meets transparency. Everything reads as a cut-paper watercolor sticker, which pops on dark grounds; embrace it. When one element must blend seamlessly into a dark ground (smoke, glows, far background shapes), draw it with native shapes or paint it over a flat base in the ground's colour.
- The engine now flushes p5.brush's last pending stroke after every painter and seeds p5.brush per sprite; scene-local flush workarounds are harmless but no longer needed.
- Native p5 shapes (`disc`, `segLine`, `rect`, `gradRect`) are fine for particles, glows, lines and gradients, but anything that reads as an object should be painted.
- Glows: `glow(x, y, r, c, a)` is additive and blows out on light grounds; keep `a` at or under 0.6 and use it on darker scenes.

## 2. Characters

### Clawd (the AI) - `clawd(x, y, s, o)`

The user supplied this design; never change the silhouette.
Body 8x6 grid units, 2x2 arms at mid-height, four 1x2 legs, two 1x1 square eyes, coral.
No mouth by default (`mouth: 'o' | 'smile'` only for a strong beat).

- `(x, y)` is the ground point between the feet; `s = 1` makes the body 320 px wide and Clawd 320 px tall.
- `eyes`: `'ce_sq'` (default, auto-blinks), `'ce_blink'`, `'ce_happy'`, `'ce_heart'`, `'ce_star'`, `'ce_red'`, `'ce_x'`, `'ce_spiral'`, `'ce_cash'`, `'ce_dot'`.
- `look: [dx, dy]` shifts the eyes in grid units; `eyeS` scales them.
- `armL`, `armR` in radians: negative raises the arm, positive lowers it. About -0.6 to -1.2 reads as "arms up"; past about -1.5 the arm swings behind the body and disappears.
- `walk`: phase in cycles (legs lift alternately); `legs: [[dy, rot] x4]` for custom poses.
- `hop` (px up), `sq` (squash, >1 wide), `r` (tilt), `flip`, `a` (alpha), `blush`, `seed`.
- `acc`: any of `'crown'`, `'shades'`, `'party'`, `'hardhat'`, `'bow'`, `'mask'`, `'headband'`.

### Pip (the human narrator) - `pip(x, y, s, o)`

An original character: a chibi human with navy hair, round glasses, peach skin and a lilac hoodie, about 300 px tall at `s = 1`.

- `face`: `'pf_neutral'`, `'pf_happy'`, `'pf_nervous'`, `'pf_scared'`, `'pf_cry'`, `'pf_love'`, `'pf_dizzy'`, `'pf_cool'` (sunglasses), `'pf_shock'`.
- `armL`, `armR`: 0 hangs down, positive raises outward (about 2.4 is overhead).
- `walk` (cycles), `legs: [rotL, rotR]`, `hop`, `r`, `flip`, `lean`, `headR`, `a`, `sq`, `seed`.
- `hat`: `'hardhat'`, `'party'`, `'bow'`.
- Researcher friends reuse the rig: `body: 'npc_body_mint' | 'npc_body_butter' | 'npc_body_sky'`, `arm: 'npc_arm_mint' | ...`, `head: 'npc_head2'` (bun) or `'npc_head3'` (curly orange).

Need a pose the rigs can't do (sitting, holding a prop, lying down)?
Compose it: draw the rig inside `push()/translate()/rotate()`, add your own prop sprites in front, or build a scene-local helper.
Do not edit `art.js`.

## 3. Motion principles

1. **Something is always moving.** Every frame of every shot has a camera drift, character idle motion, particles, or all three. No frozen frames, not even in the quiet breakdown.
2. **Hit the words.** The storyboard lists key words; trigger a visible event at each one with `wordT(line, word)`. Aim for events within 0.05 s of the word time; anticipate big hits with a short wind-up just before.
3. **Ride the beat.** Use `kick(T)` for pulses and scale bumps, `hopB(T)` for bouncing, `beatAt(T)` for phase, `BEATS[n]` for exact beat times. The groove should be visible in characters or props at all times outside the breakdown.
4. **Classic cartoon timing.** Anticipation before big moves, overshoot and settle with `Ez.outBack` / `Ez.outElastic`, squash and stretch (`sq`) on landings and launches, follow-through on secondary parts.
5. **Camera with intent.** Use `cam(cx, cy, zoom, rot)` inside `push()/pop()` for slow push-ins, pans that follow action, and whip moves on hits. Use `shake(amt)` on impacts only.
6. **Boil is automatic.** Sprites switch painted variants 8 times a second and jitter slightly; give important recurring sprites `{ v: 2 }` or `{ v: 3 }`. Pass `jit: 0` for things that must stay rock steady (big backgrounds).
7. **Match the energy map.** Verse = bouncy and readable; chorus = bigger, busier, faster cuts inside the shot; breakdown = slow, floaty, tender; drop = maximum everything; silence = stillness with one small motion.

## 4. Lyrics on screen

The lyric layer draws every line automatically, word by word, at the sung time.
Style your lines with `lyr(lineIndex, style)` so they sit well in your compositions:

- `x`, `y`, `r` (numbers or `(T) => number`), `size` (default 74), `font` (`'display'` DynaPuff, `'hand'` Gaegu, `'pixel'` Pixelify Sans), `fill`, `stroke`, `sw`, `cols` (per-word colour cycle), `maxW` (default 1180), `anim` (`'pop'`, `'drop'`, `'rise'`, `'slide'`, `'spin'`, `'type'`, `'zoom'`, `'shake'`), `wave`, `r`, `swash` (`'swash0'`-`'swash2'` painted strip behind), `hide`.
- Per-word overrides: `words: { j: { fill, size, font, anim, jitter, tilt, grow, wave, hide, draw } }`. `hide` keeps the word's layout slot but skips drawing it; `draw(T, age, wd, a)` replaces the word's drawing entirely (the origin is the word centre, `wd.img` is its text image) for effects like stretched or scrambled letters.
- Keep lyrics in the top band (y 90-230) or the bottom band (y 860-1040) and keep the action clear of them.
- The P(doom) HUD owns the bottom-left corner (x < 340, y > 900); never put important action or text there.
- If your scene paints a key word huge in-world (like "FOOM!"), hide that word in the lyric layer with `words: { j: { hide: true } }`, and make sure the in-world word is on screen at the word time.

## 5. Transitions

- Your first shot's `tin` is the transition from the previous scene; the handoff table in the storyboard fixes its type, duration and centre.
- Your last shot must stage the lead-out the storyboard describes for the next scene.
- Shots draw slightly outside their own time range during transitions (`lt < 0` while fading in, `lt > d` while fading out); make sure your animation stays sensible there (clamp with `inv`/`clamp`).
- Available `tin.type`: `cut`, `bleed` (watercolor bloom dissolve), `iris` (cartoon iris close then open, `c`), `wipe` (painted wipe, `ang`), `flash`, `zoom` (rush into `c`), `drip`, `swirl` (`c`), `pixel` (Clawd-pixel mosaic), `flip` (card flip), `whip` (motion-blurred pan, `ang`), `mask` (custom: `mask(p, T)` draws white where the next shot shows).
- `d` is the duration in seconds and `at` is the fraction of it that happens before the shot's `t0`.

## 6. How the engine works

- 1920x1080 frame, origin top-left inside `draw(s)`.
- `s = { T, lt, d, u }`: song time, local time since `t0`, shot duration, progress 0-1.
- **Everything is a pure function of `T`.** No `Math.random`, no `random()` at draw time, no `frameCount`, no state carried between frames. Use `R(i, seed)` / `RS(i, seed)` hashes and `vnoise(x, seed)` for variety. The video must render identically when scrubbed, exported frame by frame, or played live.
- `random()` is fine inside `defSprite` painters (it is seeded per sprite).
- Sprites are painted once at load: `defSprite(name, w, h, (v, w, h) => { ... }, { v, ax, ay })` with the origin at the sprite's top-left, then drawn with `spr(name, x, y, { s, sx, sy, r, a, flip, v, jit, seed, crop })`.
- Leave a margin inside sprite bounds; watercolor bleeds past the shape edge. Keep brush shapes fully inside the sprite (shapes that run past the edge, long thin rects or duplicate vertices make pale wedges and spikes); use `flat()` for anything that must reach the edge.
- Useful helpers: `paint`, `wc`, `pen`, `flat`, `blob`, `wash`, `strokePath`, `ellPts`, `rrPts`, `rrPtsPoly`, `starPts`, `heartPts`, `offsetPts`, `scalePts` (art.js); `burst`, `floaters`, `twinkles`, `speedLines`, `glow`, `shake`, `pathPoint`, `drawGauge`, `drawCurtains` (kit.js); `txt(str, x, y, style, o)` for in-world text; `gradRect`, `bg`, `disc`, `ringLine`, `segLine`, `withAlphaCol` (core.js).
- Shared sprites you can use: everything in `art.js` (character parts, `'spark'`, `'sparkW'`, `'heart'`, `'heartR'`, `'star5'`, `'drop'`, `'note'`, `'blob_<colour>'`, `'splat'`, `'cloud'`, `'puff'`, `'ring'`, `'swash0-2'`) and `kit.js` (`'gauge'`, `'rocket'`, `'gpu'`, `'flame'`, `'paperclip'`, `'curtain'`).
- `clip(() => { circle(...) })` inside `push()/pop()` masks subsequent drawing (lenses, windows, keyholes).
- `blendMode(ADD)` is available for light effects; always return to `blendMode(BLEND)`.
- Never call `noTint()`: in p5 2.2.3 WEBGL it makes the next `image()` throw. Reset with `tint(255)`.
- Large concave p5.brush fills (wavy hilltops, spiral bands) spray white spikes toward the sprite edge, and bleed grows with shape size. For big shapes use bleed 0.01-0.02, or build them from `flat()` plus circle/rect washes and pencil lines. Shapes with holes (letters like Omega, rings) also leak fill into the hole: use a `flat()` base plus a brush outline, or split them into convex pieces.
- Dark backgrounds: p5.brush watercolor is translucent, so a dark wash painted on its own comes out pale. Lay an opaque base first: `flat(pts, color)` inside your painter, or `washSprite(name, layers, baseColor)`.
- Inside a `clip(() => { ... })` callback start with `noStroke(); fill(0, 0);` and then draw the mask shapes. An opaque fill there paints the mask on screen, and an active `noFill()` makes the mask empty so everything gets clipped away.
- Native `vertex()` calls are not free: thousands per frame cost several milliseconds (about 6000 cost 19 ms). Bake dense geometry into sprites.
- Many lines per frame: batch them with `segLines([[x1, y1, x2, y2], ...], color, weight, alpha)` instead of calling `segLine` in a loop.

## 7. File and naming rules

- You own exactly one file: `src/scenes/sNN.js`. Do not edit any other file (`core.js`, `art.js`, `kit.js`, `main.js`, `data.js`, `index.html`, other scenes, docs). If you believe a shared change is needed, say so in your report instead.
- Keep the file wrapped in the existing `(() => { ... })();` so helpers stay private.
- Prefix every sprite you define with your scene id: `defSprite('s07_basilisk', ...)`.
- Register shots with `shot({ id: 'L17-basilisk', t0, tin, draw(s) {...} })`; shot `t0` must be inside your scene's time range and your first shot's `t0` must equal your scene's start time.
- Style every lyric line in your range with `lyr(i, ...)`.

## 8. Budgets

Measured by `tools/frames.js`, on this Mac, headless:

- Frame render: average under 12 ms and max under 25 ms across your scene (the first frame of a run includes shader warm-up; ignore it).
- Sprite painting for your scene: under 1500 ms total and under 90 MB (the tool prints `[paint] sNN: ...`).
- Sprites: prefer 1000x580 or smaller; anything larger needs a reason. Up to 3 variants for characters and hero props, 1 for backgrounds.
- Per frame, keep live `brush.*` calls out of `draw()`; paint into sprites instead.

## 9. Content rules

- Clawd is the only pre-existing character, supplied by the user. Pip and everything else are original designs.
- Name-checked companies, products and people (ChatGPT, Sydney, Gato, NVDA, von Neumann, Ilya, Loom, Chinchilla) become original, generic visual ideas: no logos, no brand marks, no recognisable copyrighted characters, no likeness of any real person. Plain words like "NVDA" or "PTO" on a sign are fine.
- The only song text on screen comes from the lyric layer (which reads the user's `lyrics.txt` via `data.js`). In-world text is limited to short labels, signs and single emphasised words.

## 10. Testing loop

Render frames with the headless tool from the project root:

```bash
node tools/frames.js --out renders/s06/pass1 --scenes s06 --range 44.5 58.5 16
```

- `--scenes s05,s06` loads only those scene files (include the previous scene to check your incoming transition).
- `--range t0 t1 n` renders n evenly spaced frames; you can also list exact times.
- Contact sheets (`sheet_k.jpg`, 2x2 by default, `--grid 3` for 3x3) are written next to the frames; the debug label in the top-right shows shot id, transition and time. View them with the Read tool.
- The tool prints render timings, paint stats and any scene errors. Scene errors must be zero.
- Use a new output folder for each pass. Never run `rm -rf`.

Check at minimum: every key word time, every shot boundary at -0.2 / 0 / +0.2 s, your incoming handoff (with the previous scene loaded) and your outgoing lead-out, plus a dense range across each shot to judge motion.

## 11. Definition of done

- Every lyric line in your range has its own visual idea, styled lyric line, and word-timed events.
- Every frame is lively, on-model (Clawd's silhouette intact), readable, and composed around the lyric band and the HUD corner.
- Incoming and outgoing handoffs match the storyboard table.
- Budgets met, zero scene errors, deterministic (rendering the same `T` twice gives the same frame).
- Final report: shots with their `t0` and transition, the key moments you synced, render and paint numbers, anything you could not do, and any shared-code change you recommend.

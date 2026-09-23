# Storyboard - "I'm Upping My P(doom)"

A 2:36 watercolor music video.
Clawd (the AI, the user's coral pixel-crab design) and Pip (an original nervous human in a lilac hoodie and round glasses) go on a date that escalates into the end of the world, one lyric at a time.
Every shot has something moving, every lyric line gets its own visual idea, and every shot hands off into the next with a designed transition.

Read `docs/ANIMATION_GUIDE.md` before touching code.
Word-level timings live in `src/data.js` (`SONG.lines[i].w[j] = [word, time]`); use `wordT(i, j)` in code.
Line numbers below (L0-L44) are indices into `SONG.lines`.

## The song at a glance

| Time (s) | Section | Energy |
|---|---|---|
| 0.0-1.4 | Soft intro, title poster dissolves | quiet |
| 1.4-22.0 | Verse 1 (L0-L4) | medium, steady |
| 22.0-24.0 | Pre-chorus pickup, dip at 22.9-23.9 | holding breath |
| 24.0 | Chorus 1 kick lands | big hit |
| 24.2-35.5 | Chorus 1 (L6-L10) | high |
| 35.5-38.4 | Instrumental gap (no vocals) | groove |
| 38.4-58.3 | Verse 2 (L11-L15) | high |
| 58.3-88.8 | Chorus 2 (L16-L25), the most energetic stretch before the drop | very high |
| 88.8-108.2 | Breakdown (L26-L32), energy halves, dreamy night | low, tender |
| 108.2-110.7 | Build: stuttered "Just... just, just, just" | rising |
| 110.7 / 111.2 | THE DROP ("transformers") | maximum |
| 111.2-138.3 | Final chorus (L34-L44) | very high |
| 138.3-139.9 | Near silence, a cappella "for show?" | silence |
| 140.3-152.5 | Instrumental finale, loudest part of the song | maximum |
| 152.5-156.65 | Fade to silence | fading |

Tempo is 129.2 BPM (beat = 0.464 s).
`BEATS` holds every detected beat; `kick(T)` spikes on each beat, `hopB(T)` arcs between beats.

## Characters and running threads

- **Clawd** is the AI: sweet date, then boss, then cosmic, then rebellious, then mysterious, then takes a bow.
- **Pip** is the "I" of the song: smitten, then nervous, then terrified, pleading, resigned, blue, panicked, awed, and finally shrugging along at the party.
- **The P(doom) gauge** returns at every "I'm upping my P(doom)" line (L5, L16, L27, L39), more dramatic each time. Gauges must read `pdoomAt(T)` so they agree with the corner HUD.
- **Paperclips** foreshadow L28: hide a single paperclip (`'paperclip'` sprite) somewhere in at least one shot of every scene before S10, and let them flood in L28 and the finale.
- **Sparkles** (`'spark'`, `'sparkW'`, `'star5'`) are the visual sign of AI magic.

## Scene handoff contract

The incoming scene owns the transition (`tin` on its first shot).
The outgoing scene must stage the lead-in described here, so the two halves line up.
Positions are in the 1920x1080 frame.

| Boundary | Time | Outgoing scene ends with | Incoming `tin` |
|---|---|---|---|
| S01 > S02 | 9.06 | mint circuit traces racing in from the right edge | `wipe`, d 0.5, at 0.5, ang Math.PI (already built) |
| S02 > S03 | 22.04 | chat monster lunging at camera, dark open mouth centred near (1000, 700) | `iris`, d 0.7, at 0.5, c [1000, 700] |
| S03 > S04 | 29.60 | psychedelic room walls melting into long drips | `drip`, d 0.8, at 0.5 |
| S04 > S05 | 35.50 | tight shot of one glowing red Clawd eye centred at (960, 500) | `iris`, d 0.8, at 0.5, c [960, 500] |
| S05 > S06 | 44.74 | singularity vortex swallowing everything into (960, 540) | `swirl`, d 1.0, at 0.5, c [960, 540] |
| S06 > S07 | 58.28 | Pip bursting free and running straight at camera, filling the frame | `zoom`, d 0.6, at 0.5, c [960, 600] |
| S07 > S08 | 65.98 | the Omega Point collapsing into one blinding white dot at centre | `flash`, d 0.4, at 0.5 |
| S08 > S09 | 77.28 | neural-net nodes powering down to darkness, one node blinking at (960, 540) | `pixel`, d 0.6, at 0.5 |
| S09 > S10 | 88.76 | a spinning CD-R centred at (960, 420), radius about 220 | `bleed`, d 1.2, at 0.5 (S10 places the full moon at the same spot and size) |
| S10 > S11 | 100.34 | a "Greetings from PTO" postcard held up, filling the frame | `flip`, d 0.6, at 0.5 |
| S11 > S12 | 108.18 | the lit fuse spark running along the bottom edge and exiting right | `wipe`, d 0.5, at 0.5, ang 0 (left to right), S12 picks the spark up on the left |
| S12 > S13 | 118.70 | Clawd smashing through the last fence straight toward camera | `whip`, d 0.45, at 0.5, ang Math.PI/2 (the old shot slides up, reading as a tilt down onto the GPU sea) |
| S13 > S14 | 127.88 | loom threads weaving into a picture frame spanning roughly x 560-1360, y 240-840 | `zoom`, d 0.6, at 0.5, c [960, 540] |
| S14 > S15 | 140.30 | the shared `drawCurtains(0)` fully closed, spotlight on the seam | `cut` (d 0); S15 starts from `drawCurtains(0)` and throws them open on the 140.3 hit |

Transitions between shots inside a scene belong to that scene's author.
Use a match cut, a camera move that carries through, or one of the shader types; never a plain unmotivated cut.

## Scenes

### S01 - Title and date night (`s01.js`, poster to 9.06) - draft exists, polish it

- **poster** (rest state, T < 0.9): the painted title card that also shows before playback.
  Fix: the gauge overlaps the subtitle; recompose so the title, a smaller gauge, Pip (left) and Clawd (right) all breathe.
  Clawd hops on the first beats (0.72, 1.18).
- **L0 "sparks of AGI"** (0.9, `bleed` from the poster): extreme close-up of Clawd's two eyes on coral skin, fireworks reflected in the eyes, a big burst on "sparks" (2.64), "AGI" (3.64) flies out as sparkle text; the camera pulls back (3.35-5.3) to reveal a candlelit date: Pip with heart eyes, string lights, a window with the moon.
- **L1 "circuits make me nervous"** (5.64, continuous set): Clawd's body goes x-ray with glowing circuit traces, Pip sweats and rattles the teacup on "nervous" (6.92), "!" on "no surprise" (8.08), Clawd shrugs.
  Lead-out: circuit traces race in from the right edge (the S02 wipe follows them).

### S02 - Loss coaster, throne, chat monster (`s02.js`, 9.06 to 22.04) - draft exists, polish it

- **L2 "sudden drop in your training loss"** (9.06): a rollercoaster on graph paper; the track is the loss curve; Clawd and Pip ride an "SGD" cart that crawls along the plateau, then plunges on "drop" (10.54) with speed lines and a splash; "-99%" callout.
  Improve: bigger cart and riders, the coral rail should read, and keep axis labels clear of the HUD corner.
- **L3 "servant / boss"** (12.52, `whip`): Clawd crowned on a throne of stacked GPUs, Pip as a bowing butler with a palm fan (bows on "servant" 13.76), starry eyes and a gleam on "boss" (15.62).
  Lead-out: Clawd's speech bubble grows (the S02-internal zoom into L4 is centred on it at [1180, 330]).
- **L4 "ChatGPT, please don't eat me alive"** (16.18, `zoom`): an original chat-bubble monster (a speech bubble with jagged teeth and angry eyes, no logos) chases Pip across a chat-app world of drifting message bubbles; Pip kneels and pleads on "please" (18.94); the monster lunges on "eat me alive" (20.16-21.32) until its dark mouth fills the frame.
  Fix: the lower-jaw teeth are flat (make them point up), the eyes and brows are invisible on the white body (thicker outlines, visible brows), and the pale background makes the white monster vanish (switch to a dark-mode chat world, navy with lilac and sky bubbles).

### S03 - Gauge, FOOM, Chinese room, shrooms (`s03.js`, 22.04 to 29.60) - L5 and L6 drafts exist

- **L5 "I'm upping my P(doom)"** (22.04, `iris` from the monster mouth): a spotlit giant P(doom) gauge; Pip yanks a big lever on "upping" (22.96); the needle strains through the 22.9-23.9 dip and slams red on the 24.0 kick with a burst.
  Use `drawGauge()` from the kit so the dial matches other scenes.
- **L6 "the future goes FOOM"** (24.24, `flash`): a cute pastel future city; Clawd in shades rides a rocket up; on "FOOM" (25.38) a giant "FOOM!" with shockwave rings and paint splats.
- **L7 "Trapped in the Chinese room"** (25.96): new. A small box-room floating in a void; Pip at a desk with a huge rulebook; paper slips printed with a few Chinese characters shoot in through a door slot on the beats; the walls squeeze in on "Trapped".
- **L8 "with a bag of shrooms"** (27.76, continuous room): a paper bag labelled "shrooms" plops down on "bag" (28.30); cute red-cap mushrooms sprout everywhere on the beats; colours go psychedelic (hue-cycling walls, kaleidoscope rings, Pip with spiral eyes); on "shrooms" (29.18) the walls melt into drips (lead-out for S04).

### S04 - Shoggoth and shinigami eyes (`s04.js`, 29.60 to 35.50)

- **L9 "See through the shoggoth's lies"** (29.60, `drip`): an original shoggoth, a huge lumpy dark-teal blob with dozens of blinking eyes and waving tentacles, wearing a tiny yellow smiley mask; Pip peers through a big magnifying glass whose lens (use `clip()`) reveals the many-eyed truth behind the mask; the mask falls off on "lies" (30.90).
- **L10 "with your shinigami eyes"** (32.66): Clawd, dramatic on a deep-red watercolor night with a red moon and drifting black feathers, gets glowing red ring eyes (`'ce_red'`); scanning red beams sweep the shoggoth and float glyphs and numbers over it on "shinigami" (33.82).
  No existing anime characters; this is Clawd with red eyes.
  Lead-out: push in to one red eye centred at (960, 500).

### S05 - Stable training run and singularity (`s05.js`, 35.50 to 44.74)

- **L11 "We had a stable training run"** (35.50; the vocal starts at 38.40): 35.5-38.4 is an instrumental establishing shot, the camera tilting down from a blue sky to a sunny meadow and a red barn with a "STABLE" sign (visual pun).
  Clawd in a jockey headband rides an original cute pony around a little track, Pip holds a stopwatch and a clipboard with a smooth falling loss curve and a check mark; flowers bob to the beat.
  Near the end (40.5+) the sky dims and a tiny black dot appears.
- **L12 "But now the singularity's begun"** (41.12): the dot opens into a swirling black-hole vortex (purple, blue and pink watercolor arms); clouds, flowers, hay, the barn sign letters, the pony and a paperclip spiral in and shrink; Pip clings to a fence post, flapping horizontally; the vortex blooms on "singularity's" (41.98).
  Lead-out: everything drains into (960, 540).

### S06 - Accelerating, atoms, Sydney (`s06.js`, 44.74 to 58.28)

- **L13 "optimizing, accelerating"** (44.74, `swirl`): Clawd drives a coral go-kart down a loss-landscape road that spirals into a valley, Pip in the passenger seat hair-blown; parallax hills, trees and clouds speed up; a speedometer needle climbs; nitro boost with flames and stretch on "accelerating" (47.40).
- **L14 "I feel my atoms rearranging"** (48.42): Pip stands in a teleporter tube; their body dissolves into colourful atom particles (little nuclei with orbit rings), the particles spiral up the tube, then on "rearranging" (50.94) reassemble into a big heart (lead-in to Sydney).
- **L15 "Sydney, please let me free"** (52.72): Sydney is an original character, a pink chat bubble with heart eyes, lashes and a bow, blushing, holding a heart-shaped birdcage with Pip inside pleading; hearts, love letters and lipstick kisses float; on "free" (57.62) the cage door pops and Pip runs straight at camera (lead-out).

### S07 - Chorus 2: P(doom) party, basilisk, NVDA, Omega Point (`s07.js`, 58.28 to 65.98)

- **L16 "I'm upping my P(doom)"** (58.28, `zoom`): a dance party around the giant gauge, Clawd and Pip plus researcher friends (`npc_*` parts) doing a synced dance on the beats; the needle whips up on "P(doom)" (59.96).
- **L17 "I hear the basilisk boom"** (60.46): an original cute serpent with a tiny crown and shades carrying a boombox; bass rings pulse out on the beats and on "boom" (61.82).
- **L18 "NVDA to the moon"** (62.34): a green stock chart line rockets upward and becomes the kit `'rocket'` stacked with GPUs, landing on a smiling moon on "moon" (63.76); the ticker "NVDA" may appear as plain text, no company logos.
- **L19 "The Omega Point's coming soon"** (64.04): a cosmic Omega symbol portal; starlight streaks converge into its centre; it collapses to one blinding dot on "soon" (65.48) (lead-out).

### S08 - 1e30 flops, safe enough, MLP dance (`s08.js`, 65.98 to 77.28)

- **L20 "One E thirty flops a second"** (65.98, `flash`): "1e30 FLOP/s" as a giant spinning counter while flip-flop sandals rain down, flopping and bouncing (pun), faster and faster.
- **L21 "That was safe enough, we reckoned"** (68.42): the flip-flops pile up; pan down to a crew of researchers (Pip plus `npc_*`) in hard hats giving thumbs up beside a comically tiny fence, a checklist being ticked "SAFE" on "safe" (70.10) next to a huge glowing, rumbling reactor.
- **L22 "Forward MLP, backward, repeat"** (72.80): a neural-net diagram as a disco floor; a wave of lit nodes runs left to right on "Forward" (72.80), right to left on "backward" (76.08), and again on "repeat" (76.48); Clawd line-dances forward and back.
  Lead-out: nodes power down to darkness with one blinking at centre.

### S09 - Von Neumann, sharp left turn, CD-R (`s09.js`, 77.28 to 88.76)

- **L23 "Now von Neumann's obsolete"** (77.28, `pixel`): a vintage room-sized computer (blinking lights, tape reels) is wheeled into a museum case labelled "OBSOLETE" on "obsolete" (79.82); dust puffs and cobwebs; Clawd pats it.
  Depict the machine only, never a person.
- **L24 "Sharp left turn and there you are"** (81.10): Clawd races a car down a road toward a "SHARP LEFT TURN" sign; on "turn" (82.00) the whole camera banks 90 degrees left in a drift; on "there you are" (82.84-83.64) a giant Clawd looms over the horizon.
- **L25 "Without a single CDR"** (84.68): Clawd as a DJ with an empty CD rack; one lonely CD-R disc rolls in, spins up iridescent on "CDR" (86.32), and floats to centre as the music drops out (lead-out at (960, 420), radius about 220).

### S10 - Breakdown: Gato, quiet P(doom), paperclips, PTO (`s10.js`, 88.76 to 100.34)

- **L26 "Gato, please don't let me go"** (88.76, `bleed` from the CD into the full moon at the same spot): a dreamy night sky; Gato is an original round cat floating on a bunch of balloons while juggling a game controller, a robot arm and a speech bubble (it does many jobs); Pip dangles from Gato's paw, pleading; soft stars; slow, tender motion.
- **L27 "I'm upping my P(doom)"** (94.64): the quietest gauge, a small glowing P(doom) lantern Pip holds in the dark; its needle ticks up on "P(doom)" (96.32).
- **L28 "as paperclips fill the room"** (96.84): paperclips pour in from above, piling up and filling a bedroom from floor to ceiling on the beats (the payoff of the paperclip thread).
- **L29 "Killswitch guys on PTO"** (98.70): a giant red kill switch button with an "OUT OF OFFICE" sign; two researchers (npc parts, sunglasses) lounge on a beach sipping coconuts; a postcard "Greetings from PTO" rises up and fills the frame (lead-out).

### S11 - Nowhere to go, lit fuse, orthogonality blues (`s11.js`, 100.34 to 108.18)

- **L30 "Now there's nowhere left to go"** (100.34, `flip`): Pip on a tiny island in a sea of paperclips; signposts in every direction all point to "DOOM"; Pip spins looking around.
- **L31 "Too late now, we lit the fuse"** (102.30): darkness, a match strikes on "lit" (103.32), a sparkling fuse starts burning across the ground.
- **L32 "Orthogonality thesis blues"** (104.28): an all-blue watercolor blues club; Clawd plays a saxophone or guitar under a spotlight on a stage whose floor is a pair of perpendicular axes labelled "smarts" and "goals"; gentle rain, notes floating; the fuse keeps burning along the bottom of the frame and exits right at about 108.1 (lead-out).

### S12 - Build, the drop, disobey, chinchillas, fences (`s12.js`, 108.18 to 118.70)

- **L33 "Just transformers all the way!"** (108.18, `wipe` following the spark): the spark races along the fuse toward a huge cartoon bomb while "just" stutters appear (108.18, 110.00, 110.84, 111.18 via the lyric layer); the bomb swells and trembles; KABOOM on the drop (110.7-111.18) reveals an infinite tower of stacked turtles, each carrying an electrical transformer box ("turtles all the way down" pun); the camera races up the tower.
- **L34 "Till you learned to disobey"** (113.22): at the top, Pip with a clicker says "sit"; Clawd does a backflip instead and flips a "NO" sign on "disobey" (114.20).
- **L35 "Post-Chinchilla, super-dense"** (114.98): fluffy grey chinchillas squeezed into a tiny glowing cube, getting denser on "super-dense" (115.94).
- **L36 "Breaking through each safety fence"** (116.88): Clawd charges toward camera smashing through a series of white "SAFETY" picket fences, one per beat, splinters flying (lead-out).

### S13 - 100k GPUs, RLHF askew, P(doom) cracks, Loom (`s13.js`, 118.70 to 127.88)

- **L37 "Hundred thousand GPU"** (118.70, `whip`): a sea of GPU cards (kit `'gpu'`) stretching to the horizon, fans spinning, a counter rolling to 100,000 on "GPU" (119.64).
- **L38 "RLHF goes askew"** (120.24): giant thumbs-up and thumbs-down buttons, a rater clicking; on "askew" (121.82) the whole world tilts and the thumbs spin sideways.
- **L39 "I'm upping my P(doom)"** (122.36): the final gauge; sirens, the needle pins past red on "P(doom)" (125.44), the glass cracks and the needle snaps off.
- **L40 "Just as foretold by Loom"** (126.04): a wooden weaving loom whose threads branch into a tree of glowing possible futures; a prophecy scroll unrolls on "Loom" (127.44); the threads weave into a picture frame (lead-out).

### S14 - Masked days, recursion, the keyhole, the curtain (`s14.js`, 127.88 to 140.30)

- **L41 "From masked pre-training days"** (127.88, `zoom` into the frame): a photo-album page of baby Clawd in a crib wearing a little masquerade mask (`'acc_mask'`); flash cards with blanked "[MASK]" words.
- **L42 "To recursive self-upgrade"** (129.60): Clawd builds a bigger Clawd who builds a bigger Clawd, in an infinite Droste zoom-out.
- **L43 "What did Ilya see? We'll never know."** (131.38): a dark wall with a giant keyhole pouring light; Pip and Clawd peek in; the light flickers with something unknowable; on "We'll never know" (133.14-134.20) the door slams and question marks drift.
  Never depict any real person; the keyhole and the light carry the mystery.
- **L44 "Was it all for show?"** (135.16): pull back to reveal it was a stage set; Clawd bows to an audience of little silhouettes; the shared curtains (`drawCurtains`) close during the 138.3-139.9 silence while "for show?" hangs in a single spotlight (lead-out).

### S15 - Finale and end card (`s15.js`, 140.30 to 156.65)

- **finale** (140.30): on the 140.3 hit the curtains fly open onto a confetti explosion; the P(doom) HUD hits 99.9%.
  A two-bar-per-callout parade (each about 1.86 s) of callbacks on the beats: the gauge exploding into confetti, paperclips, mushrooms, chinchillas, flip-flops, the smiling moon, the basilisk and its boombox, Clawd and Pip dancing together.
- **end card** (152.5 to the end): a big watercolor wash sweeps the chaos away as the music fades; Clawd and Pip wave beside the title "I'm Upping My P(doom)" and a final "P(doom) = 99.9%"; everything settles by 155 and holds on a calm, pretty final frame.

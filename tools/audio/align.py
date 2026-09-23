# Step 2: align the Whisper words to the known lyric lines (lyrics.txt) with a sequence match.
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]  # repo root
WORK = ROOT / 'tools' / 'audio' / 'work'  # intermediate files (git-ignored)
WORK.mkdir(parents=True, exist_ok=True)
import json, re, difflib
r = json.load(open(WORK / "whisper.json"))
words=[]
for s in r["segments"]:
    for w in s.get("words",[]):
        if w["start"]>146: continue
        words.append((w["word"].strip(), w["start"], w["end"]))
def norm(t): return re.sub(r"[^a-z0-9]","",t.lower())
lines=[l.strip() for l in open(ROOT / "lyrics.txt") if l.strip()]
ltoks=[]; lidx=[]
for i,l in enumerate(lines):
    for t in l.split():
        n=norm(t)
        if n: ltoks.append(n); lidx.append(i)
wtoks=[norm(w[0]) for w in words]
sm=difflib.SequenceMatcher(None, ltoks, wtoks, autojunk=False)
m={}
for a,b,n in sm.get_matching_blocks():
    for k in range(n): m[a+k]=b+k
out=[]
for i,l in enumerate(lines):
    idxs=[j for j,x in enumerate(lidx) if x==i]
    hit=[m[j] for j in idxs if j in m]
    st = words[hit[0]][1] if hit else None
    en = words[hit[-1]][2] if hit else None
    # word timings for matched tokens
    wt=[]
    for j in idxs:
        if j in m: wt.append([ltoks[j], round(words[m[j]][1],2), round(words[m[j]][2],2)])
        else: wt.append([ltoks[j], None, None])
    out.append({"i":i,"text":l,"start":st and round(st,2),"end":en and round(en,2),"words":wt, "cov":f"{len(hit)}/{len(idxs)}"})
    print(f'{i:2d} {st or -1:7.2f} {en or -1:7.2f} {len(hit)}/{len(idxs)}  {l}')
json.dump(out, open(WORK / "lines.json","w"), indent=1)

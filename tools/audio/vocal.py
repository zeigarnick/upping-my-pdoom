# Step 4: re-transcribe the Demucs vocal stem and dump a 50 fps vocal-activity envelope,
# used to find true word onsets after instrumental gaps. Run separate.sh first.
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]  # repo root
WORK = ROOT / 'tools' / 'audio' / 'work'  # intermediate files (git-ignored)
WORK.mkdir(parents=True, exist_ok=True)
import mlx_whisper, json, librosa, numpy as np
v=str(WORK / "sep" / "htdemucs" / "pdoom" / "vocals.wav")
r = mlx_whisper.transcribe(v, path_or_hf_repo="mlx-community/whisper-large-v3-turbo", word_timestamps=True, language="en",
    initial_prompt="I'm upping my P(doom). AGI, shoggoth, shinigami, singularity, Sydney, basilisk, NVDA, Omega Point, von Neumann, CDR, Gato, paperclips, Chinchilla, RLHF, Loom, Ilya.")
json.dump(r, open(WORK / "whisper_vocals.json","w"), indent=1)
ws=[w for s in r["segments"] for w in s["words"]]
print(" ".join(f"{w['word'].strip()}@{w['start']:.2f}" for w in ws if w['start']<142))
y,sr=librosa.load(v,sr=22050)
hop=int(sr/50)
rms=librosa.feature.rms(y=y,frame_length=1024,hop_length=hop)[0]; rms/=rms.max()
json.dump([round(float(x),3) for x in rms], open(WORK / "vocal_rms50.json","w"))

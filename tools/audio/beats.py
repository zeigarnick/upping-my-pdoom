# Step 3: tempo, beat times and 30 fps energy envelopes (full, low band, high band) with librosa.
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]  # repo root
WORK = ROOT / 'tools' / 'audio' / 'work'  # intermediate files (git-ignored)
WORK.mkdir(parents=True, exist_ok=True)
import librosa, numpy as np, json
y, sr = librosa.load(str(ROOT / "pdoom.mp3"), sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
print("tempo", tempo, "nbeats", len(beats))
bt=np.array(beats); d=np.diff(bt); print("median ibi", np.median(d), "first beats", np.round(bt[:12],3))
rms = librosa.feature.rms(y=y, hop_length=512)[0]
t = librosa.times_like(rms, sr=sr, hop_length=512)
# per 1s energy
sec = [float(np.mean(rms[(t>=i)&(t<i+1)])) for i in range(int(t[-1])+1)]
mx=max(sec)
print(" ".join(f"{i}:{int(100*v/mx)}" for i,v in enumerate(sec)))
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
# energy envelope for visuals at 30 fps
hop = int(sr/30)
rms30 = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
rms30 = rms30/rms30.max()
# low band (kick) envelope
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = S[(freqs<150)].mean(axis=0); low=low/low.max()
high = S[(freqs>4000)].mean(axis=0); high=high/high.max()
json.dump({"tempo":float(np.atleast_1d(tempo)[0]),"beats":[round(float(b),3) for b in bt],
  "rms":[round(float(v),3) for v in rms30],"low":[round(float(v),3) for v in low],"high":[round(float(v),3) for v in high]}, open(WORK / "audio.json","w"))

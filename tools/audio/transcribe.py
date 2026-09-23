# Step 1: word-level transcription of the full mix with Whisper large-v3-turbo (mlx-whisper, Apple Silicon).
import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]  # repo root
WORK = ROOT / 'tools' / 'audio' / 'work'  # intermediate files (git-ignored)
WORK.mkdir(parents=True, exist_ok=True)
import mlx_whisper, json, sys
r = mlx_whisper.transcribe(str(ROOT / "pdoom.mp3"),
    path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
    word_timestamps=True, language="en",
    initial_prompt="I'm upping my P(doom). AGI, shoggoth, shinigami, singularity, Sydney, basilisk, NVDA, Omega Point, von Neumann, CDR, Gato, paperclips, Chinchilla, RLHF, Loom, Ilya.")
json.dump(r, open(WORK / "whisper.json","w"), indent=1)
for s in r["segments"]:
    print(f'{s["start"]:7.2f} {s["end"]:7.2f}  {s["text"]}')

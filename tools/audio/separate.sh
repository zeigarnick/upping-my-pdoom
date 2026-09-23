#!/bin/sh
# Split the song into vocals / accompaniment with Demucs (htdemucs), for vocal.py.
set -e
cd "$(dirname "$0")"
python -m demucs --two-stems=vocals -n htdemucs -o work/sep ../../pdoom.mp3

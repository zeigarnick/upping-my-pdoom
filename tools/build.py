#!/usr/bin/env python3
"""Bundle the video into one self-contained HTML file (scripts inlined, audio as a data URI).

usage: python3 tools/build.py [--artifact]
  default     -> dist/pdoom-video.html (full document, opens straight from disk)
  --artifact  -> dist/pdoom-artifact.html (no doctype/html/head/body; for publishing as an Artifact)
p5.js and p5.brush stay on their CDNs (cdnjs / jsdelivr); fonts load from Google Fonts.
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCENES = [f"s{i:02d}" for i in range(1, 16)]


def inline_js(path: pathlib.Path) -> str:
    code = path.read_text()
    # keep an inline script from closing early
    code = code.replace("</script", "<\\/script")
    return f"<script>\n/* {path.relative_to(ROOT)} */\n{code}\n</script>"


def main() -> None:
    artifact = "--artifact" in sys.argv
    html = (ROOT / "index.html").read_text()

    # local src/*.js -> inline
    def repl(m: re.Match) -> str:
        return inline_js(ROOT / m.group(1))

    html = re.sub(r'<script src="(src/[^"]+\.js)"></script>', repl, html)

    # dynamic scene loader -> all scene files inlined in order
    loader = re.search(r"<script>\s*// Scene files load in order.*?</script>", html, re.S)
    if not loader:
        sys.exit("scene loader block not found in index.html")
    scenes = "\n".join(inline_js(ROOT / "src" / "scenes" / f"{s}.js") for s in SCENES)
    html = html[: loader.start()] + scenes + html[loader.end():]

    # audio -> data URI
    mp3 = base64.b64encode((ROOT / "pdoom.mp3").read_bytes()).decode()
    html = html.replace('src="pdoom.mp3"', f'src="data:audio/mpeg;base64,{mp3}"')

    if artifact:
        # the Artifact publisher adds its own doctype, charset and viewport skeleton
        html = re.sub(r"^<!doctype html>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\"[^>]*>\n", "", html)

    out = ROOT / "dist" / ("pdoom-artifact.html" if artifact else "pdoom-video.html")
    out.parent.mkdir(exist_ok=True)
    out.write_text(html)
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size / 1048576:.1f} MB)")


if __name__ == "__main__":
    main()

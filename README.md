# Lean from the Base

A self-paced, offline-friendly course site for learning Lean 4 from the foundations —
with the long-term mission of proving and discovering mathematics independently.

- 🌐 Live site: **https://sfroment.github.io/lean-course/** — served from this repo via GitHub Pages (root = website root, source branch `course-site`; `main` is push-guarded for Sacha only)
- ✏️ `write.html` — Apple Pencil scratchpad: draw a symbol, get recognized candidates, insert into a Lean editor
- 📖 `lessons/` — pregenerated lessons, every Lean snippet machine-checked (`scripts/verify-lessons.py`)
- 🛠 `playground/` — a small Lean 4 lake project for hands-on practice (`lake env lean <file>.lean`)
- 🗺 See `ROADMAP.md` for the full curriculum, `MISSION.md` for the why, `RESOURCES.md` for sources

## 🔒 Protection

The site is gated by an access code (`gate.html`, checked by `assets/gate.js` before any page renders; pages are `noindex`). The code is stored only as a SHA-256 hash. Rotate it anytime:

```
python3 scripts/set-gate-code.py "new code"   # or no arg for a random one
```

This is client-side gating on a static site — it stops casual visitors and search engines, not a determined reader of the public repo. For hard protection: make the repo private (needs a paid GitHub plan for Pages), put it behind Cloudflare Access on a custom domain, or host it with basic auth (e.g. Koyeb).

## 📥 Review loop (your answers → my review → running your Lean)

Everything you do is stored on your device (localStorage): quiz answers + correctness, lessons marked done, pencil scratchpad. Press **⬇ Export my answers (JSON)** on the index or scratchpad, then drop the `lean-answers-*.json` in our chat or commit it under `my-data/`. The teacher then reviews your errors and runs your Lean for real in `playground/` (`lake env lean <file>`), writing notes under `reviews/`.

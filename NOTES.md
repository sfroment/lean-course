# NOTES (teacher scratchpad)

- Sacha wants the math rebuilt from absolute zero. His instinct: "it's not because I know Pythagoras that I don't need to prove it, right?" — correct. Every theorem gets proven from axioms; prior knowledge is a map, not a proof.
- Strong programmer (C, OCaml, Go, Rust, C++, Python, TS, bash + FP). Don't over-explain programming; spend the working memory on logic and math foundations.
- 5+ hours/week; motivation scales with enjoyment — end every session with one tangible win.
- Hands-on: he writes the Lean himself in `./playground/` (a small lake project, no mathlib yet — mathlib gets added when we start real math).
- Learning solo for now; Lean Zulip later when he wants community feedback.
- Quiz design: all answer options the same length, correct position varies per question, immediate feedback.
- Quick check loop for him: `cd playground && lake env lean Playground/Basic.lean` (see `lean-check` habits from other repos if useful).
- SITE: deployed at https://sfroment.github.io/lean-course/ (GitHub repo sfroment/lean-course, Pages source branch `course-site` — the pre-push guard blocks agents pushing to main). Root of this repo IS the website root. PWA: manifest + sw.js + apple-touch-icon; add to home screen on iOS. Scratchpad = write.html (assets/handwriting.js: point-cloud recognizer, ~110 glyphs; palette fallback; editor autosaves to localStorage).
- Pregeneration workflow: add lesson HTML to lessons/, register in lessons/manifest.json, run `python3 scripts/verify-lessons.py` (every ```lean block must compile under core Lean), then commit+push to course-site — Pages rebuilds in ~30s.
- Phase B+ will need mathlib in playground/ (lakefile dep) — not yet added.

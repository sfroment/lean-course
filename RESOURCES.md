# Lean 4 & Mathematics Resources

Curated, high-trust sources for the mission in [MISSION.md](./MISSION.md). Lessons cite from here, never from guesswork.

## Knowledge

- [Theorem Proving in Lean 4](https://leanprover.github.io/theorem_proving_in_lean4/) — the official free book on Lean itself: types, terms, tactics, and how the kernel checks proofs. **Use for:** the language and type theory, chapters 1–2 first.
- [Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/) — the official tutorial for math in Lean/mathlib. **Use for:** READING REFERENCE ONLY (structure, ideas, naming) — per LR-0002 we never `import Mathlib` in this workspace.
- [Natural Number Game](https://adam.math.hhu.de/) ([repo](https://github.com/leanprover-community/nng4)) — a game that teaches Lean proofs of elementary number-theory facts, one tactic at a time. **Use for:** playful tactic practice in the early weeks.
- [forall x: Calgary](https://forallx.openlogicproject.org/) — free, open formal-logic textbook (propositional and predicate logic, natural deduction, semantics). **Use for:** the logic *underneath* Lean — this is the "base" before types.
- [lean-lang.org/learn](https://lean-lang.org/learn/) — official index of Lean learning material. **Use for:** finding more when a topic needs it.
- [Mathlib4 docs](https://leanprover-community.github.io/mathlib4_docs/) and [repo](https://github.com/leanprover-community/mathlib4) — the existing library. **Use for:** READING ONLY — comparing our own proofs against theirs to learn approaches. Never imported here (LR-0002).
- [Category Theory for Programmers — Bartosz Milewski](https://github.com/hmemcpy/milewski-ctfp-pdf) — free book (official PDF source), rigorous but friendly. **Use for:** later, when we reach category theory.
- [Seven Sketches in Compositionality (Fong & Spivak)](https://arxiv.org/abs/1803.05316) — free applied category theory. **Use for:** later, alongside mathlib's category theory.

## Wisdom (Communities)

- [Lean Zulip](https://leanprover.zulipchat.com/) — the main community chat (`#beginners`, mathlib channels). **Use for:** when Sacha is ready to test his proofs against other humans and see how others formalize things. He is open to joining later; not now.
- [mathlib4 pull requests](https://github.com/leanprover-community/mathlib4/pulls) — real formalizations under review. **Use for:** seeing how professional math-in-Lean is written and critiqued.

## Gaps

- Free, rigorous-from-zero textbooks for abstract algebra and real analysis that match mathlib's development order — to be filled as we get there. Mathlib itself + Mathematics in Lean will carry most of it.

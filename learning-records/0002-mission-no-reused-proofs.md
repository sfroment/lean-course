# Mission refined: prove everything ourselves — no reused proofs, ever

Sacha clarified the mission: we do **not** want to reuse existing proofs (no `import Mathlib`); everything is proven by us, from the core Lean axioms. mathlib, Mathematics in Lean, and TPL4 remain *reading references* — we read them to learn approaches and compare, but all code in this workspace is ours.

## Implications

- `playground/` stays dependency-free permanently (lakefile has no mathlib); Phase B builds our own foundations library in pure core Lean (sets as `α → Prop`, relations, orders, …).
- The ▶ Run backend (Koyeb runner) is core-Lean-only, so it physically cannot import mathlib either — consistent by construction.
- When we later want to check our work against the real world, we do it by *reading* mathlib and discussing, not by importing.
- Review loop unchanged: export answers → I run the Lean → review notes under `reviews/`.

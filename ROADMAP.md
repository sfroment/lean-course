# Course roadmap

The full curriculum for the [mission](./MISSION.md). Lessons are pregenerated in
`lessons/` (see `lessons/manifest.json`); each one's Lean snippets are machine-checked
by `scripts/verify-lessons.py`. Phases A is pure core Lean — no mathlib download needed.
From phase B on, the playground gains a mathlib dependency and lessons follow
*Mathematics in Lean*.

## Phase A — Lean & logic from the base ✅ (generated, core-verified)

0001 What is a proof? What is Lean? · 0002 Functions and → · 0003 Implication ·
0004 ∧ and ∨ · 0005 ¬, False, classical logic · 0006 `decide` · 0007 `rw` and equality ·
0008 Nat and induction · 0009 Tactic toolkit (have, calc, apply, show, assumption)

## Phase B — Mathlib foundations (next)

- Setting up mathlib in the playground; `import Mathlib`
- MIL ch. 1–2: logic in mathlib, sets
- MIL ch. 3: functions and relations (`Function`, `Set`, injective/surjective/bijective)
- Orders, equivalence relations, quotients

## Phase C — Numbers

- Nat deep-dive, Int, divisibility, gcd, primes, modular arithmetic
- Rational numbers; the Natural Number Game as a side quest

## Phase D — Algebra

- Groups, subgroups, homomorphisms; rings and fields; linear algebra (vector spaces, matrices)

## Phase E — Analysis

- Real numbers from the base, limits, continuity, differentiation, integration

## Phase F — Geometry & topology

- Metric/topological spaces, compactness, connectedness

## Phase G — Category theory

- Categories, functors, natural transformations (Milewski + Fong & Spivak, see RESOURCES.md)

## Phase H — Discovery

- Original theorems proved by you, contributed back to mathlib

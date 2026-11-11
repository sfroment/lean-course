# Course roadmap

The full curriculum for the [mission](./MISSION.md). Lessons are pregenerated in
`lessons/` (see `lessons/manifest.json`); each one's Lean snippets are machine-checked
by `scripts/verify-lessons.py`. Phases A is pure core Lean — no mathlib download needed.
From phase B on, the playground stays pure core Lean — we build our own foundations
(no mathlib dependency, ever; see learning-records/0002). MIL/TPL4 are reading references.

## Phase A — Lean & logic from the base ✅ (generated, core-verified)

0001 What is a proof? What is Lean? · 0002 Functions and → · 0003 Implication ·
0004 ∧ and ∨ · 0005 ¬, False, classical logic · 0006 `decide` · 0007 `rw` and equality ·
0008 Nat and induction · 0009 Tactic toolkit (have, calc, apply, show, assumption)

## Phase B — Our own foundations (pure core Lean, NO mathlib) (next)

Per LR-0002 we never import existing proofs. The playground stays dependency-free;
mathlib/MIL/TPL4 are *reading references only*.

- Sets as predicates (`α → Prop`), membership, subset, union/intersection — our own lemmas
- Functions: injective/surjective/bijective, compositions, inverses — proved by us
- Relations, orders, equivalence relations, quotients — built from core
- Reading reference for structure/ideas only: MIL ch. 1–3, TPL4

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

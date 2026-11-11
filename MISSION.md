# Mission: Learn Lean 4 from the base, to prove and discover mathematics independently

## Why

Sacha wants to reach a level where he can formalize — prove and even *discover* — mathematics by himself in Lean 4. Not "call mathlib as a library", but understand the foundations deeply enough that new theorems are his to find. His own words capture the key insight: knowing a theorem (e.g. Pythagoras) is not the same as having its proof. In Lean, *everything* gets rebuilt and re-proven from axioms.

## Success looks like

- Reads and writes Lean 4 comfortably: terms, types, tactics, `example`s that compile
- Understands the logical foundations as formalized in Lean/mathlib: propositional and predicate logic, type theory, sets, functions, numbers
- Can state and prove theorems that are new *to him* — small at first, then real ones — without copying proofs
- Has built his **own library of proofs from core Lean** (his own "mini-mathlib" in `playground/`), covering logic, numbers, algebra, analysis… — never importing existing proofs
- Can discover: given a definition, explores its consequences and finds true statements worth proving
- Compares his proofs against mathlib/MIL **by reading only**, to learn different approaches — never by importing

## Constraints

- 5+ hours per week, enthusiasm-driven; each session should end with one tangible win
- Strong programmer (C, OCaml, Go, Rust, C++, Python, TypeScript, bash; functional programming experience) — programming-side concepts can move fast; math foundations move at their own pace
- Starts the math from nothing: even "well-known" results get re-proven, not assumed

## Out of scope (for now)

- **Reusing existing proofs — permanently, not just for now.** No `import Mathlib` in this workspace, ever. mathlib/MIL/TPL4 are reading references only (see learning-records/0002). The ▶ Run backend is core-Lean-only, so it physically cannot import mathlib.
- Community participation (Zulip) until later — he is open to joining when ready
- A single fixed end-goal theorem: the goal is the capability itself, across number theory, algebra, analysis, geometry/topology, and the foundations

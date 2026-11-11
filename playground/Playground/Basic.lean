-- Lesson 1 playground: your first Lean file.
-- From this directory (playground/), check it with:
--   lake env lean Playground/Basic.lean

#check 2 + 2 -- 2 + 2 : Nat
#eval 2 + 2 -- 4

-- A proof is a term whose type is the proposition:
example : 2 + 2 = 4 := rfl

example : True := trivial

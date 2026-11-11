/* Apple Pencil scratchpad: draw one symbol, get ranked candidates, tap to insert
 * the character into the Lean editor. Point-cloud recognizer (resample + normalize +
 * nearest prototype), no network, works fully offline.
 *
 * Glyph prototypes are authored as polylines in a unit box (x right, y down).
 * Add a glyph by appending to GLYPHS — the palette and recognizer pick it up.
 */
(function () {
  const GLYPHS = {
    /* digits */
    "0": { name: "zero", s: ["0.50,0.10 0.20,0.30 0.20,0.70 0.50,0.90 0.80,0.70 0.80,0.30 0.50,0.10"] },
    "1": { name: "one", s: ["0.30,0.25 0.55,0.10 0.55,0.90", "0.30,0.90 0.80,0.90"] },
    "2": { name: "two", s: ["0.20,0.25 0.50,0.10 0.75,0.25 0.75,0.45 0.25,0.90 0.80,0.90"] },
    "3": { name: "three", s: ["0.25,0.15 0.70,0.15 0.50,0.45 0.75,0.60 0.70,0.90 0.30,0.90"] },
    "4": { name: "four", s: ["0.60,0.90 0.60,0.10 0.15,0.60 0.85,0.60"] },
    "5": { name: "five", s: ["0.75,0.10 0.30,0.10 0.25,0.45 0.60,0.45 0.75,0.60 0.70,0.90 0.30,0.90"] },
    "6": { name: "six", s: ["0.70,0.15 0.40,0.10 0.25,0.40 0.25,0.70 0.50,0.90 0.75,0.75 0.70,0.50 0.45,0.55 0.30,0.45"] },
    "7": { name: "seven", s: ["0.20,0.10 0.80,0.10 0.45,0.90"] },
    "8": { name: "eight", s: ["0.50,0.08 0.28,0.25 0.28,0.42 0.50,0.50 0.72,0.42 0.72,0.25 0.50,0.08", "0.50,0.50 0.25,0.68 0.28,0.88 0.55,0.95 0.78,0.85 0.78,0.68 0.50,0.50"] },
    "9": { name: "nine", s: ["0.30,0.85 0.60,0.90 0.75,0.60 0.75,0.30 0.50,0.10 0.25,0.25 0.30,0.45 0.55,0.55 0.70,0.45"] },
    /* lowercase */
    "a": { name: "a", s: ["0.55,0.35 0.30,0.45 0.25,0.75 0.50,0.90 0.75,0.75 0.78,0.45", "0.78,0.35 0.78,0.90"] },
    "b": { name: "b", s: ["0.30,0.10 0.30,0.90", "0.30,0.45 0.60,0.35 0.75,0.50 0.60,0.80 0.30,0.75 0.30,0.50"] },
    "c": { name: "c", s: ["0.75,0.40 0.50,0.30 0.30,0.45 0.25,0.70 0.40,0.85 0.70,0.85"] },
    "d": { name: "d", s: ["0.70,0.10 0.70,0.90", "0.70,0.45 0.45,0.30 0.28,0.50 0.30,0.80 0.60,0.90 0.70,0.70"] },
    "e": { name: "e", s: ["0.30,0.55 0.70,0.55 0.75,0.40 0.50,0.30 0.30,0.45 0.25,0.75 0.45,0.90 0.75,0.85"] },
    "f": { name: "f", s: ["0.60,0.10 0.40,0.10 0.30,0.90", "0.20,0.40 0.55,0.40"] },
    "g": { name: "g", s: ["0.70,0.40 0.45,0.30 0.30,0.45 0.25,0.75 0.45,0.90 0.70,0.90 0.75,0.65 0.55,0.95 0.30,0.85"] },
    "h": { name: "h", s: ["0.30,0.10 0.30,0.90", "0.30,0.50 0.55,0.35 0.75,0.50 0.75,0.90"] },
    "i": { name: "i", s: ["0.50,0.35 0.50,0.90", "0.50,0.12 0.50,0.18"] },
    "j": { name: "j", s: ["0.55,0.35 0.55,0.85 0.40,0.95 0.25,0.90", "0.55,0.12 0.55,0.18"] },
    "k": { name: "k", s: ["0.30,0.10 0.30,0.90", "0.65,0.35 0.35,0.60 0.30,0.65", "0.40,0.55 0.70,0.90"] },
    "l": { name: "l", s: ["0.40,0.10 0.35,0.80 0.55,0.90"] },
    "m": { name: "m", s: ["0.25,0.90 0.25,0.40", "0.25,0.50 0.45,0.35 0.55,0.50 0.55,0.90", "0.55,0.50 0.70,0.35 0.78,0.50 0.78,0.90"] },
    "n": { name: "n", s: ["0.30,0.90 0.30,0.40", "0.30,0.50 0.50,0.35 0.70,0.50 0.70,0.90"] },
    "o": { name: "o", s: ["0.50,0.35 0.30,0.45 0.25,0.70 0.50,0.85 0.75,0.70 0.78,0.45 0.50,0.35"] },
    "p": { name: "p", s: ["0.30,0.35 0.30,0.95", "0.30,0.45 0.58,0.35 0.75,0.50 0.70,0.80 0.35,0.80 0.30,0.60"] },
    "q": { name: "q", s: ["0.70,0.35 0.70,0.95", "0.70,0.45 0.45,0.30 0.28,0.50 0.30,0.80 0.65,0.90 0.70,0.70"] },
    "r": { name: "r", s: ["0.30,0.90 0.30,0.40", "0.30,0.50 0.55,0.35 0.75,0.40"] },
    "s": { name: "s", s: ["0.70,0.35 0.45,0.30 0.30,0.45 0.45,0.55 0.70,0.65 0.55,0.85 0.30,0.90"] },
    "t": { name: "t", s: ["0.35,0.15 0.40,0.75 0.60,0.90", "0.20,0.35 0.65,0.35"] },
    "u": { name: "u", s: ["0.30,0.35 0.30,0.75 0.50,0.90 0.70,0.75 0.70,0.35"] },
    "v": { name: "v", s: ["0.25,0.35 0.50,0.90 0.75,0.35"] },
    "w": { name: "w", s: ["0.15,0.35 0.30,0.90 0.50,0.50 0.70,0.90 0.85,0.35"] },
    "x": { name: "x", s: ["0.25,0.35 0.75,0.90", "0.75,0.35 0.25,0.90"] },
    "y": { name: "y", s: ["0.25,0.35 0.50,0.70", "0.75,0.35 0.40,0.95 0.25,0.85"] },
    "z": { name: "z", s: ["0.25,0.35 0.75,0.35 0.25,0.90 0.75,0.90"] },
    /* uppercase */
    "A": { name: "A", s: ["0.20,0.90 0.50,0.10 0.80,0.90", "0.32,0.60 0.68,0.60"] },
    "B": { name: "B", s: ["0.30,0.10 0.30,0.90", "0.30,0.10 0.65,0.10 0.75,0.25 0.65,0.40 0.30,0.50", "0.30,0.50 0.70,0.50 0.80,0.70 0.65,0.90 0.30,0.90"] },
    "C": { name: "C", s: ["0.80,0.25 0.55,0.10 0.30,0.25 0.20,0.55 0.30,0.80 0.55,0.90 0.80,0.75"] },
    "D": { name: "D", s: ["0.30,0.10 0.30,0.90", "0.30,0.10 0.60,0.15 0.78,0.40 0.75,0.70 0.55,0.88 0.30,0.90"] },
    "E": { name: "E", s: ["0.75,0.10 0.25,0.10 0.25,0.90 0.75,0.90", "0.25,0.50 0.65,0.50"] },
    "F": { name: "F", s: ["0.75,0.10 0.25,0.10 0.25,0.90", "0.25,0.50 0.65,0.50"] },
    "G": { name: "G", s: ["0.80,0.25 0.55,0.10 0.30,0.25 0.20,0.55 0.30,0.80 0.55,0.90 0.78,0.65 0.55,0.65"] },
    "H": { name: "H", s: ["0.25,0.10 0.25,0.90", "0.75,0.10 0.75,0.90", "0.25,0.50 0.75,0.50"] },
    "I": { name: "I", s: ["0.50,0.10 0.50,0.90", "0.30,0.10 0.70,0.10", "0.30,0.90 0.70,0.90"] },
    "J": { name: "J", s: ["0.70,0.10 0.70,0.75 0.55,0.92 0.30,0.90"] },
    "K": { name: "K", s: ["0.25,0.10 0.25,0.90", "0.75,0.10 0.25,0.55", "0.45,0.45 0.78,0.90"] },
    "L": { name: "L", s: ["0.25,0.10 0.25,0.90 0.75,0.90"] },
    "M": { name: "M", s: ["0.20,0.90 0.20,0.10 0.50,0.55 0.80,0.10 0.80,0.90"] },
    "N": { name: "N", s: ["0.25,0.90 0.25,0.10 0.75,0.90 0.75,0.10"] },
    "O": { name: "O", s: ["0.50,0.10 0.20,0.30 0.20,0.70 0.50,0.90 0.80,0.70 0.80,0.30 0.50,0.10"] },
    "P": { name: "P", s: ["0.30,0.90 0.30,0.10 0.65,0.10 0.78,0.30 0.65,0.48 0.30,0.48"] },
    "Q": { name: "Q", s: ["0.50,0.10 0.20,0.30 0.20,0.70 0.50,0.90 0.80,0.70 0.80,0.30 0.50,0.10", "0.55,0.70 0.85,0.95"] },
    "R": { name: "R", s: ["0.30,0.90 0.30,0.10 0.65,0.10 0.78,0.30 0.65,0.48 0.30,0.48", "0.55,0.50 0.78,0.90"] },
    "S": { name: "S", s: ["0.75,0.10 0.30,0.10 0.25,0.45 0.60,0.45 0.75,0.60 0.70,0.90 0.30,0.90"] },
    "T": { name: "T", s: ["0.50,0.10 0.50,0.90", "0.20,0.10 0.80,0.10"] },
    "U": { name: "U", s: ["0.25,0.10 0.25,0.75 0.45,0.90 0.55,0.90 0.75,0.75 0.75,0.10"] },
    "V": { name: "V", s: ["0.20,0.10 0.50,0.90 0.80,0.10"] },
    "W": { name: "W", s: ["0.15,0.10 0.30,0.90 0.50,0.45 0.70,0.90 0.85,0.10"] },
    "X": { name: "X", s: ["0.25,0.10 0.75,0.90", "0.75,0.10 0.25,0.90"] },
    "Y": { name: "Y", s: ["0.20,0.10 0.50,0.50 0.80,0.10", "0.50,0.50 0.50,0.90"] },
    "Z": { name: "Z", s: ["0.25,0.10 0.75,0.10 0.25,0.90 0.75,0.90"] },
    /* greek lowercase */
    "α": { name: "alpha", s: ["0.70,0.90 0.45,0.60 0.25,0.70 0.35,0.90 0.65,0.85", "0.75,0.35 0.45,0.35 0.30,0.55 0.40,0.80 0.75,0.80"] },
    "β": { name: "beta", s: ["0.30,0.08 0.28,0.90", "0.30,0.30 0.60,0.25 0.75,0.40 0.70,0.60 0.45,0.62", "0.45,0.62 0.70,0.75 0.75,0.90 0.45,0.95 0.30,0.85"] },
    "γ": { name: "gamma", s: ["0.30,0.35 0.55,0.35 0.45,0.70 0.25,0.95 0.15,0.85"] },
    "δ": { name: "delta", s: ["0.70,0.08 0.55,0.90", "0.68,0.30 0.40,0.35 0.25,0.60 0.35,0.85 0.65,0.90 0.72,0.60"] },
    "ε": { name: "epsilon", s: ["0.70,0.55 0.30,0.55 0.28,0.40 0.50,0.30 0.75,0.45 0.85,0.75 0.70,0.88"] },
    "ζ": { name: "zeta", s: ["0.30,0.15 0.70,0.15 0.35,0.50 0.65,0.85 0.30,0.90"] },
    "η": { name: "eta", s: ["0.30,0.35 0.30,0.90", "0.30,0.55 0.50,0.35 0.72,0.45 0.70,0.90 0.45,0.95 0.30,0.85"] },
    "θ": { name: "theta", s: ["0.50,0.15 0.25,0.35 0.25,0.65 0.50,0.85 0.75,0.65 0.75,0.35 0.50,0.15", "0.20,0.50 0.80,0.50"] },
    "ι": { name: "iota", s: ["0.50,0.35 0.50,0.90", "0.50,0.12 0.50,0.18"] },
    "κ": { name: "kappa", s: ["0.30,0.35 0.30,0.90", "0.65,0.45 0.38,0.62 0.32,0.68", "0.42,0.58 0.70,0.90"] },
    "λ": { name: "lambda", s: ["0.40,0.10 0.20,0.90", "0.40,0.10 0.70,0.55 0.55,0.90"] },
    "μ": { name: "mu", s: ["0.30,0.35 0.30,0.95", "0.30,0.55 0.50,0.35 0.70,0.45 0.70,0.90 0.45,0.95 0.30,0.85"] },
    "ν": { name: "nu", s: ["0.25,0.35 0.50,0.90 0.75,0.35"] },
    "ξ": { name: "xi", s: ["0.30,0.15 0.70,0.15 0.40,0.45 0.65,0.60 0.35,0.85 0.70,0.90"] },
    "π": { name: "pi", s: ["0.20,0.35 0.80,0.35", "0.35,0.35 0.35,0.90", "0.65,0.35 0.65,0.90"] },
    "ρ": { name: "rho", s: ["0.30,0.35 0.30,0.95", "0.30,0.45 0.58,0.35 0.75,0.50 0.70,0.80 0.35,0.80 0.30,0.60"] },
    "σ": { name: "sigma", s: ["0.65,0.30 0.40,0.30 0.30,0.50 0.45,0.65 0.70,0.60 0.60,0.85 0.35,0.90"] },
    "τ": { name: "tau", s: ["0.30,0.15 0.75,0.15", "0.50,0.15 0.50,0.90"] },
    "υ": { name: "upsilon", s: ["0.30,0.35 0.30,0.75 0.50,0.90 0.70,0.75 0.70,0.35"] },
    "φ": { name: "phi", s: ["0.50,0.10 0.50,0.95", "0.50,0.30 0.25,0.40 0.22,0.65 0.40,0.85 0.75,0.80 0.78,0.55 0.55,0.30"] },
    "χ": { name: "chi", s: ["0.25,0.35 0.75,0.90", "0.75,0.35 0.25,0.90"] },
    "ψ": { name: "psi", s: ["0.50,0.10 0.50,0.95", "0.20,0.35 0.50,0.60 0.80,0.35", "0.80,0.35 0.50,0.60 0.20,0.35"] },
    "ω": { name: "omega", s: ["0.20,0.35 0.25,0.80 0.40,0.90 0.55,0.70 0.65,0.90 0.80,0.80 0.85,0.35"] },
    /* greek uppercase */
    "Γ": { name: "Gamma", s: ["0.70,0.10 0.25,0.10 0.25,0.90"] },
    "Δ": { name: "Delta", s: ["0.50,0.10 0.20,0.90 0.80,0.90 0.50,0.10"] },
    "Θ": { name: "Theta", s: ["0.50,0.10 0.20,0.30 0.20,0.70 0.50,0.90 0.80,0.70 0.80,0.30 0.50,0.10", "0.25,0.50 0.75,0.50"] },
    "Λ": { name: "Lambda", s: ["0.25,0.90 0.50,0.10 0.75,0.90"] },
    "Ξ": { name: "Xi", s: ["0.25,0.15 0.75,0.15", "0.30,0.50 0.70,0.50", "0.25,0.85 0.75,0.85"] },
    "Π": { name: "Pi", s: ["0.20,0.10 0.80,0.10", "0.35,0.10 0.35,0.90", "0.65,0.10 0.65,0.90"] },
    "Σ": { name: "Sigma", s: ["0.75,0.15 0.25,0.15 0.55,0.50 0.25,0.85 0.75,0.85"] },
    "Φ": { name: "Phi", s: ["0.50,0.10 0.20,0.30 0.20,0.70 0.50,0.90 0.80,0.70 0.80,0.30 0.50,0.10", "0.50,0.10 0.50,0.90"] },
    "Ψ": { name: "Psi", s: ["0.50,0.15 0.50,0.90", "0.20,0.15 0.50,0.50 0.80,0.15", "0.80,0.15 0.50,0.50 0.20,0.15"] },
    "Ω": { name: "Omega", s: ["0.50,0.10 0.30,0.15 0.22,0.45 0.35,0.75 0.65,0.75 0.78,0.45 0.85,0.20 0.65,0.10 0.35,0.10 0.50,0.10"] },
    /* symbols */
    "→": { name: "arrow →", s: ["0.10,0.50 0.90,0.50", "0.55,0.20 0.90,0.50 0.55,0.80"] },
    "←": { name: "arrow ←", s: ["0.90,0.50 0.10,0.50", "0.45,0.20 0.10,0.50 0.45,0.80"] },
    "↑": { name: "arrow ↑", s: ["0.50,0.90 0.50,0.10", "0.20,0.45 0.50,0.10 0.80,0.45"] },
    "↓": { name: "arrow ↓", s: ["0.50,0.10 0.50,0.90", "0.20,0.55 0.50,0.90 0.80,0.55"] },
    "↔": { name: "arrow ↔", s: ["0.10,0.50 0.90,0.50", "0.25,0.30 0.10,0.50 0.25,0.70", "0.75,0.30 0.90,0.50 0.75,0.70"] },
    "⇒": { name: "double arrow ⇒", s: ["0.10,0.40 0.90,0.40", "0.10,0.60 0.90,0.60", "0.60,0.25 0.90,0.50 0.60,0.75"] },
    "∧": { name: "and ∧", s: ["0.10,0.85 0.50,0.15 0.90,0.85"] },
    "∨": { name: "or ∨", s: ["0.10,0.15 0.50,0.85 0.90,0.15"] },
    "¬": { name: "not ¬", s: ["0.10,0.25 0.70,0.25 0.85,0.85"] },
    "=": { name: "equals =", s: ["0.15,0.40 0.85,0.40", "0.15,0.65 0.85,0.65"] },
    "≠": { name: "not equal ≠", s: ["0.15,0.40 0.85,0.40", "0.15,0.65 0.85,0.65", "0.20,0.85 0.80,0.20"] },
    "<": { name: "less <", s: ["0.70,0.15 0.25,0.50 0.70,0.85"] },
    ">": { name: "greater >", s: ["0.30,0.15 0.75,0.50 0.30,0.85"] },
    "≤": { name: "leq ≤", s: ["0.70,0.10 0.25,0.50 0.70,0.80", "0.20,0.90 0.80,0.90"] },
    "≥": { name: "geq ≥", s: ["0.30,0.10 0.75,0.50 0.30,0.80", "0.20,0.90 0.80,0.90"] },
    "+": { name: "plus +", s: ["0.50,0.15 0.50,0.85", "0.15,0.50 0.85,0.50"] },
    "−": { name: "minus −", s: ["0.15,0.50 0.85,0.50"] },
    "·": { name: "dot ·", s: ["0.48,0.48 0.52,0.52"] },
    "×": { name: "times ×", s: ["0.25,0.25 0.75,0.75", "0.75,0.25 0.25,0.75"] },
    "÷": { name: "divide ÷", s: ["0.15,0.50 0.85,0.50", "0.50,0.25 0.52,0.28", "0.50,0.75 0.48,0.72"] },
    "(": { name: "paren (", s: ["0.65,0.10 0.30,0.30 0.30,0.70 0.65,0.90"] },
    ")": { name: "paren )", s: ["0.35,0.10 0.70,0.30 0.70,0.70 0.35,0.90"] },
    "[": { name: "bracket [", s: ["0.70,0.10 0.35,0.10 0.35,0.90 0.70,0.90"] },
    "]": { name: "bracket ]", s: ["0.30,0.10 0.65,0.10 0.65,0.90 0.30,0.90"] },
    "{": { name: "brace {", s: ["0.65,0.10 0.40,0.15 0.40,0.35 0.60,0.50 0.40,0.65 0.40,0.85 0.65,0.90"] },
    "}": { name: "brace }", s: ["0.35,0.10 0.60,0.15 0.60,0.35 0.40,0.50 0.60,0.65 0.60,0.85 0.35,0.90"] },
    "|": { name: "bar |", s: ["0.50,0.10 0.50,0.90"] },
    "⊢": { name: "turnstile ⊢", s: ["0.40,0.10 0.40,0.90", "0.40,0.55 0.85,0.55"] },
    "∈": { name: "in ∈", s: ["0.60,0.20 0.25,0.55 0.60,0.90", "0.15,0.40 0.90,0.40", "0.15,0.65 0.90,0.65"] },
    "∉": { name: "not in ∉", s: ["0.60,0.20 0.25,0.55 0.60,0.90", "0.15,0.40 0.90,0.40", "0.15,0.65 0.90,0.65", "0.15,0.90 0.90,0.15"] },
    "⊆": { name: "subset ⊆", s: ["0.55,0.30 0.25,0.60 0.55,0.90", "0.20,0.88 0.85,0.88"] },
    "∪": { name: "union ∪", s: ["0.25,0.15 0.25,0.70 0.45,0.90 0.55,0.90 0.75,0.70 0.75,0.15"] },
    "∩": { name: "inter ∩", s: ["0.25,0.90 0.25,0.30 0.45,0.10 0.55,0.10 0.75,0.30 0.75,0.90"] },
    "∅": { name: "empty ∅", s: ["0.50,0.10 0.20,0.30 0.20,0.70 0.50,0.90 0.80,0.70 0.80,0.30 0.50,0.10", "0.20,0.85 0.80,0.15"] },
    "∞": { name: "infinity ∞", s: ["0.30,0.50 0.45,0.25 0.60,0.30 0.70,0.50 0.60,0.70 0.45,0.75 0.30,0.50"] },
    "∑": { name: "sum ∑", s: ["0.75,0.15 0.25,0.15 0.55,0.50 0.25,0.85 0.75,0.85"] },
    "∏": { name: "prod ∏", s: ["0.20,0.10 0.80,0.10", "0.35,0.10 0.35,0.90", "0.65,0.10 0.65,0.90"] },
    "√": { name: "sqrt √", s: ["0.15,0.60 0.35,0.85 0.50,0.50", "0.40,0.55 0.95,0.10"] },
    "∂": { name: "partial ∂", s: ["0.75,0.12 0.40,0.30 0.38,0.65 0.60,0.88 0.72,0.70", "0.30,0.40 0.55,0.15 0.78,0.40 0.68,0.80 0.40,0.92 0.20,0.70"] },
    "∇": { name: "nabla ∇", s: ["0.50,0.90 0.20,0.15 0.80,0.15 0.50,0.90"] },
    "°": { name: "degree °", s: ["0.40,0.40 0.60,0.45 0.60,0.65 0.40,0.70 0.30,0.60 0.35,0.45 0.40,0.40"] },
    "∀": { name: "forall ∀", s: ["0.25,0.85 0.50,0.15 0.75,0.85", "0.35,0.60 0.65,0.60"] },
    "∃": { name: "exists ∃", s: ["0.80,0.15 0.25,0.15 0.25,0.85 0.80,0.85", "0.25,0.50 0.70,0.50"] },
  };

  /* ---------- point-cloud recognizer ---------- */

  function parseStrokes(spec) {
    return spec.map((line) =>
      line.trim().split(/\s+/).map((p) => {
        const [x, y] = p.split(",");
        return { x: parseFloat(x), y: parseFloat(y) };
      })
    );
  }

  function strokeLength(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) {
      L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
    return L;
  }

  function resampleStroke(pts, n) {
    if (pts.length < 2 || n < 2) return pts.slice();
    const total = strokeLength(pts);
    if (total === 0) return pts.slice(0, 1);
    const step = total / (n - 1);
    const out = [pts[0]];
    let acc = 0;
    let prev = pts[0];
    for (let i = 1; i < pts.length; i++) {
      let d = Math.hypot(pts[i].x - prev.x, pts[i].y - prev.y);
      while (acc + d >= step && d > 0) {
        const t = (step - acc) / d;
        prev = { x: prev.x + t * (pts[i].x - prev.x), y: prev.y + t * (pts[i].y - prev.y) };
        out.push(prev);
        d = Math.hypot(pts[i].x - prev.x, pts[i].y - prev.y);
        acc = 0;
      }
      acc += d;
      prev = pts[i];
    }
    while (out.length < n) out.push(pts[pts.length - 1]);
    return out.slice(0, n);
  }

  function cloudFromStrokes(strokes, N) {
    const total = strokes.reduce((s, st) => s + strokeLength(st), 0);
    if (total === 0) return [];
    const cloud = [];
    for (const st of strokes) {
      const k = Math.max(2, Math.round((N * strokeLength(st)) / total));
      cloud.push(...resampleStroke(st, k));
    }
    return cloud;
  }

  function normalize(cloud) {
    if (!cloud.length) return cloud;
    let cx = 0, cy = 0, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (const p of cloud) {
      cx += p.x; cy += p.y;
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    cx /= cloud.length; cy /= cloud.length;
    const s = Math.max(maxX - minX, maxY - minY) || 1;
    return cloud.map((p) => ({ x: (p.x - cx) / s, y: (p.y - cy) / s }));
  }

  function cloudDist(a, b) {
    const n = Math.min(a.length, b.length);
    let s = 0;
    for (let i = 0; i < n; i++) {
      const dx = a[i].x - b[i].x, dy = a[i].y - b[i].y;
      s += dx * dx + dy * dy;
    }
    return Math.sqrt(s / n);
  }

  const PROTOS = Object.entries(GLYPHS).map(([ch, g]) => ({
    ch, name: g.name, cloud: normalize(cloudFromStrokes(parseStrokes(g.s), 64)),
  }));

  function recognize(strokes) {
    const cloud = normalize(cloudFromStrokes(strokes, 64));
    if (!cloud.length) return [];
    return PROTOS.map((p) => ({ ch: p.ch, name: p.name, score: cloudDist(cloud, p.cloud) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }

  /* ---------- pad UI ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("pad");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const hint = document.getElementById("pad-hint");
    const cands = document.getElementById("candidates");
    const palette = document.getElementById("palette");
    const editor = document.getElementById("scratch");
    const EDITOR_KEY = "lean-course-scratch";

    let strokes = [];
    let current = null;
    let timer = null;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }

    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function drawStroke(st, width) {
      if (st.length < 2) {
        ctx.beginPath();
        ctx.arc(st[0].x, st[0].y, width / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1d23";
        ctx.fill();
        return;
      }
      ctx.strokeStyle = "#1a1d23";
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(st[0].x, st[0].y);
      for (let i = 1; i < st.length - 1; i++) {
        const mx = (st[i].x + st[i + 1].x) / 2;
        const my = (st[i].y + st[i + 1].y) / 2;
        ctx.quadraticCurveTo(st[i].x, st[i].y, mx, my);
      }
      ctx.lineTo(st[st.length - 1].x, st[st.length - 1].y);
      ctx.stroke();
    }

    function redraw() {
      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      for (const st of strokes) drawStroke(st, 3);
      if (current) drawStroke(current, 3);
      if (hint) hint.classList.toggle("hidden", strokes.length > 0 || current);
    }

    function scheduleRecognize() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!strokes.length) return;
        const res = recognize(strokes);
        cands.innerHTML = "";
        res.forEach((c, i) => {
          const b = document.createElement("button");
          b.className = "cand" + (i === 0 ? " best" : "");
          b.innerHTML = `${escapeHtml(c.ch)}<small>${escapeHtml(c.name)}</small>`;
          b.title = `insert ${c.ch}`;
          b.addEventListener("click", () => insert(c.ch));
          cands.appendChild(b);
        });
      }, 280);
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    function insert(ch) {
      const pos = editor.selectionStart ?? editor.value.length;
      editor.value = editor.value.slice(0, pos) + ch + editor.value.slice(editor.selectionEnd ?? pos);
      editor.selectionStart = editor.selectionEnd = pos + ch.length;
      editor.focus();
      localStorage.setItem(EDITOR_KEY, editor.value);
      strokes = [];
      cands.innerHTML = "";
      redraw();
    }

    canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" && e.isPrimary === false) return; // let Pencil win, ignore palm
      canvas.setPointerCapture(e.pointerId);
      current = [toLocal(e)];
      e.preventDefault();
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!current) return;
      const evts = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evts) current.push(toLocal(ev));
      redraw();
      e.preventDefault();
    });
    function endStroke(e) {
      if (!current) return;
      if (current.length > 1) strokes.push(current);
      else if (current.length === 1) strokes.push(current); // dot
      current = null;
      redraw();
      scheduleRecognize();
    }
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);

    document.getElementById("undo").addEventListener("click", () => {
      strokes.pop();
      redraw();
      scheduleRecognize();
    });
    document.getElementById("clear-pad").addEventListener("click", () => {
      strokes = []; current = null; cands.innerHTML = "";
      redraw();
    });
    document.getElementById("copy").addEventListener("click", async (e) => {
      const btn = e.target;
      try {
        await navigator.clipboard.writeText(editor.value);
        btn.textContent = "Copied ✓";
      } catch {
        editor.select();
        document.execCommand("copy");
        btn.textContent = "Copied ✓";
      }
      setTimeout(() => (btn.textContent = "Copy code"), 1500);
    });
    document.getElementById("clear-editor").addEventListener("click", () => {
      editor.value = "";
      localStorage.removeItem(EDITOR_KEY);
      editor.focus();
    });

    editor.value = localStorage.getItem(EDITOR_KEY) || defaultTemplate();
    editor.addEventListener("input", () => localStorage.setItem(EDITOR_KEY, editor.value));

    function defaultTemplate() {
      return [
        "-- ✏️ Pencil scratchpad — draw a symbol on the pad, tap a candidate to insert it.",
        "-- When ready: save as e.g. playground/MyScratch.lean and run:",
        "--   cd playground && lake env lean MyScratch.lean",
        "",
        "example : 2 + 2 = 4 := by",
        "  decide",
        "",
      ].join("\n");
    }

    // palette: every supported glyph is tappable even if recognition misses
    for (const ch of Object.keys(GLYPHS)) {
      const b = document.createElement("button");
      b.textContent = ch;
      b.title = GLYPHS[ch].name;
      b.addEventListener("click", () => insert(ch));
      palette.appendChild(b);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  });
})();

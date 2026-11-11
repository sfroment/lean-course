#!/usr/bin/env python3
"""Generate the PWA icons: indigo rounded square with a white lambda stroke."""
import pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS = ROOT / "icons"
ICONS.mkdir(exist_ok=True)

BG = (79, 70, 168)      # --accent #4f46a8
FG = (253, 252, 249)    # --paper


def draw_lambda(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = size // 8  # margin
    r = size // 5  # corner radius
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)
    w = max(2, size // 22)  # stroke width
    # lambda: left leg + right leg (two strokes through a shoulder point)
    shoulder = (size * 0.42, size * 0.24)
    d.line([shoulder, (size * 0.22, size * 0.82)], fill=FG, width=w, joint="curve")
    d.line([shoulder, (size * 0.72, size * 0.55), (size * 0.52, size * 0.82)],
           fill=FG, width=w, joint="curve")
    return img


for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)]:
    draw_lambda(size).save(ICONS / name)
    print("wrote", ICONS / name)

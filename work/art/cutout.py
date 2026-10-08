import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB"); a = np.asarray(im).astype(np.float32)
h, w, _ = a.shape
# background colour = median of a border strip
border = np.concatenate([a[:8].reshape(-1,3), a[-8:].reshape(-1,3), a[:, :8].reshape(-1,3), a[:, -8:].reshape(-1,3)])
bg = np.median(border, 0)
dist = np.sqrt(((a - bg) ** 2).sum(-1))
cand = dist < (float(sys.argv[3]) if len(sys.argv) > 3 else 28)
chroma = a.max(-1) - a.min(-1); lum = a.mean(-1)
ys_ = np.arange(h)[:, None] * np.ones((1, w))
# soft grey contact shadow: only near the floor (bottom part of the figure's bounding box)
fg0 = dist > 60; rows = np.where(fg0[:, 8:-8].sum(1) > 3)[0]
top, bot = rows.min(), rows.max(); ycut = top + 0.75 * (bot - top)
cand |= (chroma < 9) & (lum > 120) & (lum < bg.mean() + 6) & (ys_ > ycut)
# also treat soft shadow (low-sat, close-ish greys, darker) near bg as bg candidates? keep only connected-to-border region
lab, n = ndimage.label(cand)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgmask = np.isin(lab, list(edge))
fg = ~bgmask
fg = ndimage.binary_opening(fg, iterations=1)
lowband = ys_ > ycut
fg = np.where(lowband, ndimage.binary_opening(fg, structure=np.ones((17, 17))), fg)
# keep the largest components (characters); drop tiny specks
lab2, n2 = ndimage.label(fg)
sizes = ndimage.sum(fg, lab2, range(1, n2 + 1))
keep = [i + 1 for i, s in enumerate(sizes) if s > 0.08 * sizes.max()]
fg = np.isin(lab2, keep)
fg = ndimage.binary_fill_holes(fg) if "--fill" in sys.argv else fg
alpha = ndimage.gaussian_filter(fg.astype(np.float32), 0.8)
alpha = np.clip((alpha - 0.1) / 0.8, 0, 1)
ys, xs = np.where(fg); pad = 6
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, h); x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, w)
rgba = np.dstack([a, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
out = Image.fromarray(rgba)
if out.height > 512:
    out = out.resize((round(out.width * 512 / out.height), 512), Image.LANCZOS)
q = out.quantize(colors=255, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)
q.save(dst, optimize=True)
import os; print(dst, out.size, os.path.getsize(dst), "bg", bg.round())

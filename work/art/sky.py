import sys, numpy as np, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
im = im.resize((2048, round(im.height * 2048 / im.width)), Image.LANCZOS)
a = np.asarray(im).astype(np.float32); h, w, _ = a.shape
# seamless: crossfade the outer 10% band. take the strip of width b at the right, blend with the left start
b = int(w * 0.10)
L = a[:, :b].copy(); R = a[:, w - b:].copy()
t = np.linspace(0, 1, b)[None, :, None]
# new image: drop the right band, the left band becomes a blend from R (t=0) to L (t=1)
new = a[:, : w - b].copy()
new[:, :b] = R * (1 - t) + L * t
out = Image.fromarray(new.clip(0, 255).astype(np.uint8)).resize((2048, h), Image.LANCZOS)
for q in (82, 78, 74, 70):
    out.save(dst, quality=q, optimize=True, progressive=True)
    if os.path.getsize(dst) < 450_000: break
o = np.asarray(out).astype(np.float32)
print(dst, out.size, os.path.getsize(dst), "q", q, "edge diff", float(np.abs(o[:, 0] - o[:, -1]).mean()))

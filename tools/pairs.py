#!/usr/bin/env python3
"""pairs.py <outdir> <keyfile> --mine a.png b.png ... --ref x.png y.png ... [--crop]
Builds blind pairs: each mine[i] beside ref[i % len(ref)], sides shuffled, both at 844 px tall (portrait strip; --crop
centre-crops landscape refs to 390:844). Writes outdir/pair_NN.png and the key (which side is ours) to keyfile."""
import sys, os, json, random
from PIL import Image, ImageDraw
a = sys.argv[1:]; out, keyf = a[0], a[1]
mine = a[a.index('--mine') + 1:a.index('--ref')]; rest = a[a.index('--ref') + 1:]
crop = '--crop' in rest; ref = [x for x in rest if not x.startswith('--')]
os.makedirs(out, exist_ok=True); H = 844; W = 390
def prep(p):
    im = Image.open(p).convert('RGB'); w, h = im.size
    if w / h > W / H:   # too wide: centre-crop to the portrait strip
        nw = int(h * W / H); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    return im.resize((W, H), Image.LANCZOS)
key = {}
random.seed()
for i, m in enumerate(mine):
    r = ref[i % len(ref)]; ours_left = random.random() < 0.5
    L, R = (prep(m), prep(r)) if ours_left else (prep(r), prep(m))
    S = Image.new('RGB', (W * 2 + 24, H + 40), (24, 24, 28)); S.paste(L, (0, 40)); S.paste(R, (W + 24, 40))
    d = ImageDraw.Draw(S); d.text((W // 2 - 4, 12), 'A', fill=(255, 255, 255)); d.text((W + 24 + W // 2 - 4, 12), 'B', fill=(255, 255, 255))
    name = f'pair_{i + 1:02d}.png'; S.save(os.path.join(out, name))
    key[name] = {'ours': 'A' if ours_left else 'B', 'mine': m, 'ref': r}
json.dump(key, open(keyf, 'w'), indent=1); print(len(mine), 'pairs ->', out)

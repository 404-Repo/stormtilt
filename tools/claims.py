#!/usr/bin/env python3
"""STORMTILT (yacht jousting): measure the concept-frame claims (ref/CLAIMS.md) on any png/jpg or directory of them.

Every frame is centre-cropped to the 390:844 portrait shape the game is played at and resampled to
390x844 before anything is measured. Statistics are taken inside the band y = 6%..86% of the frame so
the HUD strips at the top and the tower tray at the bottom do not enter them (full width is kept).

Usage:  python3 tools/claims.py <png|dir> [<png|dir> ...] [--json out.json] [--quiet]
Prints one row per frame (PASS/fail per claim) and a JSON blob (to stdout, or to --json).
"""
import sys, os, json, glob
import numpy as np
from PIL import Image
from scipy import ndimage

W, H = 390, 844
BAND = (0.06, 0.86)          # vertical measurement band, fractions of frame height

# name: (direction, threshold, short description). direction '>=' or '<='.
CLAIMS = {
    "C1_surface_detail":  (">=", 38.0,  "mean Sobel gradient magnitude of luma (0..255 scale) in the band: modelled, textured surfaces"),
    "C2_flat_share":      ("<=", 0.52,  "share of band pixels in flat patches (7x7 luma std < 2.0 at 390 px)"),
    "C3_highlights":      (">=", 0.012, "share of band pixels with luma >= 225: specular glints, foam and spray read as near-white"),
    "C4_foam_cream":      (">=", 0.030, "share of band pixels that are cream-white (HSV S <= 0.30 and V >= 0.80): foam, spray, sails in light"),
    "C5_value_range":     (">=", 195,   "luma p98 minus p2 in the band (0..255): real highlights and real shadows"),
    "C6_saturated_share": (">=", 0.22,  "share of band pixels with HSV saturation >= 0.35 and value >= 0.25 (guard: never a grey state)"),
}

def load(path):
    im = Image.open(path).convert("RGB"); w, h = im.size
    tgt = W / H
    if w / h > tgt:                       # too wide: crop width
        nw = round(h * tgt); x0 = (w - nw) // 2; im = im.crop((x0, 0, x0 + nw, h))
    else:                                 # too tall: crop height
        nh = round(w / tgt); y0 = (h - nh) // 2; im = im.crop((0, y0, w, y0 + nh))
    return np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255.0

def hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1); d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    h = np.zeros_like(mx); m = d > 1e-6
    rr = m & (mx == r); gg = m & (mx == g) & ~rr; bb = m & ~rr & ~gg
    h[rr] = ((g - b)[rr] / d[rr]) % 6; h[gg] = (b - r)[gg] / d[gg] + 2; h[bb] = (r - g)[bb] / d[bb] + 4
    return h * 60.0, s, mx

def measure(path):
    a = load(path)
    y0, y1 = int(BAND[0] * H), int(BAND[1] * H); band = a[y0:y1]
    h, s, v = hsv(band)
    luma = (0.2126 * band[..., 0] + 0.7152 * band[..., 1] + 0.0722 * band[..., 2]) * 255
    sat = (s >= 0.35) & (v >= 0.25)
    out = {}
    sx = ndimage.sobel(luma, 0); sy = ndimage.sobel(luma, 1)
    out["C1_surface_detail"] = float(np.hypot(sx, sy).mean())
    mu = ndimage.uniform_filter(luma, 7); mu2 = ndimage.uniform_filter(luma * luma, 7)
    std = np.sqrt(np.maximum(mu2 - mu * mu, 0))
    out["C2_flat_share"] = float((std < 2.0).mean())
    out["C3_highlights"] = float((luma >= 225).mean())
    out["C4_foam_cream"] = float(((s <= 0.30) & (v >= 0.80)).mean())
    out["C5_value_range"] = float(np.percentile(luma, 98) - np.percentile(luma, 2))
    out["C6_saturated_share"] = float(sat.mean())
    out["pass"] = {k: (out[k] >= t if d == ">=" else out[k] <= t) for k, (d, t, _) in CLAIMS.items()}
    return out

def collect(args):
    files = []
    for p in args:
        if os.path.isdir(p):
            files += sorted(f for f in glob.glob(os.path.join(p, "*")) if f.lower().endswith((".png", ".jpg", ".jpeg")))
        else:
            files.append(p)
    return files

def main():
    argv = sys.argv[1:]; jout = None; quiet = "--quiet" in argv
    argv = [x for x in argv if x != "--quiet"]
    if "--json" in argv:
        i = argv.index("--json"); jout = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    if not argv:
        print(__doc__); sys.exit(1)
    rows = {f: measure(f) for f in collect(argv)}
    keys = list(CLAIMS)
    hdr = f"{'frame':34s} " + " ".join(f"{k.split('_')[0]:>8s}" for k in keys) + "  pass"
    print("thresholds: " + "  ".join(f"{k.split('_')[0]} {d}{t}" for k, (d, t, _) in CLAIMS.items()))
    print(hdr)
    for f, r in rows.items():
        cells = []
        for k in keys:
            v = r[k]; s = f"{v:.0f}" if k in ("C1_surface_detail", "C5_value_range") else f"{v:.3f}"
            cells.append(f"{s + ('' if r['pass'][k] else '*'):>8s}")
        print(f"{os.path.basename(f)[:34]:34s} " + " ".join(cells) + f"  {sum(r['pass'].values())}/{len(keys)}")
    print("(* = fails the claim)")
    blob = {"size": [W, H], "band": BAND,
            "claims": {k: {"dir": d, "threshold": t, "what": w} for k, (d, t, w) in CLAIMS.items()},
            "frames": rows}
    if jout:
        json.dump(blob, open(jout, "w"), indent=1)
    elif not quiet:
        print(json.dumps(blob))

if __name__ == "__main__":
    main()

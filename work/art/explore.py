import sys, glob, numpy as np
sys.path.insert(0,'tools'); import claims as C
from scipy import ndimage
def m(f):
    a=C.load(f); y0,y1=int(.06*844),int(.86*844); b=a[y0:y1]
    h,s,v=C.hsv(b); L=(0.2126*b[...,0]+0.7152*b[...,1]+0.0722*b[...,2])*255
    sx=ndimage.sobel(L,0); sy=ndimage.sobel(L,1); g=np.hypot(sx,sy)
    sat=(s>=.35)&(v>=.3)
    warm=((h<70)|(h>=345))&sat; cool=(h>=150)&(h<290)&sat
    hl=(L>=225).mean(); foam=((s<=.3)&(v>=.8)).mean()
    # hue entropy over 12 bins of saturated px
    hh=np.histogram(h[sat],bins=12,range=(0,360))[0]; p=hh/hh.sum(); ent=-(p[p>0]*np.log2(p[p>0])).sum()
    # fine detail: luma minus 3px blur, abs mean
    fine=np.abs(L-ndimage.gaussian_filter(L,1.5)).mean()
    # central third saliency: contrast of centre column vs whole
    lower=b[int(.45*b.shape[0]):]; hl_,sl,vl=C.hsv(lower)
    sea=((hl_>=150)&(hl_<200)&(sl>=.3)).mean()
    return dict(grad=g.mean(),fine=fine,hl=hl,foam=foam,warm=warm.mean(),cool=cool.mean(),mn=min(warm.mean(),cool.mean()),ent=ent,sea=sea,
      p2=np.percentile(L,2),p98=np.percentile(L,98),dark=(L<30).mean())
for f in sorted(glob.glob('ref/concept/*.png'))+sorted(glob.glob('floor/_frames/*.png')):
    r=m(f); print(f.split('/')[-1][:14].ljust(14),' '.join(f'{k}={v:.3f}' if v<10 else f'{k}={v:.0f}' for k,v in r.items()))

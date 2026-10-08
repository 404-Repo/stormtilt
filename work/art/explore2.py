import sys, glob, numpy as np
sys.path.insert(0,'tools'); import claims as C
def m(f):
    a=C.load(f); y0,y1=int(.06*844),int(.86*844); b=a[y0:y1]
    h,s,v=C.hsv(b)
    sat=(s>=.35)&(v>=.3)
    warm=((h<70)|(h>=340))&sat; cool=(h>=120)&(h<300)&sat
    lo=slice(int(.45*b.shape[0]),None)
    grey=((s[lo]<0.18)&(v[lo]>0.2)&(v[lo]<0.8)).mean()
    sig=(s>=.6)&(v>=.45)
    red=sig&((h<15)|(h>=345)); yel=sig&(h>=38)&(h<60); blu=sig&(h>=205)&(h<240); orange=sig&(h>=15)&(h<38)
    return dict(warm=warm.mean(),cool=cool.mean(),grey_lo=grey,red=red.mean(),yel=yel.mean(),blu=blu.mean(),org=orange.mean(),signal=(red|yel|blu).mean())
for f in sorted(glob.glob('ref/concept/*.png'))+sorted(glob.glob('floor/_frames/*.png')):
    r=m(f); print(f.split('/')[-1][:14].ljust(14),' '.join(f'{k}={v:.3f}' for k,v in r.items()))

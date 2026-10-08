#!/usr/bin/env python3
# sheet.py out.jpg img1 img2 ... [--w 260]  : contact sheet, 4 per row
import sys
from PIL import Image
args=[a for a in sys.argv[1:] if not a.startswith('--')]; w=260
for a in sys.argv:
    if a.startswith('--w='): w=int(a[4:])
out,ims=args[0],[Image.open(p).convert('RGB') for p in args[1:]]
ims=[im.resize((w,int(im.height*w/im.width))) for im in ims]
cols=min(4,len(ims)); rows=(len(ims)+cols-1)//cols; h=max(i.height for i in ims)
S=Image.new('RGB',(cols*w,rows*h),(0,0,0))
for i,im in enumerate(ims): S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(out,quality=85)

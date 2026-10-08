import sys, subprocess, numpy as np, os
src, dst = sys.argv[1], sys.argv[2]; X = 1.2
raw = subprocess.run(["ffmpeg","-nostdin","-loglevel","error","-i",src,"-f","f32le","-ac","2","-ar","44100","-"],capture_output=True).stdout
a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy(); sr = 44100
win = int(0.05*sr); n = len(a)//win
rms = np.sqrt((a[:n*win]**2).mean(1).reshape(n, win).mean(1)); db = 20*np.log10(rms+1e-9)
thr = db.max() - 24
last = np.where(db > thr)[0].max(); first = np.where(db > thr)[0].min()
T = a[first*win:(last+1)*win]
x = int(X*sr); L = len(T)
t = np.linspace(0, 1, x)[:, None]
fade = T[L-x:]*np.cos(t*np.pi/2) + T[:x]*np.sin(t*np.pi/2)   # equal-power crossfade tail -> head
out = np.concatenate([T[x:L-x], fade])
p = subprocess.run(["ffmpeg","-nostdin","-y","-loglevel","error","-f","f32le","-ac","2","-ar","44100","-i","-","-b:a","96k",dst],input=out.astype(np.float32).tobytes())
print(os.path.basename(dst), "content", round(L/sr,2), "loop", round(len(out)/sr,2), "trim head", round(first*win/sr,2), "tail cut", round(len(a)/sr-(last+1)*win/sr,2))

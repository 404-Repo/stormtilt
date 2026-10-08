import subprocess, os, json, glob
O="/Users/atlas/astrocade-game7/game/audio"
exec(open("/Users/atlas/astrocade-game7/work/art/run_audio.py").read().split("def run")[0])  # loads M, jobs
P={}
names={"a01_title":("music_title","sfx_lance_crack"),"a02_regatta":("music_regatta","sfx_body_thud"),"a03_thunder":("music_thunder","sfx_splash"),
"a04_gale":("music_gale","sfx_thunder"),"a05_rogue":("music_rogue","sfx_charge"),"a06_boss":("music_boss","sfx_wave_crash"),
"a07_victory":("sting_victory","sfx_wind_gust"),"a08_defeat":("sting_defeat","sfx_crowd_cheer"),"a09_horn":("sting_start","sfx_horn"),
"a10_gull":("sting_hit","sfx_gull"),"a11_sail":("sting_charge","sfx_sail_flap"),"a12_bonk":("sting_comic","sfx_bonk")}
rows=[]
for l,sp,ss,mp,ms in jobs:
    mn,sn=names[l]
    for fn,pr,req,kind in ((mn,mp.replace(M,""),ms,"music"),(sn,sp,ss,"sfx")):
        f=f"{O}/{fn}.mp3"
        if os.path.exists(f):
            d=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
            rows.append(f"| `{fn}.mp3` | {kind} | {d:.2f} s | {os.path.getsize(f)//1024} KB | {req:g} s | {pr} |")
        else:
            rows.append(f"| `{fn}.mp3` | {kind} | MISSING | | {req:g} s | {pr} |")
tot=sum(os.path.getsize(f) for f in glob.glob(O+"/*.mp3"))
md=f"""# STORMTILT audio

Generated 2026-10-08 with Atlas audio (`tools/atlas_audio.py`: ElevenLabs SFX v2 + MiniMax Music 3 instrumental,
one SFX and one music take per call). Raw takes: `work/art/audio_raw/`. Conversion: `work/art/convert_audio.sh`
(music: loudnorm to -16 LUFS, stereo MP3 96 kbps; SFX: leading and trailing silence trimmed, loudnorm -14 LUFS,
mono MP3 96 kbps) and `work/art/loopify.py` for the four music loops (head and tail trimmed to the music, then
the last 1.2 s equal-power crossfaded into the first 1.2 s, so the file loops without a gap).

Total: {tot/1e6:.2f} MB ({len(glob.glob(O+'/*.mp3'))} files).

Every music prompt began with the shared preamble: "{M.strip()}"

**Music is short.** 60 s was requested for every loop, but the service returned 17.5 to 19.9 s takes, so the
loops are about 15 s after looping. Loop the file (`audio.loop = true`); expect audible repetition in a long
match. The seamless joins are made by script and not listened to by a human.

| file | kind | duration | size | requested | prompt (after the preamble for music) |
|---|---|---|---|---|---|
""" + "\n".join(rows) + """

Notes
- `sting_start`, `sting_hit`, `sting_charge`, `sting_comic` are extra music stings from calls made for the
  short SFX (each call returns a music take anyway): round start, clean hit, charged lance, comic pratfall.
- Missing files are listed as MISSING above (Atlas call failed with a connection reset after 18 min and the
  budget did not allow a second retry). Stand-ins: use `music_gale` for Rogue Deep, `sting_charge` plus
  `sfx_thunder` at low volume for the lance charge.
"""
open(O+"/AUDIO.md","w").write(md); print(md[-2500:])

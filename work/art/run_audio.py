import subprocess, sys, json
from concurrent.futures import ThreadPoolExecutor
M="Energetic catchy adventurous orchestral-folk score, sea shanty meets action movie, instrumental only, no vocals, seamless loop. "
jobs=[
("a01_title","Wooden jousting lance cracking and shattering into splinters, sharp wood snap with debris",1.5,M+"Rousing sea shanty main theme for a game title menu: fiddle, accordion, stomping drums, brass and strings, big hummable melody, 3/4 swagger, heroic and fun.",60),
("a02_regatta","Heavy body hit thud, a padded person slammed hard, deep impact punch",1.0,M+"Bright bouncy regatta music: plucky pizzicato strings, tin whistle, accordion, upbeat drums, sunny and playful, competitive energy.",60),
("a03_thunder","Big splash of a person falling into the sea from a boat, heavy water plunge",2.5,M+"Driving tense storm battle music: pounding toms, low brass stabs, urgent fiddle ostinato, minor key shanty, lightning energy.",60),
("a04_gale","Close thunder crack, violent sharp lightning strike boom with rumble tail",3.0,M+"Fast racing strings in a gale: rapid spiccato strings, driving snare, whistling flute melody, wind-swept urgency, high tempo.",60),
("a05_rogue","Electric charge crackle, buzzing high-voltage arcing sparks building up",2.0,M+"Eerie moonlit night sea music that still drives forward: celesta and glassy harp over pulsing low strings and steady drums, haunting minor shanty melody, mysterious.",60),
("a06_boss","Ocean wave crashing hard against a wooden boat hull, heavy water slam and spray",2.5,M+"Epic final boss battle at sea: huge choir chanting wordless ahh, full orchestra brass, thundering taiko and timpani, menacing shanty theme, climactic.",60),
("a07_victory","Strong wind gust whoosh passing by, stormy sea wind",2.5,M+"Short triumphant victory fanfare sting, brass and fiddle, cymbal swell, bright major key ending, not a loop.",8),
("a08_defeat","Crowd of spectators on boats cheering and whistling, excited applause outdoors",3.0,M+"Short comic defeat sting, sad trombone and tuba with a deflating accordion, playful minor ending, not a loop.",6),
("a09_horn","Ship's horn blast, deep foghorn signalling the start, one long blast",2.5,M+"Very short fanfare sting to start a joust round: snare roll and brass hit, 3 seconds.",3),
("a10_gull","Seagull squawking calls over the sea, a couple of gulls",1.5,M+"Very short bright hit sting: a single brass stab with cymbal, triumphant, 2 seconds.",2),
("a11_sail","Canvas sail flapping and snapping in the wind, luffing sail",1.5,M+"Very short magical charge-up sting: rising harp glissando and shimmering strings, 3 seconds.",3),
("a12_bonk","Comic cartoon bonk on a metal helmet, funny clang",1.0,M+"Very short comic stinger: pizzicato and woodblock slip, cartoon pratfall, 2 seconds.",2),
]
def run(j):
    l,sp,ss,mp,ms=j
    for attempt in range(3):
        p=subprocess.run(["perl","-e","alarm shift; exec @ARGV","1600","python3","/Users/atlas/astrocade-game7/tools/atlas_audio.py","game7","/Users/atlas/astrocade-game7/work/art/audio_raw","art_"+l,sp,str(ss),mp,str(ms)],capture_output=True,text=True)
        print(l,attempt,p.stdout.strip()[-300:],p.stderr.strip()[-200:],flush=True)
        if '"ok": true' in p.stdout: return
sel=sys.argv[1:] 
js=[j for j in jobs if not sel or j[0] in sel]
with ThreadPoolExecutor(3) as ex: list(ex.map(run,js))
print("ALLDONE")

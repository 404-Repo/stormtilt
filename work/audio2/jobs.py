import sys,subprocess
P="Energetic catchy adventurous orchestral-folk score, sea shanty meets action movie, instrumental only, no vocals, seamless loop. "
C=" Continuation, same tempo and instrumentation."
M={
"title":"Rousing sea shanty main theme for a game title menu: fiddle, accordion, stomping drums, brass and strings, big hummable melody, 3/4 swagger, heroic and fun.",
"regatta":"Bright bouncy regatta music: plucky pizzicato strings, tin whistle, accordion, upbeat drums, sunny and playful, competitive energy.",
"thunder":"Driving tense storm battle music: pounding toms, low brass stabs, urgent fiddle ostinato, minor key shanty, lightning energy.",
"gale":"Fast racing strings in a gale: rapid spiccato strings, driving snare, whistling flute melody, wind-swept urgency, high tempo.",
"rogue":"Eerie moonlit night sea music that still drives forward: celesta and glassy harp over pulsing low strings and steady drums, haunting minor shanty melody, mysterious.",
"boss":"Epic final boss battle at sea: huge choir chanting wordless ahh, full orchestra brass, thundering taiko and timpani, menacing shanty theme, climactic.",
}
S={
"charge":("Electric crackle building and sustaining, Tesla coil buzzing high-voltage arcing sparks",2),
"zap":("Sharp electric zap of a lightning bolt hitting a wooden ship mast",1),
"jump":("A sailing yacht launching off a wave into the air, rushing water and wind whoosh",1.2),
"land":("Boat hull slapping down hard on water, heavy flat wet slam",1),
"gasp":("A small crowd of spectators gasping ooh in surprise",1.5),
"laugh":("A small crowd of spectators laughing heartily",2),
"whoa":("A cartoon man yelling whoaaa as he falls, comic voice, no other words",1.5),
"clank":("Armour and wood clank as a jousting lance is lowered into position",0.6),
"bell":("A ship's brass bell ringing twice, ding ding",1.5),
"rain":("Steady heavy rain falling on the sea and on canvas sails, loopable ambience",8),
"wind":("Storm wind howling over the sea, loopable ambience",8),
"charge2":("Electric charge crackle, buzzing high-voltage arcing sparks rising and sustaining, Tesla coil",2),
"zap2":("Electric zap, sharp crack of a lightning strike on wood with sizzle",1),
}
J=[("c01","rogue","a","charge"),("c02","rogue","b","zap"),("c03","rogue","c","jump"),("c04","title","b","land"),
("c05","title","c","gasp"),("c06","regatta","b","laugh"),("c07","regatta","c","whoa"),("c08","thunder","b","clank"),
("c09","thunder","c","bell"),("c10","gale","b","rain"),("c11","gale","c","wind"),("c12","boss","b","charge2"),("c13","boss","c","zap2")]
cid=sys.argv[1]
for j in J:
    if j[0]==cid:
        c,cue,take,sfx=j; mp=P+M[cue]+("" if (cue=="rogue" and take=="a") else C)
        label=f"{c}_{cue}_{take}_{sfx}"
        subprocess.run(["python3","/Users/atlas/astrocade-game7/tools/atlas_audio.py","game7","/Users/atlas/astrocade-game7/work/audio2/raw",label,S[sfx][0],str(S[sfx][1]),mp,"60"])

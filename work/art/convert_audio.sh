#!/bin/bash
R=/Users/atlas/astrocade-game7/work/art/audio_raw; O=/Users/atlas/astrocade-game7/game/audio
m() { [ -f "$R/art_$1_music.mp3" ] && ffmpeg -nostdin -y -loglevel error -i "$R/art_$1_music.mp3" -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.02" -ar 44100 -ac 2 -b:a 96k "$O/$2.mp3"; }
s() { [ -f "$R/art_$1_sfx.mp3" ] && ffmpeg -nostdin -y -loglevel error -i "$R/art_$1_sfx.mp3" -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.01,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,loudnorm=I=-14:TP=-1:LRA=11" -ar 44100 -ac 1 -b:a 96k "$O/$2.mp3"; }
m a01_title music_title;     s a01_title sfx_lance_crack
m a02_regatta music_regatta; s a02_regatta sfx_body_thud
m a03_thunder music_thunder; s a03_thunder sfx_splash
m a04_gale music_gale;       s a04_gale sfx_thunder
m a05_rogue music_rogue;     s a05_rogue sfx_charge
m a06_boss music_boss;       s a06_boss sfx_wave_crash
m a07_victory sting_victory; s a07_victory sfx_wind_gust
m a08_defeat sting_defeat;   s a08_defeat sfx_crowd_cheer
m a09_horn sting_start;      s a09_horn sfx_horn
m a10_gull sting_hit;        s a10_gull sfx_gull
m a11_sail sting_charge;     s a11_sail sfx_sail_flap
m a12_bonk sting_comic;      s a12_bonk sfx_bonk
for f in $O/*.mp3; do printf "%s %s\n" "$(basename $f)" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
du -ch $O/*.mp3 | tail -1

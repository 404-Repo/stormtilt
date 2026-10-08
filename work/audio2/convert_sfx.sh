#!/bin/bash
R=/Users/atlas/astrocade-game7/work/audio2/raw; O=/Users/atlas/astrocade-game7/game/audio
for f in $R/c*_sfx.mp3; do
  b=$(basename $f _sfx.mp3); IFS=_ read c cue take sfx <<< "$b"
  case $sfx in rain|wind) AF="loudnorm=I=-18:TP=-2:LRA=11";; *) AF="silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.01,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,loudnorm=I=-14:TP=-1:LRA=11";; esac
  ffmpeg -nostdin -y -loglevel error -i $f -af "$AF" -ar 44100 -ac 1 -b:a 96k $O/sfx_$sfx.mp3
done

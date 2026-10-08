#!/bin/bash
# usage: convert_music.sh <cap seconds> <out dir>
CAP=$1
# usage: convert.sh  (converts every raw take present)
R=/Users/atlas/astrocade-game7/work/audio2/raw; O=$2
# per-cue music target = measured integrated loudness of the existing take (rogue: -16)
tgt() { case $1 in thunder) echo -18.9;; regatta) echo -15.7;; boss) echo -15.6;; gale) echo -16.3;; title) echo -16.6;; *) echo -16;; esac; }
for f in $R/c*_music.mp3; do
  b=$(basename $f _music.mp3); IFS=_ read c cue take sfx <<< "$b"
  out=music_${cue}_${take}; [ "$cue$take" = roguea ] && out=music_rogue
  T=$(tgt $cue)
  # trim leading/trailing silence, two-pass loudnorm (linear), short fades
  ffmpeg -nostdin -y -loglevel error -i $f -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,atrim=0:$CAP" $R/tmp_$b.wav
  J=$(ffmpeg -nostdin -i $R/tmp_$b.wav -af loudnorm=I=$T:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
  mi=$(echo "$J"|python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_i"],d["input_tp"],d["input_lra"],d["input_thresh"],d["target_offset"])')
  read ii itp ilra ith off <<< "$mi"
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $R/tmp_$b.wav)
  ffmpeg -nostdin -y -loglevel error -i $R/tmp_$b.wav -af "loudnorm=I=$T:TP=-1.5:LRA=11:measured_I=$ii:measured_TP=$itp:measured_LRA=$ilra:measured_thresh=$ith:offset=$off:linear=true,afade=t=in:d=0.05,afade=t=out:st=$(echo "$D-1.5"|bc):d=1.5" -ar 44100 -ac 2 -b:a 96k $O/$out.mp3
  rm $R/tmp_$b.wav
done

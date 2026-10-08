#!/bin/bash
# usage: run_jobs.sh <jobsfile>  ; each line: kind<TAB>out<TAB>label<TAB>prompt ; runs 4 in parallel
cd /Users/atlas/astrocade-game7
while IFS=$'\t' read -r kind out label prompt; do
  [ -z "$kind" ] && continue
  ( perl -e 'alarm shift; exec @ARGV' 1200 python3 tools/atlas_img.py "$kind" "$out" "$label" "$prompt" ) &
  while [ "$(jobs -rp | wc -l)" -ge 4 ]; do sleep 3; done
done < "$1"
wait
echo ALLDONE

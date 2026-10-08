#!/bin/sh
# receipt.sh <id> <pick letter>
id=$1; p=$2
R=/Users/atlas/astrocade-game7/receipts/candidates/captains/$id
mkdir -p $R
cp cand/$id/${id}_A.js cand/$id/${id}_B.js cand/$id/${id}_C.js cand/$id/*.expect.json $R/
cp cand/$id/_verify/sheet.png $R/verify_sheet.png
cp cand/$id/_verify/report.json $R/verify_report.json
cp cand/$id/look.png $R/joint_test_and_face.png
cp cand/$id/${id}_$p.js /Users/atlas/astrocade-game7/game/assets/cap_$id.js
echo "picked ${id}_$p -> game/assets/cap_$id.js"

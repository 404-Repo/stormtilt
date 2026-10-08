#!/bin/sh
# Write game/audio/list.json and game/assets/list.json so the game never requests a file that is not there (a 404 fails the jam gate).
cd "$(dirname "$0")/../game" || exit 1
python3 - <<'PY'
import os, json
for d, ext in (('audio', '.mp3'), ('assets', '.js')):
    names = sorted(f[:-len(ext)] for f in os.listdir(d) if f.endswith(ext))
    json.dump(names, open(os.path.join(d, 'list.json'), 'w'))
    print(d, len(names))
PY

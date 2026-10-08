#!/bin/sh
# build.sh <id> : wraps src/<id>/*.body.js into ../<id>/<name>.js (identical header/footer in every module)
cd "$(dirname "$0")"; id=$1; mkdir -p ../$id
for b in $id/*.body.js; do n=$(basename $b .body.js); { echo "// $id, $(head -1 $b | sed 's#^// ##')"; cat _head.js; tail -n +2 $b; cat _foot.js; } > ../$id/$n.js; done
ls ../$id

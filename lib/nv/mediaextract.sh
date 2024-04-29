#!/bin/bash/
set -e
set -o pipefail


fdir=./temp/
#TODO?
#find ~ -name Necrovale.x64
#then replace Necrovale.x64 with hlboot.dat
gfile=~/.steam/steam/steamapps/common/Necrovale/hlboot.dat
mkdir $fdir

echo 'Extracting Media...'

mediaextract -q -f png -a "{index}.{ext}" -o $fdir $gfile > /dev/null
mediaextract -q -f ascii -a "{index}.txt" -m 10k -o $fdir $gfile > /dev/null

echo "Finding and moving the files we need..."

grep -l -Z -r '"sheets"' $fdir | xargs -0 -I{} mv {} ./gamedata.json
grep -l -Z -r 'UI.png' $fdir | xargs -0 -I{} mv {} ./UI.atlas
grep -l -Z -r 'Characters.png' $fdir | xargs -0 -I{} mv {} ./Characters.atlas

file $fdir*.png | awk -v dim="$(sed -n '2p' ./UI.atlas | awk '{print $2,$3}' | sed 's/,/ x/')" '$0 ~ dim' | sed 's/:.*//' | tr -d '\n' | xargs -0 -I{} mv {} ./UI.png

file $fdir*.png | awk -v dim="$(sed -n '2p' ./Characters.atlas | awk '{print $2,$3}' | sed 's/,/ x/')" '$0 ~ dim' | sed 's/:.*//' | tr -d '\n' | xargs -0 -I{} mv {} ./Characters.png

echo "Cleaning up..."

rm -rf $fdir

echo "Done."

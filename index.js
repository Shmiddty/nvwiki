const fs = require('fs').promises
//const atl = require('atlas-parser')
const $ = require('jsonata')
//const mwbot = require('mwbot')
//const apiUrl = 'https://intothenecrovale.wiki.gg/api.php'
//const bot = new mwbot({ apiUrl }})

function str(o) {
  return o.toString()
}

function wkTable(cap, columns, rows) {
  return `
{| class="wikitable sortable" 
 |+ ${cap}
 |-
 ! ${columns.join(' !! ')}${rows.reduce(
   (r, i) => r + ['', ' |-', ' | ' + i.join(' || ')].join('\n'),
   ''
 )}
 |}
`
}

function wkIcon(i, cap = '') {
  return `[[File:${i}.png${cap ? '|' + cap : ''}]]`
}

Promise.all([
  fs.readFile('./lib/nv/gamedata.json').then(str).then(JSON.parse)
  //fs.readFile('./lib/nv/UI.atlas').then(str).then(atl.parse),
  //fs.readFile('./lib/nv/Characters.atlas').then(str).then(atl.parse)
]).then(([data /*, ui, ch*/]) => {
  $(`
  $eq:=sheets[name="equipment"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $rarities:=$split($substring(columns[name="rarity"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    $eqByType:=[lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "rarity": $rarities[$i.rarity],
        "properties": [properties.(
          $me:=$;
          $ ~> | $ | { 
            "name": $stats[id=$me.stat].display
          } |
        )]
      } |
    )]{ type: $ };
    $eqByType
  )`)
    .evaluate(data)
    .then((eqByType) =>
      Object.entries(eqByType).reduce(
        (o, [k, v]) =>
          o +
          wkTable(
            k,
            ['Icon', 'Name', 'Rarity', 'Type', 'Description', 'Flavor Text'],
            v.map((i) => [
              wkIcon(i.icon),
              i.name,
              i.rarity,
              i.type,
              i.description,
              i.flavor
            ])
          )
      )
    )
    .then(console.log)
})

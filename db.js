const $ = require('jsonata')

module.exports = function (data) {
  return {
    equipmentByType: function () {
      return $(`
  $eq:=sheets[name="equipment"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $rarities:=$split($substring(columns[name="rarity"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    $eqByType:=[lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "rarity": $rarities[$i.rarity],
        "rarityId": $i.rarity,
        "properties": [properties.(
          $me:=$;
          $ ~> | $ | { 
            "name": $stats[id=$me.stat].display
          } |
        )]
      } |
    )]{ type: $ };
    $eqByType
  )`).evaluate(data)
    }
  }
}

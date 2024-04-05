const $ = require('jsonata')

module.exports = function (data) {
  return {
    equipment: function () {
      return $(`
  $eq:=sheets[name="equipment"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $rarities:=$split($substring(columns[name="rarity"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    $eqAll:=[lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "properties": [properties.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]
      }, ["attacks", "power_attacks"]|
    )];
    $eqAll
  )`).evaluate(data)
    },
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
        "properties": [properties.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]
      }, ["attacks", "power_attacks"]|
    )]{ type: $ };
    $eqByType
  )`).evaluate(data)
    },
    equipmentSchema: function () {
      return $(`
  sheets[name="equipment"].columns
      `).evaluate(data)
    }
  }
}

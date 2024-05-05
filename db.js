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
    [lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "properties": [properties.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]
      }, ["attacks", "power_attacks"]|
    )]{ type: [$] }
  )`).evaluate(data)
    },
    equipmentByCategory: function () {
      return $(`
  $eq:=sheets[name="equipment"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $rarities:=$split($substring(columns[name="rarity"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    [lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "properties": [properties.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]
      }, ["attacks", "power_attacks"]|
    )]{ category: [$] }
  )`).evaluate(data)
    },
    equipmentByRarity: function () {
      return $(`
  $eq:=sheets[name="equipment"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $rarities:=$split($substring(columns[name="rarity"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    [lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "rarity": $rarities[$i.rarity],
        "properties": [properties.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]
      }, ["attacks", "power_attacks"]|
    )]{ rarity: [$] }
  )`).evaluate(data)
    },
    equipmentSchema: function () {
      return $(`
  sheets[name="equipment"].columns
      `).evaluate(data)
    },
    stats: function () {
      return $(`
  sheets[name="stats"].lines
  `).evaluate(data)
    },
    levels: function () {
      return $(`
  $lv:=sheets[name="levels"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $areas:=$split($substring(columns[name="area"].typeStr,2),",");
    [lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "typeId": $i.type,
        "area": $areas[$i.area],
        "areaId": $i.area
      } |
    )]
  )`).evaluate(data)
    },
    levelsByArea: function () {
      return $(`
  $lv:=sheets[name="levels"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $areas:=$split($substring(columns[name="area"].typeStr,2),",");
    [lines[active=true].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "typeId": $i.type,
        "area": $areas[$i.area],
        "areaId": $string($i.area)
      } |
    )]{ areaId: [$] }
  )`).evaluate(data)
    },
    characters: function () {
      return $(`
  $lv:=sheets[name="characters"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $teams:=$split($substring(columns[name="team"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    [lines[active=true or type>1].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "typeId": $i.type,
        "team": $teams[$i.team],
        "teamId": $i.team,
        "stat": [$i.stat.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]

      } |
    )]
  )`).evaluate(data)
    },
    charactersByTeam: function () {
      return $(`
  $lv:=sheets[name="characters"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $teams:=$split($substring(columns[name="team"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    [lines[active=true or type>1].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "typeId": $i.type,
        "team": $teams[$i.team],
        "teamId": $i.team,
        "stat": [$i.stat.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]
      } |
    )]{ team: [$] }
  )`).evaluate(data)
    },
    charactersByType: function () {
      return $(`
  $lv:=sheets[name="characters"].(
    $types:=$split($substring(columns[name="type"].typeStr,2),",");
    $teams:=$split($substring(columns[name="team"].typeStr,2),",");
    $stats:=$$.sheets[name="stats"].lines;
    [lines[active=true or type>1].(
      $i:=$;
      $ ~> | $ | {
        "type": $types[$i.type],
        "typeId": $i.type,
        "team": $teams[$i.team],
        "teamId": $i.team,
        "stat": [$i.stat.(
          $me:=$;
          $mine:=$stats[id=$me.stat];
          $merge([$mine, $me])
        )]
      } |
    )]{ type: [$] }
  )`).evaluate(data)
    }
  }
}

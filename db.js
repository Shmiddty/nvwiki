module.exports = function (data) {
  function findProp(prop) {
    return function (value) {
      return function (arr) {
        return arr.find((o) => o[prop] === value)
      }
    }
  }
  const findName = findProp('name')
  const findId = findProp('id')
  function filterAll(...props) {
    return function (arr) {
      return arr.filter((o) =>
        props.every((p) => Object.entries(p).every(([k, v]) => o[k] === v))
      )
    }
  }
  function filterAny(...props) {
    return function (arr) {
      return arr.filter((o) =>
        props.some((p) => Object.entries(p).every(([k, v]) => o[k] === v))
      )
    }
  }

  function parseEnum(noom) {
    const arr = noom.typeStr.slice(2).split(',')
    arr.forEach((v, i) => (arr[v] = i))
    return arr
  }

  const methods = {
    stats: function () {
      return findName('stats')(data.sheets).lines
    },
    equipmentTable: function () {
      return findName('equipment')(data.sheets)
    },
    equipmentTypes: function () {
      return parseEnum(findName('type')(methods.equipmentTable().columns))
    },
    equipmentRarities: function () {
      return parseEnum(findName('rarity')(methods.equipmentTable().columns))
    },
    equipment: function () {
      return filterAll({ active: true })(
        methods
          .equipmentTable()
          .lines.map(({ type, rarity, properties, ...rest }) => ({
            type: methods.equipmentTypes()[type],
            typeId: type,
            rarity: methods.equipmentRarities()[rarity],
            rarityId: rarity,
            properties: properties.map((p) =>
              Object.assign(
                {},
                findId(p.stat)(methods.stats()),
                p,
                ['health', 'damage'].includes(p.stat)
                  ? { increment: p.base / 10 }
                  : {}
              )
            ),
            ...rest
          }))
      )
    },
    equipmentByType: function () {
      return Object.groupBy(methods.equipment(), ({ type }) => type)
    },
    equipmentByCategory: function () {
      return Object.groupBy(methods.equipment(), ({ category }) => category)
    },
    equipmentByRarity: function () {
      return Object.groupBy(methods.equipment(), ({ rarity }) => rarity)
    },
    equipmentSchema: function () {
      return methods.equipmentTable().columns
    },
    levelsTable: function () {
      return findName('levels')(data.sheets)
    },
    levelsTypes: function () {
      return parseEnum(findName('type')(methods.levelsTable().columns))
    },
    levelsAreas: function () {
      return [
        'All Areas',
        'Necrovale Dungeons',
        'Hornslack Ruins',
        'River of Souls',
        'Halls of Shadow',
        'Palace of the Witch'
      ]

      // The area names defined in the enum are not desired
      //return parseEnum(findName('area')(methods.levelsTable().columns))
    },
    levels: function () {
      return filterAll({ active: true })(
        methods
          .levelsTable()
          .lines.map(({ type, area, team, enemies, ...rest }) => ({
            type: methods.levelsTypes()[type],
            typeId: type,
            area: methods.levelsAreas()[area],
            areaId: area,
            enemies: (enemies || [])
              .concat(
                filterAll({ team, type: 1 })(
                  methods.charactersTable().lines
                ).map((e) => ({
                  type: e.id
                }))
              )
              .filter((v, i, a) => a.findIndex((V) => v.type === V.type) === i)
              .sort(),
            ...rest
          }))
      )
    },
    levelsByArea: function () {
      return Object.groupBy(methods.levels(), ({ area }) => area)
    },
    levelsByType: function () {
      return Object.groupBy(methods.levels(), ({ type }) => type)
    },
    charactersTable: function () {
      return findName('characters')(data.sheets)
    },
    charactersTypes: function () {
      return parseEnum(findName('type')(methods.charactersTable().columns))
    },
    charactersTeams: function () {
      return parseEnum(findName('team')(methods.charactersTable().columns))
    },
    charactersInLevels: function () {
      return methods
        .levels()
        .filter((l) => l.enemies?.length)
        .map((l) => l.enemies.map((e) => e.type))
        .flat()
    },
    characters: function () {
      return filterAny(
        { active: true },
        { type: 'NPC' },
        { type: 'Boss' },
        ...methods.charactersInLevels().map((id) => ({ id }))
      )(
        methods
          .charactersTable()
          .lines.map(({ type, team, stat, ...rest }) => ({
            type: methods.charactersTypes()[type],
            typeId: type,
            team: methods.charactersTeams()[team],
            teamId: team,
            stat: stat.map((s) =>
              Object.assign({}, findId(s.stat)(methods.stats()), s)
            ),
            ...rest
          }))
      )
    },
    charactersByTeam: function () {
      return Object.groupBy(methods.characters(), ({ team }) => team)
    },
    charactersByType: function () {
      return Object.groupBy(methods.characters(), ({ type }) => type)
    }
  }
  return methods
}

function field([k, v]) {
  return k + '=' + v
}
function icon(s) {
  return `Icons_${s}.png`
}
function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}
const methods = {
  pagetype: function (type) {
    return `{{PAGENAME}} is a type of [[${type}]].`
  },
  table: function table(columns, rows) {
    return `
{| class="wikitable sortable"
 ! ${columns.join(' !! ')}
${rows.map((i) => [' |-', ' | ' + i.join('\n | ')].join('\n')).join('\n')}
 |}
`
  },
  license: function (lic) {
    return `

== License ==
{{License/${lic}}}
`
  },
  icon: function icon(i, cap = '') {
    return i ? methods.img(`Icons_${i}.png`, cap) : '(not found)'
  },
  img: function icon(i, cap = '') {
    return i
      ? `[[File:${i}|class=pixel|64px${cap ? '|' + cap : ''}]]`
      : '(not found)'
  },
  page: function (name) {
    return `[[${name}]]`
  },
  rarity: function rarity(n) {
    return `{{Rarity|${n}}}`
  },
  stats: function stats(a) {
    return a
      .sort(
        (A, B) => (A.mode - B.mode) * 2 + A.display.localeCompare(B.display)
      )
      .map(methods.stat)
      .join('')
  },
  stat: function stat(p) {
    const ps = Object.entries(p).map(field).join('|')
    return `{{Stat|${ps}}}`
  },
  item: function item(i) {
    const f = Object.entries({
      ...i,
      icon: icon(i.icon),
      properties: methods.stats(i.properties)
    })
      .map(field)
      .join('|')
    return `<noinclude>{{Item/Store|${f}}}</noinclude>`
  },
  character: function ({ visual, arsenal, ...i }) {
    const f = Object.entries({
      ...i,
      icon: capitalize(i.icon),
      size: i.stat.find((v) => v.stat === 'size')?.base ?? 0,
      stat: methods.stats(i.stat)
    })
      .map(field)
      .join('|')
    return `<noinclude>{{Character/Store|${f}}}</noinclude>`
  },
  level: function ({ enemies, ...level }) {
    return [
      `<noinclude>`,
      `{{Level/Store|${Object.entries(level).map(field).join('|')}}}`,
      ...enemies.map(
        ({ type }) =>
          `{{LevelCharacter/Store|levelId=${level.id}|characterId=${type}}}`
      ),
      `</noinclude>`
    ].join('')
  },
  cargoItemQuery: function (where, omitFields = {}) {
    const fields = [
      "CONCAT('[[File:',icon,'|class=pixel|64px]]')=Icon",
      '_pageName=Name',
      !omitFields.rarity && "CONCAT('{{Rarity{{!}}', rarityId, '}}')=Rarity",
      !omitFields.type && "CONCAT('[[',type,']]')=Type",
      !omitFields.category && "CONCAT('[[',category,']]')=Category",
      !omitFields.description && "CONCAT('',description)=Description",
      !omitFields.power && "CONCAT('',power_cost)=Power Cost",
      !omitFields.power && "CONCAT('',power_description)=Power Description",
      !omitFields.stats && 'properties=Stats',
      !omitFields.flavor && `CONCAT("''",flavor, "''")=Flavor`
    ]
      .filter(Boolean)
      .join(',')
    return `{{#cargo_query:
table=Item
|fields=${fields}
|where=${where}
|format=dynamic table
|rows per page=500
}}`
  },
  cargoCharacterQuery: function (
    where,
    omitFields = {},
    format = 'dynamic table|rows per page=500'
  ) {
    const fields = [
      !omitFields.icon && "CONCAT('[[File:',icon,'|class=pixel|x64px]]')=Icon",
      !omitFields.name && '_pageName=Name',
      !omitFields.type && "CONCAT('[[',type,']]')=Type",
      !omitFields.team && "CONCAT('[[',team,']]')=Team",
      !omitFields.value && 'value=Value',
      !omitFields.difficulty_bar && 'difficulty_bar=Difficulty Bar',
      !omitFields.stats && 'stat=Stats'
    ]
      .filter(Boolean)
      .join(',')
    return `{{#cargo_query:
table=ACharacter
|fields=${fields}
|where=${where}
|format=${format}
}}`
  },
  queryById: function (ids) {
    return "id='" + ids.join("' OR id='") + "'"
  },
  cargoCharacterList: function (ids) {
    return methods.cargoCharacterQuery(
      methods.queryById(ids),
      {
        icon: true,
        type: true,
        team: true,
        value: true,
        difficulty_bar: true,
        stats: true
      },
      'list'
    )
  },
  cargoLevelQuery: function (where, omitFields = {}) {
    const fields = [
      !omitFields.name && '_pageName=Name',
      !omitFields.area && "CONCAT('[[',area,']]')=Area",
      !omitFields.type && "CONCAT('[[',type,' Level]]')=Type",
      !omitFields.subtitle && 'subtitle=Subtitle',
      !omitFields.difficulty_bar && 'difficulty_bar=Difficulty Bar',
      !omitFields.enemies &&
        `CONCAT("{{LevelCharacterList{{!}}",id,"}}")=Characters`
    ]
      .filter(Boolean)
      .join(',')
    return [
      `{{#cargo_query:table=Level|fields=${fields}`,
      where && `|where=${where}`,
      `|format=dynamic table|rows per page=500}}`
    ]
      .filter(Boolean)
      .join('')
  }
}

module.exports = methods

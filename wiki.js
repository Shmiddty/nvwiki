function field([k, v]) {
  return k + '=' + v
}
function icon(s) {
  return `Icons_${s}.png`
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
    return i
      ? `[[File:Icons_${i}.png|class=pixel|64px${cap ? '|' + cap : ''}]]`
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
  }
}

module.exports = methods

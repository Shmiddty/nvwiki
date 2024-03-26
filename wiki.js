module.exports.pagetype = function (type) {
  return `{{PAGENAME}} is a type of [[${type}]].`
}

module.exports.table = function table(columns, rows) {
  return `
{| class="wikitable sortable"
 ! ${columns.join(' !! ')}
${rows.map((i) => [' |-', ' | ' + i.join('\n | ')].join('\n')).join('\n')}
 |}
`
}

module.exports.icon = function icon(i, cap = '') {
  return i
    ? `[[File:Icons_${i}.png|class=pixel|64px${cap ? '|' + cap : ''}]]`
    : '(not found)'
}

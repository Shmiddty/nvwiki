module.exports.pagetype = function (type) {
  return `{{PAGENAME}} is a type of [[${type}]]s.`
}

module.exports.table = function table(cap, columns, rows) {
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

module.exports.icon = function icon(i, cap = '') {
  return i
    ? `[[File:Icons_${i}.png|class=pixel|64px${cap ? '|' + cap : ''}]]`
    : '(not found)'
}

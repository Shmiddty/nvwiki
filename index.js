const fs = require('fs').promises
const atl = require('atlas-parser')
const wiki = require('./wiki.js')
const db = require('./db.js')
const bot = require('nodemw')
const util = require('util')
const jimp = require('jimp')

function promisify(obj, funcs = []) {
  funcs.forEach((k) => {
    obj[k] = util.promisify(obj[k])
  })
  return obj
}

const client = promisify(new bot('mwconfig.json'), [
  'logIn',
  'getAllPages',
  'upload'
])

function str(o) {
  return o.toString()
}

Promise.all([
  fs
    .readFile('./credentials.secret')
    .then(str)
    .then((str) => str.split('\n')),
  fs.readFile('./lib/nv/gamedata.json').then(str).then(JSON.parse),
  fs.readFile('./lib/nv/UI.atlas').then(str).then(atl.parse),
  jimp.read('./lib/nv/UI.png')
  //fs.readFile('./lib/nv/Characters.atlas').then(str).then(atl.parse)
]).then(([[uname, pw], data, ui, UI /*, ch */]) => {
  Object.entries(ui['UI.png'].frames)
    .filter(([k]) => k.includes('icons'))
    .forEach(([k, v]) => {
      UI.clone()
        .crop(...v.xy, ...v.size)
        .write(`./dist/${k.replace('/', '_')}.png`)
    })

  const $db = db(data)

  $db
    .equipmentByType()
    .then((eqByType) =>
      Object.entries(eqByType).map(([k, v]) =>
        wiki.table(
          k,
          ['Icon', 'Name', 'Rarity', 'Category', 'Description', 'Flavor Text'],
          v.map((i) => [
            wiki.icon(i.icon),
            i.name,
            i.rarity,
            i.category,
            i.description,
            i.flavor
          ])
        )
      )
    )
    .then((types) => console.log(types.join('\n\n')))
})

const fs = require('fs').promises
const db = require('./db.js')
const bot = require('mwbot')
const atl = require('atlas-parser')
const jimp = require('jimp')
const cliProgress = require('cli-progress')
const { apiUrl, apiLimit, concurrency } = require('./mwconfig.json')
const { item, license } = require('./wiki.js')
const { debug, str, stagger, mwContinuedRequest } = require('./util.js')
const toString = (o) => o.toString()

const client = new bot({
  verbose: true,
  quiet: false,
  concurrency
})

const DRY = process.env.DRY_RUN === '1'
const OW = process.env.OW === '1'
const DMP = process.env.DMP === '1'

Promise.all([
  fs
    .readFile('./credentials.secret')
    .then(toString)
    .then((str) => str.split('\n')),
  fs.readFile('./lib/nv/gamedata.json').then(toString).then(JSON.parse),
  fs.readFile('./lib/nv/UI.atlas').then(str).then(atl.parse),
  jimp.read('./lib/nv/UI.png')
]).then(async ([[username, password], data, ui, UI]) => {
  const $db = db(data)
  const eq = await $db.equipment()

  if (DMP) {
    console.log(eq.map(item).join('\n\n'))
    return
  }

  await client.loginGetEditToken({
    apiUrl,
    username,
    password
  })

  const exImgs = await mwContinuedRequest(client, {
    action: 'query',
    list: 'allimages',
    ailimit: 500
  }).then((imgs) => {
    return imgs.map((i) => i.name.toLowerCase().replace('_', '/').slice(0, -4))
  })
  const imgs = Object.entries(ui['UI.png'].frames).filter(
    ([k]) => k.includes('icons') && !exImgs.includes(k)
  )
  const timeStep = Math.ceil(apiLimit.period / apiLimit.count)
  const prog1 = new cliProgress.SingleBar(
    {
      format: '{bar} | {percentage}% | ETA: {eta}s | {value}/{total} | {name}'
    },
    cliProgress.Presets.shades_classic
  )
  console.log('\nUploading images:\n')
  prog1.start(imgs.length, 0, { name: '' })
  await stagger(imgs, timeStep, async ([k, v], i) => {
    const fname = k.replace('/', '_') + '.png'
    prog1.update(i, { name: fname })
    await UI.clone()
      .crop(...v.xy, ...v.size)
      .write(`./dist/${fname}`)
    debug('Uploading:', fname)
    if (DRY) return
    return client
      .upload(false, `./dist/${fname}`, 'Uploaded by nvwikibot', {
        text: license('Casey Clyde')
      })
      .then(() => prog1.increment())
      .catch(console.error)
  }).finally(() => prog1.stop())

  const exItems = await mwContinuedRequest(client, {
    action: 'query',
    list: 'allpages',
    aplimit: 500
  }).then((pages) => pages.map((i) => i.title))

  const items = eq.filter((i) => OW || !exItems.includes(i.name))
  const prog2 = new cliProgress.SingleBar(
    {
      format: '{bar} | {percentage}% | ETA: {eta}s | {value}/{total} | {name}'
    },
    cliProgress.Presets.shades_classic
  )
  console.log('\nUpdating items:\n')
  prog2.start(items.length, 0, { name: '' })

  stagger(items, timeStep, (itm, i) => {
    prog2.update(i, { name: itm.name })
    const content = item(itm)
    if (DRY) {
      console.log(content)
      return
    }
    return client
      .edit(itm.name, content, 'Generated by nvwikibot')
      .then(() => prog2.increment())
      .catch(console.error)
  }).finally(() => prog2.stop())
})

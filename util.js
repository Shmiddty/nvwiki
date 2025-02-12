const methods = {
  str: function str(o) {
    return o.toString()
  },
  debug: function debug(...args) {
    console.log(...args)
  },
  chunk: function chunk(a, size) {
    return Array.from({ length: Math.ceil(a.length / size) }).map((_, i) =>
      a.slice(i * size, (i + 1) * size)
    )
  },
  upperFirst: function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  },
  delay: function delay(n) {
    return new Promise((resolve) => setTimeout(resolve, n))
  },
  stagger: function (arr, timeStep, cb) {
    //function staggered(i) {
    //  return methods
    //    .delay(timeStep)
    //    .then(() => cb(arr[i], i))
    //    .then(() => staggered(i + 1))
    //}
    //return staggered(0)

    return Promise.all(
      arr.map((itm, i) => methods.delay(i * timeStep).then(() => cb(itm, i)))
    )
  },

  mwContinuedRequest: function (client, params) {
    return new Promise((resolve, reject) => {
      client
        .request(params)
        .then(async (r) =>
          resolve(
            (r?.[params.action]?.[params.list] ?? []).concat(
              r.continue
                ? await methods.mwContinuedRequest(client, {
                    ...params,
                    ...r.continue
                  })
                : []
            )
          )
        )
        .catch(reject)
    })
  }
}

module.exports = methods

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
  delay: function delay(n) {
    return new Promise((resolve) => setTimeout(resolve, n))
  },
  stagger: function (arr, chunkSize, timeStep, cb) {
    return Promise.all(
      methods
        .chunk(arr, chunkSize)
        .map((chn, i) => methods.delay(i * timeStep).then(() => cb(chn, i)))
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

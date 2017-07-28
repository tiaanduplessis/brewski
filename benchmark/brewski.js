'use strict'

const brewski = require('../')
const autocannon = require('autocannon')
const app = brewski()

const PORT = 3000

app.get('/test', (req, res) => {
  res.send(200, { test: true })
})

app.listen(PORT, startBench)

function startBench () {
  const instance = autocannon(
    {
      connections: 200,
      duration: 30,
      url: `http://localhost:${PORT}/test`
    },
    finishedBench
  )

  autocannon.track(instance)

  function finishedBench (err, res) {
    app.server.close()
  }
}

process.once('SIGINT', () => {
  instance.stop()
})

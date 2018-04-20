'use strict'

const brewski = require('../')
const autocannon = require('autocannon')
const app = brewski()

const PORT = 3000

let instance

app.get('/test', (req, res) => {
  res.send({ test: true })
})

app.listen(PORT, startBench)

function startBench () {
  instance = autocannon(
    {
      connections: 200,
      duration: 30,
      url: `http://localhost:${PORT}/test`
    },
    finishedBench
  )

  autocannon.track(instance)

  function finishedBench (error, res) {
    if (error) {
      console.log(error)
      return
    }
    app.server.close()
  }
}

process.once('SIGINT', () => {
  instance.stop()
})

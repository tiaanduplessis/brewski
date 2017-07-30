const brewski = require('../index')

const app = brewski({
  env: {
    port: 8888
  }
})

const { log, env } = app

app.get('/test', (req, res) => {
  log.info('Request to /test')
  res.send({ test: true })
})

app.get('/foo/:name', (req, res) => {
  res.status(201).send({ name: req.params.name })
})

app.get('/baz', (req, res) => {
  res.send({ name: req.query.name })
})

app.listen(app.env.port)

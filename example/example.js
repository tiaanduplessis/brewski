const brewski = require('./index')

const app = brewski()
const { log, env } = app

app.get('/test', (req, res) => {
  log.info('Request to /test')
  res.send(200, { test: true })
})

app.get('/:name', (req, res) => {
  res.send(200, { name: req.params.name })
})

app.get('/baz', (req, res) => {
  res.send(200, { name: req.query.name })
})

app.listen(app.env.PORT)

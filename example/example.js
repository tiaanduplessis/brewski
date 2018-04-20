const brewski = require('../index')

const app = brewski({
  env: {
    port: 8888
  }
})

const { log } = app

app.use((req, res, next) => {
  log.info({ url: req.url })
  next()
})

// Middleware with error
// app.use((req, res, next) => {
//   next(new Error('Should be error'))
// })

// http://localhost:8888
app.get('/', (req, res) => {
  res.send('Hi from brewski')
})

// http://localhost:8888/json
app.get('/json', (req, res) => {
  res.send({ test: true })
})

// http://localhost:8888/status/tiaan
app.get('/status/:name', (req, res) => {
  res.status(201).send({ name: req.params.name })
})

// http://localhost:8888/query?name=Tiaan
app.get('/query', (req, res) => {
  res.send({ name: req.query.name })
})

// http://localhost:8888/html
app.get('/html', (req, res) => {
  res.html('<h1>Hi</h1>')
})

// http://localhost:8888/redirect
app.get('/redirect', (req, res) => {
  res.redirect(`http://localhost:${app.env.port}/`)
})

app.listen(app.env.port)

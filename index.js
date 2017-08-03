'use strict'

const http = require('http')
const https = require('https')

const pino = require('pino')
const Middie = require('middie')
const envobj = require('envobj')
const findMyWay = require('find-my-way')
const createRes = require('./src/create-response')
const qs = require('qs')

const supportedMethods = [
  'DELETE',
  'GET',
  'HEAD',
  'PATCH',
  'POST',
  'PUT',
  'OPTIONS'
]

const brewski = function (opts = {}) {
  const api = {}

  const log = pino(
    { level: opts.logLevel || 'info', name: 'brewski' },
    opts.logStream || process.stdout
  )

  const router = findMyWay(
    opts.defaultHandler ? { defaultRoute: opts.defaultHandler } : {}
  )

  const env = envobj(opts.env || {})

  function run (req, res) {
    router.lookup(req, res)
  }

  function runMiddleware (error, req, res) {
    if (error) {
      log.fatal(error)
      res.status(500).send({error: {name: error.name, message: error.message}})
      return
    }

    setImmediate(run, req, res)
  }

  const middleware = Middie(runMiddleware)

  let server
  if (opts.https) {
    server = https.createServer(opts.https, middleware.run)
  } else {
    server = http.createServer(middleware.run)
  }

  // Enhance the req and res objects as middlware
  function augment (req, res, next) {
    req.query = qs.parse(req.url.split('?')[1])
    createRes(res, log)
    next()
  }

  middleware.use(augment)

  // Public API methods

  function route (method, route, handler) {
    function createHandler (req, res, params) {
      req.params = params
      handler(req, res)
    }

    router.on(method, route, createHandler)

    return api
  }

  // Create shorthand route methods for all supported types
  supportedMethods.forEach(method => {
    api[method.toLowerCase()] = function (url, handler) {
      return route(method, url, handler)
    }
  })

  function use (...args) {
    middleware.use(...args)
    return api
  }
  function listen (portNumber, address, handler) {
    const port = portNumber || env.PORT

    if (arguments.length === 3) {
      server.listen(port, address, handler)
    } else {
      server.listen(port, address)
    }
  }

  api.route = route
  api.use = use
  api.server = server
  api.listen = listen
  api.log = log
  api.env = env

  return api
}

module.exports = brewski

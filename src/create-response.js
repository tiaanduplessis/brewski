'use strict'

const assert = require('assert')

const stringify = require('fast-safe-stringify')
const isStream = require('isstream')

const IN_DEV = process.env.NODE_ENV === 'development'
function createResponse (res, log) {
  function error ({ statusCode, status, message, stack }) {
    statusCode = statusCode || status

    if (statusCode) {
      send(statusCode, IN_DEV ? stack : message)
    } else {
      send(500, IN_DEV ? stack : 'Internal Server Error')
    }
  }

  function send (code, val = null) {
    res.statusCode = code

    if (val === null) {
      res.end()
      return
    }

    if (Buffer.isBuffer(val)) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/octet-stream')
      }

      res.setHeader('Content-Length', val.length)
      res.end(val)
      return
    }

    if (isStream(val)) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/octet-stream')
      }

      val.pipe(res)
      return
    }

    let str = val

    if (typeof val === 'object' || typeof val === 'number') {
      str = stringify(val)

      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json')
      }
    }

    res.setHeader('Content-Length', Buffer.byteLength(str))
    res.end(str)
  }

  return Object.assign(res, { send, error })
}

module.exports = createResponse

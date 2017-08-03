'use strict'

const assert = require('assert')

const stringify = require('fast-safe-stringify')
const isStream = require('isstream')

const OK_STATUS = 200
const REDIRECT_STATUS = 302

const IN_DEV = process.env.NODE_ENV === 'development'
function createResponse (res, log) {
  res.statusCode = OK_STATUS
  function error ({ statusCode, status, message, stack }) {
    statusCode = statusCode || status

    if (statusCode) {
      send(statusCode, IN_DEV ? stack : message)
    } else {
      send(500, IN_DEV ? stack : 'Internal Server Error')
    }
  }

  function send (val = null) {
    if (val === null) {
      res.end()
      return
    }

    if (typeof val === 'object' || Array.isArray(val)) {
      const str = stringify(val)

      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json')
      }

      res.setHeader('Content-Length', Buffer.byteLength(str))
      res.end(str)
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

    res.setHeader('Content-Type', 'text/plain')
    res.end(val)
  }

  function status (code = OK_STATUS) {
    assert.equal(
      typeof code,
      'number',
      'brewski:status - code should be a number'
    )
    res.statusCode = code

    return res
  }

  function redirect (url) {
    assert(url, 'brewski:redirect - url is required')
    res.writeHead(302, { Location: url })
    res.end()
  }

  function html (str = '') {
    assert(url, 'brewski:html - HTML string is required')

    res.set('Content-Type', 'text/html')
    res.end(str)
  }

  return Object.assign(res, { send, error, status, redirect, html })
}

module.exports = createResponse

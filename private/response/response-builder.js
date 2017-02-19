'use strict'

/*
 * NotifyMe project.
 *
 * Copyright (C) 2016 Emeric MARTINEAU
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
const _ = require('lodash')
const Response = require('./response')
let LOGGER

const ResponseBuilder = function () {
}

ResponseBuilder.prototype.badRequest = function (msg) {
  if (_.isEmpty(msg)) {
    msg = 'Bad Request'
  }

  return new Response(400, msg)
}

ResponseBuilder.prototype.notFound = function (msg) {
  if (_.isEmpty(msg)) {
    msg = 'Not Found'
  }

  return new Response(404, msg)
}

ResponseBuilder.prototype.ok = function (msg) {
  if (_.isEmpty(msg)) {
    msg = 'OK'
  }

  return new Response(200, msg)
}

ResponseBuilder.prototype.created = function (msg) {
  if (_.isEmpty(msg)) {
    msg = 'Created'
  }

  return new Response(201, msg)
}

ResponseBuilder.prototype.okNoContent = function (msg) {
  if (_.isEmpty(msg)) {
    msg = 'No Content'
  }

  return new Response(204, msg)
}

ResponseBuilder.prototype.internalError = function (msg) {
  if (_.isObject(msg)) {
    LOGGER.error(JSON.stringify(msg))
  } else {
    LOGGER.error(msg)
  }

  return new Response(500, 'Internal Server Error')
}

module.exports = (log4js) => {
  LOGGER = log4js.getLogger('error')

  return new ResponseBuilder()
}

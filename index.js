'use strict'

/*
 * NotifyMe project
 *
 * Copyright (C) 2016 Emeric MARTINEAU
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
let http = require('http')
let _ = require('lodash')

// -----------------------------------------------------------------------------
// Config read.
let config

// process.env['DEBUG'] = 'socket.io:*'

if (_.isUndefined(process.env.NOTIFYME_CONFIG_FILE) ||
  _.isEmpty(process.env.NOTIFYME_CONFIG_FILE)) {
  console.log('Config file : ./dev-config')
  config = require('./dev-config')
} else {
  console.log('Config file : ' + process.env.NOTIFYME_CONFIG_FILE)
  config = require(process.env.NOTIFYME_CONFIG_FILE)
}

// -----------------------------------------------------------------------------
// Logger init
// make a log directory, just in case it isn't there.
if (!_.isEmpty(config.log.logdir)) {
  try {
    require('fs').mkdirSync(config.log.logdir)
  } catch (e) {
    if (e.code !== 'EEXIST') {
      console.error('Could not set up log directory, error was: ', e)
      process.exit(1)
    }
  }
}

// Initialise log4js first, so we don't miss any log messages
let log4js = require('log4js')
let configLogFile

if (_.isUndefined(config.log.logfile) ||
  _.isNull(config.log.logfile)) {
  configLogFile = './dev-log4js.json'
} else {
  configLogFile = config.log.logfile
}

if (_.isEmpty(config.log.logdir)) {
  log4js.configure(configLogFile)
} else {
  log4js.configure(configLogFile, { cwd: config.log.logdir })
}

const LOGGER = log4js.getLogger('startup')

// -----------------------------------------------------------------------------
// Create and run application.
const application = require('./private/app')(config, log4js)

const app = application.app
const messageCallback = application.messageCallback

// Get port from environment and store in Express.
app.set('port', config.server.port)

// Create HTTP server.
const server = http.createServer(app)

require('./private/io')(log4js, server, messageCallback)

// Listen on provided port, on all network interfaces.
server.listen(config.server.port, config.server.inet)
server.on('error', onError)
server.on('listening', onListening)

// Event listener for HTTP server "error" event.
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof config.server.port === 'string'
    ? 'Pipe ' + config.server.port
    : 'Port ' + config.server.port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      LOGGER.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      LOGGER.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

// Event listener for HTTP server "listening" event.
function onListening () {
  let addr = server.address()
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  LOGGER.debug('Listening on ' + bind)
}

LOGGER.info('Server start on ' + config.server.inet + ':' + config.server.port)

console.log('NotifyMe is started, enjoy !')

// Only for test
module.exports = server

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
const _ = require('lodash')
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fs = require('fs')
const auth = require('./auth')

module.exports = (config, log4js) => {
  const LOGGER = log4js.getLogger('startup')
  const LOGGER_SERVER = log4js.getLogger('server')

  const app = express()

  // uncomment after placing your favicon in /public
  app.use(log4js.connectLogger(LOGGER_SERVER))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(cookieParser())
  app.enable('strict routing')

  // No front folder specified. Use internal static web page.
  if (_.isEmpty(config.front) || _.isEmpty(config.front.path)) {
    LOGGER.debug('No front folder specified. Use internal static web page.')

    app.use(express.static(path.join(__dirname, '..', 'public')))
    app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')))
  } else {
    LOGGER.debug('Use static folder : ' + config.front.path)

    app.use(express.static(config.front.path))
    app.use(favicon(path.join(config.front.path, 'favicon.ico')))
  }

  // Remove X-Powered-By header
  app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By')
    next()
  })

  const apiRouter = express.Router({mergeParams: true})
  app.use('/api', apiRouter)

  // ---------------------------------------------------------------------------
  // Swagger UI server
  require('express-swagger-ui')({
    app: app,
    swaggerUrl: '/swagger/swagger.yaml',  // this is the default value
    localPath: '/swagger/'       // this is the default value
  })

  app.get('/swagger/swagger.yaml', (req, res, next) => {
    res.sendFile('swagger.yaml', { root: path.join(__dirname, '../api/swagger') })
  })

  // ---------------------------------------------------------------------------
  // Database init.
  const databaseConfig = require('./database')(config)

  // ---------------------------------------------------------------------------
  // Global singleton init.
  // global.singletonContext = {}

  // ---------------------------------------------------------------------------
  // Auto include service.
  // Add one folder then put your route files there my router folder name is
  // routers.
  const routePath = path.join(__dirname, 'api/')
  const ResponseBuilder = require('./response/response-builder')(log4js)

  const params = {
    app: app,
    router: apiRouter,
    responseBuilder: ResponseBuilder,
    auth: auth,
    config: config,
    db: databaseConfig,
    log: log4js
  }

  fs.readdirSync(routePath).forEach((file) => {
    if (fs.lstatSync(path.join(routePath, file)).isFile()) {
      let route = routePath + file

      LOGGER.debug('Create route for file : ' + route)

      require(route)(params)
    }
  })

  // ---------------------------------------------------------------------------
  // Catch 404 and forward to error handler.
  app.use((req, res, next) => {
    next(ResponseBuilder.notFound())
  })

  // ---------------------------------------------------------------------------
  // Response handler.
  app.use((err, req, res, next) => {
    if (!(_.isFunction(err.message) && _.isFunction(err.status))) {
      LOGGER.error(err)

      res.status(500).send('Ooops. Internal error. Not good :-(')
    } else if (_.isObject(err.message())) {
      res.status(err.status()).json(err.message())
    } else {
      res.status(err.status()).send(err.message())
    }
  })

  if (!_.isEmpty(config.server.type) &&
    config.server.type === 'development') {
    LOGGER.debug('Developpement mode, use dev error handler')

    let errorHandler = require('errorhandler')
    app.use(errorHandler({ dumpExceptions: true, showStack: true }))
  } else {
    // production error handler
    // no stacktraces leaked to user
    LOGGER.debug('Production mode, no error handler')
  }

  const messageCallback = require('./message')(log4js, databaseConfig)

  return {
    app: app,
    messageCallback: messageCallback
  }
}

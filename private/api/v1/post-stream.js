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
const basicAuth = require('basic-auth')
const _ = require('lodash')

/**
 * This file create stream.
 *
 * @param app express js application
 * @param apiRouter router for '/api/'
 */
module.exports = (params) => {
  const LOGGER = params.log.getLogger('api-stream')
  const DEBUG = params.log.levels.DEBUG
  const Stream = require('../../db/stream')(params.db)
  const re = /^[a-z0-9_]+$/
  const RB = params.responseBuilder

  params.router.post('/stream', params.auth, (req, res, next) => {
    const request = req.body

    let response

    if (!(_.has(request, 'name') && _.has(request, 'description'))) {
      // Missing field in request
      response = RB.badRequest(
        'Field "name" and "description" must be set'
      )

      next(response)
    } else if (re.test(request.name)) {
      // Try create stream
      const user = basicAuth(req)

      if (LOGGER.isLevelEnabled(DEBUG)) {
        LOGGER.debug('Create stream "' + request.name + '" by user "' +
          user.name + '"')
      }

      Stream.find({name: request.name})
        .exec()
        .then(stream => {
          if (!stream.length) {
            if (LOGGER.isLevelEnabled(DEBUG)) {
              LOGGER.debug('Stream "' + request.name + '" not found can create it.')
            }

            // No stream not found, create it
            const stream = new Stream()

            stream.name = request.name
            stream.description = request.description
            stream.username = user.name

            stream.save((err) => {
              if (err) {
                response = RB.internalError(err)
              } else {
                if (LOGGER.isLevelEnabled(DEBUG)) {
                  LOGGER.debug('Stream "' + request.name + '" save.')
                }

                response = RB.created()
              }

              next(response)
            })
          } else {
            if (LOGGER.isLevelEnabled(DEBUG)) {
              LOGGER.debug('Stream "' + request.name + '" already exists.')
            }

            // Stream found, error !
            response = RB.badRequest(
              'Stream "' + request.name + '" already exits.'
            )

            next(response)
          }
        })
        .catch((err) => {
          // Other error
          const response = RB.internalError(err)

          next(response)
        })
    } else {
      // Stream have not good typo
      response = RB.badRequest(
        'Stream name must be ^[a-z0-9_]+$'
      )

      next(response)
    }
  })
}

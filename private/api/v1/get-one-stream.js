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

/**
 * Return stream information.
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

  params.router.get('/stream/:streamName', params.auth, (req, res, next) => {
    basicAuth(req)

    if (re.test(req.params.streamName)) {
      if (LOGGER.isLevelEnabled(DEBUG)) {
        LOGGER.debug('Return stream "' + req.params.streamName + '".')
      }

      Stream.findOne({name: req.params.streamName})
        .select('-_id name createdate username description')
        .exec()
        .then(stream => {
          if (stream) {
            res.status(200).json(stream)
          } else {
            next(RB.notFound('Stream "' + req.params.streamName +
              '" not found.'))
          }
        })
        .catch(err => {
          const response = RB.internalError(err)

          next(response)
        })
    } else {
      const response = RB.badRequest(
        'Stream name must be ^[a-z0-9_]+$'
      )

      next(response)
    }
  })
}

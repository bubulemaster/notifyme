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
 * Delete stream.
 *
 * @param app express js application
 * @param apiRouter router for '/api/'
 */
module.exports = (params) => {
  const LOGGER = params.log.getLogger('api-stream')
  const DEBUG = params.log.levels.DEBUG
  const Stream = require('../../db/stream')(params.db)
  const re = /^[a-z0-9_]+$/
  const MONGO = params.db.connection.db
  const RB = params.responseBuilder

  params.router.delete('/stream/:streamName', params.auth, (req, res, next) => {
    const user = basicAuth(req)

    if (re.test(req.params.streamName)) {
      if (LOGGER.isLevelEnabled(DEBUG)) {
        LOGGER.debug('Delete stream "' + req.params.streamName + '" by user "' +
          user.name + '"')
      }

      const collectionName = 'stream-' + req.params.streamName

      const funcRemove = () => {
        Stream.remove({name: req.params.streamName})
          .exec((err, stream) => {
            let response

            if (err) {
              response = RB.internalError(err)
            } else if (stream.result.n === 0) {
              // Stream not found
              response = RB.notFound(
                'Stream "' + req.params.streamName + '" not found.')
            } else {
              if (LOGGER.isLevelEnabled(DEBUG)) {
                LOGGER.debug('Delete stream "' + req.params.streamName +
                  '" by user "' + user.name + '" is done.')
              }

              response = RB.okNoContent()
            }

            next(response)
          })
      }

      MONGO.listCollections({name: collectionName})
        .next((err, collinfo) => {
          if (err) {
            // Other error
            const response = RB.internalError(err)

            next(response)
          } else if (collinfo) {
            if (LOGGER.isLevelEnabled(DEBUG)) {
              LOGGER.debug('Collection for stream "' + req.params.streamName +
                '" found, delete it.')
            }

            // Collection find
            MONGO.dropCollection(collectionName, err => {
              if (err) {
                next(RB.internalError(err))
              } else {
                funcRemove()
              }
            })
          } else {
            if (LOGGER.isLevelEnabled(DEBUG)) {
              LOGGER.debug('Collection for stream "' + req.params.streamName +
                '" NOT found.')
            }

            // Collection not found
            funcRemove()
          }
        })
    } else {
      const response = RB.badRequest(
        'Stream name must be ^[a-z0-9_]+$'
      )

      next(response)
    }
  })
}

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
 * Update (rename, change description) stream.
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

  params.router.put('/stream/:streamName/', params.auth, (req, res, next) => {
    const user = basicAuth(req)
    const request = req.body

    if (!(_.has(request, 'name') || _.has(request, 'description'))) {
      // Missing field in request
      const response = RB.badRequest(
        'Field "name" or "description" must be set'
      )

      next(response)
    } else if (re.test(req.params.streamName)) {
      let newStream = {}

      if (_.has(request, 'name')) {
        if (LOGGER.isLevelEnabled(DEBUG)) {
          LOGGER.debug('Stream "' + req.params.streamName + '" rename to "' +
            request.name + '" by user "' + user.name + '"')
        }

        if (!re.test(request.name)) {
          // Field name is invalid
          const response = RB.badRequest(
            'Field "name" must be ^[a-z0-9-]+$'
          )

          next(response)

          return
        } else if (request.name === req.params.streamName) {
          // If same name
          const response = RB.badRequest(
            'New name and old name of stream are same.'
          )

          next(response)

          return
        } else {
          newStream['name'] = request.name
        }
      }

      if (_.has(request, 'description')) {
        if (LOGGER.isLevelEnabled(DEBUG)) {
          LOGGER.debug('Stream "' + req.params.streamName +
            '" has new description "' + request.description +
            '" by user "' + user.name + '"')
        }

        newStream['description'] = request.description
      }

      Stream.findOneAndUpdate({name: req.params.streamName},
        {$set: newStream})
        .exec()
        .then(stream => {
          if (_.isEmpty(stream)) {
            const response = RB.badRequest('Stream "' +
              req.params.streamName + '" not found.')

            next(response)
          } else if (_.has(newStream, 'name')) {
            // Rename collection
            const oldCollectionName = 'stream-' + req.params.streamName
            const newCollectionName = 'stream-' + newStream.name

            MONGO.listCollections({name: oldCollectionName})
              .next((err, collinfo) => {
                if (collinfo) {
                  if (LOGGER.isLevelEnabled(DEBUG)) {
                    LOGGER.debug('Rename collection "' + oldCollectionName +
                      '" rename to "' + newCollectionName + '" by user "' +
                      user.name + '"')
                  }

                  MONGO.collection(oldCollectionName).rename(newCollectionName,
                    (err, newColl) => {
                      let response

                      if (err) {
                        response = RB.internalError(err)
                      } else {
                        response = RB.okNoContent()
                      }

                      next(response)
                    })
                } else if (err) {
                  next(RB.internalError(err))
                } else {
                  next(RB.okNoContent())
                }
              })
          } else {
            // No rename
            next(RB.okNoContent())
          }
        })
        .catch(err => {
          const response = RB.internalError(err)

          next(response)
        })
    } else {
      let response = RB.badRequest(
        'Stream name must be ^[a-z0-9-]+$'
      )

      next(response)
    }
  })
}

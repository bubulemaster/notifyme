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
 * Update user.
 *
 * @param app express js application
 * @param apiRouter router for '/api/'
 */
module.exports = (params) => {
  const LOGGER = params.log.getLogger('api-user')
  const DEBUG = params.log.levels.DEBUG
  const re = /^[a-zA-Z.0-9_]+$/
  const User = require('../../db/user')(params.db)
  const Stream = require('../../db/stream')(params.db)
  const RB = params.responseBuilder

  params.router.put('/user/:username?', params.auth, (req, res, next) => {
    const request = req.body

    basicAuth(req)

    if (re.test(req.params.username) && _.has(request, 'streams') &&
      _.isArray(request.streams)) {
      if (LOGGER.isLevelEnabled(DEBUG)) {
        LOGGER.debug('Update user "' + req.params.username + '" with streams "' +
          JSON.stringify(request.streams) + '".')
      }

      // First search all stream by name
      Stream.find({name: {
        $in: request.streams
      }}, '_id name').exec()
      .then(s => {
        return new Promise((resolve, reject) => {
          if (s.length === request.streams.length) {
            // We have found all stream, great !
            let streamsId = []

            s.forEach(e => streamsId.push(e._id))

            if (LOGGER.isLevelEnabled(DEBUG)) {
              LOGGER.debug('All streams found: "' + JSON.stringify(streamsId) +
                '".')
            }

            resolve(streamsId)
          } else {
            // Search missing streams
            let streamNotFound = _.filter(request.streams, item => {
              return _.isUndefined(
                _.find(s, cs => { return cs.name === item }))
            })

            if (LOGGER.isLevelEnabled(DEBUG)) {
              LOGGER.debug('Some streams not found: "' +
                JSON.stringify(streamNotFound) + '".')
            }

            reject(streamNotFound)
          }
        })
      })
      .then(stream => {
        // All stream found. s is all stream with _id to update user
        let obj = {
          streams: stream
        }

        return User.update({username: req.params.username}, obj, {
          upsert: true,
          setDefaultsOnInsert: true
        }).exec()
      })
      .then(() => {
        // User is updated. Great
        let response = RB.okNoContent()

        next(response)
      })
      .catch(snf => {
        // Some stream in input not found.
        let response = RB.badRequest(
          'One or more stream not found : "' + _.join(snf, ', ') + '".'
        )

        next(response)
      })
      .catch(() => {
        // Other error
        let response = RB.internalError()

        next(response)
      })
    } else {
      let response = RB.badRequest(
        'Request must be contain list of stream.' +
        ' Field "streams" must be an array.'
      )

      next(response)
    }
  })
}

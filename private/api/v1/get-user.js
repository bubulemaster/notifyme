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
 * Return user configuration.
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

  params.router.get('/user/:username?', params.auth, (req, res, next) => {
    basicAuth(req)

    if (re.test(req.params.username)) {
      User.findOne({username: req.params.username})
        .select('-_id username lastlogindate streams')
        .lean() // to export user as a standard JS object
        .exec()
        .then(user => {
          if (_.isEmpty(user)) {
            const response = RB.notFound(
              'User "' + req.params.username + '" is not found.'
            )

            next(response)
          } else {
            if (LOGGER.isLevelEnabled(DEBUG)) {
              LOGGER.debug('User "' + req.params.username + '" found.')
            }

            Stream.find({_id: {
              $in: user.streams
            }}, '-_id name').exec()
            .then(stream => {
              if (LOGGER.isLevelEnabled(DEBUG)) {
                LOGGER.debug('Found streams "' + JSON.stringify(stream) +
                  '" for user "' + req.params.username + '" found.')
              }

              let streamsName = []

              stream.forEach(cs => streamsName.push(cs.name))

              user.streams = streamsName

              res.status(200).json(user)
            })
            .catch(err => {
              // Other error
              next(RB.internalError(err))
            })
          }
        })
        .catch(err => {
          // Other error
          next(RB.internalError(err))
        })
    } else {
      const response = RB.badRequest(
        'Username must be ^[a-z0-9-]+$'
      )

      next(response)
    }
  })
}

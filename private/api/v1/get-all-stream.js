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
  const RB = params.responseBuilder

  params.router.get('/stream/', params.auth, (req, res, next) => {
    basicAuth(req)

    if (LOGGER.isLevelEnabled(DEBUG)) {
      LOGGER.debug('Return all streams params.')
    }

    Stream.find({})
      .select('-_id name createdate username description')
      .exec()
      .then(stream => {
        res.status(200).json(stream)
      })
      .catch(err => {
        const response = RB.internalError(err)

        next(response)
      })
  })
}

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
const pjson = require('../../package.json')

/**
 * This file create serve about.
 *
 * @param app express js application
 * @param apiRouter router for '/api/'
 */
module.exports = (params) => {
  const Stream = require('../db/stream')(params.db)
  const User = require('../db/user')(params.db)

  params.router.get('/about', (req, res, next) => {
    let streamCount

    Stream.count({})
      .exec()
      .then(sc => {
        streamCount = sc

        return User.count({})
      })
      .then(userCount => {
        res.json({
          name: 'NotifyMe',
          version: pjson.version,
          streams: {
            count: streamCount
          },
          users: {
            count: userCount
          }
        })
      })
      .catch((err) => {
        console.log(err)
        res.json({
          name: 'NotifyMe',
          version: pjson.version,
          streams: {
            count: '???'
          },
          users: {
            count: '???'
          }
        })
      })
  })
}

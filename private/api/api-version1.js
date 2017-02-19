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
const express = require('express')
const path = require('path')
const fs = require('fs')

/**
 * This file create serve about.
 *
 * @param app express js application
 * @param apiRouter router for '/api/'
 */
module.exports = (params) => {
  const apiV1Router = express.Router({mergeParams: true})
  params.router.use('/v1', apiV1Router)

  const paramsV1 = Object.assign({}, params, { router: apiV1Router })

  // ---------------------------------------------------------------------------
  // Auto include service.
  // Add one folder then put your route files there my router folder name is
  // routers.
  const routePath = path.join(__dirname, 'v1/')

  fs.readdirSync(routePath).forEach(file => {
    if (fs.lstatSync(path.join(routePath, file)).isFile()) {
      let route = routePath + file
      require(route)(paramsV1)
    }
  })
}

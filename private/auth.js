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

module.exports = (req, res, next) => {
  function unauthorized (res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
    return res.sendStatus(401)
  };

  const user = basicAuth(req)

  if (!user || !user.name /* || !user.pass */) {
    return unauthorized(res)
  };

  /*
  if (user.name === 'foo' && user.pass === 'bar') {
  */
  return next()
  /*
  } else {
    return unauthorized(res)
  }
  */
}

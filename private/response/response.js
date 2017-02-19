'use strict'

/*
 * NotifyMe project.
 *
 * Copyright (C) 2016 Emeric MARTINEAU
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

/**
 * This file create an http error.
 *
 * @param httpCodeInput status code of http response
 * @param messageInput message
 */
const Response = function (httpCode, message) {
  this.status = () => {
    return httpCode
  }

  this.message = () => {
    return message
  }
}

module.exports = Response

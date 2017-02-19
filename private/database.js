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
 * This file create database connection and return map with connection.
 *
 * @param config server config
 */
module.exports = config => {
  const mongoose = require('mongoose')

  mongoose.Promise = global.Promise

  mongoose.connect(config.db.url, config.db.options, err => {
    // TODO add log to error
    if (err) {
      console.log('Cannot connect to MongoDB server.')
      throw err
    }
  })

  return mongoose
}

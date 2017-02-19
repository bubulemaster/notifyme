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
module.exports = (log4js, databaseConfig) => {
  const LOGGER_MESSAGE = log4js.getLogger('message')

  const Stream = require('./db/stream')(databaseConfig)
  const User = require('./db/user')(databaseConfig)

  const messageCallback = {
    onMessage: (msg, username) => {
      return new Promise((resolve, reject) => {
        LOGGER_MESSAGE.debug('Message receive : ' + JSON.stringify(msg) + ' from ' + username)

        Stream.find({name: msg.stream})
          .exec()
          .then(streams => {
            if (streams.length > 0) {
              LOGGER_MESSAGE.debug('Stream found to save message.')

              // Stream found.
              let Message = require('./db/message')(msg.stream, databaseConfig)

              let message = new Message()

              // TODO set title, msgType
              message.message = msg.message
              message.username = username
              message.title = null
              message.msgtype = 'notification'

              message.save()
                .then(() => resolve(message))
                .catch(err => {
                  LOGGER_MESSAGE.error(err)

                  reject(err)
                })
            } else {
              LOGGER_MESSAGE.debug('Stream ' + msg.stream + ' doesn\'t exists')

              reject('')
            }
          })
          .catch(err => {
            LOGGER_MESSAGE.debug('Error when searching stream ' + msg.stream)

            reject(err)
          })
      })
    },
    onLogin: (username) => {
      let obj = {
        username: username,
        lastlogindate: Date.now()
      }

      return User.update({username: username}, obj, {
        upsert: true,
        setDefaultsOnInsert: true
      }).exec()
    }
  }

  return messageCallback
}

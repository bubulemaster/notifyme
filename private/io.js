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
const _ = require('lodash')

/**
 * This file create database connection and return map with connection.
 *
 * @param config server config
 */
module.exports = (log4js, server, messageCallback) => {
  const LOGGER_MESSAGE = log4js.getLogger('message')

  const io = require('socket.io')(
    server,
    {
      path: '/streams.io'
    }
  )

  io.on('connection', socket => {
    LOGGER_MESSAGE.debug('New connection')

    socket.on('chat message', msg => {
      LOGGER_MESSAGE.debug('Receive new message')

      if (_.has(msg, 'message') && _.has(msg, 'stream')) {
        LOGGER_MESSAGE.debug('Manage message.')

        messageCallback.onMessage(msg, socket.client.username)
          .then(msgDataBase => {
            LOGGER_MESSAGE.debug('Message saved.')

            const newMessage = {
              message: msgDataBase.message,
              username: socket.client.username,
              title: msgDataBase.title,
              msgtype: msgDataBase.msgtype,
              stream: msg.stream
            }

            io.emit('chat message', newMessage)
          })
          .catch(() => console.log('Error in stream how send to client ?'))
        // TODO return error if stream not exists or another error
      }
    })
  })

  // If necessary, add timeout: 'none',
  require('socketio-auth')(io, {
    authenticate: (socket, data, callback) => {
      LOGGER_MESSAGE.debug('New authentication for user : ' + data.username)
      // TODO allow in config file to set authentication method (File, LDAP...)
      /*
      // get credentials sent by the client
      let username = data.username
      let password = data.password
      */
      let result

      if (_.isEmpty(data.username)) {
        result = callback(new Error('User not found'))
      } else {
        messageCallback.onLogin(data.username)
        .then(() => (result = callback(null, true)))
        .catch(() => (result = callback(new Error('Can\'t update user'))))
      }

      return result

      /*
      db.findUser('User', {username:username}, (err, user) => {

        //inform the callback of auth success/failure
        if (err || !user) return callback(new Error("User not found"))
        return callback(null, user.password == password)
      })
      */
    },
    postAuthenticate: (socket, data) => {
      socket.client.username = data.username
    },
    disconnect: socket => {
      LOGGER_MESSAGE.debug('User : ' + socket.client.username + ' disconnected')

      socket.client.username = null
    }
  })
}

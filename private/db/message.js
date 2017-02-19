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
let message = null

const typeEnum = ['notification', 'information', 'question', 'survey']

module.exports = (streamName, mongoose) => {
  if (message == null) {
    message = new mongoose.Schema({
      msgtype: {
        type: String,
        enum: typeEnum,
        default: 'notification'
      },
      createdate: {
        type: Date,
        default: Date.now
      },
      title: {
        type: String
      },
      message: {
        type: String,
        required: true,
        message: 'Message must have body'
      },
      username: {
        type: String,
        required: true,
        message: 'Message must have username'
      }
    })
  }

  return mongoose.model('Message', message, 'stream-' + streamName)
}

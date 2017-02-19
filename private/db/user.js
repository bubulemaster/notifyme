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
let user = null

module.exports = mongoose => {
  const Schema = mongoose.Schema

  if (user == null) {
    user = new Schema({
      username: {
        type: String,
        required: true,
        message: 'Message must have username'
      },
      lastlogindate: {
        type: Date,
        default: Date.now
      },
      streams: {
        type: [{
          type: Schema.Types.ObjectId,
          ref: 'Stream'
        }],
        default: []
      }
    })
  }

  return mongoose.model('User', user)
}

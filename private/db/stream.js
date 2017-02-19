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
/*
 TODO multi connection
 var conn      = mongoose.createConnection('mongodb://localhost/testA');
var conn2     = mongoose.createConnection('mongodb://localhost/testB');

// stored in 'testA' database
var ModelA    = conn.model('Model', new mongoose.Schema({
  title : { type : String, default : 'model in testA database' }
}));

// stored in 'testB' database
var ModelB    = conn2.model('Model', new mongoose.Schema({
  title : { type : String, default : 'model in testB database' }
}));
 */

let streams = null

module.exports = mongoose => {
  if (streams == null) {
    const stream = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        message: 'Stream must have name'
      },
      createdate: {
        type: Date,
        default: Date.now
      },
      username: {
        type: String,
        required: true,
        message: 'Stream must have user name'
      },
      description: {
        type: String
      }
    })

    streams = mongoose.model('Stream', stream, 'streams')
  }

  return streams
}

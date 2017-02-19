const supertest = require('supertest')

describe('Integration tests', () => {
  before(done => {
    process.env['NOTIFYME_CONFIG_FILE'] = './test/int-config.json'

    const server = require('../../index')
    const mongoose = require('mongoose')

    global.server = server
    global.mongoose = mongoose

    // Clear all collections
    mongoose.connection.on('open', () => {
      mongoose.connection.db.listCollections().toArray((err, names) => {
        if (err) {
          console.error('Cannot remove collections', err)
        } else {
          names.forEach(collinfo => {
            mongoose.connection.db.dropCollection(collinfo.name, err => {
              if (err) {
                console.error('Cannot remove collection : ' + collinfo.name, err)
              }
            })
          })

          // Create user
          const User = require('../../private/db/user')(global.mongoose)

          User.create({
            username: 'John',
            lastlogindate: Date.now()
          })
            .then(() => done())
            .catch(err => {
              console.error('Cannot create user !', err)
            })
        }
      })
    })
  })

  after(() => {
    global.server.close()
  })

  const test = [
    './about/test-about',
    './stream/test-stream-create',
    './stream/test-stream-read',
    './stream/test-stream-delete',
    './stream/test-stream-message',
    './user/test-user'
  ]

  const config = require('../int-config.json')

  test.forEach(t => require(t)(supertest, () => global.server,
    () => global.mongoose, config))
})

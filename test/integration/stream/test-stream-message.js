const assert = require('assert')

function createIo (inet, port) {
  return require('socket.io-client')('http://' + inet + ':' + port + '/', {path: '/streams.io'})
}

module.exports = (supertest, getServer, getMongoose, config) => {
  describe('Messages', () => {
    it('Send to exists stream', (done) => {
      const server = getServer()

      supertest(server)
        .post('/api/v1/stream')
        .auth('John', '')
        .send({
          'name': 'test_stream',
          'description': 'une description'
        })
        .expect(201)
        .end(() => {
          const socket = createIo(config.server.inet, config.server.port)
          const socketOther = createIo(config.server.inet, config.server.port)

          socketOther.on('connect', () => {
            // Send authentication
            socketOther.emit('authentication', {username: 'Jack', password: 'secret'})

            // We authentication is good
            socketOther.on('authenticated', () => {
              socket.on('chat message', (msg) => {
                assert.strictEqual(msg.message, 'Great it\'s working !')
                assert.strictEqual(msg.stream, 'test_stream')

                socketOther.emit('end')

                done()
              })
            })
          })

          socket.on('connect', () => {
            // Send authentication
            socket.emit('authentication', {username: 'John', password: 'secret'})

            // We authentication is good
            socket.on('authenticated', () => {
              // use the socket as usual
              socket.emit('chat message',
                {
                  message: 'Great it\'s working !',
                  stream: 'test_stream'
                })

              socket.emit('end')
            })
          })
        })
    })
  })
}

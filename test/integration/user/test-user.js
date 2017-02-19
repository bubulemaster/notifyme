const assert = require('assert')
const _ = require('lodash')

module.exports = (supertest, getServer) => {
  describe('User', () => {
    it('Add stream', (done) => {
      const server = getServer()

      supertest(server)
        .put('/api/v1/user/John')
        .auth('John', '')
        .send({
          streams: [ 'test_stream' ]
        })
        .expect(204)
        .end(done)
    })

    it('Get stream', (done) => {
      const server = getServer()

      supertest(server)
        .get('/api/v1/user/John')
        .auth('John', '')
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.body.username, 'John')

          assert.ok(_.isArray(res.body.streams))
          assert.strictEqual(res.body.streams.length, 1)

          assert.strictEqual(res.body.streams[0], 'test_stream')

          done()
        })
    })
  })
}

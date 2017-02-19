const assert = require('assert')
const _ = require('lodash')

module.exports = (supertest, getServer) => {
  describe('Read stream', () => {
    it('One stream', (done) => {
      const server = getServer()

      supertest(server)
        .get('/api/v1/stream/test_stream')
        .auth('John', '')
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.body.name, 'test_stream')
          assert.strictEqual(res.body.description, 'une description')
          assert.strictEqual(res.body.username, 'John')

          done()
        })
    })

    it('All stream', (done) => {
      const server = getServer()

      supertest(server)
        .get('/api/v1/stream')
        .auth('John', '')
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.ok(_.isArray(res.body))
          assert.strictEqual(res.body.length, 1)

          const stream = res.body[0]

          assert.strictEqual(stream.name, 'test_stream')
          assert.strictEqual(stream.description, 'une description')
          assert.strictEqual(stream.username, 'John')

          done()
        })
    })

    it('Name error', (done) => {
      const server = getServer()

      supertest(server)
        .get('/api/v1/stream/test_streamAZEAE')
        .auth('John', '')
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.error.text, 'Stream name must be ^[a-z0-9_]+$')

          done()
        })
    })

    it('Stream not found', (done) => {
      const server = getServer()

      supertest(server)
        .get('/api/v1/stream/test_stream_dfgdfjdgfdjfg')
        .auth('John', '')
        .expect(404)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.error.text, 'Stream "test_stream_dfgdfjdgfdjfg" not found.')

          done()
        })
    })
  })
}

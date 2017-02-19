const assert = require('assert')

module.exports = (supertest, getServer) => {
  describe('Delete stream', () => {
    it('One stream', (done) => {
      const server = getServer()

      supertest(server)
        .delete('/api/v1/stream/test_stream')
        .auth('John', '')
        .expect(204)
        .end(done)
    })

    it('Stream not found', (done) => {
      const server = getServer()

      supertest(server)
        .delete('/api/v1/stream/test_stream_dfgdfjdgfdjfg')
        .auth('John', '')
        .expect(404)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.error.text, 'Stream "test_stream_dfgdfjdgfdjfg" not found.')

          done()
        })
    })

    it('Name error', (done) => {
      const server = getServer()

      supertest(server)
        .delete('/api/v1/stream/test_streamAZEAE')
        .auth('John', '')
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.error.text, 'Stream name must be ^[a-z0-9_]+$')

          done()
        })
    })
  })
}

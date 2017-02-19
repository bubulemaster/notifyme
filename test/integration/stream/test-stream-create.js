const assert = require('assert')

module.exports = (supertest, getServer) => {
  describe('Create Stream', () => {
    it('Created', (done) => {
      const server = getServer()

      supertest(server)
        .post('/api/v1/stream')
        .auth('John', '')
        .send({
          'name': 'test_stream',
          'description': 'une description'
        })
        .expect(201)
        .end(done)
    })

    it('Name error', (done) => {
      const server = getServer()

      supertest(server)
        .post('/api/v1/stream')
        .auth('John', '')
        .send({
          'name': 'test_streamTRETERTE',
          'description': 'une description'
        })
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.error.text, 'Stream name must be ^[a-z0-9_]+$')

          done()
        })
    })

    it('Already exists', (done) => {
      const server = getServer()

      supertest(server)
        .post('/api/v1/stream')
        .auth('John', '')
        .send({
          'name': 'test_stream',
          'description': 'une description'
        })
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.error.text, 'Stream "test_stream" already exits.')

          done()
        })
    })

    it('Missing field', (done) => {
      const server = getServer()

      supertest(server)
        .post('/api/v1/stream')
        .auth('John', '')
        .send({
          'description': 'une description'
        })
        .expect(400)
        .end((err, res) => {
          assert.strictEqual(err, null)

          assert.strictEqual(res.error.text, 'Field "name" and "description" must be set')

          done()
        })
    })
  })
}

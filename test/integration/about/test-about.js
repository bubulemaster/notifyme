module.exports = (supertest, getServer) => {
  describe('About', () => {
    it('Check about result', (done) => {
      const server = getServer()

      supertest(server)
        .get('/api/about')
        .expect(200, {
          name: 'NotifyMe',
          version: '0.0.1',
          streams: {
            count: 0
          },
          users: {
            count: 1
          }
        })
        .end(done)
    })
  })
}

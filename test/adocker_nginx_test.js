/**
 * Test case for adockerNginx.
 * Runs with mocha.
 */
'use strict'

const adockerNginx = require('../lib/adocker_nginx.js')
const { equal, ok } = require('assert')
const aport = require('aport')
const asleep = require('asleep')
const arequest = require('arequest')
const co = require('co')

describe('adocker-nginx', function () {
  this.timeout(300000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Adocker nginx', () => co(function * () {
    let port = yield aport()
    let nginx = adockerNginx('adocker-nginx-test-01', {
      template: `${__dirname}/../misc/mocks/nginx.conf.template`,
      staticDir: `${__dirname}/../misc/mocks/mock-public`,
      httpPublishPort: port,
      localhostAs: '10.0.2.2'
    })

    let { run, remove, logs, stop, isRunning, hasContainer } = nginx.cli()

    if (yield isRunning()) {
      yield remove({ force: true })
    }

    equal(yield isRunning(), false)
    equal(yield hasContainer(), false)
    yield run()

    equal(yield isRunning(), true)
    equal(yield hasContainer(), true)

    let { statusCode, body } = yield arequest(`http://localhost:${port}/index.html`)
    equal(statusCode, 200)
    ok(body)

    yield asleep(100)

    yield stop()

    equal(yield isRunning(), false)
    equal(yield hasContainer(), true)

    yield remove({ force: true })
  }))
})

/* global describe, before, after, it */

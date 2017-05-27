/**
 * Test case for adockerNginx.
 * Runs with mocha.
 */
'use strict'

const adockerNginx = require('../lib/adocker_nginx.js')
const { equal } = require('assert')
const aport = require('aport')
const arequest = require('arequest')
const co = require('co')

describe('adocker-nginx', function () {
  this.timeout(300000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Adocker nginx', () => co(function * () {
    let nginx = adockerNginx('adocker-nginx-test-01', {
      template: `${__dirname}/../misc/mocks/nginx.conf.template`,
      staticDir: `${__dirname}/../misc/mocks/mock-public`
    })

    let { run, remove, logs, stop, isRunning, hasBuild } = nginx.cli()

    equal(yield isRunning(), false)
    equal(yield hasBuild(), false)
    yield run()

    equal(yield isRunning(), true)
    equal(yield hasBuild(), true)

    yield logs()

    yield stop()

    equal(yield isRunning(), false)
    equal(yield hasBuild(), true)

    yield remove({ force: true })
  }))
})

/* global describe, before, after, it */

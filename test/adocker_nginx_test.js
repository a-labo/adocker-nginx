/**
 * Test case for adockerNginx.
 * Runs with mocha.
 */
'use strict'

const adockerNginx = require('../lib/adocker_nginx.js')
const {equal, ok} = require('assert')
const aport = require('aport')
const asleep = require('asleep')
const arequest = require('arequest')

describe('adocker-nginx', function () {
  this.timeout(300000)

  before(async () => {

  })

  after(async () => {

  })

  it('Adocker nginx', async () => {
    let port = await aport()
    let nginx = adockerNginx('adocker-nginx-test-01', {
      template: `${__dirname}/../misc/mocks/nginx.conf.template`,
      staticDir: `${__dirname}/../misc/mocks/mock-public`,
      httpPublishPort: port,
      localhostAs: '10.0.2.2'
    })

    let {run, remove, logs, stop, isRunning, hasContainer} = nginx.cli()

    if (await isRunning()) {
      await remove({force: true})
    }

    equal(await isRunning(), false)
    equal(await hasContainer(), false)
    await run()

    equal(await isRunning(), true)
    equal(await hasContainer(), true)

    let {statusCode, body} = await arequest(`http://localhost:${port}/index.html`)
    equal(statusCode, 200)
    ok(body)

    await asleep(100)

    await stop()

    equal(await isRunning(), false)
    equal(await hasContainer(), true)

    await remove({force: true})
  })
})

/* global describe, before, after, it */

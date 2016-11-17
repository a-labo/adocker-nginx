/**
 * Ngix docker
 * @module adocker-nginx
 * @version 1.2.1
 */

'use strict'

const adockerNginx = require('./adocker_nginx')

let lib = adockerNginx.bind(this)

Object.assign(lib, adockerNginx, {
  adockerNginx
})

module.exports = lib

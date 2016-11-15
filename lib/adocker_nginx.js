/**
 * Define commands for docker nginx
 * @function adockerNginx
 * @param {string} name - Container name
 * @param {Object} options - Optional settings
 * @returns {Object}
 */
'use strict'

const {
  logs, run
} = require('adocker/commands')
const path = require('path')
const handleError = (err) => {
  console.error(err)
  process.exit(1)
}

/** @lends adockerNginx */
function adockerNginx (name, options = {}) {
  let {
    image = 'nginx:1',
    onError = handleError,
    cwd = process.cwd(),
    port = '8080',
    conf = 'nginx.conf'
  } = options
  let bundle = {
    /**
     * Run nginx container
     */
    run: run.bind(null, {
      name,
      port: `${port}:80`,
      volume: `${path.resolve(conf)}:/etc/nginx/nginx.conf:ro`,
      detach: true
    }, image),
    /**
     * Show logs of node container
     * @returns {Promise}
     */
    logs: logs.bind(null, name)
  }
  return Object.assign(bundle, {
    cli () {
      return Object.assign({},
        ...Object.keys(bundle).map((name) => ({
          [name]: (...args) => {
            process.chdir(cwd)
            return bundle[ name ](...args).catch(onError)
          }
        }))
      )
    }
  })
}

module.exports = adockerNginx

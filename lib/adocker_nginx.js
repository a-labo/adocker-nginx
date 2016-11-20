/**
 * Define commands for docker nginx
 * @function adockerNginx
 * @param {string} name - Container name
 * @param {Object} options - Optional settings
 * @returns {Object}
 */
'use strict'

const {
  logs, run, start, stop, remove,
  inspect
} = require('adocker/commands')
const path = require('path')
const handleError = (err) => {
  console.error(err)
  process.exit(1)
}

/** @lends adockerNginx */
function adockerNginx (name, options = {}) {
  const CONF_TEMPLATE_PATH = '/etc/nginx/nginx.conf.template'
  const CONF_PATH = '/etc/nginx/nginx.conf'
  let {
    image = 'nginx:1',
    onError = handleError,
    cwd = process.cwd(),
    network = 'default',
    ports = { 8080: 80, 8081: 433 },
    template = 'nginx.conf.template',
    env = {}
  } = options
  let envNames = Object.keys(env)
  let bundle = {
    /**
     * Run nginx container
     */
    run: run.bind(null, {
      name,
      network,
      publish: Object.keys(ports).map((from) => `${from}:${ports[ from ]}`),
      env: envNames.map((name) => [ name, env[ name ] ].join('=')),
      volume: `${path.resolve(template)}:${CONF_TEMPLATE_PATH}:ro`,
      detach: true
    }, image, 'sh', '-c', `envsubst '${envNames.map((name) => '$$' + name)}' < ${CONF_TEMPLATE_PATH} > ${CONF_PATH} && nginx -g 'daemon off;'`),
    /**
     * Running
     * @returns {Promise}
     */
    isRunning: () => inspect(name).then(([info]) => !!info),
    /**
     * Show logs of node container
     * @returns {Promise}
     */
    logs: logs.bind(null, name),
    /**
     * Start nginx container
     * @returns {Promise}
     */
    start: start.bind(null, name),
    /**
     * Stop nginx container
     * @returns {Promise}
     */
    stop: stop.bind(null, name),
    /**
     * Remove nginx container
     * @param {Object} [options={}] - Optional settings
     * @param {boolean} [options.force=false] - Force to remove
     * @returns {Promise}
     */
    remove: remove.bind(null, name)
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

/**
 * Define commands for docker nginx
 * @function adockerNginx
 * @param {string} name - Container name
 * @param {Object} [options={}] - Optional settings
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
  const CERT_PATH = '/etc/nginx/certs/server.cert'
  const CERT_KEY_PATH = '/etc/nginx/certs/server.cert.key'
  const STATIC_DIR = '/usr/share/nginx/static'
  let {
    image = 'nginx:1',
    onError = handleError,
    cwd = process.cwd(),
    network = 'default',
    httpPort = 80,
    httpPublishPort = false,
    httpsPort = 443,
    httpsPublishPort = false,
    template = 'nginx.conf.template',
    cert = false,
    certKey = false,
    staticDir = false,
    env = {},
    localhostAs = false
  } = options
  env = Object.assign({
    HTTP_PORT: httpPort,
    HTTPS_PORT: httpsPort,
    CONF_PATH,
    CERT_PATH,
    CERT_KEY_PATH,
    CONF_TEMPLATE_PATH,
    STATIC_DIR
  }, env)
  let envNames = Object.keys(env)
  let bundle = {
    /**
     * Run nginx container
     */
    run: run.bind(null, {
      name,
      network,
      publish: [
        httpPublishPort && `${httpPublishPort}:${httpPort}`,
        httpsPublishPort && `${httpsPublishPort}:${httpsPort}`
      ].filter(Boolean),
      env: envNames.map((name) => [ name, env[ name ] ].join('=')),
      volume: [
        `${path.resolve(template)}:${CONF_TEMPLATE_PATH}:ro`,
        cert && `${path.resolve(cert)}:${CERT_PATH}:ro`,
        certKey && `${path.resolve(certKey)}:${CERT_KEY_PATH}:ro`,
        staticDir && `${path.resolve(staticDir)}:${STATIC_DIR}:ro`
      ].filter(Boolean),
      detach: true,
      'add-host': localhostAs ? `localhost:${localhostAs}` : false
    }, image, 'sh', '-c', `envsubst '${envNames.map((name) => '$$' + name)}' < ${CONF_TEMPLATE_PATH} > ${CONF_PATH} && nginx -g 'daemon off;'`),
    /**
     * Check if running
     * @returns {Promise.<boolean>}
     */
    isRunning: () => inspect(name).then(([ info ]) => Boolean(info && info.State.Running)),
    /**
     * Check if build
     * @returns {Promise.<boolean>}
     */
    hasContainer: () => inspect(name).then(([ info ]) => !!info),
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

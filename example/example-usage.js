'use strict'

const adockerNginx = require('adocker-nginx')

;(async () => {
  let nginx = adockerNginx('my-nginx-container-01', {
    template: 'conf/nginx.conf.template'
  })
  let { run, start, stop, remove, logs } = nginx.cli()
  await run()
  /* ... */
  await logs()
  /* ... */
  await stop()
  /* ... */
  await start()

  await remove({ force: true })
})()

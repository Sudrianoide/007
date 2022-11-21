const localtunnel = require('localtunnel');
const log = require('node-color-log');

const tunnel = async (port) => {
  const tunnel = await localtunnel({ port: port });
  log.info(`Tunnel listening on: ${tunnel.url}`)
  tunnel.on('close', () => {
    log.error(`Tunnel closed`)
  });
}

exports.tunnel = tunnel
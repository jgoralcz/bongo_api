const basePath = '/node/config';

module.exports = Object.freeze({
  api: `${basePath}/api.json`,
  basicAuth: `${basePath}/auth.json`,
  config: `${basePath}/config.json`,
  serverCert: `${basePath}/certs/ssl-bongo.crt`,
  serverKey: `${basePath}/keys/ssl-bongo.key`,
});

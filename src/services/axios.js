const axios = require('axios');

const { config, basicAuth } = require('../util/constants/paths');
const nconf = require('nconf').file('auth', basicAuth);

const username = nconf.get('username');
const password = nconf.get('password');

const nconfConfig = require('nconf').file('config', config);

const mims = nconfConfig.get('mims');

const mimsAPI = axios.create({
  baseURL: `${mims}/api`,
  auth: { username, password },
  headers: { 'Content-type': 'application/json' },
  responseType: 'arraybuffer',
});

module.exports = {
  mimsAPI,
};

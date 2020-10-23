const axios = require('axios');

const { api } = require('../util/constants/paths');
const nconf = require('nconf').file('api', api);

const mims = nconf.get('mims');

const { api: mimsURL, username: mimsUsername, password: mimsPassword } = mims;

const mimsAPI = axios.create({
  baseURL: mimsURL,
  auth: { username: mimsUsername, password: mimsPassword },
  headers: { 'Content-type': 'application/json' },
  responseType: 'arraybuffer',
});

module.exports = {
  mimsAPI,
};

const axios = require('axios');

const { api } = require('../util/constants/config');

const { mims } = api;

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

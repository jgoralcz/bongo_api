const axios = require('axios');

const { api, config } = require('../util/constants/config');

const { messenger_api: messengerURL } = config;
const { mims, messenger_api: messengerAuth } = api;

const { api: mimsURL, username: mimsUsername, password: mimsPassword } = mims;
const { username: messengerUsername, password: messengerPassword } = messengerAuth;

const mimsAPI = axios.create({
  baseURL: mimsURL,
  auth: { username: mimsUsername, password: mimsPassword },
  headers: { 'Content-type': 'application/json' },
  responseType: 'arraybuffer',
});

const messengerAPI = axios.create({
  baseURL: messengerURL,
  auth: { username: messengerUsername, password: messengerPassword },
  headers: { 'Content-type': 'application/json' },
});

module.exports = {
  mimsAPI,
  messengerAPI,
};

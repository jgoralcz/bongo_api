const axios = require('axios');

const { api } = require('../util/constants/config');

const { mims, messenger_api: messengerConfig } = api;
const { api: mimsURL, username: mimsUsername, password: mimsPassword } = mims;
const { api: messengerURL, username: messengerUsername, password: messengerPassword } = messengerConfig;

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

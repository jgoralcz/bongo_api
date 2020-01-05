const axios = require('axios');
const { mims, username, password } = require('../../config.json');

const mimsAPI = axios.create({
  baseURL: `${mims}/api`,
  auth: { username, password },
  headers: { 'Content-type': 'application/json' },
});

module.exports = {
  mimsAPI,
};

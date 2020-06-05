const basicAuth = require('express-basic-auth');
const { auth } = require('../util/constants/paths');
const nconf = require('nconf').file('auth', auth);

const username = nconf.get('username');
const password = nconf.get('password');

const authorizer = (user, pass, cb) => {
  if (user === username && pass === password) {
    return cb(null, true);
  }
  return cb(null, false);
};

const unauthResponse = (req) => (req.auth
  ? JSON.stringify({ error: `Credentials ${req.auth.user}:${req.auth.password} rejected` })
  : JSON.stringify({ error: 'No credentials provided' })
);

module.exports = {
  basicAuth,
  authorizer,
  unauthResponse,
};

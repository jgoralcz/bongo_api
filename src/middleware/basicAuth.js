const basicAuth = require('basic-auth');

const { auth } = require('../util/constants/config');

const { username, password } = auth;

const basicAuthExpress = (req, res, next) => {
  if (req.originalUrl === '/dbl/webhook') {
    return next();
  }

  const user = basicAuth(req);
  if (!user || !user.name || user.name !== username || !password || user.password !== password) {
    return res.status(401).send({ error: 'credentials rejected' });
  }

  return next();
};

module.exports = {
  basicAuthExpress,
};

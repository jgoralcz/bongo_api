const bodyparser = require('body-parser');
const express = require('express');
const logger = require('log4js').getLogger();
const fs = require('fs');
const https = require('https');
const forceSsl = require('express-force-ssl');

const router = require('./routes/Routes.js');

const { basicAuth, authorizer, unauthResponse } = require('./middleware/basicAuth');
const { errorHandler } = require('./middleware/errorhandler');
const { httpLogger } = require('./middleware/logger');

const { LOCAL, PROD, TEST, BETA } = require('./util/constants/environments');
const { serverCert, serverKey } = require('./util/constants/paths');

logger.level = 'info';
const port = process.env.PORT || 8443;
const env = process.env.NODE_ENV || LOCAL;

const server = express();

server.use(forceSsl);
server.use(basicAuth({
  authorizer,
  authorizeAsync: true,
  unauthorizedResponse: unauthResponse,
}));

server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());
server.use(httpLogger({ ignorePaths: [/^\/prefixes/, /users\/.*\/guilds\/.*/] }));

server.use('/', router, errorHandler);

const upperCaseEnv = env.toUpperCase();

if (upperCaseEnv === PROD || upperCaseEnv === TEST || upperCaseEnv === BETA) {
  const cert = { key: fs.readFileSync(serverKey), cert: fs.readFileSync(serverCert) };
  https.createServer(cert, server).listen(port, () => logger.info(`${upperCaseEnv} server started on ${port}`));
} else {
  server.listen(port, () => logger.info(`${upperCaseEnv} server started on ${port}.`));
}

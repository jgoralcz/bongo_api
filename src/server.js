const bodyparser = require('body-parser');
const express = require('express');
const logger = require('log4js').getLogger();
const hsts = require('hsts');

logger.level = 'info';
const port = 8443;

const { errorHandler } = require('./middleware/errorhandler');
const { httpLogger } = require('./middleware/logger');
const { env: { LOCAL } } = require('./util/constants/environments');

const env = process.env.NODE_ENV || LOCAL;

const router = require('./routes/Routes.js');

const server = express();

server.use(hsts({ maxAge: 31536000 }));
server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());
server.use(httpLogger());

server.use('/api/', router, errorHandler);

server.listen(port, () => logger.info(`${env.toUpperCase()} server started on ${port}`));
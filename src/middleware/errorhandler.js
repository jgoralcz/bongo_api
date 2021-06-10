const logger = require('log4js').getLogger();
const { LOCAL } = require('../util/constants/environments');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(err);
  logger.error(`{ "User Agent": "${req.headers['user-agent']}", "Host": "${req.headers.host}", "Url": "${req.originalUrl}", "Method": "${req.method}", "Params": ${JSON.stringify(req.params)}, "Query": ${JSON.stringify(req.query)}, "Body": ${JSON.stringify(req.body)}, "Status Code": "${res.statusCode}", "Status Message": "${res.statusMessage}", "Response Time": ${res.responseTime}, "Content-Type": "${req.headers['content-type']}", "Content-Length": "${req.headers['content-length']}"}`);

  const error = (process.env.NODE_ENV === LOCAL) ? {
    error: {
      name: err.name,
      stack: err.stack,
      message: err.message,
      code: err.code,
    },
  } : {
    error: {
      name: err.name,
      code: err.code,
    },
  };

  return res.status(err.status || 500).json(error);
};

module.exports = {
  errorHandler,
};

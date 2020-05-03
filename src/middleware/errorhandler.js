const logger = require('log4js').getLogger();
const { PROD } = require('../util/constants/environments');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(err);

  const error = (process.env.NODE_ENV === PROD) ? {
    error: {
      name: err.name,
      code: err.code,
    },
  } : {
    error: {
      name: err.name,
      stack: err.stack,
      message: err.message,
      code: err.code,
    },
  };

  return res.status(err.status || 500).json(error);
};

module.exports = {
  errorHandler,
};

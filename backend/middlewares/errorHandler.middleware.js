const logger = require('../config/logger');
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  if (!isAppError) {
    logger.error({ err }, 'Unexpected error');
  }

  res.status(statusCode).json({ error: { message: err.message, statusCode } });
};

module.exports = errorHandler;

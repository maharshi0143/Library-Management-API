// src/utils/errorHandler.js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (err, req, res, next) => {
  console.error(err); // keep this for server logs

  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // always JSON
  res.status(status).json({ error: message });
};

module.exports = {
  ApiError,
  errorMiddleware
};

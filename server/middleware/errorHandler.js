const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    const value = Object.values(err.keyValue);
    const message = `Duplicate value entered for ${field.join(', ')}. The value '${value.join(', ')}' already exists. Please use a different value.`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = messages.join('. ');
    return res.status(400).json({
      success: false,
      message,
      errors: messages,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    return res.status(401).json({
      success: false,
      message,
    });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your session has expired. Please log in again.';
    return res.status(401).json({
      success: false,
      message,
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum file size is 5MB.';
    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Too many files uploaded. Please try again.';
    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, notFound, AppError };
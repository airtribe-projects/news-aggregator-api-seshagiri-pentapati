/**
 * Global Error Handler Middleware
 *
 * Catches any unhandled errors thrown in route handlers or middleware
 * and returns a consistent JSON error response.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  // Log the full error in development for debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} — ${message}`);
    if (statusCode === 500) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

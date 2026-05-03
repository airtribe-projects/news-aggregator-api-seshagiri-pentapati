import express from 'express';
import authRoutes from './routes/auth.js';
import preferencesRoutes from './routes/preferences.js';
import newsRoutes from './routes/news.js';
import errorHandler from './middleware/errorHandler.js';

/**
 * Express Application Factory
 *
 * Creates and configures the Express app, mounts all route groups,
 * and attaches the global error handler. Exported separately from
 * the server start so that tests can import the app without binding
 * to a port.
 */
function createApp() {
  const app = express();

  // ---- Body parsing ----
  app.json = express.json;
  app.use(express.json());

  // ---- Health check ----
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'Server is running.' });
  });

  // ---- Route groups ----
  app.use('/api', authRoutes);
  app.use('/api/preferences', preferencesRoutes);
  app.use('/api/news', newsRoutes);

  // ---- 404 catch-all ----
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
  });

  // ---- Global error handler (must be last) ----
  app.use(errorHandler);

  return app;
}

export default createApp;

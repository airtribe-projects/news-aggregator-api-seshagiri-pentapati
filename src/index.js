import config from './config/index.js';
import createApp from './app.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`News Aggregator API running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${config.port} is already in use. Trying port ${config.port + 1}...`);
    server.listen(config.port + 1);
  } else {
    console.error('Server error:', err);
  }
});

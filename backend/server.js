const env = require('./config/env');
const logger = require('./config/logger');
const app = require('./app');
const ticketStore = require('./services/ticketStore.service');

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

ticketStore.refresh().catch((err) => logger.error({ err }, 'Failed to load tickets from Jira'));

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
